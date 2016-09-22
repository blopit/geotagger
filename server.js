var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;
var req = require('request');
var url = require('url');

var TAG_COLLECTION = "tags";
var SEARCH_RADIUS = 300; //in meters

var app = express();
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
var db;

// Connect to the database before starting the application server.
var mongouri = process.env.MONGODB_URI || "mongodb://localhost";
mongodb.MongoClient.connect(mongouri, function (err, database) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  // Save database object from the callback for reuse.
  db = database;
  console.log("Database connection ready");

  // Initialize the app.
  var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });
});

// TAGS API ROUTES BELOW

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

/*  "/tags"
 *    GET: finds all tags TODO: isolate to a region radius
 *    POST: creates a new tags
 */

app.get("/tags", function(req, res) {

  if (!(req.query.latitude && req.query.longitude)) {
    return res.status(400).json({message : "Must provide a latitude and longitude."});
  }
  var latitude = Number(req.query.latitude) || 0;
  var longitude = Number(req.query.longitude) || 0;

  db.collection(TAG_COLLECTION).find(
    {
      location:
        { $near :
          {
            $geometry: { type: "Point",  coordinates: [ latitude, longitude ] },
            $maxDistance: SEARCH_RADIUS
          }
        }
    }).toArray(function(err, docs) {
      if (err) {
        handleError(res, err.message, "Failed to get tags.");
      } else {
        res.status(200).json(docs);
      }
    });
});

app.post("/tags", function(req, res) {

  if (!(req.body.latitude && req.body.longitude)) {
    return res.status(400).json({message : "Must provide a latitude and longitude."});
  }

  var newTag = {};
  newTag.createDate = new Date();

  newTag.author = req.body.author || null;
  newTag.category = req.body.category || 'Other';
  newTag.name = req.body.name || '';
  newTag.description = req.body.description || '';
  newTag.points = 0;
  newTag.flagged = false;
  newTag.comments = [];
  newTag.location = {
    type: "Point",
    coordinates: [ req.body.latitude, req.body.longitude ]
  }

  db.collection(TAG_COLLECTION).insertOne(newTag, function(err, doc) {
    if (err) {
      return res.status(500).json({message : "Failed to create new tag."});
    } else {
      return res.status(201).json(doc.ops[0]);
    }
  });

});

/*  "/tags/:id"
 *    GET: find tag by id
 *    PUT: update tag by id
 *    DELETE: deletes tag by id
 */

app.get("/tags/:id", function(req, res) {
  db.collection(TAG_COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to get tag");
    } else {
      res.status(200).json(doc);
    }
  });
});

app.put("/tags/:id", function(req, res) {
  var updateDoc = req.body;
  delete updateDoc._id;

  db.collection(TAG_COLLECTION).updateOne({_id: new ObjectID(req.params.id)}, updateDoc, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to update tag");
    } else {
      res.status(204).end();
    }
  });
});

app.delete("/tags/:id", function(req, res) {
  db.collection(TAG_COLLECTION).deleteOne({_id: new ObjectID(req.params.id)}, function(err, result) {
    if (err) {
      handleError(res, err.message, "Failed to delete tag");
    } else {
      res.status(204).end();
    }
  });
});