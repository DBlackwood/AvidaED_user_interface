function backgroundSquares(grd) {
  var boxColor = '#111';
  for (ii = 0; ii < grd.cols; ii++) {
    xx = grd.marginX + grd.xOffset + ii * grd.cellWd;
    for (jj = 0; jj < grd.rows; jj++) {
      yy = grd.marginY + grd.yOffset + jj * grd.cellHt;
      //boxColor = get_color0(Viridis_cmap, Math.random(), 0, 1);
      //boxColor = get_color0(Viridis_cmap, 0.5, 0, 1);
      //console.log('color=', boxColor);
      grd.cntx.fillStyle = 'rgb(40, 40, 40)';
      grd.cntx.fillRect(xx, yy, grd.cellWd - 1, grd.cellHt - 1);
    }
  }
}

function setMapData(grd) {
  if (undefined != grd.msg.fitness) {
    if (grd.mxFit < grd.msg.fitness.maxVal || (1 - grd.rescaleTolerance) * grd.mxFit > grd.msg.fitness.maxVal) {
      grd.mxFit = grd.mxFit + ((1 + grd.rescaleTolerance) * grd.msg.fitness.maxVal - grd.mxFit) / grd.rescaleTimeConstant;
    }
    if (grd.mxGest < grd.msg.gestation.maxVal || (1 - grd.rescaleTolerance) * grd.mxGest > grd.msg.gestation.maxVal) {
      grd.mxGest = grd.mxGest + ((1 + grd.rescaleTolerance) * grd.msg.gestation.maxVal - grd.mxGest) / grd.rescaleTimeConstant;
    }
    if (grd.mxRate < grd.msg.metabolism.maxVal || (1 - grd.rescaleTolerance) * grd.mxRate > grd.msg.metabolism.maxVal) {
      grd.mxRate = grd.mxRate + ((1 + grd.rescaleTolerance) * grd.msg.metabolism.maxVal - grd.mxRate) / grd.rescaleTimeConstant;
    }
    switch (dijit.byId("colorMode").value) {
      case 'Fitness':
        grd.fill = grd.msg.fitness.data;
        grd.fillmax = grd.mxFit;
        grd.fillmin = grd.msg.fitness.minVal;
        break;
      case 'Gestation Time':
        grd.fill = grd.msg.gestation.data;
        grd.fillmax = grd.mxGest;
        grd.fillmin = grd.msg.gestation.minVal;
        break;
      case 'Metabolic Rate':
        grd.fill = grd.msg.metabolism.data;
        grd.fillmax = grd.mxRate;
        grd.fillmin = grd.msg.metabolism.minVal;
        break;
      case 'Ancestor Organism':
        grd.fill = grd.msg.ancestor.data;
        break;
    }
  }
  //console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
  //console.log('fitmax',grd.msg.fitness.maxVal,'; Gest',grd.msg.gestation.maxVal,'; rate',grd.msg.metabolism.maxVal,'; fillmax',grd.fillmax);
}

function DrawParent(grd, parents) {
  //console.log('parents.col.length, marginX, xOffset', parents.col.length, grd.marginX, grd.xOffset);
  for (ii = 0; ii < parents.col.length; ii++) {
    xx = grd.marginX + grd.xOffset + parents.col[ii] * grd.cellWd;
    yy = grd.marginY + grd.yOffset + parents.row[ii] * grd.cellHt;
    if ("Ancestor Organism" == dijit.byId("colorMode").value) {
      grd.cntx.fillStyle = parents.color[ii];
    }
    else {
      grd.cntx.fillStyle = defaultParentColor;
    }
    grd.cntx.fillRect(xx, yy, grd.cellWd - 1, grd.cellHt - 1);
    //console.log('x, y, wd, Ht', xx, yy, grd.cellWd, grd.cellHt);
  }
}

