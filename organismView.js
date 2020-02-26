av.ind.orgStopFn = function () {
  if (av.ind.update_timer) {
    clearInterval(av.ind.update_timer);
  }
  document.getElementById("orgRun").textContent = 'Run';
}

av.ind.clearGen = function(gen) {
  'use strict';
  av.ind.settingsChanged = false;
  av.ind.cycle = 0;
  av.ind.bigR = [120, 120]; //radius of full circle
  av.ind.size = [50, 50];
  av.ind.smallR = av.ind.bigR * 2 * Math.PI / (2 * av.ind.size[0]); //radius of each small circle
  av.ind.tanR = av.ind.bigR[0] - av.ind.smallR;         //radius of circle tanget to inside of small circles
  av.ind.pathR = av.ind.bigR[0] - 3 * av.ind.smallR;      //radius of circle used to define reference point of arcs on path
  av.ind.headR = [av.ind.bigR[0] - 2 * av.ind.smallR, av.ind.bigR[1] - 2 * av.ind.smallR];      //radius of circle made by center of head positions.
  av.ind.cx = [150, 350];  //center of main circle x
  av.ind.cy = [150, 150];  //center of main circle y
  av.ind.fontsize = Math.round(1.8 * av.ind.smallR);
  av.ind.rotate = [0, 0];  //used to rotate offspring 180 degrees when growing; otherwise no rotation.
  av.ind.dna = ["", ""];
  av.ind.TimeLineHeight = 44;  //was 50;
  av.ind.imageXY = {x: 5, y: 5};
  av.ind.didDivide = false;
  av.ind.mom = 0;
  av.ind.son = 1;
  av.ind.smCenX = [[], []];
  av.ind.smCenY = [[], []];
  //initialize all canvases needed for Organism page
  av.ind.bufferCvs = document.getElementById("buffer");
  av.ind.bufferCtx = av.ind.bufferCvs.getContext("2d");
  av.ind.bufferCtx.translate(0.5, 0.5);
  av.ind.registerCvs = document.getElementById("register");
  av.ind.registerCtx = av.ind.registerCvs.getContext("2d");
  av.ind.registerCtx.translate(0.5, 0.5);
  av.ind.AstackCvs = document.getElementById("Astack");
  av.ind.AstackCtx = av.ind.AstackCvs.getContext("2d");
  av.ind.AstackCtx.translate(0.5, 0.5);
  av.ind.BstackCvs = document.getElementById("Bstack");
  av.ind.BstackCtx = av.ind.BstackCvs.getContext("2d");
  av.ind.BstackCtx.translate(0.5, 0.5);
  av.ind.outputCvs = document.getElementById("output");
  av.ind.outputCtx = av.ind.outputCvs.getContext("2d");
  //av.ind.outputCtx.imageSmoothingEnabled= false;
  av.ind.OrgCanvas = document.getElementById("organCanvas");
  av.ind.ctx = av.ind.OrgCanvas.getContext("2d");
  av.ind.ctx.translate(0.5, 0.5);  //makes a crisper image  http://stackoverflow.com/questions/4261090/html5-canvas-and-anti-aliasing
  //av.ind.timeLineCanvas = document.getElementById("timeLine");
  //av.ind.tLctx = av.ind.timeLineCanvas.getContext("2d");
  return gen;
};

