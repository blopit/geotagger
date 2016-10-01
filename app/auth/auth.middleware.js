var express = require("express");

module.exports = (function(app, db) {
	var authM = {};

	authM.validateUser = function(req, res, next) {
		console.log("User validated");
		next();
	}

	return authM;
});