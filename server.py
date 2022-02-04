from flask import Flask,request,send_from_directory,abort
import json
import os
import re

regex1 = r"[^A-Za-z1-9\- ]"
regex2 = r"[- ]+"

def normalize(st):
    return re.sub(regex2,"-",re.sub(regex1,"",st)).lower()

app = Flask(__name__)
app.url_map.strict_slashes = False

perPage = 20

findex = json.load(open("data_de.json","r"))

@app.route("/")
def index():
    return send_from_directory('.', "index.html")

@app.route("/api/findPost/<string:pid>")
def findPost(pid):
    for i in findex:
        if(i["id"]==pid):
            return i

@app.route("/api/<int:number>")
def get(number):
    return send_from_directory('backup_6EJWUPYU', str(number)+".json")

@app.route("/api/<string:category>", defaults={'author':"all", 'query': "all", 'startAt': 0})
@app.route("/api/<string:category>/<int:startAt>", defaults={'author':"all", 'query': "all"})
@app.route("/api/<string:category>/<string:author>", defaults={'query': "all", 'startAt': 0})
@app.route("/api/<string:category>/<string:author>/<int:startAt>", defaults={'query': "all"})
@app.route("/api/<string:category>/<string:author>/<string:query>", defaults={'startAt': 0})
@app.route("/api/<string:category>/<string:author>/<string:query>/<int:startAt>")
def search(category,author,query,startAt):
    i = 0
    e = startAt
    ret = []
    while(i<(perPage)):
        if(len(findex)<=e):
            e = "-"
            break
        if((category=="all" or normalize(category)==normalize(findex[e]["subforum"])) and (query=="all" or query.lower() in findex[e]["title"].lower()) and (author=="all" or author==findex[e]["poster"])):
            ret.append(findex[e])
            i+=1
        e+=1
    return {
        "data":ret,
        "next":e
    }

@app.route("/<path:path>")
def sendFile(path):
    return send_from_directory('.', path)

app.run(debug=False, host='10.0.0.11',threaded=False, port=80)