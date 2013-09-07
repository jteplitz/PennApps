(function(){
  "use strict";

  var base      = require("./base.js"),
      async     = require("async"),

      ViewClass = require("../views/Show.js"),

      ShowCtrl, _ptype,
      getEpisodeInfo;

  ShowCtrl = function(schemas){
    this.schemas = schemas;

    this.payload = {title: ""};
    this._view   = new ViewClass();
  };

  _ptype = ShowCtrl.prototype = base.getProto("std");
  _ptype._name = "Show";

  _ptype.getUserShows = function(userId, cb){
    var self = this;
    // get all the show progress objects for this user
    this.schemas.ShowProgress.find({owner: userId}, function(err, progresses){
      if (err){ return cb(err) }
      
      var parallel_arr = [];
      // now get data on all the episodes
      for (var i = 0; i < progresses.length; i++){
        parallel_arr.push(getEpisodeInfo(self.schemas, progresses[i].lastEpisode));
      }
      async.parallel(parallel_arr, function(err, shows){
        if (err){ return cb(err) }

        return cb(shows);
      });
    });
  };

  _ptype.addProgress = function(userId, episodeInfo, cb){
    var self = this;
    if (episodeInfo.showName){
      // pull up the show
      self.schemas.Show.findOne({name: episodeInfo.showName}, function(err, show){
        if (err || !show){ return cb({status: 500, msg: err}) }

        // now find the episode
        self.schemas.Episode.findOne({show: show._id, season: episodeInfo.season,
                                      episode: episodeInfo.episodeNum}, function(err, episode){

          if (err || !episode){ return cb({status: 500, msg: err}) }

          var showProgress = new self.schemas.ShowProgress({
            owner: userId,
            lastEpisode: episode._id
          });
          showProgress.save(cb);
        });
      });
    } else {
      // pull up the episode by netflix id
      self.schemas.Episode.findOne({netflixId: episodeInfo.netflixId}, function(err, episode){
        if (err || !episode){ return cb({status: 500, msg: err}) }
        var showProgress = new self.schemas.ShowProgress({
          owner: userId,
          lastEpisode: episode._id
        });
        showProgress.save(cb);
      });
    }
  };

  /**
    Looks up information about the current episode and the show it is in
  */
  getEpisodeInfo = function(schemas, id){
    return function(cb){
      // lookup the episode
      schemas.Episode.findOne({_id: id}, function(err, episode){
        if (err || !episode){ return cb({status: 500, err: err}) }

        // now lookup the show
        schemas.Show.findOne({_id: episode.show}, function(err, show){
          if (err || !episode){ return cb({status: 500, err: err}) }
          show = show.toObject();

          // now combine the show and episode data
          show.currentEpisode = episode;
          cb(null, show);
        });
      });
    };
  };

  module.exports = ShowCtrl;
}());
