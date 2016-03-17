av.msg.readMsg = function (ee) {
  var msg = ee.data;  //passed as object rather than string so JSON.parse is not needed.
  if ('data' == msg.type) {
    userMsg2Label.textContent = 'Avida message name: ' + msg.name;
    switch (msg.name) {
      case 'paused':
        //console.log('about to call av.ptd.makePauseState()');
        //av.debug.log += '\nabout to call av.ptd.makePauseState() in messaging.js line 7 \n';
        av.ptd.makePauseState();
        av.debug.log += '\nAvida --> ui \n' + av.utl.json2stringFn(msg);
        break;
      case 'running':
        //console.log('about to call av.ptd.makePauseState()');
        //av.debug.log += '\nabout to call av.ptd.makeRunState() in messaging.js line 13 \n';
        av.ptd.makeRunState();
        av.debug.log += '\nAvida --> ui \n' + av.utl.json2stringFn(msg);
        break;
      case 'reset':
        av.debug.log += '\nAvida --> ui \n' + av.utl.json2stringFn(msg);
        //userMsgLabel.textContent = 'Avida message name: ' + msg.name;
        break;
      case 'runPause':
        if (true != msg["Success"]) {
          if (av.debug.msg) console.log("Error: ", msg);  // msg failed
          runStopFn();  //flip state back since the message failed to get to Avida
        }
        av.debug.log += '\nAvida --> ui \n' + av.utl.json2stringFn(msg);
        break;
      case 'webOrgTraceBySequence': //reset values and call organism tracing routines.
        av.traceObj = msg.snapshots;
        av.ind.cycle = 0;
        dijit.byId("orgCycle").set("value", 0);
        av.ind.cycleSlider.set("maximum", av.traceObj.length - 1);
        av.ind.cycleSlider.set("discreteValues", av.traceObj.length);
        av.ind.updateOrgTrace();
        //console.log('webOrgTraceBySequence', msg);
        av.debug.log += '\nAvida --> ui \n' + av.utl.json2stringFn(msg);
        break;
      case 'webPopulationStats':
        av.grd.popStatsMsg = msg;
        av.msg.updatePopStats(av.grd.popStatsMsg);
        //if ((1000 < msg.update) || (msg.update % 10 < 1)) {av.grd.popChartFn();}
        av.grd.popChartFn();
        if (av.debug.msgOrder) console.log('webPopulationStats update length', msg.update.formatNum(0), av.ptd.aveFit.length);
        var stub = 'name: ' + msg.name.toString() + '; update: ' + msg.update.toString();  //may not display anyway
        av.debug.log += '\nAvida --> ui:  ' + stub;
        break;
      case 'webGridData':
        //mObj=JSON.parse(JSON.stringify(jsonObject));
        av.grd.msg = msg;
        av.grd.drawGridSetupFn();
        if (av.debug.msgOrder) console.log('webGridData length', av.ptd.aveFit.length);
        //if (av.debug.msgOrder) console.log('ges',av.grd.msg.gestation.data);
        //if (av.debug.msgOrder) console.log('anc',av.grd.msg.ancestor.data);
        if (av.debug.msgOrder) console.log('nan',av.grd.msg.nand.data);
        if (av.debug.msgOrder) console.log('out',av.grd.out);
        var stub = 'name: ' + msg.name.toString() + '; type: ' + msg.type.toString();  //may not display anyway
        av.debug.log += '\nAvida --> ui:  ' + stub;
        break;
      case 'webOrgDataByCellID':
        //if ('undefined' != typeof av.grd.msg.ancestor) {console.log('webOrgDataByCellID anc',av.grd.msg.ancestor.data);}
        av.grd.updateSelectedOrganismType(msg);  //in messaging
        var stub = 'name: ' + msg.name.toString() + '; genotypeName: ' + msg.genotypeName.toString();  //may not display anyway
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
    av.debug.log += '\nAvida --> ui on line 74 \n' + av.utl.json2stringFn(msg);
    //console.log('userFeedback', msg);
    switch (msg.level) {
      case 'error':
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
        userMsgLabel.textContent = 'Avidia notification: ' + msg.message;
        break;
      case 'warning':
        if (av.debug.msg) console.log('Avida warn: ',msg);
        break;
      case 'fatal':
        if (av.debug.msg) console.log('Avida fatal: ',msg.message);
        break;
      default:
        if (av.debug.msg) console.log('Avida unkn: level ',msg.level,'; msg=',msg.message);
        break;
    }
  }
  else av.debug.log += '\nAvida --> ui line88 \n' + av.utl.json2stringFn(msg);
};

/* web pages related to killing re-starting a web-worker
 http://www.w3schools.com/html/html5_webworkers.asp
 http://stackoverflow.com/questions/29181021/how-to-stop-javascript-in-webworker-from-outside
 */


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
  //console.log('importConfigExpr', av.fzr.actConfig.file);
  //for (var fnm in av.fzr.actConfig.file) { console.log('av.fzr.actConfig.file', fnm);}
  var lngth = fList.length;
  for (var ii = 0; ii < lngth; ii++) {
    console.log('Config: file', ii, fList[ii])
    if (av.fzr.actConfig.file[fList[ii]]) {
      request.files.push({ 'name': fList[ii], 'data': av.fzr.actConfig.file[fList[ii]] });
    }
  }
  if (av.debug.msg) console.log('importExpr', request);
  av.fio.uiWorker.postMessage(request);
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
  av.fio.uiWorker.postMessage(request);
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
  console.log('in importWorldExpr: av.fzr.actConfig.file',av.fzr.actConfig.file)
  var lngth = fList.length;
  for (var ii = 0; ii < lngth; ii++) {
    if (av.fzr.actConfig.file[fList[ii]]) {request.files.push({ 'name': fList[ii], 'data': av.fzr.actConfig.file[fList[ii]] }); }
  }
  if (av.debug.msg) console.log('importExpr', request);
  av.fio.uiWorker.postMessage(request);
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
  av.fio.uiWorker.postMessage(request);
  av.debug.log += '\nui --> Avida \n' + av.utl.json2stringFn(request);
}

