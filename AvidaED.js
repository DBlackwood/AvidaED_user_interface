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
  "dojo/domReady!"
], function (dijit, parser, declare, query, nodelistTraverse, space, AppStates, Dialog,
             BorderContainer, ContentPane, MenuBar, PopupMenuBarItem, MenuItem, Menu,
             Button, TitlePane, dndSource, dndManager, dndSelector, dndTarget, domGeometry, domStyle, dom,
             aspect, on, registry, Select,
             HorizontalSlider, HorizontalRule, HorizontalRuleLabels, RadioButton, ToggleButton, NumberSpinner, ComboButton,
             DropDownButton, ComboBox, Textarea, Chart, Default, Lines, Grid, MouseZoomAndPan, Wetland, ready, $, jqueryui) {

  parser.parse();

  //uiWorker used when communicating with the web worker and avida
  var uiWorker = new Worker('avida.js');
  //var uiWorker = new Worker('ui-test.js');

  dummy();
  //process message from web worker
  uiWorker.onmessage = function (ee) {
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
          updatePopStats(msg);
          //doPopMap();  //Call to update grid colors;
          break;
        case 'webGridData':
          grd.msg = msg;
          DrawGridSetup();
          break;
        case 'getOrgDataByCell':
          updateSelectedOrganismType(msg);
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

  //uiWorker function
  function doOrgTrace() {
    var seed = 100*Math.random();
    if (dijit.byId("OrganDemoRadio").get('checked', true)) {seed = 0 }
    var request = {
      'type': 'addEvent',
      'name': 'webOrgTraceBySequence',
      'triggerType': 'immediate',
      'args': [
        '0,heads_default,' + fzr.actOrgan.genome,                                  //genome string
        dijit.byId("orMuteInput").get('value')/100,     // point mutation rate
        seed                                            //seed where 0 = random; >0 to replay that number
      ]
      //'PtMuteRate': '0.02',
      //'Seed': '0'  // sets to demo mode; optional if left off it is experimental mode
    };
    uiWorker.postMessage(request);
  }

  //request data from Avida to update SelectedOrganismType
  function doSelectedOrganismType(grd) {
    var request = {
      'type': 'addEvent',
      'name': 'getOrgDataByCell',
      'args': grd.NdxSelected
    }
    uiWorker.postMessage(request);
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
    'wzcagcccccccccccccccccccccccccccccccccccczvfcaxgab'  //ancestor
    ,'wzcagcekzueqckcccncwlccycukcjyusccbcyoouczvacaxgab'  //not
    ,'wzcagckchsdctcbqkwicclsdycygcubemcccqyjcizvfcaxgab'  //nan
    ,'wzjagczycavutrdddwsayyjduucyycbbrpysktltizvftoxgja'  //oro
    ,'wzjagczycavutrdddwsayyjduucyycbbrpysktltizvftoxgja'  //oro-orn
    ,'whjagchmivznzbxbvmbzpfvfpwubypsmyuuobyufycvovrxguw'  //all functions
    ,'wsjagcvtvazystorcauoyucuyquufydpbusmyfqoocvvopxgxu'  //allbut2logic
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
  if (debug.root) console.log('after fzr.orgnaism');

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
      doOrgTrace();  //request new Organism Trace from Avida and draw that.
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
      doOrgTrace();  //request new Organism Trace from Avida and draw that.
    }
  });

  dnd.activeOrgan.on("DndDrop", function (source, nodes, copy, target) {//This triggers for every dnd drop, not just those of activeOrgan
    if ('activeOrgan' == target.node.id) {
      console.log('activeOrgan: s, t', source, target);
      landActiveOrgan(dnd, fzr, source, nodes, target);
      doOrgTrace();  //request new Organism Trace from Avida and draw that.
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
  function popBoxSwap() {
    if ("Map" == document.getElementById("PopSetupButton").innerHTML) {
      var height = $("#mapBlock").innerHeight() - 6;

      dijit.byId("mapBlock").set("style", "display: block; height: " + height + "px");
      dijit.byId("mapBC").set("style", "height: " + height + "px");
      dijit.byId("setupBlock").set("style", "display: none");
      document.getElementById("PopSetupButton").innerHTML = "Setup";
      DrawGridSetup();
    } else {
      document.getElementById("PopSetupButton").innerHTML = "Map";
      dijit.byId("setupBlock").set("style", "display: block;");
      dijit.byId("mapBlock").set("style", "display: none;");
    }
  }

  document.getElementById("PopSetupButton").onclick = function () {
    popBoxSwap();
  };

  // hides and shows the population and selected organsim data on right of population page with "Stats" button
  var popStatFlag = true;
  document.getElementById("PopStatsButton").onclick = function () {
    if (popStatFlag) {
      popStatFlag = false;
      registry.byId("popRight").domNode.style.width = "1px";
      registry.byId("mainBC").layout();
      dijit.byId("popRight").set("style", "display: block; visibility: visible;");

    }
    else {
      popStatFlag = true;
      registry.byId("selectOrganPane").domNode.style.width = "150px";
      registry.byId("popRight").domNode.style.width = "395px";
      registry.byId("mainBC").layout();
      dijit.byId("popRight").set("style", "display: block; visibility: visible;");

    }
  };

  /* *************************************************************** */
  /* ******* Map Grid buttons - New  Run/Pause Freeze ************** */
  /* *************************************************************** */
  dijit.byId("mnPause").attr("disabled", true);
  dijit.byId("mnFzOrganism").attr("disabled", true);
  dijit.byId("mnFzOffspring").attr("disabled", true);
  dijit.byId("mnFzPopulation").attr("disabled", true);

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
        dom.byId('ancestorBox').isSource = false;
        grd.newrun = false;  //the run will no longer be "new"
        //Disable some of the options on the Setup page
        dnd.ancestorBox.isSource = false;
        dnd.activeConfig.isSource = false;
        delete dnd.ancestorBox.accept["organism"];
        delete dnd.activeConfig.accept["conDish"];
        $("#muteSlide").slider({disabled: true});  //http://stackoverflow.com/questions/970358/jquery-readonly-slider-how-to-do
        dijit.byId("sizeCols").attr("disabled", true);
        dijit.byId("sizeRows").attr("disabled", true);
        dijit.byId("muteInput").attr("disabled", true);
        dijit.byId("childParentRadio").attr("disabled", true);
        dijit.byId("childRandomRadio").attr("disabled", true);
        dijit.byId("notose").attr("disabled", true);
        dijit.byId("nanose").attr("disabled", true);
        dijit.byId("andose").attr("disabled", true);
        dijit.byId("ornose").attr("disabled", true);
        dijit.byId("orose").attr("disabled", true);
        dijit.byId("andnose").attr("disabled", true);
        dijit.byId("norose").attr("disabled", true);
        dijit.byId("xorose").attr("disabled", true);
        dijit.byId("equose").attr("disabled", true);
        dijit.byId("experimentRadio").attr("disabled", true);
        dijit.byId("demoRadio").attr("disabled", true);

        //there will be a population so it can now be frozen.
        dijit.byId("mnFzPopulation").attr("disabled", false);
        //collect setup data to send to avida
        var setDict = {};
        setDict["sizeCols"] = dijit.byId("sizeCols").get('value');
        setDict["sizeRows"] = dijit.byId("sizeRows").get('value');
        setDict["muteInput"] = document.getElementById("muteInput").value;
        var nmlist = [];
        for (var ii = 0; ii < namelist.length; ii++) {
          nmlist.push(namelist[ii].innerHTML);
        }
        setDict["ancestor"] = nmlist;
        if (dijit.byId("childParentRadio").get('checked')) {
          setDict["birthMethod"] = 0
        }
        else {
          setDict["birthMethod"] = 1
        }
        setDict["notose"] = dijit.byId("notose").get('checked');
        setDict["nanose"] = dijit.byId("nanose").get('checked');
        setDict["andose"] = dijit.byId("andose").get('checked');
        setDict["ornose"] = dijit.byId("ornose").get('checked');
        setDict["orose"] = dijit.byId("orose").get('checked', true);
        setDict["andnose"] = dijit.byId("andnose").get('checked', true);
        setDict["norose"] = dijit.byId("norose").get('checked', true);
        setDict["xorose"] = dijit.byId("xorose").get('checked', true);
        setDict["equose"] = dijit.byId("equose").get('checked', true);
        setDict["repeatMode"] = dijit.byId("experimentRadio").get('checked', true);
        //dijit.byId("manRadio").set('checked',true);
        sendConfig(setDict);
        injectAncestors(); //uiWorker
      }
      doRunPause();
    }
    //update screen based on data from C++
  }

  function sendConfig(setDict) {
    var setjson = dojo.toJson(setDict);
    //console.log("commented out setjson ", setjson);
    console.log('test comment; delete me');

  }

  function injectAncestors() {
    var request;
    for (ii = 0; ii < parents.name.length; ii++) {
      request = {
        'type': 'addEvent',
        'name': 'injectSequence',
        'start': 'now',   //was begin
        'interval': 'once',
        'args': [
          parents.genome[ii],           //'wzcagcccccccccccccccccccccccccccccccccccczvfcaxgab',  //genome_sequence,
          parents.AvidaNdx[ii], //cell_start,
          -1, //cell_end,
          -1, //default_merit,
          ii, // lineage_label,  @ancestor
          0 //neutral_metric
        ]
      }
      uiWorker.postMessage(request);
    }
  }

  //uiWorker function
  function requestPopStats() {
    var request = {
      'type': 'addEvent',
      'name': 'webPopulationStats',
      'start': 'now',
      'interval': 'always'
    }
    uiWorker.postMessage(request);
  }

  //uiWorker function
  function requestGridData() {
    var request = {
      'type': 'addEvent',
      'name': 'webGridData',
      'start': 'now',
      'interval': 'always'
    }
    uiWorker.postMessage(request);
  }

  //sends message to worker to tell Avida to run/pause as a toggle.
  //uiWorker function
  function doRunPause() {
    if (dijit.byId("manRadio").get('checked')) {
      request = {
        'type': 'addEvent',
        'name': 'runPause',
        'triggerType': 'immediate'
      };
    }
    else {
      var num = dijit.byId("updateSpinner").get('value');
      console.log('num', num);
      request = {
        'type': 'addEvent',
        'name': 'runPause',
        'start': num,
        'interval': 'once'
      }
      console.log(request);
    }
    uiWorker.postMessage(request);
  }

  function updatePopStats(msg) {
    document.getElementById("TimeLabel").textContent = msg["update"].formatNum(0) + " updates";
    document.getElementById("popSizeLabel").textContent = msg["organisms"].formatNum(0);
    document.getElementById("aFitLabel").textContent = msg["ave_fitness"].formatNum(2);
    document.getElementById("aMetabolicLabel").textContent = msg["ave_metabolic_rate"].formatNum(1);
    document.getElementById("aGestateLabel").textContent = msg["ave_gestation_time"].formatNum(1);
    document.getElementById("aAgeLabel").textContent = msg["ave_age"].formatNum(2);
    document.getElementById("notPop").textContent = msg["not"];
    document.getElementById("nanPop").textContent = msg["nand"];
    document.getElementById("andPop").textContent = msg["and"];
    document.getElementById("ornPop").textContent = msg["orn"];
    document.getElementById("oroPop").textContent = msg["or"];
    document.getElementById("antPop").textContent = msg["andn"];
    document.getElementById("norPop").textContent = msg["nor"];
    document.getElementById("xorPop").textContent = msg["xor"];
    document.getElementById("equPop").textContent = msg["equ"];
    //update graph arrays
    ave_fitness.push(msg["ave_fitness"]);
    ave_gestation_time.push(msg["ave_gestation_time"]);
    ave_metabolic_rate.push(msg["ave_metabolic_rate"]);
    population_size.push(msg["organisms"]);
    popChartFn();
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
      //console.log("pop size ", population_size);
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

  //uiWorker function
  function doReset() {
    var request = {
      'Key': 'Reset'
    };
    uiWorker.postMessage(request);
  }

  //reset values with hard coded defaults Needs to be updated when Avida works
  function resetDishFn() { //Need to reset all settings to @default
    grd.newrun = true;
    // send rest to Avida adaptor
    doReset();
    //Enable the options on the Setup page
    dnd.ancestorBox.accept["organism"] = 1;
    dnd.activeConfig.accept["conDish"] = 1;
    dnd.ancestorBox.isSource = true;
    dnd.activeConfig.isSource = true;
    $("#muteSlide").slider({disabled: false});  //http://stackoverflow.com/questions/970358/jquery-readonly-slider-how-to-do
    dijit.byId("sizeCols").attr("disabled", false);
    dijit.byId("sizeRows").attr("disabled", false);
    dijit.byId("muteInput").attr("disabled", false);
    dijit.byId("childParentRadio").attr("disabled", false);
    dijit.byId("childRandomRadio").attr("disabled", false);
    dijit.byId("notose").attr("disabled", false);
    dijit.byId("nanose").attr("disabled", false);
    dijit.byId("andose").attr("disabled", false);
    dijit.byId("ornose").attr("disabled", false);
    dijit.byId("orose").attr("disabled", false);
    dijit.byId("andnose").attr("disabled", false);
    dijit.byId("norose").attr("disabled", false);
    dijit.byId("xorose").attr("disabled", false);
    dijit.byId("equose").attr("disabled", false);
    dijit.byId("experimentRadio").attr("disabled", false);
    dijit.byId("demoRadio").attr("disabled", false);

    //reset Ancestor Color stack
    parents.Colors = ColorBlind;
    parents.Colors.reverse();
    //set run/stop and drop down menu to the 'stopped' state
    dijit.byId("mnPause").attr("disabled", true);
    dijit.byId("mnRun").attr("disabled", false);
    document.getElementById("runStopButton").innerHTML = "Run";
    //set configuation to default
    dnd.activeConfig.selectAll().deleteSelectedNodes();
    dnd.activeConfig.insertNodes(false, [{data: "@default", type: ["conDish"]}]);
    dnd.activeConfig.sync();
    //clear the time series graphs
    ave_fitness = [];
    ave_gestation_time = [];
    ave_metabolic_rate = [];
    population_size = [];
    popChartFn();
    //Clear grid settings
    clearParents();
    //reset values in population settings either based on a 'file' @default or a @default string
    writeSettings();
    //re-write grid if that page is visible
    DrawGridSetup();
  }

  //writes data to Environmental Settings page based on the content of dnd.activeConfig
  //for now this is hard coded to what would be in @default. will need a way to request data from C++
  //and read the returned json string.
  function writeSettings() {
    TimeLabel.textContent = 0;
    dijit.byId("sizeCols").set('value', dft.sizeCols);
    dijit.byId("sizeRows").set('value', dft.sizeRows);
    dijit.byId("sizeCols").set('value', '20');    //delete later; debug only taba
    dijit.byId("sizeRows").set('value', '5');     //delete lager; debug only tiba
    document.getElementById("muteInput").value = dft.muteInput;
    var event = new Event('change');
    document.getElementById("muteInput").dispatchEvent(event);
    dnd.ancestorBox.selectAll().deleteSelectedNodes();
    dnd.ancestorBox.sync();
    dnd.gridCanvas.selectAll().deleteSelectedNodes();
    dnd.gridCanvas.sync();
    AncestorList = [];
    if ('childParentRadio'==dft.child) {
      dijit.byId("childParentRadio").set('checked', true);
      dijit.byId("childRandomRadio").set('checked', false);
    }
    else {
      dijit.byId("childParentRadio").set('checked', false);
      dijit.byId("childRandomRadio").set('checked', true);
    }
    dijit.byId("notose").set('checked', dft.notose);
    dijit.byId("nanose").set('checked', dft.nanose);
    dijit.byId("andose").set('checked', dft.andose);
    dijit.byId("ornose").set('checked', dft.ornose);
    dijit.byId("orose").set('checked', dft.orose);
    dijit.byId("andnose").set('checked', dft.andnose);
    dijit.byId("norose").set('checked', dft.norose);
    dijit.byId("xorose").set('checked', dft.xorose);
    dijit.byId("equose").set('checked', dft.equose);
    dijit.byId("experimentRadio").set('checked', true);
    dijit.byId("manRadio").set('checked', true);
    if ('experimentRadio'==dft.repeat) {
      dijit.byId("experimentRadio").set('checked', true);
      dijit.byId("demoRadio").set('checked', false);
    }
    else {
      dijit.byId("experimentRadio").set('checked', false);
      dijit.byId("demoRadio").set('checked', true);
    }
    if ('manRadio'==dft.pauseType) {
      dijit.byId("manRadio").set('checked', true);
      dijit.byId("updateRadio").set('checked', false);
    }
    else {
      dijit.byId("manRadio").set('checked', false);
      dijit.byId("updateRadio").set('checked', true);
    }

    //Selected Organism Type
    document.getElementById("nameLabel").textContent = "-";
    document.getElementById("fitLabel").innerHTML = "-";
    document.getElementById("metabolicLabel").textContent = "-";
    document.getElementById("generateLabel").textContent = "-";
    document.getElementById("ageLabel").textContent = "-";
    document.getElementById("ancestorLabel").textContent = "-";
    document.getElementById("notLabel").textContent = "not-";
    document.getElementById("nanLabel").textContent = "nan-";
    document.getElementById("andLabel").textContent = "and-";
    document.getElementById("ornLabel").textContent = "orn-";
    document.getElementById("antLabel").textContent = "ant-";
    document.getElementById("norLabel").textContent = "nor-";
    document.getElementById("xorLabel").textContent = "xor-";
    document.getElementById("equLabel").textContent = "equ-";
    document.getElementById("notTime").textContent = "0";
    document.getElementById("nanTime").textContent = "0";
    document.getElementById("andTime").textContent = "0";
    document.getElementById("ornTime").textContent = "0";
    document.getElementById("antTime").textContent = "0";
    document.getElementById("norTime").textContent = "0";
    document.getElementById("xorTime").textContent = "0";
    document.getElementById("equTime").textContent = "0";
    //Population Statistics
    document.getElementById("popSizeLabel").textContent = "-";
    document.getElementById("aFitLabel").textContent = "-";
    document.getElementById("aMetabolicLabel").textContent = "-";
    document.getElementById("aGestateLabel").textContent = "-";
    document.getElementById("aAgeLabel").textContent = "-";
    document.getElementById("notPop").textContent = "-";
    document.getElementById("nanPop").textContent = "-";
    document.getElementById("andPop").textContent = "-";
    document.getElementById("ornPop").textContent = "-";
    document.getElementById("oroPop").textContent = "-";
    document.getElementById("antPop").textContent = "-";
    document.getElementById("norPop").textContent = "-";
    document.getElementById("xorPop").textContent = "-";
    document.getElementById("equPop").textContent = "-";
    grd.flagSelected = false;
    dijit.byId("mnFzOrganism").attr("disabled", true);
  }

  function updateSelectedOrganismType(msg) {
    document.getElementById("nameLabel").textContent = msg.genotypeName;
    var prefix = "";
    if (msg.isEstimate) prefix = "est. ";
    document.getElementById("fitLabel").innerHTML = prefix + msg.fitness;
    document.getElementById("metabolicLabel").textContent = prefix + msg.metabolism;
    document.getElementById("generateLabel").textContent = prefix + msg.gestation;
    document.getElementById("ageLabel").textContent = prefix + msg.age;
    document.getElementById("ancestorLabel").textContent = msg.ancestor ;
    //add + or - to text of logic function
    if (0 == msg.tasks.not) document.getElementById("notLabel").textContent = "not-";
    else document.getElementById("notLabel").textContent = "not+";
    if (0 == msg.tasks.nan) document.getElementById("nanLabel").textContent = "nan-";
    else document.getElementById("nanLabel").textContent = "nan+";
    if (0 == msg.tasks.and) document.getElementById("andLabel").textContent = "and-";
    else document.getElementById("andLabel").textContent = "and+";
    if (0 == msg.tasks.orn) document.getElementById("ornLabel").textContent = "orn-";
    else document.getElementById("ornLabel").textContent = "orn+";
    if (0 == msg.tasks.oro) document.getElementById("oroLabel").textContent = "oro-";
    else document.getElementById("oroLabel").textContent = "oro+";
    if (0 == msg.tasks.ant) document.getElementById("antLabel").textContent = "ant-";
    else document.getElementById("antLabel").textContent = "ant+";
    if (0 == msg.tasks.nor) document.getElementById("norLabel").textContent = "nor-";
    else document.getElementById("norLabel").textContent = "nor+";
    if (0 == msg.tasks.xor) document.getElementById("xorLabel").textContent = "xor-";
    else document.getElementById("xorLabel").textContent = "xor+";
    if (0 == msg.tasks.equ) document.getElementById("equLabel").textContent = "equ-";
    else document.getElementById("equLabel").textContent = "equ+";
    //now put in the actual numbers
    document.getElementById("notTime").textContent = msg.tasks.not;
    document.getElementById("nanTime").textContent = msg.tasks.nan;
    document.getElementById("andTime").textContent = msg.tasks.and;
    document.getElementById("ornTime").textContent = msg.tasks.orn;
    document.getElementById("ornTime").textContent = msg.tasks.oro;
    document.getElementById("antTime").textContent = msg.tasks.ant;
    document.getElementById("norTime").textContent = msg.tasks.nor;
    document.getElementById("xorTime").textContent = msg.tasks.xor;
    document.getElementById("equTime").textContent = msg.tasks.equ;
    //debug
    document.getElementById("dnaLabel").textContent = msg.genome;

    if ('getgenome'==grd.kidStatus) {
      grd.kidStatus = "havegenome";
      grd.kidName = msg.genotypeName;
      grd.kidGenome = msg.genome;
    }
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
  var mouseDnoffsetPos = [];

  var nearly = function (aa, bb) {
    var epsilon = 3;
    var distance = Math.sqrt(Math.pow(aa[0] - bb[0], 2) + Math.pow(aa[1] - bb[1], 2))
    if (distance > epsilon) return false;
    else return true;
  }

  var matches = function (aa, bb) {
    if (aa[0] == bb[0] && aa[1] == bb[1]) return true;
    else return false;
  }

  var findParentNdx = function () {
    var MomNdx = -1;
    for (var ii = 0; ii < parents.name.length; ii++) {
      if (matches([grd.ColSelected, grd.RowSelected], [parents.col[ii], parents.row[ii]])) {
        MomNdx = ii;
        //console.log('parent found in function', MomNdx);
        break;  //found a parent no need to keep looking
      }
    }
    return MomNdx;
  }

  function findSelected(evt) {
    mouseX = evt.offsetX - grd.marginX - grd.xOffset;
    mouseY = evt.offsetY - grd.marginY - grd.yOffset;
    grd.ColSelected = Math.floor(mouseX / grd.cellWd);
    grd.RowSelected = Math.floor(mouseY / grd.cellHt);
    grd.NdxSelected = grd.RowSelected*grd.cols + grd.ColSelected;
    //console.log('mx,y', mouseX, mouseY, '; selected Col, Row', grd.ColSelected, grd.RowSelected);
  }

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
    findSelected(evt);
    //check to see if in the grid part of the canvas
    if (grd.ColSelected >= 0 && grd.ColSelected < grd.cols && grd.RowSelected >= 0 && grd.RowSelected < grd.rows) {
      grd.flagSelected = true;
      DrawGridSetup();
      dijit.byId("mnFzOrganism").attr("disabled", false);  //When an organism is selected, then it can be save via the menu

      //In the grid and selected. Now look to see contents of cell are dragable.
      mouse.ParentNdx = -1; //index into parents array if parent selected else -1;
      if (grd.newrun) {  //run has not started so look to see if cell contains ancestor
        mouse.ParentNdx = findParentNdx();
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
        doSelectedOrganismType(grd);
        //if ancestor not null then there is a cell there.
        if ('null' != grd.msg.ancestor.data[grd.NdxSelected]) {
          updateSelectedKid(grd);
          mouse.Picked = 'kid';
        }
        console.log('kid', grd.kidName, grd.kidGenome);
      }
    }
    else grd.flagSelected = false;
    DrawGridSetup();
  });

  //update data about a kid in the selecred organism to move = primarily genome and name
  function updateSelectedKid(grd) {
    document.getElementById('organIcon').style.cursor = 'copy';
    document.getElementById('fzOrgan').style.cursor = 'copy';
    document.getElementById('gridCanvas').style.cursor = 'copy';
    document.getElementById('SnowFlakeImage').style.cursor = 'copy';
    grd.kidName = 'temporary';
    grd.kidGenome = 'wzcagcccccccccaaaaaaaaaaaaaaaaaaaaccccccczvfcaxgab'  //ancestor
  }

  //mouse move anywhere on screen
  $(document).on('mousemove', function handler(evt) { //needed so cursor changes shape
    //console.log('gd move');
    //document.getElementById('gridCanvas').style.cursor = 'copy';
    //document.getElementById('trashCan').style.cursor = 'copy';
    //console.log('mouseMove cursor GT', document.getElementById('gridCanvas').style.cursor, dom.byId('trashCan').style.cursor);
    if (!nearly([evt.offsetX, evt.offsetY], mouse.DnGridPos)) {
      console.log("gd draging");
      if (mouse.Dn) mouse.Drag = true;
      else mouse.Drag = true;
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
      ParentMouse(evt);
    }
    else if ('offspring' == mouse.Picked) {
      mouse.Picked = "";
      OffspringMouse(evt)
    }
    else if ('kid' == mouse.Picked) {
      mouse.Picked = "";
      KidMouse(evt);
    }
    mouse.Picked = "";
  });

  function OffspringMouse(evt) {
    if ('organIcon' == evt.target.id) { // needs work!!  tiba
      //Get name of parent that is in OrganCurrentNode
      var parent;
      var parentID = Object.keys(dnd.activeOrgan.map)[0];
      console.log('parentID', parentID);
      if (undefined == parentID) parent = '';
      else parent = document.getElementById(parentID).textContent;
      dnd.activeOrgan.selectAll().deleteSelectedNodes();  //clear items
      dnd.activeOrgan.sync();   //should be done after insertion or deletion
      //Put name of offspring in OrganCurrentNode
      dnd.activeOrgan.insertNodes(false, [{data: parent + "_offspring", type: ["organism"]}]);
      dnd.activeOrgan.sync();

      fzr.actOrgan.name = parent + "_offspring";
      fzr.actOrgan.genome = gen.dna[1];  //this should be the full genome when the offspring is complete.
      fzr.actOrgan.domId = Object.keys(dnd.activeOrgan.map)[0];
      console.log('fzr.actOrgan', fzr.actOrgan.genome);
      //get genome from offspring data //needs work!!
      doOrgTrace();  //request new Organism Trace from Avida and draw that.
    }
    else if ('freezerDiv' == evt.target.id || 'SnowFlakeImage' == evt.target.id) {
      //create a new freezer item
      if (debug.mouse) console.log('offSpring->freezerDiv');
      if (debug.mouse) console.log('in SnowFlakeImage');
      var parent;
      var parentID = Object.keys(dnd.activeOrgan.map)[0];
      console.log('parentID', parentID);
      if (undefined == parentID) parent = 'noParentName';
      else parent = document.getElementById(parentID).textContent;
      //make sure there is a name.
      var avidian = prompt("Please name your avidian", parent+'_offspring');
      if (avidian) {
        avidian = getUniqueName(avidian, dnd.fzOrgan);
        if (null != avidian) {  //add to Freezer
          dnd.fzOrgan.insertNodes(false, [{data: avidian, type: ["organism"]}]);
          dnd.fzOrgan.sync();
          //find domId of parent as listed in dnd.fzOrgan
          var mapItems = Object.keys(dnd.fzOrgan.map);
          var domStr = "";
          var neworg = {
            'name': avidian,
            'domId': mapItems[mapItems.length - 1],
            'genome': gen.dna[1]
          }
          fzr.organism.push(neworg);
          if (debug.mouse) console.log('Offspring-->Snow, fzr.organism', fzr.organism);
          //create a right mouse-click context menu for the item just created.
          if (debug.mouse) console.log('Offspring-->snowFlake; neworg', neworg);
          contextMenu(fzr, dnd.fzOrgan, neworg.domId);
        }
      }
    }
  }

  function KidMouse(evt){
    if (debug.mouse) console.log('in KidMouse', evt.target.id, evt);
    if ('organIcon' == evt.target.id) {
      //Change to Organism Page
      mainBoxSwap("organismBlock");
      organismCanvasHolderSize();
      var height = ($("#rightDetail").innerHeight() - 375) / 2;
      document.getElementById("ExecuteJust").style.height = height + "px";  //from http://stackoverflow.com/questions/18295766/javascript-overriding-styles-previously-declared-in-another-function
      document.getElementById("ExecuteAbout").style.height = height + "px";
      document.getElementById("ExecuteJust").style.width = "100%";
      document.getElementById("ExecuteAbout").style.width = "100%";

      dnd.activeOrgan.selectAll().deleteSelectedNodes();  //clear items
      dnd.activeOrgan.sync();   //should be done after insertion or deletion
      //Put name of offspring in OrganCurrentNode
      dnd.activeOrgan.insertNodes(false, [{data: grd.kidName, type: ["organism"]}]);
      dnd.activeOrgan.sync();
      //genome data should be in parents.genome[mouse.ParentNdx];
      fzr.actOrgan.genome = grd.kidGenome;
      fzr.actOrgan.name = grd.kidName;
      fzr.actOrgan.domId = "";
      doOrgTrace();  //request new Organism Trace from Avida and draw that.
    }
    else if ('freezerDiv' == evt.target.id || 'SnowFlakeImage' == evt.target.id){
      if (debug.mouse) console.log('in SnowFlakeImage');
      //make sure there is a name.
      var avidian = prompt("Please name your avidian", grd.kidName);
      if (avidian) {
        avidian = getUniqueName(avidian, dnd.fzOrgan);
        if (null != avidian) {  //add to Freezer
          dnd.fzOrgan.insertNodes(false, [{data: avidian, type: ["organism"]}]);
          dnd.fzOrgan.sync();
          //find domId of parent as listed in dnd.ancestorBox
          var mapItems = Object.keys(dnd.fzOrgan.map);
          var domStr = "";
          var neworg = {
            'name': avidian,
            'domId': mapItems[mapItems.length - 1],
            'genome': grd.kidGenome
          }
          fzr.organism.push(neworg);
          if (debug.mouse) console.log('Kid-->Snow', fzr.organism);
          //create a right mouse-click context menu for the item just created.
          if (debug.mouse) console.log('kid to snowFlake', neworg);
          contextMenu(fzr, dnd.fzOrgan, neworg.domId);
        }
      }
    }
  }

  function ParentMouse(evt) {
    if (debug.mouse) console.log('ParentMouse', evt.target.id, evt);
    if ('gridCanvas' == evt.target.id) { // parent moved to another location on grid canvas
      mouse.UpGridPos = [evt.offsetX, evt.offsetY]; //not used for now
      //Move the ancestor on the canvas
      //console.log("on gridCanvas")
      findSelected(evt);
      // look to see if this is a valid grid cell
      if (grd.ColSelected >= 0 && grd.ColSelected < grd.cols && grd.RowSelected >= 0 && grd.RowSelected < grd.rows) {
        parents.col[mouse.ParentNdx] = grd.ColSelected;
        parents.row[mouse.ParentNdx] = grd.RowSelected;
        parents.AvidaNdx[parents.handNdx[ii]] = parents.col[parents.handNdx[ii]] + grd.cols * parents.row[parents.handNdx[ii]];
        //console.log('mvparent', mouse.ParentNdx, parents.col[mouse.ParentNdx], parents.row[mouse.ParentNdx]);
        //console.log('b auto', parents.autoNdx.length, parents.autoNdx, parents.name);
        //console.log('b hand', parents.handNdx.length, parents.handNdx);
        //change from auto placed to hand placed if needed
        if ('auto' == parents.howPlaced[mouse.ParentNdx]) {
          parents.howPlaced[mouse.ParentNdx] = 'hand';
          makeHandAutoNdx();
          //PlaceAncestors(parents);
        }
        //console.log('auto', parents.autoNdx.length, parents.autoNdx, parents.name);
        //console.log('hand', parents.handNdx.length, parents.handNdx);
        DrawGridSetup();
      }
    }  // close on canvas
    //-------------------------------------------- dnd.trashCan
    else if ('TrashCanImage' == evt.target.id) {
      if (debug.mouse) console.log('parent->trashCan', evt);
      var node = dojo.byId(parents.domId[mouse.ParentNdx]);
      dnd.ancestorBox.parent.removeChild(node);
      dnd.ancestorBox.sync();

      //remove from main list.
      removeParent(mouse.ParentNdx, parents);
      DrawGridSetup();
    }
    //-------------------------------------------- organism view
    else if ('organIcon' == evt.target.id) {
      //Change to Organism Page
      mainBoxSwap("organismBlock");
      organismCanvasHolderSize();
      var height = ($("#rightDetail").innerHeight() - 375) / 2;
      document.getElementById("ExecuteJust").style.height = height + "px";  //from http://stackoverflow.com/questions/18295766/javascript-overriding-styles-previously-declared-in-another-function
      document.getElementById("ExecuteAbout").style.height = height + "px";
      document.getElementById("ExecuteJust").style.width = "100%";
      document.getElementById("ExecuteAbout").style.width = "100%";

      dnd.activeOrgan.selectAll().deleteSelectedNodes();  //clear items
      dnd.activeOrgan.sync();   //should be done after insertion or deletion
      //Put name of offspring in dnd.activeOrganism
      dnd.activeOrgan.insertNodes(false, [{data: parents.name[mouse.ParentNdx], type: ["organism"]}]);
      dnd.activeOrgan.sync();
      //genome data should be in parents.genome[mouse.ParentNdx];
      fzr.actOrgan.genome = parents.genome[mouse.ParentNdx];
      fzr.actOrgan.name = parents.name[mouse.ParentNdx];
      fzr.actOrgan.domId = parents.domId[mouse.ParentNdx];
      doOrgTrace();  //request new Organism Trace from Avida and draw that.
    }
  }

  function fromAncestorBoxRemove(removeName) {
    var domItems = Object.keys(dnd.ancestorBox.map);
    //console.log("domItems=", domItems);
    var nodeIndex = -1;
    for (var ii = 0; ii < domItems.length; ii++) { //http://stackoverflow.com/questions/5837558/dojo-drag-and-drop-how-to-retrieve-order-of-items
      if (dnd.ancestorBox.map[domItems[ii]].data == removeName) {
        nodeIndex = ii;
      }
    }
    var node = dojo.byId(domItems[nodeIndex]);
    console.log('nodeIndex', nodeIndex, domItems[nodeIndex]);
    dnd.ancestorBox.parent.removeChild(node);
    dnd.ancestorBox.sync();
  }

  /* *************************************************************** */
  // ****************  Draw Population Grid ************************ */
  /* *************************************************************** */

    //Set up canvas objects
    grd.CanvasScale = document.getElementById("scaleCanvas");
    grd.sCtx = grd.CanvasScale.getContext("2d");
    grd.CanvasGrid = document.getElementById('gridCanvas');
    grd.cntx = grd.CanvasGrid.getContext("2d");

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
      popY = ave_fitness;
    }
    else if ("Average Gestation Time" == dijit.byId("yaxis").value) {
      popY = ave_gestation_time;
    }
    else if ("Average Metabolic Rate" == dijit.byId("yaxis").value) {
      popY = ave_metabolic_rate;
    }
    else if ("Number of Organisms" == dijit.byId("yaxis").value) {
      popY = population_size;
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
    doOrgTrace();  //request new Organism Trace from Avida and draw that.
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
    doOrgTrace();  //request new Organism Trace from Avida and draw that.
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
    chck.ColSelected = Math.floor(mouseX / chck.cellWd);
    chck.RowSelected = Math.floor(mouseY / chck.cellHt);
    console.log('Shrew col,row', chck.ColSelected, chck.RowSelected);
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
    if (chck.ColSelected >= 0 && chck.ColSelected < chck.cols && chck.RowSelected >= 0 && chck.RowSelected < chck.rows) {
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
      console.log('before', chck.ColSelected, chck.RowSelected);
      findShrew(evt);
      // look to see if this is a valid grid cell
      if (chck.ColSelected >= 0 && chck.ColSelected < chck.cols && chck.RowSelected >= 0 && chck.RowSelected < chck.rows) {
        console.log('chipFound', chck.ColSelected, chck.RowSelected);
        chips.col[shrew.chipNdx] = chck.ColSelected;
        chips.row[shrew.chipNdx] = chck.RowSelected;
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
      if (matches([chck.ColSelected, chck.RowSelected], [chips.col[ii], chips.row[ii]])) {
        ChipedNdx = ii;
        //console.log('chip found in function', ChipedNdx);
        break;  //found a chip no need to keep looking
      }
    }
    return ChipedNdx;
  }

});
