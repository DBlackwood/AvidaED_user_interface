// *********************************************************************************************************************
//                                       Population page script
// *********************************************************************************************************************
// ptd = PeTri Dish

av.ptd.makePauseState = function () {
  dijit.byId('mnCnPause').attr('disabled', true);
  dijit.byId('mnCnRun').attr('disabled', false);
  //console.log('pauseState; button=run');
  document.getElementById('runStopButton').textContent = 'Run';
}

// shifts the population page from Map (grid) view to setup parameters view and back again.
av.ptd.popBoxSwap = function () {
  'use strict';
  if ('Map' == document.getElementById('PopSetupButton').innerHTML) {
    av.debug.log += '\n -Button: PopSetupButton became Setup';
    document.getElementById('mapBlock').style.display = 'block';
    document.getElementById('PopSetupButton').textContent = 'Setup';
    dijit.byId('setupBlock').set('style', 'display: none');

    av.grd.cellConflict(av.grd.cols, av.grd.rows);
    av.grd.drawGridSetupFn();
    av.ui.subpage = 'map';
    //var height = $('#mapBlock').innerHeight() - 6;
    //dijit.byId('mapBlock').set('style', 'display: block; height: ' + height + 'px');
    //dijit.byId('mapBlock').set('style', 'display: block;');
    //dijit.byId('mapBC').set('style', 'height: ' + height + 'px');
  } else {
    av.debug.log += '\n -Button: PopSetupButton became Map';
    document.getElementById('mapBlock').style.display = 'none'
    document.getElementById('PopSetupButton').textContent = 'Map';
    dijit.byId('setupBlock').set('style', 'display: block;');

    av.ui.subpage = 'setup';
    //dijit.byId('mapBlock').set('style', 'display: none;');
  }
}

av.ptd.popWorldStateUi = function () {
  'use strict';
  av.grd.runState = 'world';
  //Disable some of the options on the Setup page
  //av.dnd.ancestorBox.isSource = false;
  av.dnd.ancestorBox.copyOnly = true;
  av.dnd.activeConfig.isSource = true;
  //delete av.dnd.ancestorBox.accept['g'];
  //delete av.dnd.gridCanvas.accept['g'];
  delete av.dnd.activeConfig.accept['c'];
  delete av.dnd.activeConfig.accept['w'];
  av.dnd.fzWorld.accept['w'] = 1;
  av.dnd.fzWorld.accept['b'] = 1;
  dijit.byId('sizeCols').attr('disabled', true);
  dijit.byId('sizeRows').attr('disabled', true);
  //dijit.byId('experimentRadio').attr('disabled', true);
  //dijit.byId('demoRadio').attr('disabled', true);

  //there will be a population so it can now be frozen.
  dijit.byId('mnFzPopulation').attr('disabled', false);
}

av.ptd.popRunningStateUi = function () {
  'use strict';
  av.grd.runState = 'started';  //the run has now started
  //Disable some of the options on the Setup page
  av.dnd.ancestorBox.copyOnly = true;
  //av.dnd.ancestorBox.isSource = false;
  //av.dnd.activeConfig.isSource = false;
  delete av.dnd.ancestorBox.accept['g'];
  delete av.dnd.gridCanvas.accept['g'];
  delete av.dnd.activeConfig.accept['c'];
  delete av.dnd.activeConfig.accept['w'];
  av.dnd.fzWorld.accept['w'] = 1;
  av.dnd.fzWorld.accept['b'] = 1;
  $('#muteSlide').slider({disabled: true});  //http://stackoverflow.com/questions/970358/jquery-readonly-slider-how-to-do
  dijit.byId('sizeCols').attr('disabled', true);
  dijit.byId('sizeRows').attr('disabled', true);
  dijit.byId('muteInput').attr('disabled', true);
  dijit.byId('childParentRadio').attr('disabled', true);
  dijit.byId('childRandomRadio').attr('disabled', true);
  dijit.byId('notose').attr('disabled', true);
  dijit.byId('nanose').attr('disabled', true);
  dijit.byId('andose').attr('disabled', true);
  dijit.byId('ornose').attr('disabled', true);
  dijit.byId('orose').attr('disabled', true);
  dijit.byId('andnose').attr('disabled', true);
  dijit.byId('norose').attr('disabled', true);
  dijit.byId('xorose').attr('disabled', true);
  dijit.byId('equose').attr('disabled', true);
  dijit.byId('experimentRadio').attr('disabled', true);
  dijit.byId('demoRadio').attr('disabled', true);

  //there will be a population so it can now be frozen.
  dijit.byId('mnFzPopulation').attr('disabled', false);
}

