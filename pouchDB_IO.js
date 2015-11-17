//need to write string to be the data 'file' to put in pouchDB

function sendConfig(fio) {
  var idStr = 'cT';
  pdbAvida_cfg(fio.wsdb, idStr, '');
  pdbEnvironment_cfg(fio.wsdb, idStr, '');
  pdbEvents(fio.wsdb, idStr, '')

  if (debug.pdb) {  //may run before the PouchDB function complete, this is not an error
    fio.wsdb.allDocs({
      include_docs: true,
      attachments: true
    }).then(function (result) {
      console.log('alldoc', result);
    }).catch(function (err) {
      console.log(err);
    });
  }
}

function pdbEntryname_txt(wsdb, idStr, name) {
  "use strict";
  var ifile = {
    _id: idStr + '/entryname.txt',
    text: name
  };
  wsdb.get(idStr + '/entryname.txt').then(function (doc) {
    ifile._rev = doc._rev;
    if (debug.pdb) console.log('get entryName doc already exists, ok update', doc);
    wsdb.put(ifile).then(function (response) {if (debug.pdb) console.log('ok correct', response); // handle response to put
    }).catch(function (err) {console.log('put err', err);
    });
  }).catch(function (err) {
    wsdb.put(ifile).then(function (response) {if (debug.pdb) console.log('ok correct', response); // handle response to put
    }).catch(function (err) {console.log('put err', err);
    });
  });
}

function pdbConfig(fzr, wsdb) {
  ndx = fzr.config.length-1;  //write the last one created
  if (debug.pdb) console.log('wsdb', wsdb);
  pdbAvida_cfg(wsdb, fzr.config[ndx]._id, fzr.config[ndx].domID);
  pdbEnvironment_cfg(wsdb, fzr.config[ndx]._id, fzr.config[ndx].domID);
  pdbEvents(wsdb, fzr.config[ndx]._id, fzr.config[ndx].domID);
  pdbEntryname_txt(wsdb, fzr.config[ndx]._id, fzr.config[ndx].name)
}

function pdbEvents(wsdb, idStr, domID){
  wsdb.get(idStr + '/events.cfg').then(function (doc) {
    if (debug.pdb) console.log('get events doc, ok no reason to update', doc);  //always empty so no reason to update
  }).catch(function (err) {
    if (debug.pdb) console.log('get events.cfg not really an err, just not already there', err);  //does not exist, so create.
    wsdb.put({
      _id: idStr + '/events.cfg',
      domID: domID,
      text: ''
    }).then(function (response) {// handle response to put
    }).catch(function (err) {console.log('put err', err);
    })
  });
}

function pdbAvida_cfg(wsdb, idStr, domID) {
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
  wsdb.get(idStr + '/avida.cfg').then(function (doc) {
    ifile._rev = doc._rev;
    if (debug.pdb) console.log('get avida doc already exists, ok update', doc);
    wsdb.put(ifile).then(function (response) {if (debug.pdb) console.log('ok correct', response); // handle response to put
    }).catch(function (err) {console.log('put err', err);
    })
  }).catch(function (err) {
    if (debug.pdb) console.log('get avida err', err);  //not really an error, just not already there.
    wsdb.put(ifile).then(function (response) {if (debug.pdb) console.log('ok correct', response); // handle response to put
    }).catch(function (err) {console.log('put err', err);
    })
  });

  if (debug.pdb) console.log('txt \n',txt);
}

function pdbEnvironment_cfg(wsdb, idStr, domID) {
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
  wsdb.get(idStr + '/environment.cfg').then(function (doc) {
    ifile._rev = doc._rev;
    if (debug.pdb) console.log('get environment doc already exists, ok update', doc);
    wsdb.put(ifile).then(function (response) { if (debug.pdb) console.log('ok correct', response);// handle response to put
    }).catch(function (err) {console.log('put err', err);
    })
  }).catch(function (err) {
    if (debug.pdb) console.log('get environment not really an err, just not already there', err);  //not really an error, just not already there.
    wsdb.put(ifile).then(function (response) {if (debug.pdb) console.log('ok correct', response);// handle response to put
    }).catch(function (err) {console.log('put err', err);
    })
  });

  if (debug.pdb) console.log('Environment txt \n', txt);
}


