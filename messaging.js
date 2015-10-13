function dummy() {
    console.log('dummy');
    console.log(dijit.byId("sizeCols").get('value'));
}

//uiWorker used when communicating with the web worker and avida
var uiWorker = new Worker('avida.js');
//var uiWorker = new Worker('ui-test.js');

//uiWorker function
function doOrgTrace(fzr) {
  var seed = 100*Math.random();
  if (dijit.byId("OrganDemoRadio").get('checked', true)) {seed = 0 }
  else {seed = -1}
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
    //'PtMuteRate': '0.02',
    //'Seed': '0'  // sets to demo mode; optional if left off it is experimental mode
  };
  uiWorker.postMessage(request);
}

//request data from Avida to update SelectedOrganismType
function doSelectedOrganismType(grd) {
  var request = {
    'type': 'addEvent',
    'name': 'WebOrgDataByCellID',
    //'singleton': true,
    'args': grd.selectedNdx
  }
  if (debug.msg) console.log('doSelectedOrganismType; selectedNdx', grd.selectedNdx)
  uiWorker.postMessage(request);
}

//uiWorker function
function requestPopStats() {
  var request = {
    'type': 'addEvent',
    'name': 'webPopulationStats',
    'start': 'now',
    'interval': 'always'
  }
  uiWorker.postMessage(request);
}

//uiWorker function
function requestGridData() {
  var request = {
    'type': 'addEvent',
    'name': 'webGridData',
    'start': 'now',
    'interval': 'always'
  }
  uiWorker.postMessage(request);
}

//sends message to worker to tell Avida to run/pause as a toggle.
//uiWorker function
function doRunPause() {
  if (dijit.byId("manRadio").get('checked')) {
    request = {
      'type': 'addEvent',
      'name': 'runPause',
      'triggerType': 'immediate'
    };
  }
  else {
    var num = dijit.byId("updateSpinner").get('value');
    console.log('num', num);
    request = {
      'type': 'addEvent',
      'name': 'runPause',
      'start': num,
      'interval': 'once'
    }
    console.log(request);
  }
  uiWorker.postMessage(request);
}

//uiWorker function
function doReset() {
  var request = {
    'Key': 'Reset'
  };
  uiWorker.postMessage(request);
}

function injectAncestors(parents) {
  var request;
  for (ii = 0; ii < parents.name.length; ii++) {
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
    uiWorker.postMessage(request);
  }
}

//need to update when get string definition from Matt
function sendConfig(grd) {
  grd.setDict = {};
  grd.setDict["sizeCols"] = dijit.byId("sizeCols").get('value');
  grd.setDict["sizeRows"] = dijit.byId("sizeRows").get('value');
  grd.setDict["muteInput"] = document.getElementById("muteInput").value;
  // parents (ancestors) are injected into avida separately.
  if (dijit.byId("childParentRadio").get('checked')) {
    grd.setDict["birthMethod"] = 0
  }
  else {
    grd.setDict["birthMethod"] = 1
  }
  grd.setDict["notose"] = dijit.byId("notose").get('checked');
  grd.setDict["nanose"] = dijit.byId("nanose").get('checked');
  grd.setDict["andose"] = dijit.byId("andose").get('checked');
  grd.setDict["ornose"] = dijit.byId("ornose").get('checked');
  grd.setDict["orose"] = dijit.byId("orose").get('checked');
  grd.setDict["andnose"] = dijit.byId("andnose").get('checked');
  grd.setDict["norose"] = dijit.byId("norose").get('checked');
  grd.setDict["xorose"] = dijit.byId("xorose").get('checked');
  grd.setDict["equose"] = dijit.byId("equose").get('checked');
  grd.setDict["repeatMode"] = dijit.byId("experimentRadio").get('checked');
  //dijit.byId("manRadio").set('checked',true);

  var setjson = dojo.toJson(grd.setDict);
  console.log("commented out setjson ", setjson);
}

