av.msg.readMsg = function (ee) {
  'use strict';
  var stub = '';
  var msg = ee.data;  //passed as object rather than string so JSON.parse is not needed.
  //console.log('msg', msg);
  if ('data' == msg.type) {
    if (av.debug.userMsg) userMsgLabel.textContent = 'Avida type:data; name:' + msg.name;
    switch (msg.name) {
      case 'exportExpr':
        av.debug.log += '\n--Aui: \n' + av.utl.json2stringFn(msg);
        if ('untitled' != msg.popName) {av.fwt.popExpWrite(msg);}
        break;
      case 'paused':
        av.ptd.makePauseState();
        av.debug.log += '\n--Aui: \n' + av.utl.json2stringFn(msg);
        break;
      case 'reset':
        av.debug.log += '\n--Aui: \n' + av.utl.json2stringFn(msg);
        if (av.debug.userMsg) userMsgLabel.textContent = 'Avida: ' + msg.name;
        if (true === av.msg.uiReqestedReset) {
          av.ptd.resetDishFn();
          av.msg.uiReqestedReset = false;
        }
        break;
      case 'running':
        av.ptd.makeRunState();
        av.debug.log += '\n--Aui: \n' + av.utl.json2stringFn(msg);
        break;
      case 'runPause':
        if (true != msg['Success']) {
          if (av.debug.msg) console.log('Error: ', msg);  // msg failed
          av.ptd.runStopFn();  //flip state back since the message failed to get to Avida
        }
        av.debug.log += '\n--Aui: \n' + av.utl.json2stringFn(msg);
        break;
      case 'webOrgTraceBySequence': //reset values and call organism tracing routines.
        //console.log('webOrgTraceBySequence', msg);
        av.traceObj = msg.snapshots;
        //console.log('av.traceObj', av.traceObj);
        av.ind.cycle = 0;
        dijit.byId('orgCycle').set('value', 0);
        av.ind.cycleSlider.set('maximum', av.traceObj.length - 1);
        av.ind.cycleSlider.set('discreteValues', av.traceObj.length);
        av.ind.updateOrgTrace();
        av.debug.log += '\n--Aui: \n' + av.utl.json2stringFn(msg);
        break;
      case 'webPopulationStats':
        av.grd.popStatsMsg = msg;
        stub = 'name: webPopulationStats; update:' + msg.update.toString() + '; oldUpdate:' + av.grd.oldUpdate
             + '; fit:' + msg.ave_fitness.formatNum(2) + '; gln:' + msg.ave_gestation_time.formatNum(2)
             + '; Met:' + msg.ave_metabolic_rate.formatNum(2) + '; Num:' + msg.organisms.formatNum(2);
        av.debug.log += '\n--Aui:  ' + stub;
        if (av.grd.oldUpdate != msg.update && 0 <= msg.update) {  //use only one = as one maybe number and the other string
          av.grd.oldUpdate = msg.update;
          av.msg.updatePopStats(av.grd.popStatsMsg);
          //av.msg.sync('webPopulationStats-update:' + msg.update.toString());
          av.grd.popChartFn();
        }
        else {
          //console.log('Repeat so webPopulationStats and chart not redrawn');
          av.debug.log += '\n -     Repeat so webPopulationStats and chart not redrawn; update=', av.grd.oldUpdate;
        }
        //Is there another update? ---------------------
        av.msg.check4anotherUpdate();
        //av.debug.log += '\n - - end webPopulation: update:' + av.grd.popStatsMsg.update;
        break;
      case 'webGridData':
        av.grd.msg = msg;
        stub = 'name: webGridData; type: ' + msg.type.toString() + '; update:' + msg.update;  //may not display anyway
        av.debug.log += '\n--Aui:  ' + stub;
        //av.msg.sync('webGridData:' + msg.update.toString());
        av.grd.drawGridSetupFn();  //needs to be called always as some calculations need to happen even if nothing is displayed (for logic data)
        //av.debug.log += '\n - - end webGridData: update:' + av.grd.msg.update;
        break;
      case 'webOrgDataByCellID':
        av.msg.ByCellIDgenome = msg.genome;
        av.grd.updateSelectedOrganismType(msg);  //in messaging
        stub = 'name: webOrgDataByCellID; genotypeName: ' + msg.genotypeName.toString();  //may not display anyway
        av.debug.log += '\n--Aui:  ' + stub;
        //console.log('--Aui: webOrgDataByCellID', msg);
        break;
      default:
        if (av.debug.msg) {console.log('____________UnknownRequest: ', msg);}
        av.debug.log += '\nAui: in default in messaging on line 84 \n' + av.utl.json2stringFn(msg);   //fix format
        break;
    }
  }
  else if ('userFeedback' == msg.type) {
    av.debug.log += '\nAui: userFeedback \n' + av.utl.json2stringFn(msg);
    if (av.debug.userMsg) userMsgLabel.textContent = 'Avida userFeedback: ' + msg.level + ' at ' + av.grd.oldUpdate.toString() + ' is ' + msg.message;
    //console.log('userFeedback', msg);
    switch (msg.level) {
      case 'error':
        userMsgLabel.textContent = 'Avida error at ' + av.grd.oldUpdate.toString() + ' is ' + av.utl.json2oneLine(msg);
        //console.log('type:userFeedback; level:error');
        if (msg.isFatal) {
          //kill and restart avida worker
          restartAvidaDialog.show();
        }
        else {
          //return everything to defaults
        }
        break;
      case 'notification':
        if (av.debug.msg) console.log('avida:notify: ',msg.message);
        if (av.debug.msg) userMsgLabel.textContent = 'Avidia notification: ' + msg.message; //with splash screen no longer need ready message
        // Worked on a better splash screen gif. Used licecap, an application on the Mac to record the gif.
        // Then used http://gifmaker.me/reverser/ to make a gif in reverse time order. Then Wesley used gifsicle
        // to combine the forward and reverse gif.
        $('#splash').remove(); //hides splace screen.
        appReloadDialog.hide();
        av.ui.loadOK = true;
        if (av.debug.msg) console.log('before calling av.grd.popChartInit');
        av.grd.popChartInit();
        break;
      case 'warning':
        userMsgLabel.textContent = 'Avida warning at ' + av.grd.oldUpdate.toString() + ' is ' + av.utl.json2oneLine(msg);
        if (av.debug.msg) console.log('Avida warn: ',msg);
        break;
      case 'fatal':
        userMsgLabel.textContent = 'Avida fatal error at ' + av.grd.oldUpdate.toString() + ' is ' + av.utl.json2oneLine(msg);
        if (av.debug.msg) console.log('Avida fatal: ',msg.message);
        break;
      default:
        if (av.debug.msg) console.log('Avida unkn: level ',msg.level,'; msg=',msg.message);
        break;
    }
  }
  else if ('response' === msg.type) {
    //console.log('msg.request.type', msg.request.type);  
    if ('stepUpdate' == msg.request.type) {
      av.debug.log += '\n--Aui: type: response; request: stepUpdate; success:' + msg.success;
    }
    else {
      av.debug.log += '\n--Aui: msg.type=response\n' + av.utl.json2stringFn(msg);
    }

  }
  else av.debug.log += '\n--Aui: (else) \n' + av.utl.json2stringFn(msg);
};