av.ptd.popNewExState = function () {
  'use strict';
  //set configuation to default
  var fname = '@default';
  av.dnd.activeConfig.selectAll().deleteSelectedNodes();
  av.dnd.activeConfig.insertNodes(false, [{data: fname, type: ['c']}]);
  av.dnd.activeConfig.sync();
  var domId = Object.keys(av.dnd.activeConfig.map)[0];
  av.fzr.actConfig.actDomid = domId;
  av.fzr.actConfig.name = fname;
  av.fzr.actConfig.type = 'c';
  av.fzr.actConfig._id = 'c0';
  // clear parents
  av.dnd.ancestorBox.accept['g'] = 1;
  av.dnd.gridCanvas.accept['g'] = 1;
  av.dnd.activeConfig.accept['c'] = 1;
  av.dnd.activeConfig.accept['b'] = 1;
  av.dnd.activeConfig.accept['w'] = 1;
  av.dnd.fzWorld.accept['w'] = 0;
  av.dnd.fzWorld.accept['b'] = 0;
  av.dnd.ancestorBox.isSource = true;
  av.dnd.ancestorBox.copyOnly = true;
  av.dnd.activeConfig.isSource = true;
  $('#muteSlide').slider({disabled: false});  //http://stackoverflow.com/questions/970358/jquery-readonly-slider-how-to-do
  dijit.byId('sizeCols').attr('disabled', false);
  dijit.byId('sizeRows').attr('disabled', false);
  dijit.byId('muteInput').attr('disabled', false);
  dijit.byId('childParentRadio').attr('disabled', false);
  dijit.byId('childRandomRadio').attr('disabled', false);
  dijit.byId('notose').attr('disabled', false);
  dijit.byId('nanose').attr('disabled', false);
  dijit.byId('andose').attr('disabled', false);
  dijit.byId('ornose').attr('disabled', false);
  dijit.byId('orose').attr('disabled', false);
  dijit.byId('andnose').attr('disabled', false);
  dijit.byId('norose').attr('disabled', false);
  dijit.byId('xorose').attr('disabled', false);
  dijit.byId('equose').attr('disabled', false);
  dijit.byId('experimentRadio').attr('disabled', false);
  dijit.byId('demoRadio').attr('disabled', false);

  //reset Ancestor Color stack
  //av.parents.Colors = av.color.parentColorList.slice();   //delete this later
  av.parents.Colors.reverse();
  //set run/stop and drop down menu to the 'stopped' state
  dijit.byId('mnCnPause').attr('disabled', true);
  dijit.byId('mnCnRun').attr('disabled', false);
  document.getElementById('runStopButton').innerHTML = 'Run';
  //console.log('pauseState; button=run in av.ptd.popNewExState');

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
  av.grd.selCtx.fillStyle = '#D7D7D7';
  av.grd.selCtx.fillRect(0, 0, av.grd.SelectedWd, av.grd.SelectedHt);
  nameLabel.textContent = '';
  fitLabel.innerHTML = '';
  metabolicLabel.textContent = '';
  generateLabel.textContent = '';
  ageLabel.textContent = '';
  ancestorLabel.textContent = '';
  viableLabel.textContent = '';
  notLabel.textContent = 'not-';
  nanLabel.textContent = 'nan-';
  andLabel.textContent = 'and-';
  ornLabel.textContent = 'orn-';
  oroLabel.textContent = 'oro-';
  antLabel.textContent = 'ant-';
  norLabel.textContent = 'nor-';
  xorLabel.textContent = 'xor-';
  equLabel.textContent = 'equ-';
  notTime.textContent = '0';
  nanTime.textContent = '0';
  andTime.textContent = '0';
  ornTime.textContent = '0';
  oroTime.textContent = '0';
  antTime.textContent = '0';
  norTime.textContent = '0';
  xorTime.textContent = '0';
  equTime.textContent = '0';
  
  //Population Statistics
  popSizeLabel.textContent = '';
  aFitLabel.textContent = '';
  aMetabolicLabel.textContent = '';
  aGestateLabel.textContent = '';
  aAgeLabel.textContent = '';
  parentNumLabel.textContent = '';
  viableNumLabel.textContent = '';
  notPop.textContent = '';
  nanPop.textContent = '';
  andPop.textContent = '';
  ornPop.textContent = '';
  oroPop.textContent = '';
  antPop.textContent = '';
  norPop.textContent = '';
  xorPop.textContent = '';
  equPop.textContent = '';
  
  numLog.textContent = '';
  logTit1.textContent = '';
  logTit2.textContent = '';
  logTit3.textContent = '';
  logTit4.textContent = '';
  logTit5.textContent = '';
  av.grd.flagSelected = false;
  dijit.byId('mnFzOrganism').attr('disabled', true);
  dijit.byId('mnCnOrganismTrace').attr('disabled', true);
}

