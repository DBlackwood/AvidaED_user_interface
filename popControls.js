// *********************************************************************************************************************
//                                       Population page script
// *********************************************************************************************************************
// ptd = PeTri Dish

// shifts the population page from Map (grid) view to setup parameters view and back again.
av.ptd.popBoxSwap = function () {
  'use strict';
  if ("Map" == document.getElementById("PopSetupButton").innerHTML) {
    //var height = $("#mapBlock").innerHeight() - 6;
    //dijit.byId("mapBlock").set("style", "display: block; height: " + height + "px");
    //dijit.byId("mapBlock").set("style", "display: block;");
    document.getElementById('mapBlock').style.display = 'block'
    //dijit.byId("mapBC").set("style", "height: " + height + "px");
    dijit.byId("setupBlock").set("style", "display: none");
    document.getElementById("PopSetupButton").innerHTML = "Setup";
  } else {
    document.getElementById("PopSetupButton").innerHTML = "Map";
    dijit.byId("setupBlock").set("style", "display: block;");
    //dijit.byId("mapBlock").set("style", "display: none;");
    document.getElementById('mapBlock').style.display = 'none'
  }
}

av.ptd.popWorldStateUi = function () {
  'use strict';
  av.grd.runState = 'world';
  //Disable some of the options on the Setup page
  //av.dnd.ancestorBox.isSource = false;
  av.dnd.ancestorBox.copyOnly = true;
  av.dnd.activeConfig.isSource = false;
  delete av.dnd.ancestorBox.accept['g'];
  delete av.dnd.activeConfig.accept['c'];
  dijit.byId("sizeCols").attr("disabled", true);
  dijit.byId("sizeRows").attr("disabled", true);
  dijit.byId("experimentRadio").attr("disabled", true);
  dijit.byId("demoRadio").attr("disabled", true);

  //there will be a population so it can now be frozen.
  dijit.byId("mnFzPopulation").attr("disabled", false);
}

av.ptd.popRunningStateUi = function () {
  'use strict';
  av.grd.runState = 'started';  //the run has now started
  //Disable some of the options on the Setup page
  av.dnd.ancestorBox.copyOnly = true;
  //av.dnd.ancestorBox.isSource = false;
  av.dnd.activeConfig.isSource = false;
  delete av.dnd.ancestorBox.accept['g'];
  delete av.dnd.activeConfig.accept['c'];
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

av.ptd.popNewExState = function () {
  'use strict';
  //set configuation to default
  var fname = "@default";
  av.dnd.activeConfig.selectAll().deleteSelectedNodes();
  av.dnd.activeConfig.insertNodes(false, [{data: fname, type: ['c']}]);
  av.dnd.activeConfig.sync();
  var domId = Object.keys(av.dnd.activeConfig.map)[0];
  av.fzr.actConfig.domID = domId;
  av.fzr.actConfig.name = fname;
  av.fzr.actConfig.type = 'c';
  av.fzr.actConfig._id = 'c0';
  // clear parents
  av.dnd.ancestorBox.accept['g'] = 1;
  av.dnd.activeConfig.accept['c'] = 1;
  av.dnd.ancestorBox.isSource = true;
  av.dnd.ancestorBox.copyOnly = false;
  av.dnd.activeConfig.isSource = true;
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
  av.parents.Colors = av.color.parentColorList;
  av.parents.Colors.reverse();
  //set run/stop and drop down menu to the 'stopped' state
  dijit.byId("mnCnPause").attr("disabled", true);
  dijit.byId("mnCnRun").attr("disabled", false);
  document.getElementById("runStopButton").innerHTML = "Run";

  //clear the time series graphs
  av.ptd.aveFit = [];
  av.ptd.logFit = [];
  av.ptd.aveGnl = [];
  av.ptd.logGnl = [];
  av.ptd.aveMet = [];
  av.ptd.logMet = [];
  av.ptd.aveNum = [];
  av.ptd.logNum = [];

  TimeLabel.textContent = 0;
  //av.frd.avidaCFG2form(fileStr);
  av.dnd.ancestorBox.selectAll().deleteSelectedNodes();
  av.dnd.ancestorBox.sync();
  av.dnd.gridCanvas.selectAll().deleteSelectedNodes();
  av.dnd.gridCanvas.sync();

  //Update data for Selected Organism Type
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
  document.getElementById("oroLabel").textContent = "oro-";
  document.getElementById("antLabel").textContent = "ant-";
  document.getElementById("norLabel").textContent = "nor-";
  document.getElementById("xorLabel").textContent = "xor-";
  document.getElementById("equLabel").textContent = "equ-";
  document.getElementById("notTime").textContent = "0";
  document.getElementById("nanTime").textContent = "0";
  document.getElementById("andTime").textContent = "0";
  document.getElementById("ornTime").textContent = "0";
  document.getElementById("oroTime").textContent = "0";
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
  av.grd.flagSelected = false;
  dijit.byId("mnFzOrganism").attr("disabled", true);
  dijit.byId("mnCnOrganismTrace").attr("disabled", true);
}

//----------------------------------------------------------------------------------------------------------------------
// Freezer Button functions
//----------------------------------------------------------------------------------------------------------------------

//Freeze the selected organism
av.ptd.FrOrganismFn = function (trigger) {
  'use strict';
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
    gene = '0,heads_default,' + av.ind.dna[1];
  }
  else {
    fzName = prompt("Please name the organism", "newOrganism");
    console.log('source unknwon', trigger);
  }
  fzName = av.dnd.getUniqueName(fzName, av.dnd.fzOrgan);
  if (null != fzName) {
    //insert new item into the freezer.
    av.dnd.fzOrgan.insertNodes(false, [{data: fzName, type: ['g']}]);
    av.dnd.fzOrgan.sync();

    //Find out the dom ID the node element just inserted.
    var mapItems = Object.keys(av.dnd.fzOrgan.map);
    var domid = mapItems[mapItems.length - 1];
    av.fzr.dir[domid] = 'g' + av.fzr.gNum;
    av.fzr.domid['g' + av.fzr.gNum] = domid;
    av.fzr.file['g' + av.fzr.gNum + '/genome.seq'] = gene;
    av.fzr.file['g' + av.fzr.gNum + '/entryname.txt'] = fzName;
    av.fzr.gNum++;
    av.dnd.contextMenu(av.dnd.fzOrgan, domid);
  }
}