av.msg.check4anotherUpdate = function () {
  'use strict';
  //console.log('newUpdate? stopflag=', av.ui.autoStopFlag, '; bar=', av.ui.autoStopValue, '; update=',av.grd.popStatsMsg.update);
  if (av.ui.autoStopFlag) {
    if (av.ui.autoStopValue <= av.grd.popStatsMsg.update) {
      //make pause state
      av.ptd.makePauseState();
      av.ui.autoStopFlag = false;      
      av.dom.autoPauseCheck.checked = false;
      if (av.ui.oneUpdateFlag) av.ui.oneUpdateFlag = false;
    }
    else {
      if (av.ui.oneUpdateFlag) {
        av.ui.oneUpdateFlag = false;
        av.ptd.makePauseState();
      }
      else {av.msg.stepUpdate();}
    }
  }
  else {
    if (av.ui.oneUpdateFlag) {
      av.ui.oneUpdateFlag = false;
      av.ptd.makePauseState();
    }
    else {av.msg.stepUpdate();}
  }
}

av.msg.stepUpdate = function () {
  'use strict';
  setTimeout(function () {
    //av.debug.log += '\n - - Update data: stepUpdate: stopRun:' + runStopButton.textContent + '; previousUpdate'
    //  + av.msg.previousUpdate  + '; popStatsupdate' + av.grd.popStatsMsg.update;
    //console.log('stepUpdate', runStopButton.textContent, '; previousUpdate', av.msg.previousUpdate, '; pop', av.grd.popStatsMsg.update);
    if ('Pause' == runStopButton.textContent) {
      av.msg.previousUpdate = av.grd.popStatsMsg.update;
      var request = {'type': 'stepUpdate'}
      av.aww.uiWorker.postMessage(request);
      av.debug.log += '\n\n--uiA: grdUpdate:' + av.msg.previousUpdate + '; ' + av.utl.jsonStringifyOneLine(request);
    }
  }, 1);  //number is time in msec for a delay
}

