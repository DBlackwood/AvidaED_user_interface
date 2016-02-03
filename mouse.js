var nearly = function (aa, bb) {
  'use strict';
  var epsilon = 3;
  var distance = Math.sqrt(Math.pow(aa[0] - bb[0], 2) + Math.pow(aa[1] - bb[1], 2));
  if (distance > epsilon) return false;
  else return true;
};

var findParentNdx = function (parents) {
  'use strict';
  var MomNdx = -1;
  for (var ii = 0; ii < av.parents.name.length; ii++) {
    //if (matches([av.grd.selectedCol, av.grd.selectedRow], [av.parents.col[ii], av.parents.row[ii]])) {
    if (av.grd.selectedNdx == av.parents.AvidaNdx[ii]) {
      MomNdx = ii;
      //console.log('parent found in function', MomNdx);
      break;  //found a parent no need to keep looking
    }
  }
  return MomNdx;
};

function findSelected(evt, grd) {
  'use strict';
  var mouseX = evt.offsetX - av.grd.marginX - av.grd.xOffset;
  var mouseY = evt.offsetY - av.grd.marginY - av.grd.yOffset;
  av.grd.selectedCol = Math.floor(mouseX / av.grd.cellWd);
  av.grd.selectedRow = Math.floor(mouseY / av.grd.cellHt);
  av.grd.selectedNdx = av.grd.selectedRow*av.grd.cols + av.grd.selectedCol;
  if (av.debug.mouse) console.log('mx,y', mouseX, mouseY, '; selected Col, Row', av.grd.selectedCol, av.grd.selectedRow);
}

//update data about a kid in the selecred organism to move = primarily genome and name
function SelectedKidMouseStyle(dnd, fzr, grd) {
  'use strict';
  document.getElementById('organIcon').style.cursor = 'copy';
  document.getElementById('fzOrgan').style.cursor = 'copy';
  document.getElementById('freezerDiv').style.cursor = 'copy';
  document.getElementById('gridCanvas').style.cursor = 'copy';
  for (var dir in av.fzr.domid[dir]) {document.getElementById(av.fzr.domid[dir]).style.cursor = 'copy';}
  av.grd.kidName = 'temporary';
  av.grd.kidGenome = '0,heads_default,wzcagcccccccccaaaaaaaaaaaaaaaaaaaaccccccczvfcaxgab';  //ancestor
}

function offspringTrace(dnd, fio, fzr, gen) {
  'use strict';
  //Get name of parent that is in OrganCurrentNode
  var parent;
  var parentID = Object.keys(dnd.activeOrgan.map)[0];
  console.log('parentID', parentID);
  if (undefined == parentID) parent = '';
  else parent = document.getElementById(parentID).textContent;
  dnd.activeOrgan.selectAll().deleteSelectedNodes();  //clear items
  dnd.activeOrgan.sync();   //should be done after insertion or deletion
  //Put name of offspring in OrganCurrentNode
  dnd.activeOrgan.insertNodes(false, [{data: parent + "_offspring", type: ["g"]}]);
  dnd.activeOrgan.sync();

  av.fzr.actOrgan.name = parent + "_offspring";
  av.fzr.actOrgan.genome = '0,heads_default,' + av.ind.dna[av.ind.son];  //this should be the full genome when the offspring is complete.
  av.fzr.actOrgan.domId = Object.keys(dnd.activeOrgan.map)[0];
  console.log('av.fzr.actOrgan', av.fzr.actOrgan);
  //get genome from offspring data //needs work!!
  av.msg.doOrgTrace(fio, fzr);  //request new Organism Trace from Avida and draw that.
};

