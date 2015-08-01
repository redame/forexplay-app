Array.prototype.last = function () {
    return this[this.length - 1];
};

var tradingViewWidget = undefined;
//TODO add a button to send back to manual testing
//TODO add a dashboard

var manualTradingController = function ($scope, $log, $filter, $location, $rootScope,
                                        appSettings, sessionFactory, positionService, userService) {

    $rootScope.$on('loginComplete', function (event, data) {
        console.log(data); // 'Broadcast!'
        createWidget('en', "EURUSD")
    });

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
            datafeed: new Datafeeds.UDFCompatibleDatafeed(appSettings, "https://demo_feed.tradingview.com"),
            library_path: "libs/charting_library/",
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
        console.log("will create buy widget")
        var chartPosition = createBuyWidgetTrade();
        console.log("created buy widget, will open position")

        var buyTrade = new BuyPosition(null, positionService.session.sessionId, userService.user.uid,
            $scope.getChartCurrentDate(), chartPosition.getPrice(),
            positionService.session.pair, $scope.positionSize, null, null, false);

        chartPosition.position = buyTrade

        console.log(buyTrade)
        sessionFactory.createSessionTrade(chartPosition)
        $scope.getOrdersTotal();
    }

    $scope.openSellPosition = function () {
        var chartPosition = createSellWidgetTrade();
        //function SellPosition(uid, sessionId, userId, openedDate, openedPrice, pair, size, closed, closedDate, closedPrice) {

        var sellTrade = new SellPosition(null, positionService.session.sessionId, userService.user.uid,
            $scope.getChartCurrentDate(), $scope.getPrice(),
            positionService.session.pair, $scope.positionSize, false)

        chartPosition.position = sellTrade;
        sessionFactory.createSessionTrade(chartPosition)

        $scope.getOrdersTotal();
    }

    $scope.closePosition = function (position) {
        console.log(position)
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
                    createWidget('en', positionService.session.pair)
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
};

manualTradingController.$inject = ['$scope', '$log', '$filter', '$location', '$rootScope',
    'appSettings', 'sessionFactory', 'positionService', 'userService'];

angular.module('ForexPlay.controllers.Main').controller('ManualTradingController', manualTradingController);

/*function translateCtrl($translate, $scope) {
 $scope.changeLanguage = function (langKey) {
 $translate.use(langKey);
 };
 }*/

/*function config($translateProvider) {

 $translateProvider
 .translations('en', {
 SEARCH: 'Search for something...',
 FORWARD: 'Forward Chart',
 BUY: 'Buy',
 SELL: 'Sell',
 STRATEGY: 'Strategy',
 TRADING_ACTIVITY: 'Trading Log',
 OPTIMIZE: 'Optimize',
 CANCEL: 'Cancel',
 COMPLETE_OF: 'completed of',
 CROSS: 'Cross',
 OPEN_PRICE: 'Open Price',
 CLOSE_PRICE: 'Close Price',
 OPEN_DATE: 'Open Date',
 CLOSED_DATE: 'Closed Date',
 POSITION: 'Lots',
 TYPE: 'Type',
 PL: 'PL',
 TOTAL: 'Total',
 SESSION_INFO: 'General session Info',
 BEST_SESSION: 'Best Session so far?',
 TESTING_NOW: 'You are testing',
 TESTING_RECENTLY: 'You recently tested',
 LANGUAGE: 'Language',
 PT24H: 'Daily',
 GET_SIGNALS: "Signals",
 BOT_MESSAGE: "Automatic strategy execution message",
 SETTINGS: "Settings",
 HOME: "Home",
 LOGOUT: "Log out",
 TRAIN: "Train"
 })
 .translations('it', {
 SEARCH: 'Cerca ...',
 FORWARD: 'Avanti',
 BUY: 'Compra',
 SELL: 'Vendi',
 STRATEGY: 'Strategia Automatica',
 TRADING_ACTIVITY: 'Log di Trading',
 OPTIMIZE: 'Ottimiza',
 CANCEL: 'Anulla',
 COMPLETE_OF: 'completati',
 CROSS: 'Cross',
 OPEN_PRICE: 'Prezzo Apertura',
 CLOSE_PRICE: 'Prezzo chiusura',
 OPEN_DATE: 'Data Apertura',
 CLOSED_DATE: 'Data Chiusura',
 POSITION: 'Lots',
 TYPE: 'Tipo',
 PL: 'PL',
 TOTAL: 'Totale',
 SESSION_INFO: 'General session Info',
 BEST_SESSION: 'Best Session so far?',
 TESTING_NOW: 'You are testing',
 TESTING_RECENTLY: 'You recently tested',
 LANGUAGE: 'Lingua',
 PT24H: 'Giornaliero',
 GET_SIGNALS: "Segnali",
 BOT_MESSAGE: "Messaggi strategia",
 SETTINGS: "Settings",
 HOME: "Home",
 LOGOUT: "Log out",
 TRAIN: "Train"

 }).translations('ro', {
 SEARCH: 'Cauta ...',
 FORWARD: 'Inainte',
 BUY: 'Cumpara',
 SELL: 'Vinde',
 STRATEGY: 'Strategia Automatica',
 TRADING_ACTIVITY: 'Log de Trading',
 OPTIMIZE: 'Optimizare',
 CANCEL: 'Anuleaza',
 COMPLETE_OF: 'completati',
 CROSS: 'Cross',
 OPEN_PRICE: 'Pret deschidere',
 CLOSE_PRICE: 'Pret inchidere',
 OPEN_DATE: 'Data deschidere',
 CLOSED_DATE: 'Data inchidere',
 POSITION: 'Lots',
 TYPE: 'Tip',
 PL: 'PL',
 TOTAL: 'Total',
 SESSION_INFO: 'General session Info',
 BEST_SESSION: 'Best Session so far?',
 TESTING_NOW: 'Testezi',
 TESTING_RECENTLY: 'Recent ai testat',
 LANGUAGE: 'Limba',
 PT24H: 'Daily',
 GET_SIGNALS: "Semnale",
 BOT_MESSAGE: "Mesaje strategia automatica",
 SETTINGS: "Settings",
 HOME: "Home",
 LOGOUT: "Log out",
 TRAIN: "Train"
 });

 $translateProvider.preferredLanguage('en');

 }*/

