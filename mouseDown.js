av.mouse.downOrganCanvasFn = function(evt) {
  av.mouse.DnOrganPos = [evt.offsetX, evt.offsetY];
  av.mouse.Dn = true;
  av.mouse.Picked = '';
  var distance, jj, hh;
  var ith = -10;
  var isRightMB;
  //http://stackoverflow.com/questions/6926963/understanding-the-window-event-property-and-its-usage
  evt = evt || window.event;  //for IE since IE does not return an event
  // also there is no e.target property in IE.
  // instead IE uses window.event.srcElement
  //var target = e.target || e.srcElement;  //for IE since IE does not have a target.  //not using target here
  //is a right click instead of a left click?
  if ("which" in evt)  // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
    isRightMB = evt.which == 3;
  else if ("button" in e)  // IE, Opera
    isRightMB = evt.button == 2;

  //if (av.traceObj) console.log('av.traceObj', av.traceObj);
  if (av.traceObj && [] !== av.traceObj) {
    //console.log('av.traceObj', av.traceObj);
    av.mouse.Picked = 'not offspring';
    if (av.ind.didDivide) {  //offpsring exists
      distance = Math.sqrt(Math.pow(evt.offsetX - av.ind.cx[1], 2) + Math.pow(evt.offsetY - av.ind.cy[1], 2));
      if (25 > distance) {
        for (var dir in av.fzr.domid) {
          if ('g' == dir.substring(0, 1)) document.getElementById(av.fzr.domid[dir]).style.cursor = 'copy';
        }
        av.mouse.sonCursorShape();
        av.mouse.Picked = "offspring";
        if (av.debug.ind) console.log('av.ind.dna', av.ind.dna);
      }
    }
    if ('offspring' != av.mouse.Picked) {
      av.debug.addUser('Click on Offspring');
      if (av.debug.ind) {
      }
      var lngth = av.traceObj[av.ind.cycle].memSpace.length;
      for (var gg = 0; gg < lngth; gg++) { //gg is generation
        var iiLngth = av.ind.dna[gg].length;
        for (var ii = 0; ii < iiLngth; ii++) {  //ii is the isntruction number
          distance = Math.sqrt(Math.pow(evt.offsetX - av.ind.smCenX[gg][ii], 2) + Math.pow(evt.offsetY - av.ind.smCenY[gg][ii], 2));
          if (av.ind.smallR >= distance) {
            //console.log('found, gg, ii', gg, ii, '; xy',av.ind.smCenX[gg][ii],av.ind.smCenY[gg][ii] );
            ith = ii;
            hh = gg;
            av.mouse.Picked = 'instruction';
            break;
          }
        }
      }
    }
    var instructionNum = ith + 1;
    var flagIndx = hh*50 + instructionNum;
    if ('instruction' == av.mouse.Picked) {
      if (isRightMB) {  //right click on instruction. allow replacement letter.
        //console.log('right click');
        evt.preventDefault();  //supposed to prevent default right click menu - does not work
        return false;         //supposed to prevent default right click menu - does not work
      }
      else {//hh is generation, ith is the instruction
        var labX = av.ind.cx[hh] + (av.ind.bigR[hh] + 2.1 * av.ind.smallR) * Math.cos(ith * 2 * Math.PI / av.ind.size[hh] + av.ind.rotate[hh]);
        var labY = av.ind.cy[hh] + (av.ind.bigR[hh] + 2.1 * av.ind.smallR) * Math.sin(ith * 2 * Math.PI / av.ind.size[hh] + av.ind.rotate[hh]);
        if (av.debug.mouse) console.log('ith, gn', ith, hh, '; rotate', av.ind.rotate[hh], '; xy', labX, labY);
        av.ind.ctx.beginPath();
        av.ind.ctx.arc(labX, labY, 1.1 * av.ind.smallR, 0, 2 * Math.PI);
        av.ind.ctx.fillStyle = av.color.names['White'];  //use if av.ind.dna is a string
        av.ind.ctx.fill();   //required to render fill
        //draw number;
        //console.log('instructionNum=', instructionNum, '; hh=', hh, '; flagIndx=', flagIndx);
        //console.log('labeled=', av.ind.labeled);
        if (av.ind.labeled[flagIndx]) {
          av.ind.labeled[flagIndx] = false;
          //av.ind.ctx.fillStyle = av.color.names['White'];
        }
        else {
          av.ind.labeled[flagIndx] = true;
          av.ind.ctx.fillStyle = av.color.names['Black'];
          av.ind.ctx.font = av.ind.fontsize + "px Arial";
          var txtW = av.ind.ctx.measureText(instructionNum).width;  //use if av.ind.dna is a string
          //txtW = av.ind.ctx.measureText(av.ind.dna[gg][ith]).width;     //use if av.ind.dna is an array
          av.ind.ctx.fillText(instructionNum, labX - txtW / 2, labY + av.ind.smallR / 2);  //use if av.ind.dna is a string
        }
      }
    }
  }
}

