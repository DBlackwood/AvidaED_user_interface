av.grd.backgroundSquares = function () {
  'use strict';
  var boxColor = '#111';
  for (var ii = 0; ii < av.grd.cols; ii++) {
    var xx = av.grd.marginX + av.grd.xOffset + ii * av.grd.cellWd;
    for (var jj = 0; jj < av.grd.rows; jj++) {
      var yy = av.grd.marginY + av.grd.yOffset + jj * av.grd.cellHt;
      //boxColor = get_color0(av.color.ViridisCmap, Math.random(), 0, 1);
      //boxColor = get_color0(av.color.ViridisCmap, 0.5, 0, 1);
      //console.log('color=', boxColor);
      av.grd.cntx.fillStyle = 'rgb(40, 40, 40)';
      av.grd.cntx.fillRect(xx, yy, av.grd.cellWd - 1, av.grd.cellHt - 1);
    }
  }
}

/*
s  scale set based on ancestor organsim as of 2016 summer
 */

//Sets scale and puts the user selected data type in the grid array. Rob wants the scale to be different at the beginning of a run 
av.grd.setMapData = function () {
  'use strict';
  if (undefined != av.grd.msg.fitness) {
    //console.log('av.grd.msg', av.grd.msg);
    //console.log('av.grd.mxFit', av.grd.mxFit, '; av.grd.msg.fitness.maxVal', av.grd.msg.fitness.maxVal, '; limit',
    //  (1 - av.grd.rescaleTolerance) * av.grd.mxFit);
    if (av.grd.mxFit < av.grd.msg.fitness.maxVal || ( av.grd.updateNum >3000 && (1 - av.grd.rescaleTolerance) * av.grd.mxFit > av.grd.msg.fitness.maxVal) ) {
      av.grd.mxFit = av.grd.mxFit + ((1 + av.grd.rescaleTolerance) * av.grd.msg.fitness.maxVal - av.grd.mxFit) / av.grd.rescaleTimeConstant;
      av.grd.reScaleFit = 'rescaling';
    }
    else av.grd.reScaleFit = '';
    if (av.grd.mxCost < av.grd.msg.gestation.maxVal || (1 - av.grd.rescaleTolerance) * av.grd.mxCost > av.grd.msg.gestation.maxVal) {
      av.grd.mxCost = av.grd.mxCost + ((1 + av.grd.rescaleTolerance) * av.grd.msg.gestation.maxVal - av.grd.mxCost) / av.grd.rescaleTimeConstant;
      if (1000 < av.grd.mxCost) av.grd.mxCost = 1000;
      av.grd.reScaleGest = 'rescaling';
    }
    else av.grd.reScaleGest = '';
    if (av.grd.mxRate < av.grd.msg.metabolism.maxVal || ( av.grd.updateNum >1000 && (1 - av.grd.rescaleTolerance) * av.grd.mxRate > av.grd.msg.metabolism.maxVal)) {
      av.grd.mxRate = av.grd.mxRate + ((1 + av.grd.rescaleTolerance) * av.grd.msg.metabolism.maxVal - av.grd.mxRate) / av.grd.rescaleTimeConstant;
      av.grd.reScaleRate = 'rescaling';
    }
    else av.grd.reScaleRate = '';

    switch (dijit.byId("colorMode").value) {
      case 'Fitness':
        av.grd.fill = av.grd.msg.fitness.data;
        av.grd.fillmax = av.grd.mxFit;
        av.grd.fillmin = av.grd.msg.fitness.minVal;
        av.grd.fillRescale = av.grd.reScaleFit;
        break;
      case 'Offspring Cost':
        av.grd.fill = av.grd.msg.gestation.data;
        av.grd.fillmax = av.grd.mxCost;
        av.grd.fillmin = av.grd.msg.gestation.minVal;
        av.grd.fillRescale = av.grd.reScaleGest;
        break;
      case 'Energy Acq. Rate':
        av.grd.fill = av.grd.msg.metabolism.data;
        av.grd.fillmax = av.grd.mxRate;
        av.grd.fillmin = av.grd.msg.metabolism.minVal;
        av.grd.fillRescale = av.grd.reScaleRate;
        break;
      case 'Ancestor Organism':
        av.grd.fill = av.grd.msg.ancestor.data;
        av.grd.fillRescale = '';
        break;
    }
    //console.log('av.grd.msg.anc.data', av.grd.msg.ancestor.data);
    //console.log('av.grd.msg.fit.data', av.grd.msg.fitness.data);
    //console.log('av.grd.msg.gen.data', av.grd.msg.gestation.data);
    //console.log('av.grd.msg.met.data', av.grd.msg.metabolism.data);
  }
  //console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
  //console.log('fitmax',av.grd.msg.fitness.maxVal,'; Gest',av.grd.msg.gestation.maxVal,'; rate',av.grd.msg.metabolism.maxVal,'; fillmax',av.grd.fillmax);
}

