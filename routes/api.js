var express = require('express');
var router = express.Router();
var Symbol = require('../symbol');
var util = require('../util');
var async = require('async');
var request = require('request-promise');
var moment = require('moment');

router.get('/allData', function (req, res) {
  Symbol.find({}, function(err, symbols){
    if(err){
      res.json({status: 'fail', err: err});
    }else{
      console.log(symbols);
      res.json({status: 'success', data: symbols, lastChangeTime: req.changeTrack.lastChangeTime});
    }
  });
});

router.post('/lastChangeTime', function (req, res) {
  res.json({status: 'success', lastChangeTime: req.changeTrack.lastChangeTime});
});

router.post('/removeSymbol', function (req, res) {
  Symbol.remove({name: req.body.symbol}, function(err, info){
    if(err){
      res.json({status: 'fail', err: err});
    }else{
      req.changeTrack.lastChangeTime = new Date();
      res.json({status: 'success', info: info, lastChangeTime: req.changeTrack.lastChangeTime});
    }
  });
});


var getStock = function(symbol, insOrUpd, whenDone){
  var now = moment(new Date());
  var date1 = now.format("YYYY-MM-DD");
  var date0 = now.subtract(3, 'month').format("YYYY-MM-DD");
  
  var url = "https://www.quandl.com/api/v3/datasets/WIKI/" + symbol + 
      "/data.json?start_date=" + date0 + 
      "&end_date=" + date1 + "&api_key=sRD3kLcf8mbuzYAo3Xgs";
  
  request(url).then(function(data){
    var data = JSON.parse(data);
    console.log('quandl done ', data.dataset_data.data.length);
    if(insOrUpd == "I"){
      var s = new Symbol();
      s.name = symbol;
      s.dateUpdated = new Date();
      s.data = data.dataset_data.data;
      s.save(function(err){
        if(err){
          console.log('Error saving new Symbol');
          whenDone('Error saving new Symbol: ' + symbol, null);
        }else{
          console.log('New Symbol saved in DB');
          whenDone(null, s);
        }
      });
    }else{
      Symbol.update({name: symbol}, 
                    {dateUpdated: new Date(), data: data.dataset_data.data}, 
                    { multi: false }, function(err, info){
        if(err){
          console.log('Symbol update error', symbol);
          whenDone('Error updating symbol', null);
        }else{
          console.log('Symbol updated: info=', info);
          whenDone(null, info);
          return;
        }
      });
    }
  }).catch(function (err) {
    console.log('quandl err str', err);
    //var data = JSON.parse(data);
    //console.log('quandl err ', data);
    //whenDone("Error fetching prices", null);
    var msg = JSON.parse(err.error).quandl_error.message;
    whenDone(msg, null);
    return;
  });  


/*
  stock.fetch({
    symbol: symbol,
    startDate: "2015-10-01",
    endDate: "2015-11-31"
  }, function (err, data) {
    console.log('Stock search err, data:', err, data);
    
    if(insOrUpd == "I"){
      var s = new Symbol();
      s.name = symbol;
      s.dateUpdated = new Date();
      s.save(function(err){
        if(err){
          console.log('Error saving new Symbol');
          whenDone('Error saving new Symbol: ' + symbol, null);
        }else{
          console.log('New Symbol saved in DB');
          whenDone(null, s);
        }
      });
    }else{
      Symbol.update({name: symbol}, 
                    {dateUpdated: new Date(), dates: data.date, prices: data.close}, 
                    { multi: false }, function(err, info){
        if(err){
          console.log('Symbol update error', symbol);
          whenDone('Error updating symbol', null);
        }else{
          console.log('Symbol updated: info=', info);
          whenDone(null, info);
        }
      });
    }
    
//    whenDone(err, data);
  });
  */
}




router.post('/addSymbol', function (req, res) {
  //Add to DB if not exist
  Symbol.findOne({name: req.body.newSymbol}, function(err, doc){
    if(err || !doc){
      console.log('Symbol not in db', req.body.newSymbol);
      getStock(req.body.newSymbol, "I", function(err, data){
        if(err){
          res.json({status: 'fail', err: err});
        }else{
          console.log('Done inserting');
          req.changeTrack.lastChangeTime = new Date();
          res.json({status: 'success', action: 'added', lastChangeTime: req.changeTrack.lastChangeTime});
        }
      });
    }else{
      console.log('Symbol found', doc);
      if(doc.dateUpdated.toDateString() == (new Date()).toDateString()){
        //No need to update Symbol
        console.log('No update needed for symbol', req.body.newSymbol);
        req.changeTrack.lastChangeTime = new Date();
        res.json({status: 'success', action: 'no-update', lastChangeTime: req.changeTrack.lastChangeTime});
      }else{
        getStock(req.body.newSymbol, "U", function(err, data){
          if(err){
            res.json({status: 'fail', err: err});
          }else{
            console.log('Done updating');
            //res.json(data);
            req.changeTrack.lastChangeTime = new Date();
            res.json({status: 'success', action: 'updated', lastChangeTime: req.changeTrack.lastChangeTime});
          }
        });
      }
    }
  });
});



/*
router.get('/polls', function (req, res) {
  Poll.find({username: req.user.username}, function (err, polls) {
    if (err) {
      res.json({
        status: 'fail',
        err: err
      });
    } else {
      res.json({status: 'success', polls: polls});
    }
  });
});

router.delete('/poll/:id', util.ensureAuthenticatedApi, function (req, res) {
  console.log('delete by id', {
    reqParam: req.params
  });

  Poll.findByIdAndRemove(req.params.id, function (err, poll) {
    if (err) {
      res.json({
        status: 'fail',
        err: err
      });
    } else {
      res.json({
        status: 'success'
      });
    }
  });
});


router.get('/config', function (req, res) {
  res.json({
    baseUrl: process.env.BASE_URL
  });
});

router.post('/createPoll', util.ensureAuthenticatedApi, function (req, res, next) {
  console.log('createPoll', req.body);
  var votes = req.body.options.map(function(c){
    //TODO: Remove random
    return 0;
//    return Math.floor(Math.random() * 20);
  });
  var poll = new Poll({
    username: req.user.username,
    created_at: new Date(),
    question: req.body.question,
    options: req.body.options,
    votes: votes
  });
  poll.save(function (err) {
    if (err) {
      res.json({
        status: 'fail',
        err: err
      });
    } else {
      console.log(poll);
      res.json({
        status: 'success',
        poll: poll
      });
    }
  });
});
*/

module.exports = router;