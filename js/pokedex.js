/*jslint browser this */
/*global angular */

(function () {
    'use strict';

    var app = angular.module('pokedex', []);

    app.controller('pokelistCtrl', function ($scope, $http) {
        $scope.pokemons = [];
        $http({
            method: 'GET',
            url: 'http://pokeapi.co/api/v2/pokemon?limit=811'
        }).then(function success(response) {
            $scope.pokemons = response.data.results;
            console.log(response);
        });
    });

    app.directive('pokelist', function () {
        return {
            restrict: 'E',
            templateUrl: 'pokelist.html'
        };
    });

    app.directive('pokeprofil', function () {
        return {
            retrict: 'E',
            templateUrl: 'pokeprofil.html'
        };
    });
}());