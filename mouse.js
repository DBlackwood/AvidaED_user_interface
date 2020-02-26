//set cursor shape -----------------------------------------------------------------------------------------------------
// Dad and kid are on the population page
// Mom and Son are on the Individual Organism page

//get domID list for freezer; just organism section
av.mouse.frzOrgCurserSet = function(state) {
  'use strict';
  for (var dir in av.fzr.domid) {
    //console.log('dir', dir, '; domid', av.fzr.domid[dir]);
    if (null != document.getElementById(av.fzr.domid[dir]) && 'g' === dir[0]) {
      document.getElementById(av.fzr.domid[dir]).style.cursor = state;
      // expect state = 'copy' or 'default'
    }
  }
};

//this does all entries in freezer.
av.mouse.frzCurserSet = function(state) {
  'use strict';
  for (var dir in av.fzr.domid) {
    //console.log('dir', dir, '; domid', av.fzr.domid[dir]);
    if (null != document.getElementById(av.fzr.domid[dir])) {
      document.getElementById(av.fzr.domid[dir]).style.cursor = state;
      // expect state = 'copy' or 'default'
    }
  }
};

av.mouse.setCursorStyle = function (shape, nodeList) {
  "use strict";
  //console.log(nodeList);
  var lnght = nodeList.length;
  for (var ii = 0; ii < lnght; ii++) {
    //console.log(nodeList[ii]);
    document.getElementById(nodeList[ii]).style.cursor = shape;
  }
}

av.mouse.selectedDadMouseStyle = function () {
  'use strict';
  //console.log('in Dad');
  av.mouse.setCursorStyle('no-drop', av.mouse.notDndPopList);
  av.mouse.frzCurserSet('no-drop');
  av.mouse.setCursorStyle('copy', av.mouse.dadTarget);
  if (1 < av.fzr.actConfig.actDomid.length) {document.getElementById(av.fzr.actConfig.actDomid).style.cursor = 'no-drop';}
};

//update data about a kid in the selected organism to move = primarily genome and name
av.mouse.selectedKidMouseStyle = function () {
  'use strict';
  av.mouse.setCursorStyle('no-drop', av.mouse.notDndPopList);
  av.mouse.setCursorStyle('copy', av.mouse.kidTarget);
  av.mouse.frzOrgCurserSet('copy');
  if (1 < av.fzr.actConfig.actDomid.length) {document.getElementById(av.fzr.actConfig.actDomid).style.cursor = 'no-drop';}
};

av.mouse.sonCursorShape = function () {
  'use strict';
  //console.log('in son')
  av.mouse.setCursorStyle('no-drop', av.mouse.notDndIndList);
  av.mouse.frzCurserSet('no-drop');
  av.mouse.setCursorStyle('copy', av.mouse.sonTarget);
  av.mouse.frzOrgCurserSet('copy');
  console.log('av.fzr.actOrgan.actDomid', av.fzr.actOrgan.actDomid, '; Object.keys(av.dnd.activeOrgan.map)[0]', Object.keys(av.dnd.activeOrgan.map)[0]);
  if (1 < av.fzr.actOrgan.actDomid.length) {document.getElementById(av.fzr.actOrgan.actDomid).style.cursor = 'copy';}
};

av.mouse.makeCursorDefault = function () {
  'use strict';
  av.mouse.frzCurserSet('default');  //pointer
  if (1 < av.fzr.actConfig.actDomid.length) {document.getElementById(av.fzr.actConfig.actDomid).style.cursor = 'pointer';}
  if (1 < av.fzr.actOrgan.actDomid.length) {document.getElementById(av.fzr.actOrgan.actDomid).style.cursor = 'pointer';}
  av.mouse.setCursorStyle('default', av.mouse.dndTarget);
  av.mouse.setCursorStyle('default', av.mouse.notDndPopList);
  av.mouse.setCursorStyle('default', av.mouse.notDndIndList);
};

//----------------------------------------------------------------------------------------------------------------------

//is the mouse nearly in the same place??? not sure if in use
av.mouse.nearly = function (aa, bb) {
  'use strict';
  var epsilon = 3;
  var distance = Math.sqrt(Math.pow(aa[0] - bb[0], 2) + Math.pow(aa[1] - bb[1], 2));
  if (distance > epsilon) return false;
  else return true;
};