//after Run button pushed for population
av.ptd.runPopFn = function () {
  //console.log('runPopFn runState', av.grd.runState);
  //check for ancestor organism in configuration data
  var namelist = dojo.query('> .dojoDndItem', 'ancestorBox');
  //console.log('namelist', namelist);
  if (1 > namelist.length) {
    //console.log('about to call av.ptd.makePauseState()');
    //av.debug.log += 'about to call av.ptd.makePauseState() in AvidaEd.js line 740 \n';
    av.ptd.makePauseState();
    NeedAncestorDialog.show();
  }
  else { // setup for a new run by sending config data to avida
    if ('started' !== av.grd.runState) {
      //collect setup data to send to avida.  Order matters. Files must be created first. Then files must be sent before some other stuff.
      av.fwt.form2cfgFolder();          //fileDataWrite.js creates avida.cfg and environment.cfg and ancestor.txt and ancestor_manual.txt
      if ('prepping' === av.grd.runState) {
        av.msg.importConfigExpr();
        av.msg.injectAncestors();
      }
      else {
        av.msg.importWorldExpr();
        //console.log('parents.injected', av.parents.injected);
        //av.debug.log += '\nstart importWorld running-----------------------------------------\n'
        av.msg.injectAncestors();
      }

      //change ui parameters for the correct state when the avida population has started running
      av.ptd.popRunningStateUi();  //av.grd.runState now == 'started'

      av.msg.requestGridData();
      av.msg.requestPopStats();
      if (0 < av.grd.selectedNdx) av.msg.doWebOrgDataByCell();
    }

    if (dijit.byId('autoUpdateRadio').get('checked')) {
      //av.msg.pause(dijit.byId('autoUpdateSpinner').get('value'));  //not used where there is handshaking (not used with av.msg.stepUpdate)
      av.ui.autoStopFlag = true;
      av.ui.autoStopValue = dijit.byId('autoUpdateSpinner').get('value');
      //console.log('stop at ', dijit.byId('autoUpdateSpinner').get('value'));
    }

    av.ptd.makeRunState();
    av.msg.stepUpdate();   //av.msg.doRunPause(av.fio);
  }
  //update screen based on data from C++
}

av.ptd.runStopFn = function () {
  if ('Run' == document.getElementById('runStopButton').innerHTML) {
    av.ptd.makeRunState();
    av.ptd.runPopFn();
  } else {
    //console.log('about to call av.ptd.makePauseState()');
    //av.debug.log += 'about to call av.ptd.makePauseState() in AvidaEd.js line 772 \n';
    av.ptd.makePauseState();
    //av.msg.doRunPause(av.fio);
    //console.log('pop size ', av.ptd.aveNum);
  }
};

//----------------------------------------------------------------------------------------------------------------------
// Freezer Button functions
//----------------------------------------------------------------------------------------------------------------------