av.msg.importConfigExpr = function () {
  'use strict';
  var fList = ['avida.cfg'
    , 'clade.ssg'
    , 'detail.spop'
    , 'environment.cfg'
    , 'events.cfg'
    , 'instset.cfg'
    , 'update'
  ];
  var request = {
    'type': 'addEvent',
    'name': 'importExpr',
    'triggerType': 'immediate',
    'files': [
//      { 'name': 'avida.cfg', 'data': av.fzr.actConfig.file['avida.cfg'] },
//      { 'name': 'environment.cfg', 'data': av.fzr.actConfig.file['environment.cfg'] }
    ]
  };
  var lngth = fList.length;
  for (var ii = 0; ii < lngth; ii++) {
    //console.log('Config: file', ii, fList[ii])
    if (av.fzr.actConfig.file[fList[ii]]) {
      request.files.push({ 'name': fList[ii], 'data': av.fzr.actConfig.file[fList[ii]] });
    }
  }
  if (av.debug.msg) console.log('importExpr', request);
  av.aww.uiWorker.postMessage(request);
  av.debug.log += '\n--uiA: grdUpdate:' + av.msg.previousUpdate + '; \n' + av.utl.jsonStringify(request) + '  from importConfigExpr';
}

av.msg.importPopExpr = function () {
  'use strict';
  var fList = ['avida.cfg'
    , 'clade.ssg'
    , 'detail.spop'
    , 'environment.cfg'
    , 'events.cfg'
    , 'instset.cfg'
    , 'update'
  ];
  var request = {
    'type': 'addEvent',
    'name': 'importExpr',
    'triggerType': 'immediate',
    'files': [
//      { 'name': 'avida.cfg', 'data': av.fzr.actConfig.file['avida.cfg'] },
//      { 'name': 'environment.cfg', 'data': av.fzr.actConfig.file['environment.cfg'] }
    ]
  };
  //console.log('in importPopExpr: av.fzr.actConfig.file',av.fzr.actConfig.file)
  var lngth = fList.length;
  for (var ii = 0; ii < lngth; ii++) {
    if (av.fzr.actConfig.file[fList[ii]]) {request.files.push({ 'name': fList[ii], 'data': av.fzr.actConfig.file[fList[ii]] }); }
  }
  if (av.debug.msg) console.log('importExpr', request);
  av.aww.uiWorker.postMessage(request);
  av.debug.log += '\n--uiA: grdUpdate:' + av.msg.previousUpdate + '; \n' + av.utl.jsonStringify(request) + '  from importPopExpr';
}

av.msg.importWorldExpr = function () {
  'use strict';
  var fList = ['avida.cfg'
    , 'environment.cfg'
  ];
  var request = {
    'type': 'addEvent',
    'name': 'importExpr',
    'triggerType': 'immediate',
    'amend': 'true',
    'files': [
      { 'name': 'avida.cfg', 'data': av.fzr.actConfig.file['avida.cfg'] },
      { 'name': 'environment.cfg', 'data': av.fzr.actConfig.file['environment.cfg'] }
    ]
  };
  //console.log('in importWorldExpr: av.fzr.actConfig.file',av.fzr.actConfig.file)
  var lngth = fList.length;
  for (var ii = 0; ii < lngth; ii++) {
    if (av.fzr.actConfig.file[fList[ii]]) {request.files.push({ 'name': fList[ii], 'data': av.fzr.actConfig.file[fList[ii]] }); }
  }
  if (av.debug.msg) console.log('importExpr', request);
  av.aww.uiWorker.postMessage(request);
  av.debug.log += '\n--uiA: grdUpdate:' + av.msg.previousUpdate + '; \n' + av.utl.jsonStringify(request) + '  from importWorldExpr';
}

av.msg.exportExpr = function (popName) {
  'use strict';
  var request = {
    'type': 'addEvent',
    'name': 'exportExpr',
    'popName': popName,
    'triggerType': 'immediate'
  }
  av.aww.uiWorker.postMessage(request);
  av.debug.log += '\n--uiA: grdUpdate:' + av.msg.previousUpdate + '; \n' + av.utl.jsonStringify(request);
}