function DrawTimeline(obj, gen) {
  'use strict';
  var startX, lineY, endX, length, numCycles, upLabelY, dnLabelY, txtWide, dnTickX, dnNum;
  var tickLength = 6;
  var upLabelYoffset = 8;  //was 12
  var dnLabelYoffset = 18;  //was 22
  var upTickX = [];
  var upTickY = 5;
  var upNum = [];
  var upNdx = [];
  var dnTickY = 5;
  var dnTickSpaces = 24;
  var radius = 5;

  lineY = av.ind.OrgCanvas.height - av.ind.TimeLineHeight / 2;
  upTickY = lineY - tickLength;
  dnTickY = lineY + tickLength;
  upLabelY = lineY - upLabelYoffset;
  dnLabelY = lineY + dnLabelYoffset;
  startX = 26;                //The numbers are fudge factors to account for the end of the slider
  endX = av.ind.OrgCanvas.width - 25;
  length = endX - startX;
  numCycles = obj.length - 1;
  //go through all numCycles comparing the current with the previous av.ind.cycle
  //Start with comparing av.ind.cycle 1 to av.ind.cycle 0 since there are no negative numCycles.
  var lngth = obj.length;
  for (var ii = 1; ii < lngth; ii++) {
    if (obj[ii - 1].functions.not < obj[ii].functions.not) {
      upNum.push("0");
      upNdx.push(ii);
    }
    if (obj[ii - 1].functions.nand < obj[ii].functions.nand) {
      upNum.push("1");
      upNdx.push(ii);
    }
    if (obj[ii - 1].functions.and < obj[ii].functions.and) {
      upNum.push("2");
      upNdx.push(ii);
    }
    if (obj[ii - 1].functions.orn < obj[ii].functions.orn) {
      upNum.push("3");
      upNdx.push(ii);
    }
    if (obj[ii - 1].functions.or < obj[ii].functions.or) {
      upNum.push("4");
      upNdx.push(ii);
    }
    if (obj[ii - 1].functions.andn < obj[ii].functions.andn) {
      upNum.push("5");
      upNdx.push(ii);
    }
    if (obj[ii - 1].functions.nor < obj[ii].functions.nor) {
      upNum.push("6");
      upNdx.push(ii);
    }
    if (obj[ii - 1].functions.xor < obj[ii].functions.xor) {
      upNum.push("7");
      upNdx.push(ii);
    }
    if (obj[ii - 1].functions.equ < obj[ii].functions.equ) {
      upNum.push("8");
      upNdx.push(ii);
    }
  }
  //Draw horizontal line
  av.ind.ctx.lineWidth = 1;
  av.ind.ctx.strokeStyle = av.color.names["Black"];
  av.ind.ctx.beginPath();
  av.ind.ctx.moveTo(startX, lineY);
  av.ind.ctx.lineTo(endX, lineY);
  av.ind.ctx.stroke();
  //Draw upTicks for indicating when logic functions complete
  av.ind.ctx.font = "12px Arial";
  av.ind.ctx.fillStyle = av.color.names["Black"];
  var lngth = upNum.length;
  for (var ii = 0; ii < lngth; ii++) {
    upTickX[ii] = startX + length * upNdx[ii] / numCycles;
    av.ind.ctx.moveTo(upTickX[ii], lineY);
    av.ind.ctx.lineTo(upTickX[ii], upTickY);
    av.ind.ctx.stroke();
    txtWide = av.ind.ctx.measureText(upNum[ii]).width;
    av.ind.ctx.fillText(upNum[ii], upTickX[ii] - txtWide / 2, upLabelY);
  }
  //Draw downTicks for indicating numCycles on the time line.
  for (var ii = 0; ii <= dnTickSpaces; ii++) {
    dnTickX = startX + ii * length / dnTickSpaces;
    dnNum = Math.round(ii * numCycles / dnTickSpaces);
    av.ind.ctx.moveTo(dnTickX, lineY);
    av.ind.ctx.lineTo(dnTickX, dnTickY);
    av.ind.ctx.stroke();
    if (0 == Math.fmod(ii, 4)) {
      txtWide = av.ind.ctx.measureText(dnNum).width;
      av.ind.ctx.fillText(dnNum, dnTickX - txtWide / 2, dnLabelY);
    }
  }
  //Draw red circle indicating current av.ind.cycle
  av.ind.ctx.beginPath();
  dnTickX = startX + av.ind.cycle * length / numCycles;
  av.ind.ctx.fillStyle = av.color.names["Red"];
  av.ind.ctx.arc(dnTickX, lineY, radius, 0, 2 * Math.PI);
  av.ind.ctx.fill();
}

