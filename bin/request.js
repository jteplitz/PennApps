(function(){
  "use strict";
  var http        = require("http"),
      url         = require("url"),
      querystring = require("querystring"),
      crypto      = require("crypto"),
      https       = require("https");

  exports.makeRequest = function(host, uri, method, reqData, headers, callback){
    // necessary to turn host string into an actual url to parse, hence the change into a schemeless url.
    var parsedHost = url.parse(host, false, true),
    requestOptions, transport;

    if (headers === null){
      headers = {};
    }

    if (headers["Content-Type"] !==  "application/json"){
      reqData = querystring.stringify(reqData);
    } else {
      reqData = JSON.stringify(reqData);
    }

    if (method !== "GET"){
      if (!headers["Content-Type"]){
        headers["Content-Type"]   = 'application/x-www-form-urlencoded';
      }
      headers["Content-Length"] = reqData.length;
    } else if (reqData.length !== 0){
      uri += "?" + reqData;
    }

    if( parsedHost.hasOwnProperty('protocol') ) {
      requestOptions = {
        host: parsedHost.hostname,
        port: parsedHost.port,
        path: uri,
        method: method,
        headers: headers
      };
      transport = parsedHost.protocol === 'http:' ? http : https;

    } else {
      requestOptions = {
        host: parsedHost.hostname,
        port: 443,
        path: uri,
        method: method,
        headers: headers
      };
      transport = https;
    }

    var req = transport.request(requestOptions, function(res){
      var data = "";
      res.on("data", function(chunk){
        data += chunk;
      });
      res.on("end", function(){
        if (res.statusCode !== 200){
          return callback({statusCode: res.statusCode, data: data});
        }
        try{
          data = JSON.parse(data);
        }catch(e){
          return callback({
            error: 500,
            msg: "Bad response from server. Check response data"
          }, data);
        }
        if (data.hasOwnProperty('_err') && (data._err === 1)){
          return callback(data);
        }
        return callback(null, data);
      });
    });
    if (method !== "GET"){
      req.write(reqData);
    }

    req.on("error", function(error){
      return callback(error); // for now just pass node's error through
    });
    req.end();
  };

  /**exports.makeAuthenticatedRequest = function(host, uri, method, user, reqData, headers, callback){
    if (headers === null){
      headers = {};
    }

    var hash = crypto.createHash("SHA256");
    hash.update(user.password);
    hash = hash.digest("hex");
    headers["X-FITSCRIPT-CLIENT-AUTHENTICATION"] = "username=\"" + user.email + "\", response=\"" +
                                                    hash + "\", version=\"1\"";
    exports.makeRequest(host, uri, method, reqData, headers, callback);
  };*/
  
}());
