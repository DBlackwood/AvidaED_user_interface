
/* ----------------------------------------
linmap
Function by Wesley R. Elsberry, based on 
1989 Turbo Pascal version.
---------------------------------------- */
var linmap = function(dx, d1, d2, r1, r2){
	var ddiff = d2 - d1 + 0.0;
	var rdiff = r2 - r1 + 0.0;

	var doffs = dx - d1 + 0.0;

	if (0.0 == ddiff){
	    //return 0.0; // should be NaN
	    return Number.Nan; // should be NaN
	};

	var dscale = (doffs + 0.0) / ddiff;

	var rx = dscale * rdiff + r1;

	return rx;
}

/* ----------------------------------------
get_color

Function to obtain a color out of a color map 
implemented as a sequential list of color value
strings.

example:
cmap = ['rgb(0,0,0)', 'rgb(0, 0, 1)', ... 'rgb(255,255,255)'];

dx is a number in the data domain.
d1 is the data domain value corresponding to the low end
   of the colormap.
d2 is the data domain value corresponding to the high end 
   of the colormap.

Returns:

a color string from the corresponding index in the 
input color map.

The color map can be of any length.

   ---------------------------------------- */
var get_color0 = function(cmap, dx, d1, d2){
    var datacolorindex = Math.max(0,Math.min(cmap.length-1,Math.round(linmap(dx, d1, d2, 0, cmap.length-1))));
    var datacolor = cmap[datacolorindex];
    return datacolor;
}

var get_color1 = function(cmap, dx, d1, d2){
    var datacolorindex = Math.max(0,Math.min(cmap.length-1,Math.round(linmap(dx, d1, d2, 1, cmap.length-1))));
    var datacolor = cmap[datacolorindex];
    return datacolor;
}

