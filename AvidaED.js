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
  "dojo/domReady!"
  ], function(dijit, parser, declare, query, nodelistTraverse, space, AppStates, Dialog,
              BorderContainer, ContentPane, MenuBar, PopupMenuBarItem, MenuItem, Menu, 
              Button, TitlePane, dndSource, dndManager, dndSelector, dndTarget, domGeometry, domStyle, dom,
              aspect, on, registry, Select,
              HorizontalSlider, HorizontalRule, HorizontalRuleLabels, RadioButton, ToggleButton, NumberSpinner, ComboButton,
              DropDownButton, ComboBox, Textarea, Chart, Default, Lines, Grid, MouseZoomAndPan, Wetland, ready, $, jqueryui){

    parser.parse();
    var uiWorker = new Worker('ui-test.js');

    //process message from web worker
    uiWorker.onmessage = function(ee){
      var msg = ee.data;  //passed as object rather than string so JSON.parse is not needed.
      switch(msg.Key){
        case 'RunPause':
          if (true != msg["Success"]) {
          console.log("Error: ", msg);  // msg failed
          runStopFn();  //flip state back since the message failed to get to Avida
        }
          break;
        case 'Reset':
          if (true != msg["Success"]) { console.log("Reset failed: ", msg)};
          break;
        case 'OrgTrace':
          traceObj = msg;
          cycle = 0;
          cycleSlider.set("maximum", traceObj.length-1);
          cycleSlider.set("discreteValues", traceObj.length);
          updateOrgTrace(traceObj, cycle);
          break;
        case 'PopulationStats':
          updatePopStats(msg);
          //doPopMap();  //Call to update grid colors;
          fakePopMap();
          break;
        case 'PopMap':
          //updatePopMap(msg);
          break;
        default:
          console.log('UnknownRequest: ', msg);
          break;
      }
    }
    
    //uiWorker function to get color data for the grid
    function doPopMap() {
      var str = ""; 
      switch(dijit.byId("colorMode").value) {
        case 'Fitness': 
          str = 'last_fitness';
          break;
        case 'Gestation Time':
          str = 'last_gestation_time';
          break
        case 'Metabolic Rate':
          str = 'Metabolic Rate';
          break;
        case 'Ancestor Organism':
          str = 'clade';
          break;
        default:
          str = "error";
          console.log('unknown dimension for color map');
          break
      }
      if ('error' != str) {
        var request = {
          'Key':'PopMap', 
          'Mode': str
        }
       uiWorker.postMessage(request);
      }
    }

    // Resize window helpers -------------------------------------------
    // called from script in html file as well as below
    BrowserResizeEventHandler=function(){
      if ("block"==domStyle.get("analysisBlock","display")){AnaChartFn();};
      if ("block"==domStyle.get("populationBlock","display")){popChartFn();DrawGridBackground();};
      if ("block"==domStyle.get("organismBlock","display")){
        var height = ($("#rightDetail").innerHeight()-375)/2;
        document.getElementById("ExecuteJust").style.height = height+"px";  //from http://stackoverflow.com/questions/18295766/javascript-overriding-styles-previously-declared-in-another-function
        document.getElementById("ExecuteAbout").style.height = height+"px";
        document.getElementById("ExecuteJust").style.width = "100%";  
        document.getElementById("ExecuteAbout").style.width = "100%";
        if (undefined != traceObj) { 
          updateOrgTrace(traceObj, cycle);
        }; 
      } 
    }

    ready(function(){
      aspect.after(registry.byId("gridHolder"), "resize", function(){BrowserResizeEventHandler()});
      aspect.after(registry.byId("popChartHolder"), "resize", function(){BrowserResizeEventHandler()});
      aspect.after(registry.byId("organismCanvasHolder"), "resize", function(){BrowserResizeEventHandler()});
    });

    var oldwidth = 0;
    aspect.after(registry.byId("popRight"), "resize", function(){
      if (registry.byId("popRight").domNode.style.width != oldwidth) {
        oldwidth = registry.byId("popRight").domNode.style.width;
        var str = registry.byId("popRight").domNode.style.width;
        registry.byId("selectOrganPane").domNode.style.width=Math.round((Number(str.substr(0,str.length-2))-50)*0.45)+"px"
        registry.byId("mainBC").layout();  
      }
    });

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
    
    dijit.byId("Hardware").on("Click", function(){ 
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
/*    var popNewHt = $("#blockHolder").height()-10;
    dijit.byId("populationBlock").set("style", "height: "+ popNewHt +"px");
    dijit.byId("popBC").set("style", "height: "+ popNewHt+"px");
    
    var mapNewHt = $("#mapBlockHold").height()-10;
    dijit.byId("mapBlock").set("style", "height: "+ mapNewHt +"px");
    //mapNewHt = mapNewHt - 5;
    dijit.byId("mapBC").set("style", "height: "+ mapNewHt +"px;");
*/
    function mainBoxSwap(showBlock){
      //console.log("in mainBoxSwap");
      dijit.byId("populationBlock").set("style", "display: none;");
      dijit.byId("organismBlock").set("style", "display: none;");
      dijit.byId("analysisBlock").set("style", "display: none;");
      dijit.byId("testBlock").set("style", "display: none;");       //take testBlock out completely later 
      dijit.byId(showBlock).set("style", "display: block; visibility: visible;");
      dijit.byId(showBlock).resize();
    };
  
    // Buttons that call MainBoxSwap 
    document.getElementById("populationButton").onclick = function(){ 
      mainBoxSwap("populationBlock"); 
      DrawGridBackground();
    }
    document.getElementById("organismButton").onclick = function(){ 
      mainBoxSwap("organismBlock"); 
      OrgCanvas.width = $("#organismCanvasHolder").innerWidth()-6;
      OrgCanvas.height = $("#organismCanvasHolder").innerHeight()-6;
      var height = ($("#rightDetail").innerHeight()-375)/2;
      document.getElementById("ExecuteJust").style.height = height+"px";  //from http://stackoverflow.com/questions/18295766/javascript-overriding-styles-previously-declared-in-another-function
      document.getElementById("ExecuteAbout").style.height = height+"px";
      document.getElementById("ExecuteJust").style.width = "100%";  
      document.getElementById("ExecuteAbout").style.width = "100%";
    }
    document.getElementById("analysisButton").onclick = function(){ mainBoxSwap("analysisBlock"); }
    //Take testBlock out completely later
    //document.getElementById("testButton").onclick = function(){ mainBoxSwap("testBlock"); }

    /* ********************************************************************** */
    /* Drag N Drop Freezer ****************************************************/
    /* ********************************************************************** */
    
    dojo.declare("AcceptOneItemSource", dndSource, {
      checkAcceptance : function(source, nodes) {
        if (this.node.children.length >= 1) {
           return false;
        }
        return this.inherited(arguments);
      }
    });
          
    var freezeConfigure = new dndSource("freezeConfigureNode", {accept: ["conDish"], copyOnly: true, singular: true, selfAccept: false});
    freezeConfigure.insertNodes(false, [
      { data: "@default",      type: ["conDish"]},
      { data: "s20m.2Nand",    type: ["conDish"]},
      { data: "s30m.2Not",     type: ["conDish"]}
    ]);
    var freezeOrgan = new dndSource("freezeOrganNode", {accept: ["organism"], copyOnly: true, singular: true , selfAccept: false});
    freezeOrgan.insertNodes(false, [
      { data: "@ancestor",      type: ["organism"]},
      { data: "m2u8000Nand",    type: ["organism"]},
      { data: "m2u8000Not",     type: ["organism"]}
      //{ data: "@ancestor",      type: ["organism"], genome: '@anc_0'},  //did not seem to get in to structure
     // { data: "m2u8000Nand",    type: ["organism"], genome: 'Nand 1'},  
     // { data: "m2u8000Not",     type: ["organism"], genome: 'Not 2'}
    ]);
    
    var freezePopDish = new dndSource("freezePopDishNode", {accept: ["popDish"], copyOnly: true, singular: true, selfAccept: false});
    freezePopDish.insertNodes(false, [
      { data: "@example",       type: ["popDish"]},
      { data: "m2w30u1000nand", type: ["popDish"]},
      { data: "m2w30u1000not",  type: ["popDish"]}
    ]);
    var AncestorBox = new dndSource("AncestorBoxNode", {accept: ["organism"]});
    //Have not made final decision about which div the dnd will connect to
    //var gridBoxNode = "gridBoxNode";  //the div around the grid
    var gridBoxNode = "gridCanvas";   //the actual canvas object
    var gridBox = new dndSource(gridBoxNode, {accept: ["organism"]}); 
    
    var trash = new dndSource("trashNode", {accept: ['conDish', 'organism', 'popDish'], singular: true});
    
    var ConfigCurrent = new dndTarget("ConfigCurrentNode", {accept: ["conDish"], singular:true});  //Targets only accept object, source can do both
    ConfigCurrent.insertNodes(false, [{ data: "@default",      type: ["conDish"]}]);
    
    //http://stackoverflow.com/questions/11909540/how-to-remove-delete-an-item-from-a-dojo-drag-and-drop-source
    var OrganCurrent = new dndSource("OrganCurrentNode", {accept: ["organism"], singular: true, selfAccept: false});
    var OrganCanvas = new dndSource("organismCanvas", {accept: ["organism"], singular: true, selfAccept: false});
    // Next two lines for test only on 24 Aug. Delete later
    //OrganCanvas.insertNodes(false, [{ data: "test",      type: ["organism"]}]);
    //console.log('OrganCanvas', OrganCanvas);

    var graphPop1 = new dndTarget("graphPop1Node", {accept: ["popDish"], singular: true}); 
    var graphPop2 = new dndTarget("graphPop2Node", {accept: ["popDish"], singular: true});
    var graphPop3 = new dndTarget("graphPop3Node", {accept: ["popDish"], singular: true});
/*
    //temp ---------to look at adding info to data
    //http://stackoverflow.com/questions/5837558/dojo-drag-and-drop-how-to-retrieve-order-of-items
    var orderedDataItems = freezeOrgan.getAllNodes().map(function(node){
        return freezeOrgan.getItem(node.id).data;
    });
    //console.log("orderedDataItems", orderedDataItems);
    var domItems = Object.keys(freezeOrgan.map);
    //console.log("domItems=", domItems);
    //console.log("domItems.length", domItems.length);
    for (var ii=0; ii< domItems.length; ii++) {
      document.getElementById(domItems[ii]).textContent = freezeOrgan.map[domItems[ii]].data; 
      freezeOrgan.map[domItems[ii]].data = orderedDataItems[ii]+'0';
      //console.log("doc", document.getElementById(domItems[ii]));
      //console.log("freezeOrgan.map[domItems[ii]].genome=", freezeOrgan.map[domItems[ii]].genome);
    }
    console.log("freezeOrgan.map", freezeOrgan.map);
*/
    // General DnD functions --------------------------------------
    //http://stackoverflow.com/questions/1134572/dojo-is-there-an-event-after-drag-drop-finished
    //Puts the contents of the source in a object (list) called items. 
    function getAllItems(source){
      var items = source.getAllNodes().map(function(node){
        return source.getItem(node.id);
      });
      return items;
    }
    
    // does not work
    on(dom.byId("gridCanvas"),"drop", function(event){
      domGeometry.normalizeEvent(event);
      console.log("xx ", event.pageX);
      console.log("yy ", event.pageY);
    })

    //-------- Configuration DnD ---------------------------------------
    //Need to have only the most recent dropped configuration in configCurrent. Do this by deleting everything in configCurrent
    //and reinserting the most resent one after a drop event.
    //This triggers for every dnd drop, not just those of freezeConfigureNode
    ConfigCurrent.on("DndDrop", function(source, nodes, copy, target){
      if (target.node.id=="ConfigCurrentNode"){
        //clear all data so when we add one there will never be more than one.
        ConfigCurrent.selectAll().deleteSelectedNodes();  //http://stackoverflow.com/questions/11909540/how-to-remove-delete-an-item-from-a-dojo-drag-and-drop-source
        //get the data for the new configuration 
        freezeConfigure.forInSelectedItems(function(item, id){
          ConfigCurrent.insertNodes(false, [item]);  //assign the node that is selected from the only valid source.
        });
        ConfigCurrent.sync(); 
        
        //update the visible name to the user will recognize it
        var currentItem = Object.keys(ConfigCurrent.map)[0];
        var freezeItem = Object.keys(freezeConfigure.selection)[0];
        //console.log("currentI", currentItem, " freezeI", freezeItem);
        var tmp = document.getElementById(freezeItem).textContent;
        document.getElementById(currentItem).textContent = tmp;
        
        //Update the configuration based on the data  ***needs work****
      }
    });
    
    //This triggers for every dnd drop, not just those of freezeConfigureNode
    freezeConfigure.on("DndDrop", function(source, nodes, copy, target){
      if (target.node.id=="freezeConfigureNode"){
        // Asks for a name for any object dragged to the freezer. Need to check for duplicate names.
        // Does not change "data" value, only textContent changes.
        var dishCon = prompt("Please name your dish configuration", nodes[0].textContent+"_1");
        var namelist = dojo.query('> .dojoDndItem', 'freezeConfigureNode');
        var unique = true;
        while (unique) {
          unique = false;
          for (var ii = 0; ii < namelist.length; ii++){
            //console.log ("name ", namelist[ii].innerHTML);
            if (dishCon == namelist[ii].innerHTML) {
              dishCon = prompt("Please give your configured dish a unique name ", dishCon+"_1")
              unique = true;
              break;
            }
          }  
        }
        if (null != dishCon) nodes[0].textContent=dishCon;
        contextMenu(target);
      }
    });
    
    //Organsim dnd------------------------------------------------------
    function PlaceAncestors() {
      var cols = dijit.byId("sizex").get('value');
      var rows = dijit.byId("sizey").get('value');
      switch(AncestorBoxCnt){
        case 1:   //Place in center
          parents.col[AncestorBoxNdx[0]] = Math.trunc(cols/2);
          parents.row[AncestorBoxNdx[0]] = Math.trunc(rows/2);
          parents.ndx[AncestorBoxNdx[0]] = parents.col[AncestorBoxNdx[0]] + cols * parents.row[AncestorBoxNdx[0]];
          break;
        case 2:
          if (cols > rows) {  //place parents horizontally
            for (ii = 0; ii < AncestorBoxCnt; ii++) {
              parents.col[AncestorBoxNdx[ii]] = Math.trunc(cols*(ii+1)/3);
              parents.row[AncestorBoxNdx[ii]] = Math.trunc(rows/2);
              parents.ndx[AncestorBoxNdx[ii]] = parents.col[AncestorBoxNdx[ii]] + cols * parents.row[AncestorBoxNdx[ii]];
            }
          }
          else {  //place parents vertically
            for (ii = 0; ii < AncestorBoxCnt; ii++) {
              parents.col[AncestorBoxNdx[ii]] = Math.trunc(cols/3);
              parents.row[AncestorBoxNdx[ii]] = Math.trunc(rows*(ii+1)/3);
              parents.ndx[AncestorBoxNdx[ii]] = parents.col[AncestorBoxNdx[ii]] + cols * parents.row[AncestorBoxNdx[ii]];
            }
          }
          break;
        case 3:
          if (cols > rows) {  //place parents horizontally
            for (ii = 0; ii < 2; ii++) {
              parents.col[AncestorBoxNdx[ii]] = Math.trunc(cols*(ii+1)/3);
              parents.row[AncestorBoxNdx[ii]] = Math.trunc(rows/3);
              parents.ndx[AncestorBoxNdx[ii]] = parents.col[AncestorBoxNdx[ii]] + cols * parents.row[AncestorBoxNdx[ii]];
            }
            parents.col[AncestorBoxNdx[2]] = Math.trunc(cols/2);
            parents.row[AncestorBoxNdx[2]] = Math.trunc(rows*2/3);
            parents.ndx[AncestorBoxNdx[2]] = parents.col[AncestorBoxNdx[ii]] + cols * parents.row[AncestorBoxNdx[ii]];
          }
          else {  //place parents vertically
            for (ii = 0; ii < 2; ii++) {
              parents.col[AncestorBoxNdx[ii]] = Math.trunc(cols/3);
              parents.row[AncestorBoxNdx[ii]] = Math.trunc(rows*(ii+1)/3);
              parents.ndx[AncestorBoxNdx[ii]] = parents.col[AncestorBoxNdx[ii]] + cols * parents.row[AncestorBoxNdx[ii]];
            }
            parents.col[AncestorBoxNdx[2]] = Math.trunc(cols*2/3);
            parents.row[AncestorBoxNdx[2]] = Math.trunc(rows/2);
            parents.ndx[AncestorBoxNdx[2]] = parents.col[AncestorBoxNdx[ii]] + cols * parents.row[AncestorBoxNdx[ii]];
          }
          break;          
        default:
          console.log('bigger than 2');
          break;
      }
      console.log('rows, cols, AnBoxCnt', rows, cols, AncestorBoxCnt);
      for (ii=0; ii< AncestorBoxCnt; ii++) {
        console.log("ii, col, row, ndx", ii, parents.col[AncestorBoxNdx[ii]], parents.row[AncestorBoxNdx[ii]], parents.ndx[AncestorBoxNdx[ii]]);
      }
    }

    var AncestorBoxCnt = 0;
    var AncestorBoxNdx = [];
    var parents = {};
    parents.name = [];
    parents.genome = [];
    parents.col = [];
    parents.row = [];
    parents.ndx = [];
    parents.cnt = 0; 
    
    function DrawParent() {};

    //This triggers for every dnd drop, not just those of AncestorBoxNode
    AncestorBox.on("DndDrop", function(source, nodes, copy, target){
      if (target.node.id=="AncestorBoxNode"){
        //var namelist = dojo.query('> .dojoDndItem', 'AncestorBoxNode');
        //console.log("ancestorBox=",target.map)
        var fzItemID = target.selection[0]; 
        var fzSection = target.node.id;
        nn = parents.name.length;
        parents.name[nn] = nodes[0].textContent;
        AncestorBoxNdx.push(nn);
        AncestorBoxCnt++;
        //for (ll=0; ll<AncestorBoxCnt; ll++){
        //  console.log('AnBoxNdx, ll, nn, AnBoxCnt',AncestorBoxNdx[ll],ll, nn, AncestorBoxCnt)
        //}
        //equalSpace();
        PlaceAncestors();
      }
    });

    // Process Drop on gridBox
    //This triggers for every dnd drop, not just those of gridBoxNode
    gridBox.on("DndDrop", function(source, nodes, copy, target){
      if (target.node.id==gridBoxNode){
        freezeOrgan.forInSelectedItems(function(item, id){  
          AncestorBox.insertNodes(false, [item]);          //assign the node that is selected from the only valid source.
        });
        // need to create an array of ancestors to be used for color key
        //console.log("grid ", gridBox);
        //console.log('xUP, y', gridMouse.xUp, gridMouse.yUp);
        
        var nn = parents.name.length;
        parents.name[nn] = nodes[0].textContent;

        var mouseX = gridMouse.xUp - grd.marginX - grd.xOffset;
        var mouseY = gridMouse.yUp - grd.marginY - grd.yOffset;
        parents.col[nn] = Math.floor(mouseX/grd.cellWd);
        parents.row[nn] = Math.floor(mouseY/grd.cellHt);
        //check to see if in the grid part of the canvas
        if (grd.ColSelected >=0 && grd.ColSelected < grd.cols && grd.RowSelected >=0 && grd.RowSelected < grd.rows) {
          cntx.beginPath();
          var xx = grd.marginX + grd.xOffset + parents.col[nn] * grd.cellWd;
          var yy = grd.marginY + grd.yOffset + parents.row[nn] * grd.cellHt;
          cntx.fillStyle = 'white';
          cntx.fillRect(xx, yy, grd.cellWd, grd.cellHt);
        }
        console.log("parents", parents);  //error in drawing a white square to represent the parent
      }
    });

    //When something is added to the Organism Freezer ------------------
    //This triggers for every dnd drop, not just those of gridBoxNode
    freezeOrgan.on("DndDrop", function(source, nodes, copy, target){
      if (target.node.id=="freezeOrganNode"){
        var strItem = Object.keys(target.selection)[0];
        var avidian = prompt("Please name your avidian", document.getElementById(strItem).textContent + "_1");
        var namelist = dojo.query('> .dojoDndItem', 'freezeOrganNode');
        var unique = true;
        while (unique) {
          unique = false;
          for (var ii = 0; ii < namelist.length; ii++){
            //console.log ("name ", namelist[ii].innerHTML);
            if (avidian == namelist[ii].innerHTML) {
              avidian = prompt("Please give your avidian a unique name ", avidian+"_1")
              unique = true;
              break;
            }
          }  
        }
        //console.log(Object.keys(target.map))
        //console.log("before: data",target.map[strItem].data, " content=", document.getElementById(strItem).textContent);
        if (null != avidian) { 
          document.getElementById(strItem).textContent=avidian; 
          //console.log(target.map[strItem].data); need to make sure this is unique
        }
        console.log('fzOrgan', freezeOrgan);
        //console.log("Fztarget=", target);
        //console.log("fz nodes", nodes);
        contextMenu(target); 
      }
    });

    //Need to have only the most recent dropped organism in OrganCurrent. Do this by deleting everything in organCurrent
    //and reinserting the most resent one after a drop event.
    //This triggers for every dnd drop, not just those of OrganCurrentNode
    OrganCurrent.on("DndDrop", function(source, nodes, copy, target){
      if (target.node.id=="OrganCurrentNode"){
        //clear out the old data
        var items = getAllItems(OrganCurrent);    //gets some data about the items in the container
        OrganCurrent.selectAll().deleteSelectedNodes();  //clear items  
        OrganCurrent.sync();   //should be done after insertion or deletion
        
        //get the data for the new organism
        freezeOrgan.forInSelectedItems(function(item, id){  
          OrganCurrent.insertNodes(false, [item]);          //assign the node that is selected from the only valid source.
        });
        OrganCurrent.sync();
        //console.log("OrganCurrent.map=", OrganCurrent.map);
        
        //get the right name so the user will recognize it
        var currentItem = Object.keys(OrganCurrent.map)[0];
        var freezeItem = Object.keys(freezeOrgan.selection)[0];
        //console.log("currentI", currentItem, " freezeI", freezeItem);
        var tmp = document.getElementById(freezeItem).textContent;
        document.getElementById(currentItem).textContent = tmp;
        //console.log("OrganCurrent.map=", OrganCurrent.map);
        //console.log(Object.keys(OrganCurrent.map))
        doOrgTrace();  //request new Organism Trace from Avida and draw that.
      }
    });
    
    //var OrganCanvas = new dndSource("organismCanvas", {accept: ["organism"], singular: "true"});
    //The variable OrganCanvas with the html tag organismCanvas will Not hold the organism. Anything dropped on the OrganismCanvas
    //will be put in OrganCurrent.
    OrganCanvas.on("DndDrop", function(source, nodes, copy, target){
      if (target.node.id=="organismCanvas"){
        OrganCurrent.selectAll().deleteSelectedNodes();  //clear items  
        OrganCurrent.sync();   //should be done after insertion or deletion

        //get the data for the new organism
        freezeOrgan.forInSelectedItems(function(item, id){  
          OrganCurrent.insertNodes(false, [item]);          //assign the node that is selected from the only valid source.
        });
        OrganCurrent.sync();

        //get the right name so the user will recognize it
        var currentItem = Object.keys(OrganCurrent.map)[0];   //dojo assigned DOM id
        var freezeItem = Object.keys(freezeOrgan.selection)[0];
        //console.log("currentI", currentItem, " freezeI", freezeItem);
        var tmp = document.getElementById(freezeItem).textContent;
        document.getElementById(currentItem).textContent = tmp;
        //console.log("OrganCurrent.map=", OrganCurrent.map);
        //console.log(Object.keys(OrganCurrent.map))
        doOrgTrace();  //request new Organism Trace from Avida and draw that.
        
        console.log('OrganCanvas', OrganCanvas.map);
        //OrganCanvas.selectAll().deleteSelectedNodes();  //clear items  
        //OrganCanvas.sync();   //should be done after insertion or deletion
      }
    });

    //dojo dnd;
    function addOffspring() {
      var parentID = Object.keys(OrganCurrent.map)[0];
      var parent = document.getElementById(parentID).textContent;
      var items = getAllItems(OrganCanvas);
      console.log('items', items.length, items);
      if (0 == items.length) {
        OrganCanvas.insertNodes(false, [{ data: parent+"_offspring",      type: ["organism"]}]);
        OrganCanvas.sync();
        console.log(OrganCanvas.map);
      }
    }
    
    //uiWorker function
    function doOrgTrace() {
       var request = {
          'Key':'OrgTrace', 
          'PtMuteRate': '0.02',
          'Seed': '0'  // sets to demo mode; optional if left off it is experimental mode
       };
       uiWorker.postMessage(request);
    }

    // Process trash ---------------------------------------------------
    //This triggers for every dnd drop, not just those of trashNode
    trash.on("DndDrop", function(source, nodes, copy, target){
      //console.log("Source: ", source);
      //console.log("Nodes: ", nodes);
      //console.log("Copy: ", copy);
      //console.log("Target: ", target);
      if (target.node.id=="trashNode"){
        //http://stackoverflow.com/questions/1812148/dojo-dnd-move-node-programmatically
        source.parent.removeChild(nodes[0]);
        //var items = getAllItems(trash);
        trash.selectAll().deleteSelectedNodes();  //does appear to clear items 
        //target.parent.removeChild(nodes[0]);
      }
    });

    //------------------------------------- Populated Dishes DND ---------------------
    //This triggers for every dnd drop, not just those of freezePopDish
    freezePopDish.on("DndDrop", function(source, nodes, copy, target){
      if (target.node.id=="freezePopDishNode"){
        //var items = getAllItems(freezePopDish);  not used
        var popDish = prompt("Please name your populated dish", nodes[0].textContent+"_1");
        var namelist = dojo.query('> .dojoDndItem', 'freezePopDishNode');
        var unique = true;
        while (unique) {
          unique = false;
          for (var ii = 0; ii < namelist.length; ii++){
            if (popDish == namelist[ii].innerHTML) {
              popDish = prompt("Please give your populated dish a unique name ", popDish+"_1")
              unique = true;
              break;
            }
          }  
        }
        if (null!=popDish) { 
          nodes[0].textContent=popDish;
          //to change data value not fully tested, but keep as it was hard to figure out
          //freezePopDish.setItem(target.node.id, {data: popDish, type: ["popDish"]});
        }
        contextMenu(target);  // 
        //console.log("nodes[0].id, target.node.id = ", nodes[0].id, target.node.id);
        //console.log(Object.keys(target.selection)[0]);
        //console.log("map: ", target.map);
        //console.log("id: ", target.node.id);
        //console.log("textContent: ", nodes[0].textContent);
        //console.log("nodes[0].id: ", nodes[0].id);
        //console.log("target.selection: ",target.selection);
        //console.log("target.selection: ",Object.keys(target.selection)[0]);
        //console.log(document.getElementById(Object.keys(target.selection)[0]).innerHTML)
        //console.log("allnodes: ",target.getAllNodes());
      }
    });
    
    //This triggers for every dnd drop, not just those of freezePopDish
    freezePopDish.on("DndDrop", function(source, nodes, copy, target){
      if (source.node.id =="graphPop1Node"){
        pop1a = [];       //remove lines from population 1
        pop1b = [];
        AnaChartFn();
      }
      if (source.node.id =="graphPop2Node"){
        pop2a = [];       //remove lines from population 2
        pop2b = [];
        AnaChartFn();
      }
      if (source.node.id =="graphPop3Node"){
        pop3a = [];       //remove lines from population 3
        pop3b = [];
        AnaChartFn();
      }
    });
    
    var domItm; //used in population graph slots
    var currentItem;
    var freezeItem;
    //This triggers for every dnd drop, not just those of graphPop1
    graphPop1.on("DndDrop", function(source, nodes, copy, target){
      if (target.node.id=="graphPop1Node"){
        var items = getAllItems(graphPop1);
        //if there is an existing item, need to clear all nodes and assign most recent to item 0
        if (1 < items.length) {
          //clear out the old data
          graphPop1.selectAll().deleteSelectedNodes();  //clear items  
          graphPop1.sync();   //should be done after insertion or deletion
          
          //get the data for the new organism
          freezePopDish.forInSelectedItems(function(item, id){  
            graphPop1.insertNodes(false, [item]);          //assign the node that is selected from the only valid source.
          });
          graphPop1.sync();
          //console.log("graphPop1.map=", graphPop1.map);
          
          //get the right name so the user will recognize it
          currentItem = Object.keys(graphPop1.map)[0];
          freezeItem = Object.keys(freezePopDish.selection)[0];
          console.log("currentI", currentItem, " freezeI", freezeItem);
          domItm = document.getElementById(freezeItem).textContent;
          document.getElementById(currentItem).textContent = domItm;
          //console.log("graphPop1.map=", graphPop1.map);
          //console.log(Object.keys(graphPop1.map))
          console.log('1=', domItm);
        }
        currentItem = Object.keys(graphPop1.map)[0];
        domItm = document.getElementById(currentItem).textContent
        //update the graph
        //this works for demo purposes only. We will be using textContent rather than data
        pop1a = dictPlota[domItm];
        pop1b = dictPlotb[domItm];
        //console.log('1=', domItm);
        AnaChartFn();
        
        //example code to set item programatically. not actually needed here.
        //graphPop1.setItem(graphPop1.node.childNodes[0].id, {data: "test_name", type: ["popDish"]});
        //graphPop1.sync();
        //console.log("graphPop1.node.childNodes[0].id=", graphPop1.node.childNodes[0].id);
      }
    });

    //This triggers for every dnd drop, not just those of graphPop1
    graphPop2.on("DndDrop", function(source, nodes, copy, target){
      if (target.node.id=="graphPop2Node"){
        var items = getAllItems(graphPop2);
        //if there is an existing item, need to clear all nodes and assign most recent to item 0
        if (1 < items.length) {
          //clear out the old data
          graphPop2.selectAll().deleteSelectedNodes();  //clear items  
          graphPop2.sync();   //should be done after insertion or deletion
          
          //get the data for the new organism
          freezePopDish.forInSelectedItems(function(item, id){  
            graphPop2.insertNodes(false, [item]);          //assign the node that is selected from the only valid source.
          });
          graphPop2.sync();
          //console.log("graphPop2.map=", graphPop2.map);
          
          //get the right name so the user will recognize it
          currentItem = Object.keys(graphPop2.map)[0];
          freezeItem = Object.keys(freezePopDish.selection)[0];
          console.log("currentI", currentItem, " freezeI", freezeItem);
          domItm = document.getElementById(freezeItem).textContent;
          document.getElementById(currentItem).textContent = domItm;
          //console.log("graphPop2.map=", graphPop2.map);
          //console.log(Object.keys(graphPop2.map))
          console.log('2=', domItm);
        }
        currentItem = Object.keys(graphPop2.map)[0];
        domItm = document.getElementById(currentItem).textContent
        //update the graph
        //this works for demo purposes only. We will be using textContent rather than data
        pop2a = dictPlota[domItm];
        pop2b = dictPlotb[domItm];
        //console.log('2=', domItm);
        AnaChartFn();
      }
    });

    //This triggers for every dnd drop, not just those of graphPop1
    graphPop3.on("DndDrop", function(source, nodes, copy, target){
      if (target.node.id=="graphPop3Node"){
        var items = getAllItems(graphPop3);
        //if there is an existing item, need to clear all nodes and assign most recent to item 0
        if (1 < items.length) {
          //clear out the old data
          graphPop3.selectAll().deleteSelectedNodes();  //clear items  
          graphPop3.sync();   //should be done after insertion or deletion
          
          //get the data for the new organism
          freezePopDish.forInSelectedItems(function(item, id){  
            graphPop3.insertNodes(false, [item]);          //assign the node that is selected from the only valid source.
          });
          graphPop3.sync();
          //console.log("graphPop3.map=", graphPop3.map);
          
          //get the right name so the user will recognize it
          currentItem = Object.keys(graphPop3.map)[0];
          freezeItem = Object.keys(freezePopDish.selection)[0];
          console.log("currentI", currentItem, " freezeI", freezeItem);
          domItm = document.getElementById(freezeItem).textContent;
          document.getElementById(currentItem).textContent = domItm;
          //console.log("graphPop3.map=", graphPop3.map);
          //console.log(Object.keys(graphPop3.map))
          console.log('3=', domItm);
        }
        currentItem = Object.keys(graphPop3.map)[0];
        domItm = document.getElementById(currentItem).textContent
        //update the graph
        //this works for demo purposes only. We will be using textContent rather than data
        pop3a = dictPlota[domItm];
        pop3b = dictPlotb[domItm];
        console.log('3=', domItm);
        AnaChartFn();
        
        //example code to set item programatically. not actually needed here.
        //graphPop3.setItem(graphPop3.node.childNodes[0].id, {data: "test_name", type: ["popDish"]});
        //graphPop3.sync();
        //console.log("graphPop3.node.childNodes[0].id=", graphPop3.node.childNodes[0].id);
      }
    });

    /* ********************************************************************** */
    /* Right Click Context Menu Freezer ************************************* */
    /* ********************************************************************** */
    //used to re-name freezer items after they are created--------------
    //http://jsfiddle.net/bEurr/10/
    function contextMenu(target) {
      var fzItemID = Object.keys(target.selection)[0];
      var fzSection = target.node.id;
      //console.log("target.node=", target.node);
      //console.log("target.node.id=",target.node.id);
      //console.log("selection=", target.selection);
      //console.log("selection[]=", target.selection)[0];
      //console.log("target.map", target.map);
      console.log("fzItemID=",fzItemID, " fzSection=", fzSection);

      var aMenu;
      aMenu = new dijit.Menu({ targetNodeIds: [fzItemID]});
      aMenu.addChild(new dijit.MenuItem({
        label: "Rename",
        onClick: function() {
          var fzName = prompt("Please rename freezer item", document.getElementById(fzItemID).textContent);
          var namelist = dojo.query('> .dojoDndItem', fzSection);
          var unique = true;
          while (unique) {
            unique = false;
            if (fzName != document.getElementById(fzItemID).innerHTML){
              for (var ii = 0; ii < namelist.length; ii++){
                //console.log ("name ", namelist[ii].innerHTML);
                if (fzName == namelist[ii].innerHTML) {
                  fzName = prompt("Please give your freezer item a unique name ", fzName+"_1")
                  unique = true;
                  break;
                }
              }  
            }
          }
          if (null!=fzName) {
            //document.getElementById(fzItemID).innerHTML = fzName;  //either works
            document.getElementById(fzItemID).textContent = fzName;
            console.log(".data=", target.map[fzItemID].data);
          }
        }
      }));
      aMenu.addChild(new dijit.MenuItem({
        label: "delete",
        onClick: function() {
          var sure = confirm("Do you want to delete " + document.getElementById(fzItemID).textContent);
          if (sure) {
            //target.parent.removeChild(fzItemID);
            target.selectNone(); 
            dojo.destroy(fzItemID); 
            target.delItem(fzItemID); 
            //console.log("target.map", target.map);
          }
        }
      }))
    };
    // create the delete dialog:
    deleteDlg = new dijit.Dialog({
        title: "Delete",
        
        style: "width: 300px"
    });
    
    /* *************************************************************** */
    /* Population page script ******************************************/
    /* *************************************************************** */
    // shifts the population page from Map (grid) view to setup parameters view and back again.
    function popBoxSwap(){
      if ("Map"== document.getElementById("PopSetupButton").innerHTML ) {
      var height = $("#mapBlock").innerHeight()-6;

        dijit.byId("mapBlock").set("style", "display: block; height: "+height+"px");
        dijit.byId("mapBC").set("style", "height: "+height+"px");
        dijit.byId("setupBlock").set("style", "display: none");
        document.getElementById("PopSetupButton").innerHTML = "Setup";
        DrawGridBackground();
      } else {
        document.getElementById("PopSetupButton").innerHTML = "Map";
        dijit.byId("setupBlock").set("style", "display: block;");
        dijit.byId("mapBlock").set("style", "display: none;");
      }
    }
    document.getElementById("PopSetupButton").onclick = function(){popBoxSwap();};

    // hides and shows the population and selected organsim data on right of population page with "Stats" button
    var popStatFlag = true;
    document.getElementById("PopStatsButton").onclick = function(){
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
    /* ******* Map Grid buttons ************************************** */
    /* *************************************************************** */
    var newrun = true;
    var ave_fitness = [];
    var ave_gestation_time = [];
    var ave_metabolic_rate = [];
    var population_size = [];
    dijit.byId("mnPause").attr("disabled", true);
    
    function runPopFn(){
      //check for ancestor organism in configuration data
      var namelist = dojo.query('> .dojoDndItem', 'AncestorBoxNode');
      //console.log("namelist", namelist);
      if (1>namelist.length){
        document.getElementById("runStopButton").innerHTML="Run";
        dijit.byId("mnPause").attr("disabled", true);
        dijit.byId("mnRun").attr("disabled", false);
        NeedAncestorDialog.show();
      }
      else { // setup for a new run by sending config data to avida
        if (newrun) {
          newrun = false;  //the run will no longer be "new"
          //collect setup data to send to C++
          var setDict={};
          setDict["sizex"]=dijit.byId("sizex").get('value');
          setDict["sizey"]=dijit.byId("sizey").get('value');
          setDict["muteInput"]=document.getElementById("muteInput").value;
          var nmlist = [];
          for (var ii=0; ii<namelist.length; ii++){
            nmlist.push(namelist[ii].innerHTML);
          }
          setDict["ancestor"] = nmlist;
          if (dijit.byId("childParentRadio").get('checked')){
            setDict["birthMethod"]=0}
          else {
          setDict["birthMethod"]=1}
          setDict["notose"]=dijit.byId("notose").get('checked');
          setDict["nanose"]=dijit.byId("nanose").get('checked');
          setDict["andose"]=dijit.byId("andose").get('checked');
          setDict["ornose"]=dijit.byId("ornose").get('checked');
          setDict["orose"]=dijit.byId("orose").get('checked',true);
          setDict["andnose"]=dijit.byId("andnose").get('checked',true);
          setDict["norose"]=dijit.byId("norose").get('checked',true);
          setDict["xorose"]=dijit.byId("xorose").get('checked',true);
          setDict["equose"]=dijit.byId("equose").get('checked',true);
          setDict["repeatMode"]=dijit.byId("experimentRadio").get('checked',true);
          //dijit.byId("manRadio").set('checked',true); 
           
          var setjson = dojo.toJson(setDict);
          //console.log("setjson ", setjson);   
        }  
        //DataManagerRead();
        doRunPause();
      }
      //update screen based on data from C++
    }
 
    //sends message to worker to tell Avida to run/pause as a toggle. 
    //uiWorker function
    function doRunPause() {
       var request = {
          'Key':'RunPause'
       };
       uiWorker.postMessage(request);
    }

    //Dummy Data 
    //var dataManDict={}
    //dataManDict["core.world.update"]=1;
    //var dataManJson = dojo.toJson(dataManDict);
    //var DataManJson = JSON.stringify(dataManDict) //does the same thing as dojo.toJason
    //console.log("man ", dataManJson);
    //console.log("str ", DataManJson);

    function updatePopStats(msg){
        document.getElementById("TimeLabel").textContent = msg["core.update"].formatNum(0)+" updates";
        document.getElementById("popSizeLabel").textContent = msg["core.world.organisms"].formatNum(0);
        document.getElementById("aFitLabel").textContent = msg["core.world.ave_fitness"].formatNum(2);
        document.getElementById("aMetabolicLabel").textContent = msg["core.world.ave_metabolic_rate"].formatNum(1);
        document.getElementById("aGestateLabel").textContent = msg["core.world.ave_gestation_time"].formatNum(1);
        document.getElementById("aAgeLabel").textContent = msg["core.world.ave_age"].formatNum(2);
        document.getElementById("notPop").textContent = msg["core.environment.triggers.not.test_organisms"];
        document.getElementById("nanPop").textContent = msg["core.environment.triggers.nand.test_organisms"];
        document.getElementById("andPop").textContent = msg["core.environment.triggers.and.test_organisms"];
        document.getElementById("ornPop").textContent = msg["core.environment.triggers.orn.test_organisms"];
        document.getElementById("oroPop").textContent = msg["core.environment.triggers.or.test_organisms"];
        document.getElementById("antPop").textContent = msg["core.environment.triggers.andn.test_organisms"];
        document.getElementById("norPop").textContent = msg["core.environment.triggers.nor.test_organisms"];
        document.getElementById("xorPop").textContent = msg["core.environment.triggers.xor.test_organisms"];
        document.getElementById("equPop").textContent = msg["core.environment.triggers.equ.test_organisms"];
        //update graph arrays
        ave_fitness.push(msg["core.world.ave_fitness"]); 
        ave_gestation_time.push(msg["core.world.ave_gestation_time"]);
        ave_metabolic_rate.push(msg["core.world.ave_metabolic_rate"]);
        population_size.push(msg["core.world.organisms"]);
        popChartFn();
    }
    
    //from http://stackoverflow.com/questions/149055/how-can-i-format-numbers-as-money-in-javascript
    Number.prototype.formatNum = function(c, d, t){
    var n = this, 
        c = isNaN(c = Math.abs(c)) ? 2 : c, 
        d = d == undefined ? "." : d, 
        t = t == undefined ? "," : t, 
        s = n < 0 ? "-" : "", 
        i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", 
        j = (j = i.length) > 3 ? j % 3 : 0;
       return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
     };

    //process the run/Stop Button - a separate function is used so it can be flipped if the message to avida is not successful. 
    document.getElementById("runStopButton").onclick = function(){runStopFn()}
    function runStopFn(){
      if ("Run"==document.getElementById("runStopButton").innerHTML) {
        document.getElementById("runStopButton").innerHTML="Pause";
        dijit.byId("mnPause").attr("disabled", false);
        dijit.byId("mnRun").attr("disabled", true);
        runPopFn();
      } else {
        document.getElementById("runStopButton").innerHTML="Run";
        dijit.byId("mnPause").attr("disabled", true);
        dijit.byId("mnRun").attr("disabled", false);
        doRunPause()
        //console.log("pop size ", population_size);
      }
    };

    //Same as above but for drop down menu
    dijit.byId("mnRun").on("Click", function(){ 
        dijit.byId("mnPause").attr("disabled", false);
        dijit.byId("mnRun").attr("disabled", true);
        document.getElementById("runStopButton").innerHTML="Pause";
        runPopFn();
    });

    dijit.byId("mnPause").on("Click", function(){ 
        dijit.byId("mnPause").attr("disabled", true);
        dijit.byId("mnRun").attr("disabled", false);
        document.getElementById("runStopButton").innerHTML="Run";
        doRunPause()
    });
    
    /* ************** New Button and new Dialog ***********************/    
    dijit.byId("newDiscard").on("Click", function(){
      newDialog.hide();
      resetDishFn();
      //console.log("newDiscard click");
    }); 

    dijit.byId("newSave").on("Click", function(){
      newDialog.hide();
      resetDishFn();
      FrPopulationFn();
      //console.log("newSave click");
    }); 

    function newButtonBoth(){
      if (newrun) {// reset petri dish
        resetDishFn();
      }
      else {// check to see about saving current population
        newDialog.show();
      }
    }
    document.getElementById("newDishButton").onclick = function(){newButtonBoth()};
    dijit.byId("mnNewpop").on("Click", function(){newButtonBoth()});
    
    //uiWorker function
    function doReset() {
      var request = {
        'Key':'Reset'
      };
      uiWorker.postMessage(request);
    }
    
    function resetDishFn() { //Need to reset all settings to @default
      newrun = true;
      // send rest to Avida adaptor
      doReset();
      //set run/stop and drop down menu to the 'stopped' state
      dijit.byId("mnPause").attr("disabled", true);
      dijit.byId("mnRun").attr("disabled", false);
      document.getElementById("runStopButton").innerHTML="Run";
      //set configuation to default
      ConfigCurrent.selectAll().deleteSelectedNodes();  
      ConfigCurrent.insertNodes(false, [{ data: "@default",      type: ["conDish"]}]);
      ConfigCurrent.sync();
      //clear the time series graphs
      ave_fitness = [];
      ave_gestation_time = [];
      ave_metabolic_rate = [];
      population_size = [];
      popChartFn();
      //reset values in population settings either based on a 'file' @default or a @default string
      writeSettings();
    }

    //writes data to Environmental Settings page based on the content of ConfigCurrent
    //for now this is hard coded to what would be in @default. will need a way to request data from C++
    //and read the returned json string. 
    function writeSettings(){
      dijit.byId("sizex").set('value','60');
      dijit.byId("sizey").set('value','60');
      document.getElementById("muteInput").value='2';
      var event = new Event('change');
      document.getElementById("muteInput").dispatchEvent(event);
      AncestorBox.selectAll().deleteSelectedNodes();
      AncestorBox.sync();
      gridBox.selectAll().deleteSelectedNodes();
      gridBox.sync();
      AncestorList = [];
      TimeLabel.textContent = 0;
      document.getElementById("seedTray").innerHTML="";
      dijit.byId("childParentRadio").set('checked',true);
      dijit.byId("notose").set('checked',true);
      dijit.byId("nanose").set('checked',true);
      dijit.byId("andose").set('checked',true);
      dijit.byId("ornose").set('checked',true);
      dijit.byId("orose").set('checked',true);
      dijit.byId("andnose").set('checked',true);
      dijit.byId("norose").set('checked',true);
      dijit.byId("xorose").set('checked',true);
      dijit.byId("equose").set('checked',true);
      dijit.byId("experimentRadio").set('checked',true);
      dijit.byId("manRadio").set('checked',true);
      //Selected Organism Type
      document.getElementById("nameLabel").textContent="-";
      document.getElementById("fitLabel").innerHTML="-";
      document.getElementById("metabolicLabel").textContent="-";
      document.getElementById("generateLabel").textContent="-";
      document.getElementById("ageLabel").textContent="-";
      document.getElementById("ancestorLabel").textContent="-";
      document.getElementById("notLabel").textContent="not-";
      document.getElementById("nanLabel").textContent="nan-";
      document.getElementById("andLabel").textContent="and-";
      document.getElementById("ornLabel").textContent="orn-";
      document.getElementById("antLabel").textContent="ant-";
      document.getElementById("norLabel").textContent="nor-";
      document.getElementById("xorLabel").textContent="xor-";
      document.getElementById("equLabel").textContent="equ-";
      document.getElementById("notTime").textContent="0";
      document.getElementById("nanTime").textContent="0";
      document.getElementById("andTime").textContent="0";
      document.getElementById("ornTime").textContent="0";
      document.getElementById("antTime").textContent="0";
      document.getElementById("norTime").textContent="0";
      document.getElementById("xorTime").textContent="0";
      document.getElementById("equTime").textContent="0";
      //Population Statistics
      document.getElementById("popSizeLabel").textContent="-";
      document.getElementById("aFitLabel").textContent="-";
      document.getElementById("aMetabolicLabel").textContent="-";
      document.getElementById("aGestateLabel").textContent="-";
      document.getElementById("aAgeLabel").textContent="-";
      document.getElementById("notPop").textContent="-";
      document.getElementById("nanPop").textContent="-";
      document.getElementById("andPop").textContent="-";
      document.getElementById("ornPop").textContent="-";
      document.getElementById("oroPop").textContent="-";
      document.getElementById("antPop").textContent="-";
      document.getElementById("norPop").textContent="-";
      document.getElementById("xorPop").textContent="-";
      document.getElementById("equPop").textContent="-";
      grd.flagSelected = false;
    }

    //******* Freeze Button ********************************************
    document.getElementById("freezeButton").onclick = function(){
      fzDialog.show();
    }
    
    function FrConfigFn(){
      var fzName = prompt("Please name the new configuration", "newConfig");
      var namelist = dojo.query('> .dojoDndItem', "freezeConfigureNode");
      var unique = true;
      while (unique) {
        unique = false;
        for (var ii = 0; ii < namelist.length; ii++){
          //console.log ("name ", namelist[ii].innerHTML);
          if (fzName == namelist[ii].innerHTML) {
            fzName = prompt("Please give your new configuration a unique name ", fzName+"_1")
            unique = true;
            break;
          }
        }  
      }
      if (null!=fzName) {
        freezeConfigure.insertNodes(false, [ {data: fzName,   type: ["conDish"]}]);
        freezeConfigure.sync();
      }
    }
    
    dijit.byId("FzConfiguration").on("Click", function(){
      fzDialog.hide();
      FrConfigFn();
    }); 

    dijit.byId("mnFzConfig").on("Click", function(){ FrConfigFn() });
    
    function FrPopulationFn(){
      var fzName = prompt("Please name the new population", "newPopulation");
      var namelist = dojo.query('> .dojoDndItem', "freezePopDishNode");
      var unique = true;
      while (unique) {
        unique = false;
        for (var ii = 0; ii < namelist.length; ii++){
          //console.log ("name ", namelist[ii].innerHTML);
          if (fzName == namelist[ii].innerHTML) {
            fzName = prompt("Please give your new Population a unique name ", fzName+"_1")
            unique = true;
            break;
          }
        }  
      }
      if (null!=fzName) {
        freezePopDish.insertNodes(false, [ {data: fzName,   type: ["popDish"]}]);
        freezePopDish.sync();
      }
    }

    dijit.byId("FzPopulation").on("Click", function(){
      fzDialog.hide();
      FrPopulationFn();
    }); 
    
    dijit.byId("mnFzPopulation").on("Click", function() {FrPopulationFn() });
    
    dijit.byId("mnFzOrganism").on("Click", function(){ FrOrganismFn() });

    function FrOrganismFn(){
      var fzName = prompt("Please name the organism", "newOrganism");
      var namelist = dojo.query('> .dojoDndItem', "freezeOrganNode");
      var unique = true;
      while (unique) {
        unique = false;
        for (var ii = 0; ii < namelist.length; ii++){
          //console.log ("name ", namelist[ii].innerHTML);
          if (fzName == namelist[ii].innerHTML) {
            fzName = prompt("Please give your new Organism a unique name ", fzName+"_1")
            unique = true;
            break;
          }
        }  
      }
      if (null!=fzName) {
        freezeOrgan.insertNodes(false, [ {data: fzName,   type: ["organism"]}]);
        freezeOrgan.sync();
        //http://stackoverflow.com/questions/5837558/dojo-drag-and-drop-how-to-retrieve-order-of-items
        var orderedDataItems = freezeOrgan.getAllNodes().map(function(node){
          return freezeOrgan.getItem(node.id).data;
        });
        //console.log("orderedDataItems", orderedDataItems);
        var domItems = Object.keys(freezeOrgan.map);
        //console.log("domItems=", domItems);
        var nodeIndex = -1;
        for (var ii=0; ii< domItems.length; ii++) {
          if (freezeOrgan.map[domItems[ii]].data == fzName) {
            nodeIndex = ii;
          }
        }
        console.log('nodeIndex, domItem', nodeIndex, domItems[nodeIndex]);
        //http://dojo-toolkit.33424.n3.nabble.com/dojo-dnd-problems-selection-object-from-nodes-etc-td3753366.html
        //make the new node the selected node. Does not show up on the screen, but works for purpose of creating contextMenu
        freezeOrgan.selection[domItems[nodeIndex]] = 1;
        contextMenu(freezeOrgan);
        
      }
    }

    // End of Freezer Functions 
    /* *************************************************************** */
    // ****************  Draw Population Grid ************************ */
    /* *************************************************************** */

    var CanvasScale = document.getElementById("scaleCanvas");
    var sCtx = CanvasScale.getContext("2d");
    CanvasScale.width = $("#gridHolder").innerWidth()-6;

    var CanvasGrid = document.getElementById("gridCanvas");
    var cntx = CanvasGrid.getContext("2d");
    CanvasGrid.width = $("#gridHolder").innerWidth()-6;
    CanvasGrid.height = $("#gridHolder").innerHeight()-16-$("#scaleCanvas").innerHeight();
    
    grd = {};
    grd.cols = 30;  //x
    grd.rows = 30;  //y
    grd.sizeX = 300;  
    grd.sizeY = 300;
    grd.border = 0;
    grd.flagSelected = false;
    
    function GradientScale() {
      var xStart = 30;
      var xEnd = CanvasScale.width - xStart;
      var gradWidth = xEnd-xStart 
      var grad = sCtx.createLinearGradient(xStart+2, 0, xEnd-2, 0)
      var legendHt = 15;
      for (var ii=0; ii < viridis_cmap.length; ii++) {
        grad.addColorStop(ii/(viridis_cmap.length-1), viridis_cmap[ii]); 
      }
      sCtx.fillStyle = grad;
      sCtx.fillRect(xStart, legendHt, gradWidth, CanvasScale.height-legendHt);
    }

    //   var request = {
    //      'Key':'RunPause'

    function drawblock(cntxt, xx, yy, wide, high, color) {
      //cntxt.
    }

    function fakePopMap() {
      //Thought I needed to have integer values, but looks ok with non-integers
      //grd.cellWd = Math.trunc((grd.sizeX-1)/grd.cols); 
      //grd.cellHt = Math.trunc((grd.sizeY-1)/grd.rows);
      //grd.marginX = Math.trunc((grd.sizeX - grd.cellWd * grd.cols)/2);
      //grd.marginY = Math.trunc((grd.sizeY - grd.cellHt * grd.rows)/2);
      
      grd.marginX = 1;
      grd.marginY = 1;
      grd.cellWd = ((grd.sizeX-grd.marginX)/grd.cols); 
      grd.cellHt = ((grd.sizeY-grd.marginY)/grd.rows);
      
      //console.log('grd.sizeX,Y', grd.sizeX, grd.sizeY, '; cellWd, Ht', grd.cellWd, grd.cellHt, 
      // '; product',grd.cellWd*grd.cols, grd.cellHt*grd.rows,  '; marginX, Y', grd.marginX, grd.marginY);
      //console.log ("cellWd, Ht", grd.cellWd, grd.cellHt);
      var boxColor = {};
      for (ii=0; ii<grd.cols; ii++) {
        xx = grd.marginX + grd.xOffset + ii*grd.cellWd;
        for (jj=0; jj<grd.rows; jj++) {
          yy = grd.marginY + grd.yOffset + jj*grd.cellHt;
          boxColor[ii, jj] = get_color(viridis_cmap, Math.random(), 0, 1);
          //console.log('color=', boxColor[ii,jj]);
          cntx.fillStyle = boxColor[ii, jj];
          cntx.fillRect(xx, yy, grd.cellWd-1, grd.cellHt-1);
        }
      }
    }

    gridMouse ={};
    gridBox.on("MouseUp", function(evt){
      //console.log("x", evt.layerX, "; y", evt.layerY); 
      gridMouse.xUp = evt.layerX;
      gridMouse.yUp = evt.layerY;
    });

    //https://github.com/kangax/fabric.js/wiki/Working-with-events
    gridBox.on("MouseDown", function(evt){
      //console.log("xdn", evt.layerX, "; y", evt.layerY); 
      mouseX = evt.layerX - grd.marginX - grd.xOffset;
      mouseY = evt.layerY - grd.marginY - grd.yOffset;
      grd.ColSelected = Math.floor(mouseX/grd.cellWd);
      grd.RowSelected = Math.floor(mouseY/grd.cellHt);
      //console.log('mx,y', mouseX, mouseY, '; boxCol, Row', boxCol, boxRow);

      //check to see if in the grid part of the canvas
      if (grd.ColSelected >=0 && grd.ColSelected < grd.cols && grd.RowSelected >=0 && grd.RowSelected < grd.rows) {
        //erase last selection by redrawing the entire page
        //DrawGridBackground();
        
        //erase last selection by drawing a black outline over the white outline.
        //need away to know if this is needed. Can cause trouble when grid size changes.
        if (grd.flagSelected) {
          cntx.beginPath();
          cntx.rect(grd.selectX, grd.selectY, grd.cellWd, grd.cellHt);
          cntx.strokeStyle = 'black';
          cntx.lineWidth = 1;
          cntx.stroke();
        }
        cntx.beginPath();
        grd.selectX = grd.marginX + grd.xOffset + grd.ColSelected * grd.cellWd;
        grd.selectY = grd.marginY + grd.yOffset + grd.RowSelected * grd.cellHt;
        cntx.rect(grd.selectX, grd.selectY, grd.cellWd, grd.cellHt);
        cntx.strokeStyle = 'white';
        cntx.lineWidth = 1;
        cntx.stroke();
        grd.flagSelected = true;
      }
    });

    function DrawGridBackground() {
      CanvasScale.width = $("#gridHolder").innerWidth()-6;
      CanvasGrid.width = $("#gridHolder").innerWidth()-6;
      CanvasGrid.height = $("#gridHolder").innerHeight()-16-$("#scaleCanvas").innerHeight();
      // Use the identity matrix while clearing the canvas    http://stackoverflow.com/questions/2142535/how-to-clear-the-canvas-for-redrawing
      cntx.setTransform(1, 0, 0, 1, 0, 0);
      cntx.clearRect(0, 0, CanvasGrid.width, CanvasGrid.height); //to clear canvas see http://stackoverflow.com/questions/2142535/how-to-clear-the-canvas-for-redrawing
      // set box size based on border
      grd.boxY = CanvasGrid.height - grd.border;
      grd.boxX = CanvasGrid.width - grd.border; //for a border
      //draw grey rectangle as back ground
      cntx.fillStyle = dictColor["ltGrey"];
      cntx.fillRect(0,0, CanvasGrid.width, CanvasGrid.height);
      sCtx.fillStyle = dictColor["ltGrey"];
      sCtx.fillRect(0,0, CanvasGrid.width, CanvasGrid.height);
      //set rows and cols based on settings
      grd.cols = dijit.byId("sizex").get('value');
      grd.rows = dijit.byId("sizey").get('value');
      //max size of box based on width or height based on ratio of cols:rows and width:height
      if (CanvasGrid.width/grd.boxY > grd.cols/grd.rows) {
        //set based  on height as that is the limiting factor. 
        grd.sizeY = grd.boxY;
        grd.sizeX = grd.sizeY*grd.cols/grd.rows;
      } 
      else {
        //set based on width as that is the limiting direction
        grd.sizeX = grd.boxX;
        grd.sizeY = grd.sizeX * grd.rows/grd.cols;
      }
      grd.xOffset = (CanvasGrid.width-grd.sizeX)/2;
      grd.yOffset = (CanvasGrid.height-grd.sizeY)/2;
      //cntx.translate(grd.xOffset, grd.yOffset);
      cntx.fillStyle=dictColor['Black'];
      cntx.fillRect(grd.xOffset,grd.yOffset,grd.sizeX,grd.sizeY);
      //console.log("cntx grd", grd);
      GradientScale();
      fakePopMap()
    }

    function GridUpdate(GrdClr) {
    }

    //cntx.beginPath();
    //cntx.moveTo(0,0);
    //cntx.lineTo(200,100);
    //cntx.stroke();

    /* *************************************************************** */
    /* ******* Population Setup Buttons, etc.  *********************** */
    /* *************************************************************** */
    function popSizeFn() {
      //console.log("in popSizeFn");
      //console.log(dijit.byId("sizex"));
      var xx = Number(document.getElementById("sizex").value);
      var yy = Number(document.getElementById("sizey").value);
      //console.log("x is " + xx + "; y=" + yy);
      document.getElementById("sizexy").innerHTML = "is a total of " + xx * yy + " cells";
    }

    dijit.byId("sizex").on("Change", popSizeFn);
    dijit.byId("sizey").on("Change", popSizeFn);
    //console.log("after size");

    $(function slidemute() {
      /* because most mutation rates will be less than 2% I set up a non-linear scale as was done in the Mac Avida-ED */
      /* the jQuery slider I found only deals in integers and the fix function truncates rather than rounds, */
      /* so I multiplied by 100,000 to get 100.000% to come out even. */
      //console.log("before defaultslide value");
      var muteSlideDefault = 109861.   /* results in 2% as a default */
      var muteDefault = (Math.pow(Math.E, (muteSlideDefault/100000))-1).toFixed(3)
      var slides = $( "#muteSlide" ).slider({
        // range: "min",   /*causes the left side of the scroll bar to be grey */
        value: muteSlideDefault,
        min: 0.0,
        max: 461512,
        slide: function( event, ui ) {
          $( "#mRate" ).val( ui.value);  /*put slider value in the text above the slider */
          $( "#muteInput" ).val( (Math.pow(Math.E, (ui.value/100000))-1).toFixed(3));  /*put the value in the text box */
        }
      });
      /* initialize */
      $( "#mRate" ).val( ($( "#muteSlide").slider( "value" )));
      $( "#muteInput" ).val(muteDefault);
      /*update slide based on textbox */
      $( "#muteInput" ).change(function() {
        slides.slider( "value", 100000.0*Math.log(1+(parseFloat(this.value))) );
        $( "#mRate" ).val( 100000*Math.log(1+(parseFloat(this.value))) );
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
    
    function popChartFn(){
      if ("Average Fitness" == dijit.byId("yaxis").value) {popY = ave_fitness;}
      else if ("Average Gestation Time" == dijit.byId("yaxis").value) {popY = ave_gestation_time;}
      else if ("Average Metabolic Rate" == dijit.byId("yaxis").value) {popY = ave_metabolic_rate;}
      else if ("Number of Organisms" == dijit.byId("yaxis").value) {popY = population_size;}
      //popChart.setTheme(myTheme);
      popChart.addPlot("default", {type: "Lines"});
      //popChart.addPlot("grid",{type:"Grid",hMinorLines:false});  //if color not specified it uses tick color.
      // grid info from https://dojotoolkit.org/reference-guide/1.10/dojox/charting.html
      popChart.addPlot("grid", {type:Grid, hMajorLines: true, majorHLine: {color: "#CCC", width: 1}, 
                                          vMajorLines: true, majorVLine: {color: "#CCC", width: 1}});

      popChart.addAxis("x", {fixLower: "major", fixUpper: "major",title:'Time (updates)', titleOrientation: 'away', titleGap: 2,
                             titleFont: "normal normal normal 8pt Arial", font: "normal normal normal 8pt Arial"});
      //popChart.addAxis("y", {vertical: true, title: ytitle, titleFont: "normal normal normal 8pt Arial", titleOrientation: 'axis',
      popChart.addAxis("y", {vertical: true, 
                    fixLower: "major", fixUpper: "major", min: 0, font: "normal normal normal 8pt Arial", titleGap: 4,});
      popChart.addSeries("Series y", popY, {stroke: {color:"blue", width: 2}});   
      popChart.resize(domGeometry.position(document.getElementById("popChartHolder")).w-10, 
                    domGeometry.position(document.getElementById("popChartHolder")).h-30);
      popChart.render();
    };
    popChartFn();
   
    //Set Y-axis title and choose the correct array to plot
    dijit.byId("yaxis").on("Change", function(){
      ytitle = dijit.byId("yaxis").value;
      //need to get correct array to plot from freezer
      popChartFn();
    });
    
    /* *************************************************************** */
    /* Organism page script *********************************************/
    /* *************************************************************** */
    /* **** Organism Setup Dialog */

    document.getElementById("OrgSetting").onclick = function(){
      OrganSetupDialog.show();
    }
    
    //process button to hide or show Organism detail panal. 
    var DetailsFlag = true;
    document.getElementById("OrgDetailsButton").onclick = function(){
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
      var muteSlideDefault = 109861.   /* results in 2% as a default */
      var muteDefault = (Math.pow(Math.E, (muteSlideDefault/100000))-1).toFixed(3)
      var slides = $( "#orMuteSlide" ).slider({
        // range: "min",   /*causes the left side of the scroll bar to be grey */
        value: muteSlideDefault,
        min: 0.0,
        max: 461512,
        slide: function( event, ui ) {
          //$( "#orMRate" ).val( ui.value);  /*put slider value in the text near slider */
          $( "#orMuteInput" ).val( (Math.pow(Math.E, (ui.value/100000))-1).toFixed(3) + "%");  /*put the value in the text box */
        }
      });
      /* initialize */
      //$( "#orMRate" ).val( ($( "#orMuteSlide").slider( "value" )));
      $( "#orMuteInput" ).val(muteDefault+"%");
      /*update slide based on textbox */
      $( "#orMuteInput" ).change(function() {
        slides.slider( "value", 100000.0*Math.log(1+(parseFloat(this.value))) );
        //$( "#orMRate" ).val( 100000*Math.log(1+(parseFloat(this.value))) );
        //console.log("in mute change");
      });
    });

    /* ****************************************************************/
    /*                  Canvas for Organsim (genome) view
    /* ************************************************************** */
    //initialize globals needed to hold Organism Trace Data
    var traceObj; 
    var cycle=0;
    //initialize all canvases needed for Organism page
    var bufferCvs = document.getElementById("buffer");
    var bufferCtx = bufferCvs.getContext("2d");
    bufferCtx.translate(0.5, 0.5);
    var registerCvs = document.getElementById("register");
    var registerCtx = registerCvs.getContext("2d");
    registerCtx.translate(0.5, 0.5);
    var AstackCvs = document.getElementById("Astack");
    var AstackCtx = AstackCvs.getContext("2d");
    AstackCtx.translate(0.5, 0.5);
    var BstackCvs = document.getElementById("Bstack");
    var BstackCtx = BstackCvs.getContext("2d");
    BstackCtx.translate(0.5, 0.5);
    var outputCvs = document.getElementById("output");
    var outputCtx = outputCvs.getContext("2d");
    //outputCtx.imageSmoothingEnabled= false;
    var OrgCanvas = document.getElementById("organismCanvas");
    var ctx = OrgCanvas.getContext("2d");
    ctx.translate(0.5, 0.5);  //makes a crisper image  http://stackoverflow.com/questions/4261090/html5-canvas-and-anti-aliasing
    //initialize gen (genome) object. 
    var gen = {};
    gen.bigR = [120, 120]; //radius of full circle
    gen.size = [50, 50];
    gen.smallR = gen.bigR*2*Math.PI/(2*gen.size[0]); //radius of each small circle
    gen.tanR = gen.bigR[0]-gen.smallR;         //radius of circle tanget to inside of small circles
    gen.pathR = gen.bigR[0]-3*gen.smallR;      //radius of circle used to define reference point of arcs on path
    gen.headR = [gen.bigR[0]-2*gen.smallR,gen.bigR[1]-2*gen.smallR];      //radius of circle made by center of head positions.
    gen.cx = [150, 350];  //center of main circle x
    gen.cy = [150, 150];  //center of main circle y
    gen.fontsize = Math.round(1.8*gen.smallR);
    gen.rotate = [0, 0];  //used to rotate offspring 180 degrees when growing; otherwise no rotation.
    gen.dna = ["",""];
    gen.TimeLineHeight = 60;
    gen.imageXY = {x: 5, y: 5};

    function DrawTimeline(obj, cycle) {
      var startX, lineY, endX, length, cycles, upLabelY, dnLabelY, txtWide, dnTickX, dnNum;
      var tickLength = 10;
      var upLabelYoffset = 12;
      var dnLabelYoffset = 22;
      var upTickX = [];
      var upTickY = 5;
      var upNum = [];
      var upNdx = [];
      var dnTickY = 5;
      var dnTickSpaces = 24;
      var radius = 5;
      
      lineY = OrgCanvas.height - gen.TimeLineHeight/2;
      upTickY = lineY - tickLength;
      dnTickY = lineY + tickLength;
      upLabelY = lineY - upLabelYoffset;
      dnLabelY = lineY + dnLabelYoffset;      
      startX = 26;                //The number are fudge factors to account for the end of the slider
      endX = OrgCanvas.width-25;
      length = endX-startX; 
      cycles = obj.length-1;
      //go through all cycles comparing the current with the previous cycle 
      //Start with comparing cycle 1 to cycle 0 since there are no negative cycles. 
      for (var ii = 1; ii < obj.length; ii++){
        if (obj[ii-1].Functions.not < obj[ii].Functions.not) {upNum.push("0"); upNdx.push(ii);}
        if (obj[ii-1].Functions.nand < obj[ii].Functions.nand) {upNum.push("1"); upNdx.push(ii);}
        if (obj[ii-1].Functions.and < obj[ii].Functions.and) {upNum.push("2"); upNdx.push(ii);}
        if (obj[ii-1].Functions.orn < obj[ii].Functions.orn) {upNum.push("3"); upNdx.push(ii);}
        if (obj[ii-1].Functions.or < obj[ii].Functions.or) {upNum.push("4"); upNdx.push(ii);}
        if (obj[ii-1].Functions.andn < obj[ii].Functions.andn) {upNum.push("5"); upNdx.push(ii);}
        if (obj[ii-1].Functions.nor < obj[ii].Functions.nor) {upNum.push("6"); upNdx.push(ii);}
        if (obj[ii-1].Functions.xor < obj[ii].Functions.xor) {upNum.push("7"); upNdx.push(ii);}
        if (obj[ii-1].Functions.equ < obj[ii].Functions.equ) {upNum.push("8"); upNdx.push(ii);}
      }
      //Draw horizontal line
      ctx.lineWidth = 1; 
      ctx.strokeStyle = dictColor["Black"];
      ctx.beginPath();
      ctx.moveTo(startX,lineY);
      ctx.lineTo(endX,lineY);
      ctx.stroke();
      //Draw upTicks for indicating when logic functions complete
      ctx.font = "12px Arial";
      ctx.fillStyle = dictColor["Black"];
      for (var ii=0; ii<upNum.length; ii++) {
        upTickX[ii] = startX + length*upNdx[ii]/cycles;
        ctx.moveTo(upTickX[ii], lineY);
        ctx.lineTo(upTickX[ii], upTickY);
        ctx.stroke();
        txtWide = ctx.measureText(upNum[ii]).width;     
        ctx.fillText(upNum[ii],upTickX[ii]-txtWide/2, upLabelY);
      }
      //Draw downTicks for indicating cycles on the time line. 
      for (var ii = 0; ii <= dnTickSpaces; ii++){
        dnTickX = startX + ii*length/dnTickSpaces;
        dnNum = Math.round(ii * cycles/ dnTickSpaces);
        ctx.moveTo(dnTickX, lineY);
        ctx.lineTo(dnTickX, dnTickY);
        ctx.stroke();
        if (0==Math.fmod(ii,4)) {
          txtWide = ctx.measureText(dnNum).width;     
          ctx.fillText(dnNum,dnTickX-txtWide/2, dnLabelY);
        }
      }
      //Draw red circle indicating current cycle
      ctx.beginPath();
      dnTickX = startX + cycle*length/cycles;
      ctx.fillStyle = dictColor["Red"];
      ctx.arc(dnTickX, lineY, radius, 0, 2*Math.PI);
      ctx.fill();
    }

    function drawBitStr (context, row, bitStr) {
      var recWidth = 5;   //The width of the rectangle, in pixels
      var recHeight = 5;  //The height of the rectangle, in pixels
      var xx; //The x-coordinate of the upper-left corner of the rectangle
      var yy = row*recHeight;    //upper-left corner of rectangle
      var str = "1";
      var color; 
      for (var ii = 0; ii < bitStr.length; ii++){
        xx = ii*(recWidth);
        //draw outline of rectangle
        context.beginPath();
        context.lineWidth = 1;
        context.strokeStyle = orgColorCodes["outline"];
        context.rect(xx, yy, recWidth, recHeight);
        context.stroke();
        //fill in rectangle
        context.beginPath();
        str = bitStr.substr(ii,1);
        if ("0" == str) {context.fillStyle = orgColorCodes["0"];}
        else {context.fillStyle = orgColorCodes["1"];}
        context.fillRect(xx, yy, recWidth, recHeight);
        context.fill();
        //draw black lines every so many bits
        if (0 == Math.fmod(ii,4)) {
          context.beginPath();
          context.lineWidth = 1;
          context.strokeStyle = dictColor["Black"];
          context.moveTo(xx,yy);
          context.lineTo(xx,yy+recHeight);
          context.stroke();
        }
        //console.log("fs=", context.fillStyle, "; xx=", xx, "; yy=", yy, "; w=", recWidth, "; h=", recHeight, 
        //            "; bitStr=",str, "; out=",context.strokeStyle);
      }
    }

    function genomeCircle(gen, gg, obj, cycle){ //gg is generation
      var SmallCenterX, SmallCenterY;  //center of small circle
      var txtW;      // width of txt
      //var tickR;        //mutation tick mark: radius used to find position for tick Mark
      //var tickX, tickY  //mutation tick mark: position of inner tick mark
      //var tanX, tanY    //mutation tick mark: position of end of tick mark tangent to instruction circle.
      for (var ii = 0; ii < gen.dna[gg].length; ii++){
        SmallCenterX = gen.cx[gg] + gen.bigR[gg]*Math.cos(ii*2*Math.PI/gen.size[gg]+gen.rotate[gg]);
        SmallCenterY = gen.cy[gg] + gen.bigR[gg]*Math.sin(ii*2*Math.PI/gen.size[gg]+gen.rotate[gg]);
        ctx.beginPath();
        ctx.arc(SmallCenterX, SmallCenterY, gen.smallR, 0, 2*Math.PI);
        //Assign color based on letter code of instruction
          //ctx.fillStyle = letterColor[gen.dna[gg].substr(ii,1)];  //use if gen.dna is a string
        ctx.fillStyle = letterColor[gen.dna[gg][ii]];  //use if gen.dna is an array
        ctx.fill();   //required to render fill
        //Draw ring if there was a mutation in the offspring
        if (undefined != obj[cycle].MemSpace[1]) {
          if (1==gg && obj[cycle].MemSpace[1].Mutated[ii]) {
            ctx.strokeStyle = orgColorCodes["mutate"];
            ctx.lineWidth = 3;
            ctx.arc(SmallCenterX, SmallCenterY, gen.SmallR, 0, 2*Math.PI);
            ctx.stroke();
            //Draw tick mark to interior of circle for mutated instruction
            //tickR = gen.bigR[gg]-3*gen.smallR;
            //tickX = gen.cx[gg] + tickR*Math.cos(ii*2*Math.PI/gen.size[gg]+gen.rotate[gg]);
            //tickY = gen.cy[gg] + tickR*Math.sin(ii*2*Math.PI/gen.size[gg]+gen.rotate[gg]);
            //tickR = gen.bigR[gg]-gen.smallR;
            //tanX = gen.cx[gg] + tickR*Math.cos(ii*2*Math.PI/gen.size[gg]+gen.rotate[gg]);
            //tanY = gen.cy[gg] + tickR*Math.sin(ii*2*Math.PI/gen.size[gg]+gen.rotate[gg]);
            //ctx.beginPath();
            //ctx.moveTo(tickX, tickY);
            //ctx.lineTo(tanX, tanY);
            //ctx.stroke();
          }
        }
        //Draw letter inside circle
        ctx.fillStyle = dictColor["Black"];
        ctx.font = gen.fontsize+"px Arial";
          //txtW = ctx.measureText(gen.dna[gg].substr(ii,1)).width;  //use if gen.dna is a string
        txtW = ctx.measureText(gen.dna[gg][ii]).width;     //use if gen.dna is an array
          //ctx.fillText(gen.dna[gg].substr(ii,1),SmallCenterX-txtW/2, SmallCenterY+gen.smallR/2);  //use if gen.dna is a string
        ctx.fillText(gen.dna[gg][ii],SmallCenterX-txtW/2, SmallCenterY+gen.smallR/2);
      }
      //Draw center of circle to test max arc height - should not go past center of circle
      //ctx.arc(gen.cx[gg], gen.cy[gg], gen.smallR/4, 0, 2*Math.PI);
      //ctx.fill();
    }
    
    function drawHead(gen, spot, gg, head) {
      var hx, hy; //center of head and used as center of ring
      var txtW;  // width of txt
      //draw circumference around instruction that the head points to. 
      hx = gen.cx[gg] + gen.bigR[gg]*Math.cos(spot*2*Math.PI/gen.size[gg]+gen.rotate[gg]);
      hy = gen.cy[gg] + gen.bigR[gg]*Math.sin(spot*2*Math.PI/gen.size[gg]+gen.rotate[gg]);
      ctx.beginPath();
      ctx.arc(hx, hy, gen.smallR, 0, 2*Math.PI);
      ctx.strokeStyle = orgColorCodes[head];
      ctx.lineWidth = 2;
      ctx.stroke();
      //draw head tangent to instruction
      hx = gen.cx[gg] + gen.headR[gg]*Math.cos(spot*2*Math.PI/gen.size[gg]+gen.rotate[gg]);
      hy = gen.cy[gg] + gen.headR[gg]*Math.sin(spot*2*Math.PI/gen.size[gg]+gen.rotate[gg]);
      ctx.beginPath();
      ctx.arc(hx, hy, gen.smallR, 0, 2*Math.PI);
      ctx.fillStyle = orgColorCodes["headFill"];
      ctx.fill();
      ctx.fillStyle = orgColorCodes[head];
      ctx.font = gen.fontsize+"px Arial";
      txtW = ctx.measureText(headCodes[head]).width;
      ctx.fillText(headCodes[head],hx-txtW/2, hy+gen.smallR/2); 
    }

    //Draw arc using Bézier curve and two control points http://www.w3schools.com/tags/canvas_beziercurveto.asp
    function drawArc2(gen, spot1, spot2, rep){ //draw an arc
      var xx1, yy1, xx2, yy2, xc1, yc1, xc2, yc2; 
      ctx.lineWidth = 1;
      if (spot2 >= spot1) {
        ctx.strokeStyle = dictColor["Black"];  //set the line to a color which can also be a gradient see http://www.w3schools.com/canvas/canvas_clock_face.asp
      } else { ctx.strokeStyle = dictColor["Red"];}
      ctx.beginPath();
      xx1 = gen.cx[0] + gen.tanR*Math.cos(spot1*2*Math.PI/gen.size[0]); //Draw line from Spot1
      yy1 = gen.cy[0] + gen.tanR*Math.sin(spot1*2*Math.PI/gen.size[0]);  
      ctx.moveTo(xx1, yy1);
      xx2 = gen.cx[0] + gen.tanR*Math.cos(spot2*2*Math.PI/gen.size[0]); //Draw line to Spot2
      yy2 = gen.cy[0] + gen.tanR*Math.sin(spot2*2*Math.PI/gen.size[0]);  
      //Set Control points on same radial as the spots
      gen.pathR = gen.bigR[0]-2*gen.smallR-rep*gen.bigR[0]/gen.size[0];
      //gen.pathR = gen.bigR[0]-(2+rep/3)*gen.smallR;
      xc1 = gen.cx[0] + gen.pathR*Math.cos(spot1*2*Math.PI/gen.size[0]);  
      yc1 = gen.cy[0] + gen.pathR*Math.sin(spot1*2*Math.PI/gen.size[0]);
      xc2 = gen.cx[0] + gen.pathR*Math.cos(spot2*2*Math.PI/gen.size[0]);  
      yc2 = gen.cy[0] + gen.pathR*Math.sin(spot2*2*Math.PI/gen.size[0]);
      //console.log(xc1, yc1, xc2, yc2, xx2, yy2);
      ctx.bezierCurveTo(xc1, yc1, xc2, yc2, xx2, yy2);
      ctx.stroke();
    }

    //Draw offspring Icon once cell divides  from http://stackoverflow.com/questions/8977369/drawing-png-to-a-canvas-element-not-showing-transparency
    function drawIcon(gen) {
      var txt = "Offspring Genome"; 
      drw = new Image();
      drw.src = "avida-ed-ancestor-icon.png";
      drw.onload = function () {   //image size(width, height) from http://stackoverflow.com/questions/5173796/html5-get-image-dimension
        ctx.drawImage(drw, gen.cx[1]-drw.width/2, gen.cy[1]-drw.height/2);
      }
      ctx.fillStyle = dictColor["black"];
      ctx.font = gen.fontsize+"px Arial";
      var txtWd = ctx.measureText(txt).width;
      ctx.fillText(txt, gen.cx[1]-txtWd/2, gen.cy[1]+drw.height);       
    }
    
    //*****************************************************************/
    //main function to update the Organism Trace on the Organism Page
    function updateOrgTrace(obj, cycle){
      //set canvas size
      OrgCanvas.width = $("#organismCanvasHolder").innerWidth()-6;
      OrgCanvas.height = $("#organismCanvasHolder").innerHeight()-6;
      //Find size and content of each genome. 
      for (var ii=0; ii < obj[cycle].MemSpace.length; ii++) {
        gen.dna[ii] = obj[cycle].MemSpace[ii].Memory;
        gen.size[ii] = obj[cycle].MemSpace[ii].Memory.length;
      }
      //Draw Timeline
      DrawTimeline(obj, cycle);
      //Find radius and center of big circle for each genome
      if (OrgCanvas.height < .55*(OrgCanvas.width-gen.TimeLineHeight)) {
        gen.bigR[0] = Math.round(0.45*(OrgCanvas.height-gen.TimeLineHeight)) }//set size based on height
      else {
        gen.bigR[0] = Math.round(0.2*OrgCanvas.width) //set size based on width
      }
      gen.cx[0] = OrgCanvas.width/2 - 1.2*gen.bigR[0];        //center of 1st (parent) circle x
      gen.cy[0] = (OrgCanvas.height-gen.TimeLineHeight)/2;  //center of 1st (parent) circle y
      // Draw parent (Mom) genome in a circle---------------------------------------- 
      gen.smallR = gen.bigR[0]*2*Math.PI/(2*gen.size[0]); //radius of each small circle
      gen.tanR = gen.bigR[0]-gen.smallR;         //radius of circle tanget to inside of small circles
      gen.pathR = gen.bigR[0]-3*gen.smallR;      //radius of circle used to define reference point of arcs on path
      gen.headR[0] = gen.bigR[0]-2*gen.smallR;      //radius of circle made by center of head positions.
      gen.fontsize = Math.round(1.8*gen.smallR);
      genomeCircle(gen, 0, obj, cycle);
      // Draw child (Son) genome in a circle ---------
      if (1 < obj[cycle].MemSpace.length) {
        gen.bigR[1] = gen.smallR*2*gen.size[1]/(2*Math.PI);
        gen.bigR[1] = gen.bigR[1]+gen.bigR[1]/gen.size[1];
        gen.cy[1] = gen.cy[0];
        gen.headR[1] = gen.bigR[1]-2*gen.smallR;      //radius of circle made by center of head positions.
        if (obj[cycle].DidDivide) {
          gen.cx[1] = OrgCanvas.width/2 + 1.1*gen.bigR[1];
          gen.rotate[1] = 0;
          drawIcon(gen);
          addOffspring();
        }
        else {
          gen.cx[1] = gen.cx[0] + gen.bigR[0] + 2*gen.smallR + gen.bigR[1];
          gen.rotate[1] = Math.PI;            //offspring rotated 180 degrees when still growing.
          //console.log("xy", gen.cx[1], gen.cy[1], " size", gen.size[0]);
        }
        genomeCircle(gen, 1, obj, cycle);
      }
      //Draw path of acrs
      //drawArc2(gen, spot1, spot2, rep)
      for (var ii = 0; ii<obj[cycle].Jumps.length; ii++) {
        drawArc2(gen,  obj[cycle].Jumps[ii].FromIDX,  obj[cycle].Jumps[ii].ToIDX, obj[cycle].Jumps[ii].Freq);
      }
      //drawHead(gen, spot, generation, head) // draws the various heads for parent (Mom)
      for (var ii=0; ii < obj[cycle].MemSpace.length; ii++) {
        if (undefined != obj[cycle].MemSpace[ii].Heads.READ) 
          {drawHead(gen, obj[cycle].MemSpace[ii].Heads.READ, ii, "READ");}
        if (undefined != obj[cycle].MemSpace[ii].Heads.WRITE) 
          {drawHead(gen, obj[cycle].MemSpace[ii].Heads.WRITE, ii, "WRITE");}
        if (undefined != obj[cycle].MemSpace[ii].Heads.FLOW) 
          {drawHead(gen, obj[cycle].MemSpace[ii].Heads.FLOW, ii, "FLOW");}
        if (undefined != obj[cycle].MemSpace[ii].Heads.IP) 
          {drawHead(gen, obj[cycle].MemSpace[ii].Heads.IP, ii, "IP");}
      }
      //Draw Buffers ---------------------------------------------------
      //drawBitStr (name, row, bitStr);
      for (var ii = 0; ii < obj[cycle].Buffers.input.length; ii++){
        drawBitStr (bufferCtx, ii, obj[cycle].Buffers.input[ii]);
      }
      drawBitStr (registerCtx, 0, obj[cycle].Registers['AX']);
      drawBitStr (registerCtx, 1, obj[cycle].Registers['BX']);
      drawBitStr (registerCtx, 2, obj[cycle].Registers['CX']);
      //console.log("A", obj[cycle].Buffers);
      for (var ii = 0; ii<2; ii++){ //only showing the top 2 in the stack of 10
        //console.log(ii, obj[cycle].Buffers["stack A"][ii]);
        drawBitStr (AstackCtx, ii, obj[cycle].Buffers["stack A"][ii]);
        }
      for (var ii = 0; ii<2; ii++){ //only showing the top 2 in the stack of 10
        drawBitStr (BstackCtx, ii, obj[cycle].Buffers["stack B"][ii]);
      }
      drawBitStr (outputCtx, 0, obj[cycle].Buffers.output[0]);
      // update details 
      updateTimesPerformed(obj, cycle);   //Update Times Functions are performed. 
      writeInstructDetails(obj, cycle);   //Write Instruction Details
      //context.clearRect(0, 0, canvas.width, canvas.height); //to clear canvas see http://stackoverflow.com/questions/2142535/how-to-clear-the-canvas-for-redrawing
    }

    function updateTimesPerformed(obj, cycle){
      document.getElementById("notPerf").textContent = obj[cycle].Functions.not;
      document.getElementById("nanPerf").textContent = obj[cycle].Functions.nand;
      document.getElementById("andPerf").textContent = obj[cycle].Functions.and;
      document.getElementById("ornPerf").textContent = obj[cycle].Functions.orn;
      document.getElementById("oroPerf").textContent = obj[cycle].Functions.or;
      document.getElementById("antPerf").textContent = obj[cycle].Functions.andn;
      document.getElementById("norPerf").textContent = obj[cycle].Functions.nor;
      document.getElementById("xorPerf").textContent = obj[cycle].Functions.xor;
      document.getElementById("equPerf").textContent = obj[cycle].Functions.equ;
      if (0 < obj[cycle].Functions.not) {document.getElementById("notOrg").textContent="0 not+";}
      else {document.getElementById("notOrg").textContent="0 not-";}
      if (0 < obj[cycle].Functions.nand) {document.getElementById("nanOrg").textContent="1 nan+";}
      else {document.getElementById("nanOrg").textContent="1 nan-";}
      if (0 < obj[cycle].Functions.and) {document.getElementById("andOrg").textContent="2 and+";}
      else {document.getElementById("andOrg").textContent="2 and-";}
      if (0 < obj[cycle].Functions.orn) {document.getElementById("ornOrg").textContent="3 orn+";}
      else {document.getElementById("ornOrg").textContent="3 orn-";}
      if (0 < obj[cycle].Functions.or) {document.getElementById("oroOrg").textContent="4 oro+";}
      else {document.getElementById("oroOrg").textContent="4 oro-";}
      if (0 < obj[cycle].Functions.andn) {document.getElementById("antOrg").textContent="5 ant+";}
      else {document.getElementById("antOrg").textContent="5 ant-";}
      if (0 < obj[cycle].Functions.nor) {document.getElementById("norOrg").textContent="6 nor+";}
      else {document.getElementById("norOrg").textContent="6 nor-";}
      if (0 < obj[cycle].Functions.xor) {document.getElementById("xorOrg").textContent="7 xor+";}
      else {document.getElementById("xorOrg").textContent="7 xor-";}
      if (0 < obj[cycle].Functions.equ) {document.getElementById("equOrg").textContent="8 equ+";}
      else {document.getElementById("equOrg").textContent="8 equ-";}
    }
    
    function writeInstructDetails(obj, cycle) {
      var letter;
      var IPspot = obj[cycle].MemSpace[0].Heads.IP
      if (undefined == obj[cycle-1]) {
        document.getElementById("ExecuteJust").textContent = "(none)"; 
      }
      else {
        letter = obj[cycle-1].NextInstruction;
        document.getElementById("ExecuteJust").textContent = letter + ": " + InstDescribe[letter];
        //console.log("Inst", InstDescribe[letter]);
      }
      if (undefined == obj[cycle].MemSpace[0].Memory[IPspot]) {
        document.getElementById("ExecuteAbout").textContent = "(none)";
      }
      else {
        letter = obj[cycle].MemSpace[0].Memory[IPspot];
        document.getElementById("ExecuteAbout").textContent = letter + ": " + InstDescribe[letter];
      }
      //console.log('spot=', IPspot, ' letter=', letter, " Instr=", InstDescribe[letter]);
    }

    /* ****************************************************************/
    /*             End of Canvas to draw genome and update details
    /* ************************************************************** */

    /* **** Controls bottum of organism page **************************/
    var update_timer = null;

    function outputUpdate(vol) {
      document.querySelector('#orgCycle').value = vol;
    }

    dijit.byId("orgBack").on("Click", function() {
      var ii = Number(document.getElementById("orgCycle").value);
      if (cycleSlider.get("minimum") < cycleSlider.get("value")) {
        ii--;
        dijit.byId("orgCycle").set("value", ii);
        cycle = ii;
        updateOrgTrace(traceObj, cycle)
      }
    });

    dijit.byId("orgForward").on("Click", function() {
      var ii = Number(document.getElementById("orgCycle").value);
      if (cycleSlider.get("maximum") > cycleSlider.get("value")) {
        ii++;
        dijit.byId("orgCycle").set("value", ii);
        cycle = ii;
        updateOrgTrace(traceObj, cycle)
      }
    });

    dijit.byId("orgReset").on("Click", function(){
      dijit.byId("orgCycle").set("value", 0);
      cycle = 0;
      updateOrgTrace(traceObj, cycle);
      orgStopFn()
    });
    
    function orgStopFn() {
      if (update_timer){ clearInterval(update_timer);}
      dijit.byId("orgRun").set("label", "Run");
    }
    
    function orgRunFn(){
      if (cycleSlider.get("maximum") > cycleSlider.get("value")) {
        cycle++;
        dijit.byId("orgCycle").set("value", cycle);
        updateOrgTrace(traceObj, cycle);
      }
      else {orgStopFn();}
    }
    dijit.byId("orgRun").on("Click", function(){
      if ("Run" == dijit.byId("orgRun").get("label")) {
        dijit.byId("orgRun").set("label", "Stop");
        update_timer = setInterval(orgRunFn, 100);
      }
      else { orgStopFn();
      }
    });

    dijit.byId("orgEnd").on("Click", function() {
      dijit.byId("orgCycle").set("value", cycleSlider.get("maximum"));
      cycle = cycleSlider.get("maximum");
      updateOrgTrace(traceObj, cycle);
      orgStopFn()
    });

    dijit.byId("orgCycle").on("Change", function(value){
      cycleSlider.set("value",value);
      cycle = value;
      updateOrgTrace(traceObj, cycle);
    });

    /* Organism Gestation Length Slider */
    var cycleSlider = new HorizontalSlider({
        name: "cycleSlider",
        value: 0,
        minimum: 0,
        maximum: 200,
        intermediateChanges: true,
        discreteValues:201,
        style: "width:100%;",
        onChange: function(value){
            document.getElementById("orgCycle").value = value;
            cycle = value;
            updateOrgTrace(traceObj, cycle);
        }
    }, "cycleSlider");
    //console.log("after slider");

    /* ****************************************************************/
    /* Analysis Page **************************************************/
    /* ****************************************************************/
    var dictPlota = {};
    var dictPlotb = {};
    dictPlota["@example"] = [1, 2, 1, 2, 2, 3,   2, 3, 3,    4];
    dictPlota["m2w30u1000not"] = [0.6, 1.8, 2, 2, 2.4, 2.7, 3];
    dictPlota["m2w30u1000nand"] = [1, 1, 1.5, 2, 3, 3, 4, 4, 4.5];
    dictPlotb["@example"] = [60, 50, 50, 40, 40, 37, 30, 20, 15, 7];
    dictPlotb["m2w30u1000not"] = [70,   68, 60, 50, 50,   47, 40];
    dictPlotb["m2w30u1000nand"] = [80, 70, 75, 60, 50, 50, 40, 40, 30];
    dictPlota["newPopulation"] = [0.5,  1,  2, 1.7,  2, 2.7, 3.2, 3.2];
    dictPlotb["newPopulation"] = [ 65, 50, 50,  47, 40,  37,  32, 22];
    var dictColor = {};
    dictColor["Red"] = "#FF0000";
    //dictColor["Red"] = "rgb(255, 0, 0);";  //only some browsers support rgb http://www.w3schools.com/cssref/css_colors_legal.asp
    dictColor["Green"] = "#00FF00";
    dictColor["Blue"] = "#0000FF";
    dictColor["Magenta"] = "#FF00FF";
    dictColor["Cyan"] = "#00FFFF";
    dictColor["Yellow"] = "#FFFF00";
    dictColor["Purple"] = "#8800FF";
    dictColor["Orange"] = "#FFAA00";
    dictColor["Black"] = "#000000";
    dictColor["ltGrey"] = "#CCCCCC";
    var pop1a = [];
    var pop1b = [];
    var pop2a = [];
    var pop2b = [];
    var pop3a = [];
    var pop3b = [];
    var color1 = dictColor[dijit.byId("pop1color").value];
    var color2 = dictColor[dijit.byId("pop2color").value];
    var color3 = dictColor[dijit.byId("pop3color").value]; 
    var y1title = "Average Fitness";
    var y2title = 'Average Gestation Time'        
    var anaChart = new Chart("analyzeChart");

    function AnaChartFn(){
      anaChart.addPlot("default", {type: "Lines", hAxis:"x", vAxis:"y"});
      anaChart.addPlot("other", {type: "Lines", hAxis: "x", vAxis: "right y"});
      //grid line info on https://dojotoolkit.org/reference-guide/1.10/dojox/charting.html
      anaChart.addPlot("grid", {type:Grid, hMajorLines: true, majorHLine: {color: "#CCC", width: 1}, 
                                          vMajorLines: true, majorVLine: {color: "#CCC", width: 1}});
      anaChart.addAxis("x", {fixLower: "major", fixUpper: "major",title:'Time (updates)', titleOrientation: 'away'});
      anaChart.addAxis("y", {vertical: true, fixLower: "major", title: y1title, titleOrientation: 'axis',fixUpper: "major", min: 0});
      //anaChart.addAxis("top x", {leftBottom: false});
      anaChart.addAxis("right y", {vertical: true, leftBottom: false, min: 0, title:y2title});
      anaChart.addSeries("Series 1a", pop1a, {stroke: {color:color1, width: 2}});   
      anaChart.addSeries("Series 2a", pop2a, {stroke: {color:color2, width: 2}});
      anaChart.addSeries("Series 3a", pop3a, {stroke: {color:color3, width: 2}});
      anaChart.addSeries("Series 1b", pop1b, {plot: "other", stroke: {color:color1, width: .3}});
      anaChart.addSeries("Series 2b", pop2b, {plot: "other", stroke: {color:color2, width: .3}});
      anaChart.addSeries("Series 3b", pop3b, {plot: "other", stroke: {color:color3, width: .3}});
      
      anaChart.resize(domGeometry.position(document.getElementById("chartHolder")).w-10, 
                    domGeometry.position(document.getElementById("chartHolder")).h-15);
      var dZoom = new MouseZoomAndPan(anaChart, "default");
            //https://www.sitepen.com/blog/2012/11/09/dojo-charting-zooming-scrolling-and-panning/  a different zoom method using a window.
      anaChart.render();
    };
    
    /* Chart buttons ****************************************/
    document.getElementById("pop1delete").onclick = function(){ 
      graphPop1.selectAll().deleteSelectedNodes();
      pop1a = [];
      pop1b = [];
      AnaChartFn();
    }
    document.getElementById("pop2delete").onclick = function(){ 
      pop2a = [];
      pop2b = [];
      AnaChartFn();
      graphPop2.selectAll().deleteSelectedNodes();
    }
    document.getElementById("pop3delete").onclick = function(){ 
      pop3a = [];
      pop3b = [];
      AnaChartFn();
      graphPop3.selectAll().deleteSelectedNodes();
    }
    dijit.byId("pop1color").on("Change", function(){
      color1 = dictColor[dijit.byId("pop1color").value];
      AnaChartFn();
    });
    dijit.byId("pop2color").on("Change", function(){
      color2 = dictColor[dijit.byId("pop2color").value];
      AnaChartFn();
    });
    dijit.byId("pop3color").on("Change", function(){
      color3 = dictColor[dijit.byId("pop3color").value];
      AnaChartFn();
    });
    
    //Set Y-axis title and choose the correct array to plot
    dijit.byId("y1select").on("Change", function(){
      y1title = dijit.byId("y1select").value;
      //need to get correct array to plot from freezer
      AnaChartFn();
    });

    dijit.byId("y2select").on("Change", function(){
      y2title = dijit.byId("y2select").value;
      //need to get correct array to plot from freezer
      AnaChartFn();
    });
    
    //Modulo that is more accurate than %; Math.fmod(aa, bb);
    Math.fmod = function (aa, bb) { return Number((aa - (Math.floor(aa/bb) * bb)).toPrecision(8));}
    
    //http://nelsonwells.net/2011/10/swap-object-key-and-values-in-javascript/
    var invertHash = function (obj) {
      var new_obj = {};
      for (var prop in obj) {
        if(obj.hasOwnProperty(prop)) {
          new_obj[obj[prop]] = prop;
        }
      }
      return new_obj;
    };
    
    hexColor = invertHash(dictColor);
    var theColor = hexColor["#000000"];  //This should get 'Black'
    //console.log("theColor=", theColor);

    DrawGridBackground(); //Draw initial Box
    
    //Dictionarys
    var letterColor = {};
    letterColor["a"] = "#F9CC65"; //color Meter
    letterColor["b"] = "#EFC461"; //color Meter
    letterColor["c"] = "#E5BC5D"; //color Meter 
    letterColor["d"] = "#59FF71"; //color Meter
    letterColor["e"] = "#55FF6D"; //color Meter
    letterColor["f"] = "#52F768"; //color Meter
    letterColor["g"] = "#BBFF5C"; //color Meter
    letterColor["h"] = "#B4FF59"; //color Meter
    letterColor["i"] = "#ACF655"; //color Meter
    letterColor["j"] = "#A5EC51"; //color Meter 
    letterColor["k"] = "#6EFFEB"; //color Meter
    letterColor["l"] = "#69FAE2"; //color Meter
    letterColor["m"] = "#65F0D8"; //color Meter
    letterColor["n"] = "#61E5CF"; //color Meter
    letterColor["o"] = "#7B8FFF"; //color Meter
    letterColor["p"] = "#7B8FFF"; //color Meter
    letterColor["q"] = "#7084EA"; //color Meter
    letterColor["r"] = "#6C7EE1"; //color Meter
    letterColor["s"] = "#5CDBC5"; //color Meter
    letterColor["t"] = "#58D1BC"; //color Meter
    letterColor["u"] = "#53C6B3"; //color Meter
    letterColor["v"] = "#FF26EE"; //color Meter
    letterColor["x"] = "#ED24DB"; //color Meter
    letterColor["w"] = "#F725E5"; //color Meter
    letterColor["y"] = "#AE2CFF"; //color Meter
    letterColor["z"] = "#9DE14E"; //color Meter
    var orgColorCodes = {};
    orgColorCodes["mutate_old"] = "#00FF00"; //color Meter green
    orgColorCodes["mutate"] = "#000000"; //color black
    orgColorCodes["start"] = "#5300FF"; //color Meter blue - I don't think this is used.
    orgColorCodes["headFill_old"] = "#777777"; //color Meter grey
    orgColorCodes["headFill"] = "#AAAAAA"; //lighter grey
    orgColorCodes["WRITE"] = "#FA0022"; //color Meter  red
    orgColorCodes["READ"] = "#5300FF"; //color Meter  blue
    orgColorCodes["FLOW"] = "#00FF00"; //color Meter  green
    orgColorCodes["IP"] = "#000000"; //color Meter  black
    orgColorCodes["outline"] = "#666666"; //grey
    orgColorCodes["0"] = "#BBBBFF"; //lt blue
    orgColorCodes["1"] = "#F5FF00"; //color Meter yellow
    var headCodes = {};
    headCodes["READ"] = "R";
    headCodes["WRITE"] = "W";
    headCodes["FLOW"] = "F";
    headCodes["IP"] = "I";
    var InstDescribe = {};
    InstDescribe["a"]="nop-A is a no-operation instruction, and will not do anything when executed. It can, however, modify the behavior of the instruction preceding it (by changing the CPU component that it affects; see also nop-register notation and nop-head notation) or act as part of a template to denote positions in the genome.";
    InstDescribe["b"]="nop-B is a no-operation instruction, and will not do anything when executed. It can, however, modify the behavior of the instruction preceding it (by changing the CPU component that it affects; see also nop-register notation and nop-head notation) or act as part of a template to denote positions in the genome.";
    InstDescribe["c"]="nop-C is a no-operation instruction, and will not do anything when executed. It can, however, modify the behavior of the instruction preceding it (by changing the CPU component that it affects; see also nop-register notation and nop-head notation) or act as part of a template to denote positions in the genome.";
    InstDescribe["d"]="if-n-equ: This instruction compares the BX register to its complement. If they are not equal, the next instruction (after a modifying no-operation instruction, if one is present) is executed. If they are equal, that next instruction is skipped.";
    InstDescribe["e"]="if-less: This instruction compares the BX register to its complement. If BX is the lesser of the pair, the next instruction (after a modifying no-operation instruction, if one is present) is executed. If it is greater or equal, then that next instruction is skipped.";
    InstDescribe["f"]="if-label: This instruction reads in the template that follows it, and tests if its complement template was the most recent series of instructions copied. If so, it executed the next instruction, otherwise it skips it. This instruction is commonly used for an organism to determine when it has finished producing its offspring.";
    InstDescribe["g"]="mov-head: This instruction will cause the IP to jump to the position in memory of the flow-head.";
    InstDescribe["h"]="jmp-head: This instruction will read in the value of the CX register, and the move the IP by that fixed amount through the organism's memory.";
    InstDescribe["i"]="get-head: This instruction will copy the position of the IP into the CX register.";
    InstDescribe["j"]="set-flow: This instruction moves the flow-head to the memory position denoted in the CX register.";
    InstDescribe["k"]="shift-r: This instruction reads in the contents of the BX register, and shifts all of the bits in that register to the right by one. In effect, it divides the value stored in the register by two, rounding down.";
    InstDescribe["l"]="shift-l: This instruction reads in the contents of the BX register, and shifts all of the bits in that register to the left by one, placing a zero as the new rightmost bit, and truncating any bits beyond the 32 maximum. For values that require fewer than 32 bits, it effectively multiplies that value by two.";
    InstDescribe["m"]="inc: This instruction reads in the content of the BX register and increments it by one.";
    InstDescribe["n"]="dec: This instruction reads in the content of the BX register and decrements it by one.";
    InstDescribe["o"]="pop: This instruction removes the top element from the active stack, and places it into the BX register.";
    InstDescribe["p"]="push: This instruction reads in the contents of the BX register, and places it as a new entry at the top of the active stack. The BX register itself remains unchanged.";
    InstDescribe["q"]="swap-stk: This instruction toggles the active stack in the CPU. All other instructions that use a stack will always use the active one.";
    InstDescribe["r"]="swap: This instruction swaps the contents of the BX register with its complement.";
    InstDescribe["s"]="add: This instruction reads in the contents of the BX and CX registers and sums them together. The result of this operation is then placed in the BX register.";
    InstDescribe["t"]="sub: This instruction reads in the contents of the BX and CX registers and subtracts CX from BX (respectively). The result of this operation is then placed in the BX register.";
    InstDescribe["u"]="nand: This instruction reads in the contents of the BX and CX registers (each of which are 32-bit numbers) and performs a bitwise nand operation on them. The result of this operation is placed in the BX register. Note that this is the only logic operation provided in the basic avida instruction set.";
    InstDescribe["v"]="h-copy: This instruction reads the contents of the organism's memory at the position of the read-head, and copy that to the position of the write-head. If a non-zero copy mutation rate is set, a test will be made based on this probability to determine if a mutation occurs. If so, a random instruction (chosen from the full set with equal probability) will be placed at the write-head instead.";
    InstDescribe["w"]="h-alloc: This instruction allocates additional memory for the organism up to the maximum it is allowed to use for its offspring.";
    InstDescribe["x"]="h-divide: This instruction is used for an organism to divide off a finished offspring. The original organism keeps the state of its memory up until the read-head. The offspring's memory is initialized to everything between the read-head and the write-head. All memory past the write-head is removed entirely.";
    InstDescribe["y"]="IO: This is the input/output instruction. It takes the contents of the BX register and outputs it, checking it for any tasks that may have been performed. It will then place a new input into BX.";
    InstDescribe["z"]="h-search: This instruction will read in the template the follows it, and find the location of a complement template in the code. The BX register will be set to the distance to the complement from the current position of the instruction-pointer, and the CX register will be set to the size of the template. The flow-head will also be placed at the beginning of the complement template. If no template follows, both BX and CX will be set to zero, and the flow-head will be placed on the instruction immediately following the h-search.";

    
    //Not currently in use, but kept as an example
    //http://stackoverflow.com/questions/5837558/dojo-drag-and-drop-how-to-retrieve-order-of-items
    //var orderedDataItems = source.getAllNodes().map(function(node){
    //    return source.getItem(node.id).data;
    //});
    
    //Function not in use, but may need later
    // from http://dojotoolkit.org/reference-guide/1.10/dojo/dnd.html
    function OrderedIter(container, f, o){
      // similar to:
      // container.forInItems(f, o);
      // but iterates in the listed order
      o = o || dojo.global;
      container.getAllNodes().forEach(function(node){
        var id = node.id;
        f.call(o, container.getItem(id), id, container);
      });
    }

    //Functions not in use, but not ready to trash yet------------------------

    //sigmoid for use in converting a floating point into hue, saturation, brightness
    //function sigmoid (xx, midpoint, steepness) {
    //  var val = steepness * (xx-midpoint);
    //  return Math.exp(val) /(1.0 + Math.exp(val));
    //}
    //var ii = 5.6;
    //var num_colors = 255;
    //var xx = 0.1 + 0.8 * ii/ (num_colors-1);
    //var grColor = {};
    //grColor.hue = Math.fmod((xx+0.27), 1.0);
    //grColor.sat = sigmoid(1.0 - xx, 0.1, 30);
    //grColor.brt = sigmoid(xx, 0.3, 10);
    //console.log("hsb", grColor);

    //Draw arc using quadraticCurve and 1 control point http://www.w3schools.com/tags/canvas_quadraticcurveto.asp
    function drawArc1(gen, spot1, spot2, rep){ 
      var xx1, yy1, xx2, yy2, xxc, yyc; 
      ctx.lineWidth = 1;
      if (0 < spot2 - spot1) {
        ctx.strokeStyle = dictColor["Black"];  //set the line to a color which can also be a gradient see http://www.w3schools.com/canvas/canvas_clock_face.asp
      } else { ctx.strokeStyle = dictColor["Red"];}
      ctx.beginPath();
      xx1 = gen.cx[0] + gen.tanR*Math.cos(spot1*2*Math.PI/gen.size[0]); //Draw line from Spot1
      yy1 = gen.cy[0] + gen.tanR*Math.sin(spot1*2*Math.PI/gen.size[0]);  
      ctx.moveTo(xx1, yy1);
      xx2 = gen.cx[0] + gen.tanR*Math.cos(spot2*2*Math.PI/gen.size[0]); //Draw line to Spot2
      yy2 = gen.cy[0] + gen.tanR*Math.sin(spot2*2*Math.PI/gen.size[0]);  
      //Set Control point on line perpendicular to line between Spot1 & spot2
      gen.pathR = gen.bigR-(2+rep)*gen.smallR;
      xxc = gen.cx[0] + gen.pathR*Math.cos(spot2*2*Math.PI/gen.size[0] + (spot1-spot2)*(Math.PI)/gen.size[0]);  
      yyc = gen.cy[0] + gen.pathR*Math.sin(spot2*2*Math.PI/gen.size[0] + (spot1-spot2)*(Math.PI)/gen.size[0]);
      ctx.quadraticCurveTo(xxc, yyc, xx2, yy2);
      ctx.stroke();
    }

    //Find points with an even distribution. This does not really work, but I might use for points > 9
    //http://stackoverflow.com/questions/10579470/equally-distrubute-n-points-on-a-rectangle
    function equalSpace() {
      var width = Math.trunc(dijit.byId("sizex").get('value'));
      var height = Math.trunc(dijit.byId("sizey").get('value'));
      var nPoints = AncestorBoxCnt;
      
      var totalArea = width*height;
      var pointArea = totalArea/nPoints;
      var length = Math.sqrt(pointArea);
      var kk = 0;
      console.log('wide, hight, nPts=', width, height, nPoints);
      for (ii = length/2; ii < width+0.99; ii = ii+length) {
        for (jj = length/2; jj < height+0.99; jj = jj+length) {
          if (kk < nPoints) {
            parents.col[AncestorBoxNdx[kk]] = Math.trunc(ii);
            parents.row[AncestorBoxNdx[kk]] = Math.trunc(jj);
            parents.ndx[AncestorBoxNdx[kk]] = Math.trunc(jj)*width + Math.trunc(ii);
            console.log('col, row, ndx, AboxNdx, k=', parents.col[AncestorBoxNdx[kk]], parents.row[AncestorBoxNdx[kk]]
                        ,parents.ndx[AncestorBoxNdx[kk]], AncestorBoxNdx[kk], kk);
            kk++;
            DrawParent();
          }
        }
      }
    }
    
    //use FileMerge to compare to versions of the same file on a Mac
    //js fiddle of dragging image to cavans and dragging it around http://jsfiddle.net/XU2a3/41/
  });
