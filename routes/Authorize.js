(function(){
  "use strict";
  var OAuth = require('google-oauth');

  module.exports = function(req, res, next){
    var conf = req._conf;
    var oauth = new OAuth.OAuth2(
      conf.get("google:key"),
      conf.get("google:secret"),
      'http://localhost:3000/authorize'
    );
    if(!req.query.code){

      //Redirect the user to Authentication From,
      // Set authentication scope to google calendar api
      oauth.getGoogleAuthorizeTokenURL( ['https://www.googleapis.com/auth/prediction'], function(err, redirecUrl) {
          if(err){ return res.send(500,err) }
        return res.redirect(redirecUrl);
      });

    }else{
      //Get access_token from the code
      oauth.getGoogleAccessToken(req.query, function(err, access_token, refresh_token) {
          if(err){ return res.send(500,err); }
          console.log("got access token", access_token, refresh_token);

        return res.redirect('/');
      });
    }
  };
}());