//Freeze the selected organism
av.ptd.FrOrganismFn = function (trigger) {
  'use strict';
  var fzName = 'new';
  var parentName = '';
  var gene;
  if ('selected' == trigger) {
    fzName = prompt('Please name the selected organism', av.grd.kidName);
    gene = av.grd.kidGenome;
  }
  else if ('offspring' == trigger) {
    //get name from parent
    parentName = document.getElementById(Object.keys(av.dnd.activeOrgan.map)[0]).textContent;
    fzName = prompt('Please name the offspring', parentName + '_Offspring');
    gene = '0,heads_default,' + av.ind.dna[1];
  }
  else {
    fzName = prompt('Please name the organism', 'newOrganism');
    //console.log('source unknwon', trigger);
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
    av.fzr.saveUpdateState('no');
  }
}

av.ptd.FrConfigFn = function () {
  'use strict';
  var fzName = prompt('Please name the new configuration', 'newConfig');
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
      av.fzr.saveUpdateState('no');
    }
  }
}

//Save a populated dish
av.ptd.FrPopulationFn = function () {
  'use strict';
  av.msg.exportExpr('w' + av.fzr.wNum);
  av.msg.sendData();
  var popName = av.fzr.actConfig.name + '@' + av.grd.popStatsMsg.update.formatNum(0);  // need update here star
  var fzName = prompt('Please name the new population', popName);
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
      av.fzr.saveUpdateState('no');
    }
  }
}

av.ptd.bitToggle = function (button) {
  'use strict';
  av.debug.log += '\n -Button: ' + button;
  if ('on' == document.getElementById(button).value) {
    document.getElementById(button).value = 'off';
    document.getElementById(button).className = 'bitButtonOff';
  }
  else {
    document.getElementById(button).value = 'on';
    document.getElementById(button).className = 'bitButtonOn';
  }
  var lngth = av.ptd.aveFit.length;
  for (ii=0; ii < lngth; ii++){
    av.ptd.logFit[ii] = null;
    av.ptd.logGnl[ii] = null;
    av.ptd.logMet[ii] = null;
    av.ptd.logNum[ii] = null;
  }
  //console.log('in av.ptd.bitToggle');
  av.grd.drawGridSetupFn();
  av.grd.popChartFn();
  av.grd.updateLogicFn(av.grd.popStatsMsg.update);
}

//reset values
av.ptd.resetDishFn = function (need2sendRest2avida) { //Need to reset all settings to @default
  'use strict';
  // send reset to Avida adaptor
  //if (need2sendRest2avida) {av.msg.reset();} //Take this out if we only reset when avida resets After sending a request for reset.

  //console.log('in resetDishFn');
  av.msg.pause('now');
  av.ptd.makePauseState();
  av.grd.clearGrd();

  av.grd.runState = 'prepping';
  dijit.byId('mnCnOrganismTrace').attr('disabled', true);
  dijit.byId('mnFzOrganism').attr('disabled', true);
  //Enable the options on the Setup page
  av.ptd.popNewExState();
  //Clear grid settings
  av.parents.clearParentsFn();
  // reset values in population settings based on a 'file' @default
  av.fzr.actConfig.file = {};
  // write if @default not found - need to figure out a test for this
  // av.ptd.writeHardDefault(av);
  av.fzr.actConfig.dir = 'c0';
  av.fzr.actConfig.file['events.cfg'] = ' ';
  if (av.fzr.actConfig.file['clade.ssg']) {delete av.fzr.actConfig.file['clade.ssg'];}
  if (av.fzr.actConfig.file['detail.spop']) {delete av.fzr.actConfig.file['detail.spop'];}
  if (av.fzr.actConfig.file['update']) {delete av.fzr.actConfig.file['update'];}
  if (av.fzr.file[av.fzr.actConfig.dir + '/ancestors']) {
    str = av.fzr.file[av.fzr.actConfig.dir + '/ancestors'];
    av.fio.autoAncestorLoad(str);
  }
  if (av.fzr.file[av.fzr.actConfig.dir + '/ancestors_manual']) {
    str = av.fzr.file[av.fzr.actConfig.dir + '/ancestors_manual'];
    av.fio.handAncestorLoad(str);
  }

  av.frd.updateSetup();

  if (av.fzr.file[av.fzr.actConfig.dir + '/instset.cfg']) {av.fzr.actConfig.file['instset.cfg'] = av.fzr.file[av.fzr.actConfig.dir + '/instset.cfg'];}

    //Clear options that are not in the config files
  dijit.byId('manualUpdateRadio').set('checked', true);
  dijit.byId('autoUpdateRadio').set('checked', false);
  dijit.byId('autoUpdateSpinner').set('value', av.ptd.autoPauseUpdate);

  av.ptd.clearLogicButtons();
  //console.log('fzr.activeCon', av.fzr.actConfig);

  // re-write grid if that page is visible
  av.grd.popChartClear();
  av.grd.drawGridSetupFn();
}

