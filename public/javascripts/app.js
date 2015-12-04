(function () {
  var app = angular.module('myApp', ['chart.js']);

  app.controller('StockCtrl', function ($scope, $http, $interval) {
    
    var lastChangeTime = new Date();
    
    $interval(function(){
      //$scope.msg = 'Checking for change...';
      $http.post('/api/lastChangeTime', {now: new Date()}).then(function(response){
        console.log(response.data);
        if(lastChangeTime < response.data.lastChangeTime){
          $scope.refresh();
        }else{
          console.log('No refresh required');
        }
      }, function(err){
        $scope.msg = 'Error while checking for any change.';
      });
    }, 5000);   
    
    $scope.refresh = function(){
      $http.get('/api/allData').then(function(response){
        lastChangeTime = response.data.lastChangeTime;
        $scope.symbols = [];
        $scope.labels = [];
        $scope.series = [];
        $scope.data = [];
//        console.log(response.data.data);
        response.data.data.forEach(function(s, si){
          $scope.symbols.push(s.name);
          $scope.series.push(s.name);
          var price = [];
          s.data.forEach(function(p){
            if(si == 0){
              $scope.labels.push(p[0]);
            }else{
            }
            price.push(p[1]);
          });
          $scope.data.push(price);
        });
//        console.log('', $scope.labels);
//        console.log('', $scope.series);
//        console.log('', $scope.data);
        $scope.msg = '';
      }, function(err){
        $scope.msg = 'Error refreshing data.';
//        console.log(err);
      });
    };
    

    $scope.newSymbol = '';
    $scope.msg = '';
    $scope.symbols = ['AVXL', 'EDUC', 'ZVV', 'EGRX', 'NHTC', 'NPTN'];
    $scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
    $scope.series = ['Series A', 'Series B'];
    $scope.data = [
      [65, 59, 80, 81, 56, 55, 40],
      [28, 48, 40, 19, 86, 27, 90]
    ];
    
    $scope.refresh();
    
    $scope.onClick = function (points, evt) {
      console.log(points, evt);
    };
    
    $scope.removeSymbol = function(symbol){
      $scope.msg = 'Removing symbol...';
      $http.post('/api/removeSymbol',{symbol: symbol}).then(function(response){
        $scope.msg = 'Symbol removed...Refreshing data...';
        $scope.refresh();
      }, function(err){
        $scope.msg = 'Error removing symbol! ' + err;
      });
    };
    
    $scope.addSymbol = function(){
      $scope.msg = 'Adding symbol...';
      $http.post('/api/addSymbol', {newSymbol: $scope.newSymbol}).success(function(data){
        if(data.status == 'fail'){
          $scope.msg = 'Error! ' + data.err;
        }else{
          console.log('Add Symbol Data', data);
          $scope.msg = 'Refreshing data...';
          $scope.newSymbol = '';
          $scope.refresh();
        }
      }).error(function(err){
        $scope.msg = 'Error! ' + data.err;
        console.log('Add Symbol Error', err);
      });
    };


  });

})();