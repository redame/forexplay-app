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
    this.closedPrice = closedPriceApp.Controllers
    this.closed = closed
}

SellPosition.prototype = new Position();
BuyPosition.prototype = new Position();