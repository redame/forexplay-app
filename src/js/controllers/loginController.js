/**
 * Created by costin on 25.7.15.
 */

var loginController = function ($scope, $log, $filter, $location,
                                userServiceFactory, positionService, userService, sessionFactory) {
    $scope.rememberMe = true;
    $scope.username = "costinaldea@yahoo.co.uk";
    $scope.password = "costinaldea";

    $scope.getSessionHistory = function () {
        sessionFactory.getSessionsForUser($scope).success(function(data) {
            userService.tradingSessions = data
            console.log(data)
        }).error(function(data) {
            console.log(data)
        });
    };

    $scope.loadSessionData = function () {
        var tempSession = new FxSession(null, userService.user.uid, $scope.getNowFormatted(), $scope.getNowFormatted(),
            "EURUSD", $scope.getNowFormatted(), $scope.positionSize)
        sessionFactory.getOrCreateSession(tempSession, $scope).success(function (data, status, headers) {
            console.log(data)
            positionService.session = data;
            positionService.instrument = data.pair;
            $scope.positionSize = data.positionSize;
            $scope.loadTradesWithSession()
        }).error(function (data, status, headers) {
            alert("Error creating session")
        })
        $scope.getSessionHistory();
    }

    $scope.setSessionForUser = function (data) {
        userService.loggedIn = true;
        userService.logInInfo = data;
        document.cookie = 'slidepikfx=' + data.sessionId;
    }

    $scope.login = function () {
        var dao = new UserAuthenticationDao($scope.username, $scope.password)
        userServiceFactory.login(dao).success(function (data, status) {
            $scope.setSessionForUser(data)
            userServiceFactory.getCurrentUser().success(function (userData, status) {
                console.log(userData);
                userService.user = userData
                $scope.loadSessionData()

            }).error(function (data) {
                console.log("We have an error: " + data)
            })
            $location.path("/main")

        }).error(function (data, status) {
            console.log("We have an error: " + data)
        });

    };

};

//UserAuthenticationDao(username:String, password:String)
function UserAuthenticationDao(username, password) {
    this.username = username
    this.password = password
}

loginController.$inject = ['$scope', '$log', '$filter', '$location', 'userServiceFactory', 'positionService', 'userService', 'sessionFactory'];

angular.module('ForexPlay.controllers.Main').controller('LoginController', loginController);