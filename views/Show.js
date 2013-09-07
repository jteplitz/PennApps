(function(){
  "use strict";
  
  var base = require("./base.js");


  var ShowView, _ptype;

  ShowView = function(){};

  _ptype = ShowView.prototype = base.getProto("std");
  _ptype._view_name = "ShowView";
  _ptype._template  = "show.jade";

  module.exports = ShowView;
}());
