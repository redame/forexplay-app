/**
 * Created by costin on 25.7.15.
 */

var loginController = function ($scope, $log, $filter, $location,
                                userServiceFactory, positionService, userService, sessionFactory, appSettings) {
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

    function createWidget(lang, security) {
        if (tradingViewWidget != undefined) {
            tradingViewWidget.remove();
        }
        tradingViewWidget = new TradingView.widget({
            fullscreen: true,
            container_id: "tv_chart_container",
            //	BEWARE: no trailing slash is expected in feed URL
            datafeed: new Datafeeds.UDFCompatibleDatafeed(appSettings, "https://demo_feed.tradingview.com"),
            library_path: "libs/charting_library/",
            symbol: security,
            locale: 'en',
            //	Regression Trend-related functionality is not implemented yet, so it's hidden for a while
            enabled_features: ["trading_options"],
            disabled_features: ["use_localstorage_for_settings", "header_screenshot",
                "create_volume_indicator_by_default", "header_compare", "header_saveload", "header_settings"],
            charts_storage_url: 'http://saveload.tradingview.com',
            client_id: 'tradingview.com',
            user_id: 'public_user_id',
            debug: false
        });
        tradingViewWidget.onChartReady(function (e) {
            tradingViewWidget.createButton()
                .attr('name', "forward")
                .attr('title', ">>").on('click', function (e) {
                    $scope.updateChart();
                }).append($('<span>Forward</span>'));
            tradingViewWidget.createButton().attr('title', "Buy")
                .on('click', function (e) {
                    $scope.openBuyPosition()

                }).append($('<span>Buy</span>'));

            tradingViewWidget.createButton().attr('title', "Sell")
                .on('click', function (e) {
                    $scope.openSellPosition()
                }).append($('<span>Sell</span>'));
            tradingViewWidget.onSymbolChange($scope.symbolChangeHandler);
        })
    }

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
            createWidget(/*$translate.use()*/'EN', "EURUSD")

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

loginController.$inject = ['$scope', '$log', '$filter', '$location', 'userServiceFactory', 'positionService', 'userService', 'sessionFactory', "appSettings"];

angular.module('ForexPlay.controllers.Main').controller('LoginController', loginController);