//fio.uiWorker function
av.msg.doOrgTrace = function () {
  'use strict';
  if (av.fzr.actOrgan.genome) {
    //console.log('in send webOrgTraceBySequence; av.fzr.actOrgan.genome', av.fzr.actOrgan.genome.length, av.fzr.actOrgan.genome);
    if ( 50 < av.fzr.actOrgan.genome.length) {
      if (av.debug.msg) console.log('doOrgTrace: fzr', av.fzr);
      var seed = 100 * Math.random();
      console.log('dom.organDemoRadio.checked =',document.getElementById('organDemoRadio').checked);
      if (document.getElementById('organDemoRadio').checked){seed = 8;}    // seed =3 => 3 mutations at 2% with a vialble offspring; 
                                                                           // seed=8 =>1 mutation at 2% with vialbe ofspring; also gets 5 mutations at 10% with a viable offspring.
      else {seed = -1}
      var request = {
        'type': 'addEvent',
        'name': 'webOrgTraceBySequence',
        'triggerType': 'immediate',
        'args': [
          //'0,heads_default,' + av.fzr.actOrgan.genome,                                  //genome string
          av.fzr.actOrgan.genome,                                  //genome string
          av.dom.orgMuteInput.value / 100,     // point mutation rate
          seed                                            //seed where 0 = random; >0 to replay that number;
        ]
      };
      if (av.debug.msg) console.log('doOrgTrace', request);
      console.log('doOrgTrace', request);
      if (av.debug.msg) console.log('doOrgTrace string', av.utl.json2stringFn(request));
      av.aww.uiWorker.postMessage(request);
      av.debug.log += '\n--uiA: grdUpdate:' + av.msg.previousUpdate + '; \n' + av.utl.jsonStringify(request);
      av.msg.sendData();
    }
  }
}

//request data from Avida to update SelectedOrganismType
av.msg.doWebOrgDataByCell = function () {
  'use strict';
  var request = {
    'type': 'addEvent',
    'name': 'WebOrgDataByCellID',
    //'triggerType': 'immediate',
    'start': 'now',
    'interval': 'always',
    'singleton': true,
    'args': av.grd.selectedNdx
  }
  av.aww.uiWorker.postMessage(request);
  av.debug.log += '\n--uiA: grdUpdate:' + av.msg.previousUpdate + '; \n' + av.utl.jsonStringify(request);
  av.msg.sendData();
  //console.log('runStopButton',runStopButton.textContent);
}

//fio.uiWorker function
av.msg.requestPopStats = function () {
  'use strict';
  var request = {
    'type': 'addEvent',
    'name': 'webPopulationStats',
    'start': 'now',
    'interval': 1
  }
  av.aww.uiWorker.postMessage(request);
  av.debug.log += '\n--uiA: grdUpdate:' + av.msg.previousUpdate + '; \n' + av.utl.jsonStringify(request);
}

av.msg.sync = function (trigger) {
  'use strict';
  var tmp = Date.now();
  var request = {
    'type': 'sync',
    'time': tmp,
    'args': trigger
  }
  av.aww.uiWorker.postMessage(request);
  var stub = 'type:sync; args:' + trigger + '; time: ' + tmp;  //may not display anyway
  av.debug.log += '\n--uiA: grdUpdate:' + av.msg.previousUpdate + ';  ' + stub;
}

av.msg.requestGridData = function () {
  'use strict';
  var request = {
    'type': 'addEvent',
    'name': 'webGridData',
    'start': 'begin',
    'interval': 1
  }
  av.aww.uiWorker.postMessage(request);
  av.debug.log += '\n--uiA: grdUpdate:' + av.msg.previousUpdate + '; \n' + av.utl.jsonStringify(request);
}

av.msg.sendData = function () {}

av.msg.sendData_real = function () {
  'use strict';
  var request;
  request = {'type': 'sendData'};
  av.aww.uiWorker.postMessage(request);
  av.debug.log += '\n--uiA: grdUpdate:' + av.msg.previousUpdate + '; \n' + av.utl.jsonStringify(request);
}

//sends message to worker to tell Avida to run/pause as a toggle.
//fio.uiWorker function
av.msg.doRunPause = function () {}
/*
av.msg.doRunPause = function () {
  'use strict';
  var request;
    request = {
      'type': 'addEvent',
      'name': 'runPause',
      'triggerType': 'immediate'
    };
  av.aww.uiWorker.postMessage(request);
}
*/

