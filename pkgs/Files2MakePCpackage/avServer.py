import sys
import os
import cherrypy
import webbrowser
import thread
import time

class StaticAndDynamic(object):
    _cp_config = {'tools.staticdir.on' : True,
                  'tools.staticdir.dir' : os.getcwd(),
                  'tools.staticdir.index' : 'index.html',
    }

thread.start_new_thread(cherrypy.quickstart, (StaticAndDynamic(), ))

print "Delay to allow server to start."
time.sleep(5)

print "Opening Avida-ED in default browser."
webbrowser.open(r"http://localhost:8080/AvidaEd.html")

while 1:
    time.sleep(10)
    pass
