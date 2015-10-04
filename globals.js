
//hold genome for current organism in Organism View
var chosen = {
  'name': "",
  'domId': "",
  'genome': ""
}

//structure to hole list of ancestor organisms
var parents = {};
clearParents();

//Clear parents/Ancestors
function clearParents() {
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
  parents.domId = [];
}

var newrun = true;
var ave_fitness = [];
var ave_gestation_time = [];
var ave_metabolic_rate = [];
var population_size = [];

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

function clearGrd() {
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
  grd.mxFit = 0.1;   //store maximum fitness during an experiment
  grd.mxGest = 0.1;  //store maximum gestation time during an experiment
  grd.mxRate = 0.1;  //store maximum metabolic rate during an experiment
  grd.SelectedColor = '#ffffff';
  grd.LogicColor = '#00ff00';
  grd.kidStatus = '';
}

//***************************************
// Defaults and Constants

