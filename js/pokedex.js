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

                $scope.pokemons = self.addIds(self.pokemons);

                $scope.isLoading = false;
            });
        };

        this.addIds = function (pokemons) {
            var i = 0;
            var id;

            for (i = 0; i < pokemons.length; i += 1) {

                id = i + 1;
                pokemons[i].id = id.toString();
            }
            return pokemons;
        };

        this.searchInList = function () {
            var str = $scope.pokeSearch;
            var pokeResults = [];

            this.pokemons.forEach(function (value) {
                $scope.isLoading = true;
                if (value.name.substr(0, str.length) === str || value.id.substr(0, str.length) === str) {
                    pokeResults.push(value);
                }
            });

            $scope.isLoading = false;
            $scope.pokemons = pokeResults;
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