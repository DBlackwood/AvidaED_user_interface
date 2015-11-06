/* *************************************************************** */
/* Population page script ******************************************/
/* *************************************************************** */

// shifts the population page from Map (grid) view to setup parameters view and back again.
function popBoxSwap() {
  if ("Map" == document.getElementById("PopSetupButton").innerHTML) {
    //var height = $("#mapBlock").innerHeight() - 6;
    //dijit.byId("mapBlock").set("style", "display: block; height: " + height + "px");
    dijit.byId("mapBlock").set("style", "display: block;");
    //dijit.byId("mapBC").set("style", "height: " + height + "px");
    dijit.byId("setupBlock").set("style", "display: none");
    document.getElementById("PopSetupButton").innerHTML = "Setup";
  } else {
    document.getElementById("PopSetupButton").innerHTML = "Map";
    dijit.byId("setupBlock").set("style", "display: block;");
    dijit.byId("mapBlock").set("style", "display: none;");
  }
}

function popRunningState_ui(dnd, grd) {
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
}

function popNewExState(dnd, grd, parents){
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
}

//writes data to Environmental Settings page based on the content of dnd.activeConfig
//for now this is hard coded to what would be in @default. will need a way to request data from PouchDB
//and read the returned JSON string.
function writeSettings(dft, dnd, grd) {
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
  dijit.byId("mnOrganismTrace").attr("disabled", true);
}
