angular.module('geotagger', ['ngMap'])
.controller('MapController', function ($scope, NgMap, $http) {
    var ctrl = this;
    $scope.geoTags = [];  // Popular via AJAX request.
    ctrl.curTag;
    ctrl.inputFields = {
      position: [40.77, -74.15],
      name: 'Untitled',
      category: 'Other',
      subcategory: 'Other',
      description: '',
      icon: null,
    };

    NgMap.getMap().then(function (map) {
      // Print debug info.
      ctrl.map = map;
      $scope.geoTags.push({ position: [40.71, -74.21], name: "hello" });
      $scope.geoTags.push({ position: [40.72, -74.20], name: "marker", animation: "Animation.DROP" });
      $scope.geoTags.push({ position: [40.73, -74.19], name: "drag me", draggable: true });
      $scope.geoTags.push({ position: [40.74, -74.18], name: "how", animation: "Animation.BOUNCE" });
      $scope.geoTags.push({ position: [40.75, -74.17], name: "are" });
      $scope.geoTags.push({ position: [40.76, -74.16], name: "you", icon: "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png" });

      var center = {latitude: 43.47, longitude: -80.54}; // Default center is Waterloo.
      if (map.getCenter()) {
        var center = {latitude: map.getCenter().lat(), longitude: map.getCenter().lon()};
      }
      $http({
        url: 'tags',
        params: center
      }).success(function(data) {
        console.log(data);
        angular.forEach(data, function (tag) {
          $scope.geoTags.push({position: tag.location.coordinates, name: tag.name});
        });
      }).error(function(data) {
          console.log("Failed reading HTTP");
      });
    });

    /*$scope.$watchCollection(function() {return $scope.geoTags; }, function (newVal, oldVal) {
      console.log('markers', newVal);
      var i = newVal.length - 1;
        var latlng = new google.maps.LatLng(newVal[i].position[0],newVal[i].position[1]);

        var newTag = new google.maps.Marker({
           position: latlng,
           icon: newVal[i].icon,
           title: newVal[i].title
         });
         newTag.setPosition(latlng);
         newTag.setMap(ctrl.map);

    });*/

    ctrl.createTag = () => {
      if (!ctrl.inputFields.position[0] || !ctrl.inputFields.position[1]){
        alert("Latitude and Longitude required!!!");
        return;
      }
      console.log('Creating tag', ctrl.inputFields);
      $scope.geoTags.push(ctrl.inputFields);
    }

    ctrl.toggleInfoWindow = (e, tag) => {
      if (ctrl.curTag == tag) {
        ctrl.hideDetail();
        ctrl.curTag = undefined;
      } else {
        ctrl.showDetail(e, tag);
      }
    }

    ctrl.showDetail = (e, tag) => {
      ctrl.curTag = tag;
      ctrl.map.showInfoWindow('foo', $scope.geoTags.indexOf(ctrl.curTag).toString());
      console.log('clicked ' + ctrl.curTag.name + ", id: " + $scope.geoTags.indexOf(ctrl.curTag));
    };

    ctrl.hideDetail = () => {
      ctrl.map.hideInfoWindow('foo');
    };

    ctrl.register = () => {
      console.log('Register: ' + ctrl.register.user + '/' + ctrl.register.pass);
    };

    ctrl.login = () => {
      console.log('Login: ' + ctrl.login.user + '/' + ctrl.login.pass);
    };
  });
