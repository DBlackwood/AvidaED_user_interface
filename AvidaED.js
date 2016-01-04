// need a server to run this. The one below works.
//python -m SimpleHTTPServer  in the folder with index.html to start a server for using pouchDB
//Then visit http://127.0.0.1:8000/avidaED.html
//
// to have chrome run from file
///Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --allow-file-access-from-files
//
// to get to mac files on parallels
// net use z: \\Mac\Home

define.amd.jQuery = true;
require([
  "dijit/dijit",
  "dojo/parser",
  "dojo/_base/declare",
  "dojo/query",
  "dojo/NodeList-traverse",
  "maqetta/space",
  "maqetta/AppStates",
  "dijit/Dialog",
  "dijit/layout/BorderContainer",
  "dijit/layout/ContentPane",
  "dijit/MenuBar",
  "dijit/PopupMenuBarItem",
  "dijit/MenuItem",
  "dijit/Menu",
  "dijit/form/Button",
  "dijit/TitlePane",
  "dojo/dnd/Source",
  "dojo/dnd/Manager",
  "dojo/dnd/Selector",
  "dojo/dnd/Target",
  "dojo/dom-geometry",
  "dojo/dom-style",
  "dojo/dom",
  "dojo/aspect",
  "dojo/on",
  "dijit/registry",
  "dijit/form/Select",
  "dijit/form/HorizontalSlider",
  "dijit/form/HorizontalRule",
  "dijit/form/HorizontalRuleLabels",
  "dijit/form/RadioButton",
  "dijit/form/ToggleButton",
  "dijit/form/NumberSpinner",
  "dijit/form/ComboButton",
  "dijit/form/DropDownButton",
  "dijit/form/ComboBox",
  "dijit/form/Textarea",
  "dojox/charting/Chart",
  "dojox/charting/axis2d/Default",
  "dojox/charting/plot2d/Lines",
  "dojox/charting/plot2d/Grid",
  "dojox/charting/action2d/MouseZoomAndPan",
//  "dojox/charting/Theme",
  "dojox/charting/themes/Wetland",
  "lib/pouchdb-5.0.0.js",
  "lib/jszip.js",
  "lib/FileSaver.js",
  "Dexie",
  "dojo/ready",
  "jquery",
  "jquery-ui",
  "messaging.js",
  "fileIO.js",
  //"pouchDB_IO.js",
  "colorTest.js",
  "PopulationGrid.js",
  "organismView.js",
  'dojodnd.js',
  'popControls.js',
  'mouse.js',
  // 'ndxDB.js',
  'fzrIO.js',
  "dojo/domReady!"
], function (dijit, parser, declare, query, nodelistTraverse, space, AppStates, Dialog,
             BorderContainer, ContentPane, MenuBar, PopupMenuBarItem, MenuItem, Menu,
             Button, TitlePane, dndSource, dndManager, dndSelector, dndTarget, domGeometry, domStyle, dom,
             aspect, on, registry, Select,
             HorizontalSlider, HorizontalRule, HorizontalRuleLabels, RadioButton, ToggleButton, NumberSpinner, ComboButton,
             DropDownButton, ComboBox, Textarea, Chart, Default, Lines, Grid, MouseZoomAndPan, Wetland,
             PouchDB, JSZip, FileSaver, Dexie,
             ready, $, jqueryui) {
  "use strict";
  if (typeof $ != 'undefined') {
    // jQuery is loaded => print the version
    // console.log($.fn.jquery);
  } else {console.log("Jquery ($) is not defined."); }

  parser.parse();

  /*******************************************************************************************
   * The files at the end of the require list contain code specific to avida-ED.
   * The functions they contain can access the dom. They cannot access functions defined anywhere
   * else in the project. This has resulted in some code split between AvidaED.js and the various
   * other files.
   *
   * The files included in script tags in AvidaED.html cannot access the dom. They contain global
   * variables and functions that are independent of the dom
   *
   *******************************************************************************************/

    //********************************************************************************************************************
    //  pouchdb instance
    //********************************************************************************************************************
  av.fio.PouchDB = PouchDB;
  av.fio.Dexie = Dexie;
  av.fio.JSZip = JSZip;

  // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Sending_and_Receiving_Binary_Data
  //https://thiscouldbebetter.wordpress.com/2013/08/06/reading-zip-files-in-javascript-using-jszip/
  function readZipWS(zipFileName) {
    'use strict';
    av.fio.zipName = zipFileName;
    var oReq = new XMLHttpRequest();
    oReq.open("GET", av.fio.zipName, true);
    oReq.responseType = "arraybuffer";
    oReq.onload = function (oEvent) {
      var arybuf = oReq.response;
      console.log("have ziptest.zip", arybuf);
      // do something to extract it
      av.fio.zipfile = new av.fio.JSZip();
      console.log("loading arybuf");
      av.fio.zipfile.load(arybuf, {base64: false});
      //console.log("arybuf loaded");
      console.log('before call procesfiles');
      av.fio.target = null;
      for (var zFileName in av.fio.zipfile.files) {
        //target will be assigned the beginning of the path name within the zip file.
        if (null == av.fio.target) {
          var leading = wsb('/', zFileName);
          if ('__MACOSX' != leading) av.fio.target = leading; //this gets the root name which we remove from path in the fzr file
        }
        av.fio.thisfile = av.fio.zipfile.files[zFileName];
        av.fio.fName = zFileName;
        processFiles(av);
      }
      //note setup form is updated when the files are read.
      console.log('after read loop: fzr', av.fzr);
      av.fio.fileReadingDone = true;
      //console.log('before DrawGridSetup')
      DrawGridSetup();
      av.fzr.cNum++;
      av.fzr.gNum++;
      av.fzr.wNum++;
    };
    oReq.send();
  }

 //********************************************************************************************************************/
 //********************************************************************************************************************/
  /*
   Setup the database '/ws' with indexable timestamp,
   contents, and mode properties.
   The key, the file path, is hidden (not stored as
   a property indexable or otherwise).
   */
  function setupDexieStore() {
    'use strict';
    var db = new av.fio.Dexie('/ws');
    db.version(1).stores({
      //The missing first argument means we're going to not bind the key to an indexable property
      //We can insert any additional properties into the documents at any time; but we can only
      //use the Dexie index features with the properties listed.  Note that we cannot use
      //the key (the file path) as it is *not* listed as an indexable property (and is not stored
      //as a document property at all. This is a requirement on the Emscripten side for using this
      //as a virtual file system.
      FILE_DATA: ',timestamp,contents,mode',
      work:  'name,timestamp,contents,mode'
    });
    db.open();
    console.log('in stores');
    return db;
  }

  // Define your database
  function startDB(zipFileName) {
    av.fio.dxdb = new Dexie("/ws");
    av.fio.dxdb.delete().then(function () {
      console.log("Database successfully deleted");
    }).catch(function (err) {
      console.error("Could not delete database");
    }).finally(function () {
      // Do what should be done next...
    });
    av.fio.dxdb = setupDexieStore();
    //doDbReady(av.fio);
    readZipWS(zipFileName);
    Dexie.Promise.on('error', function(err) {
      // Log to console or show en error indicator somewhere in your GUI...
      console.log("Uncaught error: " + err);
    });
    av.fio.dxdb.close();
  }

  function initializeDB(zipFileName) {
    var oldDb = new av.fio.PouchDB(av.fio.dbName);
    //clear any old database and create new one for this session
    oldDb.destroy(av.fio.dbName).then(function (response) {//success
      oldDb = null;
      fio.wsdb = new fio.PouchDB(av.fio.dbName); //for workspace database
      console.log('after new PouchDB - send msg to Avida');
      doDbReady(av.fio);
      readZipWS(zipFileName);
    }).catch(function (err) {
      av.fio.wsdb = new av.fio.PouchDB(av.fio.dbName); //for workspace database
      console.log('after new PouchDB destroy db err', err);
      doDbReady(av.fio);
      readZipWS(zipFileName);
    });
  }
  console.log('before initialze DB', av.fio.uiWorker);
  //initializeDB(av.fio.defaultFname);
  startDB(av.fio.defaultFname);

  //********************************************************************************************************************/


  //********************************************************************************************************************/
  //delete this section later
  //console.log("defining test_jszip()");
  var test_jszip;
  test_jszip = function() {
    console.log("JSZip testing");

    var zip = new JSZip();
    zip.file('h0/hello.txt', 'Text that says hello\nA new line\n');
    zip.folder('h1').file('name.txt', 'This is the name file\n');
    console.log("zip done");
    var content = null;
    var blob = null;
    console.log("content", content);
    blob = zip.generate({type: "blob"});
    saveAs(blob, "example102.zip");

    console.log("end JSZip testing");

  };

  //test_jszip();

  //********************************************************************************************************************
  // Menu file handling
  //********************************************************************************************************************


  function readSingleFile(e) {
    var file = e.target.files[0];
    if (!file) {
      return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
      var contents = e.target.result;
      console.log('contents', contents);
      console.log('e',e);
    };
    reader.readAsText(file);
  }

  function mnOpenWS() {
    //$('input[type=file]').click();
    document.getElementById('fileGet')
      .addEventListener('change', readSingleFile, false);
  }

  //dijit.byId("mnOpenWS").on("Click", function () { mnOpenWorkSpace(); });  //in fileIO.js
  //dijit.byId("mnOpenWS").on("Click", function () { mnOpenWS(); });
  //dijit.byId("mnOpenDefault").on("Click", function () { mnOpenDefault(); });  //in fileIO.js
  dijit.byId("mnOpenDefault").on("Click", function () { mnOpenWorkSpace(); });  //in fileIO.js

  dijit.byId("mnOpenWS").on("Click", function () {  //does not work
    $('input[type=file]').click();
    console.log('files', this.files);
  })

  //http://p2p.wrox.com/javascript-how/14546-how-show-file-dialog-using-javascript.html
  function openFileOption() {
    document.getElementById("fileGet").click();
    console.log('after fileGet');
  }

  function readWSFile(e) {
    'use strict';
    var file = e.target.files[0];
    if (!file) {
      return;
    }
    console.log('file=', file);
    /*
    var reader = new FileReader();
    reader.onload = function(e) {
      var contents = e.target.result;
      displayContents(contents);
    };
    reader.readAsText(file);
    */
  }
  document.getElementById('getWS')
    .addEventListener('change', readWSFile, false);

  av.test = function(){
    console.log('this is a test');
    document.getElementById("getWS").click();
  }

  // Save a file  --------------------------------------------------------

  av.fio.SaveWSas = function(){
    console.log('in avidaED');
    document.getElementById("putWS").click();
  }

/*  WRE wrote
  var SaveFileDialog = new Dialog({
    title: "Avida : A Guided Tour of an Ancestor and its Hardware",
    id: "SaveFileDialog",
    href: "savefile.html"
    //hide: function() {HardwareDialog.destroy()}
    //style: "width: 600px; height: 400px"
  });

  domStyle.set(SaveFileDialog.containerNode, {
    position: 'relative'
  });

  dijit.byId("mnFzSaveWorkspaceAs").on("Click", function () { // ???
    if (!SaveFileDialog) {
      SaveFileDialog = new Dialog({
        title: "Save Workspace",
        id: "SaveFileDialog",
        href: "savefile.html"
        //hide: function() {HardwareDialog.destroy()}
        //style: "width: 600px; height: 400px"
      });
    }
    console.log(SaveFileDialog);
    SaveFileDialog.show();
  });
*/

  /* ---------------------------------------------------------------------- */

  //********************************************************************************************************************
  // Resize window helpers -------------------------------------------
  //********************************************************************************************************************
  if (av.debug.root) console.log('before Resize helpers');
  // called from script in html file as well as below
  BrowserResizeEventHandler = function () {
    if ("block" == domStyle.get("analysisBlock", "display")) {
      AnaChartFn();
    }
    if ("block" == domStyle.get("populationBlock", "display")) {
      popChartFn();
      DrawGridSetup();
    }
    if ("block" == domStyle.get("organismBlock", "display")) {
      var rd = $("#rightDetail").innerHeight();
      var height = ($("#rightDetail").innerHeight() - 395) / 2;  //was 375
      document.getElementById("ExecuteJust").style.height = height + "px";  //from http://stackoverflow.com/questions/18295766/javascript-overriding-styles-previously-declared-in-another-function
      document.getElementById("ExecuteAbout").style.height = height + "px";
      document.getElementById("ExecuteJust").style.width = "100%";
      document.getElementById("ExecuteAbout").style.width = "100%";
      //console.log('rightDetail', height, rd);
      updateOrgTrace();
    }
  };

  ready(function () {
    aspect.after(registry.byId("gridHolder"), "resize", function () {
      BrowserResizeEventHandler();
    });
    aspect.after(registry.byId("popChartHolder"), "resize", function () {
      BrowserResizeEventHandler();
    });
    aspect.after(registry.byId("organismCanvasHolder"), "resize", function () {
      BrowserResizeEventHandler();
    });
  });

  var popRightOldwidth = 0;
  aspect.after(registry.byId("popRight"), "resize", function () {
    if (registry.byId("popRight").domNode.style.width != popRightOldwidth) {
      popRightOldwidth = registry.byId("popRight").domNode.style.width;
      var str = registry.byId("popRight").domNode.style.width;
      registry.byId("selectOrganPane").domNode.style.width = Math.round((Number(str.substr(0, str.length - 2)) - 50) * 0.45) + "px"
      registry.byId("mainBC").layout();
    }
  });

  if (av.debug.root) console.log('before drop down menu');
  // Drop down menu buttons ------------------------------------------

  var HardwareDialog = new Dialog({
    title: "Avida : A Guided Tour of an Ancestor and its Hardware",
    id: "HardwareDialog",
    href: "cpu_tour.html"
    //hide: function() {HardwareDialog.destroy()}
    //style: "width: 600px; height: 400px"
  });

  domStyle.set(HardwareDialog.containerNode, {
    position: 'relative'
  });

  dijit.byId("Hardware").on("Click", function () {
    if (!HardwareDialog) {
      HardwareDialog = new Dialog({
        title: "Avida : A Guided Tour of an Ancestor and its Hardware",
        id: "HardwareDialog",
        href: "cpu_tour.html"
        //hide: function() {HardwareDialog.destroy()}
        //style: "width: 600px; height: 400px"
      });
    }
    console.log(HardwareDialog);
    HardwareDialog.show();
  });

  // main button scripts-------------------------------------------

  //initialize the ht for main buttons and trash can so there is no scroll bar
  if (document.getElementById('mainButtons').scrollHeight > document.getElementById('mainButtons').clientHeight){
    document.getElementById('mainButtons').style.height = document.getElementById('mainButtons').scrollHeight + 'px';
  }
  if (document.getElementById('trashCP').scrollHeight > document.getElementById('trashCP').clientHeight){
    document.getElementById('trashCP').style.height = document.getElementById('trashCP').scrollHeight + 'px';
  }
  if (document.getElementById('orgTop').scrollHeight > document.getElementById('orgTop').clientHeight){
    document.getElementById('orgTop').style.height = document.getElementById('orgTop').scrollHeight + 'px';
  }
  //console.log('orgBot', document.getElementById('organismBottom').scrollHeight, document.getElementById('organismBottom').clientHeight);
  if (document.getElementById('organismBottom').scrollHeight > document.getElementById('organismBottom').clientHeight){
    var num = document.getElementById('organismBottom').scrollHeight+9;
    document.getElementById('organismBottom').style.height = num + 'px';
  }

  //The style display: none cannnot be used in the html during the initial load as the dijits won't work right
  //visibility:hidden can be used, but it leaves the white space and just does not display dijits.
  //So all areas are loaded, then the mainBoxSwap is called to set display to none after the load on all but
  //the default option.
  //mainBoxSwap("organismBlock");
  //mainBoxSwap("populationBlock");  //commented out here as it is called near the end of this file
  dijit.byId("setupBlock").set("style", "display: none;");

  //this section gets rid of scroll bars, but then page no longer resizes correctly
  // delete later if fix that uses 95% to 98% of height takes care of the problem.
  /*    var popNewHt = $("#blockHolder").height()-10;
   dijit.byId("populationBlock").set("style", "height: "+ popNewHt +"px");
   dijit.byId("popBC").set("style", "height: "+ popNewHt+"px");
   var mapNewHt = $("#mapBlockHold").height()-10;
   dijit.byId("mapBlock").set("style", "height: "+ mapNewHt +"px");
   //mapNewHt = mapNewHt - 5;
   dijit.byId("mapBC").set("style", "height: "+ mapNewHt +"px;");
   */
  function mainBoxSwap(showBlock) {
    console.log("in mainBoxSwap");
    dijit.byId("populationBlock").set("style", "display: none;");
    dijit.byId("organismBlock").set("style", "display: none;");
    dijit.byId("analysisBlock").set("style", "display: none;");
    dijit.byId("testBlock").set("style", "display: none;");       //take testBlock out completely later
    console.log('after testblock');
    dijit.byId(showBlock).set("style", "display: block; visibility: visible;");
    dijit.byId(showBlock).resize();
    console.log('after showblock resize');

    //disable menu options. they will be enabled when relevant canvas is drawn
    dijit.byId("mnFzOffspring").attr("disabled", true);
    dijit.byId("mnOffspringTrace").attr("disabled", true);
    //console.log('end of mainBoxSwap');
  };

  // Buttons that call MainBoxSwap
  document.getElementById("populationButton").onclick = function () {
    if (av.debug.dnd || av.debug.mouse) console.log('PopulationButton, av.fzr.genome', av.fzr.genome);
    brs.page = 'population';
    mainBoxSwap("populationBlock");
  }

  document.getElementById("organismButton").onclick = function () {
    mainBoxSwap("organismBlock");
    console.log('after mainBoxSwap');
    organismCanvasHolderSize();
    var height = ($("#rightDetail").innerHeight() - 395) / 2;
    document.getElementById("ExecuteJust").style.height = height + "px";  //from http://stackoverflow.com/questions/18295766/javascript-overriding-styles-previously-declared-in-another-function
    document.getElementById("ExecuteAbout").style.height = height + "px";
    document.getElementById("ExecuteJust").style.width = "100%";
    document.getElementById("ExecuteAbout").style.width = "100%";
    if (undefined != av.traceObj) {
      updateOrgTrace();
    }
    brs.page = 'organism';
  };

  document.getElementById("analysisButton").onclick = function () {
    mainBoxSwap("analysisBlock");
    brs.page = 'population';
  };
  //Take testBlock out completely later

  document.getElementById("testButton").onclick = function () {
    mainBoxSwap("testBlock");
    if ('#00FF00' == chck.outlineColor) {
      chck.outlineColor = '#00FFFF';
    }
    else if ('#00FFFF' == chck.outlineColor) {
      chck.outlineColor = '#FFFFFF';
    }
    else {
      chck.outlineColor = '#00FF00';
    }
    placeChips(chips, chck);
    drawCheckerSetup(chck, chips);
  };

  if (av.debug.root) console.log('before dnd definitions');
  /* ********************************************************************** */
  /* Dojo Drag N Drop Initialization ****************************************/
  /* ********************************************************************** */
  /* Yes they are globals, but they are defined based on the dom and
   when I've tried putting them in another file it does not work */

  av.dnd.fzConfig = new dndSource('fzConfig', {
    accept: ['c'],
    copyOnly: true,
    singular: true,
    selfAccept: false
  });
  av.dnd.fzOrgan = new dndSource('fzOrgan', {
    accept: ['g'],
    copyOnly: true,
    singular: true,
    selfAccept: false
  });
  av.dnd.fzWorld = new dndSource('fzWorld', {
    accept: ['w'],
    singular: true,
    copyOnly: true,
    selfAccept: false
  });
  av.dnd.fzWorld.insertNodes(false, [
    {data: "m2w30u1000nand", type: ['w']},
    {data: "m2w30u1000not", type: ['w']}
  ]);

  av.dnd.organIcon = new dndTarget('organIcon', {accept: ['g'], selfAccept: false});
  av.dnd.ancestorBox = new dndSource('ancestorBox', {accept: ['g'], copyOnly: false, selfAccept: false});
  av.dnd.gridCanvas = new dndTarget('gridCanvas', {accept: ['g']});
  av.dnd.trashCan = new dndSource('trashCan', {accept: ['c', 'g', 'w'], singular: true});
  if (av.debug.root) console.log('after trashCan');

  av.dnd.activeConfig = new dndSource('activeConfig', {
    accept: ['c', 'w'],
    singular: true,
    copyOnly: true,
    selfAccept: false
  });
  //av.dnd.activeConfig.insertNodes(false, [{data: "@default", type: ['c']}]);  //tiba delete later

  //http://stackoverflow.com/questions/11909540/how-to-remove-delete-an-item-from-a-dojo-drag-and-drop-source
  av.dnd.activeOrgan = new dndSource('activeOrgan', {
    accept: ['g'],
    singular: true,
    copyOnly: true,
    selfAccept: false
  });
  av.dnd.organCanvas = new dndSource('organCanvas', {accept: ['g'], singular: true, selfAccept: false});
  //Targets only accept object, source can do both
  av.dnd.graphPop1 = new dndTarget('graphPop1', {accept: ['w'], singular: true});
  av.dnd.graphPop2 = new dndTarget('graphPop2', {accept: ['w'], singular: true});
  av.dnd.graphPop3 = new dndTarget('graphPop3', {accept: ['w'], singular: true});

  av.parents = clearParents(av.parents);

  if (av.debug.root) console.log('before dnd triggers');
  //*******************************************************************************************************************
  //       Dojo Dnd drop function - triggers for all dojo dnd drop events
  //*******************************************************************************************************************
  // Dojo DndDrop function triggers for drops in all locations (target or source). However not all the information is
  // available unless the correct source/target name is in the event call. I had one event handler with calls to the
  // different functions based on the target.node.id, but that did not work, for not all the information was available.
  // It looks like it is there based on console.logging just the taret, but trying to access subdata results in a null.
  // I don't think I would have written it this way had I known the single event handler would not work, but I had
  // created the dojodnd.js file before I realized that I needed separate event handelers with the conditional.

  av.dnd.activeConfig.on("DndDrop", function (source, nodes, copy, target) {//This triggers for every dnd drop, not just those of activeConfig
    'use strict';
    var str;
    var pkg = {}; pkg.source = source; pkg.nodes = nodes; pkg.copy = copy; pkg.target = target;
    //console.log('pkg.target', pkg.target);
    //console.log('pkg.target.s', pkg.target.selection);
    if ('activeConfig' === target.node.id) {
      landActiveConfig(av.dnd, pkg);  //dojoDnd
      updateSetup(av);  //fileIO
      if (av.fzr.file[av.fzr.actConfig.dir+'/ancestors']) {
        str = av.fzr.file[av.fzr.actConfig.dir+'/ancestors'];
        console.log('ancestors', str);
        av.fio.autoAncestorLoad(str);      //should I separate placeparent from place in ancestorBox
                                          // because of option to put populationDish in active config
      }
      if (av.fzr.file[av.fzr.actConfig.dir+'/ancestors_manual']) {
        str = av.fzr.file[av.fzr.actConfig.dir + '/ancestors_manual'];
        av.fio.handAncestorLoad(str);
      }

      if ('w' === av.fzr.actConfig.type) {
        console.log('world config so there more to do');
      }
      if ('map'==brs.subpage) {DrawGridSetup();} //draw grid
    }
  });

  //in the past this whould not trigger as activeConfig is only a target
  av.dnd.fzConfig.on("DndDrop", function (source, nodes, copy, target) {//This triggers for every dnd drop, not just those of fzConfig
    if ('fzConfig' === target.node.id) {
      //var num = av.fzr.cNum;
      landFzConfig(av.dnd, av.fzr, source, nodes, target);  //needed as part of call to contextMenu
      //if (num !== fzr.cNum) {makeFzrConfig(av.fzr, num, parents);}
    }
  });

  av.dnd.fzOrgan.on("DndDrop", function (source, nodes, copy, target) {//This triggers for every dnd drop, not just those of fzOrgan
    if ('fzOrgan' === target.node.id) {
      landFzOrgan(av.dnd, av.fzr, av.parents,source, nodes, target);
    }
  });

  av.dnd.ancestorBox.on("DndDrop", function (source, nodes, copy, target) {//This triggers for every dnd drop, not just those of ancestorBox
    if ('ancestorBox' == target.node.id) {
      landAncestorBox(av.dnd, av.fzr, av.parents,source, nodes, target);
      console.log('ancestorBox', av.dnd.ancestorBox);
    }
  });

  av.dnd.gridCanvas.on("DndDrop", function (source, nodes, copy, target) {//This triggers for every dnd drop, not just those of gridCanvas
    if ('gridCanvas' == target.node.id) {
      landGridCanvas(av, av.dnd, av.fzr, av.grd, av.parents, source, nodes, target);
      DrawGridSetup();
    }
  });

  av.dnd.organCanvas.on("DndDrop", function (source, nodes, copy, target) {//This triggers for every dnd drop, not just those of organCanvas
    if ('organCanvas' == target.node.id) {
      if (av.debug.dnd) console.log('landOrganCanvas: s, t', source, target);
      landOrganCanvas(av.dnd, av.fzr, source, nodes, target);
      doOrgTrace(av.fio, av.fzr);  //request new Organism Trace from Avida and draw that.
    }
  });

  av.dnd.organIcon.on("DndDrop", function (source, nodes, copy, target) {//This triggers for every dnd drop, not just those of organIcon
    console.log('target', target.node.id, '; source',source.node.id, '-------------------------------------------------------------------');
    //setTimeout(null,1000);
    if ('organIcon' == target.node.id) {
      if (av.debug.dnd) console.log('landOrganIcon: s, t', source, target);
      landOrganIcon(av, source, nodes, target);
      //Change to Organism Page
      mainBoxSwap("organismBlock");
      organismCanvasHolderSize();
      var height = ($("#rightDetail").innerHeight() - 375) / 2;
      document.getElementById("ExecuteJust").style.height = height + "px";  //from http://stackoverflow.com/questions/18295766/javascript-overriding-styles-previously-declared-in-another-function
      document.getElementById("ExecuteAbout").style.height = height + "px";
      document.getElementById("ExecuteJust").style.width = "100%";
      document.getElementById("ExecuteAbout").style.width = "100%";
      doOrgTrace(av.fio, av.fzr);  //request new Organism Trace from Avida and draw that.
    }
  });

  av.dnd.activeOrgan.on("DndDrop", function (source, nodes, copy, target) {//This triggers for every dnd drop, not just those of activeOrgan
    if ('activeOrgan' == target.node.id) {
      if (av.debug.dnd) console.log('activeOrgan: s, t', source, target);
      landActiveOrgan(av.dnd, av.fzr, source, nodes, target);
      doOrgTrace(av.fio, av.fzr);  //request new Organism Trace from Avida and draw that.
    }
  });

  av.dnd.trashCan.on("DndDrop", function (source, nodes, copy, target) {//This triggers for every dnd drop, not just those of trashCan
    if ('trashCan' == target.node.id) {
      var remove = {};
      remove.type = '';
      remove.dir = '';
      if (av.debug.dnd) console.log('trashCan: s, t', source, target);
      remove = landTrashCan(av.dnd, av.fzr, av.parents, source, nodes, target);
      if ('' != remove.type) {
        //removeFzrItem(av.fzr, remove.dir, remove.type);
        remove.dir = av.fzr.dir[remove.domid];
        av.fzr.removeFzrItem(av.fzr, remove.dir, remove.type);
      }
    }
  });

  av.dnd.graphPop1.on("DndDrop", function (source, nodes, copy, target) {//This triggers for every dnd drop, not just those of graphPop1
    if ('graphPop1' == target.node.id) {
      if (av.debug.dnd) console.log('graphPop1: s, t', source, target);
      landGraphPop1(av.dnd, source, nodes, target, plt);
      AnaChartFn();
    }
  });

  av.dnd.graphPop2.on("DndDrop", function (source, nodes, copy, target) {//This triggers for every dnd drop, not just those of graphPop2
    if ('graphPop2' == target.node.id) {
      if (av.debug.dnd) console.log('graphPop2: s, t', source, target);
      landGraphPop2(av.dnd, source, nodes, target, plt);
      AnaChartFn();
    }
  });

  av.dnd.graphPop3.on("DndDrop", function (source, nodes, copy, target) {//This triggers for every dnd drop, not just those of graphPop3
    if ('graphPop3' == target.node.id) {
      if (av.debug.dnd) console.log('graphPop3: s, t', source, target);
      landGraphPop3(av.dnd, source, nodes, target, plt);
      AnaChartFn();
    }
  });

  //this should never be executed
  av.dnd.fzWorld.on("DndDrop", function (source, nodes, copy, target) {//This triggers for every dnd drop, not just those of activeConfig
    var pkg = {}; pkg.source = source; pkg.nodes = nodes; pkg.copy = copy; pkg.target = target;
    if ('fzWorld' == target.node.id) {
      landFzPopDish(av.dnd, pkg);   //will never be called as fzPopDish is the only source for the popDish type.
    }
    //The following cases should never happen as they are defined as 'target' not as 'source' dnd types.
    // The code is here in case the dnd type is changed to 'source'
    switch (source.node.id) {
      case 'graphPop1':
        pop1a = [];       //remove lines from population 1
        pop1b = [];
        AnaChartFn();
        break;
      case 'graphPop2':
        pop2a = [];       //remove lines from population 2
        pop2b = [];
        AnaChartFn();
        break;
      case 'graphPop3':
        pop3a = [];       //remove lines from population 3
        pop3b = [];
        AnaChartFn();
        break;
    }
  });

  if (av.debug.root) console.log('before Population Page');
  /* *************************************************************** */
  /* Population page script ******************************************/
  /* *************************************************************** */

// shifts the population page from Map (grid) view to setup parameters view and back again.
  document.getElementById("PopSetupButton").onclick = function () {
    popBoxSwap();   //in popControls.js
    if ("Setup" == document.getElementById("PopSetupButton").innerHTML) {
      cellConflict(av.grd.cols, av.grd.rows, av.grd, av.parents);
      DrawGridSetup();
      console.log('parents', av.parents);
      brs.subpage = 'map';
    }
    else {brs.subpage = 'setup';}
  };

  // hides and shows the population and selected organsim data on right of population page with "Stats" button
  document.getElementById("PopStatsButton").onclick = function () {
    popStatView(av.grd);
  };
  // hides and shows the population and selected organsim data on right of population page with "Stats" button

  /* *************************************************************** */
  /* ******* Map Grid buttons - New  Run/Pause Freeze ************** */
  /* *************************************************************** */
  dijit.byId("mnPause").attr("disabled", true);
  dijit.byId("mnFzOrganism").attr("disabled", true);
  dijit.byId("mnFzOffspring").attr("disabled", true);
  dijit.byId("mnFzPopulation").attr("disabled", true);
  dijit.byId("mnOrganismTrace").attr("disabled", true);

  function popStatView(grd) {
    if (grd.popStatFlag) {
      grd.popStatFlag = false;
      registry.byId("popRight").domNode.style.width = "1px";
      registry.byId("mainBC").layout();
      dijit.byId("popRight").set("style", "display: block; visibility: visible;");

    }
    else {
      grd.popStatFlag = true;
      registry.byId("selectOrganPane").domNode.style.width = "150px";
      registry.byId("popRight").domNode.style.width = "395px";
      registry.byId("mainBC").layout();
      dijit.byId("popRight").set("style", "display: block; visibility: visible;");

    }
  }

  function runPopFn() {
    //check for ancestor organism in configuration data
    var namelist = dojo.query('> .dojoDndItem', 'ancestorBox');
    //console.log("namelist", namelist);
    if (1 > namelist.length) {
      document.getElementById("runStopButton").innerHTML = "Run";
      dijit.byId("mnPause").attr("disabled", true);
      dijit.byId("mnRun").attr("disabled", false);
      NeedAncestorDialog.show();
    }
    else { // setup for a new run by sending config data to avida
      if (av.grd.newrun) {
        requestPopStats(av.fio);  //fio.uiWorker
        requestGridData(av.fio);  //fio.uiWorker

        //change ui parameters for the correct state when the avida population has started running
        popRunningState_ui(av.dnd, av.grd);
        dom.byId('ancestorBox').isSource = false;

        //collect setup data to send to avida
        av.fio.sendConfig(av);          //pouchDB_IO.js
        injectAncestors(av.fio, av.parents); //fio.uiWorker
      }
      doRunPause(av.fio);
    }
    //update screen based on data from C++
  }

  //process the run/Stop Button - a separate function is used so it can be flipped if the message to avida is not successful.
  document.getElementById("runStopButton").onclick = function () {
    runStopFn();
  };

  function runStopFn() {
    if ("Run" == document.getElementById("runStopButton").innerHTML) {
      document.getElementById("runStopButton").innerHTML = "Pause";
      dijit.byId("mnPause").attr("disabled", false);
      dijit.byId("mnRun").attr("disabled", true);
      runPopFn();
    } else {
      document.getElementById("runStopButton").innerHTML = "Run";
      dijit.byId("mnPause").attr("disabled", true);
      dijit.byId("mnRun").attr("disabled", false);
      doRunPause(av.fio);
      //console.log("pop size ", av.grd.population_size);
    }
  };

  //process run/Stop buttons as above but for drop down menu
  dijit.byId("mnRun").on("Click", function () {
    dijit.byId("mnPause").attr("disabled", false);
    dijit.byId("mnRun").attr("disabled", true);
    document.getElementById("runStopButton").innerHTML = "Pause";
    runPopFn();
  });
  dijit.byId("mnPause").on("Click", function () {
    dijit.byId("mnPause").attr("disabled", true);
    dijit.byId("mnRun").attr("disabled", false);
    document.getElementById("runStopButton").innerHTML = "Run";
    doRunPause(av.fio);
  });

  /* ************** New Button and new Dialog ***********************/
  dijit.byId("newDiscard").on("Click", function () {
    newDialog.hide();
    resetDishFn();
    //console.log("newDiscard click");
  });

  dijit.byId("newSave").on("Click", function () {
    newDialog.hide();
    resetDishFn();
    FrPopulationFn();
    //console.log("newSave click");
  });

  function newButtonBoth() {
    if (av.grd.newrun) {// reset petri dish
      resetDishFn();
    }
    else {// check to see about saving current population
      newDialog.show();
    }
  }

  document.getElementById("newDishButton").onclick = function () {
    newButtonBoth()
  };
  dijit.byId("mnNewpop").on("Click", function () {
    newButtonBoth()
  });

  //reset values
  function resetDishFn() { //Need to reset all settings to @default
    av.grd.newrun = true;
    dijit.byId("mnOrganismTrace").attr("disabled", true);
    dijit.byId("mnFzOrganism").attr("disabled", true);

    // send reset to Avida adaptor
    doReset(av.fio);
    //Enable the options on the Setup page
    popNewExState(av.dnd, av.fzr, av.grd, av.parents);
    //Clear grid settings
    clearParents(av.parents);
    //reset values in population settings based on a 'file' @default
    updateSetup(av);

    //write if @default not found - need to figure out a test for this
    //writeHardDefault(av.dft);

    //re-write grid if that page is visible
    popChartFn();
    DrawGridSetup();
  }

  /*
  function display(text)
  {   var para = document.createElement("p");
    var child = document.createTextNode(text);
    para.appendChild(child);
    document.getElementById('').appendChild(para);
  }
*/

  //On unload


  //test - delete later ----------------------------------------------------------
  document.getElementById("grdTestButton").onclick = function () {
    'use strict';
    console.log('fzr', av.fzr);
    console.log('parents', av.parents);
    var len;
    av.fio.dxdb.transaction('r', av.fio.dxdb.work, function(){
      av.fio.dxdb.work.where('name').startsWithIgnoreCase('c').toArray(function(stuff){
        len = stuff.length;
        for (var ii = 0; ii< len; ii++) {
          console.log(ii, stuff[ii]);
        }
      });
      av.fio.dxdb.work.where('name').startsWithIgnoreCase('g').toArray(function(stuff){
        len = stuff.length;
        for (var ii = 0; ii< len; ii++) {
          console.log(ii, stuff[ii]);
        }
      });
      av.fio.dxdb.work.where('name').startsWithIgnoreCase('w').toArray(function(stuff){
        len = stuff.length;
        for (var ii = 0; ii< len; ii++) {
          console.log(ii, stuff[ii]);
        }
      });
    }).catch(function(err){
      console.log('read error', err);
      throw error;
    })
  };

  //******* Freeze Button ********************************************
  //Saves either configuration or populated dish
  //Also creates context menu for all new freezer items.
  document.getElementById("freezeButton").onclick = function () {
    if (av.grd.newrun) FrConfigFn();
    else fzDialog.show();
  };

  function FrConfigFn() {
    var fzName = prompt("Please name the new configuration", "newConfig");
    if (fzName) {
      var namelist = dojo.query('> .dojoDndItem', 'fzConfig');
      fzName = getUniqueName(fzName, av.dnd.fzConfig);
      if (null != fzName) {
        av.dnd.fzConfig.insertNodes(false, [{data: fzName, type: ['c']}]);
        av.dnd.fzConfig.sync();
        //Create context menu for right-click on this item
        var domId = getDomId(fzName, av.dnd.fzConfig);
        var newConfig = {
          domId: domId,
          name: fzName,
          _id: 'c'+ av.fzr.cNum,
          fileNum: av.fzr.cNum
        };
        av.fzr.config.push(newConfig);
        av.fzr.cNum++;
        makeFzrConfig(av.fzr, av.fio);
        av.dnd.contextMenu(av.fzr, av.dnd.fzConfig, domId);
      }
    }
  }

  // Save current workspace (mnFzSaveWorkspace)
  document.getElementById("mnFzSaveWorkspace").onclick = function () {
    console.log("setting up onClick event for mnFzSaveWorkspace");
    fzSaveCurrentWorkspaceFn();
  };

  function fzSaveCurrentWorkspaceFn(){
    console.log("in fzSaveCurrentWorkspaceFn()");
    // Testing... set up example zip file, save it to local file.
    var zip = new JSZip();
    zip.file("Hello.txt", "Hello World\n");
    //var img = zip.folder("images");
    //img.file("smile.gif", imgData, {base64: true});
    var content = zip.generate({type:"blob"});
    // see FileSaver.js
    saveAs(content, "example_fzSaveCurrentWorkspaceFn.zip");
    // Test works; zip is saved to user's Downloads directory

    // Next steps:
    // Make a zip out of current freezer
    // Apply current workspace name
    // Save to current workspace name
    var wszip = new JSZip();
    // Traverse the freezer, adding files and folders as needed


  }

  //Save a populated dish
  function FrPopulationFn() {
    var fzName = prompt("Please name the new population", "newPopulation");
    if (fzName) {
      fzName = getUniqueName(fzName, av.dnd.fzWorld);
      if (null != fzName) {
        av.dnd.fzWorld.insertNodes(false, [{data: fzName, type: ['w']}]);
        av.dnd.fzWorld.sync();
        //Find out the dom ID the node element just inserted.
        var domId = getDomId(fzName, av.dnd.fzWorld);
        var newWorld = {
          domId: domId,
          name: fzName,
          _id: 'w'+ av.fzr.wNum,
          fileNum: av.fzr.wNum
        };
        av.fzr.world.push(newWorld);
        av.fzr.wNum++;
        makeFzrWorld(av.fzr, av.fio, av.grd);
        //need to get data from Avida for this tiba
        //Create context menu for right-click on this item
        av.dnd.contextMenu(av.fzr, av.dnd.fzWorld, domId);
      }
    }
  }

  dijit.byId("FzConfiguration").on("Click", function () {
    fzDialog.hide();
    FrConfigFn();
  });

  //Drop down menu to save a configuration item
  dijit.byId("mnFzConfig").on("Click", function () {
    FrConfigFn()
  });

  //button to freeze a population
  dijit.byId("FzPopulation").on("Click", function () {
    fzDialog.hide();
    FrPopulationFn();
  });

  //Buttons on drop down menu to save an organism
  dijit.byId("mnFzOrganism").on("Click", function () {
    FrOrganismFn('selected')
  });

  //Buttons on drop down menu to save an offspring
  dijit.byId("mnFzOffspring").on("Click", function () {
    FrOrganismFn('offspring')
  });

  //Freeze the selected organism
  function FrOrganismFn(trigger) {
    var fzName = 'new';
    var parentName = "";
    var gene;
    if ('selected' == trigger) {
      fzName = prompt("Please name the selected organism", "newOrganism");
      gene = av.grd.kidGenome;
    }
    else if ('offspring' == trigger) {
      //get name from parent
      parentName = document.getElementById(Object.keys(av.dnd.activeOrgan.map)[0]).textContent;
      fzName = prompt("Please name the offspring", parentName + '_Offspring');
      gene = '0,heads_default,' + av.gen.dna[1];
    }
    else {
      fzName = prompt("Please name the organism", "newOrganism");
      console.log('source unknwon', trigger);
    }
    fzName = getUniqueName(fzName, av.dnd.fzOrgan);
    if (null != fzName) {
      //insert new item into the freezer.
      av.dnd.fzOrgan.insertNodes(false, [{data: fzName, type: ['g']}]);
      av.dnd.fzOrgan.sync();

      //Find out the dom ID the node element just inserted.
      var mapItems = Object.keys(av.dnd.fzOrgan.map);
      var neworg = {
        'name': fzName,
        'domId': mapItems[mapItems.length - 1],
        'genome': gene
      }
      av.fzr.genome.push(neworg);
      av.dnd.contextMenu(av.fzr, av.dnd.fzOrgan, neworg.domId);
    }
  }

  // End of Freezer functions
//********************************************************************
//    mouse DND functions
//********************************************************************
  /* mouse websites
   mouse clicks
   http://stackoverflow.com/questions/706655/bind-event-to-right-mouse-click
   http://stackoverflow.com/questions/7343117/cant-use-jquerys-click-event-handler-to-detect-right-click
   http://stackoverflow.com/questions/1206203/how-to-distinguish-between-left-and-right-mouse-click-with-jquery
   http://www.w3schools.com/jsref/dom_obj_event.asp

   overide mouse shape
   http://stackoverflow.com/questions/10750582/global-override-of-mouse-cursor-with-javascript
   https://developer.mozilla.org/en-US/docs/Web/API/Element/setCapture
   http://www.w3schools.com/cssref/tryit.asp?filename=trycss_cursor
   http://www.w3schools.com/cssref/playit.asp?filename=playcss_cursor&preval=row-resize
   http://www.w3schools.com/cssref/tryit.asp?filename=trycss_cursor
   */


  //http://maffelu.net/jquery-handle-left-click-right-click-and-double-click-at-the-same-time/
  // I just had to handle a left-click, right-click and a dbl-click at the same time which turned
  // out to be a bit tricky at first using just the mousedown function, but the solution was simple:
  /*$("#Foo")
   .click(function() //Left click
   {
   //Do something
   })
   .mousedown(function(e) //Right click
   {
   if(e.which == 3) //1: left, 2: middle, 3: right
   {
   //Do something
   }
   })
   .dblclick(function() //Double click
   {
   //Do something
   });
   */

  //mouse click started on Organism Canvas - only offspring can be selected if present
  $(document.getElementById('organCanvas')).on('mousedown', function (evt) {
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
    if (av.gen.didDivide) {  //offpsring exists
      distance = Math.sqrt(Math.pow(evt.offsetX - av.gen.cx[1], 2) + Math.pow(evt.offsetY - av.gen.cy[1], 2));
      if (25 > distance) {
        //for (var ii=1; ii<av.fzr.genome.length; ii++) document.getElementById(av.fzr.genome[ii].domId).style.cursor = 'copy';  //tiba delete later
        for (var dir in av.fzr.domid) {
          if ('g'==dir.substring(0,1)) document.getElementById(av.fzr.domid[dir]).style.cursor = 'copy';
        }
        document.getElementById('organIcon').style.cursor = 'copy';
        document.getElementById('organCanvas').style.cursor = 'copy';
        document.getElementById('mainBC').style.cursor = 'move';
        av.mouse.Picked = "offspring";
        if (av.debug.gen) console.log('av.gen.dna', av.gen.dna);
      }
    }
    if ('offspring' != av.mouse.Picked) {
      if (av.debug.gen) {console.log('gen', av.gen);}
      for (var gg = 0; gg < av.traceObj[av.gen.cycle].memSpace.length; gg++) { //gg is generation
        for (var ii = 0; ii < av.gen.dna[gg].length; ii++) {  //ii is the isntruction number
          distance = Math.sqrt(Math.pow(evt.offsetX - av.gen.smCenX[gg][ii], 2) + Math.pow(evt.offsetY - av.gen.smCenY[gg][ii], 2));
          if ( av.gen.smallR >= distance ){
            //console.log('found, gg, ii', gg, ii, '; xy',av.gen.smCenX[gg][ii],av.gen.smCenY[gg][ii] );
            ith = ii;
            hh = gg;
            av.mouse.Picked = 'instruction';
            break;
          }
        }
      }
    }
    var instructionNum = ith + 1;
    if ('instruction' == av.mouse.Picked) {
      if (isRightMB) {  //right click on instruction. allow replacement letter.
        if (av.debug.mouse) console.log('right click');
        evt.preventDefault();  //supposed to prevent default right click menu - does not work
        return false;         //supposed to prevent default right click menu - does not work
      }
      else {//hh is generation, ith is the instruction
        var labX = av.gen.cx[hh] + (av.gen.bigR[hh] + 2.1 * av.gen.smallR) * Math.cos(ith * 2 * Math.PI / av.gen.size[hh] + av.gen.rotate[hh]);
        var labY = av.gen.cy[hh] + (av.gen.bigR[hh] + 2.1 * av.gen.smallR) * Math.sin(ith * 2 * Math.PI / av.gen.size[hh] + av.gen.rotate[hh]);
        if (av.debug.mouse) console.log('ith, gn', ith, hh, '; rotate', av.gen.rotate[hh], '; xy', labX, labY);
        av.gen.ctx.beginPath();
        av.gen.ctx.arc(labX, labY, 1.1 * av.gen.smallR, 0, 2 * Math.PI);
        av.gen.ctx.fillStyle = dictColor['White'];  //use if av.gen.dna is a string
        av.gen.ctx.fill();   //required to render fill
        //draw number;
        av.gen.ctx.fillStyle = dictColor["Black"];
        av.gen.ctx.font = av.gen.fontsize + "px Arial";
        var txtW = av.gen.ctx.measureText(instructionNum).width;  //use if av.gen.dna is a string
        //txtW = av.gen.ctx.measureText(av.gen.dna[gg][ith]).width;     //use if av.gen.dna is an array
        av.gen.ctx.fillText(instructionNum, labX - txtW / 2, labY + av.gen.smallR / 2);  //use if av.gen.dna is a string
      }
    }
  });

  //if a cell is selected, arrow keys can move the selection
  $(document).keydown(function(e) {
    if (av.grd.flagSelected) {
      var moved = false;
      switch (e.which) {
        case 37: // left
          if (0 < av.grd.selectedCol) {
            av.grd.selectedCol = av.grd.selectedCol - 1;
            moved = true;
          }
          break;
        case 38: // up
          if (0 < av.grd.selectedRow) {
            av.grd.selectedRow = av.grd.selectedRow - 1;
            moved = true;
          }
          break;
        case 39: // right
          if (av.grd.selectedCol < av.grd.cols - 1) {
            av.grd.selectedCol++;
            moved = true;
          }
          break;
        case 40: // down
          if (av.grd.selectedRow < av.grd.rows - 1) {
            av.grd.selectedRow = av.grd.selectedRow + 1;
            moved = true;
          }
          break;
      }
      e.preventDefault(); // prevent the default action (scroll / move caret)
      av.grd.selectedNdx = av.grd.selectedRow*av.grd.cols + av.grd.selectedCol;
      if (moved && !av.grd.newrun) {  //look for decendents (kids)
        //find out if there is a kid in that cell
        //if which ancestor is not null then there is a 'kid' there.
        if (null != av.grd.msg.ancestor.data[av.grd.selectedNdx]) {
          av.grd.kidStatus = 'getgenome';
          doSelectedOrganismType(av.fio, av.grd);
          if (av.debug.mouse) console.log('kid', av.grd.kidName, av.grd.kidGenome);
          dijit.byId("mnFzOrganism").attr("disabled", false);  //When an organism is selected, then it can be save via the menu
          dijit.byId("mnOrganismTrace").attr("disabled", false);
        }
      }
      DrawGridSetup();
    }
  });

  //av.mouse down on the grid
  $(document.getElementById('gridCanvas')).on('mousedown', function (evt) {
    av.mouse.DnGridPos = [evt.offsetX, evt.offsetY];
    av.mouse.Dn = true;
    // Select if it is in the grid
    findSelected(evt, av.grd);
    //check to see if in the grid part of the canvas
    if (av.debug.mouse) console.log('av.mousedown', av.grd.selectedNdx);
    //if (av.debug.mouse) console.log('grid Canvas; selectedNdx', av.grd.selectedNdx,'________________________________');
    //if (av.debug.mouse) console.log('grid Canvas; av.grd.msg.ancestor[av.grd.selectedNdx]', av.grd.msg.ancestor.data[av.grd.selectedNdx]);
    if (av.grd.selectedCol >= 0 && av.grd.selectedCol < av.grd.cols && av.grd.selectedRow >= 0 && av.grd.selectedRow < av.grd.rows) {
      av.grd.flagSelected = true;
      if (av.debug.mouse) console.log('ongrid', av.grd.selectedNdx);
      DrawGridSetup();

      //In the grid and selected. Now look to see contents of cell are dragable.
      av.mouse.ParentNdx = -1; //index into parents array if parent selected else -1;
      if (av.grd.newrun) {  //run has not started so look to see if cell contains ancestor
        av.mouse.ParentNdx = findParentNdx(av.parents);
        if (av.debug.mouse) console.log('parent', av.mouse.ParentNdx);
        if (-1 < av.mouse.ParentNdx) { //selected a parent, check for dragging
          document.getElementById('organIcon').style.cursor = 'copy';
          document.getElementById('gridCanvas').style.cursor = 'copy';
          document.getElementById('TrashCanImage').style.cursor = 'copy';
          document.getElementById('mainBC').style.cursor = 'move';
          av.mouse.Picked = 'parent';
          //console.log('Parent cursor GT', document.getElementById('gridCanvas').style.cursor, dom.byId('TrashCanImage').style.cursor);
        }
      }
      else {  //look for decendents (kids)
        if (av.debug.mouse) console.log('kidSelected; selectedNdx', av.grd.selectedNdx,'________________________________');
        if (av.debug.mouse) console.log('kidSelected; av.grd.msg.ancestor[av.grd.selectedNdx]', av.grd.msg.ancestor.data[av.grd.selectedNdx]);
        //find out if there is a kid in that cell
        //if ancestor not null then there is a 'kid' there.
        if (null != av.grd.msg.ancestor.data[av.grd.selectedNdx]) {
          av.grd.kidStatus = 'getgenome';
          doSelectedOrganismType(av.fio, av.grd);
          SelectedKidMouseStyle(av.dnd, av.fzr, av.grd);
          av.mouse.Picked = 'kid';
          if (av.debug.mouse) console.log('kid', av.grd.kidName, av.grd.kidGenome);
          dijit.byId("mnFzOrganism").attr("disabled", false);  //When an organism is selected, then it can be save via the menu
          dijit.byId("mnOrganismTrace").attr("disabled", false);
        }
        else {
          dijit.byId("mnOrganismTrace").attr("disabled", true);
          dijit.byId("mnFzOrganism").attr("disabled", true);  //kid not selected, then it cannot be save via the menu
        }
      }
    }
    else {
      av.grd.flagSelected = false;
      av.grd.selectedNdx = -1;
      dijit.byId("mnOrganismTrace").attr("disabled", true);
      dijit.byId("mnFzOrganism").attr("disabled", true);
    }
    doSelectedOrganismType(av.fio, av.grd);
    DrawGridSetup();
  });

  //mouse move anywhere on screen - not currently in use.
  /*  $(document.getElementById('gridCanvas')).on('mousemove', function handler (evt) {
   //$(document).on('mousemove', function handler(evt) { //needed so cursor changes shape
   //console.log('gd move');
   //document.getElementById('gridCanvas').style.cursor = 'copy';
   //document.getElementById('trashCan').style.cursor = 'copy';
   //console.log('av.mouseMove cursor GT', document.getElementById('gridCanvas').style.cursor, dom.byId('trashCan').style.cursor);
   //if (av.debug.mouse) console.log('________________________________av.mousemove');
   if (!nearly([evt.offsetX, evt.offsetY], av.mouse.DnGridPos)) {
   //if (av.debug.mouse) console.log('________________________________');
   //if (av.debug.mouse) console.log("gd draging");
   if (av.mouse.Dn) av.mouse.Drag = true;
   }
   $(document).off('av.mousemove', handler);
   });
   */

  //When mouse button is released, return cursor to default values
  $(document).on('mouseup', function (evt) {
    'use strict';
    var target = '';
    if (av.debug.mouse) console.log('av.mouseup; evt', evt.target.id, evt);
    document.getElementById('organCanvas').style.cursor = 'default';
    document.getElementById('gridCanvas').style.cursor = 'default';
    document.getElementById('freezerDiv').style.cursor = 'default';
    document.getElementById('trashCan').style.cursor = 'default';
    document.getElementById('TrashCanImage').style.cursor = 'default';
    document.getElementById('mainBC').style.cursor = 'default';
    document.getElementById('organIcon').style.cursor = 'default';
    document.getElementById('fzOrgan').style.cursor = 'default';
    console.log('fzr', av.fzr);
    for (var dir in av.fzr.domid) document.getElementById(av.fzr.domid[dir]).style.cursor = 'default';
    av.mouse.UpGridPos = [evt.offsetX, evt.offsetY];
    if (av.debug.mouse) console.log('AvidaED.js: mouse.UpGridPosX, y', av.mouse.UpGridPos[0], av.mouse.UpGridPos[1]);
    av.mouse.Dn = false;

    // --------- process if something picked to dnd ------------------
    if ('parent' == av.mouse.Picked) {
      av.mouse.Picked = "";
      ParentMouse(evt, av);
      if ('gridCanvas' == evt.target.id || 'TrashCanImage' == evt.target.id) DrawGridSetup();
      else if ('organIcon' == evt.target.id) {
        //Change to Organism Page
        mainBoxSwap("organismBlock");
        organismCanvasHolderSize();
        var height = ($("#rightDetail").innerHeight() - 375) / 2;
        document.getElementById("ExecuteJust").style.height = height + "px";  //from http://stackoverflow.com/questions/18295766/javascript-overriding-styles-previously-declared-in-another-function
        document.getElementById("ExecuteAbout").style.height = height + "px";
        document.getElementById("ExecuteJust").style.width = "100%";
        document.getElementById("ExecuteAbout").style.width = "100%";
        console.log('from parent', av.parent, '; fzr', av.fzr);
        doOrgTrace(av.fio, av.fzr);  //request new Organism Trace from Avida and draw that.
      }
    }
    else if ('offspring' == av.mouse.Picked) {
      target = OffspringMouse(evt, av.dnd, av.fio, av.fzr, av.gen);
      //if ('fzOrgan' == target) { makePdbOrgan(av.fio, av.fzr)}  left over from putting workspace in database
      av.mouse.Picked = "";
    }
    else if ('kid' == av.mouse.Picked) {
      av.mouse.Picked = "";
      target = KidMouse(evt, av.dnd, av.fzr, av.grd);
      if ('organIcon' == evt.target.id) {
        //Change to Organism Page
        mainBoxSwap("organismBlock");
        organismCanvasHolderSize();
        var height = ($("#rightDetail").innerHeight() - 375) / 2;
        document.getElementById("ExecuteJust").style.height = height + "px";  //from http://stackoverflow.com/questions/18295766/javascript-overriding-styles-previously-declared-in-another-function
        document.getElementById("ExecuteAbout").style.height = height + "px";
        document.getElementById("ExecuteJust").style.width = "100%";
        document.getElementById("ExecuteAbout").style.width = "100%";
        doOrgTrace(av.fio, av.fzr);  //request new Organism Trace from Avida and draw that.
      }
/*      else if ('fzOrgan' == target) {
        //make_database_entry if using a database (av.fio, av.fzr);
      }
*/
    }
    av.mouse.Picked = "";
  });

  /* *************************************************************** */
  // ****************  Draw Population Grid ************************ */
  /* *************************************************************** */

  //Set up canvas objects
  av.grd.CanvasScale = document.getElementById("scaleCanvas");
  av.grd.sCtx = av.grd.CanvasScale.getContext("2d");
  av.grd.CanvasGrid = document.getElementById('gridCanvas');
  av.grd.cntx = av.grd.CanvasGrid.getContext("2d");
  av.grd.CanvasSelected = document.getElementById('SelectedColor');
  av.grd.selCtx = av.grd.CanvasSelected.getContext('2d');
  av.grd.SelectedWd = $('#SelectedColor').innerWidth();
  av.grd.SelectedHt = $('#SelectedColor').innerHeight();

  av.grd.CanvasScale.width = $("#gridHolder").innerWidth() - 6;
  av.grd.CanvasGrid.width = $("#gridHolder").innerWidth() - 6;
  av.grd.CanvasGrid.height = $("#gridHolder").innerHeight() - 16 - av.grd.CanvasScale.height;

  //--------------------------------------------------------------------------------------------------------------------
  function DrawGridSetup() {
    var gridHolderHt = document.getElementById('gridHolder').clientHeight;

    if(!av.grd.newrun && undefined != av.grd.msg.fitness) {
      setMapData(av.grd);  //update color information for offpsring once run has started
      findLogicOutline(av.grd);
    }
    /*
     //http://stackoverflow.com/questions/10118172/setting-div-width-and-height-in-javascript
     //the console.log is to look at why scroll bars show up when they should not
     console.log('mapBlockHold Ht scroll, client', document.getElementById('mapBlockHold').scrollHeight,document.getElementById('mapBlockHold').clientHeight);
     console.log('mapBlock Ht scroll, client', document.getElementById('mapBlock').scrollHeight,document.getElementById('mapBlock').clientHeight);
     console.log('popBot Ht scroll, client', document.getElementById('popBot').scrollHeight,document.getElementById('popBot').clientHeight);
     console.log('scaleDiv Ht scroll, client', document.getElementById('scaleDiv').scrollHeight,document.getElementById('scaleDiv').clientHeight);
     console.log('gridHolder Ht scroll, client', document.getElementById('gridHolder').scrollHeight,document.getElementById('gridHolder').clientHeight);
     console.log('Canvas Ht Grid, Scale total, client Total', av.grd.CanvasGrid.height, av.grd.CanvasScale.height, av.grd.CanvasGrid.height+av.grd.CanvasScale.height)

     console.log('mapBlockHold Wd scroll, client', document.getElementById('mapBlockHold').scrollWidth,document.getElementById('mapBlockHold').clientWidth);
     console.log('mapBlock Wd scroll, client', document.getElementById('mapBlock').scrollWidth,document.getElementById('mapBlock').clientWidth);
     console.log('popBot Wd scroll, client', document.getElementById('popBot').scrollWidth,document.getElementById('popBot').clientWidth);
     console.log('gridHolder Wd scroll, client', document.getElementById('gridHolder').scrollWidth,document.getElementById('gridHolder').clientWidth);
     console.log('scaleDiv Wd scroll, client', document.getElementById('scaleDiv').scrollWidth,document.getElementById('scaleDiv').clientWidth);
     console.log('Canvas Wd Grid, Scale total, client Total', av.grd.CanvasGrid.width, av.grd.CanvasScale.width, av.grd.CanvasGrid.width+av.grd.CanvasScale.width)
     */  //find width

    var mapBlockHoldWd = document.getElementById('mapBlockHold').clientWidth-2;
    if (navigator.userAgent.indexOf('Mac OS X') != -1) {
      //document.getElementById('mapBlock').style.height = '96%'; //96
    } else {
      //document.getElementById('mapBlock').style.height = '94%';  //94
      if (brs.chrome) mapBlockHoldWd = document.getElementById('mapBlockHold').clientWidth;
    }

    var mapBlockWd = mapBlockHoldWd-8;
    var num = mapBlockHoldWd-22;
    //console.log('mapBlockHoldWd, mapBlockWd, num',mapBlockHoldWd, mapBlockWd,num)
    av.grd.CanvasScale.width = num;
    av.grd.CanvasGrid.width = av.grd.CanvasScale.width;
    document.getElementById('gridTable').style.width = num + 'px';
    num += 2;
    document.getElementById('gridHolder').style.width = num + 'px';
    document.getElementById('scaleDiv').style.width = num + 'px';
    num += 14;
    document.getElementById('popBot').style.width = num + 'px';

    document.getElementById('mapBlock').style.width = mapBlockWd + 'px';
    document.getElementById('mapBlockHold').style.width = mapBlockHoldWd + 'px';

    //Determine if a color gradient or legend will be displayed
//    if ("Ancestor Organism" == dijit.byId("colorMode").value) { findLegendSize(av.grd, av.parents); drawLegend(av.grd, av.parents) }
    document.getElementById('popBot').style.height = '5px';
    if ("Ancestor Organism" == dijit.byId("colorMode").value) { drawLegend(av.grd, av.parents) }
    else { GradientScale(av.grd) }
    document.getElementById('popBot').style.height = document.getElementById('popBot').scrollHeight + 'px';

    num = document.getElementById('mapBlockHold').clientHeight-6;
    document.getElementById('mapBlock').style.height = num + 'px';

    gridHolderHt = document.getElementById('mapBlock').clientHeight - document.getElementById('popBot').scrollHeight - document.getElementById('scaleDiv').scrollHeight-16;

    //console.log('gridHolderHt', gridHolderHt);
    document.getElementById('gridHolder').style.height = gridHolderHt + 'px';

    av.grd.CanvasGrid.height = gridHolderHt - 6;

    //find the space available to display the grid in pixels
    av.grd.spaceX = av.grd.CanvasGrid.width;
    av.grd.spaceY = av.grd.CanvasGrid.height;
    //console.log('spaceY', av.grd.spaceY, '; gdHolder', gridHolderHt, '; scaleCanv', av.grd.CanvasScale.height);

    //DrawGridBackground(av.grd);        //use to test scroll bars instead of the two calls below; in PopulationGrid.js
    findGridSize(av.grd, av.parents);     //in PopulationGrid.js
    //console.log('mid gridHolder Ht scroll, client', document.getElementById('gridHolder').scrollHeight,document.getElementById('gridHolder').clientHeight);
    //console.log('mid Canvas Ht Grid, Scale, popBot total, client Total', av.grd.CanvasGrid.height, av.grd.CanvasScale.height,document.getElementById('popBot').clientHeight, av.grd.CanvasGrid.height+av.grd.CanvasScale.height+document.getElementById('popBot').clientHeight)

    if (document.getElementById('gridHolder').scrollHeight==document.getElementById('gridHolder').clientHeight+17){
      var numGH = document.getElementById('gridHolder').clientHeight;
      av.grd.CanvasGrid.height = numGH - 6-17;
      findGridSize(av.grd, av.parents);     //in PopulationGrid.js
    }
    DrawGridUpdate(av.grd, av.parents);   //in PopulationGrid.js

    //console.log('after');
    /*   console.log('gridHolder Ht scroll, client', document.getElementById('gridHolder').scrollHeight,document.getElementById('gridHolder').clientHeight);
     console.log('Canvas Ht Grid, Scale, popBot total, client Total', av.grd.CanvasGrid.height, av.grd.CanvasScale.height,document.getElementById('popBot').clientHeight, av.grd.CanvasGrid.height+av.grd.CanvasScale.height+document.getElementById('popBot').clientHeight)
     console.log('mapBlockHold Ht scroll, client', document.getElementById('mapBlockHold').scrollHeight,document.getElementById('mapBlockHold').clientHeight);
     console.log('mapBlock Ht scroll, client', document.getElementById('mapBlock').scrollHeight,document.getElementById('mapBlock').clientHeight);
     console.log('popBot Ht scroll, client', document.getElementById('popBot').scrollHeight,document.getElementById('popBot').clientHeight);
     console.log('scaleDiv Ht scroll, client', document.getElementById('scaleDiv').scrollHeight,document.getElementById('scaleDiv').clientHeight);
     /*
     console.log('mapBlockHold Wd scroll, client', document.getElementById('mapBlockHold').scrollWidth,document.getElementById('mapBlockHold').clientWidth);
     console.log('mapBlock Wd scroll, client', document.getElementById('mapBlock').scrollWidth,document.getElementById('mapBlock').clientWidth);
     console.log('popBot Wd scroll, client', document.getElementById('popBot').scrollWidth,document.getElementById('popBot').clientWidth);
     console.log('gridHolder Wd scroll, client', document.getElementById('gridHolder').scrollWidth,document.getElementById('gridHolder').clientWidth);
     console.log('scaleDiv Wd scroll, client', document.getElementById('scaleDiv').scrollWidth,document.getElementById('scaleDiv').clientWidth);
     console.log('Canvas Wd Grid, Scale total, client Total', av.grd.CanvasGrid.width, av.grd.CanvasScale.width, av.grd.CanvasGrid.width+av.grd.CanvasScale.width)
     console.log('-----------------------------------------')
     */
  }

  function removeWideScrollbar_example(scrollDiv, htChangeDiv, page) {
    //https://tylercipriani.com/2014/07/12/crossbrowser-javascript-scrollbar-detection.html
    //if the two heights are different then there is a scroll bar
    var ScrollDif = document.getElementById(scrollDiv).scrollHeight - document.getElementById(scrollDiv).clientHeight;
    var hasScrollbar = 0 < ScrollDif;
    if (av.debug.root) console.log('scroll',scrollDiv, hasScrollbar, document.getElementById(scrollDiv).scrollHeight,
      document.getElementById(scrollDiv).clientHeight, '; htChangeDiv=',document.getElementById(htChangeDiv).scrollHeight,
      document.getElementById(htChangeDiv).offsetHeight , document.getElementById(htChangeDiv).style.height);

    var divHt = document.getElementById(htChangeDiv).style.height.match(/\d/g);  //get 0-9 globally in the string  //http://stackoverflow.com/questions/10003683/javascript-get-number-from-string
    divHt = divHt.join(''); //converts array to string
    var NewHt = Number(divHt) + 1 + ScrollDif;  //add the ht difference to the outer div that holds this one
    //line below is where the height of the div actually changes
    document.getElementById(htChangeDiv).style.height = NewHt + 'px';

    //redraw the screen
    mainBoxSwap(page);
    if (debut.root) console.log('Afterscroll', hasScrollbar, document.getElementById(scrollDiv).scrollHeight,
      document.getElementById(scrollDiv).clientHeight, '; htChangeDiv=',document.getElementById(htChangeDiv).scrollHeight,
      document.getElementById(htChangeDiv).offsetHeight , document.getElementById(htChangeDiv).style.height);
  }

  //
  // The rest of this code is in PopulationGrid.js
  // *************************************************************** */
  //        Color Map Color Mode and Zoom Slide Controls             //
  // *************************************************************** */

  //Get color map data from Avida and draw
  dijit.byId("colorMode").on("Change", function () {
    var scaleType = dijit.byId("colorMode").value;
    //need to request data to update the color map from Avida
    // code for that
    //Redraw Grid;
    DrawGridSetup();
  });

  //Only effect display, not Avida
  // Zoom slide
  av.grd.ZoomSlide = new HorizontalSlider({
    name: "ZoomSlide",
    value: 1,
    minimum: 1,
    maximum: 10,
    intermediateChanges: true,
    discreteValues: 19,
    style: "height: auto; width: 120px;float:right",
    onChange: function (value) {
      av.grd.zoom = value;
      //console.log('ZoomSlide', av.grd.zoom);
      DrawGridSetup();
    }
  }, "ZoomSlide");

  av.grd.colorMap = 'Gnuplot2';
  dijit.byId("mnGnuplot2").attr("disabled", true);

  dijit.byId("mnViridis").on("Click", function () {
    dijit.byId("mnCubehelix").attr("disabled", false);
    dijit.byId("mnGnuplot2").attr("disabled", false);
    dijit.byId("mnViridis").attr("disabled", true);
    av.grd.colorMap = 'Viridis';
    DrawGridSetup();
  });

  dijit.byId("mnGnuplot2").on("Click", function () {
    dijit.byId("mnCubehelix").attr("disabled", false);
    dijit.byId("mnGnuplot2").attr("disabled", true);
    dijit.byId("mnViridis").attr("disabled", false);
    av.grd.colorMap = 'Gnuplot2';
    DrawGridSetup();
  });

  dijit.byId("mnCubehelix").on("Click", function () {
    dijit.byId("mnCubehelix").attr("disabled", true);
    dijit.byId("mnGnuplot2").attr("disabled", false);
    dijit.byId("mnViridis").attr("disabled", false);
    av.grd.colorMap = 'Cubehelix';
    DrawGridSetup();
  });

  // *************************************************************** */
  //    Buttons that select organisms that perform a logic function
  // *************************************************************** */
  if (av.debug.root) console.log('before logic buttons');

  function toggle(button) {
    if ('on' == document.getElementById(button).value) {
      document.getElementById(button).value = 'off';
      document.getElementById(button).className = 'bitButtonOff';
    }
    else {
      document.getElementById(button).value = 'on';
      document.getElementById(button).className = 'bitButtonOn';
    }
    for (ii=0; ii<av.grd.ave_fitness.length; ii++){
      av.grd.log_fitness[ii] = null;
      av.grd.log_gestation_time[ii] = null;
      av.grd.log_metabolic_rate[ii] = null;
      av.grd.log_pop_size[ii] = null;
    }
    DrawGridSetup();
  }

  document.getElementById("notButton").onclick = function () {toggle('notButton');}
  document.getElementById("nanButton").onclick = function () {toggle('nanButton');}
  document.getElementById("andButton").onclick = function () {toggle('andButton');}
  document.getElementById("ornButton").onclick = function () {toggle('ornButton');}
  document.getElementById("oroButton").onclick = function () {toggle('oroButton');}
  document.getElementById("antButton").onclick = function () {toggle('antButton');}
  document.getElementById("norButton").onclick = function () {toggle('norButton');}
  document.getElementById("xorButton").onclick = function () {toggle('xorButton');}
  document.getElementById("equButton").onclick = function () {toggle('equButton');}

  // *************************************************************** */
  // ******* Population Setup Buttons from 'Setup' subpage ********* */
  // *************************************************************** */
  av.grd.gridWasCols = Number(document.getElementById("sizeCols").value);
  av.grd.gridWasRows = Number(document.getElementById("sizeRows").value);

  function popSizeFn() {
    var NewCols = Number(document.getElementById("sizeCols").value);
    var NewRows = Number(document.getElementById("sizeRows").value);
    document.getElementById("sizeCells").innerHTML = "is a total of " + NewCols * NewRows + " cells";
    //Linear scale the position for Ancestors added by hand;
    if (undefined != av.parents.handNdx) {
      for (var ii = 0; ii < av.parents.handNdx.length; ii++) {
        //console.log('old cr', av.parents.col[av.parents.handNdx[ii]], av.parents.row[av.parents.handNdx[ii]]);
        av.parents.col[av.parents.handNdx[ii]] = Math.floor(NewCols * av.parents.col[av.parents.handNdx[ii]] / gridWasCols);  //was trunc
        av.parents.row[av.parents.handNdx[ii]] = Math.floor(NewRows * av.parents.row[av.parents.handNdx[ii]] / gridWasRows);  //was trunc
        av.parents.AvidaNdx[av.parents.handNdx[ii]] = av.parents.col[av.parents.handNdx[ii]] + NewCols * av.parents.row[av.parents.handNdx[ii]];
        //console.log('New cr', av.parents.col[av.parents.handNdx[ii]], av.parents.row[av.parents.handNdx[ii]]);
      }
    }
    av.grd.gridWasCols = Number(document.getElementById("sizeCols").value);
    av.grd.gridWasRows = Number(document.getElementById("sizeRows").value);
    //reset zoom power to 1
    av.grd.ZoomSlide.set("value", 1);
    PlaceAncestors(av.parents);
    //are any parents on the same cell?
    cellConflict(NewCols, NewRows, av.grd, av.parents);
  }

  dijit.byId("sizeCols").on("Change", popSizeFn);
  dijit.byId("sizeRows").on("Change", popSizeFn);

  $(function slidemute() {
    /* because most mutation rates will be less than 2% I set up a non-linear scale as was done in the Mac Avida-ED */
    /* the jQuery slider I found only deals in integers and the fix function truncates rather than rounds, */
    /* so I multiplied by 100,000 to get 100.000% to come out even. */
    //console.log("before defaultslide value");
    var muteSlideDefault = 109861.
    /* results in 2% as a default */
    var muteDefault = (Math.pow(Math.E, (muteSlideDefault / 100000)) - 1).toFixed(3)
    var slides = $("#muteSlide").slider({
      // range: "min",   /*causes the left side of the scroll bar to be grey */
      value: muteSlideDefault,
      min: 0.0,
      max: 461512,
      slide: function (event, ui) {
        //$( "#mRate" ).val( ui.value);  /*put slider value in the text above the slider */
        $("#muteInput").val((Math.pow(Math.E, (ui.value / 100000)) - 1).toFixed(3));
        /*put the value in the text box */
      }
    });
    /* initialize */
    //$( "#mRate" ).val( ($( "#muteSlide").slider( "value" )));  //used in testing nonlinear scale
    $("#muteInput").val(muteDefault);
    /*update slide based on textbox */
    $("#muteInput").change(function () {
      slides.slider("value", 100000.0 * Math.log(1 + (parseFloat(this.value))));
      $("#mRate").val(100000 * Math.log(1 + (parseFloat(this.value))));
      //console.log("in mute change");
    });
  });

  /* ---------------------------------------------------------------------- */
  /*                    Population Chart   ; pop chart; popchart            */
  /* ---------------------------------------------------------------------- */

  //need to get the next two values from real data.
  //var popY = [1, 1, 1, 2, 2, 2, 4, 4, 4, 8,8,8,14,15,16,16,16,24,24,25,26,36,36,36,48,48]; /
  var popY = [];
  var popY2 = [];
  var ytitle = dijit.byId("yaxis").value;
  var popChart = new Chart("popChart");

  //use theme to change grid color based on tick color http://stackoverflow.com/questions/6461617/change-the-color-of-grid-plot-dojo
  //this required the use of a theme, but I'm no longer using the theme. Could take 'Wetland' out of require statemet as long a this is not used
  //var myTheme = Wetland; // Or any other theme
  //myTheme.axis.majorTick.color = "#CCC";  //grey
  //myTheme.axis.minorTick.color = "red";

  function popChartFn() {
    if ("Average Fitness" == dijit.byId("yaxis").value) {
      popY = av.grd.ave_fitness;
      popY2 = av.grd.log_fitness;
    }
    else if ("Average Gestation Time" == dijit.byId("yaxis").value) {
      popY = av.grd.ave_gestation_time;
      popY2 = av.grd.log_gestation_time;
    }
    else if ("Average Metabolic Rate" == dijit.byId("yaxis").value) {
      popY = av.grd.ave_metabolic_rate;
      popY2 = av.grd.log_metabolic_rate;
    }
    else if ("Number of Organisms" == dijit.byId("yaxis").value) {
      popY = av.grd.population_size;
      popY2 = av.grd.log_pop_size;
    }
    //console.log('popY',popY);
    //console.log('pop2', popY2);
    //popChart.setTheme(myTheme);
    popChart.addPlot("default", {type: "Lines"});
    //popChart.addPlot("grid",{type:"Grid",hMinorLines:false});  //if color not specified it uses tick color.
    // grid info from https://dojotoolkit.org/reference-guide/1.10/dojox/charting.html
    popChart.addPlot("grid", {
      type: Grid, hMajorLines: true, majorHLine: {color: "#CCC", width: 1},
      vMajorLines: true, majorVLine: {color: "#CCC", width: 1}
    });

    popChart.addAxis("x", {
      fixLower: "major", fixUpper: "major", title: 'Time (updates)', titleOrientation: 'away', titleGap: 2,
      titleFont: "normal normal normal 8pt Arial", font: "normal normal normal 8pt Arial"
    });
    //popChart.addAxis("y", {vertical: true, title: ytitle, titleFont: "normal normal normal 8pt Arial", titleOrientation: 'axis',
    popChart.addAxis("y", {
      vertical: true,
      fixLower: "major", fixUpper: "major", min: 0, font: "normal normal normal 8pt Arial", titleGap: 4,
    });
    //popChart.addSeries("Series y", popY, {stroke: {color: "blue", width: 1}});
    //popChart.addSeries("Series y2", popY2, {stroke: {color: "red", width: 2}});
    popChart.addSeries("Series y", popY, {plot: "default", stroke: {color: "blue", width: 1}});
    popChart.addSeries("Series y2", popY2, {plot: "default", stroke: {color: "green", width: 1}});
    popChart.resize(domGeometry.position(document.getElementById("popChartHolder")).w - 10,
      domGeometry.position(document.getElementById("popChartHolder")).h - 30);
    popChart.render();
  };

  //Set Y-axis title and choose the correct array to plot
  dijit.byId("yaxis").on("Change", function () {
    ytitle = dijit.byId("yaxis").value;
    //need to get correct array to plot from freezer
    //console.log('changeyaxis popChartFn');
    popChartFn();
  });

  /* *************************************************************** */
  /* Organism page script *********************************************/
  /* *************************************************************** */
  /* **** Organism Setup Dialog */

  //process button to hide or show Organism detail panal.
  var DetailsFlag = true;
  document.getElementById("OrgDetailsButton").onclick = function () {
    if (DetailsFlag) {
      DetailsFlag = false;
      dijit.byId("rightDetail").set("style", "display: none;");
      registry.byId("rightDetail").domNode.style.width = "1px";
      registry.byId("mainBC").layout();
    }
    else {
      DetailsFlag = true;
      dijit.byId("rightDetail").set("style", "display: block; visibility: visible;");
      registry.byId("rightDetail").domNode.style.width = "180px";
      registry.byId("mainBC").layout();
    }
  };

  //Opens Settings dialog box
  document.getElementById("OrgSetting").onclick = function () {
    av.gen.settingsChanged = false;
    OrganSetupDialog.show();
  }

  //If settings were changed then this will request new data when the settings dialog box is closed.
  OrganSetupDialog.connect(OrganSetupDialog, "hide", function(e){
    console.log('settings dialog closed', av.gen.settingsChanged);
    if (av.gen.settingsChanged) doOrgTrace(av.fio, av.fzr);
  });

  $(function slideOrganism() {
    /* because most mutation rates will be less than 2% I set up a non-linear scale as was done in the Mac Avida-ED */
    /* the jQuery slider I found only deals in integers and the fix function truncates rather than rounds, */
    /* so I multiplied by 100,000 to get 100.000% to come out even. */
    //console.log("before defaultslide value");
    var muteSlideDefault = 109861.
    /* results in 2% as a default */
    var muteDefault = (Math.pow(Math.E, (muteSlideDefault / 100000)) - 1).toFixed(3)
    var slides = $("#orMuteSlide").slider({
      // range: "min",   /*causes the left side of the scroll bar to be grey */
      value: muteSlideDefault,
      min: 0.0,
      max: 461512,
      slide: function (event, ui) {
        //$( "#orMRate" ).val( ui.value);  /*put slider value in the text near slider */
        $("#orMuteInput").val((Math.pow(Math.E, (ui.value / 100000)) - 1).toFixed(3) + "%");
        /*put the value in the text box */
        av.gen.settingsChanged = true;
        if (av.debug.trace) console.log('orSlide changed', av.gen.settingsChanged)
      }
    });
    /* initialize */
    //$( "#orMRate" ).val( ($( "#orMuteSlide").slider( "value" )));
    //$( "#orMuteInput" ).val(muteDefault+"%");
    $("#orMuteInput").val(muteDefault);
    /*update slide based on textbox */
    $("#orMuteInput").change(function () {
      slides.slider("value", 100000.0 * Math.log(1 + (parseFloat(this.value))));
      av.gen.settingsChanged = true;
      if (av.debug.trace) console.log('orMute changed', av.gen.settingsChanged)
      //$( "#orMRate" ).val( 100000*Math.log(1+(parseFloat(this.value))) );
      //console.log("in mute change");
    });
  });

  //triggers flag that requests more data when the settings dialog is closed.
  //http://stackoverflow.com/questions/3008406/dojo-connect-wont-connect-onclick-with-button
  dojo.connect(dijit.byId('OrganExperimentRadio'), 'onClick', function() {av.gen.settingsChanged=true;});
  dojo.connect(dijit.byId('OrganDemoRadio'), 'onClick', function() {av.gen.settingsChanged=true;});

  // ****************************************************************
  //        Menu buttons that call for genome/Organism trace
  // ****************************************************************
  dijit.byId("mnOrganismTrace").on("Click", function () {
    traceSelected(av.dnd, av.fzr, av.grd);
    mainBoxSwap("organismBlock");
    organismCanvasHolderSize();
    var height = ($("#rightDetail").innerHeight() - 375) / 2;
    document.getElementById("ExecuteJust").style.height = height + "px";  //from http://stackoverflow.com/questions/18295766/javascript-overriding-styles-previously-declared-in-another-function
    document.getElementById("ExecuteAbout").style.height = height + "px";
    document.getElementById("ExecuteJust").style.width = "100%";
    document.getElementById("ExecuteAbout").style.width = "100%";
    doOrgTrace(av.fio, av.fzr);  //request new Organism Trace from Avida and draw that.
  });

  //Put the offspring in the parent position on Organism Trace
  dijit.byId("mnOffspringTrace").on("Click", function () {
    //Open Oranism view
    mainBoxSwap("organismBlock");
    organismCanvasHolderSize();
    var height = ($("#rightDetail").innerHeight() - 375) / 2;
    document.getElementById("ExecuteJust").style.height = height + "px";  //from http://stackoverflow.com/questions/18295766/javascript-overriding-styles-previously-declared-in-another-function
    document.getElementById("ExecuteAbout").style.height = height + "px";
    document.getElementById("ExecuteJust").style.width = "100%";
    document.getElementById("ExecuteAbout").style.width = "100%";
    offspringTrace(av.dnd, av.fio, av.fzr, av.gen);
  });

  /* ****************************************************************/
  /*                  Canvas for Organsim View (genome)
   /* ************************************************************** */

  av.gen = clearGen(av.gen);
  //set canvas size; called from many places
  function organismCanvasHolderSize() {
    av.gen.OrgCanvas.width = $("#organismCanvasHolder").innerWidth() - 6;
    av.gen.OrgCanvas.height = $("#organismCanvasHolder").innerHeight() - 12;
  }

  function updateOrgTrace() {
    //set canvas size
    //console.log('gen', av.gen);
    //console.log('av.traceObj', av.traceObj);
    organismCanvasHolderSize();
    //if (undefined == av.traceObj[av.gen.cycle]) console.log('its undefined');
    if (!(undefined == av.traceObj || {} == av.traceObj || undefined == av.traceObj[av.gen.cycle])) {
      av.gen.didDivide = av.traceObj[av.gen.cycle].didDivide; //update global version of didDivide
      updateOrganTrace(av.traceObj, av.gen);
    }
    else av.gen.didDivide = false;
  }
  /* ****************************************************************/
  /*             End of Canvas to draw genome and update details
   /* ************************************************************** */

  /* **** Controls bottum of organism page **************************/
  var update_timer = null;

  function outputUpdate(vol) {
    document.querySelector('#orgCycle').value = vol;
  }

  dijit.byId("orgBack").on("Click", function () {
    var ii = Number(document.getElementById("orgCycle").value);
    if (cycleSlider.get("minimum") < cycleSlider.get("value")) {
      ii--;
      dijit.byId("orgCycle").set("value", ii);
      av.gen.cycle = ii;
      updateOrgTrace()
    }
  });

  dijit.byId("orgForward").on("Click", function () {
    var ii = Number(document.getElementById("orgCycle").value);
    if (cycleSlider.get("maximum") > cycleSlider.get("value")) {
      ii++;
      dijit.byId("orgCycle").set("value", ii);
      av.gen.cycle = ii;
      console.log('ii', ii,'; gen', av.gen);
      updateOrgTrace()
    }
  });

  dijit.byId("orgReset").on("Click", function () {
    dijit.byId("orgCycle").set("value", 0);
    av.gen.cycle = 0;
    updateOrgTrace();
    orgStopFn()
  });

  function orgStopFn() {
    if (update_timer) {
      clearInterval(update_timer);
    }
    dijit.byId("orgRun").set("label", "Run");
  }

  function orgRunFn() {
    if (cycleSlider.get("maximum") > cycleSlider.get("value")) {
      av.gen.cycle++;
      dijit.byId("orgCycle").set("value", av.gen.cycle);
      updateOrgTrace();
    }
    else {
      orgStopFn();
    }
  }

  dijit.byId("orgRun").on("Click", function () {
    if ("Run" == dijit.byId("orgRun").get("label")) {
      dijit.byId("orgRun").set("label", "Stop");
      update_timer = setInterval(orgRunFn, 100);
    }
    else {
      orgStopFn();
    }
  });

  dijit.byId("orgEnd").on("Click", function () {
    dijit.byId("orgCycle").set("value", cycleSlider.get("maximum"));
    av.gen.cycle = cycleSlider.get("maximum");
    updateOrgTrace();
    orgStopFn()
  });

  dijit.byId("orgCycle").on("Change", function (value) {
    cycleSlider.set("value", value);
    av.gen.cycle = value;
    //console.log('orgCycle.change');
    updateOrgTrace();
  });

  /* Organism Gestation Length Slider */
  var cycleSlider = new HorizontalSlider({
    name: "cycleSlider",
    value: 0,
    minimum: 0,
    maximum: 200,
    intermediateChanges: true,
    discreteValues: 201,
    style: "width:100%;",
    onChange: function (value) {
      document.getElementById("orgCycle").value = value;
      av.gen.cycle = value;
      //console.log('cycleSlider');
      updateOrgTrace();
    }
  }, "cycleSlider");

  /* ****************************************************************/
  /* Analysis Page **************************************************/
  /* ****************************************************************/
  var plt = {};
  plt.dictPlota = {};
  plt.dictPlotb = {};
  plt.dictPlota["@example"] = [1, 2, 1, 2, 2, 3, 2, 3, 3, 4];
  plt.dictPlota["m2w30u1000not"] = [0.6, 1.8, 2, 2, 2.4, 2.7, 3];
  plt.dictPlota["m2w30u1000nand"] = [1, 1, 1.5, 2, 3, 3, 4, 4, 4.5];
  plt.dictPlotb["@example"] = [60, 50, 50, 40, 40, 37, 30, 20, 15, 7];
  plt.dictPlotb["m2w30u1000not"] = [70, 68, 60, 50, 50, 47, 40];
  plt.dictPlotb["m2w30u1000nand"] = [80, 70, 75, 60, 50, 50, 40, 40, 30];
  plt.dictPlota["newPopulation"] = [0.5, 1, 2, 1.7, 2, 2.7, 3.2, 3.2];
  plt.dictPlotb["newPopulation"] = [65, 50, 50, 47, 40, 37, 32, 22];
  plt.pop1a = [];
  plt.pop1b = [];
  plt.pop2a = [];
  plt.pop2b = [];
  plt.pop3a = [];
  plt.pop3b = [];
  var color1 = dictColor[dijit.byId("pop1color").value];
  var color2 = dictColor[dijit.byId("pop2color").value];
  var color3 = dictColor[dijit.byId("pop3color").value];
  var y1title = "Average Fitness";
  var y2title = 'Average Gestation Time';
  var anaChart = new Chart("analyzeChart");

  function AnaChartFn() {
    anaChart.addPlot("default", {type: "Lines", hAxis: "x", vAxis: "y"});
    anaChart.addPlot("other", {type: "Lines", hAxis: "x", vAxis: "right y"});
    //grid line info on https://dojotoolkit.org/reference-guide/1.10/dojox/charting.html
    anaChart.addPlot("grid", {
      type: Grid, hMajorLines: true, majorHLine: {color: "#CCC", width: 1},
      vMajorLines: true, majorVLine: {color: "#CCC", width: 1}
    });
    anaChart.addAxis("x", {fixLower: "major", fixUpper: "major", title: 'Time (updates)', titleOrientation: 'away'});
    anaChart.addAxis("y", {
      vertical: true,
      fixLower: "major",
      title: y1title,
      titleOrientation: 'axis',
      fixUpper: "major",
      min: 0
    });
    //anaChart.addAxis("top x", {leftBottom: false});
    anaChart.addAxis("right y", {vertical: true, leftBottom: false, min: 0, title: y2title});
    anaChart.addSeries("Series 1a", plt.pop1a, {stroke: {color: color1, width: 2}});
    anaChart.addSeries("Series 2a", plt.pop2a, {stroke: {color: color2, width: 2}});
    anaChart.addSeries("Series 3a", plt.pop3a, {stroke: {color: color3, width: 2}});
    anaChart.addSeries("Series 1b", plt.pop1b, {plot: "other", stroke: {color: color1, width: .3}});
    anaChart.addSeries("Series 2b", plt.pop2b, {plot: "other", stroke: {color: color2, width: .3}});
    anaChart.addSeries("Series 3b", plt.pop3b, {plot: "other", stroke: {color: color3, width: .3}});

    anaChart.resize(domGeometry.position(document.getElementById("chartHolder")).w - 10,
      domGeometry.position(document.getElementById("chartHolder")).h - 15);
    var dZoom = new MouseZoomAndPan(anaChart, "default");
    //https://www.sitepen.com/blog/2012/11/09/dojo-charting-zooming-scrolling-and-panning/  a different zoom method using a window.
    anaChart.render();
  };

  /* Chart buttons ****************************************/
  document.getElementById("pop1delete").onclick = function () {
    plt.pop1a = [];
    plt.pop1b = [];
    AnaChartFn();
    av.dnd.graphPop1.selectAll().deleteSelectedNodes();
  }
  document.getElementById("pop2delete").onclick = function () {
    plt.pop2a = [];
    plt.pop2b = [];
    AnaChartFn();
    av.dnd.graphPop2.selectAll().deleteSelectedNodes();
  }
  document.getElementById("pop3delete").onclick = function () {
    plt.pop3a = [];
    plt.pop3b = [];
    AnaChartFn();
    av.dnd.graphPop3.selectAll().deleteSelectedNodes();
  }
  dijit.byId("pop1color").on("Change", function () {
    color1 = dictColor[dijit.byId("pop1color").value];
    AnaChartFn();
  });
  dijit.byId("pop2color").on("Change", function () {
    color2 = dictColor[dijit.byId("pop2color").value];
    AnaChartFn();
  });
  dijit.byId("pop3color").on("Change", function () {
    color3 = dictColor[dijit.byId("pop3color").value];
    AnaChartFn();
  });

  //Set Y-axis title and choose the correct array to plot
  dijit.byId("y1select").on("Change", function () {
    y1title = dijit.byId("y1select").value;
    //need to get correct array to plot from freezer
    AnaChartFn();
  });

  dijit.byId("y2select").on("Change", function () {
    y2title = dijit.byId("y2select").value;
    //need to get correct array to plot from freezer
    AnaChartFn();
  });

  //************************************************************************
  //Tasks that Need to be run when page is loaded but after chart is defined
  //************************************************************************

  //used to set the height so the data just fits. Done because different monitor/brower combinations require a diffent height in pixels.
  //may need to take out as requires loading twice now.

  function removeVerticalScrollbar(scrollDiv, htChangeDiv, page) {
    //https://tylercipriani.com/2014/07/12/crossbrowser-javascript-scrollbar-detection.html
    //if the two heights are different then there is a scroll bar
    var ScrollDif = document.getElementById(scrollDiv).scrollHeight - document.getElementById(scrollDiv).clientHeight;
    var hasScrollbar = 0 < ScrollDif;
    if (av.debug.root) console.log('scroll',scrollDiv, hasScrollbar, document.getElementById(scrollDiv).scrollHeight,
      document.getElementById(scrollDiv).clientHeight, '; htChangeDiv=',document.getElementById(htChangeDiv).scrollHeight,
      document.getElementById(htChangeDiv).offsetHeight , document.getElementById(htChangeDiv).style.height);

    var divHt = document.getElementById(htChangeDiv).style.height.match(/\d/g);  //get 0-9 globally in the string  //http://stackoverflow.com/questions/10003683/javascript-get-number-from-string
    divHt = divHt.join(''); //converts array to string
    var NewHt = Number(divHt) + 1 + ScrollDif;  //add the ht difference to the outer div that holds this one
    //line below is where the height of the div actually changes
    document.getElementById(htChangeDiv).style.height = NewHt + 'px';

    //redraw the screen
    //mainBoxSwap(page);
    if (av.debug.root) console.log('Afterscroll', hasScrollbar, document.getElementById(scrollDiv).scrollHeight,
      document.getElementById(scrollDiv).clientHeight, '; htChangeDiv=',document.getElementById(htChangeDiv).scrollHeight,
      document.getElementById(htChangeDiv).offsetHeight , document.getElementById(htChangeDiv).style.height);
  }

  removeVerticalScrollbar('selectOrganPane', 'popTopRight', 'populationBlock');
  removeVerticalScrollbar('popStatistics', 'popTopRight', 'populationBlock');
  removeVerticalScrollbar('popBot', 'popBot', 'populationBlock');
  removeVerticalScrollbar('popTop', 'popTop', 'populationBlock');
  mainBoxSwap('populationBlock');

  popChartFn();
  //DrawGridSetup(); //Draw initial background
  //************************************************************************
  //Useful Generic functions
  //************************************************************************

  //Modulo that is more accurate than %; Math.fmod(aa, bb);
  Math.fmod = function (aa, bb) {
    return Number((aa - (Math.floor(aa / bb) * bb)).toPrecision(8));
  }

  //http://nelsonwells.net/2011/10/swap-object-key-and-values-in-javascript/
  var invertHash = function (obj) {
    var new_obj = {};
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        new_obj[obj[prop]] = prop;
      }
    }
    return new_obj;
  };

  //------- not in use = example
  //var hexColor = invertHash(dictColor);
  //var theColor = hexColor["#000000"];  //This should get 'Black'
  //console.log("theColor=", theColor);

  //Notes on things I learned writing this code, that is not directly used in the code
  //use FileMerge to compare to versions of the same file on a Mac
  //js fiddle of dragging image to cavans and dragging it around http://jsfiddle.net/XU2a3/41/

  //Use Meld to compare two folders worth of stuff. Evoke from a terminal prompt. Does not seem to be be in applications folder

  //http://dojo-toolkit.33424.n3.nabble.com/dojo-dnd-problems-selection-object-from-nodes-etc-td3753366.html
  //This is supposed to select a node; lists as selected programatically, but does not show up on screen.

  //A method to distinguish a av.mouse click from a av.mouse drag
  //http://stackoverflow.com/questions/6042202/how-to-distinguish-av.mouse-click-and-drag

  //A method to get the data items in a dojo DND container in order
  //av.dnd.fzConfig.on("DndDrop", function(source, nodes, copy, target){  //This triggers for every dnd drop, not just those of freezeConfigureNode
  //http://stackoverflow.com/questions/5837558/dojo-drag-and-drop-how-to-retrieve-order-of-items
  //var orderedDataItems = av.dnd.fzConfig.getAllNodes().map(function(node){
  //  return av.dnd.fzConfig.getItem(node.id).data;
  //});
  //console.log("orderedDataItems", orderedDataItems);

  //**************************************************************************************************
  //                web worker to talk to avida
  //**************************************************************************************************/

  //trying fio.uiWorker to start Avida inside the initiation of PouchDB

  function readMsg(ee, av) {
    var msg = ee.data;  //passed as object rather than string so JSON.parse is not needed.
    if ('data' == msg.type) {
      switch (msg.name) {
        case 'runPause':
          if (true != msg["Success"]) {
            console.log("Error: ", msg);  // msg failed
            runStopFn();  //flip state back since the message failed to get to Avida
          }
          break;
        case 'reset':
          if (true !== msg.Success) {
            console.log("Reset failed: ", msg);
          }
          break;
        case 'webOrgTraceBySequence': //reset values and call organism tracing routines.
          av.traceObj = msg.snapshots;
          av.gen.cycle = 0;
          dijit.byId("orgCycle").set("value", 0);
          cycleSlider.set("maximum", av.traceObj.length - 1);
          cycleSlider.set("discreteValues", av.traceObj.length);
          updateOrgTrace();
          break;
        case 'webPopulationStats':
          updatePopStats(av.grd, msg);
          popChartFn();
          if (av.debug.msgOrder) console.log('webPopulationStats update length', msg.update.formatNum(0), av.grd.ave_fitness.length);
          break;
        case 'webGridData':
          //mObj=JSON.parse(JSON.stringify(jsonObject));
          av.grd.msg = msg;
          DrawGridSetup();
          if (av.debug.msgOrder) console.log('webGridData length', av.grd.ave_fitness.length);
          //if (av.debug.msgOrder) console.log('ges',av.grd.msg.gestation.data);
          //if (av.debug.msgOrder) console.log('anc',av.grd.msg.ancestor.data);
          if (av.debug.msgOrder) console.log('nan',av.grd.msg.nand.data);
          if (av.debug.msgOrder) console.log('out',av.grd.out);
          break;
        case 'webOrgDataByCellID':
          //if ('undefined' != typeof av.grd.msg.ancestor) {console.log('webOrgDataByCellID anc',av.grd.msg.ancestor.data);}
          updateSelectedOrganismType(av.grd, msg, av.parents);  //in messageing
          break;
        default:
          console.log('____________UnknownRequest: ', msg);
          break;
      }
    }
    else if ('userFeedback' == msg.type) {
      switch (msg.level) {
        case 'notification':
          console.log('avida:notify: ',msg.message);
          LoadLabel.textContent = msg.message;
          break;
        case 'warning':
          console.log('avida:warn: ',msg.message);
          break;
        case 'fatal':
          console.log('avida:fatal: ',msg.message);
          break;
        default:
          console.log('avida:unkn: level ',msg.level,'; msg=',msg.message);
          break;
      }
    }
  }

  //fio.uiWorker used when communicating with the web worker and avida
  console.log('before call avida');
  av.fio.uiWorker = new Worker('avida.js');

  //process message from web worker
  console.log('before fio.uiWorker on message');
  av.fio.uiWorker.onmessage = function (ee) {readMsg(ee, av)};  // in file messaging.js

