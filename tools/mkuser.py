#!/usr/bin/env python
"""Create a new user on geotagging database.

Usage:
    > tools/mkuser.py https://geotaganything.herokuapp.com/
    Username: toomanycooks
    Password:
    User 'toomanycooks' created with id 101
"""

from collections import namedtuple
from getpass import getpass
import json
import sys
import urllib2
import urlparse


def mkuser(site_url, username, password):
    """Make a new user and returns a dictionary containing {_id, username, priviledge}."""
    req = urllib2.Request(site_url)
    req.add_header('Content-Type', 'application/json')
    response = urllib2.urlopen(req, json.dumps({
        'username': username,
        'password': password,
    }))
    return json.loads(response.read())


if __name__ == '__main__':
    if len(sys.argv) != 2:
        print >> sys.stderr, "Incorrect number of arguments. Expected 1."
        exit(1)

    try:
        user = mkuser(
                site_url=urlparse.urljoin(sys.argv[1], 'auth'),
                username=raw_input("Username: "),
                password=getpass("Password: ")
        )
        print "User '%s' created with id %s" % (user['username'], user['_id'])
    except urllib2.HTTPError as e:
        print >> sys.stderr, "Error:", e
        exit(1)