av.grd.drawParent = function () {
  'use strict';
  //console.log('av.parents.col.length, marginX, xOffset', av.parents.col.length, av.grd.marginX, av.grd.xOffset);
  if (undefined != av.parents.col) {
    var lngth = av.parents.col.length;
    for (var ii = 0; ii < lngth; ii++) {
      if (!av.parents.injected[ii]) {
        var xx = av.grd.marginX + av.grd.xOffset + av.parents.col[ii] * av.grd.cellWd;
        var yy = av.grd.marginY + av.grd.yOffset + av.parents.row[ii] * av.grd.cellHt;
        if ("Ancestor Organism" == dijit.byId("colorMode").value) {
          av.grd.cntx.fillStyle = av.parents.color[ii];
        }
        else {
          av.grd.cntx.fillStyle = av.color.defaultParentColor;
        }
        av.grd.cntx.fillRect(xx, yy, av.grd.cellWd - 1, av.grd.cellHt - 1);
        //console.log('x, y, wd, Ht', xx, yy, av.grd.cellWd, av.grd.cellHt);
      }
    }
  }
}

//only one line changes between the two loops. Thought it would be faster to do the if outside the loop rather than
//inside the loop. Need to time things to see if it makes a difference
av.grd.drawKids = function () {  //Draw the children of parents
  'use strict';
  var cc, ii, rr, xx, yy, lngth, ndx;
  //console.log('mode', dijit.byId("colorMode").value, '; fill', av.grd.fill);
  lngth = av.grd.fill.length;
  if ("Ancestor Organism" == dijit.byId("colorMode").value) {
    for (ii = 0; ii < lngth; ii++) {
      cc = ii % av.grd.cols;
      rr = Math.floor(ii / av.grd.cols);       //floor was trunc
      xx = av.grd.marginX + av.grd.xOffset + cc * av.grd.cellWd;
      yy = av.grd.marginY + av.grd.yOffset + rr * av.grd.cellHt;
      if (null === av.grd.fill[ii]) {
        av.grd.cntx.fillStyle = '#000';
      }
      else {
        ndx = av.parents.name.indexOf(av.grd.fill[ii]);
        if ('-' === av.grd.fill[ii]) {av.grd.cntx.fillStyle = 'black';}
        else
          av.grd.cntx.fillStyle = av.parents.color[ndx];
        //av.grd.cntx.fillStyle = av.parents.color[av.grd.fill[ii]]
        //console.log('ndx=', ndx, '; name', av.parents.name[av.grd.fill[ii]], '; color', av.parents.color[ndx]);
      }
      av.grd.cntx.fillRect(xx, yy, av.grd.cellWd - 1, av.grd.cellHt - 1);
    }
  }
  else {
    for (ii = 0; ii <  lngth; ii++) {
      cc = ii % av.grd.cols;
      rr = Math.floor(ii / av.grd.cols);     //was trunc
      xx = av.grd.marginX + av.grd.xOffset + cc * av.grd.cellWd;
      yy = av.grd.marginY + av.grd.yOffset + rr * av.grd.cellHt;
      if (null === av.grd.fill[ii]) {
        //console.log('ii', ii, '; msg.ancestor.data[ii]',av.grd.msg.ancestor.data[ii]);
        if ('-' === av.grd.msg.ancestor.data[ii]) av.grd.cntx.fillStyle = '#000';  //not there
        else {
          av.grd.cntx.fillStyle = '#0B0';
          console.log('fill[', ii, '] = ', av.grd.fill[ii], 'ancestor != -');
        } //not viable
      }
      else if (0 == av.grd.fill[ii]) {
        //console.log('fill[', ii, '] = ', av.grd.fill[ii], 'default kid color');
        av.grd.cntx.fillStyle = av.color.defaultKidColor;
      }
      else if (0 > av.grd.fill[ii] || ('Offspring Cost' == dijit.byId("colorMode").value && 999 < av.grd.fill[ii])) {
        console.log('fill[', ii, '] = ', av.grd.fill[ii], 'fill out of bounds');
        av.grd.cntx.fillStyle = '#090';
      }
      else {  //get_color0 = function(cmap, dx, d1, d2)
        av.grd.cntx.fillStyle = get_color0(av.grd.cmap, av.grd.fill[ii], 0, av.grd.fillmax);
        //console.log('fillStyle', get_color0(av.grd.cmap, av.grd.fill[ii], 0, av.grd.fillmax));
      }
      av.grd.cntx.fillRect(xx, yy, av.grd.cellWd - 1, av.grd.cellHt - 1);
    }
  }
  //console.log('end of drawKids update', av.grd.msg.update);
}