var OffspringMouse = function(evt, dnd, fio, fzr, gen) {
  'use strict';
  var target = '';
  if ('organIcon' == evt.target.id) {
    offspringTrace(dnd, fio, fzr, gen);
  target = 'organIcon';}
  else { // look for target in the freezer
    var found = false;
    for (var dir in av.fzr.domid) {if (av.fzr.domid[dir] == evt.target.id) {found=true; break;}}
    if (found || 'freezerDiv' == evt.target.id) {
      target  = 'fzOrgan';
      //create a new freezer item
      if (av.debug.mouse) console.log('offSpring->freezerDiv');
      var parent;
      var parentID = Object.keys(dnd.activeOrgan.map)[0];
      console.log('parentID', parentID);
      if (undefined == parentID) parent = 'noParentName';
      else parent = document.getElementById(parentID).textContent;
      //make sure there is a name.
      var avidian = prompt("Please name your avidian", parent + '_offspring');
      if (avidian) {
        avidian = av.dnd.getUniqueName(avidian, dnd.fzOrgan);
        if (null != avidian) {  //add to Freezer
          dnd.fzOrgan.insertNodes(false, [{data: avidian, type: ['g']}]);
          dnd.fzOrgan.sync();
          //find domId of parent as listed in dnd.fzOrgan
          var mapItems = Object.keys(dnd.fzOrgan.map);
          var gdir =  'g' + av.fzr.gNum;
          av.fzr.dir[mapItems[mapItems.length - 1]] = gdir;
          av.fzr.domid[gdir] = mapItems[mapItems.length - 1];
          av.fzr.file[gdir + '/entryname.txt'] = avidian;
          av.fzr.file[gdir + '/genome.seq'] = '0,heads_default,' + av.ind.dna[av.ind.son];
          av.fzr.gNum++;
          av.fzr.saved = false;
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

function traceSelected(dnd, fzr, grd) {
  "use strict";
  dnd.activeOrgan.selectAll().deleteSelectedNodes();  //clear items
  dnd.activeOrgan.sync();   //should be done after insertion or deletion
  //Put name of offspring in OrganCurrentNode
  dnd.activeOrgan.insertNodes(false, [{data: av.grd.kidName, type: ['g']}]);
  dnd.activeOrgan.sync();
  //genome data should be in av.parents.genome[av.mouse.ParentNdx];
  console.log('genome', av.grd.kidGenome);
  av.fzr.actOrgan.genome = av.grd.kidGenome;
  av.fzr.actOrgan.name = av.grd.kidName;
  av.fzr.actOrgan.fzDomid = "";
  av.fzr.actOrgan.actDomid = Object.keys(av.dnd.activeOrgan.map)[0];
}

var KidMouse = function (evt, dnd, fzr, grd){
  'use strict';
  var target = '';
  if (av.debug.mouse) console.log('in KidMouse', evt.target.id, evt);
  if (5 < av.grd.kidGenome.length) {
    if ('organIcon' == evt.target.id) {
      target = 'organIcon';
      traceSelected(dnd, fzr, grd);
    }
    else { // look for target in the freezer
      var found = false;
      console.log('target.id',evt.target.id, '; av.fzr.domid', av.fzr.domid);
      for (var dir in av.fzr.domid) {
        //console.log('dir', dir);
        if ((av.fzr.domid[dir] == evt.target.id) && ('g'==dir.substring(0,1)) ) {
          found = true;
          break;
        }
      }
      if (found || 'freezerDiv' == evt.target.id) {
        target = 'fzOrgan';
        if (av.debug.mouse) console.log('freezerDiv');
        //make sure there is a name.
        var avidian = prompt("Please name your avidian", av.grd.kidName);
        if (avidian) {
          avidian = av.dnd.getUniqueName(avidian, dnd.fzOrgan);
          if (null != avidian) {  //add to Freezer
            dnd.fzOrgan.insertNodes(false, [{data: avidian, type: ['g']}]);
            dnd.fzOrgan.sync();
            var mapItems = Object.keys(dnd.fzOrgan.map);
            var gdir =  'g' + av.fzr.gNum;
            av.fzr.file[gdir + '/entryname.txt'] = avidian;
            av.fzr.dir[mapItems[mapItems.length - 1]] = gdir;
            av.fzr.domid[gdir] = mapItems[mapItems.length - 1];
            //av.fzr.file[gdir + '/genome.seq'] = '0,heads_default,' + av.grd.kidGenome;
            av.fzr.file[gdir + '/genome.seq'] = av.grd.kidGenome;
            av.fzr.gNum++;
            av.fzr.saved = false;
            if (av.debug.mouse) console.log('fzOrgan', dnd.fzOrgan);
            if (av.debug.mouse) console.log('Kid-->Snow: dir',gdir, '; fzr', fzr);
            //create a right mouse-click context menu for the item just created.
            av.dnd.contextMenu(dnd.fzOrgan, av.fzr.domid[gdir]);
          }
        }
      }
    }
  }
  else console.log('Kid->OrganismIcon: genome too short ', av.grd.kidGenome);
  return target;
}

function ParentMouse(evt, av) {
  'use strict';
  if (av.debug.mouse) console.log('ParentMouse', evt.target.id, evt);
  if ('gridCanvas' == evt.target.id) { // parent moved to another location on grid canvas
    av.mouse.UpGridPos = [evt.offsetX, evt.offsetY]; //not used for now
    //Move the ancestor on the canvas
    findSelected(evt, av.grd);
    // look to see if this is a valid grid cell
    if (av.grd.selectedCol >= 0 && av.grd.selectedCol < av.grd.cols && av.grd.selectedRow >= 0 && av.grd.selectedRow < av.grd.rows) {
      if (av.debug.mouse) console.log('parentMouse, selected,',av.grd.selectedCol, av.grd.selectedRow, av.grd.selectedNdx);
      av.parents.col[av.mouse.ParentNdx] = av.grd.selectedCol;
      av.parents.row[av.mouse.ParentNdx] = av.grd.selectedRow;
      av.parents.AvidaNdx[av.mouse.ParentNdx] = av.parents.col[av.mouse.ParentNdx] + av.grd.cols * av.parents.row[av.mouse.ParentNdx];
      console.log('mvparent', av.mouse.ParentNdx, av.parents.col[av.mouse.ParentNdx], av.parents.row[av.mouse.ParentNdx]);
      console.log('b auto', av.parents.autoNdx.length, av.parents.autoNdx, av.parents.name);
      console.log('b hand', av.parents.handNdx.length, av.parents.handNdx);
      //change from auto placed to hand placed if needed
      if ('auto' == av.parents.howPlaced[av.mouse.ParentNdx]) {
        av.parents.howPlaced[av.mouse.ParentNdx] = 'hand';
        av.parents.makeHandAutoNdx();
        //av.parents.placeAncestors(parents);
      }
      console.log('auto', av.parents.autoNdx.length, av.parents.autoNdx, av.parents.name);
      console.log('hand', av.parents.handNdx.length, av.parents.handNdx);
    }
  }  // close on canvas
  //-------------------------------------------- av.dnd.trashCan
  else if ('TrashCanImage' == evt.target.id) {
    if (av.debug.mouse) console.log('parent->trashCan', evt);
    console.log('parent->trashCan', evt);
    console.log('av.mouse.ParentNdx', av.mouse.ParentNdx, '; domid', av.parents.domid[av.mouse.ParentNdx]);
    console.log('ancestorBox', av.dnd.ancestorBox);
    var node = dojo.byId(av.parents.domid[av.mouse.ParentNdx]);
    av.dnd.ancestorBox.parent.removeChild(node);
    av.dnd.ancestorBox.sync();

    //remove from main list.
    av.parents.removeParent(av.mouse.ParentNdx);
  }
  //-------------------------------------------- organism view
  else if ('organIcon' == evt.target.id) {
    av.dnd.activeOrgan.selectAll().deleteSelectedNodes();  //clear items
    av.dnd.activeOrgan.sync();   //should be done after insertion or deletion
    //Put name of offspring in av.dnd.activeOrganism
    av.dnd.activeOrgan.insertNodes(false, [{data: av.parents.name[av.mouse.ParentNdx], type: ['g']}]);
    av.dnd.activeOrgan.sync();
    //genome data should be in av.parents.genome[av.mouse.ParentNdx];
    av.fzr.actOrgan.genome = av.parents.genome[av.mouse.ParentNdx];
    av.fzr.actOrgan.name = av.parents.name[av.mouse.ParentNdx];
    av.fzr.actOrgan.domId = av.parents.domid[av.mouse.ParentNdx];
  }
}

function fromAncestorBoxRemove(removeName) {
  'use strict';
  var domItems = Object.keys(dnd.ancestorBox.map);
  //console.log("domItems=", domItems);
  var nodeIndex = -1;
  for (var ii = 0; ii < domItems.length; ii++) { //http://stackoverflow.com/questions/5837558/dojo-drag-and-drop-how-to-retrieve-order-of-items
    if (dnd.ancestorBox.map[domItems[ii]].data == removeName) {
      nodeIndex = ii;
    }
  }
  var node = dojo.byId(domItems[nodeIndex]);
  console.log('nodeIndex', nodeIndex, domItems[nodeIndex]);
  dnd.ancestorBox.parent.removeChild(node);
  dnd.ancestorBox.sync();
}

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

dragging
 https://developer.mozilla.org/en-US/docs/Web/API/Element/setCapture
 https://jsfiddle.net/d2wyv8fo/

 cursors
 http://www.useragentman.com/blog/2011/12/21/cross-browser-css-cursor-images-in-depth/
 */
