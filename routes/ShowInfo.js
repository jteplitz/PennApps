(function(){
  "use strict";

  var _ = require("underscore"),
      handleGet,
      handler, dispatch,

      ControllerClass = require("../controllers/ShowInfo.js");

  handleGet = function(req, res, next){
    var control = new ControllerClass(req._schemas);

    var params = {};
    
    control.getShow(req.params.id, function(err, episodes){
      if (err){ return res.json(500, {err: err}) }

      return res.json({err: 0, show: episodes});
    });
  };
  
  dispatch = {GET: handleGet};
  handler = function(req, res, next){
    if (_.has(dispatch, req.method)){
      return dispatch[req.method](req, res, next);
    }

    return next(405);
  };
  
  module.exports = handler;
}());
