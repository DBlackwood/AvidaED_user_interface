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
  "dojo/ready",
  "jquery",
  "jquery-ui",
  "messaging.js",
  "colorTest.js",
  "PopulationGrid.js",
  "organismView.js",
  'dojoDnd.js',
  'popControls.js',
  'mouse.js',
  "dojo/domReady!"
], function (dijit, parser, declare, query, nodelistTraverse, space, AppStates, Dialog,
             BorderContainer, ContentPane, MenuBar, PopupMenuBarItem, MenuItem, Menu,
             Button, TitlePane, dndSource, dndManager, dndSelector, dndTarget, domGeometry, domStyle, dom,
             aspect, on, registry, Select,
             HorizontalSlider, HorizontalRule, HorizontalRuleLabels, RadioButton, ToggleButton, NumberSpinner, ComboButton,
             DropDownButton, ComboBox, Textarea, Chart, Default, Lines, Grid, MouseZoomAndPan, Wetland, ready, $, jqueryui) {

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


  //process message from web worker
  uiWorker.onmessage = function (ee) {readMsg(ee, dft, dnd, parents)};  // in file messaging.js

  function readMsg(ee, dft, dnd, parents) {
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
          if (true != msg["Success"]) {
            console.log("Reset failed: ", msg)
          }
          break;
        case 'webOrgTraceBySequence': //reset values and call organism tracing routines.
          traceObj = msg.snapshots;
          gen.cycle = 0;
          dijit.byId("orgCycle").set("value", 0);
          cycleSlider.set("maximum", traceObj.length - 1);
          cycleSlider.set("discreteValues", traceObj.length);
          updateOrgTrace(traceObj, gen);
          break;
        case 'webPopulationStats':
          updatePopStats(grd, msg);
          popChartFn();
          break;
        case 'webGridData':
          grd.msg = msg;
          DrawGridSetup();
          break;
        case 'webOrgDataByCellID':
          updateSelectedOrganismType(grd, msg, parents);  //in messageing
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

  if (debug.root) console.log('before Resize helpers');
  //********************************************************************************************************************
  // Resize window helpers -------------------------------------------
  //********************************************************************************************************************
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
      console.log('rightDetail', height, rd);
      if (undefined != traceObj) {
        updateOrgTrace(traceObj, gen)
      }
      else {
        organismCanvasHolderSize();
      }
    }
  }

  ready(function () {
    aspect.after(registry.byId("gridHolder"), "resize", function () {
      BrowserResizeEventHandler()
    });
    aspect.after(registry.byId("popChartHolder"), "resize", function () {
      BrowserResizeEventHandler()
    });
    aspect.after(registry.byId("organismCanvasHolder"), "resize", function () {
      BrowserResizeEventHandler()
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

  if (debug.root) console.log('before drop down menu');
  // Drop down menu buttons ------------------------------------------

  HardwareDialog = new Dialog({
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

  //The style display: none cannnot be used in the html during the initial load as the dijits won't work right
  //visibility:hidden can be used, but it leaves the white space and just does not display dijits.
  //So all areas are loaded, then the mainBoxSwap is called to set display to none after the load on all but
  //the default option.
  //mainBoxSwap("organismBlock");
  mainBoxSwap("populationBlock");
  dijit.byId("setupBlock").set("style", "display: none;");

  //this section gets rid of scroll bars, but then page no longer resizes correctly
  // delete later if fix that uses 96% of height takes care of the problem.
  /*    var popNewHt = $("#blockHolder").height()-10;
   dijit.byId("populationBlock").set("style", "height: "+ popNewHt +"px");
   dijit.byId("popBC").set("style", "height: "+ popNewHt+"px");

   var mapNewHt = $("#mapBlockHold").height()-10;
   dijit.byId("mapBlock").set("style", "height: "+ mapNewHt +"px");
   //mapNewHt = mapNewHt - 5;
   dijit.byId("mapBC").set("style", "height: "+ mapNewHt +"px;");
   */
  function mainBoxSwap(showBlock) {
    //console.log("in mainBoxSwap");
    dijit.byId("populationBlock").set("style", "display: none;");
    dijit.byId("organismBlock").set("style", "display: none;");
    dijit.byId("analysisBlock").set("style", "display: none;");
    dijit.byId("testBlock").set("style", "display: none;");       //take testBlock out completely later
    dijit.byId(showBlock).set("style", "display: block; visibility: visible;");
    dijit.byId(showBlock).resize();

    //disable menu options. they will be enabled when relevant canvas is drawn
    dijit.byId("mnFzOffspring").attr("disabled", true);
    dijit.byId("mnOffspringTrace").attr("disabled", true);
  };

  // Buttons that call MainBoxSwap
  document.getElementById("populationButton").onclick = function () {
    if (debug.dnd || debug.mouse) console.log('PopulationButton, fzr.organism', fzr.organism);
    mainBoxSwap("populationBlock");
    DrawGridSetup();
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
    if (undefined != traceObj) {
      updateOrgTrace(traceObj, gen);
    }
  }

  document.getElementById("analysisButton").onclick = function () {
    mainBoxSwap("analysisBlock");
  }
  //Take testBlock out completely later

  document.getElementById("testButton").onclick = function () {
    mainBoxSwap("testBlock");
    if ('#00FF00' == chck.outlineColor) {
      chck.outlineColor = '#00FFFF'
    }
    else if ('#00FFFF' == chck.outlineColor) {
      chck.outlineColor = '#FFFFFF'
    }
    else {
      chck.outlineColor = '#00FF00'
    }
    placeChips(chips, chck);
    drawCheckerSetup(chck, chips);
  }

  if (debug.root) console.log('before dnd definitions');
  /* ********************************************************************** */
  /* Dojo Drag N Drop Initialization ****************************************/
  /* ********************************************************************** */

  var dnd = {};
  
  dnd.fzConfig = new dndSource('fzConfig', {
    accept: ["conDish"],
    copyOnly: true,
    singular: true,
    selfAccept: false
  });
  dnd.fzConfig.insertNodes(false, [
    {data: "@default", type: ["conDish"]},
    {data: "s20m.2Nand", type: ["conDish"]},
    {data: "s30m.2Not", type: ["conDish"]}
  ]);
  dnd.fzOrgan = new dndSource('fzOrgan', {
    accept: ["organism"],
    copyOnly: true,
    singular: true,
    selfAccept: false
  });
  dnd.fzOrgan.insertNodes(false, [
    {data: "@ancestor", type: ["organism"]}
    , {data: "bravo_not", type: ["organism"]}
    ,{ data: "charlie-nan",     type: ["organism"]}
    ,{ data: "oro",       type: ["organism"]}
    ,{ data: "Oro_orn",        type: ["organism"]}
    ,{ data: "allFunctions",     type: ["organism"]}
    ,{ data: "AllBut2logic",        type: ["organism"]}
  ]);
  //Temporary - I think this will be removed once we have a files system.
  dnd.genes = [
     '0,heads_default,wzcagcccccccccccccccccccccccccccccccccccczvfcaxgab'  //ancestor
    ,'0,heads_default,wzcagcekzueqckcccncwlccycukcjyusccbcyoouczvacaxgab'  //not
    ,'0,heads_default,wzcagckchsdctcbqkwicclsdycygcubemcccqyjcizvfcaxgab'  //nan
    ,'0,heads_default,wzjagczycavutrdddwsayyjduucyycbbrpysktltizvftoxgja'  //oro
    ,'0,heads_default,wzjagczycavutrdddwsayyjduucyycbbrpysktltizvftoxgja'  //oro-orn
    ,'0,heads_default,whjagchmivznzbxbvmbzpfvfpwubypsmyuuobyufycvovrxguw'  //all functions
    ,'0,heads_default,wsjagcvtvazystorcauoyucuyquufydpbusmyfqoocvvopxgxu'  //allbut2logic
  ]

  if (debug.root) console.log('before frz structure');
  var fzr = {};
  //hold genome for active organism in Organism View
  fzr.actOrgan = {
    'name': "",
    'domId': "",
    'genome': ""
  }

  //structure to keep track of genomes for organisms in freezer and the active organism in organism.view
  fzr.organism = [];
  var domList = Object.keys(dnd.fzOrgan.map);
  var neworg = {};
  for (var ii=0; ii<domList.length; ii++) {
    neworg = {
      'name': dnd.fzOrgan.map[domList[ii]].data,
      'domId': domList[ii],
      'genome': dnd.genes[ii]
    }
    fzr.organism.push(neworg);
  }
  if (debug.root) console.log('after fzr.orgnaism', fzr.organism);

  dnd.fzPopDish = new dndSource('fzPopDish', {
    accept: ["popDish"],
    singular: true,
    copyOnly: true,
    selfAccept: false
  });
  dnd.fzPopDish.insertNodes(false, [
    {data: "@example", type: ["popDish"]},
    {data: "m2w30u1000nand", type: ["popDish"]},
    {data: "m2w30u1000not", type: ["popDish"]}
  ]);
  dnd.organIcon = new dndTarget('organIcon', {accept: ["organism"], selfAccept: false});
  dnd.ancestorBox = new dndSource('ancestorBox', {accept: ["organism"], copyOnly: false, selfAccept: false});
  
  dnd.gridCanvas = new dndTarget('gridCanvas', {accept: ["organism"]});

  dnd.trashCan = new dndSource('trashCan', {accept: ['conDish', 'organism', 'popDish'], singular: true});
  if (debug.root) console.log('after trashCan');

  dnd.activeConfig = new dndSource('activeConfig', {
    accept: ["conDish"],
    singular: true,
    copyOnly: true,
    selfAccept: false
  });
  dnd.activeConfig.insertNodes(false, [{data: "@default", type: ["conDish"]}]);

  //http://stackoverflow.com/questions/11909540/how-to-remove-delete-an-item-from-a-dojo-drag-and-drop-source
  dnd.activeOrgan = new dndSource('activeOrgan', {
    accept: ["organism"],
    singular: true,
    copyOnly: true,
    selfAccept: false
  });
  dnd.organCanvas = new dndSource('organCanvas', {accept: ["organism"], singular: true, selfAccept: false});
  //Targets only accept object, source can do both
  dnd.graphPop1 = new dndTarget('graphPop1', {accept: ["popDish"], singular: true});
  dnd.graphPop2 = new dndTarget('graphPop2', {accept: ["popDish"], singular: true});
  dnd.graphPop3 = new dndTarget('graphPop3', {accept: ["popDish"], singular: true});

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
    parents.Colors = ColorBlind.slice();
    parents.Colors.reverse();  //needed for the stack to have the "easy to see" colors on top
  }

  if (debug.root) console.log('before dnd triggers');
  //*******************************************************************************************************************
  //       Dojo Dnd drop function - triggers for all dojo dnd drop events
  //*******************************************************************************************************************
  // Dojo DndDrop function triggers for drops in all locations (target or source). However not all the information is
  // available unless the correct source/target name is in the event call. I had one event handler with calls to the
  // different functions based on the target.node.id, but that did not work, for not all the information was available.
  // It looks like it is there based on console.logging just the taret, but trying to access subdata results in a null.
  // I don't think I would have written it this way had I known the single event handler would not work, but I had
  // created the dojoDnd.js file before I realized that I needed separate event handelers with the conditional.

  dnd.fzConfig.on("DndDrop", function (source, nodes, copy, target) {//This triggers for every dnd drop, not just those of fzConfig
    if ('fzConfig' == target.node.id) {
      landFzConfig(dnd, fzr, source, nodes, target);  //needed as part of call to contextMenu
    }
  });

  dnd.fzOrgan.on("DndDrop", function (source, nodes, copy, target) {//This triggers for every dnd drop, not just those of fzOrgan
    if ('fzOrgan' == target.node.id) {
      landFzOrgan(dnd, fzr, parents, source, nodes, target);
    }
  });

  dnd.ancestorBox.on("DndDrop", function (source, nodes, copy, target) {//This triggers for every dnd drop, not just those of ancestorBox
    if ('ancestorBox' == target.node.id) {
      landAncestorBox(dnd, fzr, parents, source, nodes, target);
    }
  });

  dnd.gridCanvas.on("DndDrop", function (source, nodes, copy, target) {//This triggers for every dnd drop, not just those of gridCanvas
    if ('gridCanvas' == target.node.id) {
      landGridCanvas(dnd, fzr, parents, source, nodes, target);
      DrawGridSetup();
    }
  });

  dnd.organCanvas.on("DndDrop", function (source, nodes, copy, target) {//This triggers for every dnd drop, not just those of organCanvas
    if ('organCanvas' == target.node.id) {
      console.log('landOrganCanvas: s, t', source, target);
      landOrganCanvas(dnd, fzr, source, nodes, target);
      doOrgTrace(fzr);  //request new Organism Trace from Avida and draw that.
    }
  });

  dnd.organIcon.on("DndDrop", function (source, nodes, copy, target) {//This triggers for every dnd drop, not just those of organIcon
    if ('organIcon' == target.node.id) {
      console.log('landOrganIcon: s, t', source, target);
      landOrganIcon(dnd, fzr, source, nodes, target);
      //Change to Organism Page
      mainBoxSwap("organismBlock");
      organismCanvasHolderSize();
      var height = ($("#rightDetail").innerHeight() - 375) / 2;
      document.getElementById("ExecuteJust").style.height = height + "px";  //from http://stackoverflow.com/questions/18295766/javascript-overriding-styles-previously-declared-in-another-function
      document.getElementById("ExecuteAbout").style.height = height + "px";
      document.getElementById("ExecuteJust").style.width = "100%";
      document.getElementById("ExecuteAbout").style.width = "100%";
      doOrgTrace(fzr);  //request new Organism Trace from Avida and draw that.
    }
  });

  dnd.activeOrgan.on("DndDrop", function (source, nodes, copy, target) {//This triggers for every dnd drop, not just those of activeOrgan
    if ('activeOrgan' == target.node.id) {
      console.log('activeOrgan: s, t', source, target);
      landActiveOrgan(dnd, fzr, source, nodes, target);
      doOrgTrace(fzr);  //request new Organism Trace from Avida and draw that.
    }
  });

  dnd.trashCan.on("DndDrop", function (source, nodes, copy, target) {//This triggers for every dnd drop, not just those of trashCan
    if ('trashCan' == target.node.id) {
      console.log('trashCan: s, t', source, target);
      landTrashCan(dnd, fzr, parents, source, nodes, target);
    }
  });

  dnd.graphPop1.on("DndDrop", function (source, nodes, copy, target) {//This triggers for every dnd drop, not just those of graphPop1
    if ('graphPop1' == target.node.id) {
      console.log('graphPop1: s, t', source, target);
      landGraphPop1(dnd, source, nodes, target, plt);
      AnaChartFn();
    }
  });

  dnd.graphPop2.on("DndDrop", function (source, nodes, copy, target) {//This triggers for every dnd drop, not just those of graphPop2
    if ('graphPop2' == target.node.id) {
      console.log('graphPop2: s, t', source, target);
      landGraphPop2(dnd, source, nodes, target, plt);
      AnaChartFn();
    }
  });
  
  dnd.graphPop3.on("DndDrop", function (source, nodes, copy, target) {//This triggers for every dnd drop, not just those of graphPop3
    if ('graphPop3' == target.node.id) {
      console.log('graphPop3: s, t', source, target);
      landGraphPop3(dnd, source, nodes, target, plt);
      AnaChartFn();
    }
  });

  dnd.activeConfig.on("DndDrop", function (source, nodes, copy, target) {//This triggers for every dnd drop, not just those of activeConfig
    var pkg = {}; pkg.source = source; pkg.nodes = nodes; pkg.copy = copy; pkg.target = target;
    //console.log('pkg.target', pkg.target);
    //console.log('pkg.target.s', pkg.target.selection);
    switch (target.node.id) {
      case 'activeConfig':
        landActiveConfig(dnd, pkg); break;
      case 'fzPopDish':
        landFzPopDish(dnd, pkg); break;   //will never be called as fzPopDish is the only source for the popDish type. 
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
  
  if (debug.root) console.log('before Population Page');
  /* *************************************************************** */
  /* Population page script ******************************************/
  /* *************************************************************** */

// shifts the population page from Map (grid) view to setup parameters view and back again.
  document.getElementById("PopSetupButton").onclick = function () {
    if ("Map" == document.getElementById("PopSetupButton").innerHTML) DrawGridSetup();
    popBoxSwap();   //in popControls.js
  };

  // hides and shows the population and selected organsim data on right of population page with "Stats" button
  document.getElementById("PopStatsButton").onclick = function () {
    popStatView(grd);
  }
  // hides and shows the population and selected organsim data on right of population page with "Stats" button

  /* *************************************************************** */
  /* ******* Map Grid buttons - New  Run/Pause Freeze ************** */
  /* *************************************************************** */
  dijit.byId("mnPause").attr("disabled", true);
  dijit.byId("mnFzOrganism").attr("disabled", true);
  dijit.byId("mnFzOffspring").attr("disabled", true);
  dijit.byId("mnFzPopulation").attr("disabled", true);

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
      if (grd.newrun) {
        requestPopStats();  //uiWorker
        requestGridData();  //uiWorker

        //change ui parameters for the correct state when the avida population has started running
        popRunningState_ui(dnd, grd);
        dom.byId('ancestorBox').isSource = false;

        //collect setup data to send to avida
        sendConfig(grd);
        injectAncestors(parents); //uiWorker
      }
      doRunPause();
    }
    //update screen based on data from C++
  }

  //process the run/Stop Button - a separate function is used so it can be flipped if the message to avida is not successful.
  document.getElementById("runStopButton").onclick = function () {
    runStopFn()
  }
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
      doRunPause()
      //console.log("pop size ", grd.population_size);
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
    doRunPause()
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
    if (grd.newrun) {// reset petri dish
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

  //reset values with hard coded defaults needs to be updated when Avida works
  function resetDishFn() { //Need to reset all settings to @default
    grd.newrun = true;
    // send rest to Avida adaptor
    doReset();
    //Enable the options on the Setup page
    popNewExState(dnd, grd, parents);
    //clear the time series graphs
    grd.ave_fitness = [];
    grd.ave_gestation_time = [];
    grd.ave_metabolic_rate = [];
    grd.population_size = [];
    popChartFn();
    //Clear grid settings
    clearParents();
    //reset values in population settings either based on a 'file' @default or a @default string
    writeSettings(dft, dnd, grd);
    //re-write grid if that page is visible
    DrawGridSetup();
  }

  //******* Freeze Button ********************************************
  //Saves either configuration or populated dish
  //Also creates context menu for all new freezer items.
  document.getElementById("freezeButton").onclick = function () {
    fzDialog.show();
  }

  function FrConfigFn() {
    var fzName = prompt("Please name the new configuration", "newConfig");
    var namelist = dojo.query('> .dojoDndItem', 'fzConfig');
    fzName = getUniqueName(fzname, dnd.fzConfig);
    if (null != fzName) {
      dnd.fzConfig.insertNodes(false, [{data: fzName, type: ["conDish"]}]);
      dnd.fzConfig.sync();
      //Create context menu for right-click on this item
      var domID = getDomID(fzname,dnd.fzConfig);
      contextMenu(dnd.fzConfig, domID);
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

  //Save a populated dish
  function FrPopulationFn() {
    var fzName = prompt("Please name the new population", "newPopulation");
    fzName = getUniqueName(fzname, dnd.fzPopDish);
    if (null != fzName) {
      dnd.fzPopDish.insertNodes(false, [{data: fzName, type: ["popDish"]}]);
      dnd.fzPopDish.sync();
      //Create context menu for right-click on this item
      //Find out the dom ID the node element just inserted.
      var domID = getDomID(fzName, dnd.fzPopDish);
      contextMenu(dnd.fzPopDish, domID);
    }
  }

  //button to freeze a population
  dijit.byId("FzPopulation").on("Click", function () {
    fzDialog.hide();
    FrPopulationFn();
  });

  //Buttons on drop down menu to save population
  dijit.byId("mnFzPopulation").on("Click", function () {
    FrPopulationFn()
  });
  //Buttons on drop down menu to save configured dish
  dijit.byId("mnFzOrganism").on("Click", function () {
    FrOrganismFn('selected')
  });

  //Freeze the selected organism
  function FrOrganismFn(trigger) {
    var fzName = 'new';
    var parentName = "";
    if ('selected' == trigger) {
      fzName = prompt("Please name the selected organism", "newOrganism");
    }
    else if ('offpring' == trigger) {
      //get name from parent
      parentName = document.getElementById(Object.keys(dnd.activeOrgan.map)[0]).textContent;
      fzName = prompt("Please name the offspring", parentName + '_Offspring');
    }
    else {
      fzName = prompt("Please name the organism", "newOrganism");
    }
    fzName = getUniqueName(fzName, dnd.fzOrgan);
    if (null != fzName) {
      //insert new item into the freezer.
      dnd.fzOrgan.insertNodes(false, [{data: fzName, type: ["organism"]}]);
      dnd.fzOrgan.sync();

      //Find out the dom ID the node element just inserted.
      var domID = getDomID(fzName,dnd.fzOrgan);
      contextMenu(dnd.fzOrgan, domID);
    }
  }

  // End of Freezer functions
//********************************************************************
//    Mouse DND functions
//********************************************************************
  $(document.getElementById('organCanvas')).on('mousedown', function (evt) {
    mouse.DnOrganPos = [evt.offsetX, evt.offsetY];
    mouse.Dn = true;
    mouse.Picked = '';
    if (gen.didDivide) {  //offpsring exists
      var distance = Math.sqrt(Math.pow(evt.offsetX - gen.cx[1], 2) + Math.pow(evt.offsetY - gen.cy[1], 2));
      if (25 > distance) {
        document.getElementById('organIcon').style.cursor = 'copy';
        document.getElementById('organCanvas').style.cursor = 'copy';
        document.getElementById('SnowFlakeImage').style.cursor = 'copy';
        document.getElementById('mainBC').style.cursor = 'move';
        mouse.Picked = "offspring";
        if (gen.debug) console.log('gen.dna', gen.dna);
      }
    }
  });

  //mouse down on the grid
  $(document.getElementById('gridCanvas')).on('mousedown', function (evt) {
    mouse.DnGridPos = [evt.offsetX, evt.offsetY];
    mouse.Dn = true;
    // Select if it is in the grid
    findSelected(evt, grd);
    //check to see if in the grid part of the canvas
    if (debug.mouse) console.log('mousedown', grd.selectedNdx);
    if (grd.selectedCol >= 0 && grd.selectedCol < grd.cols && grd.selectedRow >= 0 && grd.selectedRow < grd.rows) {
      grd.flagSelected = true;
      if (debug.mouse) console.log('ongrid', grd.selectedNdx);
      DrawGridSetup();
      dijit.byId("mnFzOrganism").attr("disabled", false);  //When an organism is selected, then it can be save via the menu

      //In the grid and selected. Now look to see contents of cell are dragable.
      mouse.ParentNdx = -1; //index into parents array if parent selected else -1;
      if (grd.newrun) {  //run has not started so look to see if cell contains ancestor
        mouse.ParentNdx = findParentNdx(parents);
        if (debug.mouse) console.log('parent', mouse.ParentNdx);
        if (-1 < mouse.ParentNdx) { //selected a parent, check for dragging
          document.getElementById('organIcon').style.cursor = 'copy';
          document.getElementById('gridCanvas').style.cursor = 'copy';
          document.getElementById('TrashCanImage').style.cursor = 'copy';
          document.getElementById('mainBC').style.cursor = 'move';
          mouse.Picked = 'parent';
          //console.log('Parent cursor GT', document.getElementById('gridCanvas').style.cursor, dom.byId('TrashCanImage').style.cursor);
        }
      }
      else {  //look for decendents (kids)
        grd.kidStatus='getgenome';
        if (debug.mouse) console.log('kidSelected; selectedNdx', grd.selectedNdx);
        doSelectedOrganismType(grd);
        //if ancestor not null then there is a cell there.
        if ('null' != grd.msg.ancestor.data[grd.selectedNdx]) {
          SelectedKidMouseStyle(dnd, fzr, grd);
          mouse.Picked = 'kid';
        }
        console.log('kid', grd.kidName, grd.kidGenome);
      }
    }
    else {
      grd.flagSelected = false;
      grd.selectedNdx = -1;
    }
    doSelectedOrganismType(grd);
    DrawGridSetup();
  });

  //mouse move anywhere on screen - not currently in use.
  $(document.getElementById('gridCanvas')).on('mousemove', function handler (evt) {
  //$(document).on('mousemove', function handler(evt) { //needed so cursor changes shape
    //console.log('gd move');
    //document.getElementById('gridCanvas').style.cursor = 'copy';
    //document.getElementById('trashCan').style.cursor = 'copy';
    //console.log('mouseMove cursor GT', document.getElementById('gridCanvas').style.cursor, dom.byId('trashCan').style.cursor);
    //if (debug.mouse) console.log('________________________________mousemove');
    if (!nearly([evt.offsetX, evt.offsetY], mouse.DnGridPos)) {
      //if (debug.mouse) console.log('________________________________');
      //if (debug.mouse) console.log("gd draging");
      if (mouse.Dn) mouse.Drag = true;
    }
    $(document).off('mousemove', handler);
  });

  //When mouse button is released, return cursor to default values
  $(document).on('mouseup', function (evt) {
    if (debug.mouse) console.log('mouseup; evt', evt.target.id, evt);
    document.getElementById('organCanvas').style.cursor = 'default';
    document.getElementById('gridCanvas').style.cursor = 'default';
    document.getElementById('trashCan').style.cursor = 'default';
    document.getElementById('mainBC').style.cursor = 'default';
    document.getElementById('organIcon').style.cursor = 'default';
    document.getElementById('fzOrgan').style.cursor = 'default';
    mouse.UpGridPos = [evt.offsetX, evt.offsetY];
    mouse.Dn = false;

    // --------- process if something picked to dnd ------------------
    if ('parent' == mouse.Picked) {
      mouse.Picked = "";
      ParentMouse(evt, dnd, fzr, parents);
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
        doOrgTrace(fzr);  //request new Organism Trace from Avida and draw that.
      }

    }
    else if ('offspring' == mouse.Picked) {
      mouse.Picked = "";
      OffspringMouse(evt, dnd, fzr)
    }
    else if ('kid' == mouse.Picked) {
      mouse.Picked = "";
      KidMouse(evt, dnd, fzr);
      if ('organIcon' == evt.target.id) {
        //Change to Organism Page
        mainBoxSwap("organismBlock");
        organismCanvasHolderSize();
        var height = ($("#rightDetail").innerHeight() - 375) / 2;
        document.getElementById("ExecuteJust").style.height = height + "px";  //from http://stackoverflow.com/questions/18295766/javascript-overriding-styles-previously-declared-in-another-function
        document.getElementById("ExecuteAbout").style.height = height + "px";
        document.getElementById("ExecuteJust").style.width = "100%";
        document.getElementById("ExecuteAbout").style.width = "100%";
        doOrgTrace(fzr);  //request new Organism Trace from Avida and draw that.
      }
    }
    mouse.Picked = "";
  });

  /* *************************************************************** */
  // ****************  Draw Population Grid ************************ */
  /* *************************************************************** */

  //Set up canvas objects
  grd.CanvasScale = document.getElementById("scaleCanvas");
  grd.sCtx = grd.CanvasScale.getContext("2d");
  grd.CanvasGrid = document.getElementById('gridCanvas');
  grd.cntx = grd.CanvasGrid.getContext("2d");
  grd.CanvasSelected = document.getElementById('SelectedColor');
  grd.selCtx = grd.CanvasSelected.getContext('2d');
  grd.SelectedWd = $('#SelectedColor').innerWidth();
  grd.SelectedHt = $('#SelectedColor').innerHeight();


  grd.CanvasScale.width = $("#gridHolder").innerWidth() - 6;
  grd.CanvasGrid.width = $("#gridHolder").innerWidth() - 6;
  grd.CanvasGrid.height = $("#gridHolder").innerHeight() - 16 - $("#scaleCanvas").innerHeight();

  function DrawGridSetup() {
    //Get the size of the div that holds the grid and the scale or legend
    var GridHolderHt = $("#gridHolder").innerHeight();
    if(!grd.newrun) {  //update color information for offpsring once run has started
      setMapData(grd);
      findLogicOutline(grd);
    }

    //Determine if a color gradient or legend will be displayed
    if ("Ancestor Organism" == dijit.byId("colorMode").value) {
      drawLegend(grd, parents)
    }
    else {
      GradientScale(grd)
    }

    //find the height for the div that holds the grid Canvas
    var GrdNodeHt = GridHolderHt - 16 - $("#scaleCanvas").innerHeight();
    document.getElementById("gridCanvas").style.height = GrdNodeHt + 'px';
    document.getElementById("gridCanvas").style.overflowY = "scroll";
    //console.log('GrdNodeHt=',GrdNodeHt);

    //find the space available to display the grid in pixels
    grd.spaceX = $("#gridHolder").innerWidth() - 6;
    grd.spaceY = GrdNodeHt - 5;
    //console.log('spaceY', grd.spaceY, '; gdHolder', GridHolderHt, '; scaleCanv', $("#scaleCanvas").innerHeight());

    DrawGridUpdate(grd, parents);   //look in PopulationGrid.js
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
  grd.ZoomSlide = new HorizontalSlider({
    name: "ZoomSlide",
    value: 1,
    minimum: 1,
    maximum: 10,
    intermediateChanges: true,
    discreteValues: 19,
    style: "height: auto; width: 120px;float:right",
    onChange: function (value) {
      grd.zoom = value;
      //console.log('ZoomSlide', grd.zoom);
      DrawGridSetup();
    }
  }, "ZoomSlide");

  grd.colorMap = 'Gnuplot2';
  dijit.byId("mnGnuplot2").attr("disabled", true);

  dijit.byId("mnViridis").on("Click", function () {
    dijit.byId("mnCubehelix").attr("disabled", false);
    dijit.byId("mnGnuplot2").attr("disabled", false);
    dijit.byId("mnViridis").attr("disabled", true);
    grd.colorMap = 'Viridis';
    DrawGridSetup();
  });

  dijit.byId("mnGnuplot2").on("Click", function () {
    dijit.byId("mnCubehelix").attr("disabled", false);
    dijit.byId("mnGnuplot2").attr("disabled", true);
    dijit.byId("mnViridis").attr("disabled", false);
    grd.colorMap = 'Gnuplot2';
    DrawGridSetup();
  });

  dijit.byId("mnCubehelix").on("Click", function () {
    dijit.byId("mnCubehelix").attr("disabled", true);
    dijit.byId("mnGnuplot2").attr("disabled", false);
    dijit.byId("mnViridis").attr("disabled", false);
    grd.colorMap = 'Cubehelix';
    DrawGridSetup();
  });

  // *************************************************************** */
  //    Buttons that select organisms that perform a logic function
  // *************************************************************** */
  if (debug.root) console.log('before logic buttons');

  function toggle(button) {
    if ('on' == document.getElementById(button).value) {
      document.getElementById(button).value = 'off';
      document.getElementById(button).className = 'bitButtonOff';
    }
    else {
      document.getElementById(button).value = 'on';
      document.getElementById(button).className = 'bitButtonOn';
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
  gridWasCols = Number(document.getElementById("sizeCols").value);
  gridWasRows = Number(document.getElementById("sizeRows").value);
  function popSizeFn() {
    var NewCols = Number(document.getElementById("sizeCols").value);
    var NewRows = Number(document.getElementById("sizeRows").value);
    document.getElementById("sizeCells").innerHTML = "is a total of " + NewCols * NewRows + " cells";
    //Linear scale the position for Ancestors added by hand;
    for (var ii = 0; ii < parents.handNdx.length; ii++) {
      //console.log('old cr', parents.col[parents.handNdx[ii]], parents.row[parents.handNdx[ii]]);
      parents.col[parents.handNdx[ii]] = Math.trunc(NewCols * parents.col[parents.handNdx[ii]] / gridWasCols);
      parents.row[parents.handNdx[ii]] = Math.trunc(NewRows * parents.row[parents.handNdx[ii]] / gridWasRows);
      parents.AvidaNdx[parents.handNdx[ii]] = parents.col[parents.handNdx[ii]] + NewCols * parents.row[parents.handNdx[ii]];
      //console.log('New cr', parents.col[parents.handNdx[ii]], parents.row[parents.handNdx[ii]]);
    }
    gridWasCols = Number(document.getElementById("sizeCols").value);
    gridWasRows = Number(document.getElementById("sizeRows").value);
    //reset zoom power to 1
    grd.ZoomSlide.set("value", 1);
    PlaceAncestors(parents);
    //are any parents on the same cell?
    cellConflict(NewCols, NewRows, grd, parents);
  }

  var cellFilled = function (AvNdx, ii) {
    var flag = false;
    console.log('cellFilled', AvNdx, parents.AvidaNdx)
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

  /* --------------------------------------------------------------- */
  /*                    Population Chart                             */
  /* --------------------------------------------------------------- */

  //need to get the next two values from real data.
  //var popY = [1, 1, 1, 2, 2, 2, 4, 4, 4, 8,8,8,14,15,16,16,16,24,24,25,26,36,36,36,48,48]; /
  var popY = [];
  var ytitle = dijit.byId("yaxis").value;
  var popChart = new Chart("popChart");

  //use theme to change grid color based on tick color http://stackoverflow.com/questions/6461617/change-the-color-of-grid-plot-dojo
  //this required the use of a theme, but I'm no longer using the theme. Could take 'Wetland' out of require statemet as long a this is not used
  //var myTheme = Wetland; // Or any other theme
  //myTheme.axis.majorTick.color = "#CCC";  //grey
  //myTheme.axis.minorTick.color = "red";

  function popChartFn() {
    if ("Average Fitness" == dijit.byId("yaxis").value) {
      popY = grd.ave_fitness;
    }
    else if ("Average Gestation Time" == dijit.byId("yaxis").value) {
      popY = grd.ave_gestation_time;
    }
    else if ("Average Metabolic Rate" == dijit.byId("yaxis").value) {
      popY = grd.ave_metabolic_rate;
    }
    else if ("Number of Organisms" == dijit.byId("yaxis").value) {
      popY = grd.population_size;
    }
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
    popChart.addSeries("Series y", popY, {stroke: {color: "blue", width: 2}});
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

  document.getElementById("OrgSetting").onclick = function () {
    OrganSetupDialog.show();
  }

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
      }
    });
    /* initialize */
    //$( "#orMRate" ).val( ($( "#orMuteSlide").slider( "value" )));
    //$( "#orMuteInput" ).val(muteDefault+"%");
    $("#orMuteInput").val(muteDefault);//tibaslide
    /*update slide based on textbox */
    $("#orMuteInput").change(function () {
      slides.slider("value", 100000.0 * Math.log(1 + (parseFloat(this.value))));
      //$( "#orMRate" ).val( 100000*Math.log(1+(parseFloat(this.value))) );
      //console.log("in mute change");
    });
  });

  // ****************************************************************
  //        Menu buttons that call for genome/Organism trace
  // ****************************************************************
  dijit.byId("mnOrganismTrace").on("Click", function () {
    //get name and genome for selected cell
    var SelectedName = 'selectedOrganism';  //replace this with data from Avida later
    // . . . need avida stuff first
    //Open Oranism view
    mainBoxSwap("organismBlock");
    organismCanvasHolderSize();
    var height = ($("#rightDetail").innerHeight() - 375) / 2;
    document.getElementById("ExecuteJust").style.height = height + "px";  //from http://stackoverflow.com/questions/18295766/javascript-overriding-styles-previously-declared-in-another-function
    document.getElementById("ExecuteAbout").style.height = height + "px";
    document.getElementById("ExecuteJust").style.width = "100%";
    document.getElementById("ExecuteAbout").style.width = "100%";
    //and put organsim in place
    //clear out the old data
    var items = getAllItems(dnd.activeOrgan);    //gets some data about the items in the container
    if (0 < items.length) {
      dnd.activeOrgan.selectAll().deleteSelectedNodes();  //clear items
      dnd.activeOrgan.sync();   //should be done after insertion or deletion
    }
    dnd.activeOrgan.insertNodes(false, [{data: SelectedName, type: ["organism"]}]);
    dnd.activeOrgan.sync();

    //call organismTrace
    doOrgTrace(fzr);  //request new Organism Trace from Avida and draw that.
  });

  //Put the offspring in the parent position on Organism Trace
  dijit.byId("mnOffspringTrace").on("Click", function () {
    //get name and genome for offspring cell
    var Name = 'offspring';  //replace this with data from Avida later
    // . . . need avida stuff first
    //Open Oranism view
    mainBoxSwap("organismBlock");
    organismCanvasHolderSize();
    var height = ($("#rightDetail").innerHeight() - 375) / 2;
    document.getElementById("ExecuteJust").style.height = height + "px";  //from http://stackoverflow.com/questions/18295766/javascript-overriding-styles-previously-declared-in-another-function
    document.getElementById("ExecuteAbout").style.height = height + "px";
    document.getElementById("ExecuteJust").style.width = "100%";
    document.getElementById("ExecuteAbout").style.width = "100%";
    //and put organsim in place
    //clear out the old data
    var items = getAllItems(dnd.activeOrgan);    //gets some data about the items in the container
    if (0 < items.length) {
      dnd.activeOrgan.selectAll().deleteSelectedNodes();  //clear items
      dnd.activeOrgan.sync();   //should be done after insertion or deletion
    }
    dnd.activeOrgan.insertNodes(false, [{data: Name, type: ["organism"]}]);
    dnd.activeOrgan.sync();

    //call organismTrace
    doOrgTrace(fzr);  //request new Organism Trace from Avida and draw that.
  });

  /* ****************************************************************/
  /*                  Canvas for Organsim View (genome)
  /* ************************************************************** */

  clearGen();
  //set canvas size; called from many places
  function organismCanvasHolderSize() {
    gen.OrgCanvas.width = $("#organismCanvasHolder").innerWidth() - 6;
    gen.OrgCanvas.height = $("#organismCanvasHolder").innerHeight() - 12;
  }

  function updateOrgTrace(obj, gen) {
    gen.didDivide = obj[gen.cycle].didDivide; //update global version of didDivide
    //set canvas size
    organismCanvasHolderSize();
    updateOrganTrace(obj, gen);
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
      gen.cycle = ii;
      updateOrgTrace(traceObj, gen)
    }
  });

  dijit.byId("orgForward").on("Click", function () {
    var ii = Number(document.getElementById("orgCycle").value);
    if (cycleSlider.get("maximum") > cycleSlider.get("value")) {
      ii++;
      dijit.byId("orgCycle").set("value", ii);
      gen.cycle = ii;
      updateOrgTrace(traceObj, gen)
    }
  });

  dijit.byId("orgReset").on("Click", function () {
    dijit.byId("orgCycle").set("value", 0);
    gen.cycle = 0;
    updateOrgTrace(traceObj, gen);
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
      gen.cycle++;
      dijit.byId("orgCycle").set("value", gen.cycle);
      updateOrgTrace(traceObj, gen);
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
    gen.cycle = cycleSlider.get("maximum");
    updateOrgTrace(traceObj, gen);
    orgStopFn()
  });

  dijit.byId("orgCycle").on("Change", function (value) {
    cycleSlider.set("value", value);
    gen.cycle = value;
    //console.log('orgCycle.change');
    updateOrgTrace(traceObj, gen);
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
      gen.cycle = value;
      //console.log('cycleSlider');
      updateOrgTrace(traceObj, gen);
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
    dnd.graphPop1.selectAll().deleteSelectedNodes();
  }
  document.getElementById("pop2delete").onclick = function () {
    plt.pop2a = [];
    plt.pop2b = [];
    AnaChartFn();
    dnd.graphPop2.selectAll().deleteSelectedNodes();
  }
  document.getElementById("pop3delete").onclick = function () {
    plt.pop3a = [];
    plt.pop3b = [];
    AnaChartFn();
    dnd.graphPop3.selectAll().deleteSelectedNodes();
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

  //Eliminate scrollbars on population page

  //used to set the height so the data just fits. Done because different monitor/brower combinations require a diffent height in pixels.
  //may need to take out as requires loading twice now.
  function removeScrollbar(scrollDiv, htChangeDiv, page) {
    https://tylercipriani.com/2014/07/12/crossbrowser-javascript-scrollbar-detection.html
      //if the two heights are different then there is a scroll bar
      var ScrollDif = document.getElementById(scrollDiv).scrollHeight - document.getElementById(scrollDiv).clientHeight;
    var hasScrollbar = 0 < ScrollDif;
    //console.log(scrollDiv, hasScrollbar, document.getElementById(scrollDiv).scrollHeight,
    //  document.getElementById(scrollDiv).clientHeight, '; htChangeDiv=',document.getElementById(htChangeDiv).scrollHeight,
    //  document.getElementById(htChangeDiv).offsetHeight , document.getElementById(htChangeDiv).style.height);

    var divHt = document.getElementById(htChangeDiv).style.height.match(/\d/g);  //get 0-9 globally in the string  //http://stackoverflow.com/questions/10003683/javascript-get-number-from-string
    divHt = divHt.join(''); //converts array to string
    var NewHt = Number(divHt) + 1 + ScrollDif;  //add the ht difference to the outer div that holds this one
    //line below is where the height of the div actually changes
    document.getElementById(htChangeDiv).style.height = NewHt + 'px';

    //redraw the screen
    mainBoxSwap(page);
    //console.log('Afterscroll', hasScrollbar, document.getElementById(scrollDiv).scrollHeight,
    //  document.getElementById(scrollDiv).clientHeight, '; htChangeDiv=',document.getElementById(htChangeDiv).scrollHeight,
    //  document.getElementById(htChangeDiv).offsetHeight , document.getElementById(htChangeDiv).style.height);
  }

  removeScrollbar('selectOrganPane', 'popTopRight', 'populationBlock');
  removeScrollbar('popStatistics', 'popTopRight', 'populationBlock');

  popChartFn();
  DrawGridSetup(); //Draw initial background

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

  //------- not in use
  var hexColor = invertHash(dictColor);
  var theColor = hexColor["#000000"];  //This should get 'Black'
  //console.log("theColor=", theColor);

  // does not work
  on(dom.byId("gridCanvas"), "drop", function (event) {
    domGeometry.normalizeEvent(event);
    console.log("Not work xx ", event.pageX);
    console.log("NOt work yy ", event.pageY);
  })


  //Notes on things I learned writing this code, that is not directly used in the code
  //use FileMerge to compare to versions of the same file on a Mac
  //js fiddle of dragging image to cavans and dragging it around http://jsfiddle.net/XU2a3/41/

  //Use Meld to compare two folders worth of stuff. Evoke from a terminal prompt. Does not seem to be be in applications folder

  //http://dojo-toolkit.33424.n3.nabble.com/dojo-dnd-problems-selection-object-from-nodes-etc-td3753366.html
  //This is supposed to select a node; lists as selected programatically, but does not show up on screen.

  //A method to distinguish a mouse click from a mouse drag
  //http://stackoverflow.com/questions/6042202/how-to-distinguish-mouse-click-and-drag

  //A method to get the data items in a dojo DND container in order
  //dnd.fzConfig.on("DndDrop", function(source, nodes, copy, target){  //This triggers for every dnd drop, not just those of freezeConfigureNode
  //http://stackoverflow.com/questions/5837558/dojo-drag-and-drop-how-to-retrieve-order-of-items
  //var orderedDataItems = dnd.fzConfig.getAllNodes().map(function(node){
  //  return dnd.fzConfig.getItem(node.id).data;
  //});
  //console.log("orderedDataItems", orderedDataItems);

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

//***************************** mouse functions for Color Test

  function findShrew(evt) {
    var mouseX = evt.offsetX - chck.marginX - chck.xOffset;
    var mouseY = evt.offsetY - chck.marginY - chck.yOffset;
    chck.selectedCol = Math.floor(mouseX / chck.cellWd);
    chck.selectedRow = Math.floor(mouseY / chck.cellHt);
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
      dijit.byId("mnFzOrganism").attr("disabled", false);  //When an organism is selected, then it can be save via the menu

      //In the grid and selected. Now look to see contents of cell are dragable.
      shrew.chipNdx = -1; //index into chips array if chip selected else -1;
      if (grd.newrun) {  //run has not started so look to see if cell contains ancestor
        shrew.chipNdx = findchipNdx(chck, chips);
        if (-1 < shrew.chipNdx) { //selected a chip, check for dragging
          document.getElementById('colorDemo').style.cursor = 'copy';
          shrew.Picked = 'chip';
        }
      }
    }
    else chck.flagSelected = false;
  });

//When mouse button is released, return cursor to default values
  $(document).on('mouseup', function (evt) {
    //console.log('mouseup anywhere in document -------------');
    document.getElementById('colorDemo').style.cursor = 'default';
    shrew.UpGridPos = [evt.offsetX, evt.offsetY];
    shrew.Dn = false;
    //console.log('mouseup, picked', shrew.Picked);
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
