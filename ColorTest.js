// Test of colors to see if a color blind person can tell the colors apart.

//Clear chips
function clearChips() {
    chips = {};
    chips.name = [];
    chips.genome = [];
    chips.color = [];
    chips.col = [];
    chips.row = [];
    chips.AvidaNdx = [];
    chips.autoNdx = [];
    chips.handNdx = [];
    chips.howPlaced = [];
    chips.domId = [];
}

function backgroundBoard() {
    var boxColor = '#111';
    for (ii=0; ii<chck.cols; ii++) {
        xx = chck.marginX + chck.xOffset + ii*chck.cellWd;
        for (jj=0; jj<chck.rows; jj++) {
            yy = chck.marginY + chck.yOffset + jj*chck.cellHt;
            //boxColor = get_color0(Viridis_cmap, Math.random(), 0, 1);
            //boxColor = get_color0(Viridis_cmap, 0.5, 0, 1);
            //console.log('color=', boxColor);
            ctxt.fillStyle = '#222';
            ctxt.fillRect(xx, yy, chck.cellWd-1, chck.cellHt-1);
        }
    }
}

//Draw Cell outline or including special case for Selected
function drawSelected() {
    chck.selectX = chck.marginX + chck.xOffset + chck.ColSelected * chck.cellWd;
    chck.selectY = chck.marginY + chck.yOffset + chck.RowSelected * chck.cellHt;
    drawCellOutline(2, '#00ff00', chck.selectX, chck.selectY, chck.cellWd, chck.cellHt)
}

function drawCellOutline(lineThickness, color, xx, yy, wide, tall) {
    ctxt.rect(xx, yy, wide, tall);
    ctxt.strokeStyle = color;
    ctxt.lineWidth = lineThickness;
    ctxt.stroke();
}

function drawChip() {
    //console.log('chips.col.length, marginX, xOffset', chips.col.length, chck.marginX, chck.xOffset);
    for (ii = 0; ii < chips.col.length; ii++) {
        xx = chck.marginX + chck.xOffset + chips.col[ii]*chck.cellWd;
        yy = chck.marginY + chck.yOffset + chips.row[ii]*chck.cellHt;
        if ("Ancestor Organism" == dijit.byId("colorMode").value) { ctxt.fillStyle = chips.color[ii];}
        else { ctxt.fillStyle = '#eee'}
        ctxt.fillRect(xx, yy, chck.cellWd-1, chck.cellHt-1);
        //console.log('x, y, wd, Ht', xx, yy, chck.cellWd, chck.cellHt);
    }
};