//fio.uiWorker function
av.msg.reset = function () {
  'use strict';
  av.msg.uiReqestedReset = true;
  var request = {
    'type': 'addEvent',
    'name': 'reset',
    'triggerType': 'immediate'
  };
  if (av.debug.userMsg) userMsgLabel.textContent = 'ui-->Avida: reset requested';
  av.aww.uiWorker.postMessage(request);
  av.debug.log += '\n--uiA: grdUpdate:' + av.msg.previousUpdate + '; \n' + av.utl.jsonStringify(request);
}

//Not used when handshaking is used.
av.msg.pause = function(update) {}
/*
av.msg.pause = function(update) {
  var request = {
    'type': 'addEvent',
    'name': 'pause',
    'start': update
  };
  av.aww.uiWorker.postMessage(request);
}
*/

av.msg.injectAncestors = function () {
  'use strict';
  var request;
  var lngth = av.parents.name.length;
  for (var ii = 0; ii < lngth; ii++) {
    //console.log('parents.injected', av.parents.injected[ii]);
    if (!av.parents.injected[ii]) {
      request = {
        'type': 'addEvent',
        'name': 'webInjectSequence',
        'start': 'begin',   //was begin
        'interval': 'once',
        'genome': av.parents.genome[ii],
        'start_cell_id': av.parents.AvidaNdx[ii],
        'clade_name': av.parents.name[ii]
      }
      av.aww.uiWorker.postMessage(request);
      av.debug.log += '\n--uiA: grdUpdate:' + av.msg.previousUpdate + '; \n' + av.utl.jsonStringify(request);
      //console.log('log', av.utl.json2stringFn(request));
      av.parents.injected[ii] = true;
      //console.log('parents.injected', av.parents.injected[ii]);
    }
  }
}

//---------------------------------
av.msg.updatePopStats = function (msg) {
  'use strict';
  var place = 2;
  var vari = 2;
  var adjAge=-1;;
  //update graph arrays
  if (0 <= msg.update) {  //normal start to loop
    av.pch.aveFit[msg.update] = msg.ave_fitness;
    av.pch.aveCst[msg.update] = msg.ave_gestation_time;
    av.pch.aveEar[msg.update] = msg.ave_metabolic_rate;
    av.pch.aveNum[msg.update] = msg.organisms;
    av.pch.aveVia[msg.update] = msg.viables;
    av.pch.xx[msg.update] = msg.update;

    //console.log('av.parents.name.length = ',av.parents.name.length);
    for (var ii = 0; ii<av.pch.numDads; ii++) {
      //console.log('msg.by_clade[av.parents.name[ii]]=',msg.by_clade[av.parents.name[ii]]);
      //console.log('msg.by_clade['+av.parents.name[ii]+'].fitness=', msg.by_clade[av.parents.name[ii]].fitness);
      if (undefined != msg.by_clade[av.parents.name[ii]]) {
        av.pch.dadFit[av.parents.name[ii]][msg.update] = msg.by_clade[av.parents.name[ii]].fitness;
        av.pch.dadCst[av.parents.name[ii]][msg.update] = msg.by_clade[av.parents.name[ii]].gestation;
        av.pch.dadEar[av.parents.name[ii]][msg.update] = msg.by_clade[av.parents.name[ii]].metabolism;
        av.pch.dadNum[av.parents.name[ii]][msg.update] = msg.by_clade[av.parents.name[ii]].organisms;
        av.pch.dadVia[av.parents.name[ii]][msg.update] = msg.by_clade[av.parents.name[ii]].viables;
      }
      else {
        av.pch.dadFit[av.parents.name[ii]][msg.update] = null;
        av.pch.dadCst[av.parents.name[ii]][msg.update] = null;
        av.pch.dadEar[av.parents.name[ii]][msg.update] = null;
        av.pch.dadNum[av.parents.name[ii]][msg.update] = null;
        av.pch.dadVia[av.parents.name[ii]][msg.update] = null;
      }
      //console.log('av.pch.dadfFit['+av.parents.name[ii]+']['+msg.update+']=', av.pch.dadFit[av.parents.name[ii]][msg.update]);
    }

    if (av.pch.aveFit[msg.update] > av.pch.aveMaxFit) av.pch.aveMaxFit = av.pch.aveFit[msg.update];
    if (av.pch.aveCst[msg.update] > av.pch.aveMaxCst) av.pch.aveMaxCst = av.pch.aveCst[msg.update];
    if (av.pch.aveEar[msg.update] > av.pch.aveMaxEar) av.pch.aveMaxEar = av.pch.aveEar[msg.update];
    if (av.pch.aveNum[msg.update] > av.pch.aveMaxNum) av.pch.aveMaxNum = av.pch.aveNum[msg.update];
    if (av.pch.aveVia[msg.update] > av.pch.aveMaxVia) av.pch.aveMaxVia = av.pch.aveVia[msg.update];

    av.ptd.updateLogicFn(msg.update);  //for graph data  switch to run with grid data since the data is from the grid data
  }
  TimeLabel.textContent = msg.update.formatNum(0) + ' updates';
  av.grd.updateNum = msg.update;
  popSizeLabel.textContent = msg.organisms.formatNum(0);
  aFitLabel.textContent = msg.ave_fitness.formatNum(place);
  aEnergyAcqRateLabel.textContent = msg.ave_metabolic_rate.formatNum(place);
  if (0 < msg.ave_gestation_time) {aOffspringCostLabel.textContent = msg.ave_gestation_time.formatNum(place);}
  else {aOffspringCostLabel.textContent = 'non-viable';}
    adjAge = msg.ave_age + 1;
    aAgeLabel.textContent = adjAge.formatNum(place);

  parentNumLabel.textContent = av.parents.name.length;
  //console.log('update', msg.update, '; logNum[update]',av.pch.logNum[Number(msg.update)-1], '; logNum', av.pch.logNum);

  //update viable number on webpage
  viableNumLabel.textContent = msg.viables.formatNum(0);

  notPop.textContent = msg.not;
  nanPop.textContent = msg.nand;  //these do not match
  andPop.textContent = msg.and;
  ornPop.textContent = msg.orn;
  oroPop.textContent = msg.or;
  antPop.textContent = msg.andn;
  norPop.textContent = msg.nor;
  xorPop.textContent = msg.xor;
  equPop.textContent = msg.equ;
};

