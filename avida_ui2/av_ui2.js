define.amd.jQuery = true;
require([
  "dijit/dijit",
  "dojo/parser",
  "dojo/_base/declare",
  "maqetta/space",
  "maqetta/AppStates",
  "dijit/layout/BorderContainer",
  "dijit/layout/ContentPane",
  "dijit/MenuBar",
  "dijit/PopupMenuBarItem",
  "dijit/MenuItem",
  "dijit/Menu",
  "dijit/form/Button",
  "dijit/TitlePane",
  "dijit/layout/TabContainer",
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
  "jquery",
  "jquery-ui",
  "dojo/domReady!"
  ], function(dijit, parser, declare, space, AppStates, BorderContainer, ContentPane, MenuBar, PopupMenuBarItem, MenuItem, Menu, Button, TitlePane, TabContainer,
              HorizontalSlider, HorizontalRule, HorizontalRuleLabels, RadioButton, ToggleButton, NumberSpinner, ComboButton,
              DropDownButton, ComboBox, Textarea, $, jqueryui){

    parser.parse();

    console.log("after parser");
      /* Population page script ***************************************/

    console.log(dijit.byId("sizex"));
    
    function popSizeFn() {
      console.log("in popSizeFn");
      var xx = Number(document.getElementById("sizex").value);
      var yy = Number(document.getElementById("sizey").value);
      console.log("x is " + xx + "; y=" + yy);
      document.getElementById("sizexy").innerHTML = "is a total of " + xx * yy + " cells";
    }      

    dijit.byId("sizex").on("Change", popSizeFn);
    dijit.byId("sizey").on("Change", popSizeFn);
    dijit.byId("sizeButton").on("Click", popSizeFn);
    console.log("after size");

    $(function slidemute() {
      /* because most mutation rates will be less than 2% I set up a non-linear scale as was done in the Mac Avida-ED */
      /* the jQuery slider I found only deals in integers and the fix function truncates rather than rounds, */
      /* so I multiplied by 100,000 to get 100.000% to come out even. */
      console.log("before defaultslide value");
      var muteSlideDefault = 109861.   /* results in 2% as a default */
      var muteDefault = (Math.pow(Math.E, (muteSlideDefault/100000))-1).toFixed(3)
      var slides = $( "#muteSlide" ).slider({
        /* range: "min", */  /*causes the left side of the scroll bar to be grey */
        value: muteSlideDefault,
        min: 0.0,
        max: 461512,
        slide: function( event, ui ) {
          $( "#mRate" ).val( ui.value);  /*put slider value in the text above the slider */
          $( "#muteInput" ).val( (Math.pow(Math.E, (ui.value/100000))-1).toFixed(3));  /*put the value in the text box */
        }
      });
      console.log("max");
      /* initialize */
      $( "#mRate" ).val( ($( "#muteSlide").slider( "value" )));
      $( "#muteInput" ).val(muteDefault);
      /*update slide based on textbox */
      $( "#muteInput" ).change(function() {
        slides.slider( "value", 100000.0*Math.log(1+(parseFloat(this.value))) );
        $( "#mRate" ).val( 100000*Math.log(1+(parseFloat(this.value))) );
        console.log("in mute change");
      });
    });

    console.log("after");
    /* slidemute; */
    console.log("after slidemute");



    /* Organism page script *****************************************/
    /* Organism Gestation Length Slider */

    //console.log(dijit.byId("orgCycle"));
    
    function orgBackFn() {
      var ii = Number(document.getElementById("orgCycle").value);
      // console.log("ii is " + ii);
      ii = ii-1;
      // console.log("now ii is " + ii );
      dijit.byId("orgCycle").set("value", ii);
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
      dijit.byId("orgCycle").set("value", 100);
    });
    dijit.byId("orgCycle").on("Change", function(value){
      slider.set("value",value);
    });
    console.log("after orgEnd");
    
    //var slider = declare([HorizontalSlider, HorizontalRule, HorizontalRuleLabels], {
    
    var slider = new HorizontalSlider({
        name: "slider",
        value: 2,
        minimum: 0,
        maximum: 100,
        intermediateChanges: true,
        style: "width:300px;",
        onChange: function(value){
            document.getElementById("orgCycle").value = value;
        }
    }, "slider");
    //console.log(slider);
    //slider.startup();
    
    
    
    console.log("after slider");

    /* Canvas Play in gridCanvas */
    var canvas = document.getElementById("gridCanvas");
    var ctx = canvas.getContext("2d");
    ctx.moveTo(0,0);
    ctx.lineTo(200,100);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(95,50,40,0,3*Math.PI/2);
    ctx.stroke();

  });
