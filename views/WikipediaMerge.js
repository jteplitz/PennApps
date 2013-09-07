(function(){
  "use strict";
  
  var base = require("./base.js");


  var WikipediaMergeView, _ptype;

  WikipediaMergeView = function(){};

  _ptype = WikipediaMergeView.prototype = base.getProto("std");
  _ptype._view_name = "WikipediaMergeView";
  _ptype._template  = "wikipediaMerge.jade";

  module.exports = WikipediaMergeView;
}());
