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
        scope.inner = {};
        scope.wrap = {};

        var config = $popupWindow.config();
        $http.post(config.tpls.wrapTpl).success(function (template) {
            elem.html(template);
            var content = elem.contents();
            $compile(content)(scope);
            scope.inner.tplLoad = true;
        });
    };
}]);
/*
 * Шапка всплывающего окна
 */
popup.directive("popupHeader", ['$popupWindow', '$http', '$compile', function ($popupWindow, $http, $compile) {
    return function (scope, elem, attr) {
        scope.header = {};
        var config = $popupWindow.config();
        $http.post(config.tpls.headerTpl).success(function (template) {
            elem.html(template);
            var content = elem.contents();
            $compile(content)(scope);
            scope.header.tplLoad = true;
        });
    };
}]);
/*
 * Область контента
 */
popup.directive("popupContent", ['$popupWindow', '$http', '$compile', function ($popupWindow, $http, $compile) {
    return function (scope, elem, attr) {
        scope.content = {};
        var config = $popupWindow.config();
        $http.post(config.tpls.contentTpl).success(function (template) {
            elem.html(template);
            var content = elem.contents();
            $compile(content)(scope);
            scope.content.tplLoad = true;
        });
    };
}]);
/*
 * Облать подвала
 */
popup.directive("popupFooter", ['$popupWindow', '$http', '$compile', function ($popupWindow, $http, $compile) {
    return function (scope, elem, attr) {
        scope.footer = {};
        var config = $popupWindow.config();
        $http.post(config.tpls.footerTpl).success(function (template) {
            elem.html(template);
            var content = elem.contents();
            $compile(content)(scope);
            scope.footer.tplLoad = true;
        });
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
            outPadding: 100,
            winType: 'image',
            maxSizes: {
                width: 1024,
                height: 768
            },
            minSizes: {
                width: 640,
                height: 480
            },
            queue: []
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
            var inner = {
                show: true,
                padding: config.margin + 'px 0 ' + config.margin + 'px 0',
                width: sizes.pageWidthScroll,
                height: sizes.viewHeight
            };
            //Размер внешнего блока
            var wrap = {
                padding: config.padding,
                width: sizes.pageWidthScroll - config.outPadding * 2
            };

            if (wrap.width < config.minSizes.width) {
                wrap.width = config.minSizes.width;
            } else {
                if (wrap.width > config.maxSizes.width) {
                    wrap.width = config.maxSizes.width;
                }
            }
            var header = {};
            var content = {
                img: {}
            };
            var footer = {};

            angular.extend(scope.wrap, wrap);
            angular.extend(scope.inner, inner);
            angular.extend(scope.header, header);
            angular.extend(scope.content, content);
            angular.extend(scope.footer, footer);
            //Как только все части окна подгруженны начинаем впихивать туда контент
            var loadTpl = $interval(function () {
                if (scope.inner.tplLoad && scope.header.tplLoad && scope.content.tplLoad && scope.footer.tplLoad) {
                    $interval.cancel(loadTpl);
                    this.loadContent();
                    //this.updateScope();
                }
            }.bind(this), 500);

            //Ресайз окна
            $window.onresize = function () {
                this.windowResize();
            }.bind(this);
        },
        //Пересчет размеров окна
        windowResize: function () {
            sizes = this.getTrueWindowSize(), newWinWidth = sizes.pageWidthScroll, newWinHeight = sizes.viewHeight, newSizes = null, wrap = null;
            scope.$apply(function () {
                scope.inner.width = newWinWidth;
                scope.inner.height = newWinHeight;

                wrap = sizes.pageWidthScroll - config.outPadding * 2;
                //Получаем новые размеры изображения
                if (wrap < config.minSizes.width) {
                    wrap = config.minSizes.width;
                } else {
                    if (wrap > config.maxSizes.width) {
                        wrap = config.maxSizes.width;
                    }
                }
                scope.wrap.width = wrap;
                newSizes = this.getNewSize(this.currContent);
                if (this.currContent.ratio < 1) {
                    if (newSizes[0] <= config.minSizes.width) {
                        scope.wrap.width = config.minSizes.width;
                    } else {
                        scope.wrap.width = newSizes[0];
                    }
                } else {
                    scope.wrap.width = newSizes[0];
                }
                scope.content.img.width = newSizes[0];
                scope.content.img.height = newSizes[1];
            }.bind(this));

        },
        loadContent: function () {
            var item = null;
            switch (config.winType) {
                case 'image':
                    item = new Item();
                    this.root.$on("window:contentLoaded", function (e, item) {
                        if (!item.error) {
                            this.queue.push(item);
                            angular.extend(scope.content.img, item);
                            if (item.ratio < 1) {
                                if (item.width <= config.minSizes.width) {
                                    scope.wrap.width = config.minSizes.width;
                                } else {
                                    scope.wrap.width = item.width;
                                }
                            } else {
                                scope.wrap.width = item.width;
                            }
                            this.currContent = item;
                            this.updateScope();
                        }
                    }.bind(this));
                    break;
                case 'ajax':
                    console.log('Подгрузка через ajax');
                    break;
            }
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
        },
        getNewSize: function (img) {
            var wrapWidth = scope.wrap.width, winHeight = sizes.viewHeight, result = {};
            //Желаемые размеры картинки
            var desiredWidth = wrapWidth, desiredHeight = winHeight - (config.margin * 2 + config.padding * 2);

            if (img.ratio < 1) {
                desiredHeight -= config.outPadding;
            }

            //Проверка на минимальную высоту
            if (desiredHeight < config.minSizes.height) {
                desiredHeight = config.minSizes.height;
            }

            if ((img.oric_width / desiredWidth) > (img.oric_height / desiredHeight)) {
                result[0] = desiredWidth;
                result[1] = Math.round(img.oric_height * desiredWidth / img.oric_width);
            } else {
                result[0] = Math.round(img.oric_width * desiredHeight / img.oric_height);
                result[1] = desiredHeight;
            }
            return result;
        }
    };

    var Item = function () {
        switch (config.winType) {
            case 'image':
                var link = win.el[0].href;
                if (!link) {
                    throw ("Вы не заполнили атребут href у источника!");
                } else {
                    var img = new Image();
                    img.onload = function () {
                        this.oric_width = img.width;
                        this.oric_height = img.height;
                        this.src = link;
                        this.el = img;
                        this.ratio = this.oric_width / this.oric_height;
                        var newSizes = win.getNewSize(this);
                        this.width = newSizes[0];
                        this.height = newSizes[1];
                        win.root.$broadcast("window:contentLoaded", this);
                        img = 0;
                    }.bind(this);
                    img.onerror = function () {
                        this.error = true;
                        this.el = img;
                        win.root.$broadcast("window:contentLoaded", this);
                        img = 0;
                    }.bind(this);
                    img.src = link;
                }
                break;
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