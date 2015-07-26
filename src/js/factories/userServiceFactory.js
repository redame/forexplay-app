(function () {
    var userServiceFactory = function ($http, $log, $rootScope, $location, positionService, userService) {
        var factory = {};

        var positionService = positionService;

        $http.defaults.useXDomain = true;
        $http.defaults.useXDomain = true;

        function genericError(data) {
            console.log(data || "Closing session failed")
        }

        var remoteHost = "http://localhost:9000"


        factory.login = function (userAuthenticationDao) {
            console.log("Authentication calling")
           return $http.post(remoteHost + '/clientAuthenticate', userAuthenticationDao)
        }

        factory.getCurrentUser = function () {
            console.log("am calling the get user " + userService.logInInfo.sessionId)

            var request = $http({
                method: 'get',
                url: remoteHost + '/getCurrentUser',
                withCredentials: true
            });

            return request
        }


        return factory;
    };

    userServiceFactory.$inject = ['$http', '$log', '$rootScope', '$location', 'positionService', 'userService'];
    angular.module('ForexPlay').factory('userServiceFactory', userServiceFactory);
}());