av.mouse.findParentNdx  = function (parents) {
  'use strict';
  var MomNdx = -1;
  var lngth = av.parents.name.length;
  for (var ii = 0; ii < lngth; ii++) {
    //if (matches([av.grd.selectedCol, av.grd.selectedRow], [av.parents.col[ii], av.parents.row[ii]])) {
    if (av.grd.selectedNdx == av.parents.AvidaNdx[ii]) {
      MomNdx = ii;
      //console.log('parent found in function', MomNdx);
      break;  //found a parent no need to keep looking
    }
  }
  return MomNdx;
};

av.mouse.findSelected = function (evt, grd) {
  'use strict';
  var mouseX = evt.offsetX - av.grd.marginX - av.grd.xOffset;
  var mouseY = evt.offsetY - av.grd.marginY - av.grd.yOffset;
  av.grd.selectedCol = Math.floor(mouseX / av.grd.cellWd);
  av.grd.selectedRow = Math.floor(mouseY / av.grd.cellHt);
  av.grd.selectedNdx = av.grd.selectedRow*av.grd.cols + av.grd.selectedCol;
  if (av.debug.mouse) console.log('mx,y', mouseX, mouseY, '; selected Col, Row', av.grd.selectedCol, av.grd.selectedRow);
}

function offspringTrace(dnd, fio, fzr, gen) {
  'use strict';
  //Get name of Mom that is in OrganCurrentNode
  var parent;
  var parentID = Object.keys(av.dnd.activeOrgan.map)[0];
  if (av.debug.mouse) console.log('parentID', parentID);
  if (undefined == parentID) parent = '';
  else parent = document.getElementById(parentID).textContent;
  av.dnd.activeOrgan.selectAll().deleteSelectedNodes();  //clear items
  av.dnd.activeOrgan.sync();   //should be done after insertion or deletion
  //Put name of offspring in OrganCurrentNode
  av.dnd.activeOrgan.insertNodes(false, [{data: parent + "_offspring", type: ["g"]}]);
  av.dnd.activeOrgan.sync();
  av.fzr.actOrgan.actDomid = Object.keys(av.dnd.activeOrgan.map)[0];

  av.fzr.actOrgan.name = parent + "_offspring";
  av.fzr.actOrgan.genome = '0,heads_default,' + av.ind.dna[av.ind.son];  //this should be the full genome when the offspring is complete.
  av.fzr.actOrgan.actDomid = Object.keys(av.dnd.activeOrgan.map)[0];
  if (av.debug.mouse) console.log('av.fzr.actOrgan', av.fzr.actOrgan);
  //get genome from offspring data //needs work!!
  av.msg.doOrgTrace();  //request new Organism Trace from Avida and draw that.
};

av.mouse.offspringMouse = function(evt, dnd, fio, fzr, gen) {
  'use strict';
  var target = '';
  //console.log('av.fzr.actOrgan.actDomid', av.fzr.actOrgan.actDomid);
  if ('organIcon' == evt.target.id || 'actOrgImg' == evt.target.id || av.fzr.actOrgan.actDomid == evt.target.id ) {
    offspringTrace(dnd, fio, fzr, gen);
    av.post.addUser('Moved something to organsim Icon');
    target = 'organIcon';
  }
  else { // look for target in the freezer
    var found = false;
    for (var dir in av.fzr.domid) {if (av.fzr.domid[dir] == evt.target.id) {found=true; break;}}
    if (found) {
      target  = 'fzOrgan';
      //create a new freezer item
      if (av.debug.mouse) console.log('offSpring->freezerDiv');
      var parent;
      var parentID = Object.keys(dnd.activeOrgan.map)[0];
      if (av.debug.mouse) console.log('parentID', parentID);
      if (undefined == parentID) parent = 'noParentName';
      else parent = document.getElementById(parentID).textContent;
      //make sure there is a name.
      var oldname = parent + '_offspring';

      var nameArray = av.dnd.makeNameList(av.dnd.fzOrgan);
      //console.log('name', oldname, '; array',  nameArray);
      var sName = av.dnd.namefzrItem(oldname, nameArray);
      console.log('sName', sName);
      var avidian = prompt('Please name your avidian', sName);
      if (avidian) {
        avidian = av.dnd.getUniqueFzrName(avidian, nameArray);
        if (null != avidian) {  //add to Freezer
          av.post.addUser('Moved offspring, ' + avidian + ', to organism freezer');
          dnd.fzOrgan.insertNodes(false, [{data: avidian, type: ['g']}]);
          dnd.fzOrgan.sync();
          //find domId of offspring as listed in dnd.fzOrgan
          var mapItems = Object.keys(dnd.fzOrgan.map);
          var gdir =  'g' + av.fzr.gNum;
          av.fzr.dir[mapItems[mapItems.length - 1]] = gdir;
          av.fzr.domid[gdir] = mapItems[mapItems.length - 1];
          av.fzr.file[gdir + '/entryname.txt'] = avidian;
          av.fzr.file[gdir + '/genome.seq'] = '0,heads_default,' + av.ind.dna[av.ind.son];
          av.fzr.gNum++;
          av.fzr.saveUpdateState('no');
          if (av.debug.mouse) console.log('Offspring-->freezer, dir', gdir, 'fzr', fzr);
          //create a right mouse-click context menu for the item just created.
          if (av.debug.mouse) console.log('Offspring-->freezer; fzf', fzr);
          av.dnd.contextMenu(dnd.fzOrgan, av.fzr.domid[gdir]);
        }
      }
    }
  }
  return target;
};

