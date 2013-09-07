(function(){
  "use strict";

  var base = require("./base.js"),
      ViewClass = require("../views/WikipediaMerge.js"),

      WikipediaMergeCtrl, _ptype;

  WikipediaMergeCtrl = function(schemas){
    this.schemas = schemas;

    this.payload = {title: ""};
    this._view   = new ViewClass();
  };

  _ptype = WikipediaMergeCtrl.prototype = base.getProto("std");
  _ptype._name = "WikipediaMerge";

  _ptype.mergeEpisode = function(episodeInfo, cb){
    var self = this;
    // get the show
    this.schemas.Show.findOne({name: episodeInfo.show}, function(err, show){
      if (err){ return cb({status: 500, err: err}) }

      // get the episode
      self.schemas.Episode.findOne({show: show._id, season: episodeInfo.season,
                                    episode: episodeInfo.episodeNum}, function(err, episode){
        if (err){ return cb({status: 500, err: err}) }
        
        episode.airDate = new Date(episodeInfo.airDate).getTime();
        episode.markModified("airDate");

        episode.save(cb);
      });
    });
  };

  module.exports = WikipediaMergeCtrl;
}());
