The actual packages are not here because git hub says they are too big to store. 

======== From Wesley's email and added notes by Diane =======================
I made a Windows installer for Avida-ED.
Steps taken:

Cloned av_ui project from GitHub.

Created "avServer.py" file. This is a program that uses the CherryPy web
microframework to establish a standalone web server on the host machine
using port 8080. The CherryPy instance is launched in a thread. A
5-second delay allows for load time of the CherryPy instance. A call to
webbrowser.open() will launch the Avida-ED local URL
(http://localhost:8080/AvidaED.html) in the user's default browser. The
application is portable; avServer.py uses os.getcwd() to obtain the
current working directory and will statically serve files from it.

Used cx_freeze to create an executable version of avserver.py.

python path\to\cxfreeze avServer.py --target-dir dist
python c:\Anaconda2\Scripts\cxfreeze avServer.py --target-dir dist

Created a directory to combine the executable and Avida-ED files,
"av_ui_file". This puts the executable and its supporting files in the
root of the av_ui files.

DJB_notes
copy the folder avServer.py, avServer.spec  into av_ui folder to be packaged
copy the contents of the dist folder into the av_ui folder to be packaged
double click on avServer.exe to check to see that it works.
  should pop up a terminal window running the server and open the default server
  with a tab/window pointing to http://localhost:8080/AvidaEd.html
copy avida-ed-web-inno-setup-script.iss  into av_ui folder to be packaged

Used Inno Setup to create a Windows installer. This results in an
executable setup file less than 29 MB in size.

DJB addition: this is in windows rather than the terminal
  start type in inno. choose Inno Script Studio
  open avida-ed-web-inno-setup-script.iss that is in  av_ui folder to be packaged
  edit paths as needed.
  run.
  find avida-ed-web-setup.exe in the output folder
  change the name to reflect the current version. 

Uploaded the Windows installer to the bwng.us site.

Altered the index.html file in the Avida-ED directory to also link the
Windows installer file, and display the MD5 hash of the file.


Changes to the Avida-ED program will require running through these steps
again. While this is not a huge effort, it is something additional to do.

I would recommend incorporating the avServer.py file in the GitHub
project. While the Windows installer is, of course, useful only to
Windows users, the avServer.py file should work cross-platform.
cx_freeze could be employed to create Mac OS X and Linux versions of a
standalone executable to serve Avida-ED locally on each of those systems.

========================
First time on new machine (PC or parallels)

Install AnacondaPython  https://www.continuum.io/downloads

Open Anaconda prompt  (start menu - Anaconda - cmd prompt
 - >conda update conda
 -    proceed ([y]/n)?
 - >easy_install cx_freeze
 
Get Inno Setup (use webbrowser)
   http://jrsoftware.org/isdl.php
    - get most recent stable release for windows)
    - get QuickStart Pack with unicode (Innosetup-qsp-5.5.9-unicode.exe)
    - double click on file in windows explorer to run install executable
    
========================
Making a new version 

Make a copy of av_ui using get clone (or just copy)
 - work in the copy as it will make alot of intermediate files that I
   don't want in the main repository. 
   
   
