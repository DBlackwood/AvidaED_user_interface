# av_ui : Project for Avida-ED Web

## Introduction

The award-winning Avida-ED educational program has been distributed in
the past in platform-specific versions for Apple Mac OS X, Windows, and
Linux. The difficulties involved in maintaining separate code bases has
limited our ability to update these versions, with the Linux version
being dropped in 2008 and the Windows version last having an update in
2011. A different approach was needed. This project aims to produce a
version of Avida-ED that replicates the functionality of the latest
desktop version (Apple Mac OS X Avida-ED 2) and runs within a web
browser window.

## Techniques

The ability to run Avida-ED as a web application became a possibility
with the introduction of the Emscripten compiler technology. Emscripten
can compile the Avida C++ code to a Javascript callable library. This
is bleeding-edge technology and is not yet reduced to a build process
that can be simply described or replicated, but we hope that will become
the case in the future. The Avida version used in Avida-ED Web is the
latest version of this artificial life research tool.

The user interface for Avida-ED Web is implemented in HTML5, CSS3, and
Javascript. The basic layout was done in the Maqetta UI design tool,
which set a primary reliance on the Dojo Javascript framework. The
design goal was to replicate the latest Mac OS X Avida-ED interface.

## Usage

### Hosting

The project needs to be hosted on a web server. The user will request
the AvidaED.html file to load the application.

The "avida.js" and "avida.js.mem" files were pulled from the Avida github
repository and added to the root of the distribution on the web server.

### Local hosting

In addition to the instructions above, some more work is needed for
locally hosting AvidaEd Web.

If hosting this on the local machine, Python can be used to set up
a web server.

:: cd /path/to/av_ui  
:: python -m SimpleHTTPServer

One can then access the AvidaEd application with

:: http://127.0.0.1/AvidaED.html

Other web servers should work as well for local hosting (XAMPP and
similar projects), but we have not tested those.


## Build

The user interface, being implemented in HTML5, CSS3, and Javascript,
requires no compilation.

The Avida-core library, however, needs to be built and compiled to
a pair of Javascript libraries, "avida.js" and "avida.js.mem". The
instructions for this are not yet available.

## Differences from Mac OS X version 2

The difference in technology between a web application and a desktop
application does result in visual and behavioral differences between
the two.

### Filesystem differences

In the desktop application, once a workspace was established, further
work automatically was saved to it.

In web applications, the security model prevents any direct access
of an application to the native filesystem. Therefore, any work done
in the web application will be lost unless explicitly downloaded by
the user to their local filesystem. Thus, the user is responsible
for exporting the workspace after any work they wish to save.

The exported workspace from the Avida-ED Web application is designed
to be backwards-compatible with the workspaces used by the Mac OS X
Avida-ED version 2 application.

### Drag and Drop sources and targets

#### Population mode

Configured dishes and Populated dishes can be dragged from the
freezer to the configuration text box above the population grid;
they cannot be dropped on the grid itself.

#### Analysis mode

Populated dishes must be dragged to one of the text boxes at the
bottom; they cannot be dropped on the chart area.