av.ind.drawBitStr = function(context, row, bitStr) {
  var recWidth = 5;   //The width of the rectangle, in pixels
  var recHeight = 5;  //The height of the rectangle, in pixels
  var xx; //The x-coordinate of the upper-left corner of the rectangle
  var yy = row * recHeight;    //upper-left corner of rectangle
  var str = "1";
  var color;
  var lngth = bitStr.length;
  for (var ii = 0; ii < lngth; ii++) {
    xx = ii * (recWidth);
    //draw outline of rectangle
    context.beginPath();
    context.lineWidth = 1;
    context.strokeStyle = av.color.orgColorCodes["outline"];
    context.rect(xx, yy, recWidth, recHeight);
    context.stroke();
    //fill in rectangle
    context.beginPath();
    str = bitStr.substr(ii, 1);
    if ("0" == str) {
      context.fillStyle = av.color.orgColorCodes["0"];
    }
    else {
      context.fillStyle = av.color.orgColorCodes["1"];
    }
    context.fillRect(xx, yy, recWidth, recHeight);
    context.fill();
    //draw black lines every so many bits
    if (0 == Math.fmod(ii, 4)) {
      context.beginPath();
      context.lineWidth = 1;
      context.strokeStyle = av.color.names["Black"];
      context.moveTo(xx, yy);
      context.lineTo(xx, yy + recHeight);
      context.stroke();
    }
    //console.log("fs=", context.fillStyle, "; xx=", xx, "; yy=", yy, "; w=", recWidth, "; h=", recHeight,
    //            "; bitStr=",str, "; out=",context.strokeStyle);
  }
}

function genomeCircle(gen, gg, obj) { //gg is generation
  'use strict';
  var txtW;      // width of txt
  //var tickR;        //mutation tick mark: radius used to find position for tick Mark
  //var tickX, tickY  //mutation tick mark: position of inner tick mark
  //var tanX, tanY    //mutation tick mark: position of end of tick mark tangent to instruction circle.
  //if (av.debug.trace) console.log('gg, size', gg, av.ind.size[gg]);
  var lngth = av.ind.dna[gg].length;
  for (var ii = 0; ii < lngth; ii++) {
    av.ind.smCenX[gg][ii] = av.ind.cx[gg] + av.ind.bigR[gg] * Math.cos(ii * 2 * Math.PI / av.ind.size[gg] + av.ind.rotate[gg]);
    av.ind.smCenY[gg][ii] = av.ind.cy[gg] + av.ind.bigR[gg] * Math.sin(ii * 2 * Math.PI / av.ind.size[gg] + av.ind.rotate[gg]);
    av.ind.ctx.beginPath();
    //console.log('gg', gg, '; ii', ii, '; gen', gen);
    av.ind.ctx.arc(av.ind.smCenX[gg][ii], av.ind.smCenY[gg][ii], av.ind.smallR, 0, 2 * Math.PI);
    //Assign color based on letter code of instruction
    av.ind.ctx.fillStyle = av.color.letterColor[av.ind.dna[gg].substr(ii, 1)];  //use if av.ind.dna is a string
    //av.ind.ctx.fillStyle = av.color.letterColor[av.ind.dna[gg][ii]];  //use if av.ind.dna is an array
    av.ind.ctx.fill();   //required to render fill
    //Draw ring if there was a mutation in the offspring
    if (undefined != obj[av.ind.cycle].memSpace[av.ind.son]) {
      if (1 == gg && obj[av.ind.cycle].memSpace[av.ind.son].mutated[ii]) {
        av.ind.ctx.strokeStyle = av.color.orgColorCodes["mutate"];
        av.ind.ctx.lineWidth = 2;
        av.ind.ctx.arc(av.ind.smCenX[gg][ii], av.ind.smCenY[gg][ii], av.ind.SmallR, 0, 2 * Math.PI);
        av.ind.ctx.stroke();
        //Draw tick mark to interior of circle for mutated instruction
        //tickR = av.ind.bigR[gg]-3*av.ind.smallR;
        //tickX = av.ind.cx[gg] + tickR*Math.cos(ii*2*Math.PI/av.ind.size[gg]+av.ind.rotate[gg]);
        //tickY = av.ind.cy[gg] + tickR*Math.sin(ii*2*Math.PI/av.ind.size[gg]+av.ind.rotate[gg]);
        //tickR = av.ind.bigR[gg]-av.ind.smallR;
        //tanX = av.ind.cx[gg] + tickR*Math.cos(ii*2*Math.PI/av.ind.size[gg]+av.ind.rotate[gg]);
        //tanY = av.ind.cy[gg] + tickR*Math.sin(ii*2*Math.PI/av.ind.size[gg]+av.ind.rotate[gg]);
        //av.ind.ctx.beginPath();
        //av.ind.ctx.moveTo(tickX, tickY);
        //av.ind.ctx.lineTo(tanX, tanY);
        //av.ind.ctx.stroke();
      }
    }
    //Draw letter inside circle
    av.ind.ctx.fillStyle = av.color.names["Black"];
    av.ind.ctx.font = av.ind.fontsize + "px Arial";
    txtW = av.ind.ctx.measureText(av.ind.dna[gg].substr(ii, 1)).width;  //use if av.ind.dna is a string
    //txtW = av.ind.ctx.measureText(av.ind.dna[gg][ii]).width;     //use if av.ind.dna is an array
    av.ind.ctx.fillText(av.ind.dna[gg].substr(ii, 1), av.ind.smCenX[gg][ii] - txtW / 2, av.ind.smCenY[gg][ii] + av.ind.smallR / 2);  //use if av.ind.dna is a string
    //av.ind.ctx.fillText(av.ind.dna[gg][ii],av.ind.smCenX[gg][ii]-txtW/2, av.ind.smCenY[gg][ii]+av.ind.smallR/2);  //use if av.ind.dna is an array
  }
  //Draw center of circle to test max arc height - should not go past center of circle
  //av.ind.ctx.arc(av.ind.cx[gg], av.ind.cy[gg], av.ind.smallR/4, 0, 2*Math.PI);
  //av.ind.ctx.fill();
}

