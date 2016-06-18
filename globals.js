//***************************************
// Defaults and Constants
// one global to hold them all.

//http://stackoverflow.com/questions/5150124/splitting-a-javascript-namespace-into-multiple-files
var av = av || {};  //incase av already exists
//av.debug flags
av.debug = {};
av.debug.root = false;  //statements that look for failiers when the code executes outside of functions
av.debug.logic = false;  //av.debug statements that look for errors outlining logic functions
av.debug.mouse = false;   //av.debug statements about non-dojo drag and drop
av.debug.dnd = false;     //debu statements about dojo dnd
av.debug.msg = false;     //messages to and from avida
av.debug.trace = false;   //organism page
av.debug.grid = false;     //population grid
av.debug.msgOrder = false; //message order
av.debug.pdb = false; //pouchDB
av.debug.fio = false; // file io
av.debug.ind = false; //oranism page
av.debug.anl = false; //analysis page
av.debug.userMsg  = false; //Show avida messages on screen

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
av.dft.pauseType = 'manualUpdateRadio';     //alternate = 'autoUpdateRadio'
av.dft.autoUpdateSpinner = 1000;

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

//list of dom elements on the Populsation page that need to have the mouse over shape/style changed for the drag n drop to look right
av.mouse.notDndPopList = ['colorMode'
  , 'leftCP'
  , 'leftCP_splitter'
  , 'mainBC'
  , 'mapBC'
  , 'mapBlock'
  , 'popBC'
  , 'popBot_splitter'
  , 'popRight_splitter'
  , 'populationBlock'
  , 'scaleCanvas'
  , 'popTopRight_splitter'
  , 'sotPane_splitter'
  , 'trashCP'
  , 'trashCP_splitter'
  , 'gridHolder'
  , 'freezerDiv'
  //menu Buttons
  , 'mnFile'
  , 'mnFreezer'
  , 'mnControl'
  , 'mnHelp'
  , 'mnDebug'
  , 'wsSavedMsg'
  //Buttons
  , 'mainButtons_splitter'
  , 'mainButtonBC'
  , 'mainButtons'
  , 'mainButtonTable'
  , 'PopSetupButton'
  , 'PopStatsButton'
  , 'populationButton'
  , 'organismButton'
  , 'analysisButton'
  , 'newDishButton'
  , 'runStopButton'
  , 'freezeButton'
  , 'rescaleLabel'
  , 'ZoomSlide'
  //statistics section
  , 'SotLabel'
  , 'nameLabel'
  , 'sotColor'
  , 'fitLabel'
  , 'metabolicLabel'
  , 'generateLabel'
  , 'ageLabel'
  , 'ancestorLabel'
  , 'viableLabel'
  , 'sotFn'
  , 'sotTimes'
  , 'notLabel'
  , 'nanLabel'
  , 'andLabel'
  , 'ornLabel'
  , 'oroLabel'
  , 'antLabel'
  , 'norLabel'
  , 'xorLabel'
  , 'equLabel'
  , 'notTime'
  , 'nanTime'
  , 'andTime'
  , 'ornTime'
  , 'oroTime'
  , 'antTime'
  , 'norTime'
  , 'xorTime'
  , 'equTime'
  , 'popStat'
  , 'popSizeLabel'
  , 'aFitLabel'
  , 'aMetabolicLabel'
  , 'aGestateLabel'
  , 'aAgeLabel'
  , 'psFn'
  , 'psNumOrg'
  , 'notButton'
  , 'nanButton'
  , 'andButton'
  , 'ornButton'
  , 'oroButton'
  , 'antButton'
  , 'norButton'
  , 'xorButton'
  , 'equButton'
  , 'notPop'
  , 'nanPop'
  , 'andPop'
  , 'ornPop'
  , 'oroPop'
  , 'antPop'
  , 'norPop'
  , 'xorPop'
  , 'equPop'
  // chart
  , 'yaxis'
  , 'yaxisLabel'
];
var lngth = av.mouse.notDndPopList.length;
av.mouse.notDndPopShape = [];
for (var ii = 0; ii < lngth; ii++) {
  av.mouse.notDndPopShape[ii] = 'default';
}

