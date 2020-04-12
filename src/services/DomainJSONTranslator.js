import {Route, Resource, Comment, TrackPoint} from '../domain/domainClasses.js'
import {retrieveJson, retrieveAllRoutes, storeJSONToPOD} from './PODExtractor.js'
import parseRouteJsonLD from './importing/DomainJSONLDParser.js';


// TODO: Discuss if async makes sense here

export const loadMapInfo = async jsonUrl => {
    // Load JSON-LD from map
  
    var routeJson = ""
    
    await retrieveJson(jsonUrl).then(function(result) {
      routeJson = JSON.parse(result);
    }) 
    


    var routeName = "";
    var routeDescription = "";
    var trackPointList = [];
    var resourceList = [];
    var commentList = [];
  
    for(var key in routeJson) {
        var value = routeJson[key]
  
        if(key === "name")
            routeName = value;
  
        if(key === "description")
            routeDescription = value;
  
        if(key === "points") {
            for(var latLong in value) {
                trackPointList.push(new TrackPoint(value[latLong]["latitude"], value[latLong]["longitude"]));
            }
        }
  
        if(key === "comments") {
            for(var comment in value) {
                commentList.push(new Comment(value[comment]["@id"]));
            }
        }
  
        if(key === "media") {
            for(var media in value) {
                resourceList.push(new Resource(value[media]["@id"]));
            }
        }
    }
    var route = new Route({"name" : routeName, "description" : routeDescription, "itinerary" : trackPointList, "resources" : resourceList, "comments" : commentList});
    return route;
};

export const loadAllRoutes = async (personWebId) => {
  var filesObj = await retrieveAllRoutes(personWebId);
  if(filesObj.files)
    return filesObj.files.map(function(urlMap) {
      return urlMap.url
    });
  return filesObj;
}

export const loadFriendRoutes = async (webId, filename) => {
    var routeUri = webId.substring(0, webId.length - 16) + "/viade/shared/" + filename + ".jsonld";
    
    var json = "";
    await retrieveJson(routeUri).then(function(result) {
        json = JSON.parse(result);
    });

    var routes = [];

    for(var key in json){
        if(key === "routes"){
            var value = json[key];
            for(var route in value){
                routes.push(value[route]["@id"]);
            }
        }
    }

    return routes;
}

export const saveRouteToPOD = async (routeObj, callback) => {
    var jsonLD = parseRouteJsonLD(routeObj);
    storeJSONToPOD(jsonLD, callback);
}