//********************************************************
//   Color Test Section - Temp this will all be removed later
//********************************************************
//structure to hold color test chips
  var chips = {};
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
  chips.outColor = [];

  var chck = {};       //data about the ckecker canvas
  chck.cols = 20;  //Number of columns in the grid
  chck.rows = 6;  //Number of rows in the grid
  chck.sizeX = 300;  //size of canvas in pixels
  chck.sizeY = 300;  //size of canvas in pixels
  chck.flagSelected = false; //is a cell selected
  chck.zoom = 1;     //magnification for zooming.
  chck.outlineColor = "#FFFFFFs"

  chck.CanvasCheck = document.getElementById("colorDemo");
  chck.ctxt = chck.CanvasCheck.getContext("2d");

  chck.CanvasChipScale = document.getElementById("scaleDemo");
//console.log('Chip', CanvasChipScale);
  chck.ctxSc = chck.CanvasChipScale.getContext("2d");
  chck.CanvasChipScale.width = $("#demoHolder").innerWidth() - 6;

  chck.CanvasCheck.width = $("#demoHolder").innerWidth() - 6;
  chck.CanvasCheck.height = $("#demoHolder").innerHeight() - 16 - $("#scaleDemo").innerHeight();

// Test of colors to see if a color blind person can tell the colors apart.

