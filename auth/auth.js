var express = require("express");
var mongodb = require("mongodb");

module.exports = (function(app, db) {
  var auth = express.Router();

  /*  "/auth"
   *    GET: finds all tags TODO: isolate to a region radius
   *    POST: creates a new tags
   */

  auth.get("/", function(req, res) {
  	console.log("HI");
  });

  app.use('/auth', auth);
});