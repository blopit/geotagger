module.exports = {
	// Generic error handler used by all endpoints.
	handleError: function(res, reason, message, code) {
	  console.log("ERROR: " + reason);
	  res.status(code || 500).json({"error": message});
	}
}