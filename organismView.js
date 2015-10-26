function clearGen() {
  gen.settingsChanged = false;
  gen.cycle = 0;
  gen.bigR = [120, 120]; //radius of full circle
  gen.size = [50, 50];
  gen.smallR = gen.bigR * 2 * Math.PI / (2 * gen.size[0]); //radius of each small circle
  gen.tanR = gen.bigR[0] - gen.smallR;         //radius of circle tanget to inside of small circles
  gen.pathR = gen.bigR[0] - 3 * gen.smallR;      //radius of circle used to define reference point of arcs on path
  gen.headR = [gen.bigR[0] - 2 * gen.smallR, gen.bigR[1] - 2 * gen.smallR];      //radius of circle made by center of head positions.
  gen.cx = [150, 350];  //center of main circle x
  gen.cy = [150, 150];  //center of main circle y
  gen.fontsize = Math.round(1.8 * gen.smallR);
  gen.rotate = [0, 0];  //used to rotate offspring 180 degrees when growing; otherwise no rotation.
  gen.dna = ["", ""];
  gen.TimeLineHeight = 44;  //was 50;
  gen.imageXY = {x: 5, y: 5};
  gen.didDivide = false;
  gen.debug = true;
  gen.mom = 0;
  gen.son = 1;
  gen.smCenX = [[], []];
  gen.smCenY = [[], []];
  //initialize all canvases needed for Organism page
  gen.bufferCvs = document.getElementById("buffer");
  gen.bufferCtx = gen.bufferCvs.getContext("2d");
  gen.bufferCtx.translate(0.5, 0.5);
  gen.registerCvs = document.getElementById("register");
  gen.registerCtx = gen.registerCvs.getContext("2d");
  gen.registerCtx.translate(0.5, 0.5);
  gen.AstackCvs = document.getElementById("Astack");
  gen.AstackCtx = gen.AstackCvs.getContext("2d");
  gen.AstackCtx.translate(0.5, 0.5);
  gen.BstackCvs = document.getElementById("Bstack");
  gen.BstackCtx = gen.BstackCvs.getContext("2d");
  gen.BstackCtx.translate(0.5, 0.5);
  gen.outputCvs = document.getElementById("output");
  gen.outputCtx = gen.outputCvs.getContext("2d");
  //gen.outputCtx.imageSmoothingEnabled= false;
  gen.OrgCanvas = document.getElementById("organCanvas");
  gen.ctx = gen.OrgCanvas.getContext("2d");
  gen.ctx.translate(0.5, 0.5);  //makes a crisper image  http://stackoverflow.com/questions/4261090/html5-canvas-and-anti-aliasing
  //gen.timeLineCanvas = document.getElementById("timeLine");
  //gen.tLctx = gen.timeLineCanvas.getContext("2d");
}