//only one line changes between the two loops. Thought it would be faster to do the if outside the loop rather than
//inside the loop. Need to time things to see if it makes a difference
function DrawKids(grd, parents) {  //Draw the children of parents
  var cc, rr, xx, yy;
  //console.log('fill', grd.fill);
  if ("Ancestor Organism" == dijit.byId("colorMode").value) {
    for (ii = 0; ii < grd.fill.length; ii++) {
      cc = ii % grd.cols;
      rr = Math.floor(ii / grd.cols);       //was trunc
      xx = grd.marginX + grd.xOffset + cc * grd.cellWd;
      yy = grd.marginY + grd.yOffset + rr * grd.cellHt;
      if (null === grd.fill[ii]) {
        grd.cntx.fillStyle = '#000'
      }
      else {
        grd.cntx.fillStyle = parents.color[grd.fill[ii]]
      }
      grd.cntx.fillRect(xx, yy, grd.cellWd - 1, grd.cellHt - 1);
    }
  }
  else {
    for (ii = 0; ii < grd.fill.length; ii++) {
      cc = ii % grd.cols;
      rr = Math.floor(ii / grd.cols);     //was trunc
      xx = grd.marginX + grd.xOffset + cc * grd.cellWd;
      yy = grd.marginY + grd.yOffset + rr * grd.cellHt;
      if (null === grd.fill[ii]) {
        //console.log('ii', ii, '; msg.ancestor.data[ii]',grd.msg.ancestor.data[ii]);
        if (null === grd.msg.ancestor.data[ii]) grd.cntx.fillStyle = '#000';
        else grd.cntx.fillStyle = '#888';
      }
      else if (0 == grd.fill[ii]) grd.cntx.fillStyle = defaultKidColor;
      else {  //get_color0 = function(cmap, dx, d1, d2)
        grd.cntx.fillStyle = get_color0(grd.cmap, grd.fill[ii], 0, grd.fillmax);
        //console.log('fillStyle', get_color0(grd.cmap, grd.fill[ii], 0, grd.fillmax));
      }
      grd.cntx.fillRect(xx, yy, grd.cellWd - 1, grd.cellHt - 1);
    }
  }
}

function findLogicOutline(grd) {
  grd.allOff = true;
  //console.log('not',grd.msg.not.data);
  for (ii = 0; ii < grd.msg.not.data.length; ii++) {
    grd.out[ii] = 1;
  }
  if ('on' == document.getElementById('notButton').value) {
    for (ii = 0; ii < grd.msg.not.data.length; ii++) {grd.out[ii] = grd.out[ii] * grd.msg.not.data[ii];}
    grd.allOff = false;
  }
  if ('on' == document.getElementById('nanButton').value) {
    for (ii = 0; ii < grd.msg.nand.data.length; ii++) {grd.out[ii] = grd.out[ii] * grd.msg.nand.data[ii];}
    grd.allOff = false;
  }
  if ('on' == document.getElementById('andButton').value) {
    for (ii = 0; ii < grd.msg.and.data.length; ii++) {grd.out[ii] = grd.out[ii] * grd.msg.and.data[ii];}
    grd.allOff = false;
  }
  if ('on' == document.getElementById('ornButton').value) {
    for (ii = 0; ii < grd.msg.orn.data.length; ii++) {grd.out[ii] = grd.out[ii] * grd.msg.orn.data[ii];}
    grd.allOff = false;
    if (debug.logic) console.log('or', grd.msg.orn.data);
  }
  if ('on' == document.getElementById('oroButton').value) {
    for (ii = 0; ii < grd.msg.or.data.length; ii++) {grd.out[ii] = grd.out[ii] * grd.msg.or.data[ii];}
    grd.allOff = false;
    if (debug.logic) console.log('or', grd.msg.or.data);
  }
  if ('on' == document.getElementById('antButton').value) {
    for (ii = 0; ii < grd.msg.andn.data.length; ii++) {grd.out[ii] = grd.out[ii] * grd.msg.andn.data[ii];}
    grd.allOff = false;
  }
  if ('on' == document.getElementById('norButton').value) {
    for (ii = 0; ii < grd.msg.nor.data.length; ii++) {grd.out[ii] = grd.out[ii] * grd.msg.nor.data[ii];}
    grd.allOff = false;
  }
  if ('on' == document.getElementById('xorButton').value) {
    for (ii = 0; ii < grd.msg.xor.data.length; ii++) {grd.out[ii] = grd.out[ii] * grd.msg.xor.data[ii];}
    grd.allOff = false;
  }
  if ('on' == document.getElementById('equButton').value) {
    for (ii = 0; ii < grd.msg.equ.data.length; ii++) {grd.out[ii] = grd.out[ii] * grd.msg.equ.data[ii];}
    grd.allOff = false;
  }
  if (grd.allOff) {for (ii = 0; ii < grd.msg.not.data.length; ii++) { grd.out[ii] = 0 } }

  //console.log('LLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL');
  if (debug.logic) console.log('setLogic', grd.out);
}

