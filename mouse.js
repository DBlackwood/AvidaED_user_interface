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
  for (var ii = 0; ii < parents.name.length; ii++) {
    //if (matches([grd.selectedCol, grd.selectedRow], [parents.col[ii], parents.row[ii]])) {
    if (av.grd.selectedNdx == parents.AvidaNdx[ii]) {
      MomNdx = ii;
      //console.log('parent found in function', MomNdx);
      break;  //found a parent no need to keep looking
    }
  }
  return MomNdx;
};

function findSelected(evt, grd) {
  'use strict';
  var mouseX = evt.offsetX - grd.marginX - grd.xOffset;
  var mouseY = evt.offsetY - grd.marginY - grd.yOffset;
  grd.selectedCol = Math.floor(mouseX / grd.cellWd);
  grd.selectedRow = Math.floor(mouseY / grd.cellHt);
  grd.selectedNdx = grd.selectedRow*grd.cols + grd.selectedCol;
  if (av.debug.mouse) console.log('mx,y', mouseX, mouseY, '; selected Col, Row', grd.selectedCol, grd.selectedRow);
}

//update data about a kid in the selecred organism to move = primarily genome and name
function SelectedKidMouseStyle(dnd, fzr, grd) {
  'use strict';
  document.getElementById('organIcon').style.cursor = 'copy';
  document.getElementById('fzOrgan').style.cursor = 'copy';
  document.getElementById('freezerDiv').style.cursor = 'copy';
  document.getElementById('gridCanvas').style.cursor = 'copy';
  for (var dir in fzr.domid[dir]) {document.getElementById(fzr.domid[dir]).style.cursor = 'copy';}
  grd.kidName = 'temporary';
  grd.kidGenome = '0,heads_default,wzcagcccccccccaaaaaaaaaaaaaaaaaaaaccccccczvfcaxgab';  //ancestor
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

  fzr.actOrgan.name = parent + "_offspring";
  fzr.actOrgan.genome = '0,heads_default,' + av.gen.dna[av.gen.son];  //this should be the full genome when the offspring is complete.
  fzr.actOrgan.domId = Object.keys(dnd.activeOrgan.map)[0];
  console.log('fzr.actOrgan', fzr.actOrgan);
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
    for (var dir in fzr.domid) {if (fzr.domid[dir] == evt.target.id) {found=true; break;}}
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
        avidian = getUniqueName(avidian, dnd.fzOrgan);
        if (null != avidian) {  //add to Freezer
          dnd.fzOrgan.insertNodes(false, [{data: avidian, type: ['g']}]);
          dnd.fzOrgan.sync();
          //find domId of parent as listed in dnd.fzOrgan
          var mapItems = Object.keys(dnd.fzOrgan.map);
          var gdir =  'g' + fzr.gNum;
          fzr.dir[mapItems[mapItems.length - 1]] = gdir;
          fzr.domid[gdir] = mapItems[mapItems.length - 1];
          fzr.file[gdir + '/entryname.txt'] = avidian;
          fzr.file[gdir + '/genome.seq'] = '0,heads_default,' + av.gen.dna[av.gen.son];
          fzr.gNum++;
          fzr.saved = false;
          if (av.debug.mouse) console.log('Offspring-->freezer, dir', gdir, 'fzr', fzr);
          //create a right mouse-click context menu for the item just created.
          if (av.debug.mouse) console.log('Offspring-->freezer; fzf', fzr);
          av.dnd.contextMenu(fzr, dnd.fzOrgan, fzr.domid[gdir]);
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
  dnd.activeOrgan.insertNodes(false, [{data: grd.kidName, type: ['g']}]);
  dnd.activeOrgan.sync();
  //genome data should be in parents.genome[av.mouse.ParentNdx];
  console.log('genome', grd.kidGenome);
  fzr.actOrgan.genome = grd.kidGenome;
  fzr.actOrgan.name = grd.kidName;
  fzr.actOrgan.fzDomid = "";
  fzr.actOrgan.actDomid = Object.keys(av.dnd.activeOrgan.map)[0];
}

var KidMouse = function (evt, dnd, fzr, grd){
  'use strict';
  var target = '';
  if (av.debug.mouse) console.log('in KidMouse', evt.target.id, evt);
  if (5 < grd.kidGenome.length) {
    if ('organIcon' == evt.target.id) {
      target = 'organIcon';
      traceSelected(dnd, fzr, grd);
    }
    else { // look for target in the freezer
      var found = false;
      console.log('target.id',evt.target.id, '; fzr.domid', fzr.domid);
      for (var dir in fzr.domid) {
        //console.log('dir', dir);
        if ((fzr.domid[dir] == evt.target.id) && ('g'==dir.substring(0,1)) ) {
          found = true;
          break;
        }
      }
      if (found || 'freezerDiv' == evt.target.id) {
        target = 'fzOrgan';
        if (av.debug.mouse) console.log('freezerDiv');
        //make sure there is a name.
        var avidian = prompt("Please name your avidian", grd.kidName);
        if (avidian) {
          avidian = getUniqueName(avidian, dnd.fzOrgan);
          if (null != avidian) {  //add to Freezer
            dnd.fzOrgan.insertNodes(false, [{data: avidian, type: ['g']}]);
            dnd.fzOrgan.sync();
            var mapItems = Object.keys(dnd.fzOrgan.map);
            var gdir =  'g' + fzr.gNum;
            fzr.file[gdir + '/entryname.txt'] = avidian;
            fzr.dir[mapItems[mapItems.length - 1]] = gdir;
            fzr.domid[gdir] = mapItems[mapItems.length - 1];
            //fzr.file[gdir + '/genome.seq'] = '0,heads_default,' + grd.kidGenome;
            fzr.file[gdir + '/genome.seq'] = grd.kidGenome;
            fzr.gNum++;
            fzr.saved = false;
            if (av.debug.mouse) console.log('fzOrgan', dnd.fzOrgan);
            if (av.debug.mouse) console.log('Kid-->Snow: dir',gdir, '; fzr', fzr);
            //create a right mouse-click context menu for the item just created.
            av.dnd.contextMenu(fzr, dnd.fzOrgan, fzr.domid[gdir]);
          }
        }
      }
    }
  }
  else console.log('Kid->OrganismIcon: genome too short ', grd.kidGenome);
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
        makeHandAutoNdx(av.parents);
        //PlaceAncestors(parents);
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
    removeParent(av.mouse.ParentNdx, av.parents);
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
