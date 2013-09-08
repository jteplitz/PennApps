(function(){
  "use strict";

  var _ = require("underscore"),
      handlePost,
      handler, dispatch,

      ControllerClass = require("../controllers/FilterTweets.js");

  handlePost = function(req, res, next){
    console.log(req.body.tweets);
    var tweets  = JSON.parse(req.body.tweets);
    var control = new ControllerClass(req._schemas, req._conf, req.session.userId);

    control.checkTweets(tweets, function(err, spoilers){
      if (err) {
        console.log(err);
        return res.json(500, {err: err});
      }

      return res.json(spoilers);
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
