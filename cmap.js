
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
	    return 0.0; // should be NaN
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
var get_color = function(cmap, dx, d1, d2){
    var datacolorindex = Math.max(0,Math.min(cmap.length-1,Math.round(linmap(dx, d1, d2, 0, cmap.length-1))));
    var datacolor = cmap[datacolorindex];
    return datacolor;
}


