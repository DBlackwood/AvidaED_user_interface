
av.msg.importExpr = function () {
  'use strict';
  var request = {
    'type': 'addEvent',
    'name': 'importExpr',
    'trigger': 'immediate',
    'files': [
      { 'name': 'avida.cfg', 'data': av.fzr.file['cfg/avida.cfg'] },
      { 'name': 'environment.cfg', 'data': av.fzr.file['cfg/environment.cfg'] }
    ]
  };
  if (av.debug.msg) console.log('importExpr', request);
  console.log('importExpr', request);
  av.fio.uiWorker.postMessage(request);
  av.debug.log += '\nui --> Avida \n' + av.utl.json2stringFn(request);
}

//fio.uiWorker function
function doOrgTrace(fio, fzr) {
  'use strict';
  console.log('doOrgTrace: fzr', fzr);
  var seed = 100 * Math.random();
  if (dijit.byId("OrganDemoRadio").get('checked', true)) {seed = 0; }
  else {seed = -1};
  var request = {
    'type': 'addEvent',
    'name': 'webOrgTraceBySequence',
    'triggerType': 'immediate',
    'args': [
      //'0,heads_default,' + fzr.actOrgan.genome,                                  //genome string
      fzr.actOrgan.genome,                                  //genome string
      dijit.byId("orMuteInput").get('value')/100,     // point mutation rate
      seed                                            //seed where 0 = random; >0 to replay that number
    ]
  };
  if (av.debug.msg) console.log('trace', request);
  console.log('doOrgTrace', request);
  console.log('doOrgTrace string', av.utl.json2stringFn(request));
  av.fio.uiWorker.postMessage(request);
  av.debug.log += '\nui --> Avida \n' + av.utl.json2stringFn(request);
}

//request data from Avida to update SelectedOrganismType
function doSelectedOrganismType(fio, grd) {
  'use strict';
  var request = {
    'type': 'addEvent',
    'name': 'WebOrgDataByCellID',
    //'singleton': true,
    'args': grd.selectedNdx
  }
  if (av.debug.msg) console.log('doSelectedOrganismType; selectedNdx', grd.selectedNdx)
  av.fio.uiWorker.postMessage(request);
  av.debug.log += '\nui --> Avida \n' + av.utl.json2stringFn(request);
}