av.grd.findLogicOutline = function () {
  'use strict';
  var ii, lngth;
  av.ptd.allOff = true;
  //console.log('not',av.grd.msg.not.data);
  lngth = av.grd.msg.not.data.length;
  for (ii = 0; ii < lngth; ii++) {
    av.grd.logicOutline[ii] = 1;
  }
  if ('on' == document.getElementById('notButton').value) {
    lngth = av.grd.msg.not.data.length;
    for (ii = 0; ii < lngth; ii++) {av.grd.logicOutline[ii] = av.grd.logicOutline[ii] * av.grd.msg.not.data[ii];}
    av.ptd.allOff = false;
  }
  if ('on' == document.getElementById('nanButton').value) {
    lngth = av.grd.msg.nand.data.length;
    for (ii = 0; ii < lngth; ii++) {av.grd.logicOutline[ii] = av.grd.logicOutline[ii] * av.grd.msg.nand.data[ii];}
    av.ptd.allOff = false;
  }
  if ('on' == document.getElementById('andButton').value) {
    lngth = av.grd.msg.and.data.length;
    for (ii = 0; ii < lngth; ii++) {av.grd.logicOutline[ii] = av.grd.logicOutline[ii] * av.grd.msg.and.data[ii];}
    av.ptd.allOff = false;
  }
  if ('on' == document.getElementById('ornButton').value) {
    lngth = av.grd.msg.orn.data.length;
    for (ii = 0; ii < lngth; ii++) {av.grd.logicOutline[ii] = av.grd.logicOutline[ii] * av.grd.msg.orn.data[ii];}
    av.ptd.allOff = false;
    if (av.debug.bool) console.log('orn', av.grd.msg.orn.data);
  }
  if ('on' == document.getElementById('oroButton').value) {
    lngth = av.grd.msg.or.data.length;
    for (ii = 0; ii < lngth; ii++) {av.grd.logicOutline[ii] = av.grd.logicOutline[ii] * av.grd.msg.or.data[ii];}
    av.ptd.allOff = false;
    if (av.debug.bool) console.log('or', av.grd.msg.or.data);
  }
  if ('on' == document.getElementById('antButton').value) {
    lngth = av.grd.msg.andn.data.length;
    for (ii = 0; ii < lngth; ii++) {av.grd.logicOutline[ii] = av.grd.logicOutline[ii] * av.grd.msg.andn.data[ii];}
    av.ptd.allOff = false;
  }
  if ('on' == document.getElementById('norButton').value) {
    lngth = av.grd.msg.nor.data.length;
    for (ii = 0; ii < lngth; ii++) {av.grd.logicOutline[ii] = av.grd.logicOutline[ii] * av.grd.msg.nor.data[ii];}
    av.ptd.allOff = false;
  }
  if ('on' == document.getElementById('xorButton').value) {
    lngth = av.grd.msg.xor.data.length;
    for (ii = 0; ii < lngth; ii++) {av.grd.logicOutline[ii] = av.grd.logicOutline[ii] * av.grd.msg.xor.data[ii];}
    av.ptd.allOff = false;
  }
  if ('on' == document.getElementById('equButton').value) {
    lngth = av.grd.msg.equ.data.length;
    for (ii = 0; ii < lngth; ii++) {av.grd.logicOutline[ii] = av.grd.logicOutline[ii] * av.grd.msg.equ.data[ii];}
    av.ptd.allOff = false;
  }
  if (av.ptd.allOff) {for (ii = 0; ii < av.grd.msg.not.data.length; ii++) { av.grd.logicOutline[ii] = 0; } }

  //console.log('LLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL');
  if (av.debug.bool) console.log('setLogic', av.grd.logicOutline);
  //console.log('update',av.grd.updateNum, '; setLogic', av.grd.logicOutline);
  //if (0 <= av.grd.msg.update) av.ptd.updateLogicFn();  //this is done in update population stats right now
};

