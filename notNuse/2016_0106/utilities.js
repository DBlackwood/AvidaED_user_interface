// all instances of Math.floor were Math.trunc, but Internet Explorer does not support Math.trunc

//because IE does not understand var event = new Event('change'); in the file fileIO.js
(function () {
  'use strict';
  function CustomEvent ( event, params ) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent( 'CustomEvent' );
    evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
    return evt;
  }

  CustomEvent.prototype = window.Event.prototype;

  window.CustomEvent = CustomEvent;
})();

/* ----------------------------------------
 linmap
 Function by Wesley R. Elsberry, based on
 1989 Turbo Pascal version.
 ---------------------------------------- */
var linmap = function(dx, d1, d2, r1, r2){
  'use strict';
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
  'use strict';
  var datacolorindex = Math.max(0,Math.min(cmap.length-1,Math.round(linmap(dx, d1, d2, 0, cmap.length-1))));
  var datacolor = cmap[datacolorindex];
  return datacolor;
}

var get_color1 = function(cmap, dx, d1, d2){
  'use strict';
  var datacolorindex = Math.max(0,Math.min(cmap.length-1,Math.round(linmap(dx, d1, d2, 1, cmap.length-1))));
  var datacolor = cmap[datacolorindex];
  return datacolor;
}

var get_color = function(cmap, dx, d1, d2, r1){
  'use strict';
  var datacolorindex = Math.max(0,Math.min(cmap.length-1,Math.round(linmap(dx, d1, d2, r1, cmap.length-1))));
  var datacolor = cmap[datacolorindex];
  return datacolor;
}

//from http://stackoverflow.com/questions/149055/how-can-i-format-numbers-as-money-in-javascript
//formats numbers with commas
Number.prototype.formatNum = function(c, d, t){
  'use strict';
  var n = this,
    c = isNaN(c = Math.abs(c)) ? 2 : c,
    d = d == undefined ? "." : d,
    t = t == undefined ? "," : t,
    s = n < 0 ? "-" : "",
    i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
    j = (j = i.length) > 3 ? j % 3 : 0;
  return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};

/*
 wsb(target, thestring)
 returns the part of the string that occurs before the target substring
 or the entire string if the target is not found.
 */
function wsb(target, strng){
  'use strict';
  var sb = strng;
  var tndx = strng.indexOf(target);
  if (-1 == tndx) {
    return sb;
  } else {
    sb = strng.substr(0, tndx);
    return sb;
  }
}
//string.trim() removes leading and trailing white space

/*
 wsa(target, thestring)
 returns the part of the string that follows the target or
 the empty string if the target is not found.
 */
function wsa(target, strng){
  'use strict';
  var sb = strng;
  var tndx = strng.indexOf(target);
  if (-1 == tndx) {
    return '';
  } else {
    sb = strng.substr(tndx + target.length, strng.length);
    return sb;
  }
}
/*
 So to extract the genome out of
 var genplus = "0,heads-default,abcdefghijklmnopqrstuvwxyz";
 var genome = wsa(",", wsa(",", genplus));
 */

//remove all commas; remove preceeding and trailing spaces; replace spaces with comma
var flexsplit = function (instr) {
  'use strict';
  var str1 = instr.replace(/,/g, '').replace(/^\s\s*/, '').replace(/\s\s*$/, '').replace(/[\s,]+/g, ',');

  return str1;
};

//**********************************************************************************************************************
/*** Created by ruppmatt on 12/16/15. */

function utf16to8(str) {
  'use strict';
  var out, i, len, c;
  out = "";
  len = str.length;
  for(i = 0; i < len; i++) {
    c = str.charCodeAt(i);
    if ((c >= 0x0001) && (c <= 0x007F)) {
      out += str.charAt(i);
    } else if (c > 0x07FF) {
      out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
      out += String.fromCharCode(0x80 | ((c >>  6) & 0x3F));
      out += String.fromCharCode(0x80 | ((c >>  0) & 0x3F));
    } else {
      out += String.fromCharCode(0xC0 | ((c >>  6) & 0x1F));
      out += String.fromCharCode(0x80 | ((c >>  0) & 0x3F));
    }
  }
  return out;
}

function utf8to16(str) {
  'use strict';
  var out, i, len, c;
  var char2, char3;

  out = "";
  len = str.length;
  i = 0;
  while(i < len) {
    c = str.charCodeAt(i++);
    switch(c >> 4)
    {
      case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
      // 0xxxxxxx
      out += str.charAt(i-1);
      break;
      case 12: case 13:
      // 110x xxxx   10xx xxxx
      char2 = str.charCodeAt(i++);
      out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
      break;
      case 14:
        // 1110 xxxx  10xx xxxx  10xx xxxx
        char2 = str.charCodeAt(i++);
        char3 = str.charCodeAt(i++);
        out += String.fromCharCode(((c & 0x0F) << 12) |
          ((char2 & 0x3F) << 6) |
          ((char3 & 0x3F) << 0));
        break;
    }
  }

  return out;
}

function utf8bytesEncode(str16){
  'use strict';
  var bytes = []
  var str8 = utf16to8(str16);
  for (var char of str8){
    bytes.push(char.charCodeAt(0));
  }
  return bytes;
}

function utf8bytesEecode(bytes8){
  'use strict';
  var chars = [];
  for (var byte of bytes8){
    chars.push(String.fromCharCode(byte));
  }
  return utf8to16(chars.join(''));
}

// displays text on screen instead of using consoe log
function display(text)
{   var para = document.createElement("p");
  var child = document.createTextNode(text);
  para.appendChild(child);
  document.body.appendChild(para);
}

//**********************************************************************************************************************
//   Another way to encode; decode stuff for emscripten files  system
//**********************************************************************************************************************
function encodeUtf8(s) {
  return unescape(encodeURIComponent(s));
}

function decodeUtf8(s) {
  return decodeURIComponent(escape(s));
}

var UTF8 = (function () {
  function UTF8() {
  }
  UTF8.getBytes = function (stringValue) {
    var bytes = [];
    for (var i = 0; i < stringValue.length; ++i) {
      bytes.push(stringValue.charCodeAt(i));
    }
    return bytes;
  };

  UTF8.getString = function (utftext) {
    var result = "";
    for (var i = 0; i < utftext.length; i++) {
      result += String.fromCharCode(parseInt(utftext[i], 10));
    }
    return result;
  };

  return UTF8;
})();

//Example of using the above functions
/*
var emTxt = encodeUtf8('George');
var emContents = UTF8.getBytes(emTxt);
// to go back
var emTxt2 = UTF8.getString(emContents);
var jsTxt = decodeUtf8(emTxt2);
console.log('emTxt', emTxt, '; jsTxt', jsTxt);
*/