//---------- set Ancestors ------------------/
    function PlaceAncestors(parents) {
      var cols = dijit.byId("sizeCols").get('value');
      var rows = dijit.byId("sizeRows").get('value');
      switch(parents.autoCnt){
        case 1:   //Place in center
          parents.col[parents.autoNdx[0]] = Math.trunc(cols/2);
          parents.row[parents.autoNdx[0]] = Math.trunc(rows/2);
          parents.AvidaNdx[parents.autoNdx[0]] = parents.col[parents.autoNdx[0]] + cols * parents.row[parents.autoNdx[0]];
          break;
        case 2:
          if (cols > rows) {  //place parents horizontally
            for (ii = 0; ii < parents.autoCnt; ii++) {
              parents.col[parents.autoNdx[ii]] = Math.trunc(cols*(2*ii+1)/4);
              parents.row[parents.autoNdx[ii]] = Math.trunc(rows/2);
              parents.AvidaNdx[parents.autoNdx[ii]] = parents.col[parents.autoNdx[ii]] + cols * parents.row[parents.autoNdx[ii]];
            }
          }
          else {  //place parents vertically
            for (ii = 0; ii < parents.autoCnt; ii++) {
              parents.col[parents.autoNdx[ii]] = Math.trunc(cols/2);
              parents.row[parents.autoNdx[ii]] = Math.trunc(rows*(2*ii+1)/4);
              parents.AvidaNdx[parents.autoNdx[ii]] = parents.col[parents.autoNdx[ii]] + cols * parents.row[parents.autoNdx[ii]];
            }
          }
          break;
        case 3:
          if (cols > rows) {  //place parents horizontally
            for (ii = 0; ii < 2; ii++) {
              parents.col[parents.autoNdx[ii]] = Math.trunc(cols*(2*ii+1)/4);
              parents.row[parents.autoNdx[ii]] = Math.trunc(rows/3);
              parents.AvidaNdx[parents.autoNdx[ii]] = parents.col[parents.autoNdx[ii]] + cols * parents.row[parents.autoNdx[ii]];
            }
            parents.col[parents.autoNdx[2]] = Math.trunc(cols/2);
            parents.row[parents.autoNdx[2]] = Math.trunc(rows*2/3);
            parents.AvidaNdx[parents.autoNdx[2]] = parents.col[parents.autoNdx[ii]] + cols * parents.row[parents.autoNdx[ii]];
          }
          else {  //place parents vertically
            for (ii = 0; ii < 2; ii++) {
              parents.col[parents.autoNdx[ii]] = Math.trunc(cols/3);
              parents.row[parents.autoNdx[ii]] = Math.trunc(rows*(2*ii+1)/4);
              parents.AvidaNdx[parents.autoNdx[ii]] = parents.col[parents.autoNdx[ii]] + cols * parents.row[parents.autoNdx[ii]];
            }
            parents.col[parents.autoNdx[2]] = Math.trunc(cols*2/3);
            parents.row[parents.autoNdx[2]] = Math.trunc(rows/2);
            parents.AvidaNdx[parents.autoNdx[2]] = parents.col[parents.autoNdx[ii]] + cols * parents.row[parents.autoNdx[ii]];
          }
          break;
        case 4:
          for (ii = 0; ii < parents.autoCnt; ii++) {
            if (ii<2) { parents.row[parents.autoNdx[ii]] = Math.trunc(rows/4) }
            else { parents.row[parents.autoNdx[ii]] = Math.trunc(rows*3/4) }
            if (ii%2 < 1) { parents.col[parents.autoNdx[ii]] = Math.trunc(cols/4) }
            else { parents.col[parents.autoNdx[ii]] = Math.trunc(cols*3/4) }
            parents.AvidaNdx[parents.autoNdx[ii]] = parents.col[parents.autoNdx[ii]] + cols * parents.row[parents.autoNdx[ii]];
          }
        case 5:
          for (ii = 0; ii < parents.autoCnt; ii++) {
            if (ii<2) { parents.row[parents.autoNdx[ii]] = Math.trunc(rows/5) }
            else { parents.row[parents.autoNdx[ii]] = Math.trunc(rows*4/5) }
            if (ii%2 < 1) { parents.col[parents.autoNdx[ii]] = Math.trunc(cols/5) }
            else { parents.col[parents.autoNdx[ii]] = Math.trunc(cols*4/5) }
            if (4 == ii) {
              parents.col[parents.autoNdx[ii]] = Math.trunc(cols/2);
              parents.row[parents.autoNdx[ii]] = Math.trunc(rows/2);
            }
            parents.AvidaNdx[parents.autoNdx[ii]] = parents.col[parents.autoNdx[ii]] + cols * parents.row[parents.autoNdx[ii]];
          }
          break;
        case 6:
          //console.log('case6');
        case 7:
          //console.log('case7');
          if (cols > rows) {  //place parents horizontally
            for (ii = 0; ii < parents.autoCnt; ii++) {
              if (ii<3) { parents.row[parents.autoNdx[ii]] = Math.trunc(rows/4) }
              else { parents.row[parents.autoNdx[ii]] = Math.trunc(rows*3/4) }
              cc = ii%3;
              parents.col[parents.autoNdx[ii]] = Math.trunc(cols*(2*cc+1)/6);
              //console.log('ii, cc, col, row',ii, cc, parents.col[parents.autoNdx[ii]], parents.row[parents.autoNdx[ii]]);
              if (6 == ii) {
                parents.col[parents.autoNdx[ii]] = Math.trunc(cols/2);
                parents.row[parents.autoNdx[ii]] = Math.trunc(rows/2);
              }
              parents.AvidaNdx[parents.autoNdx[ii]] = parents.col[parents.autoNdx[ii]] + cols * parents.row[parents.autoNdx[ii]];
            }
          }
          else {
            for (ii = 0; ii < parents.autoCnt; ii++) {
              if (ii<3) { parents.col[parents.autoNdx[ii]] = Math.trunc(cols/4) }
              else { parents.col[parents.autoNdx[ii]] = Math.trunc(cols*3/4) }
              cc = ii%3;
              parents.row[parents.autoNdx[ii]] = Math.trunc(rows*(2*cc+1)/6);
              if (6 == ii) {
                parents.col[parents.autoNdx[ii]] = Math.trunc(cols/2);
                parents.row[parents.autoNdx[ii]] = Math.trunc(rows/2);
              }
              parents.AvidaNdx[parents.autoNdx[ii]] = parents.col[parents.autoNdx[ii]] + cols * parents.row[parents.autoNdx[ii]];
            }
          }
          break;
        case 8:
          if (cols > rows) {  //place parents horizontally
            for (ii = 0; ii < parents.autoCnt; ii++) {
              if (ii<3) { parents.row[parents.autoNdx[ii]] = Math.trunc(rows/4) }
              else { parents.row[parents.autoNdx[ii]] = Math.trunc(rows*3/4) }
              cc = ii%3;
              parents.col[parents.autoNdx[ii]] = Math.trunc(cols*(2*cc+1)/6);
              //console.log('ii, cc, col, row',ii, cc, parents.col[parents.autoNdx[ii]], parents.row[parents.autoNdx[ii]]);
              if (6 <= ii) {
                cc = ii-5;
                parents.col[parents.autoNdx[ii]] = Math.trunc(cols*cc/3);
                parents.row[parents.autoNdx[ii]] = Math.trunc(rows/2);
              }
              parents.AvidaNdx[parents.autoNdx[ii]] = parents.col[parents.autoNdx[ii]] + cols * parents.row[parents.autoNdx[ii]];
            }
          }
          else {
            for (ii = 0; ii < parents.autoCnt; ii++) {
              if (ii<3) { parents.col[parents.autoNdx[ii]] = Math.trunc(cols/4) }
              else { parents.col[parents.autoNdx[ii]] = Math.trunc(cols*3/4) }
              cc = ii%3;
              parents.row[parents.autoNdx[ii]] = Math.trunc(rows*(2*cc+1)/6);
              if (6 <= ii) {
                cc = ii-5;
                parents.row[parents.autoNdx[ii]] = Math.trunc(rows*cc/3);
                parents.col[parents.autoNdx[ii]] = Math.trunc(cols/2);
              }
              parents.AvidaNdx[parents.autoNdx[ii]] = parents.col[parents.autoNdx[ii]] + cols * parents.row[parents.autoNdx[ii]];
            }
          }
          break;
        case 9:
          console.log('case9');
          for (ii = 0; ii < parents.autoCnt; ii++) {
            if (ii<3) { parents.row[parents.autoNdx[ii]] = Math.trunc(rows/5) }
            else if (ii < 6) { parents.row[parents.autoNdx[ii]] = Math.trunc(rows/2) }
            else { parents.row[parents.autoNdx[ii]] = Math.trunc(rows*4/5) }
            cc = ii%3;
            parents.col[parents.autoNdx[ii]] = Math.trunc(cols*(2*cc+1)/6);
            parents.AvidaNdx[parents.autoNdx[ii]] = parents.col[parents.autoNdx[ii]] + cols * parents.row[parents.autoNdx[ii]];
          }
          break;
        case 10:
          if (cols > rows) {  //place parents horizontally
            for (ii = 0; ii < parents.autoCnt; ii++) {
              if (ii<4) { parents.row[parents.autoNdx[ii]] = Math.trunc(rows/4) }
              else { parents.row[parents.autoNdx[ii]] = Math.trunc(rows*3/4) }
              cc = ii%4;
              parents.col[parents.autoNdx[ii]] = Math.trunc(cols*(2*cc+1)/8);
              //console.log('ii, cc, col, row',ii, cc, parents.col[parents.autoNdx[ii]], parents.row[parents.autoNdx[ii]]);
              if (8 <= ii) {
                cc = ii-8;
                parents.col[parents.autoNdx[ii]] = Math.trunc(cols*(2*cc+1)/4);
                parents.row[parents.autoNdx[ii]] = Math.trunc(rows/2);
              }
              parents.AvidaNdx[parents.autoNdx[ii]] = parents.col[parents.autoNdx[ii]] + cols * parents.row[parents.autoNdx[ii]];
            }
          }
          else {
            for (ii = 0; ii < parents.autoCnt; ii++) {
              if (ii<4) { parents.col[parents.autoNdx[ii]] = Math.trunc(cols/4) }
              else { parents.col[parents.autoNdx[ii]] = Math.trunc(cols*3/4) }
              cc = ii%4;
              parents.row[parents.autoNdx[ii]] = Math.trunc(rows*(2*cc+1)/8);
              if (8 <= ii) {
                cc = ii-8;
                parents.row[parents.autoNdx[ii]] = Math.trunc(rows*(2*cc+1)/4);
                parents.col[parents.autoNdx[ii]] = Math.trunc(cols/2);
              }
              parents.AvidaNdx[parents.autoNdx[ii]] = parents.col[parents.autoNdx[ii]] + cols * parents.row[parents.autoNdx[ii]];
            }
          }
          break;
        case 11:
          if (cols > rows) {  //place parents horizontally
            for (ii = 0; ii < parents.autoCnt; ii++) {
              if (ii<4) { parents.row[parents.autoNdx[ii]] = Math.trunc(rows/5) }
              else { parents.row[parents.autoNdx[ii]] = Math.trunc(rows*4/5) }
              cc = ii%4;
              parents.col[parents.autoNdx[ii]] = Math.trunc(cols*(2*cc+1)/8);
              if (8 <= ii) {
                cc = ii-7;
                parents.col[parents.autoNdx[ii]] = Math.trunc(cols*cc/4);
                parents.row[parents.autoNdx[ii]] = Math.trunc(rows/2);
              }
              parents.AvidaNdx[parents.autoNdx[ii]] = parents.col[parents.autoNdx[ii]] + cols * parents.row[parents.autoNdx[ii]];
            }
          }
          else {
            for (ii = 0; ii < parents.autoCnt; ii++) {
              if (ii<4) { parents.col[parents.autoNdx[ii]] = Math.trunc(cols/5) }
              else { parents.col[parents.autoNdx[ii]] = Math.trunc(cols*4/5) }
              cc = ii%4;
              parents.row[parents.autoNdx[ii]] = Math.trunc(rows*(2*cc+1)/8);
              if (8 <= ii) {
                cc = ii-7;
                parents.row[parents.autoNdx[ii]] = Math.trunc(rows*cc/4);
                parents.col[parents.autoNdx[ii]] = Math.trunc(cols/2);
              }
              parents.AvidaNdx[parents.autoNdx[ii]] = parents.col[parents.autoNdx[ii]] + cols * parents.row[parents.autoNdx[ii]];
            }
          }
          break;
        case 12:
          if (cols > rows) {  //place parents horizontally
            for (ii = 0; ii < parents.autoCnt; ii++) {
              if (ii<4) { parents.row[parents.autoNdx[ii]] = Math.trunc(rows/6) }
              else if (ii < 8){ parents.row[parents.autoNdx[ii]] = Math.trunc(rows/2) }
              else { parents.row[parents.autoNdx[ii]] = Math.trunc(rows*5/6) }
              cc = ii%4;
              parents.col[parents.autoNdx[ii]] = Math.trunc(cols*(2*cc+1)/8);
              parents.AvidaNdx[parents.autoNdx[ii]] = parents.col[parents.autoNdx[ii]] + cols * parents.row[parents.autoNdx[ii]];
            }
          }
          else {
            for (ii = 0; ii < parents.autoCnt; ii++) {
              if (ii<4) { parents.col[parents.autoNdx[ii]] = Math.trunc(cols/6) }
              else if (ii < 8){ parents.col[parents.autoNdx[ii]] = Math.trunc(cols/2) }
              else { parents.col[parents.autoNdx[ii]] = Math.trunc(cols*5/6) }
              cc = ii%4;
              parents.row[parents.autoNdx[ii]] = Math.trunc(rows*(2*cc+1)/8);
              parents.AvidaNdx[parents.autoNdx[ii]] = parents.col[parents.autoNdx[ii]] + cols * parents.row[parents.autoNdx[ii]];
            }
          }
          break;
        default:
          //console.log('bigger than 12');
          if (Math.trunc(Math.sqrt(parents.autoCnt)) == Math.sqrt(parents.autoCnt)) {
            sqLength = Math.sqrt(parents.autoCnt);
          } 
          else {
            sqLength = Math.trunc(Math.sqrt(parents.autoCnt))+1;
          }
            for (ii = 0; ii < parents.autoCnt; ii++) {
              cc = ii%sqLength;
              rr = Math.trunc(ii/sqLength);
              parents.col[parents.autoNdx[ii]] = Math.trunc(cols*(2*cc+1)/(2*sqLength));
              parents.row[parents.autoNdx[ii]] = Math.trunc(rows*(2*rr+1)/(2*sqLength));
            }
          break;
      }
      //console.log('rows, cols, AnBoxCnt', rows, cols, parents.autoCnt);
      //for (ii=0; ii< parents.autoCnt; ii++) {
      //  console.log("ii, col, row, ii", ii, parents.col[parents.autoNdx[ii]], parents.row[parents.autoNdx[ii]], parents.AvidaNdx[parents.autoNdx[ii]]);
      //}
    }

