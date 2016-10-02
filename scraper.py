__author__ = 'shrenilpatel'

import json
import urllib2

#FOOD SERVICE
getUrl = "https://api.uwaterloo.ca/v2/foodservices/locations.json?key=a19ad7d4ee67feebd6b7caa461251302"
#postUrl = 'https://geotaganything.herokuapp.com/tags' #ACTUAL
postUrl = 'http://localhost:5000/tags' #LOCAL

def get(url):
    jsn = json.load(urllib2.urlopen(url))
    items = jsn['data']
    ret = []
    for item in items:
        lat = item['latitude']
        lon = item['longitude']
        desc = item['description']
        name = item['outlet_name']
        cat = "Food"
        image = item['logo']
        subcat = None

        data = {
            'latitude': lat,
            'longitude': lon,
            'name': name,
            'description': desc,
            'category': cat,
            'image': image
        }

        print data
        ret.append(data)

    return ret

def post(data, url):
    req = urllib2.Request(url)
    req.add_header('Content-Type', 'application/json')
    response = urllib2.urlopen(req, json.dumps(data))


data = get(getUrl)
for datum in data:
    post(datum,postUrl)