av.grd.cellConflict = function (NewCols, NewRows) {
  'use strict';
  var places = [[1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]];
  var flg = false;
  var tryCol, tryRow, avNdx;
  if (undefined != av.parents.handNdx) {
    var handNum = av.parents.handNdx.length;
    for (var ii = 0; ii < handNum; ii++) {
      flg = av.grd.cellFilled(av.parents.AvidaNdx[av.parents.handNdx[ii]], ii);
      if (flg) {
        var lngth = places.length;
        for (var jj = 0; jj < lngth; jj++) {
          tryCol = av.parents.col[av.parents.handNdx[ii]] + places[jj][0];
          tryRow = av.parents.row[av.parents.handNdx[ii]] + places[jj][1];
          avNdx = tryCol + tryRow * NewCols;
          if (0 <= tryCol && tryCol < NewCols && 0 <= tryRow && tryRow < NewRows) {
            flg = av.grd.cellFilled(avNdx, ii);
          }
          else {
            flg = true
          }
          if (!flg) {
            av.parents.col[av.parents.handNdx[ii]] = tryCol;
            av.parents.row[av.parents.handNdx[ii]] = tryRow;
            av.parents.AvidaNdx[av.parents.handNdx[ii]] = avNdx;
            break;
          }
        }
      }
    }
  }
}

av.grd.DrawLogicSelected = function () {
  'use strict';
  //console.log('DrawLogic', av.grd.logicOutline);
  var cc, rr, xx, yy;
  var inner = 0.08 * av.grd.cellWd; //how far inside the square to put the outline.
  var thick = 0.1 * av.grd.cellWd; //thickness of line to draw
  if (1 > inner) inner = 1;
  if (1 > thick) thick = 1;
  //console.log('=========================')
  //console.log('logic', av.grd.logicOutline);
  var lngth = av.grd.logicOutline.length;
  for (var ii = 0; ii < lngth; ii++) {
    if (0 != av.grd.logicOutline[ii]) {
      cc = ii % av.grd.cols;
      rr = Math.floor(ii / av.grd.cols);  //was trunc
      xx = av.grd.marginX + av.grd.xOffset + cc * av.grd.cellWd + inner;
      yy = av.grd.marginY + av.grd.yOffset + rr * av.grd.cellHt + inner;
      av.grd.drawCellOutline(thick, av.grd.LogicColor, xx, yy, av.grd.cellWd-2*inner, av.grd.cellHt-2*inner);
    }
  }
}

//Draw Cell outline or including special case for Selected
av.grd.drawSelected = function () {
  'use strict';
  var thick = 0.1 * av.grd.cellWd;
  if (1 > thick) thick = 1;
  av.grd.selectX = av.grd.marginX + av.grd.xOffset + av.grd.selectedCol * av.grd.cellWd;
  av.grd.selectY = av.grd.marginY + av.grd.yOffset + av.grd.selectedRow * av.grd.cellHt;
  av.grd.drawCellOutline(thick, av.grd.SelectedColor, av.grd.selectX, av.grd.selectY, av.grd.cellWd, av.grd.cellHt)
}