/* tell click apart from drag 
 * http://jsfiddle.net/0egur10s/2/
 * http://stackoverflow.com/questions/6042202/how-to-distinguish-mouse-click-and-drag
*/

/* canvas dragging images website examples
 * drag a box into a rectangle and it cannot leave 
 * http://jsfiddle.net/achudars/7h87a/
 * 
 * move box around that changes color with hover
 * http://jsfiddle.net/ARTsinn/DDZjA/
 * 
 * move red square around the canvas
 * http://jsfiddle.net/davidbarszczak/EnZEa/
 * 
 * Dragging objects on a canvas 
 * http://rectangleworld.com/blog/archives/129
 * http://rectangleworld.com/blog/archives/15
 * 
 * example with download
 * http://html5.litten.com/how-to-drag-and-drop-on-an-html5-canvas/
 * 
 * Move image from one canvas to another 
 * http://www.w3schools.com/html/html5_draganddrop.asp
 * http://www.w3schools.com/html/tryit.asp?filename=tryhtml5_draganddrop2
 * http://www.rgraph.net/blog/2013/january/an-example-of-html5-canvas-drag-and-drop.html
*/

/*move image to canvas and move it around on the canvase
 * http://jsfiddle.net/XU2a3/41/

/* We sites from Matt
 * https://jsfiddle.net/vozmegt9/7/#run
 * https://github.com/ruppmatt/avida-test-ui
 */