av.mouse.traceSelected = function(dnd, fzr, grd) {
  'use strict';
  dnd.activeOrgan.selectAll().deleteSelectedNodes();  //clear items
  dnd.activeOrgan.sync();   //should be done after insertion or deletion
  //Put name of offspring in OrganCurrentNode
  dnd.activeOrgan.insertNodes(false, [{data: av.grd.kidName, type: ['g']}]);
  dnd.activeOrgan.sync();
  //genome data should be in av.parents.genome[av.mouse.ParentNdx];
  if (av.debug.mouse) console.log('genome', av.grd.kidGenome);
  av.fzr.actOrgan.genome = av.grd.kidGenome;
  av.fzr.actOrgan.name = av.grd.kidName;
  av.fzr.actOrgan.fzDomid = "";
  av.fzr.actOrgan.actDomid = Object.keys(av.dnd.activeOrgan.map)[0];
}

av.mouse.kidMouse = function (evt, dnd, fzr, grd){
  'use strict';
  var target = '';
  if (av.debug.mouse) console.log('in KidMouse', evt.target.id, evt);
  if (5 < av.grd.kidGenome.length) {
    if ('organIcon' == evt.target.id) {
      target = 'organIcon';
      av.post.addUser('Moved something to Organism Icon');
      av.mouse.traceSelected(dnd, fzr, grd);
    }
    else { // look for target in the freezer
      var found = false;
      if (av.debug.mouse) console.log('target.id',evt.target.id, '; av.fzr.domid', av.fzr.domid);
      //note below index of 0 indicates gridCanvas and if the target is canvas it should not be frozen
      if (0 < av.mouse.kidTarget.indexOf(evt.target.id)) {found = true;}
      else {
        for (var dir in av.fzr.domid) {
          //console.log('dir', dir);
          if ((av.fzr.domid[dir] == evt.target.id) && ('g' == dir.substring(0, 1))) {
            found = true;
            break;
          }
        }
      }
      if (found) {
        target = 'fzOrgan';
        av.mouse.freezeTheKid();
      }
    }
  }
  else console.log('Kid->OrganismIcon: genome too short ', av.grd.kidGenome);
  return target;
};

