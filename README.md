# mean-geotagger

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