av.ptd.FrConfigFn = function () {
  'use strict';
  var fzName = prompt("Please name the new configuration", "newConfig");
  if (fzName) {
    //var namelist = dojo.query('> .dojoDndItem', 'fzConfig');  console.log('namelist', namelist); not in use, but does show another way to get data
    fzName = av.dnd.getUniqueName(fzName, av.dnd.fzConfig);
    if (null != fzName) {
      av.dnd.fzConfig.insertNodes(false, [{data: fzName, type: ['c']}]);
      av.dnd.fzConfig.sync();
      var domid = av.dnd.getDomId(fzName, av.dnd.fzConfig);
      av.fzr.dir[domid] = 'c'+ av.fzr.cNum;
      av.fzr.domid['c'+ av.fzr.cNum] = domid;
      av.fzr.file[av.fzr.dir[domid]+'/entryname.txt'] = fzName;
      av.fwt.makeFzrConfig(av.fzr.cNum);
      av.fzr.cNum++;
      //Create context menu for right-click on this item
      av.dnd.contextMenu(av.dnd.fzConfig, domid);
    }
  }
}

//Save a populated dish
av.ptd.FrPopulationFn = function () {
  'use strict';
  var fzName = prompt("Please name the new population", "newPopulation");
  if (fzName) {
    fzName = av.dnd.getUniqueName(fzName, av.dnd.fzWorld);
    if (null != fzName) {
      av.dnd.fzWorld.insertNodes(false, [{data: fzName, type: ['w']}]);
      av.dnd.fzWorld.sync();
      //Find out the dom ID the node element just inserted.
      var domid = av.dnd.getDomId(fzName, av.dnd.fzWorld);
      av.fzr.dir[domid] = 'w'+ av.fzr.wNum;
      av.fzr.domid['w'+ av.fzr.wNum] = domid;
      av.fzr.file[av.fzr.dir[domid]+'/entryname.txt'] = fzName;
      av.fwt.makeFzrWorld(av.fzr.wNum);
      av.fzr.wNum++;
      //Create context menu for right-click on this item
      av.dnd.contextMenu(av.dnd.fzWorld, domid);
    }
  }
}

av.ptd.bitToggle = function (button) {
  'use strict';
  if ('on' == document.getElementById(button).value) {
    document.getElementById(button).value = 'off';
    document.getElementById(button).className = 'bitButtonOff';
  }
  else {
    document.getElementById(button).value = 'on';
    document.getElementById(button).className = 'bitButtonOn';
  }
  for (ii=0; ii<av.ptd.aveFit.length; ii++){
    av.ptd.logFit[ii] = null;
    av.ptd.logGnl[ii] = null;
    av.ptd.logMet[ii] = null;
    av.ptd.logNum[ii] = null;
  }
  av.grd.drawGridSetupFn();
}


//----------------------------------------------------------------------------------------------------------------------
// code below this line is not in use tiba delete later
//writes data to Environmental Settings page based on the content of av.dnd.activeConfig
//for now this is hard coded to what would be in @default. will need a way to request data from PouchDB
//and read the returned JSON string.
av.ptd.writeHardDefault = function (av) {
  'use strict';
  dijit.byId("sizeCols").set('value', av.dft.sizeCols);
  dijit.byId("sizeRows").set('value', av.dft.sizeRows);
  dijit.byId("sizeCols").set('value', '20');    //delete later; av.debug only taba
  dijit.byId("sizeRows").set('value', '5');     //delete lager; av.debug only tiba
  if ('childParentRadio'==av.dft.child) {
    dijit.byId("childParentRadio").set('checked', true);
    dijit.byId("childRandomRadio").set('checked', false);
  }
  else {
    dijit.byId("childParentRadio").set('checked', false);
    dijit.byId("childRandomRadio").set('checked', true);
  }
  dijit.byId("notose").set('checked', av.dft.notose);
  dijit.byId("nanose").set('checked', av.dft.nanose);
  dijit.byId("andose").set('checked', av.dft.andose);
  dijit.byId("ornose").set('checked', av.dft.ornose);
  dijit.byId("orose").set('checked', av.dft.orose);
  dijit.byId("andnose").set('checked', av.dft.andnose);
  dijit.byId("norose").set('checked', av.dft.norose);
  dijit.byId("xorose").set('checked', av.dft.xorose);
  dijit.byId("equose").set('checked', av.dft.equose);
  dijit.byId("experimentRadio").set('checked', true);
  dijit.byId("manRadio").set('checked', true);
  if ('experimentRadio'==av.dft.repeat) {
    dijit.byId("experimentRadio").set('checked', true);
    dijit.byId("demoRadio").set('checked', false);
  }
  else {
    dijit.byId("experimentRadio").set('checked', false);
    dijit.byId("demoRadio").set('checked', true);
  }
  if ('manRadio'==av.dft.pauseType) {
    dijit.byId("manRadio").set('checked', true);
    dijit.byId("updateRadio").set('checked', false);
  }
  else {
    dijit.byId("manRadio").set('checked', false);
    dijit.byId("updateRadio").set('checked', true);
  };
}