function drawHead(gen, spot, gg, head) {
  'use strict';
  var hx, hy; //center of head and used as center of ring
  var txtW;  // width of txt
  //draw circumference around instruction that the head points to.
  hx = av.ind.cx[gg] + av.ind.bigR[gg] * Math.cos(spot * 2 * Math.PI / av.ind.size[gg] + av.ind.rotate[gg]);
  hy = av.ind.cy[gg] + av.ind.bigR[gg] * Math.sin(spot * 2 * Math.PI / av.ind.size[gg] + av.ind.rotate[gg]);
  av.ind.ctx.beginPath();
  av.ind.ctx.arc(hx, hy, av.ind.smallR, 0, 2 * Math.PI);
  av.ind.ctx.strokeStyle = av.color.orgColorCodes[head];
  av.ind.ctx.lineWidth = 2;
  av.ind.ctx.stroke();
  //draw head tangent to instruction
  hx = av.ind.cx[gg] + av.ind.headR[gg] * Math.cos(spot * 2 * Math.PI / av.ind.size[gg] + av.ind.rotate[gg]);
  hy = av.ind.cy[gg] + av.ind.headR[gg] * Math.sin(spot * 2 * Math.PI / av.ind.size[gg] + av.ind.rotate[gg]);
  av.ind.ctx.beginPath();
  av.ind.ctx.arc(hx, hy, av.ind.smallR, 0, 2 * Math.PI);
  av.ind.ctx.fillStyle = av.color.orgColorCodes["headFill"];
  av.ind.ctx.fill();
  av.ind.ctx.fillStyle = av.color.orgColorCodes[head];
  av.ind.ctx.font = av.ind.fontsize + "px Arial";
  txtW = av.ind.ctx.measureText(av.color.headCodes[head]).width;
  av.ind.ctx.fillText(av.color.headCodes[head], hx - txtW / 2, hy + av.ind.smallR / 2);
}

