(function () {
    var userServiceFactory = function ($http, $log, $rootScope, $location, appSettings, userService) {
        var factory = {};

        var appSettings = appSettings;

        $http.defaults.useXDomain = true;

        function genericError(data) {
            console.log(data || "Closing session failed")
        }

        factory.login = function (userAuthenticationDao) {
            console.log("Authentication calling")
           return $http.post(appSettings.endpoint + '/clientAuthenticate', userAuthenticationDao)
        }

        factory.getCurrentUser = function () {
            console.log("am calling the get user " + userService.logInInfo.sessionId)

            var request = $http({
                method: 'get',
                url: appSettings.endpoint + '/getCurrentUser',
                withCredentials: true
            });

            return request
        }


        return factory;
    };

    userServiceFactory.$inject = ['$http', '$log', '$rootScope', '$location', 'appSettings', 'userService'];
    angular.module('ForexPlay').factory('userServiceFactory', userServiceFactory);
}());
