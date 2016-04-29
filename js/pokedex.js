/*jslint browser this */
/*global angular */

(function () {
    'use strict';

    var app = angular.module('pokedex', []);

    app.controller('pokedexCtrl', function ($location, $q, $scope, $http) {

        var self = this;
        this.api = 'http://localhost:8000/api/v2/';
        // this.api = 'http://pokeapi.co/api/v2/';

        this.pokemons = [];
        this.getPokeList = function () {
            $scope.isLoading = true;
            $http({
                method: 'GET',
                url: this.api + 'pokemon?limit=718'
            }).then(function success(response) {
                self.pokemons = response.data.results;
                $scope.isLoading = false;
            });
        };
                method: 'GET',
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

    app.filter('capitalize', function () {
        return function (input) {
            return input.charAt(0).toUpperCase() + input.substr(1);
        };
    });

}());