//Draw arc using Bézier curve and two control points http://www.w3schools.com/tags/canvas_beziercurveto.asp
function drawArc2(gen, spot1, spot2, rep) { //draw an arc
  'use strict';
  var xx1, yy1, xx2, yy2, xc1, yc1, xc2, yc2;
  av.ind.ctx.lineWidth = 1;
  if (spot2 >= spot1) {
    av.ind.ctx.strokeStyle = av.color.names["Black"];  //set the line to a color which can also be a gradient see http://www.w3schools.com/canvas/canvas_clock_face.asp
  } else {
    av.ind.ctx.strokeStyle = av.color.names["Red"];
  }
  av.ind.ctx.beginPath();
  xx1 = av.ind.cx[av.ind.mom] + av.ind.tanR * Math.cos(spot1 * 2 * Math.PI / av.ind.size[av.ind.mom]); //Draw line from Spot1
  yy1 = av.ind.cy[av.ind.mom] + av.ind.tanR * Math.sin(spot1 * 2 * Math.PI / av.ind.size[av.ind.mom]);
  av.ind.ctx.moveTo(xx1, yy1);
  xx2 = av.ind.cx[av.ind.mom] + av.ind.tanR * Math.cos(spot2 * 2 * Math.PI / av.ind.size[av.ind.mom]); //Draw line to Spot2
  yy2 = av.ind.cy[av.ind.mom] + av.ind.tanR * Math.sin(spot2 * 2 * Math.PI / av.ind.size[av.ind.mom]);
  //Set Control points on same radial as the spots
  av.ind.pathR = av.ind.bigR[av.ind.mom] - 2 * av.ind.smallR - rep * av.ind.bigR[av.ind.mom] / av.ind.size[av.ind.mom];
  //av.ind.pathR = av.ind.bigR[av.ind.mom]-(2+rep/3)*av.ind.smallR;
  xc1 = av.ind.cx[av.ind.mom] + av.ind.pathR * Math.cos(spot1 * 2 * Math.PI / av.ind.size[av.ind.mom]);
  yc1 = av.ind.cy[av.ind.mom] + av.ind.pathR * Math.sin(spot1 * 2 * Math.PI / av.ind.size[av.ind.mom]);
  xc2 = av.ind.cx[av.ind.mom] + av.ind.pathR * Math.cos(spot2 * 2 * Math.PI / av.ind.size[av.ind.mom]);
  yc2 = av.ind.cy[av.ind.mom] + av.ind.pathR * Math.sin(spot2 * 2 * Math.PI / av.ind.size[av.ind.mom]);
  //console.log(xc1, yc1, xc2, yc2, xx2, yy2);
  av.ind.ctx.bezierCurveTo(xc1, yc1, xc2, yc2, xx2, yy2);
  av.ind.ctx.stroke();
}

//Draw offspring Icon once cell divides  from http://stackoverflow.com/questions/8977369/drawing-png-to-a-canvas-element-not-showing-transparency
function drawIcon(gen) {
  'use strict';
  var txt = "Offspring Genome";
  var drw = new Image();
  drw.src = "images/Avida-ED-ancestor-icon.png";
  drw.onload = function () {   //image size(width, height) from http://stackoverflow.com/questions/5173796/html5-get-image-dimension
    av.ind.ctx.drawImage(drw, av.ind.cx[av.ind.son] - drw.width / 2, av.ind.cy[av.ind.son] - drw.height / 2);
  }
  av.ind.ctx.fillStyle = av.color.names["black"];
  av.ind.ctx.font = av.ind.fontsize + "px Arial";
  var txtWd = av.ind.ctx.measureText(txt).width;
  av.ind.ctx.fillText(txt, av.ind.cx[av.ind.son] - txtWd / 2, av.ind.cy[av.ind.son] + drw.height);
}


av.ind.organTraceButtonInable = function () {
  'use strict';
  document.getElementById('orgReset').disabled = false;
  document.getElementById('orgBack').disabled = false;
  document.getElementById('orgRun').disabled = false;
  document.getElementById('orgForward').disabled = false;
  document.getElementById('orgEnd').disabled = false;
  dijit.byId('orgCycle').attr('disabled', false);
}


