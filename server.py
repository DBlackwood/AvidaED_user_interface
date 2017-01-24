from flask import Flask, render_template, send_from_directory, request
import json
import mysql.connector
from datetime import datetime
from colorama import Fore, Back, Style
import os, sys
from collections import namedtuple

app = Flask(__name__);  # Create flask application

# MySQL login credentials and options
db_options = {
        'user':'root',
        'password':'ATestingPassword',
        'database':'PostTest',
        'host':'127.0.0.1',
        'raise_on_warnings':True
    }


# Routes are how one maps URLs to what actions are taken
# We use decorators to map particular functions onto a route

# This route just gives access to the javascript files in the libs directory
# The return value is how the request was handled; in this case return
# the file from libs
@app.route('/libs/<path:path>')
def send_javascript(path):
    return send_from_directory('libs', path)



# This route returns our index page if the localhost URL is requested.
# Templates can contain fields that may be modified using Flask tools.
# We don't have any in index.html, but I'm using the render_template
# method anyway.
@app.route('/')
def show_root_page():
    return render_template('index.html')

@app.route('/indexDJB')
def show_root_pageDJB():
    return render_template('indexDJB.html')


# This route will be the location that we'll use to handle our POST request,
# put the data in the database, and send back a response
# The return value is in the format
# ResponseString, HTTP_CODE (int), HTTP_HEADERS (dict)
# The helper function generate_response will handing creating that
@app.route('/receive', methods=['POST'])
def process_post():
    global db_options #Expose our options map
    try:
        #Open the database and a cursor
        cnx = mysql.connector.connect(**db_options)
        cursor = cnx.cursor()

        #Get the data and substituion string ready
        #request.form is a dictionary containing values sent by the client
        to_store = combine_data({'date':datetime.utcnow()}, request.form)

        #I'm using a helper method to generate the insertion command
        insert_cmd = generate_insertion('ReceivedData', to_store)

        #Execute the command and comit it
        try:
            cursor.execute(insert_cmd, to_store)
            cnx.commit()
        finally:
            cursor.close()

        #Send a success response
        return generate_response({'success':True}, 200)
    except Exception as e:
        print(e)
        #Note that something went wrong and send a fail response
        return generate_response({'success':False}, 400)
    finally:
        #Cleanup
        cnx.close()


# Try to be RESTful and return the URIs (based on IDs) and comments for each
# entry in our database.  We're not going to send the entire log entry because
# that will be quite large in practice.  Clicking the log ID will redirect
# us to a page that contains the entire log
@app.route('/getlogs', methods=['GET'])
def send_table():
    global db_options #Expose our database options
    try:
        #Open the database and a cursor
        cnx = mysql.connector.connect(**db_options)
        cursor = cnx.cursor(buffered=True)
        fields = ['id', 'date', 'comment', 'email', 'method']
        cmd = generate_get('ReceivedData', fields)
        try:
            cursor.execute(cmd)
            results = []
            CursorFields = namedtuple("CursorFields", fields)
            for cfields in map(CursorFields._make, cursor):
                d_results = {}
                for f in fields:
                    d_results[f] = str(getattr(cfields,f))
                results.append(d_results)
        finally:
            cursor.close()
        return generate_response({'success':True,'results':results}, 200)
    except Exception as e:
        print(e)
        return generate_response({'success':False}, 400)
    finally:
        cnx.close()



# This method will return the log given how the URL is setup.
# In this case if we wanted the events log for entry 10:
# http://foo.com/log/10/events
# Either the log will be returned or a 404 error
@app.route('/log/<string:id>/<string:logtype>')
def get_log(id, logtype):
    global db_options #Expose our database options
    try:
        #Open the database and a cursor
        cnx = mysql.connector.connect(**db_options)
        cursor = cnx.cursor(buffered=True)
        cmd = generate_get('ReceivedData', [logtype], 'WHERE id=' + id)
        try:
            cursor.execute(cmd)
            if not cursor.with_rows:
                return '', 404
            elif cursor.rowcount == 1:
                retval = cursor.fetchone()[0]
                return 'NULL' if retval is None else retval.replace('\n','<br/>'), 200, {'ContentType':'text/plain'}
            else:
                return '', 404
        except Exception as e:
            print(e)
            return '', 404
        finally:
            cursor.close()
    except Exception as e:
        print(e)
        return '', 404
    finally:
        cnx.close()



# Serve up our webpage template
@app.route('/logs')
def table_view():
    return render_template('logs.html')

@app.route('/logsDJB')
def table_viewDJB():
    return render_template('logsDJB.html')

# Combine a base dictionary, d, with an additional dictionary j
# This function handles the case when information from outside of
# a HTTP request needs to get merged with another dictionary
def combine_data(d, j):
    for k,v in j.items():
        d[k]=v
    return d


# The MySQL connector needs the data in a particular format in order to insert
# it into the database.  It is a two part process: first create a template
# string that will be passed as the first parameter of cursor.execute.
# The string contains placeholders for the actual data.  In our case, these
# place holders are named in a Python-2 format-like manner.
# The dictionary's values to substitute the place-holding parameters is passed
# to the cursor.execute method as the second argument, where substitions
# are actually made.  (This method generates just the template string.)
# For example
# INSERT INTO mydb (field1, field2) VALUES (%(field1)s, %(field2)s)
# where field1 and field2 are keys to the dictionary provided by data
# The values will get inserted later by cursor.execute(template_string, dict)
def generate_insertion(table, data):
    #We need to play around to get the MySQL statement correct
    #when we're dealing with a dictionary worth of data
    ncol = len(data)
    cols = ', '.join(data.keys())  #List of our columns in order
    val_placeholder = ', '.join(map(lambda x: '%('+x+')s ', data.keys())) #Create our placeholders]
    insert_cmd =\
        "INSERT INTO {table} ({columns}) VALUES ({values})".format(
        columns=cols, values=val_placeholder, table=table)
    #print(Fore.MAGENTA + insert_cmd + Style.RESET_ALL)
    return insert_cmd


# A helper function to get particular fields in a table
def generate_get(table, fields, suffix=''):
    f = ', '.join(fields)
    cmd = 'SELECT {fields} FROM {table} {suffix}'.format(fields=f, table=table, suffix=suffix)
    #print(Fore.MAGENTA + cmd + Style.RESET_ALL)
    return cmd


# A helper function to make the return line for responses a little easier
# to look at
def generate_response(json_dict, code, header_dict={'ContentType':'application/json'}):
    response = json.dumps(json_dict), code, header_dict
    #print(Fore.CYAN + ', '.join(map(lambda x: str(x), response)) + Style.RESET_ALL)
    return response

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True)
