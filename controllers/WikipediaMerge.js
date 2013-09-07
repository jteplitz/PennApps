(function(){
  "use strict";

  var base = require("./base.js"),
      ViewClass = require("../views/WikipediaMerge.js"),

      WikipediaMergeCtrl, _ptype,
      getTimestamp;

  WikipediaMergeCtrl = function(schemas){
    this.schemas = schemas;

    this.payload = {title: ""};
    this._view   = new ViewClass();
  };

  _ptype = WikipediaMergeCtrl.prototype = base.getProto("std");
  _ptype._name = "WikipediaMerge";

  _ptype.mergeEpisode = function(episodeInfo, cb){
    console.log("merging", episodeInfo);
    var self = this;
    // get the show
    this.schemas.Show.findOne({name: episodeInfo.show}, function(err, show){
      if (err || !show){ return cb({status: 500, err: err}) }

      // get the episode
      self.schemas.Episode.findOne({show: show._id, season: episodeInfo.season,
                                    episode: episodeInfo.episodeNum}, function(err, episode){
        if (err){ return cb({status: 500, err: err}) }

        if (!episode){
          // this wasn't in the netflix database, so create it
          var newEpisode = new self.schemas.Episode({
            show: show._id,
            season: episodeInfo.season,
            episode: episodeInfo.episodeNum,
            name: episodeInfo.name,
            airDate: getTimestamp(episodeInfo.airDate)
          });
          newEpisode.save(cb);
        } else {
          episode.airDate = getTimestamp(episodeInfo.airDate);
          episode.markModified("airDate");
          episode.save(cb);
        }
      });
    });
  };

  getTimestamp = function(string){
    var date = new Date(string);
    var UTC  = date.getTime();
    UTC += 14400000;
    return UTC;
  };

  module.exports = WikipediaMergeCtrl;
}());
