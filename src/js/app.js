angular.module('ForexPlay', [
    'ngRoute',
    'mobile-angular-ui',
    'ForexPlay.controllers.Main'
])

    .config(function ($routeProvider) {
        $routeProvider.when('/', {templateUrl: 'home.html', reloadOnSearch: false});
    });