//fio.uiWorker function
function requestPopStats(fio) {
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

//fio.uiWorker function
function requestGridData(fio) {
  'use strict';
  var request = {
    'type': 'addEvent',
    'name': 'webGridData',
    'start': 'now',
    'interval': 'always'
  }
  av.fio.uiWorker.postMessage(request);
  av.debug.log += '\nui --> Avida \n' + av.utl.json2stringFn(request);
}

//sends message to worker to tell Avida to run/pause as a toggle.
//fio.uiWorker function
function doRunPause(fio) {
  'use strict';
  var request;
  if (dijit.byId("manRadio").get('checked')) {
    request = {
      'type': 'addEvent',
      'name': 'runPause',
      'triggerType': 'immediate'
    };
  }
  else {
    var num = dijit.byId("updateSpinner").get('value');
    request = {
      'type': 'addEvent',
      'name': 'runPause',
      'start': num,
      'interval': 'once'
    }
  }
  av.fio.uiWorker.postMessage(request);
  av.debug.log += '\nui --> Avida \n' + av.utl.json2stringFn(request);
}

//fio.uiWorker function
function doReset(fio) {
  'use strict';
  var request = {
    'Key': 'Reset'
  };
  av.fio.uiWorker.postMessage(request);
  av.debug.log += '\nui --> Avida \n' + av.utl.json2stringFn(request);
}

//fio.uiWorker function
function doDbReady(fio) {
  'use strict';
  var request = {
    'type': 'dbReady'
  };
  av.fio.uiWorker.postMessage(request);
  av.debug.log += '\nui --> Avida \n' + av.utl.json2stringFn(request);
}

function injectAncestors(fio, parents) {
  'use strict';
  var request;
  for (var ii = 0; ii < parents.name.length; ii++) {
    request = {
      'type': 'addEvent',
      'name': 'injectSequence',
      'start': 'now',   //was begin
      'interval': 'once',
      'args': [
        parents.genome[ii],           //'wzcagcccccccccccccccccccccccccccccccccccczvfcaxgab',  //genome_sequence,
        parents.AvidaNdx[ii], //cell_start,
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

//---------------------------------
function updatePopStats(grd, msg) {
  'use strict';
  var place = 2;
  document.getElementById("TimeLabel").textContent = msg.update.formatNum(0) + " updates";
  grd.updateNum = msg.update;
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
  if (0 <= msg.update) {
    grd.ave_fitness[msg.update] = msg.ave_fitness;
    grd.ave_gestation_time[msg.update] = msg.ave_gestation_time;
    grd.ave_metabolic_rate[msg.update] = msg.ave_metabolic_rate;
    grd.population_size[msg.update] = msg.organisms;
    updateLogicAve(grd, msg);  //for graph data
  }
  //console.log('update length', msg.update.formatNum(0), grd.ave_fitness.length);
}

function updateLogicAve(grd, msg){
  'use strict';
  if (grd.allOff) {
    grd.log_fitness[msg.update] = null;
    grd.log_gestation_time[msg.update] = null;
    grd.log_metabolic_rate[msg.update] = null;
    grd.log_pop_size[msg.update] = null;
  }
  else {
    grd.log_fitness[msg.update] = 0;
    grd.log_gestation_time[msg.update] = 0;
    grd.log_metabolic_rate[msg.update] = 0;
    grd.log_pop_size[msg.update] = 0;
    //console.log('out_', grd.out );
    //console.log('gest', grd.msg.gestation.data);
    for (var ii=0; ii < grd.out.length; ii++){
      if (0 < grd.out[ii]) {
        grd.log_fitness[msg.update] += grd.msg.fitness.data[ii];
        grd.log_gestation_time[msg.update] += grd.msg.gestation.data[ii];
        grd.log_metabolic_rate[msg.update] += grd.msg.metabolism.data[ii];
        grd.log_pop_size[msg.update]++;
      }
    }
    //console.log('fit, ges, met, pop', grd.log_fitness[msg.update],grd.log_gestation_time[msg.update],grd.log_metabolic_rate[msg.update],grd.log_pop_size[msg.update])
    if (0 < grd.log_pop_size[msg.update]) {
      grd.log_fitness[msg.update] = grd.log_fitness[msg.update]/grd.log_pop_size[msg.update];
      grd.log_gestation_time[msg.update] = grd.log_gestation_time[msg.update]/grd.log_pop_size[msg.update];
      grd.log_metabolic_rate[msg.update] = grd.log_metabolic_rate[msg.update]/grd.log_pop_size[msg.update];
    }
    //console.log('fit', grd.log_fitness[msg.update].formatNum(2),'; ges',grd.log_gestation_time[msg.update].formatNum(2),
    //  '; met',grd.log_metabolic_rate[msg.update].formatNum(2),'; pop',grd.log_pop_size[msg.update])
  }
}

//writes out data for WebOrgDataByCellID
function updateSelectedOrganismType(grd, msg, parents) {
  'use strict';
  var prefix = '';
  if (av.debug.msg) console.log('selected_msg', msg);
  if (av.debug.msg) console.log('selected_msg', msg.tasks);
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
    //console.log('grd.msg', grd.msg);
    if (av.debug.msg) console.log('msg.ancestor === null_______________________________________________________');
    if ('undefined' != typeof grd.msg.ancestor) {
      if (null === grd.msg.ancestor.data[grd.selectedNdx])
        document.getElementById("ancestorLabel").textContent = '-';
      else document.getElementById("ancestorLabel").textContent = parents.name[grd.msg.ancestor.data[grd.selectedNdx]];
    }
    else document.getElementById("ancestorLabel").textContent = '-';
  }
  else document.getElementById("ancestorLabel").textContent = parents.name[msg.ancestor];
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

  fillColorBlock(grd, msg, parents);
  if (av.debug.msg) console.log('Kidstatus', grd.kidStatus);
  if ('getgenome' == grd.kidStatus) {
    if (av.debug.msg) console.log('in kidStatus');
    grd.kidStatus = "havegenome";
    grd.kidName = msg.genotypeName;
    grd.kidGenome = msg.genome;
    dijit.byId("mnCnOrganismTrace").attr("disabled", false);
  }
}

  function fillColorBlock(grd, msg, parents) {  //Draw the color block
    'use strict';
    if (av.debug.msg) console.log('in fillColorBlock');
    if (av.debug.msg) console.log('ndx', grd.selectedNdx, '; msg.ancestor.data[ndx]',grd.msg.ancestor.data[grd.selectedNdx]);
    if (av.debug.msg) console.log('grd.fill[grd.selectedNdx]',grd.fill[grd.selectedNdx]);
    if ("Ancestor Organism" == dijit.byId("colorMode").value) {
      if (null === grd.fill[grd.selectedNdx]) {
        grd.selCtx.fillStyle = '#000'
      }
      else {
        grd.selCtx.fillStyle = parents.color[grd.fill[grd.selectedNdx]]
      }
    }
    else {
      if (null === grd.fill[grd.selectedNdx]) {
        if (null === grd.msg.ancestor.data[grd.selectedNdx]) grd.selCtx.fillStyle = '#000';
        else grd.selCtx.fillStyle = '#888';
      }
      else if (0 == grd.fill[grd.selectedNdx]) grd.selCtx.fillStyle = defaultKidColor;
      else {  //get_color0 = function(cmap, dx, d1, d2)
        grd.selCtx.fillStyle = get_color0(grd.cmap, grd.fill[grd.selectedNdx], 0, grd.fillmax);
        //console.log('fillStyle', get_color0(grd.cmap, grd.fill[ii], 0, grd.fillmax));
      }
    }
    if (av.debug.msg) console.log('color', grd.selCtx.fillStyle);
    grd.selCtx.fillRect(0, 0, grd.SelectedWd, grd.SelectedHt);

  }

