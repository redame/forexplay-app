(function () {
    var sessionFactory = function ($http, $log, $rootScope, $location, positionService, appSettings) {
        var factory = {};

        var positionService = positionService;

        $http.defaults.useXDomain = true;

        function genericError(data) {
            console.log(data || "Closing session failed")
        }

        factory.getBestSessionForUser = function () {
            $http.get(appSettings.endpoint+'/getBestSessionForUser').success(function (data) {
                positionService.bestSession = data
            }).error(genericError)
        }

        factory.getOrCreateSession = function (session) {
            return $http.post(appSettings.endpoint+'/getOrCreateSession', session)
        }

        factory.getSessionsForUser = function ($scope) {
            return $http.get(appSettings.endpoint+'/getSessionsForUser').success(function (data) {
                positionService.sessionHistory = data;
                factory.getBestSessionForUser()
            }).error(genericError)
        }

        factory.createSessionTrade = function (widget) {
            $http.post(appSettings.endpoint+'/createSessionTrade', widget.position).success(function (data, status, headers) {

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
            $http.post(appSettings.endpoint+'/createSessionTrade', widget.position).success(function (data, status, headers) {

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




        factory.updateSessionTrade = function (position, $scope) {
            $http.post(appSettings.endpoint+'/updateSessionTrade', position).success(function (data, status, headers) {
                $scope.loadTradesWithSession()
            }).error(genericError)
        };

        factory.getSessionTrades = function (session) {
            return $http.get(appSettings.endpoint+'/getSessionTrades?sessionId=' + session.sessionId + "&userId=" + session.userId)
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
            return $http.post(appSettings.endpoint+'/createSession', fxSession)
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
                url: appSettings.endpoint+'/closeSession',
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

    sessionFactory.$inject = ['$http', '$log', '$rootScope', '$location', 'positionService', 'appSettings'];
    angular.module('ForexPlay').factory('sessionFactory', sessionFactory);
}());
