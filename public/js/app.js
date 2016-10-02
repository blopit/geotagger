var app = angular.module('geotagger', ['ngMap']);

app.controller('MapController', function(NgMap) {
  NgMap.getMap().then(function(map) {
    // Print debug info.
    console.log(map.getCenter());
    console.log('markers', map.markers);
    console.log('shapes', map.shapes);
  });
});
