Array.prototype.last = function () {
    return this[this.length - 1];
};

var tradingViewWidget = undefined;
//TODO add a button to send back to manual testing
//TODO add a dashboard

var manualTradingController = function ($scope, $log, $filter, $location, /*$translate,*/
                                        appSettings, sessionFactory, positionService, userService) {

    function removeTradingWidget() {
        if (tradingViewWidget != undefined) {
            tradingViewWidget.remove();
        }
    }


    function createWidget(lang, security) {
        if (tradingViewWidget != undefined) {
            tradingViewWidget.remove();
        }
        tradingViewWidget = new TradingView.widget({
            fullscreen: true,
            container_id: "tv_chart_container",
            //	BEWARE: no trailing slash is expected in feed URL
            datafeed: new Datafeeds.UDFCompatibleDatafeed("https://demo_feed.tradingview.com"),
            library_path: "/assets/charting_library/",
            symbol: security,
            locale: lang,
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
                }).append($('<span>' + /*$translate.instant(*/'FORWARD'/*)*/ + '</span>'));
            tradingViewWidget.createButton().attr('title', "Buy")
                .on('click', function (e) {
                    $scope.openBuyPosition()

                }).append($('<span>' + /*$translate.instant(*/'BUY'/*)*/ + '</span>'));

            tradingViewWidget.createButton().attr('title', "Sell")
                .on('click', function (e) {
                    $scope.openSellPosition()
                }).append($('<span>' + /*$translate.instant(*/'SELL'/*) */+ '</span>'));
            tradingViewWidget.onSymbolChange($scope.symbolChangeHandler);
        })
    }

    $scope.signalManager = function () {
        var enabled = $('#tradingEnabled').is(':checked')
        sessionFactory.messageTradingSocket("trading:" + enabled)
    };

    $scope.emailingManager = function () {
        var enabled = $("#emailingEnabled").is(':checked')
        sessionFactory.messageTradingSocket("emailing:" + enabled)
    }

    $scope.signalManagerManageStrategy = function (strategy) {
        sessionFactory.messageTradingSocket(strategy + ":" + $('#' + strategy).is(':checked'))
    };

    $scope.managePositionSize = function (symbolData) {
        if (symbolData.type == "forex") {
            $scope.positionSize = 10000;
        } else {
            $scope.positionSize = 10;
        }
    }

    $scope.symbolChangeHandler = function (symbolData) {
        console.log("will change symbol for session " + symbolData.name + " new, old: " + positionService.session.pair)
        if (symbolData.name != positionService.session.pair) {
            positionService.instrument = symbolData.name;
            $scope.managePositionSize(symbolData);
            $scope.recreateSessionWithHistoryData();

            $scope.tradeviewPositions.every(function (item) {
                item.remove()
            })
        }
    };

    $scope.reversePosition = function (widgetPosition) {
        var trade = widgetPosition.position;
        widgetPosition.remove();
        createTradeClosedMarker(widgetPosition);
        $scope.closePosition(trade);

        if (trade.tradeType == PositionType.BUY.name)
            $scope.openSellPosition();
        else
            $scope.openBuyPosition();
    };

    var createTradeClosedMarker = function (widgetPosition) {
        var shape = widgetPosition.position.tradeType == PositionType.BUY.name ? 'arrow_up' : 'arrow_down';
        var point = {
            time: Datafeeds.UDFCompatibleDatafeed.getTickDate(),
            price: $scope.getPrice()
        }
        tradingViewWidget.createShape(point,
            {
                shape: shape,
                text: widgetPosition.position.getPL($scope.currentPrice()),
                lock: true
            })
    };

    var createSignalOpenMarker = function () {
        var point = {
            time: Datafeeds.UDFCompatibleDatafeed.getTickDate(),
            price: $scope.getPrice()
        }
        tradingViewWidget.createShape(point,
            {
                shape: 'arrow_up',
                text: 'But at: ' + $scope.currentPrice(),
                lock: true
            })
    };

    var createSignalCloseMarker = function () {
        var point = {
            time: Datafeeds.UDFCompatibleDatafeed.getTickDate(),
            price: $scope.getPrice()
        }
        tradingViewWidget.createShape(point,
            {
                shape: 'arrow_down',
                text: 'Close at: ' + $scope.currentPrice(),
                lock: true
            })
    };

    var createBuyWidgetTrade = function () {
        var widgetPosition = tradingViewWidget.createPositionLine()
            .setText("Horizontal")
            .setQuantity("1")
            .setQuantityBorderColor("#006500")
            .setQuantityBackgroundColor("#006500")
            .setLineColor("#006500")
            .setBodyBorderColor("#006500")
            .setCloseButtonBorderColor("#006500")
            .setCloseButtonBackgroundColor("#006500")
            .setLineLength(40)
            .setExtendLeft(false)
            .setLineLength(3);
        widgetPosition.setPrice(widgetPosition.getPrice());
        widgetPosition.setText("Buy at: " + widgetPosition.getPrice())
        widgetPosition.onReverse(function (text) {
            $scope.reversePosition(widgetPosition)
        }).onClose(function (text) {
            $scope.closePosition(widgetPosition.position);
            createTradeClosedMarker(widgetPosition)
            widgetPosition.remove()
        });
        $scope.tradeviewPositions.push(widgetPosition)
        return widgetPosition

    };

    var createSellWidgetTrade = function () {
        var widgetPosition = tradingViewWidget.createPositionLine()
            .setText("Horizontal").setQuantity("1")
            .setQuantityBorderColor("#FF0000")
            .setQuantityBackgroundColor("#FF0000")
            .setLineColor("#FF0000")
            .setBodyBorderColor("#FF0000")
            .setCloseButtonBorderColor("#FF0000")
            .setCloseButtonBackgroundColor("#FF0000")
            .setLineLength(40).setLineLength(3)
            .setExtendLeft(false);
        widgetPosition.setText("Sell at: " + widgetPosition.getPrice())
        widgetPosition.onReverse(function (text) {
            $scope.reversePosition(widgetPosition)
        }).onClose(function (text) {
            $scope.closePosition(widgetPosition.position);
            createTradeClosedMarker(widgetPosition);
            widgetPosition.remove()
        });
        widgetPosition.setPrice(widgetPosition.getPrice());

        $scope.tradeviewPositions.push(widgetPosition);
        return widgetPosition;
    };

    $scope.positionService = positionService;

    $scope.userService = userService;

    $scope.testEnabled = false;

    $scope.tradeviewPositions = [];

    $scope.appSettings = appSettings

    $scope.dtOptions = {
        "bStateSave": true,
        "bFilter": true,
        "bLengthChange": true,
        isDisplayLength: 5,
        "bPaginate": true,
        "bDestroy": false,
        sDom: "<'row'<'span6'l><'span6'f>r>t<'row'<'span6'i><'span6'p>>",
        sPaginationType: "bootstrap"
    }

    var dateFormat = "yyyy-MM-dd'T'HH:mm:ssZ"
    $scope.uiFormat = "dd-MM-yyyy HH:mm"

    $scope.getDateFormatted = function (date) {
        return $filter('date')(date, dateFormat)
    }

    $scope.getNowFormatted = function () {
        return $filter('date')(new Date(), dateFormat)
    };

    $scope.dateFromUnixTM = function tm(unix_tm) {
        var dt = new Date(unix_tm);
        return $scope.getDateFormatted(dt)
    };

    $scope.getSessionHistory = function () {
        sessionFactory.getSessionsForUser($scope);
    };

    $scope.counter = 0;

    $scope.init = function () {
        createWidget(/*$translate.use()*/'EN', "EURUSD")
    }

    function getBestSessionSoFar() {
    }

    $scope.loadTradesWithSession = function () {
        sessionFactory.getSessionTrades(positionService.session, $scope)
    }

    $scope.positionSize = 10;

    $scope.resetSession = function (skipWidgetCreation) {
        positionService.positions = []
        if (positionService.strategyStats != undefined)
            positionService.strategyStats.trades = []
        positionService.strategyCombinations = []
        $scope.newSessionHandler(skipWidgetCreation)
    }


    $scope.recreateSessionWithHistoryData = function () {
        $scope.resetSession();
    };

    $scope.getChartCurrentDate = function () {
        return $scope.getDateFormatted(
            $scope.dateFromUnixTM(Datafeeds.UDFCompatibleDatafeed.getTickDate() * 1000)
        )
    };

    $scope.loadStrategyVersion = function (strategy) {
        strategy

    }

    function inStrategyTestingMode(strategy) {
        return positionService.strategyStats != undefined && positionService.strategyStats.trades != undefined
            && positionService.strategyStats.trades.length > 0
    }

    $scope.updateChart = function (scroll) {
        Datafeeds.UDFCompatibleDatafeed.forwardChart();
        $scope.tradeviewPositions.forEach(function (chartPosition) {
            var position = chartPosition.position;
            if (!position.closed) {
                chartPosition.setText("PL: " + position.getPL($scope.getPrice()))
            }
        });
        $scope.getOrdersTotal();
        $scope.$apply()

        if (inStrategyTestingMode(positionService.strategyStats)
            && $scope.signal != undefined) {
            var strategyTradeDate = $scope.getDateFormatted(
                $scope.dateFromUnixTM($scope.signal.closeTime)
            );

            if ($scope.getChartCurrentDate() == strategyTradeDate) {
                $scope.signal = null;
                createSignalCloseMarker()
            }

        }
        else if (inStrategyTestingMode(positionService.strategyStats)
            && $scope.signal == undefined) {
            $scope.signal = $scope.getNextSignal()
            var strategyTradeDate = $scope.getDateFormatted(
                $scope.dateFromUnixTM($scope.signal.entryTime)
            );

            while ($scope.getChartCurrentDate() != strategyTradeDate) {
                Datafeeds.UDFCompatibleDatafeed.forwardChart();
            }
            createSignalOpenMarker();
        }
    };

    $scope.signal = undefined;

    $scope.getNextSignal = function () {
        var result = undefined;
        for (var i = 0; i < positionService.strategyStats.trades.length; i++) {
            var uiTrade = positionService.strategyStats.trades[i];
            var strategyTradeDate = $scope.getDateFormatted(
                $scope.dateFromUnixTM(uiTrade.entryTime)
            );
            if (strategyTradeDate > $scope.getChartCurrentDate()) {
                result = uiTrade;
                break;
            }
        }

        return result;
    }

    $scope.openBuyPosition = function () {
        var chartPosition = createBuyWidgetTrade();
        var buyTrade = new BuyPosition(null, positionService.session.sessionId, userService.user.uid,
            $scope.getChartCurrentDate(), chartPosition.getPrice(),
            positionService.session.pair, $scope.positionSize, null, null, false);
        chartPosition.position = buyTrade
        sessionFactory.createSessionTrade(chartPosition)


        $scope.getOrdersTotal();
    }

    $scope.openSellPosition = function () {
        var chartPosition = createSellWidgetTrade();
        var sellTrade = new SellPosition(null, positionService.session.sessionId, userService.user.uid,
            $scope.getChartCurrentDate(), $scope.getPrice(),
            positionService.session.pair, $scope.positionSize, false)

        chartPosition.position = sellTrade;
        sessionFactory.createSessionTrade(chartPosition)

        $scope.getOrdersTotal();
    }

    $scope.closePosition = function (position) {
        position.closedDate = $scope.getChartCurrentDate();
        position.closedPrice = $scope.getPrice();
        position.closed = true
        sessionFactory.updateSessionTrade(position, $scope)
        //TODO reloading of all trades when we close the trade, maybe too much but optimisation can be done at the end of the cycle
        //TODO IDEALLY only the page size should be reloaded and the offset when clicked on the next page
    }

    $scope.currentPrice = function () {
        return Datafeeds.UDFCompatibleDatafeed.getLastTickPrice();
    }
    $scope.getPrice = function () {
        return $scope.currentPrice();
    }

    $scope.newSessionHandler = function (skipWidgetCreation) {
        var tempSession = new FxSession(null, userService.user.uid, $scope.getNowFormatted(),
            $scope.getNowFormatted(), positionService.instrument, $scope.getNowFormatted(), $scope.positionSize);
        sessionFactory.createNewSession(tempSession)
            .success(function (data, status) {
                positionService.session = data;
                if (!skipWidgetCreation)
                    createWidget(/*$translate.use()*/'EN', positionService.session.pair)
                $scope.getOrdersTotal();
                $scope.getSessionHistory();

            }).
            error(function (data, status) {
                console.log(data || "Request failed");
            });
    }

    $scope.getOrdersTotal = function () {
        var total = 0;
        for (var i = 0, len = positionService.positions.length; i < len; i++) {
            var price = $scope.getPrice()
            var newPl = positionService.positions[i].getPL(price);
            total = total + parseFloat(newPl)
        }
        $scope.positionsTotal = total;
        $scope.totalType = $scope.positionsTotal < 0 ? 'alert-danger' : 'alert-success';
    }
    $scope.init();
};

manualTradingController.$inject = ['$scope', '$log', '$filter', '$location', /*'$translate',*/
    'appSettings', 'sessionFactory', 'positionService', 'userService'];

angular.module('ForexPlay.controllers.Main').controller('ManualTradingController', manualTradingController);