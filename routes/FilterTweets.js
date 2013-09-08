(function(){
  "use strict";

  var _ = require("underscore"),
      handlePost,
      handler, dispatch,

      ControllerClass = require("../controllers/FilterTweets.js");

  handlePost = function(req, res, next){
    
  };
  
  dispatch = {POST: handlePost};
  handler = function(req, res, next){
:xa
    if (_.has(dispatch, req.method)){
      return dispatch[req.method](req, res, next);
    }

    return next(405);
  };
  
  module.exports = handler;
}());
