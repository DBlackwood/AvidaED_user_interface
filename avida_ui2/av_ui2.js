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
  "dojo/ready",
  "jquery",
  "jquery-ui",
  "dojo/domReady!"
  ], function(dijit, parser, declare, query, nodelistTraverse, space, AppStates, Dialog,
              BorderContainer, ContentPane, MenuBar, PopupMenuBarItem, MenuItem, Menu, 
              Button, TitlePane, dndSource, dndManager, dndSelector, dndTarget, domGeometry, domStyle, Select,
              HorizontalSlider, HorizontalRule, HorizontalRuleLabels, RadioButton, ToggleButton, NumberSpinner, ComboButton,
              DropDownButton, ComboBox, Textarea, Chart, Default, Lines, ready, $, jqueryui){

    parser.parse();

    console.log("after parser");
    // main button scripts-------------------------------------------
    
    //The style display: none cannnot be used in the html durint the initial load as the dijits won't work right
    //visibility:hidden can be used, but it leave the white space and just does not display dijits. 
    //So all areas are loaded, then the mainBoxSwap is called to set display to none after the load on all but 
    //the default option.
    //mainBoxSwap("organismBlock");
    mainBoxSwap("populationBlock");
    dijit.byId("setupBlock").set("style", "display: none;");

    BrowserResizeEventHandler=function(){
      if ("block"==domStyle.get("analysisBlock","display")){AnaChart();};
    }

    function mainBoxSwap(showBlock){
      //console.log("in mainBoxSwap");
      dijit.byId("populationBlock").set("style", "display: none;");
      dijit.byId("organismBlock").set("style", "display: none;");
      dijit.byId("analysisBlock").set("style", "display: none;");
      dijit.byId("testBlock").set("style", "display: none;");
      dijit.byId(showBlock).set("style", "display: block; visibility: visible;");
      dijit.byId(showBlock).resize();
    };
  
    // Call general function
    document.getElementById("populationButton").onclick = function(){ mainBoxSwap("populationBlock"); }
    document.getElementById("organismButton").onclick = function(){ mainBoxSwap("organismBlock"); }
    document.getElementById("analysisButton").onclick = function(){ mainBoxSwap("analysisBlock"); }
    document.getElementById("testButton").onclick = function(){ mainBoxSwap("testBlock"); }

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
          
    var freezeConfigure = new dndSource("freezeConfigureNode", {accept: ["conDish"], copyOnly: ["true"], singular: "true"});
    freezeConfigure.insertNodes(false, [
      { data: "@default",      type: ["conDish"]},
      { data: "s20m.2Nand",    type: ["conDish"]},
      { data: "s30m.2Not",     type: ["conDish"]}
    ]);
    //console.log("freezeConfigure: ", freezeConfigure.map);
    var freezeOrgan = new dndSource("freezeOrgansimNode", {accept: ["organism"], copyOnly: ["true"], singular: "true"});
    freezeOrgan.insertNodes(false, [
      { data: "@ancestor",      type: ["organism"]},
      { data: "m2u8000Nand",    type: ["organism"]},
      { data: "m2u8000Not",     type: ["organism"]}
    ]);
    var freezePopDish = new dndSource("freezePopDishNode", {accept: ["popDish"], copyOnly: ["true"], singular: "true"});
    freezePopDish.insertNodes(false, [
      { data: "example",       type: ["popDish"]},
      { data: "m2w30u1000nand", type: ["popDish"]},
      { data: "m2w30u1000not",  type: ["popDish"]}
    ]);
    var AncestorBox = new dndSource("AncestorBoxNode", {accept: ["organism"]});
    
    var trash = new dndSource("trashNode", {accept: ['conDish', 'organism', 'popDish'], singular: "true"});
    var ConfigCurrent = new dndTarget("ConfigurationCurrent", {accept: ["conDish"], singular: "true"});
    ConfigCurrent.insertNodes(false, [
      { data: "@default",      type: ["conDish"]}
    ]);
    //http://stackoverflow.com/questions/11909540/how-to-remove-delete-an-item-from-a-dojo-drag-and-drop-source
    var OrganCurrent = new dndSource("OrgansimCurrent", {accept: ["organism"], singular: "true"});

    var graphPop1 = new dndSource("pop1name", {accept: ["popDish"], singular: "true"});
    var graphPop2 = new dndSource("pop2name", {accept: ["popDish"], singular: "true"});
    var graphPop3 = new dndSource("pop3name", {accept: ["popDish"]});
    //console.log("after create graphPopulations");

    //http://stackoverflow.com/questions/1134572/dojo-is-there-an-event-after-drag-drop-finished
    //Puts the contents of the source in a object (list) called items. 
    function getAllItems(source){
      var items = source.getAllNodes().map(function(node){
        return source.getItem(node.id);
      });
      return items;
    }
    
    //Need to have only the most recent dropped configuration in configCurrent. Do this by deleting everything in configCurrent
    //and reinserting the most resent one after a drop event.
    function ConfigCurrentChange(){
      var items = getAllItems(ConfigCurrent);  //get a list of items after ondrop into configCurrent. 
      if (1 < items.length) {                   //if there is more than one, then get rid of the old one and keep the one just dropped.
        ConfigCurrent.selectAll().deleteSelectedNodes();  //does appear to clear items  
        freezeConfigure.forInSelectedItems(function(item, id){
          ConfigCurrent.insertNodes(false, [item]);  //assign the node that is selected from the only  valid source.
        });
        ConfigCurrent.sync();   
      }
    };
    dojo.connect(ConfigCurrent, "onDrop", ConfigCurrentChange);

    //Need to have only the most recent dropped organism in OrganCurrent. Do this by deleting everything in organCurrent
    //and reinserting the most resent one after a drop event.
    function OrganCurrentChange(){
      var items = getAllItems(OrganCurrent);
      if (1 < items.length) {
        OrganCurrent.selectAll().deleteSelectedNodes();  //does appear to clear items  
        OrganCurrent.sync();   //not sure if this helps or not
        //OrganCurrent.insertNodes(false, [items[1]]);    //oldway only works part of the time depends on mouse position
        freezeOrgan.forInSelectedItems(function(item, id){  
          OrganCurrent.insertNodes(false, [item]);          //assign the node that is selected from the only  valid source.
        });
        OrganCurrent.sync();   //not sure if this helps or not
      }
    };
    dojo.connect(OrganCurrent, "onDrop", OrganCurrentChange);

    function trashChange(){
      var items = getAllItems(trash);
      trash.selectAll().deleteSelectedNodes();  //does appear to clear items  
    }
    dojo.connect(trash, "insertNodes", trashChange);

    freezeConfigure.on("MouseMove", function(evt){
       //console.log({"x": evt.layerX, "y": evt.layerY}); 
    });

    //used to re-name freezer items after they are created.
    //http://jsfiddle.net/bEurr/10/
    //for now this function only changes the textContent (or innerHTML)
    function contextMenu(fzItemID, fzSection) {
      var aMenu;
      aMenu = new dijit.Menu({ targetNodeIds: [fzItemID]});
      aMenu.addChild(new dijit.MenuItem({
        label: "Rename",
        onClick: function() {
          var fzName = prompt("Please rename freezer item", document.getElementById(fzItemID).innerHTML);
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
          //document.getElementById(fzItemID).innerHTML = fzName;}  //either works
          document.getElementById(fzItemID).textContent = fzName;}
          //alert('i was clicked')
        }
      }))
    };
    
    freezeOrgan.on("DndDrop", function(source, nodes, copy, target){
      //console.log("Source: ", source);
      //console.log("Nodes: ", nodes);
      //console.log("Copy: ", copy);
      //console.log("Target: ", target);
      if (target.node.id=="trashNode"){
        //http://stackoverflow.com/questions/1812148/dojo-dnd-move-node-programmatically
        source.parent.removeChild(nodes[0]);
        //target.parent.removeChild(nodes[0]);
      }
      if (target.node.id=="freezeConfigureNode"){
        // Asks for a name for any object dragged to the freezer. Need to check for duplicate names.
        // Does not change "data" value, only textContent changes.
        var dishCon = prompt("Please name your dish configuration", nodes[0].textContent+"_1");
        nodes[0].textContent=dishCon;
      }
      if (target.node.id=="freezeOrgansimNode"){
        var avidian = prompt("Please name your avidian", nodes[0].textContent+"_1");
        var namelist = dojo.query('> .dojoDndItem', 'freezeOrgansimNode');
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
        if (null != avidian) { nodes[0].textContent=avidian; }
        //contextMenu(Object.keys(target.selection)[0], target.node.id); //either this line or the next seem to work; don't need both
        contextMenu(nodes[0].id, target.node.id);

        //console.log("map: ", target.map);
        //console.log("id: ", target.node.id);
        //console.log("textContent: ", nodes[0].textContent);
        //console.log("nodes[0].id: ", nodes[0].id);
        //console.log("target.selection: ",target.selection);
        //console.log("target.selection: ",Object.keys(target.selection)[0]);
        //console.log(document.getElementById(Object.keys(target.selection)[0]).innerHTML)
        //console.log("allnodes: ",target.getAllNodes());
      }
      if (target.node.id=="freezePopDishNode"){
        var items = getAllItems(freezePopDish);
        var popDish = prompt("Please name your populated dish", nodes[0].textContent+"_1");
        var namelist = dojo.query('> .dojoDndItem', 'freezePopDishNode');
        var unique = true;
        while (unique) {
          unique = false;
          for (var ii = 0; ii < namelist.length; ii++){
            if (avidian == namelist[ii].innerHTML) {
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
        contextMenu(nodes[0].id, target.node.id);
        //contextMenu(Object.keys(target.selection)[0], target.node.id);  //gets original rather than new node 
      }
        if (source.node.id =="pop1name"){
          pop1a = [];       //remove lines from population 1
          pop1b = [];
          AnaChart();
        }
        if (source.node.id =="pop2name"){
          pop2a = [];       //remove lines from population 2
          pop2b = [];
          AnaChart();
        }
        if (source.node.id =="pop3name"){
          pop3a = [];       //remove lines from population 3
          pop3b = [];
          AnaChart();
        }

    function graphPop1Change(){
      //console.log("sel", graphPop1.selection);
      //console.log("sel", Object.keys(target.selection)[0]);
      //console.log("sel", document.getElementById(Object.keys(graphPop1.selection)[0]).innerHTML);  //only works when something is selected
      var items = getAllItems(graphPop1);
      //if there is an existing item, need to clear all nodes and assign most recent to item 0
      if (1 < items.length) {
        graphPop1.selectAll().deleteSelectedNodes();  //does appear to clear items  
        graphPop1.sync();   //not sure if this helps or not
        freezePopDish.forInSelectedItems(function(item, id){  
          graphPop1.insertNodes(false, [item]);          //assign the node that is selected from the only  valid source.
        });
        var items = getAllItems(graphPop1);
      }
      
      console.log("textcontent ", graphPop1.node.textContent);  //use to get textContent which is what will be paired with actual data
      //console.log("iditems ", items._parent[0].id);
      //console.log("id ", graphPop1.node.childNodes[0].id);

      //example code to set item programatically. not actually needed here.
      //graphPop1.setItem(graphPop1.node.childNodes[0].id, {data: "test_name", type: ["popDish"]});
      //graphPop1.sync();

      //this works for demo purposes only. We will be using textContent rather than data
      pop1a = dictPlota[items[0].data];
      pop1b = dictPlotb[items[0].data];
      AnaChart();
    };
    dojo.connect(graphPop1, "onDrop", graphPop1Change);

    function graphPop2Change(){
      var items = getAllItems(graphPop2);
      //need to clear all nodes and assign most recent to item 0
      if (1 < items.length) {
        graphPop2.selectAll().deleteSelectedNodes();  //does appear to clear items  
        graphPop2.sync();   //not sure if this helps or not
        freezePopDish.forInSelectedItems(function(item, id){  
          graphPop2.insertNodes(false, [item]);          //assign the node that is selected from the only  valid source.
        });
        var items = getAllItems(graphPop2);
      }
      console.log("textcontent ", graphPop2.node.textContent);  //use to get textContent which is what will be paired with actual data
      //this works for demo purposes only. We will be using textContent rather than data
      pop2a = dictPlota[items[0].data];
      pop2b = dictPlotb[items[0].data];
      AnaChart();
    };
    dojo.connect(graphPop2, "onDrop", graphPop2Change);

    });

    function graphPop3Change(){
      var items = getAllItems(graphPop3);
      //need to clear all nodes and assign most recent to item 0
      if (1 < items.length) {
        graphPop3.selectAll().deleteSelectedNodes();  //does appear to clear items  
        graphPop3.sync();   //not sure if this helps or not
        freezePopDish.forInSelectedItems(function(item, id){  
          graphPop3.insertNodes(false, [item]);          //assign the node that is selected from the only  valid source.
        });
        items = getAllItems(graphPop3);
      }
      console.log("textcontent ", graphPop3.node.textContent);  //use to get textContent which is what will be paired with actual data
      pop3a = dictPlota[items[0].data];
      pop3b = dictPlotb[items[0].data];
      AnaChart();
    };
    dojo.connect(graphPop3, "onDrop", graphPop3Change);

    /* ********************************************************************** */
    /* Right Click Context Menu Freezer ************************************* */
    /* ********************************************************************** */

    // I think all the code in this section can be deleted as it is not used.
    var pMenu;
    var freezerItemID ="Configuration";  //id of a freezer item need to get from dnd assignments
    freezerItemID = "dojoUnique1";
    
    dojo.addOnLoad(function() {
      pMenu = new dijit.Menu({ targetNodeIds: [freezerItemID]});
      pMenu.addChild(new dijit.MenuItem({
        label: "Simple menu item",
        onClick: function() {
          var gmenu = prompt("Please rename your populated dish", "george");
          //alert('i was clicked')
        }
      }));
    });


    /* *************************************************************** */
    /* Population page script ******************************************/
    /* *************************************************************** */
    // shifts the population page from Map (grid) view to setup parameters view and back again.
    function popBoxSwap(){
      if ("Map"== document.getElementById("PopSetupButton").innerHTML ) {
        dijit.byId("mapBlock").set("style", "display: block;");
        dijit.byId("setupBlock").set("style", "display: none;");
        document.getElementById("PopSetupButton").innerHTML = "Setup";
      } else {
        document.getElementById("PopSetupButton").innerHTML = "Map";
        dijit.byId("setupBlock").set("style", "display: block;");
        dijit.byId("mapBlock").set("style", "display: none;");
      }
    }
    document.getElementById("PopSetupButton").onclick = function(){popBoxSwap();};

    /* *************************************************************** */
    /* ******* Map Grid buttons ************************************** */
    /* *************************************************************** */
    document.getElementById("runStopButton").onclick = function(){
      if ("Run"==document.getElementById("runStopButton").innerHTML) {
        document.getElementById("runStopButton").innerHTML="Pause";
        //call stuff to start/continue run via enscripten here
      } else {
        document.getElementById("runStopButton").innerHTML="Run";
        //call stuff to pauese run via enscripten here
      }
    }

    //changes value of label, but does not change dislay
    dijit.byId("mnRun").on("Click", function(){ 
      console.log("label", dijit.byId("mnRun").label);
      if ("Run"==dijit.byId("mnRun").label) {
        dijit.byId("mnRun").label="Pause";
        console.log("set to pause", dijit.byId("mnRun").label);
        //call stuff to start/continue run via enscripten here
      } else {
        dijit.byId("mnRun").label="Run";
        console.log("set to run", dijit.byId("mnRun").label);
        //call stuff to pauese run via enscripten here
      }       
    });

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
      }
    }
    
    dijit.byId("FzConfiguration").on("Click", function(){
      fzDialog.hide();
      FrConfigFn();
    }); 
    
    dijit.byId("mnConfig").on("Click", function(){ FrConfigFn() });
    
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
      }
    }

    dijit.byId("FzPopulation").on("Click", function(){
      fzDialog.hide();
      FrPopulationFn();
    }); 
    
    dijit.byId("mnPopulation").on("Click", function() {FrPopulationFn() });

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
    
    /* *************************************************************** */
    /* Organism page script *********************************************/
    /* *************************************************************** */
    /* **** Organism Setup Dialog */

    document.getElementById("OrgSetting").onclick = function(){
      OrganSetupDialog.show();
    }

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

    /* **** Controls bottum of page ***********************************/
    /* Organism Gestation Length Slider */

    //console.log(dijit.byId("orgCycle"));

    function orgBackFn() {
      var ii = Number(document.getElementById("orgCycle").value);
      dijit.byId("orgCycle").set("value", ii-1);
    }

    function orgForwardFn() {
      var ii = Number(document.getElementById("orgCycle").value);
      dijit.byId("orgCycle").set("value", ii+1);
    }

    dijit.byId("orgReset").on("Click", function(){
      dijit.byId("orgCycle").set("value", 0);
      document.getElementById("organCycle").innerHTML = "0"
    });
    dijit.byId("orgBack").on("Click", orgBackFn);
    dijit.byId("orgForward").on("Click", orgForwardFn);
    dijit.byId("orgEnd").on("Click", function() {
    dijit.byId("orgCycle").set("value", 200);
    });
    dijit.byId("orgCycle").on("Change", function(value){
      cycleSlider.set("value",value);
    });
    //console.log("after orgEnd");

    //var slider = declare([HorizontalSlider, HorizontalRule, HorizontalRuleLabels], {

    var cycleSlider = new HorizontalSlider({
        name: "cycleSlider",
        value: 2,
        minimum: 0,
        maximum: 200,
        intermediateChanges: true,
        style: "width:100%;",
        onChange: function(value){
            document.getElementById("orgCycle").value = value;
        }
    }, "cycleSlider");
    //console.log("after slider");

    /* ****************************************************************/
    /* Analysis Page **************************************************/
    /* ****************************************************************/
    var dictPlota = {};
    var dictPlotb = {};
    dictPlota["example"] = [1, 2, 1, 2, 2, 3,   2, 3, 3,    4];
    dictPlota["m2w30u1000not"] = [0.6, 1.8, 2, 2, 2.4, 2.7, 3];
    dictPlota["m2w30u1000nand"] = [1, 1, 1.5, 2, 3, 3, 4, 4, 4.5];
    dictPlotb["example"] = [60, 50, 50, 40, 40, 37, 30, 20, 15, 7];
    dictPlotb["m2w30u1000not"] = [70,   68, 60, 50, 50,   47, 40];
    dictPlotb["m2w30u1000nand"] = [80, 70, 75, 60, 50, 50, 40, 40, 30];
    dictPlota["newPopulation"] = [0.5,  1,  2, 1.7,  2, 2.7, 3.2, 3.2];
    dictPlotb["newPopulation"] = [ 65, 50, 50,  47, 40,  37,  32, 22];
    var dictColor = {};
    dictColor["Red"] = "#FF0000";
    dictColor["Green"] = "#00FF00";
    dictColor["Blue"] = "#0000FF";
    dictColor["Magenta"] = "#FF00FF";
    dictColor["Cyan"] = "#00FFFF";
    dictColor["Yellow"] = "#FFFF00";
    dictColor["Purple"] = "#8800FF";
    dictColor["Orange"] = "#FFAA00";
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
    //var chart1 = new Chart("chartOne",{title: "Avida Traits"});

    ready(function(){
    });
    
    var chart1 = new Chart("chartOne");
    function AnaChart(){
      chart1.addPlot("default", {type: "Lines"});
      chart1.addPlot("other", {type: "Lines", hAxis: "other x", vAxis: "other y"});
      chart1.addAxis("x", {fixLower: "major", fixUpper: "major",title:'Time (updates)', titleOrientation: 'away'});
      chart1.addAxis("y", {vertical: true, fixLower: "major", title: y1title, titleOrientation: 'axis',fixUpper: "major", min: 0});
      chart1.addAxis("other x", {leftBottom: false});
      chart1.addAxis("other y", {vertical: true, leftBottom: false, min: 0, title:y2title});
      //console.log("pop1a: ", pop1a);
      //console.log("pop2a: ", pop2a);
      //console.log("pop3a: ", pop3a);
      //console.log("pop1b: ", pop1b);
      //console.log("pop2b: ", pop2b);
      //console.log("pop3b: ", pop3b);
      chart1.addSeries("Series 1a", pop1a, {stroke: {color:color1, width: 2}});   
      chart1.addSeries("Series 2a", pop2a, {stroke: {color:color2, width: 2}});
      chart1.addSeries("Series 3a", pop3a, {stroke: {color:color3, width: 2}});
      chart1.addSeries("Series 1b", pop1b, {plot: "other", stroke: {color:color1, width: .3}});
      chart1.addSeries("Series 2b", pop2b, {plot: "other", stroke: {color:color2, width: .3}});
      chart1.addSeries("Series 3b", pop3b, {plot: "other", stroke: {color:color3, width: .3}});
      //console.log(domGeometry.position(document.getElementById("chartOne")).w);
      
      chart1.resize(domGeometry.position(document.getElementById("chartHolder")).w-10, 
                    domGeometry.position(document.getElementById("chartHolder")).h-15);
      //console.log("chartOneafter", document.getElementById("chartOne"));
      //console.log("chartHoldAfter", dijit.byId("chartHolder"));
      chart1.render();
    };
    
    /* Chart buttons ****************************************/
    document.getElementById("pop1delete").onclick = function(){ 
      graphPop1.selectAll().deleteSelectedNodes();
      pop1a = [];
      pop1b = [];
      AnaChart();
    }
    document.getElementById("pop2delete").onclick = function(){ 
      pop2a = [];
      pop2b = [];
      AnaChart();
      graphPop2.selectAll().deleteSelectedNodes();
    }
    document.getElementById("pop3delete").onclick = function(){ 
      pop3a = [];
      pop3b = [];
      AnaChart();
      graphPop3.selectAll().deleteSelectedNodes();
    }
    dijit.byId("pop1color").on("Change", function(){
      color1 = dictColor[dijit.byId("pop1color").value];
      AnaChart();
    });
    dijit.byId("pop2color").on("Change", function(){
      color2 = dictColor[dijit.byId("pop2color").value];
      AnaChart();
    });
    dijit.byId("pop3color").on("Change", function(){
      color3 = dictColor[dijit.byId("pop3color").value];
      AnaChart();
    });
    
    //Set Y-axis title and choose the correct array to plot
    dijit.byId("y1select").on("Change", function(){
      y1title = dijit.byId("y1select").value;
      //need to get correct array to plot from freezer
      AnaChart();
    });

    dijit.byId("y2select").on("Change", function(){
      y2title = dijit.byId("y2select").value;
      //need to get correct array to plot from freezer
      AnaChart();
    });

    /* Json play *****/
    var json = '{"result":true,"count":3}',
    obj = JSON.parse(json);

    console.log('count is ', obj.count, "; result is ", obj.result);

    /* Canvas Play in gridCanvas *************************************/
    var canvas = document.getElementById("gridCanvas");
    var ctx = canvas.getContext("2d");
    ctx.moveTo(0,0);
    ctx.lineTo(200,100);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(95,50,40,0,3*Math.PI/2);
    ctx.stroke();
    
  });
