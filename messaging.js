av.msg.readMsg = function (ee) {
  'use strict';
  var stub = '';
  var msg = ee.data;  //passed as object rather than string so JSON.parse is not needed.
  //console.log('msg', msg);
  if ('data' == msg.type) {
    if (av.debug.userMsg) userMsgLabel.textContent = 'Avida type:data; name:' + msg.name;
    switch (msg.name) {
      case 'exportExpr':
        av.debug.log += '\nAvida --> ui \n' + av.utl.json2stringFn(msg);
        if ('untitled' != msg.popName) {
          av.fwt.popExpWrite(msg);
        }
        break;
      case 'paused':
        av.ptd.makePauseState();
        av.debug.log += '\nAvida --> ui \n' + av.utl.json2stringFn(msg);
        break;
      case 'reset':
        av.debug.log += '\nAvida --> ui \n' + av.utl.json2stringFn(msg);
        if (av.debug.userMsg) userMsgLabel.textContent = 'Avida: ' + msg.name;
        if (true === av.msg.uiReqestedReset) {
          av.ptd.resetDishFn();
          av.msg.uiReqestedReset = false;
        }
        break;
      case 'running':
        av.ptd.makeRunState();
        av.debug.log += '\nAvida --> ui \n' + av.utl.json2stringFn(msg);
        break;
      case 'runPause':
        if (true != msg["Success"]) {
          if (av.debug.msg) console.log("Error: ", msg);  // msg failed
          av.ptd.runStopFn();  //flip state back since the message failed to get to Avida
        }
        av.debug.log += '\nAvida --> ui \n' + av.utl.json2stringFn(msg);
        break;
      case 'webOrgTraceBySequence': //reset values and call organism tracing routines.
        //console.log('webOrgTraceBySequence', msg);
        av.traceObj = msg.snapshots;
        //console.log('av.traceObj', av.traceObj);
        av.ind.cycle = 0;
        dijit.byId("orgCycle").set("value", 0);
        av.ind.cycleSlider.set("maximum", av.traceObj.length - 1);
        av.ind.cycleSlider.set("discreteValues", av.traceObj.length);
        av.ind.updateOrgTrace();
        av.debug.log += '\nAvida --> ui \n' + av.utl.json2stringFn(msg);
        break;
      case 'webPopulationStats':
        av.grd.popStatsMsg = msg;
        stub = 'name: ' + msg.name.toString() + '; update:' + msg.update.toString() + '; oldUpdate:' + av.grd.oldUpdate
             + '; fit:' + msg.ave_fitness.formatNum(2) + '; gln:' + msg.ave_gestation_time.formatNum(2)
             + '; Met:' + msg.ave_metabolic_rate.formatNum(2) + '; Num:' + msg.organisms.formatNum(2);
        av.debug.log += '\nAvida --> ui:  ' + stub;
        if (av.grd.oldUpdate != msg.update) {  //use only one = as one maybe number and the other string
          av.grd.oldUpdate = msg.update;
          av.msg.updatePopStats(av.grd.popStatsMsg);
          av.msg.sync('webPopulationStats-update:' + msg.update.toString());
          av.grd.popChartFn();
        }
        else {
          console.log('Repeat so webPopulationStats and chart not redrawn');
          av.debug.log += '\n -     Repeat so webPopulationStats and chart not redrawn; update=', av.grd.oldUpdate;
        }

        //Is there another update
        //console.log('newUpdate? stopflag=', av.ui.autoStopFlag, '; bar=', av.ui.autoStopValue, '; update=',av.grd.popStatsMsg.update);
        if (av.ui.autoStopFlag) {
          if (av.ui.autoStopValue <= av.grd.popStatsMsg.update) {
            //make pause state
            av.ptd.makePauseState();
            av.ui.autoStopFlag = false;
            dijit.byId("manualUpdateRadio").set('checked', true);
            dijit.byId("autoUpdateRadio").set('checked', false);
          }
          else {
            av.debug.log += '\n - - update('+ av.grd.popStatsMsg.update +') < bar(' + av.ui.autoStopValue + ')';
            av.msg.stepUpdate();
          }
        }
        else {
          av.debug.log += '\n - - autoStopFlag=false; update:' + av.grd.popStatsMsg.update;
          av.msg.stepUpdate();
        }
        av.debug.log += '\n - - end webPopulation: update:' + av.grd.popStatsMsg.update;
        break;
      case 'webGridData':
        av.grd.msg = msg;
        stub = 'name: ' + msg.name.toString() + '; type: ' + msg.type.toString() + '; update:' + msg.update;  //may not display anyway
        av.debug.log += '\nAvida --> ui:  ' + stub;
        av.msg.sync('webGridData:' + msg.update.toString());
        if ('populationBlock' === av.ui.page && 'map' === av.ui.subpage) {
          av.debug.log += '\n -Call drawGridSetupFn';
          av.grd.drawGridSetupFn();
        }
        av.debug.log += '\n - - end webGridData: update:' + av.grd.msg.update;
        break;
      case 'webOrgDataByCellID':
        av.msg.ByCellIDgenome = msg.genome;
        av.grd.updateSelectedOrganismType(msg);  //in messaging
        stub = 'name: ' + msg.name.toString() + '; genotypeName: ' + msg.genotypeName.toString();  //may not display anyway
        av.debug.log += '\nAvida --> ui:  ' + stub;
        //console.log('Avida --> ui webOrgDataByCellID', msg);
        break;
      default:
        if (av.debug.msg) console.log('____________UnknownRequest: ', msg);
        av.debug.log += '\nAvida --> ui in default in messaging on line 69 \n' + av.utl.json2stringFn(msg);
        break;
    }
  }
  else if ('userFeedback' == msg.type) {
    av.debug.log += '\nAvida --> ui: userFeedback \n' + av.utl.json2stringFn(msg);
    if (av.debug.userMsg) userMsgLabel.textContent = 'Avida userFeedback: ' + msg.level + ' at ' + av.grd.oldUpdate.toString() + ' is ' + msg.message;
    //console.log('userFeedback', msg);
    switch (msg.level) {
      case 'error':
        userMsgLabel.textContent = 'Avida error at ' + av.grd.oldUpdate.toString() + ' is ' + av.utl.json2oneLine(msg);
        console.log('type:userFeedback; level:error');
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
        // used to reverse the gif that is in the splash screen http://gifmaker.me/reverser/
        $('#splash').remove(); //hides splace screen.
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
    if ('sync' !== msg.request.type) {
      av.debug.log += '\nAvida --> ui: type: response; request: sync; success:' + msg.request.success;
    }
    else if ('stepUpdate' !== msg.request.type) {
      av.debug.log += '\nAvida --> ui: type: response; request: stepUpdate; success:' + msg.request.success;
    }
  }
  else av.debug.log += '\nAvida --> ui (else) \n' + av.utl.json2stringFn(msg) + 'endelse';
};

av.msg.stepUpdate = function () {
  'use strict';
  setTimeout(function () {
    av.debug.log += '\n - - Update data: stepUpdate: stopRun:' + document.getElementById("runStopButton").innerHTML + '; previousUpdate'
      + av.msg.previousUpdate  + '; popStatsupdate' + av.grd.popStatsMsg.update;
    //console.log('stepUpdate', document.getElementById("runStopButton").innerHTML, '; previousUpdate', av.msg.previousUpdate, '; pop', av.grd.popStatsMsg.update);
    if ("Pause" == document.getElementById("runStopButton").innerHTML) {
      av.msg.previousUpdate = av.grd.popStatsMsg.update;
      var request = {'type': 'stepUpdate'}
      av.aww.uiWorker.postMessage(request);
      av.debug.log += '\nui --> Avida: grdUpdate:' + av.msg.previousUpdate + '; ' + av.utl.json2stringFn(request);
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
  av.debug.log += '\nui --> Avida: importConfigExpr \n' + av.utl.json2stringFn(request);
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
  av.debug.log += '\nui --> Avida: inportPopExpr \n' + av.utl.json2stringFn(request);
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
//      { 'name': 'avida.cfg', 'data': av.fzr.actConfig.file['avida.cfg'] },
//      { 'name': 'environment.cfg', 'data': av.fzr.actConfig.file['environment.cfg'] }
    ]
  };
  //console.log('in importWorldExpr: av.fzr.actConfig.file',av.fzr.actConfig.file)
  var lngth = fList.length;
  for (var ii = 0; ii < lngth; ii++) {
    if (av.fzr.actConfig.file[fList[ii]]) {request.files.push({ 'name': fList[ii], 'data': av.fzr.actConfig.file[fList[ii]] }); }
  }
  if (av.debug.msg) console.log('importExpr', request);
  av.aww.uiWorker.postMessage(request);
  av.debug.log += '\nui --> Avida: importWorldExpr \n' + av.utl.json2stringFn(request);
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
  av.debug.log += '\nui --> Avida: importWorldExpr \n' + av.utl.json2stringFn(request);
}
//fio.uiWorker function
av.msg.doOrgTrace = function () {
  'use strict';
  if (av.debug.msg) console.log('doOrgTrace: fzr', av.fzr);
  var seed = 100 * Math.random();
  if (dijit.byId("OrganDemoRadio").get('checked', true)) {seed = 0; }
  else {seed = -1};
  var request = {
    'type': 'addEvent',
    'name': 'webOrgTraceBySequence',
    'triggerType': 'immediate',
    'args': [
      //'0,heads_default,' + av.fzr.actOrgan.genome,                                  //genome string
      av.fzr.actOrgan.genome,                                  //genome string
      dijit.byId("orMuteInput").get('value')/100,     // point mutation rate
      seed                                            //seed where 0 = random; >0 to replay that number
    ]
  };
  if (av.debug.msg) console.log('trace', request);
  if (av.debug.msg) console.log('doOrgTrace', request);
  if (av.debug.msg) console.log('doOrgTrace string', av.utl.json2stringFn(request));
  av.aww.uiWorker.postMessage(request);
  av.debug.log += '\nui --> Avida \n' + av.utl.json2stringFn(request);
  av.msg.sendData();
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
  av.debug.log += '\nui --> Avida \n' + av.utl.json2stringFn(request);
  av.msg.sendData();
  //console.log('runStopButton',document.getElementById("runStopButton").textContent);
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
  av.debug.log += '\nui --> Avida \n' + av.utl.json2stringFn(request);
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
  av.debug.log += '\nui --> Avida:  ' + stub;
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
  av.debug.log += '\nui --> Avida \n' + av.utl.json2stringFn(request);
}

av.msg.sendData = function () {}

av.msg.sendData_real = function () {
  'use strict';
  var request;
  request = {'type': 'sendData'};
  av.aww.uiWorker.postMessage(request);
  av.debug.log += '\nui --> Avida \n' + av.utl.json2stringFn(request);
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
  av.debug.log += '\nui --> Avida \n' + av.utl.json2stringFn(request);
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
  av.debug.log += '\nui --> Avida \n' + av.utl.json2stringFn(request);
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
  av.debug.log += '\nui --> Avida \n' + av.utl.json2stringFn(request);
}
*/

av.msg.injectAncestors_old  = function (fio, parents) { //tiba delete
  'use strict';
  var request;
  var lngth = av.parents.name.length;
  for (var ii = 0; ii < lngth; ii++) {
    request = {
      'type': 'addEvent',
      'name': 'injectSequence',
      'start': 'now',   //was begin
      'interval': 'once',
      'args': [
        av.parents.genome[ii],           //'wzcagcccccccccccccccccccccccccccccccccccczvfcaxgab',  //genome_sequence,
        av.parents.AvidaNdx[ii], //cell_start,
        -1, //cell_end,
        -1, //default_merit,
        ii, // lineage_label,  @ancestor
        0 //neutral_metric
      ]
    }
    av.aww.uiWorker.postMessage(request);
    av.debug.log += '\nui --> Avida \n' + av.utl.json2stringFn(request);
  }
}

av.msg.injectAncestors = function () {
  'use strict';
  var request;
  var lngth = av.parents.name.length;
  for (var ii = 0; ii < lngth; ii++) {
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
    av.debug.log += '\nui --> Avida \n' + av.utl.json2stringFn(request);
  }
}

//---------------------------------
av.msg.updatePopStats = function (msg) {
  'use strict';
  var place = 2;
  //document.getElementById("TimeLabel").textContent = msg.update.formatNum(0) + " updates";
  TimeLabel.textContent = msg.update.formatNum(0) + " updates";
  av.grd.updateNum = msg.update;
  document.getElementById("popSizeLabel").textContent = msg.organisms.formatNum(0);
  document.getElementById("aFitLabel").textContent = msg.ave_fitness.formatNum(2);
  if (msg.ave_metabolic_rate > 1000) place = 0;
  else if (msg.ave_metabolic_rate > 100) place = 1;
  document.getElementById("aMetabolicLabel").textContent = msg.ave_metabolic_rate.formatNum(place);
  document.getElementById("aGestateLabel").textContent = msg.ave_gestation_time.formatNum(1);
  document.getElementById("aAgeLabel").textContent = msg.ave_age.formatNum(2);
  document.getElementById("notPop").textContent = msg.not;
  document.getElementById("nanPop").textContent = msg.nand;  //these do not match
  document.getElementById("andPop").textContent = msg.and;
  document.getElementById("ornPop").textContent = msg.orn;
  document.getElementById("oroPop").textContent = msg.or;
  document.getElementById("antPop").textContent = msg.andn;
  document.getElementById("norPop").textContent = msg.nor;
  document.getElementById("xorPop").textContent = msg.xor;
  document.getElementById("equPop").textContent = msg.equ;
  //update graph arrays
  /*
  if (0 <= msg.update) {  //normal start to loop
    av.ptd.aveFit[msg.update] = msg.ave_fitness;
    av.ptd.aveGnl[msg.update] = msg.ave_gestation_time;
    av.ptd.aveMet[msg.update] = msg.ave_metabolic_rate;
    av.ptd.aveNum[msg.update] = msg.organisms;
    updateLogicAve(msg);  //for graph data
  }
*/
  if (0 <= msg.update) {  //normal start to loop
    av.ptd.aveFit.push(msg.ave_fitness);
    av.ptd.aveGnl.push(msg.ave_gestation_time);
    av.ptd.aveMet.push(msg.ave_metabolic_rate);
    av.ptd.aveNum.push(msg.organisms);
    updateLogicAve(msg);  //for graph data
  }
}

updateLogicAve = function (msg){
  'use strict';
  if (av.ptd.allOff) {
    av.ptd.logFit[msg.update] = null;
    av.ptd.logGnl[msg.update] = null;
    av.ptd.logMet[msg.update] = null;
    av.ptd.logNum[msg.update] = null;
  }
  else {
    av.ptd.logFit[msg.update] = 0;
    av.ptd.logGnl[msg.update] = 0;
    av.ptd.logMet[msg.update] = 0;
    av.ptd.logNum[msg.update] = 0;
    //console.log('out_', av.grd.out );
    //console.log('gest', av.grd.msg.gestation.data);
    var lngth = av.grd.out.length;
    for (var ii=0; ii < lngth; ii++){
      if (0 < av.grd.out[ii]) {
        av.ptd.logFit[msg.update] += av.grd.msg.fitness.data[ii];
        av.ptd.logGnl[msg.update] += av.grd.msg.gestation.data[ii];
        av.ptd.logMet[msg.update] += av.grd.msg.metabolism.data[ii];
        av.ptd.logNum[msg.update]++;
      }
    }
    if (0 < av.ptd.logNum[msg.update]) {
      av.ptd.logFit[msg.update] = av.ptd.logFit[msg.update]/av.ptd.logNum[msg.update];
      av.ptd.logGnl[msg.update] = av.ptd.logGnl[msg.update]/av.ptd.logNum[msg.update];
      av.ptd.logMet[msg.update] = av.ptd.logMet[msg.update]/av.ptd.logNum[msg.update];
    }
  }
}

//writes out data for WebOrgDataByCellID
av.grd.updateSelectedOrganismType = function (msg) {
  'use strict';
  var prefix = '';
  if (av.debug.msg) console.log('selected_msg', msg);
  if (msg.isEstimate) prefix = "est. ";
  else prefix = '';
  document.getElementById("nameLabel").textContent = msg.genotypeName;
  if (null === msg.fitness) document.getElementById("fitLabel").innerHTML = '-';
  else document.getElementById("fitLabel").innerHTML = prefix + msg.fitness.formatNum(2);
  if (null === msg.metabolism) document.getElementById("metabolicLabel").textContent = '-';
  else document.getElementById("metabolicLabel").textContent = prefix + msg.metabolism.formatNum(2);
  if (null === msg.gestation) document.getElementById("generateLabel").textContent = '-';
  else  document.getElementById("generateLabel").textContent = prefix + msg.gestation.formatNum(2);
  if (null == msg.age) document.getElementById("ageLabel").textContent = '-';
    else document.getElementById("ageLabel").textContent = msg.age;
  if (null === msg.ancestor) {
    //console.log('av.grd.msg', av.grd.msg);
    if (av.debug.msg) console.log('msg.ancestor === null_______________________________________________________');
    if ('undefined' != typeof av.grd.msg.ancestor) {
      if (null === av.grd.msg.ancestor.data[av.grd.selectedNdx])
        document.getElementById("ancestorLabel").textContent = '-';
      else document.getElementById("ancestorLabel").textContent = av.parents.name[av.grd.msg.ancestor.data[av.grd.selectedNdx]];
    }
    else document.getElementById("ancestorLabel").textContent = '-';
  }
  //else document.getElementById("ancestorLabel").textContent = av.parents.name[msg.ancestor];
  else document.getElementById("ancestorLabel").textContent = msg.ancestor;
  //add + or - to text of logic function
  if (null != msg.tasks) {
    if (0 == msg.tasks.not) document.getElementById("notLabel").textContent = "not-";
    else document.getElementById("notLabel").textContent = "not+";
    if (0 == msg.tasks.nand) document.getElementById("nanLabel").textContent = "nan-";
    else document.getElementById("nanLabel").textContent = "nan+";
    if (0 == msg.tasks.and) document.getElementById("andLabel").textContent = "and-";
    else document.getElementById("andLabel").textContent = "and+";
    if (0 == msg.tasks.orn) document.getElementById("ornLabel").textContent = "orn-";
    else document.getElementById("ornLabel").textContent = "orn+";
    if (0 == msg.tasks.or) document.getElementById("oroLabel").textContent = "oro-";
    else document.getElementById("oroLabel").textContent = "oro+";
    if (0 == msg.tasks.andn) document.getElementById("antLabel").textContent = "ant-";
    else document.getElementById("antLabel").textContent = "ant+";
    if (0 == msg.tasks.nor) document.getElementById("norLabel").textContent = "nor-";
    else document.getElementById("norLabel").textContent = "nor+";
    if (0 == msg.tasks.xor) document.getElementById("xorLabel").textContent = "xor-";
    else document.getElementById("xorLabel").textContent = "xor+";
    if (0 == msg.tasks.equ) document.getElementById("equLabel").textContent = "equ-";
    else document.getElementById("equLabel").textContent = "equ+";
    //now put in the actual numbers
    document.getElementById("notTime").textContent = msg.tasks.not;
    document.getElementById("nanTime").textContent = msg.tasks.nand;
    document.getElementById("andTime").textContent = msg.tasks.and;
    document.getElementById("ornTime").textContent = msg.tasks.orn;
    document.getElementById("oroTime").textContent = msg.tasks.or;
    document.getElementById("antTime").textContent = msg.tasks.andn;
    document.getElementById("norTime").textContent = msg.tasks.nor;
    document.getElementById("xorTime").textContent = msg.tasks.xor;
    document.getElementById("equTime").textContent = msg.tasks.equ;
  }
  else {
    document.getElementById("notLabel").textContent = "not-";
    document.getElementById("nanLabel").textContent = "nan-";
    document.getElementById("andLabel").textContent = "and-";
    document.getElementById("ornLabel").textContent = "orn-";
    document.getElementById("oroLabel").textContent = "oro-";
    document.getElementById("antLabel").textContent = "ant-";
    document.getElementById("norLabel").textContent = "nor-";
    document.getElementById("xorLabel").textContent = "xor-";
    document.getElementById("equLabel").textContent = "equ-";

    document.getElementById("notTime").textContent = '-';
    document.getElementById("nanTime").textContent = '-';
    document.getElementById("andTime").textContent = '-';
    document.getElementById("ornTime").textContent = '-';
    document.getElementById("oroTime").textContent = '-';
    document.getElementById("antTime").textContent = '-';
    document.getElementById("norTime").textContent = '-';
    document.getElementById("xorTime").textContent = '-';
    document.getElementById("equTime").textContent = '-';
  }
  if (av.debug.msg) dnaLabel.textContent = wsa(",", wsa(",", msg.genome));
  if (av.debug.msg) viableLabel.textContent = 'Viable: ' + msg.isViable;
  else if (0 > msg.isViable) viableLabel.textContent = 'Viable: no';
  else if (0 < msg.isViable) viableLabel.textContent = 'Viable: yes';
  else viableLabel.textContent = 'Viable: unknown';
  av.msg.fillColorBlock(msg);
  if (av.debug.msg) console.log('Kidstatus', av.grd.kidStatus);
  if ('getgenome' == av.grd.kidStatus) {
    if (av.debug.msg) console.log('in kidStatus');
    av.grd.kidStatus = "havegenome";
    av.grd.kidName = msg.genotypeName;
    av.grd.kidGenome = msg.genome;
    if (av.debug.msg) console.log('genome',av.grd.kidGenome, '-------------------');
    dijit.byId("mnCnOrganismTrace").attr("disabled", false);
  }
}

av.msg.fillColorBlock = function (msg) {  //Draw the color block
    'use strict';
    if (av.debug.msg) console.log('in fillColorBlock');
    //if (av.debug.msg) console.log('ndx', av.grd.selectedNdx, '; msg.ancestor.data[ndx]',av.grd.msg.ancestor.data[av.grd.selectedNdx]);
    if (av.debug.msg) console.log('av.grd.fill[av.grd.selectedNdx]',av.grd.fill[av.grd.selectedNdx]);
    if ("Ancestor Organism" == dijit.byId("colorMode").value) {
      if (null === av.grd.fill[av.grd.selectedNdx]) {
        av.grd.selCtx.fillStyle = '#000'
      }
      else {
        av.grd.selCtx.fillStyle = av.parents.color[av.grd.fill[av.grd.selectedNdx]]
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
  av.debug.log += '\nui --> Avida \n' + av.utl.json2stringFn(request);
}
*/
/* web pages related to killing re-starting a web-worker
 http://www.w3schools.com/html/html5_webworkers.asp
 http://stackoverflow.com/questions/29181021/how-to-stop-javascript-in-webworker-from-outside
 */

