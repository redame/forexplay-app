(function () {
    var sessionFactory = function ($http, $log, $rootScope, $location, positionService, userService) {
        var factory = {};

        var positionService = positionService;

        $http.defaults.useXDomain = true;
        $http.defaults.useXDomain = true;

        function genericError(data) {
            console.log(data || "Closing session failed")
        }

        var remoteHost = "http://localhost:9000"

        factory.getCurrentUser = function () {
            return $http.get(remoteHost + '/getUserWithId/10000010')
        }

        factory.getBestSessionForUser = function () {
            $http.get(remoteHost +'/getBestSessionForUserMobile/'+userService.user.uid).success(function (data) {
                positionService.bestSession = data
            }).error(genericError)
        };

        factory.getOrCreateSession = function (session) {
            return $http.post(remoteHost + '/getOrCreateSessionMobile/'+session.userId)
        };


        factory.saveTradingInformation = function (tradingAccount, tradingAccountPass) {
            $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
            //return $http.post('/closeSession', )
            $http({
                method: 'POST',
                url: '/saveTradingInformation',
                data: $.param({tradingAccount: tradingAccount, tradingAccountPass: tradingAccountPass}),
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function (data, status, headers) {
                userService.user = data
                console.log(userService.user)
            }).error(genericError)
        }

        factory.getSessionsForUser = function ($scope) {
            return $http.get( remoteHost + '/getSessionsForUserMobile/'+userService.user.uid).success(function (data) {
                positionService.sessionHistory = data;
                factory.getBestSessionForUser()
            }).error(genericError)
        }

        factory.createSessionTrade = function (widget) {
            $http.post('/createSessionTrade', widget.position).success(function (data, status, headers) {

                var n = data
                var trade = null
                if (n.tradeType === PositionType.SELL.name) {
                    trade = new SellPosition(n.uid, n.sessionId, n.userId, n.openedDate, n.openedPrice, n.pair, n.size, n.closed, n.closedDate, n.closedPrice);
                } else {
                    trade = new BuyPosition(n.uid, n.sessionId, n.userId, n.openedDate, n.openedPrice, n.pair, n.size, n.closedDate, n.closedPrice, n.closed);
                }
                widget.position = trade;
                positionService.positions.splice(0, 0, trade)
            }).error(genericError)
        };


        factory.createSessionTrade = function (widget) {
            $http.post('/createSessionTrade', widget.position).success(function (data, status, headers) {

                var n = data
                var trade = null
                if (n.tradeType === PositionType.SELL.name) {
                    trade = new SellPosition(n.uid, n.sessionId, n.userId, n.openedDate, n.openedPrice, n.pair, n.size, n.closed, n.closedDate, n.closedPrice);
                } else {
                    trade = new BuyPosition(n.uid, n.sessionId, n.userId, n.openedDate, n.openedPrice, n.pair, n.size, n.closedDate, n.closedPrice, n.closed);
                }
                widget.position = trade;
                positionService.positions.splice(0, 0, trade)
            }).error(genericError)
        };

        factory.processStrategyResult = function (strategy, result) {
            positionService.strategyStats = result
            //time:Long, datapoint:Double
            var dp = positionService.strategyStats.stats
            var datapoints = []
            var str = ""
            for (var index = 0; index < dp.length; index++) {

                datapoints[index] = [parseInt(dp[index].time), parseInt(dp[index].datapoint)];
                str += "[" + parseInt(dp[index].time) + "," + parseInt(dp[index].datapoint) + "]"
            }

            positionService.flotData = [
                {
                    data: datapoints,
                    label: strategy
                }
            ];
            positionService.loading = false;
        }

        factory.updateSessionTrade = function (position, $scope) {
            $http.post('/updateSessionTrade', position).success(function (data, status, headers) {
                $scope.loadTradesWithSession()
            }).error(genericError)
        };

        factory.getSessionTrades = function (session) {
            return $http.get('/getSessionTrades?sessionId=' + session.sessionId + "&userId=" + session.userId)
                .success(function (data) {
                    positionService.positions = jQuery.map(data, function (n, i) {
                        if (n.tradeType === PositionType.SELL.name) {
                            return new SellPosition(n.uid, n.sessionId, n.userId, n.openedDate, n.openedPrice, n.pair, n.size, n.closed, n.closedDate, n.closedPrice);
                        } else {
                            return new BuyPosition(n.uid, n.sessionId, n.userId, n.openedDate, n.openedPrice, n.pair, n.size, n.closedDate, n.closedPrice, n.closed);
                        }
                    });

                }).error(genericError)
        };

        factory.createNewSession = function (fxSession) {
            return $http.post('/createSession', fxSession)
        };

        factory.closeSession = function (sessionId, lastPrice) {
            var FormData = {
                'sessionId': sessionId,
                'lastPrice': lastPrice
            };

            $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
            //return $http.post('/closeSession', )
            $http({
                method: 'POST',
                url: '/closeSession',
                data: $.param({sessionId: sessionId, lastPrice: lastPrice}),
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            })
                .success(function (data) {
                    positionService.session = data
                    factory.getSessionTrades(data)

                }).error(genericError)

        };

        return factory;
    };

    sessionFactory.$inject = ['$http', '$log', '$rootScope', '$location', 'positionService', 'userService'];
    angular.module('ForexPlay').factory('sessionFactory', sessionFactory);
}());