//***************************************
// Defaults and Constants
// one global to hold them all.

var av = {};
//av.debug flags
av.debug = {};
av.debug.root = false;  //statements that look for failiers when the code executes outside of functions
av.debug.logic = false;  //av.debug statements that look for errors outlining logic functions
av.debug.mouse = false;   //av.debug statements about non-dojo drag and drop
av.debug.dnd = true;     //debu statements about dojo dnd
av.debug.msg = false;     //messages to and from avida
av.debug.trace = false;   //organism page
av.debug.grid = false;     //population grid
av.debug.msgOrder = false; //message order
av.debug.pdb = false; //pouchDB
av.debug.fio = false; // file io
av.debug.gen = false; //oranism page

//structure to hold list of ancestor organisms
av.parents = {};

//Clear parents/Ancestors
var clearParents = function(parents) {
  parents = {};
  parents.name = [];
  parents.genome = [];
  parents.color = [];
  parents.col = [];
  parents.row = [];
  parents.AvidaNdx = [];
  parents.autoNdx = [];
  parents.handNdx = [];
  parents.howPlaced = [];
  parents.domid = [];  //need domID of entry in ancestorBox so that it can be removed from ancestor box when square on grid is dragged from box
  parents.Colors = ColorBlind.slice();
  parents.Colors.reverse();  //needed for the stack to have the "easy to see" colors on top
  return parents;
};

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

//initialize gen (genome) object.
av.gen = {};

av.grd = {};         //data about the grid canvas
av.grd.popStatFlag = true;  //flag that determines if the stats panel is visible.

function clearGrd(grd) {
  grd.newrun = true;
  grd.updateNum = 0;
  grd.cols = 0;    //Number of columns in the grid
  grd.rows = 0;    //Number of rows in the grid
  grd.sizeX = 0;  //size of canvas in pixels
  grd.sizeY = 0;  //size of canvas in pixels
  grd.boxX = 0;   //size based zoom
  grd.boxY = 0;   //size based zoom
  grd.flagSelected = false; //is a cell selected
  grd.zoom = 1;     //magnification for zooming.
  //structure for colors in the grid
  grd.fill = [];  //deals with color to fill a grid cell
  grd.out = [];   // deals with the color of the grid outline
  grd.fillmax = 0;    // max value for grid scale for the gradient color
  grd.msg = {};
  grd.mxFit = 0.4;   //store maximum fitness during an experiment
  grd.mxGest = 400;  //store maximum gestation time during an experiment
  grd.mxRate = 40;  //store maximum metabolic rate during an experiment
  grd.rescaleTolerance = 0.1;
  grd.rescaleTimeConstant = 10;
  grd.SelectedColor = '#ffffff';
  grd.LogicColor = '#00ff00';
  grd.kidStatus = '';
  grd.ave_fitness = [];  //ave is for all avidians.
  grd.log_fitness = [];  //log is for avidians that performm logic functions
  grd.ave_gestation_time = [];
  grd.log_gestation_time = [];
  grd.ave_metabolic_rate = [];
  grd.log_metabolic_rate = [];
  grd.population_size = [];
  grd.log_pop_size = [];
  grd.allOff = true;
  grd.marginX = 1;  //width of black line between the cells
  grd.marginY = 1;  //width of black line between the cells

  grd.legendPad = 10;   //padding on left so it is not right at edge of canvas
  grd.colorWide = 13;   //width and heigth of color square
  grd.RowHt = 20;       //height of each row of text
  grd.leftpad = 10;     //padding to allow space between each column of text in the legend
}
clearGrd(av.grd);

//http://stackoverflow.com/questions/4565112/javascript-how-to-find-out-if-the-user-browser-is-chrome
// please note,
// that IE11 now returns undefined again for window.chrome
// and new Opera 30 outputs true for window.chrome
// and new IE Edge outputs to true now for window.chrome
// so use the below updated condition

var brs = {};  //browser and operating system data

brs.isChromium = window.chrome;
  brs.vendorName = window.navigator.vendor;
  brs.isOpera = window.navigator.userAgent.indexOf("OPR") > -1;
  brs.isIEedge = window.navigator.userAgent.indexOf("Edge") > -1;
if (brs.isChromium !== null && brs.isChromium !== undefined && brs.vendorName === "Google Inc." && brs.isOpera === false && brs.isIEedge === false) {
  brs.chrome = true;
} else {
  brs.chrome = false; // not Google chrome
}

av.fio = {}; //file input output data
av.fio.dbName = 'wsdb';  //for workspace database
av.fio.wsdb = null;
av.fio.defaultFname = 'default_1.avidaedworkspace.zip';
av.fio.uiWorker = null;
av.fio.fileReadingDone = false;

av.dnd = {};
av.fzr = {};
av.fzr.dir = {};
av.fzr.domid = {};
av.fzr.file = {};

av.fzr.cNum = 0;  //value of the next configured dish (config) number
av.fzr.gNum = 0;  //value of the next organism (genome) number
av.fzr.wNum = 0;  //value of the next world (populated dish) number
av.fzr.config = [];
av.fzr.genome = [];
av.fzr.world = [];
//hold genome for active organism in Organism View
av.fzr.actOrgan =  {'name': "", 'domId': "", 'genome': "" };
//hold genome for active organism in Organism View
av.fzr.actConfig = {'name': "", 'domId': "", 'type': '' };

/* Fzr - Freezer.

 av.fzr.dir.dojoUnique14 = 'g0';
 av.fzr.dir.dojoUnique15 = 'g1';
 av.fzr.dir.dojoUnique16 = 'g4';
 av.fzr.domid.c0 = 'dojoUnique4';
 av.fzr.domid.c1 = 'dojoUnique5';
 av.fzr.domid.c2 = 'dojoUnique6';
 av.fzr.file['c0/avida.cfg'] = 'text1';
 av.fzr.file['c0/environment.cfg'] = 'text2';
 av.fzr.file['c0/entryname.txt'] = 'text3';


 var gennomelist = invertHash(av.fzr.dir);
 console.log('genomelist', gennomelist);

 var dirlist = invertHash(av.fzr.domid);
 console.log('dirlist', dirlist)


 older version below:
av.fzr.g.name
av.fzr.g.fileNum
av.fzr.g._id - PouchDB ID
av.fzr.g.domId
av.fzr.g.genome
av.fzr.c - configued dish
av.fzr.w - world (populated dish)

domID <--> c6

av.fzr.c.c0.domID

av.fzr.c['c0/avida.cfg']

var ex = {};
var inv = {};
ex['c0'] = 'dojoUnique4';
ex.c0 = 'dojoUnique4';
inv['dojoUnique4'] = 'c0';

 av.fzr.c0['avida.cfg'] = text;

*/
