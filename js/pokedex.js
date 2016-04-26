/*jslint browser this */
/*global angular */

(function () {
    'use strict';

    var app = angular.module('pokedex', []);

    app.directive('pokelist', function () {
        return {
            restrict: 'E',
            templateUrl: 'pokelist.html'
        };
    });
}());