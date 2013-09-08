(function(){
  "use strict";
  
  var base = require("./base.js");


  var FilterTweetsView, _ptype;

  FilterTweetsView = function(){};

  _ptype = FilterTweetsView.prototype = base.getProto("std");
  _ptype._view_name = "FilterTweetsView";
  _ptype._template  = "filterTweets.jade";

  module.exports = FilterTweetsView;
}());