//Ind is for individual organism page
av.mouse.notDndIndList = ['colorMode'
  , 'leftCP_splitter'
  , 'mainBC'
  , 'mapBC'
  , 'mapBlock'
  , 'popBC'
  , 'popBot_splitter'
  , 'popRight_splitter'
  , 'rightDetail_splitter'
  , 'populationBlock'
  , 'scaleCanvas'
  , 'trashCP'
  , 'trashCP_splitter'
  , 'activeOrgan'
  , 'organismBC'
  , 'orgTop'
  , 'organismCanvasHolder'
  , 'organCanvas'
  // Stats
  , 'rightDetail'
  , 'notOrg'
  , 'nanOrg'
  , 'andOrg'
  , 'ornOrg'
  , 'oroOrg'
  , 'antOrg'
  , 'norOrg'
  , 'xorOrg'
  , 'equOrg'
  , 'notPerf'
  , 'nanPerf'
  , 'andPerf'
  , 'ornPerf'
  , 'oroPerf'
  , 'antPerf'
  , 'norPerf'
  , 'xorPerf'
  , 'equPerf'
  , 'buffer'
  , 'register'
  , 'Astack'
  , 'Bstack'
  , 'output'
  , 'InstructionDetail'
  , 'ExecuteJust'
  , 'ExecuteAbout'
  //Buttons
  , 'mainButtons_splitter'
  , 'populationButton'
  , 'organismButton'
  , 'analysisButton'
  , 'OrgSetting'
  , 'OrgDetailsButton'
  , 'cycleSlider'
  , 'orgCycle'
  , 'orgReset'
  , 'orgBack'
  , 'orgRun'
  , 'orgForward'
  , 'orgEnd'
];
var lngth = av.mouse.notDndIndList.length;
av.mouse.notDndIndShape = [];
for (var ii = 0; ii < lngth; ii++) {
  av.mouse.notDndIndShape[ii] = 'default';
}

//initialize globals needed to hold Organism Trace Data
var traceObj = {}; //global that holds the traceObject that was sent from Avida

//initialize gen (genome) object. Used in organism view
av.ind = {};
av.ind.cycle = 0;
av.ind.update_timer = null;

av.aww = {}; //avida web worker
av.dcn = {}; //diagnostic console

av.msg = {}; //holds functions to send messages between the ui and Avida (web worker)
av.msg.uiReqestedReset = false;

av.ptd = {};  // on population page that are not part of the grid. (PeTri Dish)
av.ptd.popStatFlag = true;  //flag that determines if the stats panel is visible.

av.grd = {};         //data about the grid canvas
av.grd.popStatsMsg = {}

// initialize data for chart on population page
av.grd.popY = [];
av.grd.popY2 = [];
av.grd.ytitle = 'Average Fitness';
av.grd.notInDrawingGrid = true;
av.grd.newlyNone = true;

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
  av.grd.mxFit = 0.8;   //store maximum fitness during an experiment
  av.grd.mxGest = 800;  //store maximum Generation Length during an experiment
  av.grd.mxRate = 80;  //store maximum metabolic rate during an experiment

  av.grd.mxFit = 0;   //store maximum fitness during an experiment
  av.grd.mxGest = 0;  //store maximum Generation Length during an experiment
  av.grd.mxRate = 0;  //store maximum metabolic rate during an experiment

  av.grd.rescaleTolerance = 0.1;
  av.grd.rescaleTimeConstant = 10;
  av.grd.SelectedColor = '#ffffff';
  av.grd.LogicColor = '#00ff00';
  av.grd.kidStatus = '';

  av.grd.legendPad = 10;   //padding on left so it is not right at edge of canvas
  av.grd.colorWide = 13;   //width and heigth of color square
  av.grd.RowHt = 20;       //height of each row of text
  av.grd.leftpad = 10;     //padding to allow space between each column of text in the legend
  av.grd.marginX = 1;  //width of black line between the cells
  av.grd.marginY = 1;  //width of black line between the cells

  av.grd.oldUpdate = -10;
  av.ptd.autoPauseUpdate = 1000;

  av.ptd.aveFit = [];  //ave is for all avidians.
  av.ptd.logFit = [];  //log is for avidians that performm logic functions
  av.ptd.aveGnl = [];  //generation length - used to be Generation Length
  av.ptd.logGnl = [];
  av.ptd.aveMet = [];
  av.ptd.logMet = [];
  av.ptd.aveNum = [];
  av.ptd.logNum = [];
  av.ptd.allOff = true;

  av.msg.ByCellIDgenome = '';        //Holdes the genome which is needed to freeze a cell.
  av.msg.previousUpdate = -10;
  av.grd.popStatsMsg.update = -5;
}
av.grd.clearGrd();

//http://stackoverflow.com/questions/4565112/javascript-how-to-find-out-if-the-user-browser-is-chrome
// please note,
// that IE11 now returns undefined again for window.chrome
// and new Opera 30 outputs true for window.chrome
// and new IE Edge outputs to true now for window.chrome
// so use the below updated condition

av.ui = {};  //user interface functions and variables
av.ui.version = '2016_0617';
av.debug.log = 'message and error log: version Beta Test ' + av.ui.version;

av.ui.page = 'populationBlock';
av.ui.subpage = 'map';
av.ui.autoStopFlag = false;
av.ui.autoStopValue = 987654321;
//used in adjusting size of areas on population page
av.ui.gridHolderSideBuffer = 0;
av.ui.pobBotWdMin = 430;


//not really ui, but not sure where to put them
av.ui.num = 0;   //tenporary holder for a number;
av.ui.numTxt = '';
av.msg.avidaReady = false;
av.ui.loadOK = false;
setTimeout(function () {
  if (!av.ui.loadOK) {alert('Avida-ED failed to load, please try re-loading');}
}, 121000);