av.grd.drawCellOutline = function (lineThickness, color, xx, yy, wide, tall) {
  'use strict';
  av.grd.cntx.beginPath();
  av.grd.cntx.rect(xx, yy, wide, tall);
  av.grd.cntx.strokeStyle = color;
  av.grd.cntx.lineWidth = lineThickness;
  av.grd.cntx.stroke();
}

av.grd.findGridSize = function (){
  'use strict';
  // When zoom = 1x, set canvas size based on space available and cell size
  // based on rows and columns requested by the user. Zoom acts as a factor
  // to multiply the size of each cell. When the size of the grid become larger
  // than the canvas, then the canvas is set to the size of the grid and the
  // offset in that direction goes to zero.

  // First find sizes based on zoom
  av.grd.boxX = av.grd.zoom * av.grd.spaceX;
  av.grd.boxY = av.grd.zoom * av.grd.spaceY;
  //get rows and cols based on user input form
  //av.grd.cols = dijit.byId("sizeCols").get('value');
  av.grd.cols = av.dom.sizeCols.value;
  av.grd.rows = av.dom.sizeRows.value;
  //max size of box based on width or height based on ratio of cols:rows and width:height
  if (av.grd.spaceX / av.grd.spaceY > av.grd.cols / av.grd.rows) {
    //set based  on height as that is the limiting factor.
    av.grd.sizeY = av.grd.boxY;
    av.grd.sizeX = av.grd.sizeY * av.grd.cols / av.grd.rows;
    av.grd.spaceCellWd = av.grd.spaceY / av.grd.rows;
    av.grd.spaceCells = av.grd.rows;  //rows exactly fit the space when zoom = 1x
  }
  else {
    //set based on width as that is the limiting direction
    av.grd.sizeX = av.grd.boxX;
    av.grd.sizeY = av.grd.sizeX * av.grd.rows / av.grd.cols;
    av.grd.spaceCellWd = av.grd.spaceX / av.grd.cols;
    av.grd.spaceCells = av.grd.cols;  //cols exactly fit the space when zoom = 1x
  }

  //Determine new size of grid
    av.grd.CanvasGrid.width = av.grd.sizeX;
    av.grd.xOffset = 0;
    av.grd.CanvasGrid.height = av.grd.sizeY;
    av.grd.yOffset = 0;
}
av.grd.drawGridUpdate = function () {
  'use strict';
  //get cell size based on grid size and number of columns and rows
  av.grd.cellWd = ((av.grd.sizeX - av.grd.marginX) / av.grd.cols);
  av.grd.cellHt = ((av.grd.sizeY - av.grd.marginY) / av.grd.rows);

  //Find a reasonable maximum zoom for this grid and screen space for av.grd.zoomSlide
  /*
  var zMaxCells = Math.floor(av.grd.spaceCells / 25);  // at least 10 cells   was trunc
  var zMaxWide = Math.floor(10 / av.grd.spaceCellWd);  // at least 10 pixels  was trunc
  var zMax = ((zMaxCells > zMaxWide) ? zMaxCells : zMaxWide); //Max of two methods
  zMax = ((zMax > 2) ? zMax : 2); //max zoom power of at least 2x
*/
  //console.log('zoomSlide set zMax, expression', zMax, 2 * (zMax - 1) + 1);
//  av.grd.zoomSlide.set("maximum", zMax);
  //av.grd.zoomSlide.set("discreteValues", 2 * (zMax - 1) + 3);
//  av.grd.zoomSlide.set("maximum", 5);

  //console.log('min', av.grd.zoomSlide.get('minimum'), '; max', av.grd.zoomSlide.get('maximum'), '; discrete',
  //    av.grd.zoomSlide.get('discreteValues'), '; value', av.grd.zoomSlide.get('value'));
  //console.log("Cells, pixels, zMax, zoom", zMaxCells, zMaxWide, zMax, av.grd.zoom);

  av.grd.drawGridBackground();
  //Check to see if run has started
  if ('prepping' === av.grd.runState) {
    av.grd.drawParent();
  }
  else {
    av.grd.drawKids();
    av.grd.drawParent();
  }
  //Draw Selected as one of the last items to draw
  if (av.grd.flagSelected) { av.grd.drawSelected() }
  if ('prepping' !== av.grd.runState) av.grd.DrawLogicSelected();
}

