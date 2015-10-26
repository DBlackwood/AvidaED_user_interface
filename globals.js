//Debug flags
var debug = {};
debug.root = false;  //statemens that look for failiers when the code executes outside of functions
debug.logic = false;  //debug statements that look for errors outlining logic functions
debug.mouse = false;   //debug statements about non-dojo drag and drop
debug.dnd = false;     //debu statements about dojo dnd
debug.msg = false;     //messages to and from avida
debug.trace = true;   //organism page
debug.grid = false;     //population grid
debug.msgOrder = false; //message order

//default values - these may be overwritten by those in a file once we get the file system working.
dft = {};
dft.sizeCols = 60;
dft.sizeRows = 60;
dft.muteInput = 2;
dft.child = 'childParentRadio';  //alternate = childRandomRadio
dft.nearParent = true;
dft.notose = true;
dft.nanose = true;
dft.andose = true;
dft.ornose = true;
dft.orose = true;
dft.andnose = true;
dft.norose = true;
dft.xorose = true;
dft.equose = true;
dft.repeat = 'experimentRadio';   //alternate = 'demoRadio'
dft.pauseType = 'manRadio';     //alternate = 'updateRadio'
dft.updateSpinner = 1000;

var mouse = {};
clearMouse();

function clearMouse() {
  mouse.Dn = false;
  mouse.DnGridPos = [];
  mouse.UpGridPos = [];
  mouse.DnOrganPos = [];
  mouse.Move = false;
  mouse.Drag = false;
  mouse.ParentNdx = -1;
  mouse.ParentSelected = false;
  mouse.Picked = "";
}

//initialize globals needed to hold Organism Trace Data
var traceObj; //global that holds the traceObject that was sent from Avida

//initialize gen (genome) object.
var gen = {};

var grd = {};         //data about the grid canvas
clearGrd();
grd.popStatFlag = true;

function clearGrd() {
  grd.newrun = true;
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
  grd.ave_fitness = [];
  grd.log_fitness = [];
  grd.ave_gestation_time = [];
  grd.log_gestation_time = [];
  grd.ave_metabolic_rate = [];
  grd.log_metabolic_rate = [];
  grd.population_size = [];
  grd.log_pop_size = [];
  grd.allOff = true;
}

//***************************************
// Defaults and Constants

