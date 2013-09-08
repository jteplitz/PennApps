#!/usr/bin/env node
(function(){
  "use strict";
  var twitter     = require("./twitter.js"),
      schemas     = require("../app/schemas.js"),
      request     = require("./request.js"),
      csv         = require("csv"),
      fs          = require("fs"),
      mongoose    = require("mongoose"),
      conf        = require('nconf').argv().env().file({file: __dirname + '/config.json'}),

  main, getEpisodeData,
  sendTweets, createNewCorpus, updateCorpus, createTrainingInstances,
  tweets = {};

  mongoose.connect(conf.get("mongo"));

  // entry point
  main = function(){
    // get all the recent episodes
    var now = new Date().getTime();
    var lastWeek = now - 604800000;
    schemas.Episode.find({airDate: {$gte: lastWeek - 86400000, $lte: now + 86400000}, corpus: null}, function(err, episodes){
      console.log("got episodes", episodes);
      if (err){
        console.log("error", err);
        return process.exit(0);
      }
      if (!episodes){
        console.log("no new episodes");
        return process.exit(0);
      }

      for (var i = 0; i < episodes.length; i++){
        console.log("looking for", episodes[i]);
        // get the episode data
        getEpisodeData(episodes[i]);
      }
    });
  };

  /*
    Get's the episodes data. Passes it to twitter and listens for events
  */
  getEpisodeData = function(episode){
    // get the show
    schemas.Show.findOne({_id: episode.show}, function(err, show){
      if (err || !show){
        console.log("error or no show", err);
        return process.exit(0);
      }

      var data = {
        show: show.name,
        airDate: episode.airDate,
        _id: episode._id,
        query: show.name + "",
        spoiler: true
      };
      
      var twitterListener = twitter(data);

      twitterListener.on("tweets", sendTweets);

      twitterListener.on("close", function(data){
        // get the instance data
        var tweetData = createTrainingInstances(tweets[data._id]);
        console.log("got tweet data", tweetData);
        csv().from.array(tweetData).to.stream(fs.createWriteStream(__dirname+'/spoilers.csv'));
        /*createNewCorpus(data._id, tweets[data._id], function(err){
          console.log("corpus created");
        });*/
        twitterListener.removeListener("tweets", sendTweets);
      });
    });
  };

  /*
    Sends the given tweets to the google prediction api
   */
   sendTweets = function(data){
     var theseTweets = data.tweets;
     // get the episode info
     schemas.Episode.findOne({_id: data.id}, function(err, episode){
       if (err || !episode){
         console.log("lost episode", err);
         return process.exit(0);
       }

       if(!tweets[data.id]){
         tweets[data.id] = theseTweets;
         //episode.corpus  = episode._id;
         /*episode.markModified("corpus");
         episode.save();*/
       } else {
         console.log("concating", tweets[data.id]);
         tweets[data.id] = tweets[data.id].concat(theseTweets);
       }
     });
   };

   // given tweets and episode id (as defined in our mongodb - episode._id),
   // it creates a new classifier from google
   createNewCorpus = function(id, tweets, cb){
     var data = {
       id: id,
       modelType: "REGRESSION",
       trainingInstances: [], // this should be ALL tweets, spoilers and not spoilers
       key: conf.get("google:key")
     };
     // currently, this line classifies them all as spoilers. we
     // need to fix this
     data.trainingInstances = createTrainingInstances(tweets);
     var headers = {
       Authorization: "Bearer ya29.AHES6ZQYO7uWbjGm881FpSTPEhn8lPj2QloHuy_bSMiyRg",
       "Content-Type": "application/json"
     };
     console.log("sending to google", data, data.trainingInstances[0]);
     request.makeRequest("https://www.googleapis.com", "/prediction/v1.6/projects/" + conf.get("google:project") + "/trainedmodels",
                         "POST", data, headers, function(err, data){
       console.log("got google response", err, data);
       cb(err);
     });
   };

   //  updates the classifier
   updateCorpus = function(id, tweets, cb){
     var data = {
       trainingInstances: [],
       key: conf.get("google:key")
     };
     data.trainingInstances = createTrainingInstances(tweets);
     var url = "/prediction/v1.6/projects/" + conf.get("google:project") + "/trainedmodels/" + id;
     var headers = {
       Authorization: "Bearer ya29.AHES6ZQYO7uWbjGm881FpSTPEhn8lPj2QloHuy_bSMiyRg",
       "Content-Type": "application/json"
     };
    request.makeRequest("https://www.googleapis.com", url, "PUT", data, headers, function(err, data){
      console.log("got google response", err, data);
      cb(err);
    });
   };

   createTrainingInstances = function(tweets){
     var trainingInstances = [];
     for (var i = 0; i < tweets.length; i++){
       var tweet = tweets[i];
       console.log("got tweet");
       var instance = [
         "notspoiler" // make this "not spoiler" for when it's not a spoiler, configurable via func param
       ];
       instance.push(tweet.tweet.replace(/spoiler alert/ig, ""));
       instance.push(tweet.handle);
       instance.push(new Date(tweet.date).getTime());
       console.log("instance", instance);

       trainingInstances.push(instance);
     }
     return trainingInstances;
   };

  main();
}());
