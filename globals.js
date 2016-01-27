//***************************************
// Defaults and Constants
// one global to hold them all.

//http://stackoverflow.com/questions/5150124/splitting-a-javascript-namespace-into-multiple-files
var av = av || {};  //incase av already exists
//av.debug flags
av.debug = {};
av.debug.root = false;  //statements that look for failiers when the code executes outside of functions
av.debug.logic = false;  //av.debug statements that look for errors outlining logic functions
av.debug.mouse = true;   //av.debug statements about non-dojo drag and drop
av.debug.dnd = false;     //debu statements about dojo dnd
av.debug.msg = false;     //messages to and from avida
av.debug.trace = false;   //organism page
av.debug.grid = false;     //population grid
av.debug.msgOrder = false; //message order
av.debug.pdb = false; //pouchDB
av.debug.fio = false; // file io
av.debug.ind = false; //oranism page

av.debug.log = 'message and error log';

//default values - these are not in use; the values now come from the file system
av.dft = {};
av.dft.sizeCols = 60;
av.dft.sizeRows = 60;
av.dft.muteInput = 2;   //percent
av.dft.child = 'childParentRadio';  //alternate = childRandomRadio
av.dft.nearParent = true;
av.dft.notose = true;
av.dft.nanose = true;
av.dft.andose = true;
av.dft.ornose = true;
av.dft.orose = true;
av.dft.andnose = true;
av.dft.norose = true;
av.dft.xorose = true;
av.dft.equose = true;
av.dft.repeat = 'experimentRadio';   //alternate = 'demoRadio'
av.dft.pauseType = 'manRadio';     //alternate = 'updateRadio'
av.dft.updateSpinner = 1000;

av.mouse = {};

function clearmouse(av) {
  'use strict';
  av.mouse.Dn = false;
  av.mouse.DnGridPos = [];
  av.mouse.UpGridPos = [];
  av.mouse.DnOrganPos = [];
  av.mouse.Move = false;
  av.mouse.Drag = false;
  av.mouse.ParentNdx = -1;
  av.mouse.ParentSelected = false;
  av.mouse.Picked = "";
}
clearmouse(av);

//initialize globals needed to hold Organism Trace Data
var traceObj = {}; //global that holds the traceObject that was sent from Avida

//initialize gen (genome) object. Used in organism view
av.ind = {};

av.grd = {};         //data about the grid canvas
av.grd.popStatFlag = true;  //flag that determines if the stats panel is visible.
// initialize data for chart on population page
av.grd.popY = [];
av.grd.popY2 = [];
av.grd.ytitle = 'Average Fitness';

av.grd.clearGrd = function () {
  av.grd.runState = 'prepping';  //'started'; 'world';
  av.grd.updateNum = 0;
  av.grd.selectedNdx = -1;
  av.grd.cols = 0;    //Number of columns in the grid
  av.grd.rows = 0;    //Number of rows in the grid
  av.grd.sizeX = 0;  //size of canvas in pixels
  av.grd.sizeY = 0;  //size of canvas in pixels
  av.grd.boxX = 0;   //size based zoom
  av.grd.boxY = 0;   //size based zoom
  av.grd.flagSelected = false; //is a cell selected
  av.grd.zoom = 1;     //magnification for zooming.
  //structure for colors in the grid
  av.grd.fill = [];  //deals with color to fill a grid cell
  av.grd.out = [];   // deals with the color of the grid outline
  av.grd.fillmax = 0;    // max value for grid scale for the gradient color
  av.grd.msg = {};
  av.grd.mxFit = 0.4;   //store maximum fitness during an experiment
  av.grd.mxGest = 400;  //store maximum gestation time during an experiment
  av.grd.mxRate = 40;  //store maximum metabolic rate during an experiment
  av.grd.rescaleTolerance = 0.1;
  av.grd.rescaleTimeConstant = 10;
  av.grd.SelectedColor = '#ffffff';
  av.grd.LogicColor = '#00ff00';
  av.grd.kidStatus = '';
  av.grd.ave_fitness = [];  //ave is for all avidians.
  av.grd.log_fitness = [];  //log is for avidians that performm logic functions
  av.grd.ave_gestation_time = [];
  av.grd.log_gestation_time = [];
  av.grd.ave_metabolic_rate = [];
  av.grd.log_metabolic_rate = [];
  av.grd.population_size = [];
  av.grd.log_pop_size = [];
  av.grd.allOff = true;
  av.grd.marginX = 1;  //width of black line between the cells
  av.grd.marginY = 1;  //width of black line between the cells

  av.grd.legendPad = 10;   //padding on left so it is not right at edge of canvas
  av.grd.colorWide = 13;   //width and heigth of color square
  av.grd.RowHt = 20;       //height of each row of text
  av.grd.leftpad = 10;     //padding to allow space between each column of text in the legend
}
av.grd.clearGrd();