av.mouse.freezeTheKid = function () {
  "use strict";
  av.post.addUser('Moved avidian from grid to freezer');
  if (av.debug.mouse) console.log('freezerDiv');
  //make sure there is a name.

  var nameArray = av.dnd.makeNameList(av.dnd.fzOrgan);
  //console.log('name', av.grd.kidName, '; array',  nameArray);
  var sName = av.dnd.namefzrItem(av.grd.kidName, nameArray);
  console.log('sName', sName);
  var avidian = prompt('Please name your avidian', sName);
  if (avidian) {
    var avName = av.dnd.getUniqueFzrName(avidian, nameArray);
    if (null != avName) {  //give dom item new avName name
      av.post.addUser('Froze kid = ' + avName);
      av.dnd.fzOrgan.insertNodes(false, [{data: avName, type: ['g']}]);
      av.dnd.fzOrgan.sync();
      var mapItems = Object.keys(av.dnd.fzOrgan.map);
      var gdir =  'g' + av.fzr.gNum;
      av.fzr.file[gdir + '/entryname.txt'] = avName;
      av.fzr.dir[mapItems[mapItems.length - 1]] = gdir;
      av.fzr.domid[gdir] = mapItems[mapItems.length - 1];
      //av.fzr.file[gdir + '/genome.seq'] = '0,heads_default,' + av.grd.kidGenome;
      av.fzr.file[gdir + '/genome.seq'] = av.grd.kidGenome;
      av.fzr.gNum++;
      av.fzr.saveUpdateState('no');
      if (av.debug.mouse) console.log('fzOrgan', av.dnd.fzOrgan);
      if (av.debug.mouse) console.log('Kid-->Snow: dir',gdir, '; fzr', fzr);
      //create a right mouse-click context menu for the item just created.
      av.dnd.contextMenu(av.dnd.fzOrgan, av.fzr.domid[gdir]);
      av.fzr.saveUpdateState('no');
    }
  }
}

av.mouse.ParentMouse = function (evt, av) {
  'use strict';
  if (av.debug.mouse) console.log('ParentMouse', evt.target.id, evt);
  if ('gridCanvas' == evt.target.id) { // parent moved to another location on grid canvas
    av.mouse.UpGridPos = [evt.offsetX, evt.offsetY]; //not used for now
    //Move the ancestor on the canvas
    av.mouse.findSelected(evt, av.grd);
    // look to see if this is a valid grid cell
    if (av.grd.selectedCol >= 0 && av.grd.selectedCol < av.grd.cols && av.grd.selectedRow >= 0 && av.grd.selectedRow < av.grd.rows) {
      if (av.debug.mouse) console.log('parentMouse, selected,',av.grd.selectedCol, av.grd.selectedRow, av.grd.selectedNdx);
      av.parents.col[av.mouse.ParentNdx] = av.grd.selectedCol;
      av.parents.row[av.mouse.ParentNdx] = av.grd.selectedRow;
      av.parents.AvidaNdx[av.mouse.ParentNdx] = av.parents.col[av.mouse.ParentNdx] + av.grd.cols * av.parents.row[av.mouse.ParentNdx];
      av.post.addUser('Moved ancestor to col=' + av.grd.selectedCol + '; row=' + av.grd.selectedRow);
      if (av.debug.mouse) console.log('mvparent', av.mouse.ParentNdx, av.parents.col[av.mouse.ParentNdx], av.parents.row[av.mouse.ParentNdx]);
      if (av.debug.mouse) console.log('b auto', av.parents.autoNdx.length, av.parents.autoNdx, av.parents.name);
      if (av.debug.mouse) console.log('b hand', av.parents.handNdx.length, av.parents.handNdx);
      //change from auto placed to hand placed if needed
      if ('auto' == av.parents.howPlaced[av.mouse.ParentNdx]) {
        av.parents.howPlaced[av.mouse.ParentNdx] = 'hand';
        av.parents.makeHandAutoNdx();
        //av.parents.placeAncestors(parents);
      }
      if (av.debug.mouse) console.log('auto', av.parents.autoNdx.length, av.parents.autoNdx, av.parents.name);
      if (av.debug.mouse) console.log('hand', av.parents.handNdx.length, av.parents.handNdx);
    }
  }  // close on canvas
  //-------------------------------------------- av.dnd.trashCan
  else if ('trashCanImage' == evt.target.id) {
    if (av.debug.mouse) console.log('parent->trashCan', evt);
    if (av.debug.mouse) console.log('av.mouse.ParentNdx', av.mouse.ParentNdx, '; domid', av.parents.domid[av.mouse.ParentNdx]);
    if (av.debug.mouse) console.log('ancestorBox', av.dnd.ancestorBox);
    if (av.debug.mouse) console.log('av.parents.domid', av.parents.domid);
    var node = dojo.byId(av.parents.domid[av.mouse.ParentNdx]);
    console.log('node', node);
    av.dnd.ancestorBox.parent.removeChild(node);
    av.dnd.ancestorBox.sync();
    av.post.addUser('Moved ancestor to trash');

    //remove from main list.
    av.parents.removeParent(av.mouse.ParentNdx);
  }
  //-------------------------------------------- organism view
  else if ('organIcon' == evt.target.id) {
    av.post.addUser('Moved ancestor to Organsim View');
    av.dnd.activeOrgan.selectAll().deleteSelectedNodes();  //clear items
    av.dnd.activeOrgan.sync();   //should be done after insertion or deletion
    //Put name of offspring in av.dnd.activeOrganism
    av.dnd.activeOrgan.insertNodes(false, [{data: av.parents.name[av.mouse.ParentNdx], type: ['g']}]);
    av.dnd.activeOrgan.sync();
    av.fzr.actOrgan.actDomid = Object.keys(av.dnd.activeOrgan.map)[0];

    //genome data should be in av.parents.genome[av.mouse.ParentNdx];
    av.fzr.actOrgan.genome = av.parents.genome[av.mouse.ParentNdx];
    av.fzr.actOrgan.name = av.parents.name[av.mouse.ParentNdx];
    av.fzr.actOrgan.fzDomid = av.parents.domid[av.mouse.ParentNdx];
  }
}