//request data from Avida to update SelectedOrganismType
av.msg.doWebOrgDataByCell = function () {
  'use strict';
  var request = {
    'type': 'addEvent',
    'name': 'WebOrgDataByCellID',
    //'singleton': true,
    'args': av.grd.selectedNdx
  }
  console.log('doSelectedOrganismType; selectedNdx', av.grd.selectedNdx)
  av.fio.uiWorker.postMessage(request);
  av.debug.log += '\nui --> Avida \n' + av.utl.json2stringFn(request);
  console.log('runStopButton',document.getElementById("runStopButton").textContent);
  if ('Run' === document.getElementById("runStopButton").textContent) {
    var request = {
      'triggerType': 'immediate',
      'name': 'WebOrgDataByCellID',
      //'singleton': true,
      'args': av.grd.selectedNdx
    }
    av.fio.uiWorker.postMessage(request);
    av.debug.log += '\nui --> Avida \n' + av.utl.json2stringFn(request);
  }

}

//fio.uiWorker function
av.msg.requestPopStats = function () {
  'use strict';
  var request = {
    'type': 'addEvent',
    'name': 'webPopulationStats',
    'start': 'now',
    'interval': 'always'
  }
  av.fio.uiWorker.postMessage(request);
  av.debug.log += '\nui --> Avida \n' + av.utl.json2stringFn(request);
}

av.msg.requestGridData = function () {
  'use strict';
  var request = {
    'type': 'addEvent',
    'name': 'webGridData',
    'start': 'begin',
    'interval': 'always'
  }
  av.fio.uiWorker.postMessage(request);
  av.debug.log += '\nui --> Avida \n' + av.utl.json2stringFn(request);
}

//sends message to worker to tell Avida to run/pause as a toggle.
//fio.uiWorker function
av.msg.doRunPause = function (fio) {
  'use strict';
  var request;
    request = {
      'type': 'addEvent',
      'name': 'runPause',
      'triggerType': 'immediate'
    };
  av.fio.uiWorker.postMessage(request);
  av.debug.log += '\nui --> Avida \n' + av.utl.json2stringFn(request);
}

//fio.uiWorker function
av.msg.reset = function () {
  'use strict';
  var request = {
    'type': 'addEvent',
    'name': 'reset',
    'triggerType': 'immediate'
  };
  av.fio.uiWorker.postMessage(request);
  av.debug.log += '\nui --> Avida \n' + av.utl.json2stringFn(request);
}

av.msg.pause = function(update) {
  var request = {
    'type': 'addEvent',
    'name': 'pause',
    'start': update
  };
  av.fio.uiWorker.postMessage(request);
  av.debug.log += '\nui --> Avida \n' + av.utl.json2stringFn(request);
}

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
    av.fio.uiWorker.postMessage(request);
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
    av.fio.uiWorker.postMessage(request);
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
  //if (0 <= msg.update) {  //normal start to loop
  if (false) {  //no data here to test for size increase without these arrays growing.
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
  else document.getElementById("ancestorLabel").textContent = av.parents.name[msg.ancestor];
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
  if (av.debug.msg) document.getElementById("dnaLabel").textContent = wsa(",", wsa(",", msg.genome));
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
    if (av.debug.msg) console.log('ndx', av.grd.selectedNdx, '; msg.ancestor.data[ndx]',av.grd.msg.ancestor.data[av.grd.selectedNdx]);
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
function doDbReady(fio) {
  'use strict';
  var request = {
    'type': 'dbReady'
  };
  av.fio.uiWorker.postMessage(request);
  av.debug.log += '\nui --> Avida \n' + av.utl.json2stringFn(request);
}