av.ptd.updateLogicFn = function (mUpdate){
  'use strict';
  //console.log('in updateLogicFn: mUpdate = ', mUpdate);
  av.pch.logFitFnd = 0;
  av.pch.logCstFnd = 0;
  av.pch.logEarFnd = 0;
  av.pch.logNumFnd = 0;

  //console.log('av.ptd.allOff',av.ptd.allOff);
  if (av.ptd.allOff) {    logTit1.textContent = '';
    logTit1.textContent = '';
    logTit2.textContent = '';
    logTit3.textContent = '';
    logTit4.textContent = '';
    logTit5.textContent = '';
    logTit6.textContent = '';
    numLog.textContent = '';
    av.pch.logMaxFit = 0;
    av.pch.logMaxCst = 0;
    av.pch.logMaxEar = 0;
    av.pch.logMaxNum = 0;
    av.pch.logFit[mUpdate] = null;
    av.pch.logCst[mUpdate] = null;
    av.pch.logEar[mUpdate] = null;
    av.pch.logNum[mUpdate] = null;
  }
  else {
    logTit1.textContent = 'Number';
    logTit2.textContent = 'Performing';
    logTit3.textContent = 'All';
    logTit4.textContent = 'Selected';
    logTit5.textContent = 'Logic';
    logTit6.textContent = 'Functions';

    //console.log('out_', av.grd.logicOutline );
    //console.log('gest', av.grd.msg.gestation.data);

    //console.log('grd.msg', av.grd.msg);
    //console.log('grd.popStatsMsg', av.grd.popStatsMsg);
    ////console.log('av.grd.logicOutline', av.grd.logicOutline);  //looking at logic outline values
    var lngth =  av.grd.msg.fitness.data.length;
    for (var ii=0; ii < lngth; ii++){
      if (0 < av.grd.logicOutline[ii]) {
        av.pch.logFitFnd += av.grd.msg.fitness.data[ii];
        av.pch.logCstFnd += av.grd.msg.gestation.data[ii];
        av.pch.logEarFnd += av.grd.msg.metabolism.data[ii];
        av.pch.logNumFnd++;
      }
    }
    //console.log('NumFnd', av.pch.logNumFnd);                    //looking at logic outline values
    if (0 < av.pch.logNumFnd) {
      av.pch.logFitFnd = av.pch.logFitFnd/av.pch.logNumFnd;
      av.pch.logCstFnd = av.pch.logCstFnd/av.pch.logNumFnd;
      av.pch.logEarFnd = av.pch.logEarFnd/av.pch.logNumFnd;
    }
    av.pch.logFit[mUpdate] = av.pch.logFitFnd;
    av.pch.logCst[mUpdate] = av.pch.logCstFnd;
    av.pch.logEar[mUpdate] = av.pch.logEarFnd;
    av.pch.logNum[mUpdate] = av.pch.logNumFnd;
    numLog.textContent = av.pch.logNumFnd;
  }

  if (av.pch.logFit[mUpdate] > av.pch.logMaxFit) av.pch.logMaxFit = av.pch.logFit[mUpdate];
  if (av.pch.logCst[mUpdate] > av.pch.logMaxCst) av.pch.logMaxCst = av.pch.logCst[mUpdate];
  if (av.pch.logEar[mUpdate] > av.pch.logMaxEar) av.pch.logMaxEar = av.pch.logEar[mUpdate];
  if (av.pch.logNum[mUpdate] > av.pch.logMaxNum) av.pch.logMaxNum = av.pch.logNum[mUpdate];

  /*
  if (av.pch.logFit[mUpdate]) {
    console.log('update', mUpdate, '; Num', av.pch.logNum[mUpdate], '; Fit', av.pch.logFit[mUpdate].formatNum(0),
      '; Gnl', av.pch.logCst[mUpdate].formatNum(0), '; Met', av.pch.logEar[mUpdate].formatNum(0));
  }
  */
}

