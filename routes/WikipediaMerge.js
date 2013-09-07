(function(){
  "use strict";

  var _ = require("underscore"),
      handlePost,
      handler, dispatch,
      cleanWiki,

      ControllerClass = require("../controllers/WikipediaMerge.js");

  handlePost = function(req, res, next){
    var episodeInfo = {
      show: req.body.show_title,
      name: cleanWiki(req.body.title),
      season: cleanWiki(req.body.season),
      episodeNum: cleanWiki(req.body.episode_number),
      airDate: cleanWiki(req.body.date)
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

  cleanWiki = function(val){
    val = String(val);
    var end = val.indexOf("[");
    if (end !== -1){
      val = val.substr(0, end);
    }
    return val;
  };
  
  module.exports = handler;
}());
