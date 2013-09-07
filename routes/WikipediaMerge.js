(function(){
  "use strict";

  var _ = require("underscore"),
      handlePost,
      handler, dispatch,

      ControllerClass = require("../controllers/WikipediaMerge.js");

  handlePost = function(req, res, next){
    var episodeInfo = {
      show: req.body.show_title,
      name: req.body.title,
      season: req.body.season,
      episodeNum: req.body.episode_number,
      airDate: req.body.date
    };
    var control = new ControllerClass(req._schemas);
    control.mergeEpisode(episodeInfo, function(err){
      if(err){ return res.json(500, {err: err}) }

      return res.json({err: 0});
    });
  };
  
  dispatch = {POST: handlePost};
  handler = function(req, res, next){
    if (_.has(dispatch, req.method)){
      return dispatch[req.method](req, res, next);
    }

    return next(405);
  };
  
  module.exports = handler;
}());