//writes out data for WebOrgDataByCellID
av.grd.updateSelectedOrganismType = function (msg) {
  'use strict';
  var prefix = '';
  if (av.debug.msg) console.log('selected_msg', msg);
  if (msg.isEstimate) prefix = 'est. ';
  else prefix = '';
  nameLabel.textContent = msg.genotypeName;
  if (null === msg.fitness) fitLabel.textContent = ' ';
  else fitLabel.textContent = prefix + msg.fitness.formatNum(2);
  if (null === msg.metabolism) energyAcqRateLabel.textContent = ' ';
  else energyAcqRateLabel.textContent = prefix + msg.metabolism.formatNum(2);
  if (null === msg.gestation) offspringCostLabel.textContent = ' ';
  else if (0 < msg.gestation) {offspringCostLabel.textContent = prefix + msg.gestation.formatNum(2);}
  else {offspringCostLabel.textContent = 'non-viable';}
  if (null == msg.age) ageLabel.textContent = ' ';
    else ageLabel.textContent = msg.age;
  if (null === msg.ancestor) {
    //console.log('av.grd.msg', av.grd.msg);
    if (av.debug.msg) console.log('msg.ancestor === null_______________________________________________________');
    if ('undefined' != typeof av.grd.msg.ancestor) {
      if (null === av.grd.msg.ancestor.data[av.grd.selectedNdx])
        ancestorLabel.textContent = ' ';
      else ancestorLabel.textContent = av.parents.name[av.grd.msg.ancestor.data[av.grd.selectedNdx]];
    }
    else ancestorLabel.textContent = ' ';
  }
  //else ancestorLabel.textContent = av.parents.name[msg.ancestor];
  else ancestorLabel.textContent = msg.ancestor;
  //add + or - to text of logic function
  if (null != msg.tasks) {
    // No longer using +/- in labels. Comment out now. Delete later
/*
    if (0 == msg.tasks.not) notLabel.textContent = 'NOT';
    else notLabel.textContent = 'not+';
    if (0 == msg.tasks.nand) nanLabel.textContent = 'NAN';
    else nanLabel.textContent = 'nan+';
    if (0 == msg.tasks.and) andLabel.textContent = 'AND';
    else andLabel.textContent = 'and+';
    if (0 == msg.tasks.orn) ornLabel.textContent = 'ORN';
    else ornLabel.textContent = 'orn+';
    if (0 == msg.tasks.or) oroLabel.textContent = 'ORO';
    else oroLabel.textContent = 'oro+';
    if (0 == msg.tasks.andn) antLabel.textContent = 'ANT';
    else antLabel.textContent = 'ant+';
    if (0 == msg.tasks.nor) norLabel.textContent = 'NOR';
    else norLabel.textContent = 'nor+';
    if (0 == msg.tasks.xor) xorLabel.textContent = 'XOR';
    else xorLabel.textContent = 'xor+';
    if (0 == msg.tasks.equ) equLabel.textContent = 'EQU';
    else equLabel.textContent = 'equ+';
    */
    //now put in the actual numbers
    notTime.textContent = msg.tasks.not;
    nanTime.textContent = msg.tasks.nand;
    andTime.textContent = msg.tasks.and;
    ornTime.textContent = msg.tasks.orn;
    oroTime.textContent = msg.tasks.or;
    antTime.textContent = msg.tasks.andn;
    norTime.textContent = msg.tasks.nor;
    xorTime.textContent = msg.tasks.xor;
    equTime.textContent = msg.tasks.equ;
  }
  else {
    notLabel.textContent = 'NOT';
    nanLabel.textContent = 'NAN';
    andLabel.textContent = 'AND';
    ornLabel.textContent = 'ORN';
    oroLabel.textContent = 'ORO';
    antLabel.textContent = 'ANT';
    norLabel.textContent = 'NOR';
    xorLabel.textContent = 'XOR';
    equLabel.textContent = 'EQU';

    notTime.textContent = '-';
    nanTime.textContent = '-';
    andTime.textContent = '-';
    ornTime.textContent = '-';
    oroTime.textContent = '-';
    antTime.textContent = '-';
    norTime.textContent = '-';
    xorTime.textContent = '-';
    equTime.textContent = '-';
  }
  if (av.debug.msg) dnaLabel.textContent = wsa(',', wsa(',', msg.genome));
  if (av.debug.msg) viableLabel.textContent = msg.isViable;
  if (0 > msg.isViable) viableLabel.textContent = 'no';
  else if (0 < msg.isViable) viableLabel.textContent = 'yes';
  else viableLabel.textContent = 'unknown';

  av.msg.fillColorBlock(msg);
  if (av.debug.msg) console.log('Kidstatus', av.grd.kidStatus);
  if ('getgenome' == av.grd.kidStatus) {
    if (av.debug.msg) console.log('in kidStatus');
    av.grd.kidStatus = 'havegenome';
    av.grd.kidName = msg.genotypeName;
    av.grd.kidGenome = msg.genome;
    if (av.debug.msg) console.log('genome',av.grd.kidGenome, '-------------------');
    dijit.byId('mnCnOrganismTrace').attr('disabled', false);
  }
}