//*****************************************************************/
//main function to update the Organism Trace on the Organism Page
av.ind.updateOrganTrace = function (obj, gen) {
  'use strict';
  for (ii=0; ii <101; ii++) { av.ind.labeled[ii] = false}  //reset lable flags
  //inable buttons if disabled.
  if (true === document.getElementById('orgRun').disabled) av.ind.organTraceButtonInable();
  //Find size and content of each genome.
  var lngth = obj[av.ind.cycle].memSpace.length;
  for (var ii = 0; ii < lngth; ii++) {
    av.ind.dna[ii] = obj[av.ind.cycle].memSpace[ii].memory.join('');
    av.ind.size[ii] = obj[av.ind.cycle].memSpace[ii].memory.length;
    //console.log('updateOrgTrace: ii',ii,'; av.ind.dna',av.ind.dna[ii]);
    //console.log('obj[av.ind.cycle].memSpace',obj[av.ind.cycle].memSpace[ii]);
  }
  //Draw Timeline
  DrawTimeline(obj, gen);
  //Find radius and center of big circle for each genome
  if (av.ind.OrgCanvas.height < .55 * (av.ind.OrgCanvas.width - av.ind.TimeLineHeight)) {
    av.ind.bigR[av.ind.mom] = Math.round(0.43 * (av.ind.OrgCanvas.height - av.ind.TimeLineHeight))  //set size based on height
  }
  else {
    av.ind.bigR[av.ind.mom] = Math.round(0.2 * av.ind.OrgCanvas.width) //set size based on width
  }
  av.ind.cx[av.ind.mom] = av.ind.OrgCanvas.width / 2 - 1.2 * av.ind.bigR[av.ind.mom];        //center of 1st (parent) circle x
  av.ind.cy[av.ind.mom] = 0.53 * (av.ind.OrgCanvas.height - av.ind.TimeLineHeight);  //center of 1st (parent) circle y
  // Draw parent (Mom) genome in a circle----------------------------------------
  av.ind.smallR = av.ind.bigR[av.ind.mom] * 2 * Math.PI / (2 * av.ind.size[av.ind.mom]); //radius of each small circle
  av.ind.tanR = av.ind.bigR[av.ind.mom] - av.ind.smallR;         //radius of circle tanget to inside of small circles
  av.ind.pathR = av.ind.bigR[av.ind.mom] - 3 * av.ind.smallR;      //radius of circle used to define reference point of arcs on path
  av.ind.headR[av.ind.mom] = av.ind.bigR[av.ind.mom] - 2 * av.ind.smallR;      //radius of circle made by center of head positions.
  av.ind.fontsize = Math.round(1.8 * av.ind.smallR);
  genomeCircle(gen, 0, obj);
  // Draw child (Son) genome in a circle ---------
  if (1 < obj[av.ind.cycle].memSpace.length) {
    av.ind.bigR[av.ind.son] = av.ind.smallR * 2 * av.ind.size[av.ind.son] / (2 * Math.PI);
    av.ind.bigR[av.ind.son] = av.ind.bigR[av.ind.son] + av.ind.bigR[av.ind.son] / av.ind.size[av.ind.son];
    av.ind.cy[av.ind.son] = av.ind.cy[av.ind.mom];
    av.ind.headR[av.ind.son] = av.ind.bigR[av.ind.son] - 2 * av.ind.smallR;      //radius of circle made by center of head positions.
    if (obj[av.ind.cycle].didDivide) {
      av.ind.cx[av.ind.son] = av.ind.OrgCanvas.width / 2 + 1.2 * av.ind.bigR[av.ind.son];
      av.ind.rotate[av.ind.son] = 0;
      drawIcon(gen);
      //there is an offspring, so it can be saved in the freezer or fed back into Organism viewer
      dijit.byId("mnFzOffspring").attr("disabled", false);
      dijit.byId("mnCnOffspringTrace").attr("disabled", false);
    }
    else {
      av.ind.cx[av.ind.son] = av.ind.cx[av.ind.mom] + av.ind.bigR[av.ind.mom] + 2 * av.ind.smallR + av.ind.bigR[av.ind.son];
      av.ind.rotate[av.ind.son] = Math.PI;            //offspring rotated 180 degrees when still growing.
      //no organism, so menu item is disabled
      dijit.byId("mnFzOffspring").attr("disabled", true);
      dijit.byId("mnCnOffspringTrace").attr("disabled", true);
      //console.log("xy", av.ind.cx[av.ind.son], av.ind.cy[av.ind.son], " size", av.ind.size[av.ind.mom]);
    }
    genomeCircle(gen, 1, obj);
  }
  //Draw path of acrs
  //drawArc2(gen, spot1, spot2, rep)
  var lngth = obj[av.ind.cycle].jumps.length;
  for (var ii = 0; ii < lngth; ii++) {
    drawArc2(gen, obj[av.ind.cycle].jumps[ii].fromIDX, obj[av.ind.cycle].jumps[ii].toIDX, obj[av.ind.cycle].jumps[ii].freq);
  }
  //drawHead(gen, spot, generation, head) // draws the various heads for parent (Mom)
  lngth = obj[av.ind.cycle].memSpace.length;
  for (var ii = 0; ii < lngth; ii++) {
    if (undefined != obj[av.ind.cycle].memSpace[ii].heads.read) {
      drawHead(gen, obj[av.ind.cycle].memSpace[ii].heads.read, ii, "READ");
    }
    if (undefined != obj[av.ind.cycle].memSpace[ii].heads.write) {
      drawHead(gen, obj[av.ind.cycle].memSpace[ii].heads.write, ii, "WRITE");
    }
    if (undefined != obj[av.ind.cycle].memSpace[ii].heads.flow) {
      drawHead(gen, obj[av.ind.cycle].memSpace[ii].heads.flow, ii, "FLOW");
    }
    if (undefined != obj[av.ind.cycle].memSpace[ii].heads.ip) {
      drawHead(gen, obj[av.ind.cycle].memSpace[ii].heads.ip, ii, "IP");
    }
  }
  //Draw buffers ---------------------------------------------------
  //av.ind.drawBitStr (name, row, bitStr);
  var lngth = obj[av.ind.cycle].buffers.input.length;
  for (var ii = 0; ii < lngth; ii++) {
    av.ind.drawBitStr(av.ind.bufferCtx, ii, obj[av.ind.cycle].buffers.input[ii]);
  }
  av.ind.drawBitStr(av.ind.registerCtx, 0, obj[av.ind.cycle].registers['ax']);
  av.ind.drawBitStr(av.ind.registerCtx, 1, obj[av.ind.cycle].registers['bx']);
  av.ind.drawBitStr(av.ind.registerCtx, 2, obj[av.ind.cycle].registers['cx']);
  //console.log("A", obj[av.ind.cycle].buffers);
  for (var ii = 0; ii < 2; ii++) { //only showing the top 2 in the stack of 10
    //console.log(ii, obj[av.ind.cycle].buffers["stack A"][ii]);
    av.ind.drawBitStr(av.ind.AstackCtx, ii, obj[av.ind.cycle].buffers["stack A"][ii]);
  }
  for (var ii = 0; ii < 2; ii++) { //only showing the top 2 in the stack of 10
    av.ind.drawBitStr(av.ind.BstackCtx, ii, obj[av.ind.cycle].buffers["stack B"][ii]);
  }
  av.ind.drawBitStr(av.ind.outputCtx, 0, obj[av.ind.cycle].buffers.output[av.ind.mom]);
  // update details
  updateTimesPerformed(obj, gen);   //Update Times functions are performed.
  writeInstructDetails(obj, gen);   //Write Instruction Details
  //context.clearRect(0, 0, canvas.width, canvas.height); //to clear canvas see http://stackoverflow.com/questions/2142535/how-to-clear-the-canvas-for-redrawing
}

