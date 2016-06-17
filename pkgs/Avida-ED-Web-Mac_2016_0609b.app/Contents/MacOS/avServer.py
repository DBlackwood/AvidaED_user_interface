import sys
import os
import cherrypy
import webbrowser
import thread
import time

class StaticAndDynamic(object):
    resource_path = os.path.abspath(os.path.dirname(sys.argv[0]) + '/../Resources')
    _cp_config = {'tools.staticdir.on' : True,
                  'tools.staticdir.dir' : resource_path,
                  'tools.staticdir.index' : 'index.html',
    }

    @cherrypy.expose
    def do_contact(self, **params):
        """Stuff to make a contact happen."""
        pass

    @cherrypy.expose
    def environ(self):
        return os.environ

    @cherrypy.expose
    def argv(self):
        return sys.argv

    @cherrypy.expose
    def respath(self):
        return os.path.abspath(os.path.dirname(sys.argv[0]) + '/../Resources')

thread.start_new_thread(cherrypy.quickstart, (StaticAndDynamic(), ))

print "sleeping"
time.sleep(5)

print "awake, calling url"
webbrowser.open(r"http://localhost:8080/AvidaED.html")

print "done"

time.sleep(20)

