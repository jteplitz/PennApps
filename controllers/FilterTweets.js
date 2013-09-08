(function(){
  "use strict";

  var base = require("./base.js"),
      ViewClass = require("../views/FilterTweets.js"),

      FilterTweetsCtrl, _ptype;

  FilterTweetsCtrl = function(){
    this.payload = {title: ""};
    this._view   = new ViewClass();
  };

  _ptype = FilterTweetsCtrl.prototype = base.getProto("std");
  _ptype._name = "FilterTweets";

  module.exports = FilterTweetsCtrl;
}());
