angular.module('ForexPlay', [
    'ngRoute',
    'mobile-angular-ui',
    'ForexPlay.controllers.Main'
])

    .config(function ($routeProvider) {
        $routeProvider.when('/', {templateUrl: 'login.html',
            reloadOnSearch: false, controller: 'LoginController'});
        $routeProvider
            .when('/main',
            {templateUrl: 'home.html', controller: 'ManualTradingController'});
    });

/*
$routeProvider.when("/", {
    templateUrl: "home.html",
    controller: "ManualTradingController",
    resolve: {
        auth: ["$q", "authenticationSvc", function($q, authenticationSvc) {
            console.log(authenticationSvc)
            var userInfo = authenticationSvc.getUserInfo();

            if (userInfo) {
                return $q.when(userInfo);
            } else {
                return $q.reject({ authenticated: false });
            }
        }]
    }
}).when('/login', {
    templateUrl: "login.html",
    controller: "ManualTradingController"
});*!/*/


/*
 angular.module('ForexPlay').run(["$rootScope", "$location", function($rootScope, $location) {
 $rootScope.$on("$routeChangeSuccess", function(userInfo) {
 console.log(userInfo);
 });

 $rootScope.$on("$routeChangeError", function(event, current, previous, eventObj) {
 console.log(eventObj)
 if (eventObj.authenticated === false) {
 $location.path("/login");
 }
 });
 }]);*/