function drawCheckerSetup(CanvasChipScale) {
    //Get the size of the div that holds the grid and the scale or legend
    var CheckHolderHt = $("#demoHolder").innerHeight();

    //Determine if a color gradient or legend will be displayed
    if ("Ancestor Organism" == dijit.byId("colorMode").value) { drawCheckLegend(CanvasChipScale) }
    else { gradientCheckScale(CanvasChipScale) }

    //find the height for the div that holds the grid Canvas
    var ChckNodeHt = CheckHolderHt - 16 - $("#scaleDemo").innerHeight();
    document.getElementById("gridBoxNode").style.height = ChckNodeHt+'px';
    document.getElementById("gridBoxNode").style.overflowY = "scroll";
    //console.log('ChckNodeHt=',ChckNodeHt);

    // When zoom = 1x, set canvas size based on space available and cell size
    // based on rows and columns requested by the user. Zoom acts as a factor 
    // to multiply the size of each cell. When the size of the grid become larger
    // than the canvas, then the canvas is set to the size of the grid and the 
    // offset in that direction goes to zero.

    //find the space available to display the grid in pixels
    chck.spaceX = $("#demoHolder").innerWidth()-6;
    chck.spaceY = ChckNodeHt-5;
    //console.log('spaceY', chck.spaceY, '; gdHolder', CheckHolderHt, '; scaleCanv', $("#scaleDemo").innerHeight());
    // First find sizes based on zoom 
    chck.boxX = chck.zoom * chck.spaceX;
    chck.boxY = chck.zoom * chck.spaceY;
    //get rows and cols based on user input form
    chck.cols = dijit.byId("sizeCols").get('value');
    chck.rows = dijit.byId("sizeRows").get('value');
    //max size of box based on width or height based on ratio of cols:rows and width:height
    if (chck.spaceX/chck.spaceY > chck.cols/chck.rows) {
        //set based  on height as that is the limiting factor. 
        chck.sizeY = chck.boxY;
        chck.sizeX = chck.sizeY*chck.cols/chck.rows;
        chck.spaceCellWd = chck.spaceY/chck.rows;
        chck.spaceCells = chck.rows;  //rows exactly fit the space when zoom = 1x
    }
    else {
        //set based on width as that is the limiting direction
        chck.sizeX = chck.boxX;
        chck.sizeY = chck.sizeX * chck.rows/chck.cols;
        chck.spaceCellWd = chck.spaceX/chck.cols;
        chck.spaceCells = chck.cols;  //cols exactly fit the space when zoom = 1x
    }

    //Determine offset and size of canvas based on grid size relative to space size in that direction
    if (chck.sizeX < chck.spaceX) {
        CanvasCheck.width = chck.spaceX;
        chck.xOffset =(chck.spaceX-chck.sizeX)/2;
    }
    else {
        CanvasCheck.width = chck.sizeX;
        chck.xOffset = 0;
    }
    if (chck.sizeY < chck.spaceY) {
        CanvasCheck.height = chck.spaceY;
        chck.yOffset =(chck.spaceY-chck.sizeY)/2;
    }
    else {
        CanvasCheck.height = chck.sizeY;
        chck.yOffset = 0;
    }
    //console.log('Xsize', chck.sizeX, '; Ysize', chck.sizeY, '; zoom=', chck.zoom);

    //get cell size based on grid size and number of columns and rows
    chck.marginX = 1;  //width of black line between the cells
    chck.marginY = 1;  //width of black line between the cells
    chck.cellWd = ((chck.sizeX-chck.marginX)/chck.cols);
    chck.cellHt = ((chck.sizeY-chck.marginY)/chck.rows);

    //Find a reasonable maximum zoom for this grid and screen space
    zMaxCells = Math.trunc(chck.spaceCells/25);  // at least 10 cells
    zMaxWide = Math.trunc(10/chck.spaceCellWd);  // at least 10 pixels
    zMax = ((zMaxCells > zMaxWide) ? zMaxCells: zMaxWide); //Max of two methods 
    zMax = ((zMax > 2) ? zMax: 2); //max zoom power of at least 2x

    ZoomSlide.set("maximum", zMax);
    ZoomSlide.set("discreteValues", 2*(zMax-1)+1);
    //console.log("Cells, pixels, zMax, zoom", zMaxCells, zMaxWide, zMax, chck.zoom);

    DrawCheckBackground();
    //Check to see if run has started
    //if (newrun) { drawChip();}
    if (true) { drawChip();}
    else { // running so draw grid data from Avida
    }
    //Draw Selected as one of the last items to draw
    if (chck.flagSelected) { drawSelected() };
}

function DrawCheckBackground() {
    // Use the identity matrix while clearing the canvas    http://stackoverflow.com/questions/2142535/how-to-clear-the-canvas-for-redrawing
    ctxt.setTransform(1, 0, 0, 1, 0, 0);
    ctxt.clearRect(0, 0, CanvasCheck.width, CanvasCheck.height); //to clear canvas see http://stackoverflow.com/questions/2142535/how-to-clear-the-canvas-for-redrawing
    //draw grey rectangle as back ground
    ctxt.fillStyle = dictColor["ltGrey"];
    ctxt.fillRect(0,0, CanvasCheck.width, CanvasCheck.height);

    //ctxt.translate(chck.xOffset, chck.yOffset);
    ctxt.fillStyle=dictColor['Black'];
    ctxt.fillRect(chck.xOffset,chck.yOffset,chck.sizeX,chck.sizeY);

    backgroundBoard();
    //Draw chips if run has not started. 
}

