#!/usr/bin/env python

from urllib2 import *
from time import gmtime, strftime

print strftime("%Y-%m-%d %H:%M:%S", gmtime()) + " Preparing to update Solr"

host = "http://184.106.176.86:8080/solr/jda/"

conn = urlopen(host + "dataimport?command=status&wt=python")
response = eval(conn.read())

print strftime("%Y-%m-%d %H:%M:%S", gmtime()) + " Total documents processed on the last request {0}".format(response["statusMessages"]["Total Documents Processed"])

if response['status'] is 'idle':
    conn = urlopen(host + "dataimport?command=full-import&clean=false&wt=python") 
    print strftime("%Y-%m-%d %H:%M:%S", gmtime()) + " Solr is idle. Update request sent."
    
print strftime("%Y-%m-%d %H:%M:%S", gmtime()) + " Shutting down. Server status " + response['status']
