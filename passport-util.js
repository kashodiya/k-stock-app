var passport = require('passport');
var Strategy = require('passport-twitter').Strategy;

//Use this to revoke
//https://twitter.com/settings/applications
//Use this to manage app
//https://apps.twitter.com/

module.exports = function (app) {
  var consumerKey = process.env.TWITTER_CONSUMER_KEY;
  var consumerSecret = process.env.TWITTER_CONSUMER_SECRET;
//  var callbackURL: 'https://k-vote-app-kashodiya.c9users.io/twitter/callback';
  var callbackURL = process.env.BASE_URL + '/twitter/callback';

  passport.use(new Strategy({
      consumerKey: consumerKey,
      consumerSecret: consumerSecret,
      callbackURL: callbackURL
    },
    function (token, tokenSecret, profile, cb) {
      // In this example, the user's Twitter profile is supplied as the user
      // record.  In a production-quality application, the Twitter profile should
      // be associated with a user record in the application's database, which
      // allows for account linking and authentication with other identity
      // providers.
      return cb(null, profile);
    }));

  passport.serializeUser(function (user, cb) {
    //console.log('passport.serializeUser', user);
    cb(null, user);
  });

  passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
  });

  app.use(passport.initialize());
  app.use(passport.session());

  app.get('/login/twitter',
    passport.authenticate('twitter'));

  app.get('/twitter/callback',
    passport.authenticate('twitter', {
      failureRedirect: '/'
    }),
    function (req, res) {
      res.redirect('/welcome');
    });
};