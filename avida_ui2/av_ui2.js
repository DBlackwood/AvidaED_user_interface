define.amd.jQuery = true;
require([
  "dijit/dijit",
  "dojo/parser",
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
  ], function(dijit, parser, space, AppStates, BorderContainer, ContentPane, MenuBar, MenuItem, Menu, Button, TitlePane, TabContainer, 
              HorizontalSlider, HorizontalRule, HorizontalRuleLabels, RadioButton, ToggleButton, NumberSpinner, ComboButton,
              DropDownButton, ComboBox, Textarea, $, jqueryui){
    console.log("before");
    $(function() {
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
          $( "#mRate" ).val( ui.value + "%");  /*put slider value in the text above the slider */
          $( "#muteInput" ).val( (Math.pow(Math.E, (ui.value/100000))-1).toFixed(3) );  /*put the value in the text box */
        }
      });
      console.log(max);
      /* initialize */
      $( "#mRate" ).val( ($( "#muteSlide").slider( "value" )));  
      $( "#muteInput" ).val(muteDefault);
      /*update slide based on textbox */
      $( "#mute" ).change(function() {
        slides.slider( "value", 100000.0*Math.log(1+(parseFloat(this.value))) );
        $( "#mRate" ).val( Math.log(1+(parseFloat(this.value))) );
      });
    });
    
    console.log("after");
    
    
    
    
    
    
  });