function DrawTimeline(obj, gen) {
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

  lineY = gen.OrgCanvas.height - gen.TimeLineHeight / 2;
  upTickY = lineY - tickLength;
  dnTickY = lineY + tickLength;
  upLabelY = lineY - upLabelYoffset;
  dnLabelY = lineY + dnLabelYoffset;
  startX = 26;                //The numbers are fudge factors to account for the end of the slider
  endX = gen.OrgCanvas.width - 25;
  length = endX - startX;
  numCycles = obj.length - 1;
  //go through all numCycles comparing the current with the previous gen.cycle
  //Start with comparing gen.cycle 1 to gen.cycle 0 since there are no negative numCycles.
  for (var ii = 1; ii < obj.length; ii++) {
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
  gen.ctx.lineWidth = 1;
  gen.ctx.strokeStyle = dictColor["Black"];
  gen.ctx.beginPath();
  gen.ctx.moveTo(startX, lineY);
  gen.ctx.lineTo(endX, lineY);
  gen.ctx.stroke();
  //Draw upTicks for indicating when logic functions complete
  gen.ctx.font = "12px Arial";
  gen.ctx.fillStyle = dictColor["Black"];
  for (var ii = 0; ii < upNum.length; ii++) {
    upTickX[ii] = startX + length * upNdx[ii] / numCycles;
    gen.ctx.moveTo(upTickX[ii], lineY);
    gen.ctx.lineTo(upTickX[ii], upTickY);
    gen.ctx.stroke();
    txtWide = gen.ctx.measureText(upNum[ii]).width;
    gen.ctx.fillText(upNum[ii], upTickX[ii] - txtWide / 2, upLabelY);
  }
  //Draw downTicks for indicating numCycles on the time line.
  for (var ii = 0; ii <= dnTickSpaces; ii++) {
    dnTickX = startX + ii * length / dnTickSpaces;
    dnNum = Math.round(ii * numCycles / dnTickSpaces);
    gen.ctx.moveTo(dnTickX, lineY);
    gen.ctx.lineTo(dnTickX, dnTickY);
    gen.ctx.stroke();
    if (0 == Math.fmod(ii, 4)) {
      txtWide = gen.ctx.measureText(dnNum).width;
      gen.ctx.fillText(dnNum, dnTickX - txtWide / 2, dnLabelY);
    }
  }
  //Draw red circle indicating current gen.cycle
  gen.ctx.beginPath();
  dnTickX = startX + gen.cycle * length / numCycles;
  gen.ctx.fillStyle = dictColor["Red"];
  gen.ctx.arc(dnTickX, lineY, radius, 0, 2 * Math.PI);
  gen.ctx.fill();
}

function drawBitStr(context, row, bitStr) {
  var recWidth = 5;   //The width of the rectangle, in pixels
  var recHeight = 5;  //The height of the rectangle, in pixels
  var xx; //The x-coordinate of the upper-left corner of the rectangle
  var yy = row * recHeight;    //upper-left corner of rectangle
  var str = "1";
  var color;
  for (var ii = 0; ii < bitStr.length; ii++) {
    xx = ii * (recWidth);
    //draw outline of rectangle
    context.beginPath();
    context.lineWidth = 1;
    context.strokeStyle = orgColorCodes["outline"];
    context.rect(xx, yy, recWidth, recHeight);
    context.stroke();
    //fill in rectangle
    context.beginPath();
    str = bitStr.substr(ii, 1);
    if ("0" == str) {
      context.fillStyle = orgColorCodes["0"];
    }
    else {
      context.fillStyle = orgColorCodes["1"];
    }
    context.fillRect(xx, yy, recWidth, recHeight);
    context.fill();
    //draw black lines every so many bits
    if (0 == Math.fmod(ii, 4)) {
      context.beginPath();
      context.lineWidth = 1;
      context.strokeStyle = dictColor["Black"];
      context.moveTo(xx, yy);
      context.lineTo(xx, yy + recHeight);
      context.stroke();
    }
    //console.log("fs=", context.fillStyle, "; xx=", xx, "; yy=", yy, "; w=", recWidth, "; h=", recHeight,
    //            "; bitStr=",str, "; out=",context.strokeStyle);
  }
}

function genomeCircle(gen, gg, obj) { //gg is generation
  var txtW;      // width of txt
  //var tickR;        //mutation tick mark: radius used to find position for tick Mark
  //var tickX, tickY  //mutation tick mark: position of inner tick mark
  //var tanX, tanY    //mutation tick mark: position of end of tick mark tangent to instruction circle.
  //if (debug.trace) console.log('gg, size', gg, gen.size[gg]);
  for (var ii = 0; ii < gen.dna[gg].length; ii++) {
    gen.smCenX[gg][ii] = gen.cx[gg] + gen.bigR[gg] * Math.cos(ii * 2 * Math.PI / gen.size[gg] + gen.rotate[gg]);
    gen.smCenY[gg][ii] = gen.cy[gg] + gen.bigR[gg] * Math.sin(ii * 2 * Math.PI / gen.size[gg] + gen.rotate[gg]);
    gen.ctx.beginPath();
    gen.ctx.arc(gen.smCenX[gg][ii], gen.smCenY[gg][ii], gen.smallR, 0, 2 * Math.PI);
    //Assign color based on letter code of instruction
    gen.ctx.fillStyle = letterColor[gen.dna[gg].substr(ii, 1)];  //use if gen.dna is a string
    //gen.ctx.fillStyle = letterColor[gen.dna[gg][ii]];  //use if gen.dna is an array
    gen.ctx.fill();   //required to render fill
    //Draw ring if there was a mutation in the offspring
    if (undefined != obj[gen.cycle].memSpace[gen.son]) {
      if (1 == gg && obj[gen.cycle].memSpace[gen.son].mutated[ii]) {
        gen.ctx.strokeStyle = orgColorCodes["mutate"];
        gen.ctx.lineWidth = 2;
        gen.ctx.arc(gen.smCenX[gg][ii], gen.smCenY[gg][ii], gen.SmallR, 0, 2 * Math.PI);
        gen.ctx.stroke();
        //Draw tick mark to interior of circle for mutated instruction
        //tickR = gen.bigR[gg]-3*gen.smallR;
        //tickX = gen.cx[gg] + tickR*Math.cos(ii*2*Math.PI/gen.size[gg]+gen.rotate[gg]);
        //tickY = gen.cy[gg] + tickR*Math.sin(ii*2*Math.PI/gen.size[gg]+gen.rotate[gg]);
        //tickR = gen.bigR[gg]-gen.smallR;
        //tanX = gen.cx[gg] + tickR*Math.cos(ii*2*Math.PI/gen.size[gg]+gen.rotate[gg]);
        //tanY = gen.cy[gg] + tickR*Math.sin(ii*2*Math.PI/gen.size[gg]+gen.rotate[gg]);
        //gen.ctx.beginPath();
        //gen.ctx.moveTo(tickX, tickY);
        //gen.ctx.lineTo(tanX, tanY);
        //gen.ctx.stroke();
      }
    }
    //Draw letter inside circle
    gen.ctx.fillStyle = dictColor["Black"];
    gen.ctx.font = gen.fontsize + "px Arial";
    txtW = gen.ctx.measureText(gen.dna[gg].substr(ii, 1)).width;  //use if gen.dna is a string
    //txtW = gen.ctx.measureText(gen.dna[gg][ii]).width;     //use if gen.dna is an array
    gen.ctx.fillText(gen.dna[gg].substr(ii, 1), gen.smCenX[gg][ii] - txtW / 2, gen.smCenY[gg][ii] + gen.smallR / 2);  //use if gen.dna is a string
    //gen.ctx.fillText(gen.dna[gg][ii],gen.smCenX[gg][ii]-txtW/2, gen.smCenY[gg][ii]+gen.smallR/2);  //use if gen.dna is an array
  }
  //Draw center of circle to test max arc height - should not go past center of circle
  //gen.ctx.arc(gen.cx[gg], gen.cy[gg], gen.smallR/4, 0, 2*Math.PI);
  //gen.ctx.fill();
}

function drawHead(gen, spot, gg, head) {
  var hx, hy; //center of head and used as center of ring
  var txtW;  // width of txt
  //draw circumference around instruction that the head points to.
  hx = gen.cx[gg] + gen.bigR[gg] * Math.cos(spot * 2 * Math.PI / gen.size[gg] + gen.rotate[gg]);
  hy = gen.cy[gg] + gen.bigR[gg] * Math.sin(spot * 2 * Math.PI / gen.size[gg] + gen.rotate[gg]);
  gen.ctx.beginPath();
  gen.ctx.arc(hx, hy, gen.smallR, 0, 2 * Math.PI);
  gen.ctx.strokeStyle = orgColorCodes[head];
  gen.ctx.lineWidth = 2;
  gen.ctx.stroke();
  //draw head tangent to instruction
  hx = gen.cx[gg] + gen.headR[gg] * Math.cos(spot * 2 * Math.PI / gen.size[gg] + gen.rotate[gg]);
  hy = gen.cy[gg] + gen.headR[gg] * Math.sin(spot * 2 * Math.PI / gen.size[gg] + gen.rotate[gg]);
  gen.ctx.beginPath();
  gen.ctx.arc(hx, hy, gen.smallR, 0, 2 * Math.PI);
  gen.ctx.fillStyle = orgColorCodes["headFill"];
  gen.ctx.fill();
  gen.ctx.fillStyle = orgColorCodes[head];
  gen.ctx.font = gen.fontsize + "px Arial";
  txtW = gen.ctx.measureText(headCodes[head]).width;
  gen.ctx.fillText(headCodes[head], hx - txtW / 2, hy + gen.smallR / 2);
}

//Draw arc using Bézier curve and two control points http://www.w3schools.com/tags/canvas_beziercurveto.asp
function drawArc2(gen, spot1, spot2, rep) { //draw an arc
  var xx1, yy1, xx2, yy2, xc1, yc1, xc2, yc2;
  gen.ctx.lineWidth = 1;
  if (spot2 >= spot1) {
    gen.ctx.strokeStyle = dictColor["Black"];  //set the line to a color which can also be a gradient see http://www.w3schools.com/canvas/canvas_clock_face.asp
  } else {
    gen.ctx.strokeStyle = dictColor["Red"];
  }
  gen.ctx.beginPath();
  xx1 = gen.cx[gen.mom] + gen.tanR * Math.cos(spot1 * 2 * Math.PI / gen.size[gen.mom]); //Draw line from Spot1
  yy1 = gen.cy[gen.mom] + gen.tanR * Math.sin(spot1 * 2 * Math.PI / gen.size[gen.mom]);
  gen.ctx.moveTo(xx1, yy1);
  xx2 = gen.cx[gen.mom] + gen.tanR * Math.cos(spot2 * 2 * Math.PI / gen.size[gen.mom]); //Draw line to Spot2
  yy2 = gen.cy[gen.mom] + gen.tanR * Math.sin(spot2 * 2 * Math.PI / gen.size[gen.mom]);
  //Set Control points on same radial as the spots
  gen.pathR = gen.bigR[gen.mom] - 2 * gen.smallR - rep * gen.bigR[gen.mom] / gen.size[gen.mom];
  //gen.pathR = gen.bigR[gen.mom]-(2+rep/3)*gen.smallR;
  xc1 = gen.cx[gen.mom] + gen.pathR * Math.cos(spot1 * 2 * Math.PI / gen.size[gen.mom]);
  yc1 = gen.cy[gen.mom] + gen.pathR * Math.sin(spot1 * 2 * Math.PI / gen.size[gen.mom]);
  xc2 = gen.cx[gen.mom] + gen.pathR * Math.cos(spot2 * 2 * Math.PI / gen.size[gen.mom]);
  yc2 = gen.cy[gen.mom] + gen.pathR * Math.sin(spot2 * 2 * Math.PI / gen.size[gen.mom]);
  //console.log(xc1, yc1, xc2, yc2, xx2, yy2);
  gen.ctx.bezierCurveTo(xc1, yc1, xc2, yc2, xx2, yy2);
  gen.ctx.stroke();
}

//Draw offspring Icon once cell divides  from http://stackoverflow.com/questions/8977369/drawing-png-to-a-canvas-element-not-showing-transparency
function drawIcon(gen) {
  var txt = "Offspring Genome";
  var drw = new Image();
  drw.src = "avida-ed-ancestor-icon.png";
  drw.onload = function () {   //image size(width, height) from http://stackoverflow.com/questions/5173796/html5-get-image-dimension
    gen.ctx.drawImage(drw, gen.cx[gen.son] - drw.width / 2, gen.cy[gen.son] - drw.height / 2);
  }
  gen.ctx.fillStyle = dictColor["black"];
  gen.ctx.font = gen.fontsize + "px Arial";
  var txtWd = gen.ctx.measureText(txt).width;
  gen.ctx.fillText(txt, gen.cx[gen.son] - txtWd / 2, gen.cy[gen.son] + drw.height);
}

//*****************************************************************/
//main function to update the Organism Trace on the Organism Page
function updateOrganTrace(obj, gen) {
  //Find size and content of each genome.
  for (var ii = 0; ii < obj[gen.cycle].memSpace.length; ii++) {
    gen.dna[ii] = obj[gen.cycle].memSpace[ii].memory.join('');
    gen.size[ii] = obj[gen.cycle].memSpace[ii].memory.length;
    //console.log('updateOrgTrace: ii',ii,'; gen.dna',gen.dna[ii]);
    //console.log('obj[gen.cycle].memSpace',obj[gen.cycle].memSpace[ii]);
  }
  //Draw Timeline
  DrawTimeline(obj, gen);
  //Find radius and center of big circle for each genome
  if (gen.OrgCanvas.height < .55 * (gen.OrgCanvas.width - gen.TimeLineHeight)) {
    gen.bigR[gen.mom] = Math.round(0.43 * (gen.OrgCanvas.height - gen.TimeLineHeight))  //set size based on height
  }
  else {
    gen.bigR[gen.mom] = Math.round(0.2 * gen.OrgCanvas.width) //set size based on width
  }
  gen.cx[gen.mom] = gen.OrgCanvas.width / 2 - 1.2 * gen.bigR[gen.mom];        //center of 1st (parent) circle x
  gen.cy[gen.mom] = 0.53 * (gen.OrgCanvas.height - gen.TimeLineHeight);  //center of 1st (parent) circle y
  // Draw parent (Mom) genome in a circle----------------------------------------
  gen.smallR = gen.bigR[gen.mom] * 2 * Math.PI / (2 * gen.size[gen.mom]); //radius of each small circle
  gen.tanR = gen.bigR[gen.mom] - gen.smallR;         //radius of circle tanget to inside of small circles
  gen.pathR = gen.bigR[gen.mom] - 3 * gen.smallR;      //radius of circle used to define reference point of arcs on path
  gen.headR[gen.mom] = gen.bigR[gen.mom] - 2 * gen.smallR;      //radius of circle made by center of head positions.
  gen.fontsize = Math.round(1.8 * gen.smallR);
  genomeCircle(gen, 0, obj);
  // Draw child (Son) genome in a circle ---------
  if (1 < obj[gen.cycle].memSpace.length) {
    gen.bigR[gen.son] = gen.smallR * 2 * gen.size[gen.son] / (2 * Math.PI);
    gen.bigR[gen.son] = gen.bigR[gen.son] + gen.bigR[gen.son] / gen.size[gen.son];
    gen.cy[gen.son] = gen.cy[gen.mom];
    gen.headR[gen.son] = gen.bigR[gen.son] - 2 * gen.smallR;      //radius of circle made by center of head positions.
    if (obj[gen.cycle].didDivide) {
      gen.cx[gen.son] = gen.OrgCanvas.width / 2 + 1.2 * gen.bigR[gen.son];
      gen.rotate[gen.son] = 0;
      drawIcon(gen);
      //there is an offspring, so it can be saved in the freezer or fed back into Organism viewer
      dijit.byId("mnFzOffspring").attr("disabled", false);
      dijit.byId("mnOffspringTrace").attr("disabled", false);
    }
    else {
      gen.cx[gen.son] = gen.cx[gen.mom] + gen.bigR[gen.mom] + 2 * gen.smallR + gen.bigR[gen.son];
      gen.rotate[gen.son] = Math.PI;            //offspring rotated 180 degrees when still growing.
      //no organism, so menu item is disabled
      dijit.byId("mnFzOffspring").attr("disabled", true);
      dijit.byId("mnOffspringTrace").attr("disabled", true);
      //console.log("xy", gen.cx[gen.son], gen.cy[gen.son], " size", gen.size[gen.mom]);
    }
    genomeCircle(gen, 1, obj);
  }
  //Draw path of acrs
  //drawArc2(gen, spot1, spot2, rep)
  for (var ii = 0; ii < obj[gen.cycle].jumps.length; ii++) {
    drawArc2(gen, obj[gen.cycle].jumps[ii].fromIDX, obj[gen.cycle].jumps[ii].toIDX, obj[gen.cycle].jumps[ii].freq);
  }
  //drawHead(gen, spot, generation, head) // draws the various heads for parent (Mom)
  for (var ii = 0; ii < obj[gen.cycle].memSpace.length; ii++) {
    if (undefined != obj[gen.cycle].memSpace[ii].heads.read) {
      drawHead(gen, obj[gen.cycle].memSpace[ii].heads.read, ii, "READ");
    }
    if (undefined != obj[gen.cycle].memSpace[ii].heads.write) {
      drawHead(gen, obj[gen.cycle].memSpace[ii].heads.write, ii, "WRITE");
    }
    if (undefined != obj[gen.cycle].memSpace[ii].heads.flow) {
      drawHead(gen, obj[gen.cycle].memSpace[ii].heads.flow, ii, "FLOW");
    }
    if (undefined != obj[gen.cycle].memSpace[ii].heads.ip) {
      drawHead(gen, obj[gen.cycle].memSpace[ii].heads.ip, ii, "IP");
    }
  }
  //Draw buffers ---------------------------------------------------
  //drawBitStr (name, row, bitStr);
  for (var ii = 0; ii < obj[gen.cycle].buffers.input.length; ii++) {
    drawBitStr(gen.bufferCtx, ii, obj[gen.cycle].buffers.input[ii]);
  }
  drawBitStr(gen.registerCtx, 0, obj[gen.cycle].registers['ax']);
  drawBitStr(gen.registerCtx, 1, obj[gen.cycle].registers['bx']);
  drawBitStr(gen.registerCtx, 2, obj[gen.cycle].registers['cx']);
  //console.log("A", obj[gen.cycle].buffers);
  for (var ii = 0; ii < 2; ii++) { //only showing the top 2 in the stack of 10
    //console.log(ii, obj[gen.cycle].buffers["stack A"][ii]);
    drawBitStr(gen.AstackCtx, ii, obj[gen.cycle].buffers["stack A"][ii]);
  }
  for (var ii = 0; ii < 2; ii++) { //only showing the top 2 in the stack of 10
    drawBitStr(gen.BstackCtx, ii, obj[gen.cycle].buffers["stack B"][ii]);
  }
  drawBitStr(gen.outputCtx, 0, obj[gen.cycle].buffers.output[gen.mom]);
  // update details
  updateTimesPerformed(obj, gen);   //Update Times functions are performed.
  writeInstructDetails(obj, gen);   //Write Instruction Details
  //context.clearRect(0, 0, canvas.width, canvas.height); //to clear canvas see http://stackoverflow.com/questions/2142535/how-to-clear-the-canvas-for-redrawing
}

function updateTimesPerformed(obj, gen) {
  document.getElementById("notPerf").textContent = obj[gen.cycle].functions.not;
  document.getElementById("nanPerf").textContent = obj[gen.cycle].functions.nand;
  document.getElementById("andPerf").textContent = obj[gen.cycle].functions.and;
  document.getElementById("ornPerf").textContent = obj[gen.cycle].functions.orn;
  document.getElementById("oroPerf").textContent = obj[gen.cycle].functions.or;
  document.getElementById("antPerf").textContent = obj[gen.cycle].functions.andn;
  document.getElementById("norPerf").textContent = obj[gen.cycle].functions.nor;
  document.getElementById("xorPerf").textContent = obj[gen.cycle].functions.xor;
  document.getElementById("equPerf").textContent = obj[gen.cycle].functions.equ;
  if (0 < obj[gen.cycle].functions.not) {
    document.getElementById("notOrg").textContent = "0 not+";
  }
  else {
    document.getElementById("notOrg").textContent = "0 not-";
  }
  if (0 < obj[gen.cycle].functions.nand) {
    document.getElementById("nanOrg").textContent = "1 nan+";
  }
  else {
    document.getElementById("nanOrg").textContent = "1 nan-";
  }
  if (0 < obj[gen.cycle].functions.and) {
    document.getElementById("andOrg").textContent = "2 and+";
  }
  else {
    document.getElementById("andOrg").textContent = "2 and-";
  }
  if (0 < obj[gen.cycle].functions.orn) {
    document.getElementById("ornOrg").textContent = "3 orn+";
  }
  else {
    document.getElementById("ornOrg").textContent = "3 orn-";
  }
  if (0 < obj[gen.cycle].functions.or) {
    document.getElementById("oroOrg").textContent = "4 oro+";
  }
  else {
    document.getElementById("oroOrg").textContent = "4 oro-";
  }
  if (0 < obj[gen.cycle].functions.andn) {
    document.getElementById("antOrg").textContent = "5 ant+";
  }
  else {
    document.getElementById("antOrg").textContent = "5 ant-";
  }
  if (0 < obj[gen.cycle].functions.nor) {
    document.getElementById("norOrg").textContent = "6 nor+";
  }
  else {
    document.getElementById("norOrg").textContent = "6 nor-";
  }
  if (0 < obj[gen.cycle].functions.xor) {
    document.getElementById("xorOrg").textContent = "7 xor+";
  }
  else {
    document.getElementById("xorOrg").textContent = "7 xor-";
  }
  if (0 < obj[gen.cycle].functions.equ) {
    document.getElementById("equOrg").textContent = "8 equ+";
  }
  else {
    document.getElementById("equOrg").textContent = "8 equ-";
  }
}

function writeInstructDetails(obj, gen) {
  var letter;
  var IPspot = obj[gen.cycle].memSpace[gen.mom].heads.ip
  if (undefined == obj[gen.cycle - 1]) {
    document.getElementById("ExecuteJust").textContent = "(none)";
  }
  else {
    letter = obj[gen.cycle - 1].nextInstruction;
    document.getElementById("ExecuteJust").textContent = letter + ": " + InstDescribe[letter];
    //console.log("Inst", InstDescribe[letter]);
  }
  if (undefined == obj[gen.cycle].memSpace[gen.mom].memory[IPspot]) {
    document.getElementById("ExecuteAbout").textContent = "(none)";
  }
  else {
    letter = obj[gen.cycle].memSpace[gen.mom].memory[IPspot];
    document.getElementById("ExecuteAbout").textContent = letter + ": " + InstDescribe[letter];
  }
  //console.log('spot=', IPspot, ' letter=', letter, " Instr=", InstDescribe[letter]);
}
