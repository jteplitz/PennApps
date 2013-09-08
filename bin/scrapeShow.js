#!/usr/bin/env node
(function(){
  "use strict";

  var async       = require("async"),
      schemas     = require("../app/schemas.js"),
      fs          = require("fs"),
      mongoose    = require("mongoose"),
      conf        = require('nconf').argv().env().file({file: __dirname + '/../config.json'}),
      jsdom       = require("jsdom"),

      AdminControllerClass = require("../controllers/AdminEpisode.js"),
      saveEpisode;
  mongoose.connect(conf.get("mongo"));
  var currentShow   = "522aaa72d18c267606000003";
  var currentSeason = 5;


  jsdom.env({
    url: "http://localhost:3000/currentScrape.html",
    scripts: ["http://code.jquery.com/jquery.js"],
    done: function(err, window){
      // get the episodes
      var episodeList = window.$("ul.episodeList li");
      console.log("got list", episodeList.length);
      var parallel_arr = [];
      for (var i = 0; i < episodeList.length; i++){
        var node        = window.$(episodeList[i]);
        var episodeId   = node.attr("data-episodeid");
        var episodeName = window.$(node.find(".ebob-content span.title")).text();
        var episodeDesc = window.$(node.find(".ebob-content p.synopsis")).text();
        console.log("saving", episodeName);
        parallel_arr.push(saveEpisode({
          season: currentSeason,
          show: currentShow,
          episode: i + 1,
          corpus: null,
          name: episodeName,
          description: episodeDesc,
          netflixId: episodeId
        }));
      }
      async.parallel(parallel_arr, function(err){
        console.log("done", err);
        process.exit(0);
      });
    }
  });

  saveEpisode = function(episodeInfo){
    return function(cb){
      console.log("saving", episodeInfo);
      var control = new AdminControllerClass(schemas);
      control.addEpisode(episodeInfo.show, episodeInfo, cb);
    };
  };
}());