//***************************** av.mouse functions for Color Test

  function findShrew(evt) {
    var mouseX = evt.offsetX - chck.marginX - chck.xOffset;
    var mouseY = evt.offsetY - chck.marginY - chck.yOffset;
    chck.selectedCol = Math.floor(av.mouseX / chck.cellWd);
    chck.selectedRow = Math.floor(av.mouseY / chck.cellHt);
    console.log('Shrew col,row', chck.selectedCol, chck.selectedRow);
  }

  var shrew = {};
  shrew.Dn = false;
  shrew.DnGridPos = [];
  shrew.UpGridPos = [];
  shrew.DnOrganPos = [];
  shrew.Move = false;
  shrew.Drag = false;
  shrew.chipNdx = -1;
  shrew.chipSelected = false;
  shrew.Picked = "";

//shrew down on the grid
  $(document.getElementById('colorDemo')).on('mousedown', function (evt) {
    shrew.DnGridPos = [evt.offsetX, evt.offsetY];
    shrew.Dn = true;
    // Select if it is in the grid
    findShrew(evt);
    console.log('colorDemo', shrew.DnGridPos);
    //check to see if in the grid part of the canvas
    if (chck.selectedCol >= 0 && chck.selectedCol < chck.cols && chck.selectedRow >= 0 && chck.selectedRow < chck.rows) {
      chck.flagSelected = true;
      drawCheckerSetup(chck, chips);

      //In the grid and selected. Now look to see contents of cell are dragable.
      shrew.chipNdx = -1; //index into chips array if chip selected else -1;
      if (av.grd.newrun) {  //run has not started so look to see if cell contains ancestor
        shrew.chipNdx = findchipNdx(chck, chips);
        if (-1 < shrew.chipNdx) { //selected a chip, check for dragging
          document.getElementById('colorDemo').style.cursor = 'copy';
          shrew.Picked = 'chip';
        }
      }
    }
    else chck.flagSelected = false;
  });