function updateTimesPerformed(obj, gen) {
  'use strict';
  document.getElementById("notPerf").textContent = obj[av.ind.cycle].functions.not;
  document.getElementById("nanPerf").textContent = obj[av.ind.cycle].functions.nand;
  document.getElementById("andPerf").textContent = obj[av.ind.cycle].functions.and;
  document.getElementById("ornPerf").textContent = obj[av.ind.cycle].functions.orn;
  document.getElementById("oroPerf").textContent = obj[av.ind.cycle].functions.or;
  document.getElementById("antPerf").textContent = obj[av.ind.cycle].functions.andn;
  document.getElementById("norPerf").textContent = obj[av.ind.cycle].functions.nor;
  document.getElementById("xorPerf").textContent = obj[av.ind.cycle].functions.xor;
  document.getElementById("equPerf").textContent = obj[av.ind.cycle].functions.equ;
  /*
  if (0 < obj[av.ind.cycle].functions.not) {
    document.getElementById("notOrg").textContent = "0 not+";
  }
  else {
    document.getElementById("notOrg").textContent = "0 NOT";
  }
  if (0 < obj[av.ind.cycle].functions.nand) {
    document.getElementById("nanOrg").textContent = "1 nan+";
  }
  else {
    document.getElementById("nanOrg").textContent = "1 NAN";
  }
  if (0 < obj[av.ind.cycle].functions.and) {
    document.getElementById("andOrg").textContent = "2 and+";
  }
  else {
    document.getElementById("andOrg").textContent = "2 AND";
  }
  if (0 < obj[av.ind.cycle].functions.orn) {
    document.getElementById("ornOrg").textContent = "3 orn+";
  }
  else {
    document.getElementById("ornOrg").textContent = "3 ORN";
  }
  if (0 < obj[av.ind.cycle].functions.or) {
    document.getElementById("oroOrg").textContent = "4 oro+";
  }
  else {
    document.getElementById("oroOrg").textContent = "4 ORO";
  }
  if (0 < obj[av.ind.cycle].functions.andn) {
    document.getElementById("antOrg").textContent = "5 ant+";
  }
  else {
    document.getElementById("antOrg").textContent = "5 ANT";
  }
  if (0 < obj[av.ind.cycle].functions.nor) {
    document.getElementById("norOrg").textContent = "6 nor+";
  }
  else {
    document.getElementById("norOrg").textContent = "6 NOR";
  }
  if (0 < obj[av.ind.cycle].functions.xor) {
    document.getElementById("xorOrg").textContent = "7 xor+";
  }
  else {
    document.getElementById("xorOrg").textContent = "7 XOR";
  }
  if (0 < obj[av.ind.cycle].functions.equ) {
    document.getElementById("equOrg").textContent = "8 equ+";
  }
  else {
    document.getElementById("equOrg").textContent = "8 EQU";
  }
  */
}

function writeInstructDetails(obj, gen) {
  'use strict';
  var letter;
  var IPspot = obj[av.ind.cycle].memSpace[av.ind.mom].heads.ip
  if (undefined == obj[av.ind.cycle - 1]) {
    document.getElementById("ExecuteJust").textContent = "(none)";
  }
  else {
    letter = obj[av.ind.cycle - 1].nextInstruction;
    document.getElementById("ExecuteJust").textContent = letter + ": " + av.color.InstDescribe[letter];
    //console.log("Inst", av.color.InstDescribe[letter]);
  }
  if (undefined == obj[av.ind.cycle].memSpace[av.ind.mom].memory[IPspot]) {
    document.getElementById("ExecuteAbout").textContent = "(none)";
  }
  else {
    letter = obj[av.ind.cycle].memSpace[av.ind.mom].memory[IPspot];
    document.getElementById("ExecuteAbout").textContent = letter + ": " + av.color.InstDescribe[letter];
  }
  //console.log('spot=', IPspot, ' letter=', letter, " Instr=", av.color.InstDescribe[letter]);
}