av.grd.drawGridBackground = function () {
  'use strict';
  // Use the identity matrix while clearing the canvas    http://stackoverflow.com/questions/2142535/how-to-clear-the-canvas-for-redrawing
  av.grd.cntx.setTransform(1, 0, 0, 1, 0, 0);
  av.grd.cntx.clearRect(0, 0, av.grd.CanvasGrid.width, av.grd.CanvasGrid.height); //to clear canvas see http://stackoverflow.com/questions/2142535/how-to-clear-the-canvas-for-redrawing
  //draw grey rectangle as back ground
  av.grd.cntx.fillStyle = av.color.names['ltGrey'];
  av.grd.cntx.fillRect(0, 0, av.grd.CanvasGrid.width, av.grd.CanvasGrid.height);

  //av.grd.cntx.translate(av.grd.xOffset, av.grd.yOffset);
  av.grd.cntx.fillStyle = av.color.names['Black'];
  av.grd.cntx.fillRect(av.grd.xOffset, av.grd.yOffset, av.grd.sizeX, av.grd.sizeY);

  av.grd.backgroundSquares();
}

//--------------- Draw legend --------------------------------------
//Draws the color and name of each Ancestor (parent) organism
//to lay out the legend we need the width of the longest name and we
//allow for the width of the color box to see how many columns fit across
//the width of av.grd.CanvasScale. We will need to increase the size of the
//legend box by the height of a line for each additional line.
av.grd.drawLegend = function () {
  'use strict';
  var legendPad = 10;   //padding on left so it is not right at edge of canvas
  var colorWide = 13;   //width and heigth of color square
  var RowHt = 20;       //height of each row of text
  var textOffset = 15;  //vertical offset to get to the bottom of the text
  var leftPad = 10;     //padding to allow space between each column of text in the legend
  var legendCols = 1;   //max number of columns based on width of canvas and longest name
  var txtWide = 0;      //width of text for an ancestor (parent) name
  var maxWide = 0;      //maximum width needed for any of the ancestor names in this set
  //console.log('in drawLedgend')
  av.grd.sCtx.font = "14px Arial";
  //find out how much space is needed
  var lngth = av.parents.name.length;
  for (var ii = 0; ii < lngth; ii++) {
    txtWide = av.grd.sCtx.measureText(av.parents.name[ii]).width;
    if (txtWide > maxWide) {
      maxWide = txtWide
    }
  }
  legendCols = Math.floor((av.grd.CanvasScale.width - leftPad) / (maxWide + colorWide + legendPad));  //was trunc
  if (Math.floor(av.parents.name.length / legendCols) == av.parents.name.length / legendCols) {          //was trunc
    var legendRows = Math.floor(av.parents.name.length / legendCols);
  }
  else {
    legendRows = Math.floor(av.parents.name.length / legendCols) + 1;    //was trunc
  }
  //set canvas height based on space needed
  av.grd.CanvasScale.height = RowHt * legendRows;
  av.grd.sCtx.fillStyle = av.color.names["ltGrey"];
  av.grd.sCtx.fillRect(0, 0, av.grd.CanvasScale.width, av.grd.CanvasScale.height);
  var colWide = (av.grd.CanvasScale.width - leftPad) / legendCols
  var col = 0;
  var row = 0;
  lngth = av.parents.name.length;
  for (ii = 0; ii < lngth; ii++) {
    col = ii % legendCols;
    row = Math.floor(ii / legendCols);    //was trunc
    //xx = leftPad + col*(maxWide+colorWide+legendPad);
    var xx = leftPad + col * (colWide);
    var yy = 2 + row * RowHt;
    av.grd.sCtx.fillStyle = av.parents.color[ii];
    av.grd.sCtx.fillRect(xx, yy, colorWide, colorWide);
    var yy = textOffset + row * RowHt;
    av.grd.sCtx.font = "14px Arial";
    av.grd.sCtx.fillStyle = 'black';
    av.grd.sCtx.fillText(av.parents.name[ii], xx + colorWide + legendPad / 2, yy);
  }
}

