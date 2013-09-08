(function(){
  "use strict";

  var base      = require("./base.js"),
      async     = require("async"),
      request   = require("../bin/request.js"),
      ViewClass = require("../views/FilterTweets.js"),

      FilterTweetsCtrl, _ptype,
      checkTweet;

  FilterTweetsCtrl = function(schemas, conf, userId){
    this.schemas = schemas;
    this.conf    = conf;
    this.userId  = userId;

    this.payload = {title: ""};
    this._view   = new ViewClass();
  };

  _ptype = FilterTweetsCtrl.prototype = base.getProto("std");
  _ptype._name = "FilterTweets";

  _ptype.checkTweets = function(tweets, cb){
    var self = this;
    var parallel_arr = [];
    for (var i = 0; i < tweets.length; i++){
      parallel_arr.push(checkTweet(tweets[i], i, self));
    }
    async.parallel(parallel_arr, function(err, data){
      if (err) { return cb(err) }
      var spoilers = [];

      for (var i = 0; i < data.length; i++){
        if (data[i].spoiler){
          spoilers.push(data[i]._id);
        }
      }
      return cb(null, spoilers);
    });
  };

  checkTweet = function(tweet, index, self){
    console.log("got tweet", tweet);
    return function(cb){
      // make a request to the prediction api. Hard coded with the only episode we have for now
      var data = {
        key: self.conf.get("google:key"),
        input: {
          csvInstance: [
            tweet.text,
            tweet.handle,
            new Date(tweet.time).getTime()
          ]
        }
      };
      console.log("posting", data);
      var url = "/prediction/v1.6/projects/" + self.conf.get("google:project") + "/trainedmodels/522b8a9e6526b20200000005/predict";
      var headers = {
        Authorization: "Bearer " + self.conf.get("google:access-token"),
        "Content-Type": "application/json"
      };
      console.log("sending", headers);
      request.makeRequest("https://www.googleapis.com", url, "POST", data, headers, function(err, data){
        if (err){ return cb(err) }
        console.log("got prediction data", data);
        
        var predict = {
          _id: index,
          spoiler: (data.outputLabel === "spoiler")
        };
        
        return cb(null, predict);
      });
    };
  };

  module.exports = FilterTweetsCtrl;
}());
