var express = require("express");
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;
var utils = require("../../utils");

var TAG_COLLECTION = "tags";
var SEARCH_RADIUS = 300; //in meters

module.exports = (function(app, db) {
  var tags = express.Router();

  /*  "/tags"
   *    GET: finds all tags
   *    POST: creates a new tag
   */

  tags.get("/", function(req, res) {

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
          utils.handleError(res, err.message, "Failed to get tags.");
        } else {
          res.status(200).json(docs);
        }
      });
  });

  tags.post("/", function(req, res) {

    if (!(req.body.latitude && req.body.longitude)) {
      return res.status(400).json({ message : "Must provide a latitude and longitude." });
    }

    var newTag = {};
    newTag.createDate = new Date();

    newTag.author       = req.body.author || null;
    newTag.category     = req.body.category || 'Other';
    newTag.subcategory  = req.body.subcategory || 'Other';
    newTag.name         = req.body.name || '';
    newTag.description  = req.body.description || '';
    newTag.image        = req.body.image || null;
    newTag.points       = 0;
    newTag.flagged      = false;
    newTag.comments     = [];
    newTag.location     = {
      type: "Point",
      coordinates: [ req.body.latitude, req.body.longitude ]
    };

    db.collection(TAG_COLLECTION).insertOne(newTag, function(err, doc) {
      if (err) {
        utils.handleError(res, err.message, "Failed to create new tag.");
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

  tags.get("/:id/", function(req, res) {
    db.collection(TAG_COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, function(err, doc) {
      if (err) {
        utils.handleError(res, err.message, "Failed to get tag.");
      } else {
        res.status(200).json(doc);
      }
    });
  });

  tags.put("/:id/", function(req, res) {
    var updateDoc = req.body;
    delete updateDoc._id;

    db.collection(TAG_COLLECTION).updateOne({_id: new ObjectID(req.params.id)}, updateDoc, function(err, doc) {
      if (err) {
        utils.handleError(res, err.message, "Failed to update tag.");
      } else {
        res.status(204).end();
      }
    });
  });

  tags.delete("/:id/", function(req, res) {
    db.collection(TAG_COLLECTION).deleteOne({_id: new ObjectID(req.params.id)}, function(err, result) {
      if (err) {
        utils.handleError(res, err.message, "Failed to delete tag.");
      } else {
        res.status(204).end();
      }
    });
  });

  app.use('/tags', tags);
});