//need to write string to be the data 'file' to put in pouchDB
function sendConfig(wsdb) {
  idStr = 'ws/cT';
  writeAvida_cfg(idStr, wsdb, '');
  writeEnvironment_cfg(idStr, wsdb, '');
  // write events.cfg so far always empty

  wsdb.get(idStr + '/events.cfg').then(function (doc) {
    if (debug.pdb) console.log('get events doc', doc);  //always empty so no reason to update
  }).catch(function (err) {
    if (debug.pdb) console.log('get events.cfg err', err);  //does not exist, so create.
    wsdb.put({
      _id: idStr + '/events.cfg',
      text: ''
    }).then(function (response) {// handle response to put
    }).catch(function (err) {console.log('put err', err);
    })
  });

  if (debug.pdb) {  //may run before the PouchDB function complete, this is not an error
    wsdb.allDocs({
      include_docs: true,
      attachments: true
    }).then(function (result) {
      console.log('alldoc', result);
    }).catch(function (err) {
      console.log(err);
    });
  }
}

function writeAvida_cfg(idStr, wsdb, domID) {
  var txt = 'WORLD_X ' + dijit.byId("sizeCols").get('value') + '\n';
  txt += 'WORLD_Y ' + dijit.byId("sizeRows").get('value') + '\n';
  txt += 'WORLD_GEOMETRY 1 \n';
  txt += 'COPY_MUT_PROB ' + document.getElementById("muteInput").value/100 + '\n';
  txt += 'DIVIDE_INS_PROB 0.0 \n';
  txt += 'DIVIDE_DEL_PROB 0.0 \n';
  txt += 'OFFSPRING_SIZE_RANGE 1.0 \n';
  // parents (ancestors) are injected into avida separately.
  if (dijit.byId("childParentRadio").get('checked')) txt += 'BIRTH_METHOD 0 \n';  //near parent
  else txt += 'BIRTH_METHOD 4 \n';   //anywhere randomly
  if (dijit.byId("experimentRadio").get('checked')) txt += 'RANDOM_SEED -1 \n';
  else txt += 'RANDOM_SEED 100\n';
  txt += '#include instset.cfg\n';
  txt += 'I\n';

  var ifile = {
    _id: idStr + '/avida.cfg',
    domID: domID,
    text: txt
  };
  var rev = null;
  wsdb.get(idStr + '/avida.cfg').then(function (doc) {
    rev = doc._rev;
    if (debug.pdb) console.log('get events doc', doc);
  }).catch(function (err) {
  });
  if (null != rev) ifile._rev = rev;

  wsdb.put(ifile).then(function (response) {// handle response to put
  }).catch(function (err) {console.log('put err', err);
  })

  if (debug.pdb) console.log('txt \n',txt);
}

function writeEnvironment_cfg(idStr, wsdb, domID) {
  var txt = '';
  if(dijit.byId("notose").get('checked'))  txt += 'REACTION  NOT  not   process:value=1:type=pow  requisite:max_count=1\n'; else txt += 'REACTION  NOT  not   process:value=0:type=pow  requisite:max_count=1\n';
  if (dijit.byId("nanose").get('checked')) txt += 'REACTION  NAND nand  process:value=1:type=pow  requisite:max_count=1\n'; else txt += 'REACTION  NAND nand  process:value=0:type=pow  requisite:max_count=1\n';
  if (dijit.byId("andose").get('checked')) txt += 'REACTION  AND  and   process:value=2:type=pow  requisite:max_count=1\n'; else txt += 'REACTION  AND  and   process:value=0:type=pow  requisite:max_count=1\n';
  if (dijit.byId("ornose").get('checked')) txt += 'REACTION  ORN  orn   process:value=2:type=pow  requisite:max_count=1\n'; else txt += 'REACTION  ORN  orn   process:value=0:type=pow  requisite:max_count=1\n';
  if (dijit.byId("orose").get('checked'))  txt += 'REACTION  OR   or    process:value=3:type=pow  requisite:max_count=1\n'; else txt += 'REACTION  OR   or    process:value=0:type=pow  requisite:max_count=1\n';
  if (dijit.byId("andnose").get('checked')) txt += 'REACTION  ANDN andn  process:value=3:type=pow  requisite:max_count=1\n'; else txt += 'REACTION  ANDN andn  process:value=0:type=pow  requisite:max_count=1\n';
  if (dijit.byId("norose").get('checked')) txt += 'REACTION  NOR  nor   process:value=4:type=pow  requisite:max_count=1\n'; else txt += 'REACTION  NOR  nor   process:value=0:type=pow  requisite:max_count=1\n';
  if (dijit.byId("xorose").get('checked')) txt += 'REACTION  XOR  xor   process:value=4:type=pow  requisite:max_count=1\n'; else txt += 'REACTION  XOR  xor   process:value=0:type=pow  requisite:max_count=1\n';
  if (dijit.byId("equose").get('checked')) txt += 'REACTION  EQU  equ   process:value=5:type=pow  requisite:max_count=1\n'; else txt += 'REACTION  EQU  equ   process:value=0:type=pow  requisite:max_count=1\n';
  var ifile = {
    _id: idStr + '/environment.cfg',
    domID : domID,
    text: txt
  }

  var rev = null;
  wsdb.get(idStr + '/environment.cfg').then(function (doc) {
    rev = doc._rev;
    if (debug.pdb) console.log('get events doc', doc);
  }).catch(function (err) {
  });
  if (null != rev) ifile._rev = rev;

  wsdb.put(ifile).then(function (response) {// handle response to put
  }).catch(function (err) {console.log('put err', err);
  })

  if (debug.pdb) console.log('Environment txt \n', txt);
}