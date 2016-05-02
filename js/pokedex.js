/*jslint browser this */
/*global angular $ alert */

(function () {
    'use strict';

    var app = angular.module('pokedex', ['ngRoute']);

    app.run(['$route', '$rootScope', '$location', function ($route, $rootScope, $location) {
        var original = $location.path;
        $location.path = function (path, reload) {
            if (reload === false) {
                var lastRoute = $route.current;
                var un = $rootScope.$on('$locationChangeSuccess', function () {
                    $route.current = lastRoute;
                    un();
                });
            }
            return original.apply($location, [path]);
        };
    }]);

    app.config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/pokedex/:name?', {
                templateUrl: 'pokedex.html',
                controller: 'pokedexCtrl',
                controllerAs: 'pkCtrl'
            })
            .when('/team', {
                templateUrl: 'team.html',
                controller: 'teamCtrl',
                controllerAs: 'tCtrl'
            })
            .otherwise({
                redirectTo: '/pokedex'
            });
    }]);

    app.factory('teamService', function () {
        var teamService = {};

        teamService.team;

        teamService.loadTeam = function () {
            this.team = localStorage.getItem('MyPokedex_team') !== null
                ? JSON.parse(localStorage.getItem('MyPokedex_team'))
                : [];

            return this.team;
        };

        teamService.saveTeam = function () {
            localStorage.setItem('MyPokedex_team', JSON.stringify(this.team));
        };

        teamService.isPkmnFavorite = function (name) {
            var match = this.team.filter(function (object) {
                return object.name === name;
            });
            if (match.length > 0) {
                return match[0];
            } else {
                return false;
            }
        };

        teamService.SupOrAddToTeam = function (name, poke) {
            var pkmnToDelete = this.isPkmnFavorite(name);
            if (pkmnToDelete) {
                var pos = this.team.indexOf(pkmnToDelete);
                this.team.splice(pos, 1);
            } else {
                if (!this.isTeamFull()) {
                    this.team.push({
                        name : name,
                        datas : poke
                    });
                }
            }
            this.saveTeam();
        };

        teamService.isTeamFull = function () {
            if (this.team.length >= 6) {
                alert('Vous ne pouvez pas avoir plus de 6 pokémons dans votre équipe');
                return true;
            } else {
                return false;
            }
        };

        teamService.loadTeam();
        return teamService;
    });

        var self = this;
        this.api = 'http://localhost:8000/api/v2/';
        // this.api = 'http://pokeapi.co/api/v2/';

        this.pokemons = [];
        $scope.poke = {};

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

        this.showProfil = function (pokeName) {
            $location.path('/pokedex/' + pokeName, false);
            $scope.poke = {};
            $scope.isLoading = true;
            $scope.poke.show = false;
            this.getProfil(pokeName);
        };

        this.getProfil = function (pokeName) {
            $http({
                method: 'GET',
                url: self.api + 'pokemon/' + pokeName
            }).then(function success(response) {
                console.log(response.data);
                $scope.poke.profil = response.data;
                self.getSpecie(response.data.species.url);
            }, function error(response) {
                alert('Le Pokémon demandé n\'éxiste pas !');
            });
        };
        this.getSpecie = function (specieURL) {
            $http({
                method: 'GET',
                url: specieURL
            }).then(function success(response) {
                console.log(response.data);
                $scope.poke.desc = response.data.flavor_text_entries[1].flavor_text;
                self.getEvolutionChain(response.data.evolution_chain.url);
            });
        };

        this.getEvolutionChain = function (evChainURL) {
            $http({
                method: 'GET',
                url: evChainURL
            }).then(function success(response) {
                var allEvolutions = [];
                var evolutions = {};

                self.findEvolutions(response.data.chain, allEvolutions);
                self.findPrevNext($scope.poke.profil.name, allEvolutions, evolutions);

                var promises = [];
                $.each(evolutions, function (index, evolution) {
                    promises.push($http({
                        method: 'GET',
                        url: evolution.url
                    }).then(function success(response) {
                        evolution.sprite = response.data.sprites['front_default'];
                    }));
                });

                $q.all(promises).then(function success() {
                    $scope.poke.previous = evolutions.previous;
                    $scope.poke.next = evolutions.next;
                    $scope.isLoading = false;
                    $scope.poke.show = true;
                });
            });
        };

        this.findEvolutions = function (chain, allEvolutions) {
            chain.species.url = chain.species.url.replace('-species', '');
            chain.species.id = chain.species.url.match(/\/([0-9]+)\//)[1];

            allEvolutions.push(chain.species);

            if (chain.hasOwnProperty('evolves_to')) {
                if (chain.evolves_to.length > 0) {
                    self.findEvolutions(chain.evolves_to[0], allEvolutions);
                }
            }
        };

        this.findPrevNext = function (name, allEvolutions, evolutions) {
            allEvolutions.forEach(function (evolution, index) {
                if (evolution.name === name) {
                    if (allEvolutions[index - 1] !== undefined) {
                        evolutions.previous = allEvolutions[index - 1];
                    }
                    if (allEvolutions[index + 1] !== undefined) {
                        evolutions.next = allEvolutions[index + 1];
                    }
                }
            });
        };

        if ($routeParams.name) {
            this.showProfil($routeParams.name);
        }
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
            if (!input) {
                return false;
            }

            return input.charAt(0).toUpperCase() + input.substr(1);
        };
    });

    app.filter('leftpad', function () {
        return function (number, length) {
            if (!number) {
                return number;
            }

            number = '' + number;
            while (number.length < length) {
                number = '0' + number;
            }
            return number;
        };
    });

}());