av.pop = {} // on population page that are not part of the grid.

//http://stackoverflow.com/questions/4565112/javascript-how-to-find-out-if-the-user-browser-is-chrome
// please note,
// that IE11 now returns undefined again for window.chrome
// and new Opera 30 outputs true for window.chrome
// and new IE Edge outputs to true now for window.chrome
// so use the below updated condition

av.ui = {};  //user interface functions and variables
av.ui.page = 'population';
av.ui.subpage = 'map';

av.brs = {};  //browser and operating system data

av.brs.isChromium = window.chrome;
  av.brs.vendorName = window.navigator.vendor;
  av.brs.isOpera = window.navigator.userAgent.indexOf("OPR") > -1;
  av.brs.isIEedge = window.navigator.userAgent.indexOf("Edge") > -1;
if (av.brs.isChromium !== null && av.brs.isChromium !== undefined && av.brs.vendorName === "Google Inc." && av.brs.isOpera === false && av.brs.isIEedge === false) {
  av.brs.chrome = true;
} else {
  av.brs.chrome = false; // not Google chrome
}

av.utl = {};  // holds utility functions

av.msg = {}; //holds functions to send messages between the ui and Avida (web worker)

av.fio = {}; //file input output data
av.fio.dbName = 'wsdb';  //for workspace database
av.fio.wsdb = null;
av.fio.defaultFname = 'default_Web.avidaedworkspace.zip';
av.fio.defaultFname = 'default.avidaedworkspace.zip';
av.fio.uiWorker = null;
av.fio.fileReadingDone = false;
av.fio.defaultUserFname = 'avidaWS.avidaedworkspace.zip';
av.fio.userFname = av.fio.defaultUserFname;
av.fio.useDefault = true;

av.dnd = {};  //details in AvidiaEd.js as it access the DOM

//structure to hold list of ancestor organisms
av.parents = {};
//Clear parents/Ancestors
av.parents.clearParentsFn = function () {
  av.parents.name = [];
  av.parents.genome = [];
  av.parents.color = [];
  av.parents.col = [];
  av.parents.row = [];
  av.parents.AvidaNdx = [];
  av.parents.autoNdx = [];
  av.parents.handNdx = [];
  av.parents.howPlaced = [];
  av.parents.domid = [];  //need domID of entry in ancestorBox so that it can be removed from ancestor box when square on grid is dragged from box
  av.parents.Colors = ColorBlind.slice();
  av.parents.Colors.reverse();  //needed for the stack to have the "easy to see" colors on top
  return av.parents;
};
//console.log('after clearParents', av.parents.clearParentsFn);

av.fzr = {};

av.fzr.clearFzrFn = function () {
  'use strict';
  av.fzr.dir = {};
  av.fzr.domid = {};
  av.fzr.file = {};

  av.fzr.cNum = 0;  //value of the next configured dish (config) number
  av.fzr.gNum = 0;  //value of the next organism (genome) number
  av.fzr.wNum = 0;  //value of the next world (populated dish) number
  //hold genome for active organism in Organism View
  av.fzr.actOrgan = {'name': '', 'actDomid': '', 'fzDomid': '', 'genome': ''};
  //hold genome for active organism in Organism View
  av.fzr.actConfig = {'name': '', 'actDomid': '', 'fzDomid': '', 'type': '', 'dir': ''};
  av.fzr.pop1 = {};
  av.fzr.pop1.fit = [];
  av.fzr.pop1.ges = [];
  av.fzr.pop1.met = [];
  av.fzr.pop1.num = [];

  av.fzr.pop = [];
  for (var ii=0; ii<3; ii++) {
    av.fzr.pop[ii] = {};
    av.fzr.pop[ii].fit = [];
    av.fzr.pop[ii].ges = [];
    av.fzr.pop[ii].met = [];
    av.fzr.pop[ii].num = [];
  }
  av.fzr.saved = true;
};

av.fzr.clearMainFzrFn = function () {
  'use strict';
  av.fzr.dir = {};
  av.fzr.domid = {};
  av.fzr.file = {};

  av.fzr.cNum = 0;  //value of the next configured dish (config) number
  av.fzr.gNum = 0;  //value of the next organism (genome) number
  av.fzr.wNum = 0;  //value of the next world (populated dish) number
  av.fzr.saved = true;
};

av.anl = {};  //Analysis page functions and data
av.anl.color = [];   //holds the three colors for the three populations
av.anl.pop = [];
for (var ii=0; ii<3; ii++) {
  av.anl.pop[ii] = {};
  av.anl.pop[ii].left = [];
  av.anl.pop[ii].right = [];
}

console.log('end of globals');
