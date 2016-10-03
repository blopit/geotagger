# mean-geotagger

## API

GET
https://geotaganything.herokuapp.com/tags?latitude=43.472839&longitude=-80.543185

POST
https://geotaganything.herokuapp.com/tags

BODY:
{
    "author":null,
    "category":"Food",
    "subcategory":"Other",
    "name":"Bon Appétit - Davis Centre",
    "description":"blah blah blah",
    "image":"https://uwaterloo.ca/food-services/sites/ca.food-services/files/BA.gif"
    "latitude":43.472839,
    "longitude":-80.543185
}

"latitude" & "longitude" are MANDATORY

Defaults:
{
    "author":null,
    "category":"Other",
    "subcategory":"Other",
    "name":"",
    "description":"",
    "image":"null
}

## Testing Locally

Install git, mongodb, nodejs, and npm. If you are running Ubuntu, this is easy:

        sudo apt-get install git mongodb nodejs npm

Start mongo (while specifying a storage directory):

        mkdir -p /data/db
        mongod

In another terminal, clone the repo:

        git clone https://github.com/blopit/geotagger && cd geotagger

Run the server:

        node server.js

Everything should be working now! Go to the following URL for the fruits of your labour:

        http://localhost:8080