av.msg.fillColorBlock = function (msg) {  //Draw the color block
    'use strict';
    if (av.debug.msg) console.log('in fillColorBlock');
    //if (av.debug.msg) console.log('ndx', av.grd.selectedNdx, '; msg.ancestor.data[ndx]',av.grd.msg.ancestor.data[av.grd.selectedNdx]);
    if (av.debug.msg) console.log('av.grd.fill[av.grd.selectedNdx]',av.grd.fill[av.grd.selectedNdx]);
    if ('Ancestor Organism' == dijit.byId('colorMode').value) {
      if (null === av.grd.fill[av.grd.selectedNdx]) {
        av.grd.selCtx.fillStyle = '#000'
      }
      else {
        av.grd.selCtx.fillStyle = av.parents.color[av.parents.name.indexOf(msg.ancestor)];
      }
    }
    else {
      if (null === av.grd.fill[av.grd.selectedNdx]) {
        if (null === av.grd.msg.ancestor.data[av.grd.selectedNdx]) av.grd.selCtx.fillStyle = '#000';
        else av.grd.selCtx.fillStyle = '#888';
      }
      else if (0 == av.grd.fill[av.grd.selectedNdx]) av.grd.selCtx.fillStyle = av.color.defaultKidColor;
      else {  //get_color0 = function(cmap, dx, d1, d2)
        av.grd.selCtx.fillStyle = get_color0(av.grd.cmap, av.grd.fill[av.grd.selectedNdx], 0, av.grd.fillmax);
        //console.log('fillStyle', get_color0(av.grd.cmap, av.grd.fill[ii], 0, av.grd.fillmax));
      }
    }
    if (av.debug.msg) console.log('color', av.grd.selCtx.fillStyle);
    av.grd.selCtx.fillRect(0, 0, av.grd.SelectedWd, av.grd.SelectedHt);

  }

// ------------------------------------------------ not in use ---------------------------------------------------------
/*
function doDbReady(fio) {
  'use strict';
  var request = {
    'type': 'dbReady'
  };
  av.aww.uiWorker.postMessage(request);
}
*/
/* web pages related to killing re-starting a web-worker
 http://www.w3schools.com/html/html5_webworkers.asp
 http://stackoverflow.com/questions/29181021/how-to-stop-javascript-in-webworker-from-outside
 */