//---------------------------------
function updatePopStats(grd, msg) {
  document.getElementById("TimeLabel").textContent = msg["update"].formatNum(0) + " updates";
  document.getElementById("popSizeLabel").textContent = msg["organisms"].formatNum(0);
  document.getElementById("aFitLabel").textContent = msg["ave_fitness"].formatNum(2);
  document.getElementById("aMetabolicLabel").textContent = msg["ave_metabolic_rate"].formatNum(1);
  document.getElementById("aGestateLabel").textContent = msg["ave_gestation_time"].formatNum(1);
  document.getElementById("aAgeLabel").textContent = msg["ave_age"].formatNum(2);
  document.getElementById("notPop").textContent = msg["not"];
  document.getElementById("nanPop").textContent = msg["nand"];
  document.getElementById("andPop").textContent = msg["and"];
  document.getElementById("ornPop").textContent = msg["orn"];
  document.getElementById("oroPop").textContent = msg["or"];
  document.getElementById("antPop").textContent = msg["andn"];
  document.getElementById("norPop").textContent = msg["nor"];
  document.getElementById("xorPop").textContent = msg["xor"];
  document.getElementById("equPop").textContent = msg["equ"];
  //update graph arrays
  grd.ave_fitness.push(msg["ave_fitness"]);
  grd.ave_gestation_time.push(msg["ave_gestation_time"]);
  grd.ave_metabolic_rate.push(msg["ave_metabolic_rate"]);
  grd.population_size.push(msg["organisms"]);
}

//writes out data for WebOrgDataByCellID
function updateSelectedOrganismType(grd, msg, parents) {
  if (debug.msg) console.log('selected_msg', msg);
  if (debug.msg) console.log('selected_msg', msg.tasks);
  if (msg.isEstimate) prefix = "est. ";
  document.getElementById("nameLabel").textContent = msg.genotypeName;
  if (null === msg.fitness) document.getElementById("fitLabel").innerHTML = '-';
  else document.getElementById("fitLabel").innerHTML = msg.fitness.formatNum(2);
  if (null === msg.metabolism) document.getElementById("metabolicLabel").textContent = '-';
  else document.getElementById("metabolicLabel").textContent = msg.metabolism.formatNum(2);
  if (null === msg.gestation) document.getElementById("generateLabel").textContent = '-';
  else  document.getElementById("generateLabel").textContent = msg.gestation.formatNum(2);
  if (null == msg.age) document.getElementById("ageLabel").textContent = '-';
    else document.getElementById("ageLabel").textContent = msg.age;
  if (null === msg.ancestor) {
    if (debug.msg) console.log('msg.ancestor === null_______________________________________________________')
    if (null === grd.msg.ancestor.data[grd.selectedNdx])
      document.getElementById("ancestorLabel").textContent = '-';
    else document.getElementById("ancestorLabel").textContent = parents.name[grd.msg.ancestor.data[grd.selectedNdx]];
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
  if (debug.msg) document.getElementById("dnaLabel").textContent = wsa(",", wsa(",", msg.genome));

  fillColorBlock(grd, msg, parents);
  if (debug.msg) console.log('Kidstatus', grd.kidStatus);
  if ('getgenome' == grd.kidStatus) {
    if (debug.msg) console.log('in kidStatus');
    grd.kidStatus = "havegenome";
    grd.kidName = msg.genotypeName;
    grd.kidGenome = msg.genome;
  }
}

  function fillColorBlock(grd, msg, parents) {  //Draw the color block
    if (debug.msg) console.log('in fillColorBlock');
    if (debug.msg) console.log('ndx', grd.selectedNdx, '; msg.ancestor.data[ndx]',grd.msg.ancestor.data[grd.selectedNdx]);
    if (debug.msg) console.log('grd.fill[grd.selectedNdx]',grd.fill[grd.selectedNdx]);
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
    if (debug.msg) console.log('color', grd.selCtx.fillStyle);
    grd.selCtx.fillRect(0, 0, grd.SelectedWd, grd.SelectedHt);

  }

