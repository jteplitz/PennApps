(function(){
  "use strict";

  var base      = require("./base.js"),
      async     = require("async"),

      ShowInfoCtrl, _ptype,
      getShow, getEpisodes;

  ShowInfoCtrl = function(schemas){
    this.schemas = schemas;

    this.payload = {title: "PennApps"};
    this._view   = null;
  };

  _ptype = ShowInfoCtrl.prototype = base.getProto("std");
  _ptype._name = "ShowInfo";

  _ptype.getShow = function(id, cb){
    var self = this;
    async.parallel({
      show: getShow(self.schemas, id),
      episodes: getEpisodes(self.schemas, id)
    }, function(err, data){
      if (err){ return cb(err) }
      var show = data.show.toObject();
      show.episodes = data.episodes;
      cb(null, show);
    });
  };

  getShow = function(schemas, id){
    return function(cb){
      schemas.Show.findOne({_id: id}, cb);
    };
  };

  getEpisodes = function(schemas, id){
    return function(cb){
      schemas.Episode.find({show: id}, cb);
    };
  };

  module.exports = ShowInfoCtrl;
}());
