var app = angular.module('geotagger', ['ngMap']);

app
  .controller('MapController', function($scope, NgMap) {
  var ctrl = this;
  ctrl.geoTags = [];
  ctrl.curTag;
  
  NgMap.getMap().then(function(map) {
    // Print debug info.
    ctrl.map = map;
    ctrl.geoTags.push({position:[40.71,-74.21], name:"hello"});
    ctrl.geoTags.push({position:[40.72,-74.20], name:"marker", animation:"Animation.DROP"});
    ctrl.geoTags.push({position:[40.73,-74.19], name:"drag me", draggable:true});
    ctrl.geoTags.push({position:[40.74,-74.18], name:"how", animation:"Animation.BOUNCE"});
    ctrl.geoTags.push({position:[40.75,-74.17], name:"are"});
    ctrl.geoTags.push({position:[40.76,-74.16], name:"you", icon:"https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png"});
    console.log(map.getCenter());
    console.log('markers', map.markers);
    console.log('shapes', map.shapes);
  });

  ctrl.toggleInfoWindow = (e, tag) => {
    if (ctrl.curTag == tag){
      ctrl.hideDetail();
      ctrl.curTag = undefined;
    } else {
      ctrl.showDetail(e,tag);
    }
  }

  ctrl.showDetail = (e, tag) => {
    ctrl.curTag = tag;
    ctrl.map.showInfoWindow('foo', ctrl.geoTags.indexOf(ctrl.curTag).toString());
    console.log('clicked ' + ctrl.curTag.name +", id: "+ ctrl.geoTags.indexOf(ctrl.curTag));
  };

  ctrl.hideDetail = () => {
    ctrl.map.hideInfoWindow('foo');
  };

});
