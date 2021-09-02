///////////////////////////////////////////////////////////////////////////
// Copyright © Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////
define(['dojo/_base/declare',
        'jimu/BaseWidget',
        'dijit/_WidgetsInTemplateMixin',
        'dojo/_base/lang',
        "dijit/form/Button",
        "dijit/form/TextBox",
        "dojo/dom",
        "dojo/on",
        "dojo/parser",
        "dijit/registry",
        "dojo/request/xhr",
        "esri/geometry/Polyline",
        "esri/geometry/Point",
        "esri/symbols/SimpleMarkerSymbol",
        "esri/symbols/SimpleLineSymbol",
        "esri/graphic",
        "esri/layers/GraphicsLayer",
        "esri/geometry/webMercatorUtils",
        "dojo/domReady!"
        ],
function(declare, BaseWidget, _WidgetsInTemplateMixin, lang, Button, TextBox, dom, on, parser, registry, xhr, Polyline,
         Point, SimpleMarkerSymbol,SimpleLineSymbol, Graphic, GraphicsLayer, webMercatorUtils
        )
{
  //To create a widget, you need to derive from BaseWidget.
  return declare([BaseWidget, _WidgetsInTemplateMixin], {
    // DemoWidget code goes here

    //please note that this property is be set by the framework when widget is loaded.
    //templateString: template,

    baseClass: 'Routing-widget',
    //Add Destinations to map
      starting: null,
      ending: null,
      pointGraphic: null,
      data: null,
      populated: null,
      addPoint: null,
      polylineGraphic: null,
      //simpleLineSymbolActive: null,
      //simpleLineSymbol: null,
      //gl:null,


    postCreate: function() {
      this.inherited(arguments);
      console.log('postCreate');

        this.own(on(this.map, "click", lang.hitch(this, this._onMapClick)));

        //this.gl = new GraphicsLayer();
        //this.map.addLayer(this.gl)

    },

    startup: function() {
        this.inherited(arguments);
        console.log('startup');
        onMapClick =  this._onMapClick;
        getRoute =  this._getRoute;
        addToMap = this._addToMap;

        //map = this.map;
        this.gl = new GraphicsLayer();

        this.inherited(arguments);
        coordinates = [0,1];
        map = this.map;
        parser.parse();

        var getMarkerGraphic = function(mapPoint,type) {
            if(type === 'origin'){
                var symbol = new SimpleMarkerSymbol(
                    //this.folderUrl + "css/images/esriGreenPin16x26.png",
                    15
                );
                symbol.setColor('green');
                //symbol.setOffset(0, 12);
            }
            else{
                var symbol = new SimpleMarkerSymbol(
                    //this.folderUrl + "css/images/esriGreenPin16x26.png",
                    15
                );
                symbol.setColor('red');
                //symbol.setOffset(0, 12);
            }
            return new Graphic(mapPoint, symbol);
        }

        this.addPoint = function(coords, type){
            coords = webMercatorUtils.webMercatorToGeographic(coords);
            var g = getMarkerGraphic(coords, type);

            if (type == "origin"){
                this.starting = coords
                g.setAttributes({"Name":type})
                this.StartPoint.innerHTML = String(this.starting.x + ' ' + this.starting.y);
                //console.log(this.starting);
            } else {
                this.ending = coords
                g.setAttributes({"Name":type})
                this.StopPoint.innerHTML = String(this.ending.x + ' ' + this.ending.y);

                _getRoute(this.starting, this.ending);
            }
            //console.log(this.gl);
            this.gl.add(g);
            this.map.addLayer(this.gl);
        }

        var _getRoute = function(starting, ending){
            //var directionContainer = html.create('div', {}, this.directionController);

            var url = "https://ksamaps.com/api/route/" + starting.x + "," + starting.y + ";" + ending.x + "," + ending.y + "?geometries=geojson&alternatives=true&steps=true&overview=full&access_token=eb393505f5c76a572e1c5415712c9e62c83d6b41cce9cb162cbed0e667eabd513b481c091290e2ec6a790c6063b0d2bba3e3f6f4f83ddde856ef13ecb37a71cd";
            //console.log(url);
            xhr(url , {
                handleAs: "json"
            }).then(function(json){
                // The requested data
                if (json.code === "Ok") {
                    console.log(json);
                    //removeGraphicView("polyline");
                    //this.graphicsLayer.remove(this._lineGraphic);
                    //this.map.removeGraphic("polyline");
                    _addToMap(json);
                }
                else {
                    console.log('No Route resolved');
                }
            })
        }

        //var getLineGraphicSymbology = function (lineGraphic){
        //    var simpleLineSymbolActive = new SimpleLineSymbol({
        //        type: "simple-line", // autocasts as SimpleLineSymbol()
        //        color: [26, 115, 232],
        //        style: 'solid',
        //        width: 4
        //    });
        //
        //    return new Graphic(lineGraphic, simpleLineSymbolActive)
        //}

        var _addToMap = function (geoJson) {
            var coord = [];
            //var path_direction = null;
            //var path = [];
            //var polylineAttActive = {};
            //var active_route;
            var i = 0;
            // , j = 0, k = 0 ;

            this.glLine = new GraphicsLayer();

            var simpleLineSymbolActive = {
                        type: "simple-line", // autocasts as SimpleLineSymbol()
                        color: [26, 115, 232],
                        style: 'solid',
                        width: 4
                    };

            //
            //var simpleLineSymbol = new SimpleLineSymbol({
            //    type: "simple-line", // autocasts as SimpleLineSymbol()
            //    color: [148, 97, 19],
            //    width: 4
            //});
            //
            //for (this.i = 1; this.i < geoJson.routes.length; this.i++) {
            //    //Route display
            //    this.path = geoJson.routes[this.i].geometry.coordinates;
            //    console.log(this.path)
            //    polylineAtt = {
            //        heading: geoJson.routes[this.i].legs[0].distance,
            //        steps: geoJson.routes[0].legs[0].steps
            //    };
            //    this.polyline = {
            //        type: "polyline",
            //        paths: this.path
            //    };
            //    this.polylineGraphic = new Graphic({
            //        geometry: new Polyline(this.polyline),
            //        symbol: simpleLineSymbol,
            //        attributes: polylineAtt
            //    });
            //    //for(this.j=0; this.j < geoJson.routes[this.i].legs; this.j++){
            //    //    for(k=0; this.k < geoJson.routes[this.i].legs[this.j].steps; this.k++) {
            //    //        this.path_direction = geoJson.routes[this.i].legs[this.j].steps[this.k].maneuver
            //    //        console.log(this.path_direction);
            //    //    }
            //    //}
            //    //var path_direction = new  Graphic({
            //    //    geometry: new Point
            //    //})
            //    // Add the line graphic to the view's GraphicsLayer
            //    this.glLine.add(this.polylineGraphic)
            //    this.map.addLayer(this.glLine);
            //}

            // to avoid overlaps of active and and non active path, (In loop it is overlapped and is not showing active as
            // blue
            coord = geoJson.routes[0].geometry.coordinates;

            console.log(coord)

             var active_polyline = {
                type: "polyline",
                paths: coord
            };

            //this.polylineAttActive = {
            //    heading: geoJson.routes[0].legs[0].distance,
            //    roadname: geoJson.routes[0].legs[0].steps[this.i].name,
            //    direction: geoJson.routes[0].legs[0].steps[this.i].maneuver.bearing_after,
            //    distance: geoJson.routes[0].legs[0].steps[this.i].distance,
            //    duration: secondsToHms((geoJson.routes[0].legs[0].steps[this.i].duration))
            //};
            //populateSidePanel(geoJson.routes[0])
            //data = geoJson.routes

            var active_route = new Graphic({
                geometry: active_polyline,
                symbol: simpleLineSymbolActive
                //attributes: this.polylineAttActive
            });
            console.log(active_route);

            // Add the line graphic to the view's GraphicsLayer
            this.glLine.add(active_route);
            this.map.addLayer(this.glLine);
            //this.LoadData.innerHTML = String('populateSidePanel');
        }

        var secondsToHms =function (d) {
            d = Number(d);
            var h = Math.floor(d / 3600);
            var m = Math.floor(d % 3600 / 60);
            var s = Math.floor(d % 3600 % 60);

            var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
            var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
            var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
            return hDisplay + mDisplay + sDisplay;
        }

        var populateSidePanel = function (geoJson) {
            //console.log(geoJson)
            //document.getElementById("showAttr").innerHTML = '';
            //document.getElementById("addDataToPanel").innerHTML = '';

             var tableData = '<a class="btn btn-primary" style="width: -webkit-fill-available;" data-toggle="collapse" href="#collapseExample" role="button" aria-expanded="false" aria-controls="collapseExample"> via <div class="route-name" style="display: block; font-weight: bold; word-wrap: break-word; white-space: initial; color: #fdbe3b">' + geoJson.legs[0].summary + '</div>' +
            '<div>' + ((geoJson.legs[0].distance) / 1000).toFixed(2) + ' Km,' +
            ' ' + secondsToHms((geoJson.legs[0].duration).toFixed(2))+ '</div>'+
            '</a>';
                console.log(tableData);
            //this.LoadRouteData.innerHTML = String('I am in');

            //for (var i = 0; i < geoJson.legs[0].steps.length; i++) {
            //    document.getElementById("addDataToPanel").innerHTML += '<div id="dataContainer" style="border: 1px solid lightgrey;">';
            //    if (geoJson.legs[0].steps[i].name) {
            //        document.getElementById("addDataToPanel").innerHTML += '<div class="inline dir-tt dir-tt-straight" style="width: 275px; ">' +
            //        '<div class="numbered-step-content">Road Name: ' + geoJson.legs[0].steps[i].name + '</div>' +
            //        '</div>';
            //    } else {
            //        document.getElementById("addDataToPanel").innerHTML += '<div class="inline dir-tt dir-tt-straight" style="width: 275px; ">' +
            //        '<div class="numbered-step-content">Road Name: No Name</div>' +
            //        '</div>';
            //    }
            //    document.getElementById("addDataToPanel").innerHTML += '<div class="inline dir-tt dir-tt-straight" style="width: 275px; ">' +
            //        //'<img src="../img/maneuvers-2x.png">'+
            //    '<div class="numbered-step-content">Direction: ' + CBAtoDirection(geoJson.legs[0].steps[i].maneuver.bearing_after) + '</div>' +
            //    '</div>' +
            //    '<div class="numbered-step" style="width: 275px;">' +
            //    '<div class="numbered-step-content">Distance: ' + ((geoJson.legs[0].steps[i].distance) / 1000).toFixed(2) + ' Km</div>' +
            //    '<div class="numbered-step-content">Duration: ' + secondsToHms((geoJson.legs[0].steps[i].duration).toFixed(2)) + ' </div>' +
            //    '</div>' +
            //    '</div>' +
            //    '</div>';
            //}

        }




        //startIn = registry.byId("StartPoint");
        //startIn.on("blur", function(){
        //    validateAdd("StartPoint");
        //})
        //stopIn = registry.byId("StopPoint");
        //stopIn.on("blur", function(){
        //    validateAdd("StopPoint");
        //})
        //var myButton = new Button({
        //        label: "Get Route!",
        //        onClick: this.getRoute
        //    }
        //    , "RouteButton").startup();
    },

    _onMapClick: function(event){
      if(this.gl.graphics.length == 0)
      {
          //console.log(event.mapPoint);
          this.addPoint(event.mapPoint, "origin" );
      }
      else if (this.gl.graphics.length == 1){
          //console.log(event.mapPoint);
          this.addPoint(event.mapPoint, "destination");
      }
      else {

      }
    },

    onOpen: function(){
      console.log('onOpen');
    },

    onClose: function(){
      console.log('onClose');
    },

     onMinimize: function(){
      console.log('onMinimize');
    },

    onMaximize: function(){
      console.log('onMaximize');
    },

    onSignIn: function(credential){
      /* jshint unused:false*/
      console.log('onSignIn');
    },

    onSignOut: function(){
      console.log('onSignOut');
    },

    showVertexCount: function(count){
      this.vertexCount.innerHTML = 'The vertex count is: ' + count;
    }

  });
});