function cellConflict(NewCols, NewRows, grd, parents) {
  var places = [[1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]];
  var flg = false;
  var tryCol, tryRow, avNdx;
  for (var ii = 0; ii < parents.handNdx.length; ii++) {
    flg = cellFilled(parents.AvidaNdx[parents.handNdx[ii]], ii, parents);
    if (flg) {
      for (var jj = 0; jj < places.length; jj++) {
        tryCol = parents.col[parents.handNdx[ii]] + places[jj][0];
        tryRow = parents.row[parents.handNdx[ii]] + places[jj][1];
        avNdx = tryCol + tryRow * NewCols;
        if (0 <= tryCol && tryCol < NewCols && 0 <= tryRow && tryRow < NewRows) {
          flg = cellFilled(avNdx, ii, parents)
        }
        else {
          flg = true
        }
        if (!flg) {
          parents.col[parents.handNdx[ii]] = tryCol;
          parents.row[parents.handNdx[ii]] = tryRow;
          parents.AvidaNdx[parents.handNdx[ii]] = avNdx;
          break;
        }
      }
    }
  }
}

function DrawLogicSelected(grd) {
  //console.log('DrawLogic', grd.out);
  var cc, rr, xx, yy;
  var inner = 0.08 * grd.cellWd; //how far inside the square to put the outline.
  var thick = 0.1 * grd.cellWd;; //thickness of line to draw
  if (1 > inner) inner = 1;
  if (1 > thick) thick = 1;
  //console.log('=========================')
  //console.log('logic', grd.out);
  for (ii = 0; ii < grd.out.length; ii++) {
    if (0 != grd.out[ii]) {
      cc = ii % grd.cols;
      rr = Math.floor(ii / grd.cols);  //was trunc
      xx = grd.marginX + grd.xOffset + cc * grd.cellWd + inner;
      yy = grd.marginY + grd.yOffset + rr * grd.cellHt + inner;
      DrawCellOutline(thick, grd.LogicColor, xx, yy, grd.cellWd-2*inner, grd.cellHt-2*inner, grd)
    }
  }

}

//Draw Cell outline or including special case for Selected
function DrawSelected(grd) {
  var thick = 0.1 * grd.cellWd;
  if (1 > thick) thick = 1;
  grd.selectX = grd.marginX + grd.xOffset + grd.selectedCol * grd.cellWd;
  grd.selectY = grd.marginY + grd.yOffset + grd.selectedRow * grd.cellHt;
  DrawCellOutline(thick, grd.SelectedColor, grd.selectX, grd.selectY, grd.cellWd, grd.cellHt, grd)
}

function DrawCellOutline(lineThickness, color, xx, yy, wide, tall, grd) {
  grd.cntx.beginPath();
  grd.cntx.rect(xx, yy, wide, tall);
  grd.cntx.strokeStyle = color;
  grd.cntx.lineWidth = lineThickness;
  grd.cntx.stroke();
}