//When av.mouse button is released, return cursor to default values
  $(document).on('mouseup', function (evt) {
    //console.log('av.mouseup anywhere in document -------------');
    document.getElementById('colorDemo').style.cursor = 'default';
    shrew.UpGridPos = [evt.offsetX, evt.offsetY];
    shrew.Dn = false;
    //console.log('av.mouseup, picked', shrew.Picked);
    // --------- process if something picked to dnd ------------------
    if ('chip' == shrew.Picked) {
      shrew.Picked = "";
      console.log('before call findChipIndex');
      findchipIndex(evt, chck, chips);
    }
    shrew.Picked = "";
  });

  function findchipIndex(evt, chck, chips) {
    console.log('in findchipIndex');
    if ('colorDemo' == evt.target.id) { // chip moved to another location on grid canvas
      shrew.UpGridPos = [evt.offsetX, evt.offsetY]; //not used for now
      //Move the ancestor on the canvas
      //console.log("on checkCanvas")
      console.log('before', chck.selectedCol, chck.selectedRow);
      findShrew(evt);
      // look to see if this is a valid grid cell
      if (chck.selectedCol >= 0 && chck.selectedCol < chck.cols && chck.selectedRow >= 0 && chck.selectedRow < chck.rows) {
        console.log('chipFound', chck.selectedCol, chck.selectedRow);
        chips.col[shrew.chipNdx] = chck.selectedCol;
        chips.row[shrew.chipNdx] = chck.selectedRow;
        chips.AvidaNdx[chips.handNdx[ii]] = chips.col[chips.handNdx[ii]] + chck.cols * chips.row[chips.handNdx[ii]];
        console.log('mv', chips.col[shrew.chipNdx], chips.row[shrew.chipNdx], shrew.chipNdx);
        //change from auto placed to hand placed if needed
        if ('auto' == chips.howPlaced[shrew.chipNdx]) {
          chips.howPlaced[shrew.chipNdx] = 'hand';
          makeHandAutoNdx();
          //PlaceAncestors(chips);
        }
        //console.log('auto', chips.autoNdx.length, chips.autoNdx, chips.name);
        //console.log('hand', chips.handNdx.length, chips.handNdx);
        drawCheckerSetup(chck, chips);
      }
    }  // close on canvas
  }

  var findchipNdx = function () {
    var ChipedNdx = -1;
    for (var ii = 0; ii < chips.name.length; ii++) {
      if (matches([chck.selectedCol, chck.selectedRow], [chips.col[ii], chips.row[ii]])) {
        ChipedNdx = ii;
        //console.log('chip found in function', ChipedNdx);
        break;  //found a chip no need to keep looking
      }
    }
    return ChipedNdx;
  }

  var matches = function (aa, bb) {
    if (aa[0] == bb[0] && aa[1] == bb[1]) return true;
    else return false;
  }


});