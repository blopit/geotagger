#!/usr/bin/env python
"""Scrape location data from the UWAPI and upload to the geotagging database.

Usage:
    > scrapers/uwapi https://geotaganything.herokuapp.com/
    Username: uwapi
    Password:
    Authenticating user...
    Downloading 'Food Services'...
    Found 100 entries
    Uploading 'Food Services'...
"""

from collections import namedtuple
from getpass import getpass
import json
import sys
import urllib2
import urlparse

# UWAPI key
API_KEY = 'a19ad7d4ee67feebd6b7caa461251302'

Source = namedtuple('Source', ['name', 'url', 'map_func'])

def map_food_services(json):
    return {
            'latitude':    json['latitude'],
            'longitude':   json['longitude'],
            'name':        json['outlet_name'],
            'description': json['description'],
            'category':    "Food",
            'image':       json['logo'],
    }

SOURCES = {
    # Food services
    Source(
        name="Food Services",
        url='https://api.uwaterloo.ca/v2/foodservices/locations.json?key=' + API_KEY,
        map_func=map_food_services,
    ),
}


def get_auth_token(site_url, username, password):
    print "Authenticating user..."
    req = urllib2.Request(site_url)
    req.add_header('Content-Type', 'application/json')
    response = urllib2.urlopen(req, json.dumps({
        'username': username,
        'password': password,
    }))
    return json.loads(response.read())['auth_token']


def get_data(url):
    return json.load(urllib2.urlopen(url))['data']


def post(site_url, auth_token, data):
    req = urllib2.Request(site_url)
    req.add_header('Content-Type', 'application/json')
    req.add_header('authorization', 'Bearer: ' + auth_token)
    response = urllib2.urlopen(req, json.dumps(data))


def scrape(site_url, author, auth_token):
    for source in SOURCES:
        print "Downloading '%s'..." % source.name
        data = get_data(source.url)
        print "Found %s entries" % len(data)
        print "Uploading '%s'..." % source.name
        for datum in get_data(source.url):
            datum['author'] = author
            post(site_url, auth_token, datum)


if __name__ == '__main__':
    if len(sys.argv) != 2:
        print >> sys.stderr, "Incorrect number of arguments. Expected 1."
        exit(1)
    auth_url = urlparse.urljoin(sys.argv[1], 'auth/login')
    tags_url = urlparse.urljoin(sys.argv[1], 'tags')

    username = raw_input("Username: ")
    password = getpass("Password: ")

    try:
        auth_token = get_auth_token(
                site_url=auth_url,
                username=username,
                password=password
        )
        scrape(
                site_url=tags_url,
                author=username,
                auth_token=auth_token
        )
    except urllib2.HTTPError as e:
        print >> sys.stderr, "Error:", e
        exit(1)