function findGridSize(grd, parents){
  // When zoom = 1x, set canvas size based on space available and cell size
  // based on rows and columns requested by the user. Zoom acts as a factor
  // to multiply the size of each cell. When the size of the grid become larger
  // than the canvas, then the canvas is set to the size of the grid and the
  // offset in that direction goes to zero.

  // First find sizes based on zoom
  grd.boxX = grd.zoom * grd.spaceX;
  grd.boxY = grd.zoom * grd.spaceY;
  //get rows and cols based on user input form
  grd.cols = dijit.byId("sizeCols").get('value');
  grd.rows = dijit.byId("sizeRows").get('value');
  //max size of box based on width or height based on ratio of cols:rows and width:height
  if (grd.spaceX / grd.spaceY > grd.cols / grd.rows) {
    //set based  on height as that is the limiting factor.
    grd.sizeY = grd.boxY;
    grd.sizeX = grd.sizeY * grd.cols / grd.rows;
    grd.spaceCellWd = grd.spaceY / grd.rows;
    grd.spaceCells = grd.rows;  //rows exactly fit the space when zoom = 1x
  }
  else {
    //set based on width as that is the limiting direction
    grd.sizeX = grd.boxX;
    grd.sizeY = grd.sizeX * grd.rows / grd.cols;
    grd.spaceCellWd = grd.spaceX / grd.cols;
    grd.spaceCells = grd.cols;  //cols exactly fit the space when zoom = 1x
  }

  //Determine offset and size of canvas based on grid size relative to space size in that direction
  if (grd.sizeX < grd.spaceX) {
    grd.CanvasGrid.width = grd.spaceX;
    grd.xOffset = (grd.spaceX - grd.sizeX) / 2;
  }
  else {
    grd.CanvasGrid.width = grd.sizeX;
    grd.xOffset = 0;
  }
  if (grd.sizeY < grd.spaceY) {
    grd.CanvasGrid.height = grd.spaceY;
    grd.yOffset = (grd.spaceY - grd.sizeY) / 2;
  }
  else {
    grd.CanvasGrid.height = grd.sizeY;
    grd.yOffset = 0;
  }
  //console.log('Xsize', grd.sizeX, '; Ysize', grd.sizeY, '; zoom=', grd.zoom);

}
function DrawGridUpdate(grd, parents) {
  //get cell size based on grid size and number of columns and rows
  grd.cellWd = ((grd.sizeX - grd.marginX) / grd.cols);
  grd.cellHt = ((grd.sizeY - grd.marginY) / grd.rows);

  //Find a reasonable maximum zoom for this grid and screen space
  zMaxCells = Math.floor(grd.spaceCells / 25);  // at least 10 cells   was trunc
  zMaxWide = Math.floor(10 / grd.spaceCellWd);  // at least 10 pixels  was trunc
  zMax = ((zMaxCells > zMaxWide) ? zMaxCells : zMaxWide); //Max of two methods
  zMax = ((zMax > 2) ? zMax : 2); //max zoom power of at least 2x

  grd.ZoomSlide.set("maximum", zMax);
  grd.ZoomSlide.set("discreteValues", 2 * (zMax - 1) + 1);
  //console.log("Cells, pixels, zMax, zoom", zMaxCells, zMaxWide, zMax, grd.zoom);

  DrawGridBackground(grd);
  //Check to see if run has started
  if (grd.newrun) {
    DrawParent(grd, parents);
  }
  else {
    DrawKids(grd, parents);
  }
  //Draw Selected as one of the last items to draw
  if (grd.flagSelected) { DrawSelected(grd) }
  if (!grd.newrun) DrawLogicSelected(grd);
}

function DrawGridBackground(grd) {
  // Use the identity matrix while clearing the canvas    http://stackoverflow.com/questions/2142535/how-to-clear-the-canvas-for-redrawing
  grd.cntx.setTransform(1, 0, 0, 1, 0, 0);
  grd.cntx.clearRect(0, 0, grd.CanvasGrid.width, grd.CanvasGrid.height); //to clear canvas see http://stackoverflow.com/questions/2142535/how-to-clear-the-canvas-for-redrawing
  //draw grey rectangle as back ground
  grd.cntx.fillStyle = dictColor['ltGrey'];
  grd.cntx.fillRect(0, 0, grd.CanvasGrid.width, grd.CanvasGrid.height);

  //grd.cntx.translate(grd.xOffset, grd.yOffset);
  grd.cntx.fillStyle = dictColor['Black'];
  grd.cntx.fillRect(grd.xOffset, grd.yOffset, grd.sizeX, grd.sizeY);

  backgroundSquares(grd);
}

//--------------- Draw legend --------------------------------------
//Draws the color and name of each Ancestor (parent) organism
//to lay out the legend we need the width of the longest name and we
//allow for the width of the color box to see how many columns fit across
//the width of grd.CanvasScale. We will need to increase the size of the
//legend box by the height of a line for each additional line.
function drawLegend(grd, parents) {
  var legendPad = 10;   //padding on left so it is not right at edge of canvas
  var colorWide = 13;   //width and heigth of color square
  var RowHt = 20;       //height of each row of text
  var textOffset = 15;  //vertical offset to get to the bottom of the text
  var leftPad = 10;     //padding to allow space between each column of text in the legend
  var legendCols = 1;   //max number of columns based on width of canvas and longest name
  var txtWide = 0;      //width of text for an ancestor (parent) name
  var maxWide = 0;      //maximum width needed for any of the ancestor names in this set
  //console.log('in drawLedgend')
  grd.sCtx.font = "14px Arial";
  //find out how much space is needed
  for (ii = 0; ii < parents.name.length; ii++) {
    txtWide = grd.sCtx.measureText(parents.name[ii]).width;
    if (txtWide > maxWide) {
      maxWide = txtWide
    }
  }
  legendCols = Math.floor((grd.CanvasScale.width - leftPad) / (maxWide + colorWide + legendPad));  //was trunc
  if (Math.floor(parents.name.length / legendCols) == parents.name.length / legendCols) {          //was trunc
    legendRows = Math.floor(parents.name.length / legendCols);
  }
  else {
    legendRows = Math.floor(parents.name.length / legendCols) + 1;    //was trunc
  }
  //set canvas height based on space needed
  grd.CanvasScale.height = RowHt * legendRows;
  grd.sCtx.fillStyle = dictColor["ltGrey"];
  grd.sCtx.fillRect(0, 0, grd.CanvasScale.width, grd.CanvasScale.height);
  var colWide = (grd.CanvasScale.width - leftPad) / legendCols
  var col = 0;
  var row = 0;
  for (ii = 0; ii < parents.name.length; ii++) {
    col = ii % legendCols;
    row = Math.floor(ii / legendCols);    //was trunc
    //xx = leftPad + col*(maxWide+colorWide+legendPad);
    xx = leftPad + col * (colWide);
    yy = 2 + row * RowHt;
    grd.sCtx.fillStyle = parents.color[ii];
    grd.sCtx.fillRect(xx, yy, colorWide, colorWide);
    yy = textOffset + row * RowHt;
    grd.sCtx.font = "14px Arial";
    grd.sCtx.fillStyle = 'black';
    grd.sCtx.fillText(parents.name[ii], xx + colorWide + legendPad / 2, yy);
  }
}