/* Comparison of Javascript frameworks
 * https://en.wikipedia.org/wiki/Comparison_of_JavaScript_frameworks
 * 
 * Analogizing jQuery and Dojo
 * http://thetascript.com/jqueryvsdojo/
*/

/* git hub info
 * http://gitready.com
 * http://rogerdudler.github.io/git-guide/

/* Dojo
 * The Definitive Guide
 * http://chimera.labs.oreilly.com/books/1234000001819/index.html
 * http://chimera.labs.oreilly.com/books/1234000001819/ch02.html
 * 
 * Down load 
 * http://dojotoolkit.org/download/#github
 * 
 * Dojo 10.2 guide
 * https://dojotoolkit.org/documentation/tutorials/1.10/modern_dojo/
 * 
 * DND example Junk outlet example
 * https://www.sitepen.com/blog/2011/12/05/dojo-drag-n-drop-redux/
 * 
 * DND intro
 * http://dojotoolkit.org/reference-guide/1.10/dojo/dnd.html
 * 
 * DND source
 * https://dojotoolkit.org/api/?qs=1.7/dojo/dnd/Source#singular
 * 
 * DND Move a node programatically 
 * http://stackoverflow.com/questions/1812148/dojo-dnd-move-node-programmatically
 * 
 * DND access newley copied node  
 * http://stackoverflow.com/questions/1632689/dojo-dnd-how-to-access-newly-copied-node-on-ondnddrop-event
 * 
 * Stop Drag should over ride checkAcceptance
 * http://stackoverflow.com/questions/2859188/dojo-drag-and-drop-stop-drag
 * 
 * 00fc91d4a98002ba5fdbee7bfa12eb58f129dd60
*/