/*angular.module('ForexPlay.controllers.Main').config(config);*/

//case class StrategyAttribute(name:String, inputType:String, enabled:Boolean, min:Int, max:Int, actualValue:Int)
function StrategyAttribute(name, inputType, min, max, actualValue, enabled, stepSize) {
    this.name = name;
    this.inputType = inputType;
    this.min = min;
    this.max = max;
    this.actualValue = actualValuApp.Controllerse;
    this.enabled = enabled;
    this.stepSize = stepSize;
}

//PermutationProfit(profit:Double, combination:String)
function PermutationProfit(id, profit, combination) {
    this.id = id;
    this.profit = profit;
    this.combination = combination;
}
/**
 *  Represents the basic object of this application. A position is esentially
 *  a buy or a sell trade, containing some functionality for calculating
 *  price difference at a given time
 *
 * @param {date}    openedDate      Date of the opening of the trade
 * @param {number}  openedPrice     Price of instrument at the time of the opening
 * @param {string}  positionType    Type of the trade <code>SELL</code> or <code>BUY</code>
 * @param {string}  pair            ID of the instrument where the trade is opened
 * @param {int}     size            Number of contracts used to open the position
 * @constructor
 */

//case class UiTrade(entry: Double, close: Double, entryTime: DateTime, closeTime: DateTime, tradeType:String, profitLoss:Double)
function StrategyPosition(entry, close, entryTime, closeTime, tradeType, profitLoss, positionSize) {
    this.entry = entry;
    this.close = close;
    this.entryTime = entryTime;
    this.closeTime = closeTime;
    this.tradeType = tradeType;
    this.profitLoss = profitLoss;
    this.positionSize = positionSize;
}
function Position(openedDate, openedPrice, positionType, pair, size) {
    this.uid = null;
    this.openedDate = openedDate;
    this.openedPrice = openedPrice;
    this.pair = pair;
    this.size = size;
    this.closed = false;
    this.getInfo = function () {
        return this.pair + ': ' + this.openedPrice;
    };

    this.closedDate = null;
    this.closedPrice = null;

    this.isOpened = function () {
        return this.closedPrice != null;
    }

    /**
     * Calculated the PL at a certain time on the chart
     * If the result is -0.00, rewrite it to 0.00*
     * * *
     * @param price
     * @returns {*}
     */
    this.getPL = function (price) {
        if (price == null && this.closedPrice == null) return null;
        var referencePrice = this.closedPrice != null ? this.closedPrice : price;

        var result;

        if (this.tradeType === PositionType.SELL.name) {
            result = (this.size * (this.openedPrice - referencePrice)).toFixed(2);
        } else if (this.tradeType === PositionType.BUY.name) {
            var rfPrice = parseFloat(referencePrice)
            var openPrice = parseFloat(this.openedPrice)
            var rs = rfPrice - openPrice;
            var rs1 = parseFloat(this.size) * rs;
            result = rs1.toFixed(2);
        }
        return result === '-0.00' ? '0.00' : result;
    }
}
//case class FxSession(sessionId: Option[Long], userId: Long, startDate: String, endDate: String, pair: String)