function GradientScale(grd) {
  grd.CanvasScale.height = 30;
  grd.sCtx.fillStyle = dictColor["ltGrey"];
  grd.sCtx.fillRect(0, 0, grd.CanvasScale.width, grd.CanvasScale.height);
  var xStart = 15;
  var xEnd = grd.CanvasScale.width - 2.5 * xStart;
  var gradWidth = xEnd - xStart
  var grad = grd.sCtx.createLinearGradient(xStart + 2, 0, xEnd - 2, 0)
  var legendHt = 15;
  switch (grd.colorMap) {
    case "Viridis":
      grd.cmap = Viridis_cmap;
      break;
    case 'Gnuplot2':
      grd.cmap = Gnuplot2_cmap;
      break;
    case 'Cubehelix':
      grd.cmap = Cubehelix_cmap;
  }
  for (var ii = 0; ii < grd.cmap.length; ii++) {
    grad.addColorStop(ii / (grd.cmap.length - 1), grd.cmap[ii]);
  }
  grd.sCtx.fillStyle = grad;
  grd.sCtx.fillRect(xStart, legendHt, gradWidth, grd.CanvasScale.height - legendHt);
  //Draw Values if run started
  if (!grd.newrun) {
    //if (true) {  grd.fillmax = 805040;
    grd.sCtx.font = "14px Arial";
    grd.sCtx.fillStyle = "#000";
    var maxTxtWd = gradWidth / 5;
    var place = 2;
    var xx = 0;
    var marks = 4;
    var txt = "";
    if (grd.fillmax > 1000) {
      place = 0
    }
    else if (grd.fillmax > 100) {
      place = 1
    }
    for (var ii = 0; ii <= marks; ii++) {
      xx = ii * grd.fillmax / marks;
      txt = xx.formatNum(place);  //2 in this case is number of decimal places
      txtW = grd.sCtx.measureText(txt).width;
      xx = xStart + ii * gradWidth / marks - txtW / 2;
      grd.sCtx.fillText(txt, xx, legendHt - 2, maxTxtWd);
    }
  }
  //part of colorTest, delete later
  /*  grd.sCtx.beginPath();
   grd.sCtx.strokeStyle = '#00FF00';
   grd.sCtx.moveTo(xStart, legendHt);
   grd.sCtx.lineTo(xStart + gradWidth, legendHt);
   grd.sCtx.stroke();
   grd.sCtx.beginPath();
   grd.sCtx.strokeStyle = '#44FFFF';
   grd.sCtx.moveTo(xStart, grd.CanvasScale.height - 1);
   grd.sCtx.lineTo(xStart + gradWidth, grd.CanvasScale.height - 1);
   grd.sCtx.stroke();
   console.log('Take out after color test');
   */
}

var cellFilled = function (AvNdx, ii, parents) {
  var flag = false;
  //console.log('cellFilled', AvNdx, parents.AvidaNdx)
  for (var jj = 0; jj < parents.name.length; jj++) {
    if (parents.handNdx[ii] != jj) {
      if (AvNdx == parents.AvidaNdx[jj]) {
        flag = true;
        return flag;
        break;
      }
    }
  }
  return flag;
}