av.mouse.fromAncestorBoxRemove = function (removeName) {
  'use strict';
  var domItems = Object.keys(dnd.ancestorBox.map);
  //console.log("domItems=", domItems);
  var nodeIndex = -1;
  var lngth = domItems.length;
  for (var ii = 0; ii < lngth; ii++) { //http://stackoverflow.com/questions/5837558/dojo-drag-and-drop-how-to-retrieve-order-of-items
    if (dnd.ancestorBox.map[domItems[ii]].data == removeName) {
      nodeIndex = ii;
    }
  }
  var node = dojo.byId(domItems[nodeIndex]);
  if (av.debug.mouse) console.log('nodeIndex', nodeIndex, domItems[nodeIndex]);
  dnd.ancestorBox.parent.removeChild(node);
  dnd.ancestorBox.sync();
}

//Key movement on grid
av.mouse.arrowKeysOnGrid = function (event) {
  'use strict';
  if (av.grd.flagSelected) {
    var moved = false;
    switch (event.which) {
      case 37: // left
        av.post.addUser('key: arrowLeft');
        if (0 < av.grd.selectedCol) {
          av.grd.selectedCol = av.grd.selectedCol - 1;
          moved = true;
        }
        break;
      case 38: // up
        av.post.addUser('key: arrowUp');
        if (0 < av.grd.selectedRow) {
          av.grd.selectedRow = av.grd.selectedRow - 1;
          moved = true;
        }
        break;
      case 39: // right
        av.post.addUser('key: arrowRight');
        if (av.grd.selectedCol < av.grd.cols - 1) {
          av.grd.selectedCol++;
          moved = true;
        }
        break;
      case 40: // down
        av.post.addUser('key: arrowDown');
        if (av.grd.selectedRow < av.grd.rows - 1) {
          av.grd.selectedRow = av.grd.selectedRow + 1;
          moved = true;
        }
        break;
    }
    event.preventDefault(); // prevent the default action (scroll / move caret)
    av.grd.selectedNdx = av.grd.selectedRow * av.grd.cols + av.grd.selectedCol;
    if (moved && 'prepping' != av.grd.runState) {  //look for decendents (kids)
      //find out if there is a kid in that cell
      //if which ancestor is not null then there is a 'kid' there.
      if (null != av.grd.msg.ancestor.data[av.grd.selectedNdx]) {
        av.grd.kidStatus = 'getgenome';
        av.post.addUser('ArrowKey was used to pick kid cellID=' + av.grd.selectedNdx);
        av.msg.doWebOrgDataByCell();
        if (av.debug.mouse) console.log('kid', av.grd.kidName, av.grd.kidGenome);
        dijit.byId("mnFzOrganism").attr("disabled", false);  //When an organism is selected, then it can be save via the menu
        dijit.byId("mnCnOrganismTrace").attr("disabled", false);
      }
    }
    //console.log('before call av.grd.drawGridSetupFn');
    av.grd.drawGridSetupFn();
  }
}

