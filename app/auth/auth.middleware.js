var express = require("express");
var crypto	= require("crypto");
var utils	= require("../../utils");

var USER_COLLECTION = "users";

module.exports = (function(app, db) {
	var authM = {};

	authM.validateUser = function(req, res, next) {
		var credentials = [];
		if (!req.headers.authorization) {
			return res.status(401).json({ message : "User must be authenticated for this action." });
		}

		credentials = req.headers.authorization.split(' ');

		if (credentials[0] != 'Bearer:') {
			return res.status(401).json({ message : "'Bearer:' must be first field in authorization header." });
		}

		crypto.pbkdf2(credentials[1], '', 1, 512, 'sha512', authCallback);

		// find the user with the provided auth token
		function authCallback(err, key) {
			if (err) {
				utils.handleError(res, err.message, "Failed to create auth token hash.");
			}

			db.collection(USER_COLLECTION).findOne({auth_token_hash: key.toString('hex')}, function(err, doc) {
			  if (err) {
			    utils.handleError(res, err.message, "Failed to get user.");
			  } else if (!doc) {
			    res.status(401).json({ message : "Invalid auth token." });
			  } else {
			  	req.user = doc;
			  	next();
			  }
			});
		}
	}

	return authM;
});