/**
 * Current session of the user doing training. It's a wrapper class to help manage trades, instrument choice
 * user reference, user preferences* *
 * @param {number}  sessionId   Session ID of the user
 * @param {number}  userId      Reference to the user ID
 * @param {date}    startDate   Start date of the current testing session
 * @param {date}    endDate     End date of the current session
 * @param {string}  pair        Instrument of the session
 * @constructor
 */
function FxSession(sessionId, userId, startDate, endDate, pair, sessionCreated, positionSize) {
    this.sessionId = sessionId
    this.userId = userId
    this.startDate = startDate
    this.endDate = endDate
    this.pair = pair
    this.sessionCreated = sessionCreated;
    this.positionSize = positionSize;
    this.sessionTotalPl = 0;
}

/**
 * Enumerator class for Trade Types, SELL used to create a SellTrade, BUY is used to create a buy trade*
 * @type {{SELL: {name: string, label: string}, BUY: {name: string, label: string}}}
 */
var PositionType = {
    SELL: {name: "SELL", label: "Sell"}, BUY: {name: "BUY", label: "Buy"}
};

/**App.Controllers
 * Sell Trade inheriting from Position, it's a trade that creates profit from selling the instrument and expecting
 * it to decrease in value.
 * PL(Profit/Loss) of the trade = Open Price - Close Price
 * * *
 * @param {number}  uid             Identifier of the trade
 * @param {number}  sessionId       Identifier of the current session the trade is created under (many to one)
 * @param {number}  userId
 * @param {boolean} closed          Shows is the trade is closed or not(Kind of redundant and mostly useful in ui)
 * @param {date}    closedDate      Date of the closing of the trade
 * @param {number}  closedPrice     Price of the instrument at the time of the closing
 * @param {date}    openedDate      Date of the opening of the trade
 * @param {number}  openedPrice   App.Controllers  Price of instrument at the time of the opening
 * @param {string}  positionType    Type of the trade <code>SELL</code> or <code>BUY</code>
 * @param {string}  pair            ID of the instrument where the trade is opened
 * @param {int}     size            Number of contracts used to open the position
 * @constructor
 *  inherits Position
 */
function SellPosition(uid, sessionId, userId, openedDate, openedPrice, pair, size, closed, closedDate, closedPrice) {
    this.uid = uid;
    this.sessionId = sessionId;
    this.userId = userId;
    this.openedDate = openedDate;
    this.openedPrice = openedPrice;
    this.tradeType = PositionType.SELL.name;
    this.pair = pair;
    this.size = size;
    this.closedDate = closedDate;
    this.closedPrice = closedPrice;
    this.closed = closed;
}

/**
 * Sell Trade inheriting from Position, it's a trade that creates profit from selling the instrument and expecting
 * it to decrease in value.
 * PL(Profit/Loss) of the trade = Close Price - OpenPrice
 * * *
 * @param {number}  uid             Identifier of the trade
 * @param {number}  sessionId       Identifier of the current session the trade is created under (many to one)
 * @param {number}  userId
 * @param {boolean} closed          Shows is the trade is closed or not(Kind of redundant and mostly useful in ui)
 * @param {date}    closedDate      Date of the closing of the trade
 * @param {number}  closedPrice     Price of the instrument at the time of the closing
 * @param {date}    openedDate      Date of the opening of the trade
 * @param {number}  openedPrice     Price of instrument at the time of the opening
 * @param {string}  positionType    Type of the trade <code>SELL</code> or <code>BUY</code>
 * @param {string}  pair            ID of the instrument where the trade is opened
 * @param {int}     size            Number of contracts used to open the position
 * @constructor
 */
function BuyPosition(uid, sessionId, userId, openedDate, openedPrice, pair, size, closedDate, closedPrice, closed) {
    this.uid = uid;
    this.sessionId = sessionId;
    this.userId = userId;
    this.openedDate = openedDate;
    this.openedPrice = openedPrice;
    this.tradeType = PositionType.BUY.name;
    this.pair = pair;
    this.size = size;
    this.closedDate = closedDate
    this.closedPrice = closedPrice
    this.closed = closed
}

SellPosition.prototype = new Position();
BuyPosition.prototype = new Position();