//No longer in use delete later
/*
av.mouse.getOriginalShapes = function () {
  'use strict';
  var lngth = av.mouse.notDndPopList.length;
  for (var ii = 0; ii < lngth; ii++) {
    //console.log('domElements', av.mouse.notDndPopList[ii])
    av.mouse.notDndPopShape[ii] = document.getElementById(av.mouse.notDndPopList[ii]).style.cursor;
    console.log('domElement/Shape', av.mouse.notDndPopList[ii], av.mouse.notDndPopShape[ii]);
  }
  var lngth = av.mouse.notDndIndList.length;
  for (var ii = 0; ii < lngth; ii++) {
    //console.log('domElements', av.mouse.notDndIndList[ii])
    av.mouse.notDndIndShape[ii] = document.getElementById(av.mouse.notDndIndList[ii]).style.cursor;
    console.log('domElement/Shape', av.mouse.notDndIndList[ii], av.mouse.notDndIndShape[ii]);
  }
};

av.mouse.notDndPopCursorShape = function (shape) {
  'use strict';
  var lngth = av.mouse.notDndPopList.length;
  if ('default' === shape) {
    for (var ii = 0; ii < lngth; ii++) {
      document.getElementById(av.mouse.notDndPopList[ii]).style.cursor = av.mouse.notDndPopShape[ii];
    }
  } else {
    for (var ii = 0; ii < lngth; ii++) {
      document.getElementById(av.mouse.notDndPopList[ii]).style.cursor = shape;
    }
  }
};

 av.mouse.notDndIndCursorShape = function (shape) {
 'use strict';
 //console.log('in av.mouse.notDndIndCursorShape');
 var lngth = av.mouse.notDndIndList.length;
 if ('default' === shape) {
 for (var ii = 0; ii < lngth; ii++) {
 document.getElementById(av.mouse.notDndIndList[ii]).style.cursor = av.mouse.notDndIndShape[ii];
 }
 } else {
 for (var ii = 0; ii < lngth; ii++) {
 document.getElementById(av.mouse.notDndIndList[ii]).style.cursor = shape;
 }
 }
 };
 */




/* mouse websites
 mouse clicks
 http://stackoverflow.com/questions/706655/bind-event-to-right-mouse-click
 http://stackoverflow.com/questions/7343117/cant-use-jquerys-click-event-handler-to-detect-right-click
 http://stackoverflow.com/questions/1206203/how-to-distinguish-between-left-and-right-mouse-click-with-jquery
 http://www.w3schools.com/jsref/dom_obj_event.asp

 overide mouse shape

 http://stackoverflow.com/questions/10750582/global-override-of-mouse-cursor-with-javascript
 https://developer.mozilla.org/en-US/docs/Web/API/Element/setCapture
 http://www.w3schools.com/cssref/tryit.asp?filename=trycss_cursor
 http://www.w3schools.com/cssref/playit.asp?filename=playcss_cursor&preval=row-resize
 http://www.w3schools.com/cssref/tryit.asp?filename=trycss_cursor

set capture??
 https://developer.mozilla.org/en-US/docs/Web/API/Element/setCapture
 http://stackoverflow.com/questions/820026/capture-mouse-in-firefox
 http://stackoverflow.com/questions/820026/capture-mouse-in-firefox
 http://stackoverflow.com/questions/7481022/mouse-capture-in-non-ie-browser

 dragging
 https://jsfiddle.net/d2wyv8fo/
 http://stackoverflow.com/questions/8528428/cleanest-drag-and-drop-code-in-javascript-canvas

 cursors
 http://www.echoecho.com/csscursors.htm
 http://www.useragentman.com/blog/2011/12/21/cross-browser-css-cursor-images-in-depth/
 http://stackoverflow.com/questions/10866471/javascript-how-to-change-mouse-cursor-to-an-image
 http://www.htmlgoodies.com/beyond/css/create-custom-cursors-with-javascript-and-css3.html#fbid=zWT2yc03gfP
 http://stackoverflow.com/questions/192900/wait-cursor-over-entire-html-page

 making cur files
 http://stackoverflow.com/questions/426372/convert-a-gif-into-a-cur-file
 https://convertio.co/png-cur/
 http://customize.org/cursor/help/How_To_Create_Cursors
 http://www.ehow.com/video_12213843_create-cursor-gimp.html
 */