//----------------------------------------------- finding the browser and opperating system ----------------------------
//http://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser
av.brs = {};  //browser and operating system data
av.brs.isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
// Firefox 1.0+
av.brs.isFirefox = typeof InstallTrigger !== 'undefined';
// At least Safari 3+: "[object HTMLElementConstructor]"
av.brs.isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
// Internet Explorer 6-11
av.brs.isIE = /*@cc_on!@*/false || !!document.documentMode;
// Edge 20+
av.brs.isEdge = !av.brs.isIE && !!window.StyleMedia;
// Chrome 1+
av.brs.isChrome = !!window.chrome && !!window.chrome.webstore;
// Blink engine detection
av.brs.isBlink = (av.brs.isChrome || av.brs.isOpera) && !!window.CSS;


//console.log('window.navigator',window.navigator);
if (av.debug.root) console.log('brs', av.brs);
if (av.debug.root) console.log('browser info:', av.brs.name, ': ', window.navigator.userAgent);

//----------------------------------------------------------------------------------------------------------------------

av.utl = {};  // holds utility functions

av.fwt = {}; // file data write
av.frd = {}; // file data read
av.fio = {}; //file input output data
av.fio.dbName = 'wsdb';  //for workspace database
//av.fio.wsdb = null;
av.fio.defaultFname = 'default_Web.avidaedworkspace.zip';
av.fio.defaultFname = 'default.avidaedworkspace.zip';
av.aww.uiWorker = null;
av.fio.fileReadingDone = false;
av.fio.defaultUserFname = 'avidaWS.avidaedworkspace.zip';
av.fio.userFname = av.fio.defaultUserFname;
av.fio.csvFileName = 'avidaDataRecorder.csv';
av.fio.useDefault = true;
av.fio.mailAddress = 'avida-ed-development@googlegroups.com';  //'mailto:diane.blackwood@gmail.com'

av.dnd = {};  //details in AvidiaEd.js as it access the DOM

//structure to hold list of ancestor organisms
av.parents = {};
//Clear parents/Ancestors
av.parents.clearParentsFn = function () {
  av.parents.name = [];
  av.parents.injected = [];   //Has it been injeccted?
  av.parents.genome = [];
  av.parents.color = [];
  av.parents.col = [];
  av.parents.row = [];
  av.parents.AvidaNdx = [];
  av.parents.autoNdx = [];
  av.parents.handNdx = [];
  av.parents.howPlaced = [];
  av.parents.domid = [];  //need domID of entry in ancestorBox so that it can be removed from ancestor box when square on grid is dragged from box
  av.parents.Colors = av.color.parentColorList.slice();
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
  av.fzr.item = {};

  av.fzr.cNum = 0;  //value of the next configured dish (config) number
  av.fzr.gNum = 0;  //value of the next organism (genome) number
  av.fzr.wNum = 0;  //value of the next world (populated dish) number
  //hold genome for active organism in Organism View
  av.fzr.actOrgan = {'name': '', 'actDomid': '', 'fzDomid': '', 'genome': ''};
  //hold genome for active organism in Organism View
  av.fzr.actConfig = {'name': '', 'actDomid': '', 'fzDomid': '', 'type': '', 'dir': ''};
  av.fzr.actConfig.file = {};
  av.fzr.pop = [];
  //the pops hold the data for the populated dishes for the Analysis page
  for (var ii=0; ii<3; ii++) {
    av.fzr.pop[ii] = {};
    av.fzr.pop[ii].fit = [];
    av.fzr.pop[ii].ges = [];
    av.fzr.pop[ii].met = [];
    av.fzr.pop[ii].num = [];
  }
  av.fzr.saveUpdateState('yes');
};

av.fzr.saveState = 'default';

av.fzr.clearMainFzrFn = function () {
  'use strict';
  av.fzr.dir = {};
  av.fzr.domid = {};
  av.fzr.file = {};

  av.fzr.cNum = 0;  //value of the next configured dish (config) number
  av.fzr.gNum = 0;  //value of the next organism (genome) number
  av.fzr.wNum = 0;  //value of the next world (populated dish) number

  //Clear each section of the freezer and active organism and ancestorBox
  av.dnd.fzConfig.selectAll().deleteSelectedNodes();  //http://stackoverflow.com/questions/11909540/how-to-remove-delete-an-item-from-a-dojo-drag-and-drop-source
  av.dnd.fzConfig.sync();   //should be done after insertion or deletion
  av.dnd.fzOrgan.selectAll().deleteSelectedNodes();
  av.dnd.fzOrgan.sync();
  av.dnd.fzWorld.selectAll().deleteSelectedNodes();
  av.dnd.fzWorld.sync();
  av.dnd.ancestorBox.selectAll().deleteSelectedNodes();
  av.dnd.ancestorBox.sync();
  
  av.fzr.saveUpdateState('yes');
};

av.anl = {};  //Analysis page functions and data
av.anl.color = [];   //holds the three colors for the three populations
av.anl.pop = [];
for (var ii=0; ii<3; ii++) {
  av.anl.pop[ii] = {};
  av.anl.pop[ii].left = [];
  av.anl.pop[ii].right = [];
}