av.grd.gradientScale = function () {
  'use strict';
  //console.log('gradientScale')
  av.grd.CanvasScale.height = 30;
  av.grd.sCtx.fillStyle = av.color.names["ltGrey"];
  av.grd.sCtx.fillRect(0, 0, av.grd.CanvasScale.width, av.grd.CanvasScale.height);
  var xStart = 15;
  var xEnd = av.grd.CanvasScale.width - 2.5 * xStart;
  var gradWidth = xEnd - xStart
  var grad = av.grd.sCtx.createLinearGradient(xStart + 2, 0, xEnd - 2, 0)
  var legendHt = 15;
  switch (av.grd.colorMap) {
    case "Viridis":
      av.grd.cmap = av.color.ViridisCmap;
      break;
    case 'Gnuplot2':
      av.grd.cmap = av.color.Gnuplot2cmap;
      break;
    case 'Cubehelix':
      av.grd.cmap = av.color.cubehelixCmap;
  }
  var lngth = av.grd.cmap.length;
  for (var ii = 0; ii < lngth; ii++) {
    grad.addColorStop(ii / (av.grd.cmap.length - 1), av.grd.cmap[ii]);
  }
  av.grd.sCtx.fillStyle = grad;
  av.grd.sCtx.fillRect(xStart, legendHt, gradWidth, av.grd.CanvasScale.height - legendHt);
  //Draw Values if run started
  //console.log('GradientScale runState = ',av.grd.runState);
  if ('prepping' !== av.grd.runState) {
    //if (true) {  av.grd.fillmax = 805040;
    av.grd.sCtx.font = "14px Arial";
    av.grd.sCtx.fillStyle = "#000";
    var maxTxtWd = gradWidth / 5;
    var place = 2;
    var xx = 0;
    var marks = 4;
    var txt = "";
    if (av.grd.fillmax > 1000) {
      place = 0
    }
    else if (av.grd.fillmax > 100) {
      place = 1
    }
    for (var ii = 0; ii <= marks; ii++) {
      xx = ii * av.grd.fillmax / marks;
      txt = xx.formatNum(place);  //2 in this case is number of decimal places
      var txtW = av.grd.sCtx.measureText(txt).width;
      xx = xStart + ii * gradWidth / marks - txtW / 2;
      av.grd.sCtx.fillText(txt, xx, legendHt - 2, maxTxtWd);
    }
  }
  //part of colorTest, delete later
  /*  av.grd.sCtx.beginPath();
   av.grd.sCtx.strokeStyle = '#00FF00';
   av.grd.sCtx.moveTo(xStart, legendHt);
   av.grd.sCtx.lineTo(xStart + gradWidth, legendHt);
   av.grd.sCtx.stroke();
   av.grd.sCtx.beginPath();
   av.grd.sCtx.strokeStyle = '#44FFFF';
   av.grd.sCtx.moveTo(xStart, av.grd.CanvasScale.height - 1);
   av.grd.sCtx.lineTo(xStart + gradWidth, av.grd.CanvasScale.height - 1);
   av.grd.sCtx.stroke();
   console.log('Take out after color test');
   */
}

av.grd.cellFilled = function (AvNdx, ii) {
  var flag = false;
  //console.log('av.grd.cellFilled', AvNdx, av.parents.AvidaNdx)
  var lngth = av.parents.name.length;
  for (var jj = 0; jj < lngth; jj++) {
    if (av.parents.handNdx[ii] != jj) {
      if (AvNdx == av.parents.AvidaNdx[jj]) {
        flag = true;
        return flag;
        break;
      }
    }
  }
  return flag;
}

/*how to center grid
http://stackoverflow.com/questions/5127937/how-to-center-canvas-in-html5
*/
