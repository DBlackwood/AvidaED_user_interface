
//----------

<span class="lftmargin">Per Site Mutation Rate:</span>
<span id="muteSlide"
style="width:100px; display: inline-block; vertical-align: top; margin-left:20px; margin-right:20px"></span>
    <!-- style done here for the slider; margin to keep it from overlapping;
                          without width the slider is the full width of the browser window-->
  <input id="muteInput" type="text" data-dojo-type="dijit/form/NumberTextBox" value=1 required="true" ;
data-dojo-props="constraints:{min:0, max:100},
invalidMessage:'Please enter a numeric value.', rangeMessage:'Invalid mutation rate.'"
style="width: 4.5em; height:1.8em">
  </input> %


<span class="lftmargin">Per Site Mutation Rate:</span>
<span id="orMuteSlide"
style="width:200px; display: inline-block; vertical-align: top; margin-left:20px; margin-right:20px"></span>
    <!-- style done here for the slider; margin to keep it from overlapping;
                        without width the slider is the full width of the browser window-->
  <input id="orMuteInput" type="text" data-dojo-type="dijit/form/NumberTextBox" value=20 required="true" ;
data-dojo-props="constraints:{min:0, max:100},
invalidMessage:'Please enter a numeric value.', rangeMessage:'Invalid mutation rate.'"
style="width: 4.5em; height:1.8em"></input> %




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


 dijit.byId("mnFlExportData").on("Click", function () {
    'use strict';
    av.debug.log += '\n -Button: mnFlExportData';
    //av.fwt.writeCSV();
  });
  
  /*
av.fwt.writeCSV = function() {
  "use strict";
  //  '@default at update 141 Average Fitness,@default at update 141 Average Gestation Time,' +
  //  '@default at update 141 Average Metabolic Rate,@default at update 141 Count of Organisms in the World';
  av.fwt.csvStrg = 'Update,' +  av.fzr.actConfig.name + ' at update ' + av.grd.popStatsMsg.update + ' Average Fitness,'
              + av.fzr.actConfig.name + 'at update ' + av.grd.popStatsMsg.update + ' Average Generation Length,'
              + av.fzr.actConfig.name + 'at update ' + av.grd.popStatsMsg.update + ' Average Metabolic Rate,'
              + av.fzr.actConfig.name + 'at update ' + av.grd.popStatsMsg.update + ' Count of Organisms in the World';
  var lngth = av.ptd.aveFit.length;
  for (var ii = 0; ii < lngth; ii++) {
    av.fwt.csvStrg += '\n' + ii + ',' + av.ptd.aveFit[ii].formatNum(6) + ',' + av.ptd.aveGnl[ii].formatNum(6) + ',' + av.ptd.aveMet[ii].formatNum(6) + ',' + av.ptd.aveNum[ii];
  }
  console.log(av.fwt.csvStrg);
}
  */
