var map;
// Create a new blank array for all the listing markers.
var markers = [];


//these just makes the map apear when the page is loaded.
function initMap() {
  // Create a styles array to use with the map.
  var styles = [{
    featureType: 'water',
    stylers: [{
      color: '#2389da'
    }]
  }, {
    featureType: 'administrative',
    elementType: 'labels.text.stroke',
    stylers: [{
        color: '#ffffff'
      },
      {
        weight: 6
      }
    ]
  }, {
    featureType: 'administrative',
    elementType: 'labels.text.fill',
    stylers: [{
      color: '#e85113'
    }]
  }, {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{
        color: '#efe9e4'
      },
      {
        lightness: -40
      }
    ]
  }, {
    featureType: 'transit.station',
    stylers: [{
        weight: 9
      },
      {
        hue: '#e85113'
      }
    ]
  }, {
    featureType: 'road.highway',
    elementType: 'labels.icon',
    stylers: [{
      visibility: 'off'
    }]
  }, {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{
      lightness: 100
    }]
  }, {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{
      lightness: -100
    }]
  }, {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{
        visibility: 'on'
      },
      {
        color: '#f0e4d3'
      }
    ]
  }, {
    featureType: 'road.highway',
    elementType: 'geometry.fill',
    stylers: [{
        color: '#efe9e4'
      },
      {
        lightness: -25
      }
    ]
  }];

  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {
      lat: 51.507351,
      lng: -0.127758
    },
    zoom: 13,
    styles: styles,
    mapTypeControl: false
  });
  // These are the real estate listings that will be shown to the user.
  // Normally we'd have these in a database instead.
  var locations = [{
      title: 'The British Museum',
      location: {
        lat: 51.519453,
        lng: -0.126935
      }
    },
    {
      title: 'Museum of London',
      location: {
        lat: 51.517626,
        lng: -0.096798
      }
    },
    {
      title: 'The National Gallery',
      location: {
        lat: 51.508971,
        lng: -0.128308
      }
    },
    {
      title: 'Victoria and Albert Museum',
      location: {
        lat: 51.497746,
        lng: -0.172619
      }
    },
    {
      title: 'Natural History Museum',
      location: {
        lat: 51.496715,
        lng: -0.176367
      }
    },
    {
      title: 'Tower of London',
      location: {
        lat: 51.509197,
        lng: -0.073843
      }
    }
  ];

  var largeInfowindow = new google.maps.InfoWindow();

  // Style the markers a bit. This will be our listing marker icon.
  var defaultIcon = makeMarkerIcon('0091ff');
  // Create a "highlighted location" marker color for when the user
  // mouses over the marker.
  var highlightedIcon = makeMarkerIcon('FFFF24');

  //esto es para que aparezcan todos los markers en el mapa cuando se carge la pagina.
  //basicamente ajustar los limites del mapa para que aparezcan todos los markers.
  //y podamos verlos todos sin tener que ajustar el zoom.
  var bounds = new google.maps.LatLngBounds();



  // The following group uses the location array to create an array of markers on initialize.
  //loop through the loctions to create a marker for each location.
  for (var i = 0; i < locations.length; i++) {
    // Get the position from the location array.
    var position = locations[i].location;
    var title = locations[i].title;
    // Create a marker per location, and put into markers array.
    var marker = new google.maps.Marker({
      // map: map,
      position: position,
      title: title,
      animation: google.maps.Animation.DROP,
      icon: defaultIcon,
      id: i
    });


    // Push the marker to our array of markers.
    markers.push(marker);

    // Create an onclick event to open an infowindow at each marker.
    marker.addListener('click', function() {
      //'this' is the market that is clicked.
      //the funccion is going to tell the info window to open at that marker
      //and populate with information specific to that marker.
      populateInfoWindow(this, largeInfowindow);
    });



    // Two event listeners - one for mouseover, one for mouseout,
    // to change the colors back and forth.
    marker.addListener('mouseover', function() {
      this.setIcon(highlightedIcon);
    });
    marker.addListener('mouseout', function() {
      this.setIcon(defaultIcon);
    });


    document.getElementById('show-listings').addEventListener('click', showListings);
    document.getElementById('hide-listings').addEventListener('click', hideListings);



    bounds.extend(markers[i].position);
  }


};

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
  // Check to make sure the infowindow is not already opened on this marker.
  if (infowindow.marker != marker) {
    infowindow.marker = marker;
    //these sets the content of the infowindow to the markers title.
    //el infowindow esta vacio y lo que hace es crear un div en el que contega el titulo
    //del marker que a sido clickado.
    infowindow.setContent('<div>' + marker.title + '</div>');
    infowindow.open(map, marker);
    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick', function() {
      infowindow.setMarker = null;
    });
    //Create a new streetViewService object
    var streetViewService = new google.maps.StreetViewService();
    //in case there is not a imaginary of the exact point of the map we creat a radius
    //to show the losest places as well for better info.
    var radius = 50;

    // In case the status is OK, which means the pano was found, compute the
    // position of the streetview image, then calculate the heading, then get a
    // panorama from that and set the options
    function getStreetView(data, status) {
      if (status == google.maps.StreetViewStatus.OK) {
        //compute theposition of the streetview image
        var nearStreetViewLocation = data.location.latLng;
        //then calculate the heading that we get from the google maps geometry library
        var heading = google.maps.geometry.spherical.computeHeading(
          nearStreetViewLocation, marker.position);
        infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
        //then get a panorama from that and set the options
        var panoramaOptions = {
          position: nearStreetViewLocation,
          pov: {
            heading: heading,
            pitch: 30
          }
        };
        //panorama object thet we put it inside the infowindow at the div with the id of pano.
        var panorama = new google.maps.StreetViewPanorama(
          document.getElementById('pano'), panoramaOptions);
      } else {
        //if there is not street view image found ww will put that there is not image in the
        //infowindow
        infowindow.setContent('<div>' + marker.title + '</div>' +
          '<div>No Street View Found</div>');
      }
    }

    // Use streetview service to get the closest streetview image within
    // 50 meters of the markers position
    streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);

    // request to Wikipedia API to find articles about universities
    var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' +
      marker.title+ '&origin=*&format=json&callback=wikiCallback';

    //AJAX request to Wikipedia
    $.ajax({
      url: wikiUrl,
      dataType: "jsonp",
      method: "GET",
    }).done(function(response) {
        var respLength = response.length;
          var respTitle = response[0];
          var respSumm = response[2];
          var wikiLinks = response[3];

          // Prepares wikipedia sourced info for the infowindow via the model and each locations infoContent key
           wContent = "<h3>" + respTitle + "</h3><p>" + respSumm[0] + "</p><p><a href=" + wikiLinks[0] + " target='_blank'>Learn more about " + respTitle + " here</a></p>";
           console.log(wContent)
           // Sets infowindow content
           infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>' + wContent);
      });

  }
}
// This function will loop through the markers array and display them all.
function showListings() {
  var bounds = new google.maps.LatLngBounds();
  // Extend the boundaries of the map for each marker and display the marker
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
    bounds.extend(markers[i].position);
  }
  // Extend the boundaries of the map for each marker
  map.fitBounds(bounds);
}
// This function will loop through the listings and hide them all.
function hideListings() {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
}
// This function takes in a COLOR, and then creates a new marker
// icon of that color. The icon will be 21 px wide by 34 high, have an origin
// of 0, 0 and be anchored at 10, 34).
function makeMarkerIcon(markerColor) {
  var markerImage = new google.maps.MarkerImage(
    'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
    '|40|_|%E2%80%A2',
    new google.maps.Size(21, 34),
    new google.maps.Point(0, 0),
    new google.maps.Point(10, 34),
    new google.maps.Size(21, 34));
  return markerImage;
}
