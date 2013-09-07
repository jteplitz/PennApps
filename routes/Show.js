(function(){
  "use strict";

  var _ = require("underscore"),
      handleGet, handlePost, handlePut, handleDelete,
      handler, dispatch,

      ControllerClass = require("../controllers/Show.js");

  handleGet = function(req, res, next){
    var control = new ControllerClass(req._schemas);

    var params = {};
    
    control.getUserShows(req.session.userId, function(err, shows){
      if (err){ return res.json(500, {err: err}) }

      return res.json({err: 0, shows: shows});
    });
  };

  handlePost = function(req, res, next){
    var currentEpisodeInfo = {
      showName: (_.has(req.body, "showName")) ? req.body.showName : null,
      season: (_.has(req.body, "season")) ? req.body.season : null,
      episodeNum: (_.has(req.body, "episodeNum")) ? req.body.episodeNum : null,
      netflixId: (_.has(req.body, "netflixId")) ? req.body.netflixId : null
    };
    var control = new ControllerClass(req._schemas);
    console.log("adding progress", currentEpisodeInfo);
    control.addProgress(req.session.userId, currentEpisodeInfo, function(err){
      if (err){ return res.json(500, {err: err}) }

      return res.json({err: 0});
    });
  };

  handlePut = function(req, res, next){
    
  };

  handleDelete = function(req, res, next){
    
  };
  
  dispatch = {GET: handleGet, POST: handlePost, PUT: handlePut, DELETE: handleDelete};

  handler = function(req, res, next){
    if (_.has(dispatch, req.method)){
      return dispatch[req.method](req, res, next);
    }

    return next(405);
  };
  
  module.exports = handler;
}());