//clear logic Buttons
av.ptd.clearLogicButtons = function() {
  var logicButtons = ['notButton', 'nanButton', 'andButton', 'ornButton', 'oroButton', 'antButton', 'norButton', 'xorButton', 'equButton'];
  var len = logicButtons.length;
  for (var ii = 0; ii < len; ii++) {
    document.getElementById(logicButtons[ii]).value = 'off';
    document.getElementById(logicButtons[ii]).className = 'bitButtonOff';
  }
}

//----------------------------------------------------------------------------------------------------------------------
// code below this line is not in use tiba delete later
//writes data to Environmental Settings page based on the content of av.dnd.activeConfig
//for now this is hard coded to what would be in @default. will need a way to request data from PouchDB
//and read the returned JSON string.
av.ptd.writeHardDefault = function (av) {
  'use strict';
  dijit.byId('sizeCols').set('value', av.dft.sizeCols);
  dijit.byId('sizeRows').set('value', av.dft.sizeRows);
  if ('childParentRadio'==av.dft.child) {
    dijit.byId('childParentRadio').set('checked', true);
    dijit.byId('childRandomRadio').set('checked', false);
  }
  else {
    dijit.byId('childParentRadio').set('checked', false);
    dijit.byId('childRandomRadio').set('checked', true);
  }
  dijit.byId('notose').set('checked', av.dft.notose);
  dijit.byId('nanose').set('checked', av.dft.nanose);
  dijit.byId('andose').set('checked', av.dft.andose);
  dijit.byId('ornose').set('checked', av.dft.ornose);
  dijit.byId('orose').set('checked', av.dft.orose);
  dijit.byId('andnose').set('checked', av.dft.andnose);
  dijit.byId('norose').set('checked', av.dft.norose);
  dijit.byId('xorose').set('checked', av.dft.xorose);
  dijit.byId('equose').set('checked', av.dft.equose);
  dijit.byId('experimentRadio').set('checked', true);
  dijit.byId('manualUpdateRadio').set('checked', true);
  if ('experimentRadio'==av.dft.repeat) {
    dijit.byId('experimentRadio').set('checked', true);
    dijit.byId('demoRadio').set('checked', false);
  }
  else {
    dijit.byId('experimentRadio').set('checked', false);
    dijit.byId('demoRadio').set('checked', true);
  }
  if ('manualUpdateRadio'==av.dft.pauseType) {
    dijit.byId('manualUpdateRadio').set('checked', true);
    dijit.byId('autoUpdateRadio').set('checked', false);
  }
  else {
    dijit.byId('manualUpdateRadio').set('checked', false);
    dijit.byId('autoUpdateRadio').set('checked', true);
  };
}

// should really be in a ui code section
// http://stackoverflow.com/questions/7125453/modifying-css-class-property-values-on-the-fly-with-javascript-jquery
av.ptd.setStyle = function (cssText) {
  var sheet = document.createElement('style'), isIE = false;
  sheet.type = 'text/css';
  /* Optional */ window.customSheet = sheet;
  (document.head || document.getElementsByTagName('head')[0]).appendChild(sheet);
  try{sheet.cloneNode(false).appendChild(document.createTextNode(''));}
  catch(err){isIE = true;}
  var wrapper = isIE ? document.createElement('div') : sheet;
  return (setStyle = function(cssText, node) {
    if(!node || node.parentNode !== wrapper)
      node = wrapper.appendChild(document.createTextNode(cssText));
    else node.nodeValue = cssText;
    if (isIE) sheet.styleSheet.cssText = wrapper.innerHTML;
    return node;
  })(cssText);
}