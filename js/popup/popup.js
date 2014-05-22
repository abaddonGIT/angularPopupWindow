/**
 * Created by netBeans.
 * Name: popupWindow
 * User: Abaddon
 * Date: 29.04.14
 * Time: 17:15
 * Description: Open popup window
 */
var popup = angular.module("popupWindow", []);
popup.factory("templateCache", ["$cacheFactory", function ($cacheFactory) {
    return $cacheFactory("template-cache");
}]);
popup.value("windowSectors", {
    inner: {el: null},
    wrap: {el: null},
    header: {el: null},
    content: {el: null},
    footer: {el: null},
    fullscreen: {el: null}
});
popup.directive("popupWindow", ['$popupWindow', function ($popupWindow) {
    return {
        link: function (scope, elem, attr) {
            var stop = scope.$watch('windowStart', function (value) {
                if (value) {
                    var group = attr.group;
                    //Создаем наборы из однотипных элементов
                    var unicid = $popupWindow.unicid();
                    elem[0].setAttribute("unicid", unicid);
                    if (attr.group) {
                        if (value.setElements[group]) {
                            value.setElements[group].push({unicid: unicid, el: elem});
                        } else {
                            value.setElements[group] = [];
                            value.setElements[group].push({unicid: unicid, el: elem});
                        }
                    }
                    stop();
                }
            });
        }
    };
}]);
/*
 * Подгрузка компонентов шаблона
 */
popup.directive("windowSection", ['$popupWindow', 'windowSectors', function ($popupWindow, windowSectors) {
    return function (scope, elem, attr) {
        var sector = attr.windowSection;
        switch (sector) {
            case 'header':
                windowSectors.header = {el: elem};
                break;
            case 'content':
                windowSectors.content = {el: elem};
                break;
            case 'footer':
                windowSectors.footer = {el: elem};
                break;
            case 'wrap':
                windowSectors.wrap = {el: elem};
                break;
            case 'fullscreen':
                windowSectors.fullscreen = {el: elem};
                break;
        }
        ;
    };
}]);
/*
 * Основной шаблон
 */
popup.directive("popupWrap", ['windowSectors', function (windowSectors) {
    return {
        replace: true,
        template: '<div id="window-wrap" ng-show="winpopup.inner.show">' +
            '<div id="wrap-inner" ng-style="{width:winpopup.inner.width + \'px\', height:winpopup.inner.height + \'px\', padding:winpopup.inner.padding}">' +
            '<div id="wrap-block" data-window-section="wrap" ng-style="{width:winpopup.wrap.width + \'px\', padding:winpopup.wrap.padding + \'px\'}">' +
            '</div>' +
            '</div>' +
            '</div>',
        link: function (scope, elem, attr) {
            var stop = scope.$watch('loadWindowTemp', function (value) {
                windowSectors.inner = {
                    el: elem,
                    loaded: true
                };
                elem.on('click', function (e) {
                    var target = e.target;
                    if (target.id === "wrap-inner") {
                        scope.$emit("window:close");
                    }
                });
            });
        }
    };
}]);
/*
 * Шапка всплывающего окна
 */
popup.directive("imageIncontent", ['$popupWindow', '$http', '$compile', function ($popupWindow, $http, $compile) {
    return function (scope, elem, attr) {
        scope.$emit("window:imageContent", elem, attr);
    };
}]);

popup.directive("htmlContent", ['$popupWindow', '$http', '$compile', function ($popupWindow, $http, $compile) {
    return function (scope, elem, attr) {
        scope.$emit("window:htmlContent", elem, attr);
    };
}]);
/*
 * Сохранение данных в localStorage
 */
popup.factory("$winStorage", ["$window", "$location", function ($window, $location) {
    //Сохраняет объект в хранилище
    var setItem = function (item) {
        //console.log(item.openConfig);
        var config = JSON.stringify(item.openConfig, function (key, value) {
            if (key == 'el') return undefined;
            return value;
        });
        localStorage.setItem(item.win_id, config);
    };
    //Достает из хранилища
    var getItem = function (name) {
        return JSON.parse(localStorage[name]);
    };

    var clear = function () {
        localStorage.clear();
    };

    return {
        set: setItem,
        get: getItem,
        clear: clear
    };
}]);
/*
 * FullScreen api
 */
