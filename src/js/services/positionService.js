angular
    .module('ForexPlay.controllers.Main')
    .service('positionService',
    function PositionService() {
        var positionService = this;
        var positions = [];
        var product = "";
        var session = null;
        var bestSession = null;
        var sessionHistory = null;
        var security = undefined;

        this.socketWs = undefined;

        var optimize = false;
        var strategyCombinations = [];
        var strategyAttributes = []
        var strategyStats = undefined;
        var totalPermutations = 0;
        var resolution = 'D';
        var betaVersion = true;
        var loading = false;
        var timeFrame = "D";
        var dateFrom = null;
        var dateTo = null;
        var availableTestingInstruments = []
        /**
         * Tick data(Open, High, Low, Close
         *
         * @type {Array}
         */
        var ohlc = [];
        var strategyMessages = []
        var progressValue = undefined
        var strategy = ""
        this.availableStrategies = [
            {name: '2-Period RSI', id: 'RSI2'},
            {name: 'Moving Momentum', id: 'MovingMomentum'},
            {name: 'CCI Correction', id: 'CCI'},
            {name: 'Global Extrema', id: 'GlobalExtrema'}
        ]
        /* predefined strategy selected */
        this.strategy = "RSI2"

        this.runningStrategies = [];
        /**
         * Chart visible data only, type of OHCL
         *
         * @type {Array} of OHCL type
         */
        var chartData = [];

        /**
         * Last know tick on the chart - utility pointer
         */
        var currentTick;

        var dateFormat = "yyyy-MM-dd'T'HH:mm:ssZ"
        var uiFormat = "dd-MM-yyyy HH:mm"

        var getDateFormatted = function (date) {
            return $filter('date')(date, dateFormat)
        }

        var getNowFormatted = function () {
            return $filter('date')(new Date(), dateFormat)
        };

        var dateFromUnixTM = function tm(unix_tm) {
            var dt = new Date(unix_tm);
            return $scope.getDateFormatted(dt)
        };


    })