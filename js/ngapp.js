'use strict';

// Declare app level module which depends on filters, and services

var app = angular.module('App', [
    'ui.router',
    'lumx'
]);

app.config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/home/");
    $stateProvider
        .state('index', {
            url: "",
            templateUrl: "partials/home.html",
            controller: "homeController"
        });
});

app.controller('homeController', function ($scope, $interval, weatherService) {
});

app.controller('commentController', function ($scope, store, utils) {
    
    $scope.errors = {};
    
//    store.set('comments',null);
    var comments = store.get('comments');
    console.log(comments);
//    if (typeof comments === String) {
    if (comments) {
        $scope.comments = JSON.parse(comments);
    } else {
        $scope.comments = [
            { id: 1, author: 'Ned Flanders', description: 'this is a nice app.'},
            { id: 2, author: 'Homer Simpson', description: 'i like beer.'}
        ];
    }
    
    $scope.save = function () {
        $scope.errors = {};
        if (!utils.ok($scope.comment.author)) {
            $scope.errors.author = true;
        }
        if (!utils.ok($scope.comment.description)) {
            $scope.errors.description = true;
        }
        if ($scope.errors.description || $scope.errors.author) {
            return;
        }
        $scope.comment.id = $scope.comments.length;
        $scope.comments.unshift($scope.comment);
        store.set('comments', JSON.stringify($scope.comments));
    };
    
    $scope.redo = function () {
        $scope.errors = {};
        $scope.comment = {};
    };
    
    $scope.redo();
    
});

app.controller('weatherController', function ($scope, $interval, mapService,
                                               weatherService, LxNotificationService) {

    var dt =  new Date();
    $scope.date = dt.getDate() +'/'+ (dt.getMonth() + 1) +'/'+ dt.getFullYear();

    $scope.weather = {};
    
    $scope.cities = [
        'Brisbane,Au',
        'Sydney,Au',
        'Melbourne,Au',
        'Adelaide,Au',
        'Perth,Au',
        'Hobart,Au',
        'Canberra,Au',
        'Darwin,Au'
    ];
    
    $scope.icons = {
        Rain: 'weather-rainy',
        Clouds: 'weather-cloudy',
        Clear: 'weather-sunny',
        Storms: 'weather-lightning'
    };
    
    $scope.currentCity = 0;
    
    $scope.updateWeather = function () {
        weatherService.update($scope.cities[$scope.currentCity]).then(function (data) {
            $scope.weather = data.data.list[0];
            $scope.weather.icon = $scope.icons[$scope.weather.weather[0].main] || '';
            mapService.update($scope.weather.coord);
            $scope.incrementCity();
//            console.log('weather for: '+$scope.weather.name);
//            console.log($scope.weather);       
        }, function (data) {
            LxNotificationService.error('Unable to load weather for '+$scope.cities[$scope.currentCity]);
            $scope.incrementCity();
        });
    };
    
    $scope.incrementCity = function () {
        $scope.currentCity++;
        if ($scope.currentCity > $scope.cities.length - 1) {
            $scope.currentCity = 0;
        }
    };
    
    $interval($scope.updateWeather,15000);
    $scope.updateWeather();
    
});

app.service('mapService', function () {
    
    return {
        update: function (coords) {
            var mapProp = {
                center:new google.maps.LatLng(coords.lat,coords.lon),
                zoom:8,
                mapTypeId:google.maps.MapTypeId.ROADMAP
            };
            var map=new google.maps.Map(document.getElementById("googleMap"),mapProp);
        }
    };
    
});

app.service('utils', function () {
    return {
        ok: function (value) {
            return (value === "" || !value) ? false: true;
        }
    };
});

app.service('store', function () {
    return {
        set: function (key,value) {
            localStorage.setItem(key,value);
        },
        get: function (key) {
            return localStorage.getItem(key);
        }
    };
});

app.factory('weatherService', function ($http, $q, LxProgressService) {
    return {
        update: function (city) {
            LxProgressService.linear.show('#5fa2db', '#weather-progress');
            var deferred = $q.defer();
            return $http.get('http://api.openweathermap.org/data/2.5/find?q='+city+'&units=metric')
            .success(function (response) {
                LxProgressService.linear.hide();
                deferred.resolve(response);
            })
            .error(function (response) {
                console.log('error:');
                console.log(response);
                LxProgressService.linear.hide();
                deferred.reject(resposne);
            });
        }
    };
});