popup.factory("$fullScreen", ['$document', '$rootScope', function ($document, $rootScope) {
    var d = $document[0];
    var open = function (elem) {
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
    };
    var cancel = function () {
        if (d.exitFullscreen) {
            d.exitFullscreen();
        }
        else if (d.mozCancelFullScreen) {
            d.mozCancelFullScreen();
        }
        else if (d.webkitCancelFullScreen) {
            d.webkitCancelFullScreen();
        }
        else if (d.msExitFullscreen) {
            d.msExitFullscreen();
        }
    };
    var addEvent = function () {
        if (d.fullscreenEnabled) {
            d.addEventListener("fullscreenchange", function () {
                if (!d.fullScreen) {

                }
            }, false);
        } else if (d.mozFullScreenEnabled) {
            d.addEventListener("mozfullscreenchange", function () {
                if (!d.mozFullScreen) {

                }
            }, false);
        } else if (d.webkitFullscreenEnabled) {
            d.addEventListener("webkitfullscreenchange", function () {
                if (!d.webkitIsFullScreen) {
                    $rootScope.$emit("window:fullScreenClose");
                }
            }, false);
        } else if (d.msFullscreenEnabled) {
            d.addEventListener("msfullscreenchange", function () {
                if (!d.msFullscreenElement) {

                }
            }, false);
        }
    };

    return {
        openFullScreen: open,
        cancelFullScreen: cancel,
        fullScreeEvent: addEvent
    };
}]);
popup.factory("$popupWindow", [
    "$rootScope",
    "$window",
    "$document",
    "$interval",
    "$http",
    "$compile",
    "windowSectors",
    "$timeout",
    "$location",
    "$winStorage",
    "$rootElement",
    "templateCache",
    "$fullScreen",
    function ($rootScope, $window, $document, $interval, $http, $compile, windowSectors, $timeout, $location, $winStorage, $rootElement, templateCache, $fullScreen) {
        "use strict";
        var win, scope, sizes, elemAttr, def, config, $W = angular.element($window), response;
        var Window = function (settings) {
            if (!(this instanceof Window)) {
                return new Window(settings);
            }
            scope = settings.scope;
            //Настройки для инстанса
            angular.extend(this, {
                config: {},
                root: $rootScope,
                scope: settings.scope,
                setElements: {},
                queue: [],
                timestamp: Date.now(),
                el: null,
                group: null,
                index: null,
                unicid: null,
                currContent: null,
                loadImages: {},
                pushState: true,
                tpls: [],
                body: $document[0].querySelector("body")
            });
            //Настройки для конкретного окна
            def = {
                resize: true,
                padding: 15,
                margin: 10,
                outPadding: 100,
                winType: 'image',
                innerTpl: 'tpl/defaultWrapTpl.html',//Шаблон внутренней части окна. может быть различным для разных вызовов
                maxSizes: {
                    width: 1024,
                    height: 768
                },
                minSizes: {
                    width: 640,
                    height: 480
                },
                ajax: {
                    method: 'post',
                    url: 'test.php',
                    headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'},
                    data: {}
                },
                dataRequest: {},
                userControl: false,
                effect: 1
            };
            //Обнуляем гопшу при следующих вызовах
            win = this;
            sizes = null;
            elemAttr = {};
            config = null;
            response = null;
            angular.extend(this.config, def, settings);
            config = this.config;

            scope.$on("window:navigate", this._windowPagination.bind(this));//листалка
            scope.$on("window:imageLoaded", this._windowImageLoaded.bind(this));//После разбора и создания объекта отображения, который включает в себя изображение
            scope.$on("window:contentLoaded", this._windowContentLoaded.bind(this));//После создания объекта отображения, который представляет из себя просто кусок html-кода
            this.root.$on("window:fullScreenClose", function () {
                this.cancelFullScreen();
            }.bind(this));

            //При перезагрузке страницы
            if (this.pushState) {
                var search = $location.search();
                if (search['win_id']) {
                    var storageConfig = $winStorage.get(search['win_id']);
                    if (storageConfig) {
                        $timeout(function () {
                            var el = $rootElement[0].querySelector('#' + search['win_id']);
                            if (el) {
                                storageConfig.el = angular.element(el);
                                this.open(storageConfig);
                            }
                        }.bind(this), 0);
                    }
                }
            }
            //Закрытие окна при клике вне его
            scope.$on("window:close", function () {
                this.closeWindow();
            }.bind(this));
            //Изменение отображения
            $fullScreen.fullScreeEvent();

            scope.windowStart = this;
            scope.loadWindowTemp = this;
        };
        Window.prototype = {
            //Открывает окно
            open: function (settings) {
                var locSettings = {};
                //Строим конфиг текущего элемента
                angular.extend(locSettings, def, settings);
                //настройки
                angular.extend(this, {
                    el: settings.el,
                    group: settings.el[0].getAttribute("data-group"),
                    unicid: settings.el[0].getAttribute('unicid'),
                    config: locSettings,
                    win_id: settings.el[0].id
                });
                config = this.config;
                if (this.group) {
                    this._getIndexFromNabor();
                }
                //Подгрузка внутренней части окна
                this._loadInnerTpl(function () {
                    $timeout(function () {
                        this._defaultWindow();
                        this._loadContent();
                    }.bind(this), 0);
                }.bind(this));

                //Ресайз окна
                //if (config.resize) {
                $W.on('resize', function () {
                    this.currWrapWidth = null;
                    this._windowResize();
                }.bind(this));
                //}
            },
            //Подгрузка области контента
            _loadInnerTpl: function (callback) {
                if (config.innerTpl) {
                    var tpl = templateCache.get(config.innerTpl);
                    if (!tpl) {
                        $http.post(config.innerTpl).success(function (data) {
                            windowSectors.wrap.el.html(data);
                            var content = windowSectors.wrap.el.contents();
                            //Добавляем метку к блоку
                            $compile(content)(this.scope);
                            templateCache.put(config.innerTpl, data);
                            callback();
                        }.bind(this));
                    } else {//Шаблон уже был подгружен и его не нодо прогонять
                        windowSectors.wrap.el.html(tpl);
                        var content = windowSectors.wrap.el.contents();
                        $compile(content)(this.scope);
                        callback();
                    }
                } else {
                    throw ("Не указан шаблон внутренней части окна!");
                }
            },
            //Находит текущий элемент в наборе однотипных
            _getIndexFromNabor: function () {
                angular.forEach(this.setElements[this.group], function (item, key) {
                    if (item.unicid === this.unicid) {
                        this.index = key;
                    }
                }.bind(this));
            },
            //Дефолтовое состояние окна
            _defaultWindow: function () {
                var group = this.setElements[this.group];
                sizes = this.sizes = this.getTrueWindowSize();
                var winpopup = {
                    counter: group ? group.length : 0,
                    index: this.index + 1,
                    inner: {
                        padding: config.margin + 'px 0 ' + config.margin + 'px 0',
                        width: sizes.pageWidth,
                        height: sizes.viewHeight
                    },
                    wrap: {
                        padding: config.padding,
                        width: this.getWrapWidth()
                    },
                    navigation: {
                        preloader: false,
                        prev: false,
                        next: false
                    },
                    content: {}
                };
                scope.winpopup = winpopup;
                //Добавление класса эффектов
                switch (config.effect) {
                    case 1:
                        windowSectors.wrap.el.addClass("win-effect-1");
                        break;
                    case 2:
                        windowSectors.wrap.el.addClass("win-effect-2");
                        break;
                    case 3:
                        windowSectors.wrap.el.addClass("win-effect-3");
                        break;
                    case 4:
                        windowSectors.wrap.el.addClass("win-effect-4");
                        break;
                    case 5:
                        windowSectors.wrap.el.addClass("win-effect-5");
                        break;

                }
                ;
            },
            //Пагинация
            _windowPagination: function (e, elem, act, param) {
                switch (act) {
                    case 'next':
                        this.index = this.index + 1;
                        break;
                    case 'prev':
                        this.index = this.index - 1;
                        break;
                }
                angular.extend(this, {
                    el: elem,
                    unicid: elem[0].getAttribute('unicid'),
                    win_id: elem[0].id
                });

                //Вычисляем реальные размеры для окна. но не применяем их дабы не было эффекта дергания
                this.currWrapWidth = this.getWrapWidth();
                windowSectors.wrap.el.removeClass("win-show").addClass("win-close");
                this._trigger("window:beforePagination", elem, windowSectors);
                //Новая картинка
                $timeout(function () {
                    this._loadContent();
                    scope.winpopup.index = this.index + 1;
                }.bind(this), 600);
            },
            _loadContent: function () {
                this._trigger("window:beforeContentLoaded", windowSectors);
                elemAttr = config.dataRequest || {};
                switch (config.winType) {
                    case 'image'://Для картинки без ajax-са
                        new Img(this.el);
                        break;
                    case 'ajax'://подгрузка контента через ajax
                        config.ajax.data = config.dataRequest;
                        config.ajax.transformRequest = function (data) {
                            return this.toParam(data);
                        }.bind(this);
                        $http(config.ajax).success(function (data, status) {
                                response = data;
                                if (data instanceof Object) {//если вернули json
                                    if (data.src) {
                                        new Content(this.el, 'image', data);
                                    } else {
                                        new Content(this.el, 'json', data);
                                    }
                                } else {
                                    windowSectors.content.el.html(data);
                                    var content = windowSectors.content.el.contents();
                                    $compile(content)(scope);
                                }
                            }.bind(this)).error(function (data, status) {
                            throw ("При попытке получения данных произошел сбой!");
                        });
                        //картинка, которая была внутри полученного контента загружена
                        scope.$on("window:imageContent", function (e, img, attr) {
                            new Img(img);
                        }.bind(this));
                        //просто html контент загружен
                        scope.$on("window:htmlContent", function (e, elem, attr) {
                            new Content(elem, 'html');
                        });
                        break;
                }
            },
            //Постройка контента окна для типа image
            _windowImageLoaded: function (e, image) {
                //текущая картинка
                this.currContent = image;
                scope.winpopup.content = image;
                if (config.resize) {
                    if (image.ratio < 1) {
                        if (image.width <= config.minSizes.width) {
                            scope.winpopup.wrap.width = config.minSizes.width;
                        } else {
                            scope.winpopup.wrap.width = image.width;
                        }
                    } else {
                        scope.winpopup.wrap.width = image.width;
                    }
                } else {
                    scope.winpopup.wrap.width = config.maxSizes.width;
                }
                //Пагинация
                this.afterLoad(image);
            },
            //Остальной контент
            _windowContentLoaded: function (e, content) {
                this.currContent = content;
                scope.winpopup.content = content;
                this.afterLoad(content);
            },
            //после подгрузки и распихания переменных
            afterLoad: function (object) {
                var nav;
                if (this.group) {
                    if (this.index === 0) {//Первый
                        if (this.setElements[this.group].length === 1) {
                            nav = {next: false, prev: false};
                        } else {
                            nav = {next: true, prev: false};
                        }
                    } else if (this.index === (this.setElements[this.group].length - 1)) {//последний
                        nav = {next: false, prev: true};
                    } else {
                        nav = {next: true, prev: true};
                    }
                    scope.winpopup.navigation = nav;
                }
                if (config.userControl) {//Пользовательское управление
                    this._trigger("window:userControll", object, windowSectors, response);
                } else {
                    scope.winpopup.inner.show = true;
                    this._updateUrl();
                }
                this._windowResize();
                this.updateScope();

                $timeout(function () {
                    windowSectors.wrap.el.removeClass("win-close").addClass("win-show");
                }, 50);
                this.body.style.overflow = "hidden";
                this._trigger("window:afterContentLoaded", this.currContent, windowSectors, response);
            },
            bind: function (event, handler) {
                var name = event + ":" + this.timestamp;
                scope.$on(name, handler.bind(this));
            },
            _trigger: function (event) {
                arguments[0] = event + ":" + this.timestamp;
                scope.$broadcast.apply(scope, arguments);
            },
            getWrapWidth: function () {
                var wrap = sizes.pageWidth - config.outPadding * 2;
                //Получаем новые размеры изображения
                if (wrap < config.minSizes.width) {
                    wrap = config.minSizes.width;
                } else {
                    if (wrap > config.maxSizes.width) {
                        wrap = config.maxSizes.width;
                    }
                }
                return wrap;
            },
            //Пересчет размеров окна
            _windowResize: function () {
                sizes = this.getTrueWindowSize();
                var newWinWidth = sizes.pageWidth, newWinHeight = sizes.viewHeight, newSizes = null, wrap = null;
                scope.winpopup.inner.width = newWinWidth;
                scope.winpopup.inner.height = newWinHeight;

                if (config.resize) {
                    //Размер всплывающего окна
                    wrap = this.getWrapWidth();
                    scope.winpopup.wrap.width = wrap;

                    //Размер изображения внутри окна
                    if (!this.currContent.param.noResize) {
                        newSizes = this.getNewSize(this.currContent);
                        if (this.currContent.ratio < 1) {
                            if (newSizes[0] <= config.minSizes.width) {
                                scope.winpopup.wrap.width = config.minSizes.width;
                            } else {
                                scope.winpopup.wrap.width = newSizes[0];
                            }
                        } else {
                            scope.winpopup.wrap.width = newSizes[0];
                        }

                        scope.winpopup.content.width = scope.winpopup.content.el.width = newSizes[0];
                        scope.winpopup.content.height = scope.winpopup.content.el.height = newSizes[1];
                    }
                }
                this.updateScope();
            },
            _updateUrl: function () {
                if (this.pushState && this.currContent.win_id) {
                    var searchString = $location.search();
                    searchString['win_id'] = this.currContent.win_id;
                    $location.search(searchString);
                    //Сохранение конфига вызова элемента
                    $winStorage.set(this.currContent);
                }
            },
            updateScope: function () {
                this.root.$$phase || this.root.$digest();
            },
            //Размеры окна
            getTrueWindowSize: function () {
                var xScroll, yScroll, pageWidth, pageHeight, windowWidth, windowHeight, d = $document[0], w = $window;
                //ширина и высота с учетом скролла
                xScroll = d.body.scrollWidth;
                yScroll = d.body.scrollHeight;
                windowWidth = w.innerWidth;
                windowHeight = w.innerHeight;
                if (yScroll < windowHeight) {
                    pageHeight = windowHeight;
                } else {
                    pageHeight = yScroll;
                }
                if (xScroll < windowWidth) {
                    pageWidth = windowWidth;
                } else {
                    pageWidth = xScroll;
                }
                return {
                    'pageWidth': pageWidth,
                    'pageHeight': pageHeight,
                    'viewWidth': windowWidth,
                    'viewHeight': windowHeight,
                    'pageWidthScroll': xScroll,
                    'pageHeightScroll': yScroll
                };
            },
            getNewSize: function (item, fullsize) {
                var wrapWidth = this.currWrapWidth || scope.winpopup.wrap.width, winHeight = sizes.viewHeight, result = {};
                if (fullsize) {
                    wrapWidth = sizes.pageWidth;
                }
                //Желаемые размеры картинки
                var desiredWidth = wrapWidth, desiredHeight = winHeight - (config.margin * 2 + config.padding * 2);

                if (item.ratio < 1) {
                    desiredHeight -= config.outPadding;
                }
                //Проверка на минимальную высоту
                if (desiredHeight < config.minSizes.height) {
                    desiredHeight = config.minSizes.height;
                }
                if ((item.oric_width / desiredWidth) > (item.oric_height / desiredHeight)) {
                    result[0] = desiredWidth;
                    result[1] = Math.round(item.oric_height * desiredWidth / item.oric_width);
                } else {
                    result[0] = Math.round(item.oric_width * desiredHeight / item.oric_height);
                    result[1] = desiredHeight;
                }
                return result;
            },
            toParam: function (data) {
                if (data) {
                    var string = '';
                    angular.forEach(data, function (val, key) {
                        string += key + '=' + val + '&';
                    });
                    string = string.substr(0, string.length - 1);
                    return string;
                }
            },
            /*
             * Закрывает текущее окно
             */
            closeWindow: function () {
                $W.off('resize');
                elemAttr = {};
                scope.winpopup.inner.show = false;
                this.currWrapWidth = null;
                this._defaultWindow();
                windowSectors.wrap.el.removeClass("win-show").addClass("win-close");
                this.updateScope();
                this.body.style.overflow = "auto";
                if (this.pushState) {
                    var searchString = $location.search();
                    delete searchString['win_id'];
                    $location.search(searchString);
                }
            },
            /*
             * Получить следующий элемент в наборе
             * @param {Object} - объект с параметрами, которые будут прицеплены к запросу,
             *  если в качесве параметра будет передана ф-я, то она будет использована вместо
             *  стандартной ф-и пагинации
             */
            getNext: function (param) {
                if (angular.isFunction(param)) {
                    param(windowSectors);
                } else {
                    var next = this.setElements[this.group][this.index + 1];
                    scope.$emit("window:navigate", next.el, 'next', param || {});
                }
            },
            /*
             * Получить предыдущий элемент в наборе
             * @param {Object} - объект с параметрами, которые будут прицеплены к запросу
             * если в качесве параметра будет передана ф-я, то она будет использована вместо
             *  стандартной ф-и пагинации
             */
            getPrev: function (param) {
                if (angular.isFunction(param)) {
                    param(windowSectors);
                } else {
                    var prev = this.setElements[this.group][this.index - 1];
                    scope.$emit("window:navigate", prev.el, 'prev', param || {});
                }
            },
            //Полноэкранный режим
            fullScreen: function () {
                //Размер картинки для полноэкранного режима
                var newSizes = this.getNewSize(this.currContent, 1);
                config.maxSizes = {
                    width: newSizes[0],
                    height: newSizes[1]
                };
                scope.winpopup.fullscreen = true;
                $fullScreen.openFullScreen(windowSectors.fullscreen.el[0]);
            },
            //Отмена полноэкранного режима
            cancelFullScreen: function () {
                var elem = this.currContent;
                config.maxSizes = elem.openConfig.maxSizes;
                scope.winpopup.fullscreen = false;
                $fullScreen.cancelFullScreen();
            },
            data: {
            }
        };
        //Конструктор для изображения
        var Img = function (elem) {
            angular.extend(this, {
                unicid: elem[0].getAttribute("unicid") || getUnicId(),
                win_id: elem[0].id,
                openConfig: angular.extend({}, config)
            });
            //Смотри что за элемент
            var tagName = elem[0].tagName, link;
            switch (tagName) {
                case 'A'://если ссылка то берем href
                    link = elem[0].href;
                    break;
                case 'IMG'://Если картинка то src
                    link = elem[0].src;
                    break;
            }
            //Создает объект для изображения
            if (link) {
                this.createImageObject(link);
            } else {
                throw ("Вы не передали ссылку на картинку!");
            }
        };
        Img.prototype.createImageObject = function (link) {
            var newSizes, img;
            img = new Image();
            img.onload = function () {
                angular.extend(this, {
                    oric_height: img.height,
                    oric_width: img.width,
                    src: link,
                    el: img,
                    param: elemAttr
                });
                this.ratio = this.oric_width / this.oric_height;
                newSizes = win.getNewSize(this);
                this.width = this.el.width = newSizes[0];
                this.height = this.el.height = newSizes[1];
                //Сообщаем что картинка подгружена
                scope.$broadcast("window:imageLoaded", this);
                img = null;
            }.bind(this);
            img.onerror = function () {
                throw ("Такого изображения не существует!");
            };
            img.src = link;
        };
        //Объект контента для окна
        var Content = function (elem, type, result) {
            angular.extend(this, {
                unicid: elem[0].getAttribute("unicid") || getUnicId(),
                win_id: elem[0].id,
                openConfig: angular.extend({}, config),
                param: {}
            });
            switch (type) {
                case 'image':
                    var link = result.src;
                    angular.extend(this.param, elemAttr, result);
                    this.getImage(link, function (img) {
                        scope.$broadcast("window:imageLoaded", this);
                    }.bind(this));
                    break;
                case 'json':
                    this.param.noResize = true;
                    angular.extend(this.param, elemAttr, result);
                    scope.$broadcast("window:contentLoaded", this);
                    break;
                case 'html':
                    this.param.noResize = true;
                    angular.extend(this.param, elemAttr);
                    scope.$broadcast("window:contentLoaded", this);
                    break;
            }
            ;
        };
        Content.prototype.getImage = function (link, callback) {
            var img = new Image(), newSizes;
            img.onload = function () {
                angular.extend(this, {
                    oric_height: img.height,
                    oric_width: img.width,
                    src: link,
                    el: img
                });
                this.ratio = this.oric_width / this.oric_height;
                newSizes = win.getNewSize(this);
                this.width = this.el.width = newSizes[0];
                this.height = this.el.height = newSizes[1];
                callback(this);
                img = null;
            }.bind(this);
            img.onerror = function () {
                throw ("Картинки с таким адресом не существует!");
            };
            img.src = link;
        };
        var getUnicId = function () {
            return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        };

        return {
            init: function (settings) {
                return Window(settings);
            },
            unicid: getUnicId
        }
    }])
;