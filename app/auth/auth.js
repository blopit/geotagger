var express = require("express");
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;
var utils = require("../../utils");
var crypto = require("crypto");

var USER_COLLECTION = "users";

module.exports = (function(app, db) {
  var auth = express.Router();

  /*  "/auth"
   *    POST: creates a new user
   *    GET: gets a list of users
   */

  auth.post("/", function(req, res) {
  	
  	if (!(req.body.username && req.body.password)) {
      return res.status(400).json({ message : "Must provide a username and password." });
    }

    var newUser = {};
    newUser.createDate = new Date();

    newUser.username	= req.body.username;
    newUser.privilege	= req.body.privilege || 'default'; // valid privileges are default and admin
    newUser.salt		= crypto.randomBytes(256).toString('hex');

    crypto.pbkdf2(req.body.password, newUser.salt, 100000, 512, 'sha512', cryptoCallback);

    function cryptoCallback(err, key) {
    	if (err) {
    		utils.handleError(res, err.message, "Failed to generate password hash.");
    	}

    	newUser.password_hash = key.toString('hex');

	    db.collection(USER_COLLECTION).insertOne(newUser, function(err, doc) {
	      if (err) {
	        utils.handleError(res, err.message, "Failed to create new user.");
	      } else {
	        return res.status(201).json(doc.ops[0]);
	      }
	    });
	}
  });

  auth.get("/", function(req, res) {
  	console.log("HI");
  });

  /*  "/auth"
   *    PUT: modifies a user
   *    GET: gets data for a user
   *    DELETE: deletes a user
   */

  auth.put("/:id", function(req, res) {
  	console.log("HI");
  });

  auth.get("/:id", function(req, res) {
  	console.log("HI");
  });

  auth.delete("/:id", function(req, res) {
  	console.log("HI");
  });

  /*  "/auth/login"
   *    POST: validates password and creates auth token
   */

  auth.post("/login/", function(req, res) {
  	console.log("HI");
  });

  /*  "/auth/logout"
   *    POST: destroys auth token
   */

  auth.post("/logout/", function(req, res) {
  	console.log("HI");
  });

  app.use('/auth', auth);
});