(function(){
  "use strict";

  var base      = require("./base.js"),
      async     = require("async"),

      ShowsCtrl, _ptype,
      getShow, getShowStats;

  ShowsCtrl = function(schemas){
    this.schemas = schemas;
    this.payload = {};
    this._view   = null;
  };

  _ptype       = ShowsCtrl.prototype = base.getProto("std");
  _ptype._name = "Shows";

  _ptype.getShows = function(cb){
    var self = this;
    self.schemas.Show.find({}, function(err, shows){
      if (err){ return cb(err) }
      var parallel_arr = [];
      for (var i = 0; i < shows.length; i++){
        parallel_arr.push(getShowStats(self.schemas, shows[i]));
      }
      async.parallel(parallel_arr, function(err, data){
        if (err){ return cb(err) }
        
        return cb(null, data);
      });
    });
  };

  /*
   Gets the number of seasons and episodes for a show
  */
  getShowStats = function(schemas, show){
    return function(cb){
      schemas.Episode.find({show: show._id}, function(err, episodes){
        if (err){ return cb(err) }
        
        var seasons = 0;
        for (var i = 0; i < episodes.length; i++){
          if (episodes[i].season > seasons){
            seasons = episodes[i].season;
          }
        }
        show          = show.toObject();
        show.seasons  = seasons;
        show.episodes = episodes.length;
        return cb(null, show);
      });
    };
  };

  module.exports = ShowsCtrl;
}());