//--------------- Draw legend --------------------------------------
//Draws the color and name of each Ancestor (parent) organism 
//to lay out the legend we need the width of the longest name and we
//allow for the width of the color box to see how many columns fit across
//the width of CanvasChipScale. We will need to increase the size of the 
//legend box by the height of a line for each additional line.
function drawCheckLegend(CanvasChipScale) {
    var legendPad = 10;   //padding on left so it is not right at edge of canvas
    var colorWide = 13;   //width and heigth of color square
    var RowHt = 20;       //height of each row of text
    var textOffset = 15;  //vertical offset to get to the bottom of the text
    var leftPad = 10;     //padding to allow space between each column of text in the legend
    var legendCols = 1;   //max number of columns based on width of canvas and longest name
    var txtWide = 0;      //width of text for an ancestor (parent) name
    var maxWide = 0;      //maximum width needed for any of the ancestor names in this set
    //console.log('in drawLedgend')
    CanvasChipScale.width = $("#demoHolder").innerWidth()-6;
    ctxSc.font = "14px Arial";
    //find out how much space is needed
    for (ii=0; ii< chips.name.length; ii++) {
        txtWide = ctxSc.measureText(chips.name[ii]).width;
        if (txtWide > maxWide) { maxWide = txtWide }
    }
    legendCols = Math.trunc((CanvasChipScale.width-leftPad)/(maxWide + colorWide + legendPad));
    if (Math.trunc(chips.name.length/legendCols) == chips.name.length/legendCols) {
        legendRows = Math.trunc(chips.name.length/legendCols);
    }
    else { legendRows = Math.trunc(chips.name.length/legendCols)+1; }
    //set canvas height based on space needed
    CanvasChipScale.height = RowHt * legendRows;
    ctxSc.fillStyle = dictColor["ltGrey"];
    ctxSc.fillRect(0,0, CanvasCheck.width, CanvasCheck.height);
    var colWide = (CanvasChipScale.width-leftPad)/legendCols
    var col = 0;
    var row = 0;
    for (ii = 0; ii< chips.name.length; ii++) {
        col = ii%legendCols;
        row = Math.trunc(ii/legendCols);
        //xx = leftPad + col*(maxWide+colorWide+legendPad);
        xx = leftPad + col*(colWide);
        yy = 2+row*RowHt;
        ctxSc.fillStyle = chips.color[ii];
        ctxSc.fillRect(xx,yy, colorWide, colorWide);
        yy = textOffset+row*RowHt;
        ctxSc.font = "14px Arial";
        ctxSc.fillStyle='black';
        ctxSc.fillText(chips.name[ii],xx+colorWide+legendPad/2, yy);
    }
}

//needs numbers from Avida
function gradientCheckScale(CanvasChipScale) {
    CanvasChipScale.width = $("#demoHolder").innerWidth()-6;
    CanvasChipScale.height = 30;
    ctxSc.fillStyle = dictColor["ltGrey"];
    ctxSc.fillRect(0,0, CanvasChipScale.width, CanvasChipScale.height);
    var xStart = 30;
    var xEnd = CanvasChipScale.width - xStart;
    var gradWidth = xEnd-xStart
    var grad = ctxSc.createLinearGradient(xStart+2, 0, xEnd-2, 0)
    var legendHt = 15;
    switch(chck.colorMap) {
        case "Viridis":
            for (var ii=0; ii < Viridis_cmap.length; ii++) {
                grad.addColorStop(ii/(Viridis_cmap.length-1), Viridis_cmap[ii]);
            }
            break;
        case 'Gnuplot2':
            for (var ii=0; ii < Gnuplot2_cmap.length; ii++) {
                grad.addColorStop(ii/(Gnuplot2_cmap.length-1), Gnuplot2_cmap[ii]);
            }
            break;
        case 'Cubehelix':
            for (var ii=0; ii < Cubehelix_cmap.length; ii++) {
                grad.addColorStop(ii/(Cubehelix_cmap.length-1), Cubehelix_cmap[ii]);
            }
            break;
    }
    ctxSc.fillStyle = grad;
    ctxSc.fillRect(xStart, legendHt, gradWidth, CanvasChipScale.height-legendHt);
}
    
