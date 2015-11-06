//need to write string to be the data 'file' to put in pouchDB
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