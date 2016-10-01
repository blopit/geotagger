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
   */

  auth.post("/", function(req, res) {
  	
  	if (!(req.body.username && req.body.password)) {
      return res.status(400).json({ message : "Must provide a username and password." });
    }

    var newUser = {};
    newUser.createDate = new Date();

    newUser.username	= req.body.username;
    newUser.privilege	= 'default'; // valid privileges are default and admin
    newUser.salt		= crypto.randomBytes(256).toString('hex');

    crypto.pbkdf2(req.body.password, newUser.salt, 100000, 512, 'sha512', cryptoCallback);

    // Insert user with newly created password hash
    function cryptoCallback(err, key) {
    	if (err) {
    		utils.handleError(res, err.message, "Failed to generate password hash.");
    	}

    	newUser.password_hash = key.toString('hex');

	    db.collection(USER_COLLECTION).insertOne(newUser, function(err, doc) {
	      if (err) {
	        utils.handleError(res, err.message, "Failed to create new user.");
	      } else {
	        res.status(201).json(_filterUser(doc.ops[0]));
	      }
	    });
	}
  });

  /*  "/auth/:id"
   *    GET: gets data for a user
   *    PUT: modifies a user
   *    DELETE: deletes a user
   */

  auth.get("/:id/", function(req, res) {
  	db.collection(USER_COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, function(err, doc) {
      if (err) {
        utils.handleError(res, err.message, "Failed to get user.");
      } else {
        res.status(200).json(_filterUser(doc));
      }
    });
  });

  auth.put("/:id/", function(req, res) {
  	var updateDoc = req.body;
    delete updateDoc._id;

    db.collection(USER_COLLECTION).updateOne({_id: new ObjectID(req.params.id)}, {$set: updateDoc}, function(err, doc) {
      if (err) {
        utils.handleError(res, err.message, "Failed to update user.");
      } else {
        res.status(204).end();
      }
    });
  });

  auth.delete("/:id/", function(req, res) {
  	db.collection(USER_COLLECTION).deleteOne({_id: new ObjectID(req.params.id)}, function(err, result) {
      if (err) {
        utils.handleError(res, err.message, "Failed to delete user.");
      } else {
        res.status(204).end();
      }
    });
  });

  /*  "/auth/login"
   *    POST: validates password and creates auth token
   */

  auth.post("/login/", function(req, res) {

  	if (!(req.body.username && req.body.password)) {
      return res.status(401).json({ message : "Missing username or password." });
    }

    // Find the user in order to compare the user's password to the given password
    db.collection(USER_COLLECTION).findOne({ username: req.body.username }, function(err, doc) {
      if (err) {
        utils.handleError(res, err.message, "Failed to get user.");
      } else if (!doc) {
      	console.log("NOOB");
      	res.status(401).json({ message : "Invalid username or password." });
      } else {
        crypto.pbkdf2(req.body.password, doc.salt, 100000, 512, 'sha512', cryptoCallback(doc));
      }
    });

    // Check if password is valid, and create authentication token if it is
    function cryptoCallback(user) {
    	return function(err, key) {
    		if (err) {
    			utils.handleError(res, err.message, "Failed to create password hash.");
    		} else if (user.password_hash != key.toString('hex')) {
    			console.log("HI");
    			res.status(401).json({ message : "Invalid username or password." });
    		} else {
    			user.auth_token = crypto.randomBytes(256).toString('hex');
    			crypto.pbkdf2(user.auth_token, '', 1, 512, 'sha512', authCallback(user));
    		}
    	};
    }

    // Store a hash of the auth token in the database
    function authCallback(user) {
    	return function(err, key) {
    		if (err) {
    			utils.handleError(res, err.message, "Failed to create auth token hash.");
    		} else {
    			var updateDoc = {auth_token_hash: key.toString('hex')};

    			db.collection(USER_COLLECTION).updateOne({_id: new ObjectID(user._id)}, {$set: updateDoc}, function(err, doc) {
			      if (err) {
			        utils.handleError(res, err.message, "Failed to update user's auth token.");
			      } else {
			        res.status(200).json(_filterUser(user));
			      }
			    });
    		}
    	};
    }
  });

  /*  "/auth/logout"
   *    POST: destroys auth token
   */

  auth.post("/logout/", function(req, res) {
  	var updateDoc = {auth_token_hash: ""};

  	db.collection(USER_COLLECTION).updateOne({username: req.body.username}, {$unset: updateDoc}, function(err, result) {
      if (err) {
        utils.handleError(res, err.message, "Failed to log out.");
      } else {
        res.status(200).end();
      }
    });
  });

  // HELPER FUNCTIONS

  // Filters the user to avoid sending any password information
  function _filterUser(user) {
  	var filteredUser = {};

  	filteredUser._id		= user._id;
  	filteredUser.username	= user.username;
  	filteredUser.privilege 	= user.privilege;
  	filteredUser.auth_token	= user.auth_token;
  	return filteredUser;
  }

  app.use('/auth', auth);
});