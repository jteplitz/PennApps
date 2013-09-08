var request = require('request');
var requested = 0;

module.exports = function(episode) {
  console.log("setup", episode);
	var events = require('events');
	var eventEmitter = new events.EventEmitter();
	queryTwitter(episode, eventEmitter);
	return eventEmitter;
}

var queryTwitter = function(options, eventEmitter) {
  console.log("looking up on", x);
  var form = {
    q: options.query,
    count: 100,
    result_type: "recent"
  };
  if (options.hasOwnProperty("airDate")){
    var x = new Date(options.airDate + 259200000);
    form.until = x.getFullYear() + '-' + ("0" + (x.getMonth() + 1)).split(-2) + '-' + ("0" + x.getDate()).split(-2),
  }
  console.log("going", form);
  if (options.hasOwnProperty("max_id")){
    form["max_id"] = options.max_id;
  }
	request({
    url: 'https://api.twitter.com/1.1/search/tweets.json',
    qs: form,
    headers: {
      Authorization: 'Bearer AAAAAAAAAAAAAAAAAAAAAJoMTQAAAAAAT%2FPSdfp9Hh5tDPPnJ9UlQTokHWY%3DJGg4pQ5NkGtH4GlyBDVy0wEHWQfpAiS24PgaYG22k'
    }},
    function(err, res, data){
      if (err){
        console.log("error");
        process.exit(0);
      }
      try{
        data = JSON.parse(data);
      } catch (e){
        console.log("JSON error", e);
        return process.exit(0);
      }
      if (data.statuses.length === 0){
        // we're done here
        return eventEmitter.emit("close", {_id: options._id});
      }
      var x = [];
      for (var i = 0; i < data['statuses'].length; i++) {
        x.push({
          tweet: data['statuses'][i]['text'],
          handle: data['statuses'][i]['user']['screen_name'],
          date: data['statuses'][i]['created_at']
        });
      }
      options.max_id = data.statuses[data.statuses.length - 1].id_str;
      eventEmitter.emit('tweets', {id:options._id, 'tweets':x, spoiler: options.spoiler});
      requested++;
      if (requested <= 20) {
        queryTwitter(options, eventEmitter);
      } else {
        eventEmitter.emit("close", {_id: options._id});
      }
    });
}
