/**
 * Created by netBeans.
 * Name: popupWindow
 * User: Abaddon
 * Date: 29.04.14
 * Time: 17:15
 * Description: Open popup window
 */
var popup = angular.module("popupWindow", []);

popup.directive("popupWindow", ['$popupWindow', function ($popupWindow) {
    return {
        link: function (scope, elem, attr) {
            elem.bind("click", function (e) {
                e.preventDefault();
                scope.$emit('window:open', elem, attr);
            });
        }
    };
}]);
/*
* Основной шаблон
 */
popup.directive("popupWrap", ['$popupWindow', '$http', '$compile', function ($popupWindow, $http, $compile) {
    return function (scope, elem, attr) {

    };
}]);
/*
* Шапка всплывающего окна
 */
popup.directive("popupHeader", ['$popupWindow', '$http', '$compile', function ($popupWindow, $http, $compile) {
    return function (scope, elem, attr) {

    };
}]);
/*
* Область контента
 */
popup.directive("popupContent", ['$popupWindow', '$http', '$compile', function ($popupWindow, $http, $compile) {
    return function (scope, elem, attr) {

    };
}]);
/*
* Облать подвала
 */
popup.directive("popupFooter", ['$popupWindow', '$http', '$compile', function ($popupWindow, $http, $compile) {
    return function (scope, elem, attr) {

    };
}]);

popup.factory("$popupWindow", ["$rootScope", "$window", "$document", "$interval", function ($rootScope, $window, $document, $interval) {
    var config = {}, win = null, scope = null, sizes = null;

    var Window = function (settings) {
        if (!(this instanceof Window)) {
            return new Window(settings);
        }

        angular.extend(this, {
            root: $rootScope,
            url: 1,
            resize: true,
            padding: 15,
            margin: 10,
            outPadding: 200,
            winType: 'image',
            maxSizes: {
                width: 1024,
                height: 768
            },
            minSizes: {
                width: 640,
                height: 480
            },
            imagesQueue: []
        }, settings);

        /*
        * Open window event
         */
        this.scope.$on('window:open', function (e, elem, attr) {
            scope = this.scope;
            //Проверяем не были ли переданы настройки непосредственно через элемент
            if (scope) {
                if (attr.windowSettings) {
                    var set = this.scope.$eval(attr.windowSettings);
                    angular.extend(config, this, set);
                } else {
                    angular.extend(config, this);
                }
                this.el = elem;
                //Строим окно
                this.buildWindow();
            } else {
                throw ("Вы не передали локальный scope в ф-ю инициализации!");
            }
        }.bind(this));

        win = this;
    };

    Window.prototype = {
        /*
        * Building popup
         */
        buildWindow: function () {
            sizes = this.sizes = this.getTrueWindowSize();
            //Размер внешнего блока
            var wrap = {
                show: true,
                margin: config.margin,
                padding: config.padding,
                width: sizes.pageHeightScroll - (config.padding * 2)
            };

            var inner = {
                width: sizes.pageWidthScroll,
                height: sizes.pageHeightScroll
            };

            if (wrap.width < config.minSizes.width) {
                wrap.width = config.minSizes.width - config * 2;
            } else {
                if (wrap.width > config.maxSizes.width) {
                    wrap.width = config.maxSizes.width - config * 2;
                }
            };

            this.updateScope();
        },
        updateScope: function () {
            this.root.$$phase || this.root.$digest();
        },
        getTrueWindowSize: function () {
            var xScroll,
                yScroll,
                pageWidth,
                pageHeight,
                windowWidth,
                windowHeight,
                sizes = {},
                doc = $document[0].documentElement,
                d = $document[0],
                w = $window;

            //ширина и высота с учетом скролла
            if (w.innerHeight && w.scrollMaxY) {
                xScroll = d.body.scrollWidth;
                yScroll = w.innerHeight + w.scrollMaxY;
            } else if (d.body.scrollHeight > d.body.offsetHeight) { // all but Explorer Mac
                xScroll = d.body.scrollWidth;
                yScroll = d.body.scrollHeight;
            } else if (doc && doc.scrollHeight > doc.offsetHeight) { // Explorer 6 strict mode
                xScroll = doc.scrollWidth;
                yScroll = doc.scrollHeight;
            } else { // Explorer Mac...would also work in Mozilla and Safari
                xScroll = d.body.offsetWidth;
                yScroll = d.body.offsetHeight;
            }

            if (self.innerHeight) { // all except Explorer
                windowWidth = self.innerWidth;
                windowHeight = self.innerHeight;
            } else if (doc && doc.clientHeight) { // Explorer 6 Strict Mode
                windowWidth = doc.clientWidth;
                windowHeight = doc.clientHeight;
            } else if (d.body) { // other Explorers
                windowWidth = d.body.clientWidth;
                windowHeight = d.body.clientHeight;
            }

            // for small pages with total height less then height of the viewport
            if (yScroll < windowHeight) {
                pageHeight = windowHeight;
            } else {
                pageHeight = yScroll;
            }

            // for small pages with total width less then width of the viewport
            if (xScroll < windowWidth) {
                pageWidth = windowWidth;
            } else {
                pageWidth = xScroll;
            }

            return sizes = {
                'pageWidth': pageWidth,
                'pageHeight': pageHeight,
                'viewWidth': windowWidth,
                'viewHeight': windowHeight,
                'pageWidthScroll': xScroll,
                'pageHeightScroll': yScroll
            };
        }
    };

    return {
        init: function (settings) {
            return Window(settings);
        },
        config: function () {
            return win;
        }
    }
}]);