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
popup.value("errorsString", {
    noimage: "Битый адрес картинки"
});
popup.value("windowSectors", {
    inner: {el: null, loaded: false},
    wrap: {el: null, loaded: false},
    header: {el: null, loaded: false},
    content: {el: null, loaded: false},
    footer: {el: null, loaded: false}
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
                windowSectors.header = {el: elem, loaded: true};
                break;
            case 'content':
                windowSectors.content = {el: elem, loaded: true};
                break;
            case 'footer':
                windowSectors.footer = {el: elem, loaded: true};
                break;
            case 'wrap':
                windowSectors.wrap = {el: elem, loaded: true};
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
        template: '<div id="window-wrap" ng-show="inner.show">' +
            '<div id="wrap-inner" ng-style="{width:inner.width + \'px\', height:inner.height + \'px\', padding:inner.padding}">' +
            '<div id="wrap-block" data-window-section="wrap" ng-style="{width:wrap.width + \'px\', padding:wrap.padding + \'px\'}">' +
            '</div>' +
            '</div>' +
            '</div>',
        link: function (scope, elem, attr) {
            var stop = scope.$watch('loadWindowTemp', function (value) {
                windowSectors.inner = {
                    el: elem,
                    loaded: true
                };
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

popup.factory("$popupWindow", [
    "$rootScope",
    "$window",
    "$document",
    "$interval",
    "$http",
    "$compile",
    "errorsString",
    "windowSectors",
    "$timeout",
    "$location",
    "$winStorage",
    "$rootElement",
    "templateCache",
    function ($rootScope, $window, $document, $interval, $http, $compile, errorsString, windowSectors, $timeout, $location, $winStorage, $rootElement, templateCache) {
        var win, scope, sizes, elemAttr, def, config, $W = angular.element($window);

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

            angular.extend(this.config, def, settings);
            config = this.config;

            scope.$on("window:navigate", this._windowPagination.bind(this));//листалка
            scope.$on("window:imageLoaded", this._windowImageLoaded.bind(this));//После разбора и создания объекта отображения, который включает в себя изображение
            scope.$on("window:htmlLoaded", this._windowHtmlLoaded.bind(this));//После создания объекта отображения, который представляет из себя просто кусок html-кода

            scope.windowStart = this;
            scope.loadWindowTemp = this;

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
        };

        Window.prototype = {
            //Открывает окно
            open: function (settings) {
                //Ресайз окна
                $W.on('resize', function () {
                    this.currWrapWidth = null;
                    this._windowResize();
                }.bind(this));

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
            _defaultWindow: function () {
                sizes = this.sizes = this.getTrueWindowSize();
                var inner = {
                    padding: config.margin + 'px 0 ' + config.margin + 'px 0',
                    width: sizes.pageWidth,
                    height: sizes.viewHeight
                };
                //Размер внешнего блока
                var wrap = {
                    padding: config.padding,
                    width: this.getWrapWidth()
                };

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

                var header = {};
                var content = {
                    img: {},
                    param: {}
                };
                var navigation = {
                    prev: {
                        show: false
                    },
                    next: {
                        show: false
                    },
                    preloader: false
                }
                var footer = {};

                scope.wrap = wrap;
                scope.inner = inner;
                scope.navigation = navigation;
                scope.header = header;
                scope.content = content;
                scope.footer = footer;
            },
            _windowPagination: function (e, elem, act, param) {
                switch (act) {
                    case 'next':
                        this.index = this.index + 1;
                        break;
                    case 'prev':
                        this.index = this.index - 1;
                        break;
                }

                this.el = elem;
                this.unicid = this.el[0].getAttribute('unicid');
                this.win_id = this.el[0].id;
                //Вычисляем реальные размеры для окна. но не применяем их дабы не было эффекта дергания
                this.currWrapWidth = this.getWrapWidth();
                //Показываем прелодер при пагинации
                scope.navigation.preloader = true;
                windowSectors.wrap.el.removeClass("win-show").addClass("win-close");
                this._trigger("window:beforePagination", elem, windowSectors);
                //Новая картинка
                $timeout(function () {
                    this._loadContent();
                }.bind(this), 600);
            },
            _loadContent: function () {
                this._trigger("window:beforeContentLoaded", windowSectors);
                elemAttr = config.dataRequest || {};
                switch (config.winType) {
                    case 'image':
                        this.currContent = new Item();
                        break;
                    case 'ajax'://подгрузка контента через ajax
                        config.ajax.data = config.dataRequest;
                        config.ajax.transformRequest = function (data) {
                            return this.toParam(data);
                        }.bind(this);
                        $http(config.ajax).success(function (data, status) {
                                if (data instanceof Object) {//если вернули json
                                    this.currContent = new Item(data, 'json');
                                } else {
                                    //Пользовательская обработка
                                    if (config.userControl) {
                                        var item = new Item(data, 'giglet');
                                        this.currContent = item;
                                        this._trigger("window:userHtmlLoaded", item, windowSectors);
                                    } else {
                                        var content = windowSectors.content.el;
                                        content.html(data);
                                        $compile(content.contents())(scope);
                                    }
                                }
                            }.bind(this)).error(function (data, status) {
                            throw ("При попытке получения данных произошел сбой!");
                        });
                        //картинка, которая была внутри полученного контента загружена
                        scope.$on("window:imageContent", function (e, img, attr) {
                            this.currContent = new Item(img, 'image');
                        }.bind(this));
                        //просто html контент загружен
                        scope.$on("window:htmlContent", function (e, elem, attr) {
                            this.currContent = new Item(elem, 'html');
                        });
                        break;
                }
            },
            _windowImageLoaded: function (e, item) {
                this.currContent = item;
                //убираем прелодер
                scope.navigation.preloader = false;
                if (!item.img.error) {
                    var param = item.param;
                    scope.winError = false;
                    this.queue.push(item);
                    //данные по картинке
                    angular.extend(scope.content.img, item.img);
                    //доп данные для центральной части
                    angular.extend(scope.content, param.content);
                    //Даные для шапки
                    angular.extend(scope.header, param.header);
                    //Для подвала
                    angular.extend(scope.footer, param.footer);
                    //Все параметры
                    angular.extend(scope.content.param, param);
                    if (item.img.ratio < 1) {
                        if (item.img.width <= config.minSizes.width) {
                            scope.wrap.width = config.minSizes.width;
                        } else {
                            scope.wrap.width = item.img.width;
                        }
                    } else {
                        scope.wrap.width = item.img.width;
                    }
                    //навигация
                    if (this.group) {
                        if (this.index === 0) {//Первый
                            if (this.setElements[this.group].length === 1) {
                                scope.navigation.next.show = false;
                                scope.navigation.prev.show = false;
                            } else {
                                scope.navigation.next.show = true;
                                scope.navigation.prev.show = false;
                            }
                        } else if (this.index === (this.setElements[this.group].length - 1)) {//последний
                            scope.navigation.next.show = false;
                            scope.navigation.prev.show = true;
                        } else {
                            scope.navigation.next.show = true;
                            scope.navigation.prev.show = true;
                        }
                    }
                    //После загрузки фотки
                    if (config.userControl) {
                        this._trigger("window:userImageLoaded", item, windowSectors);
                    } else {
                        scope.inner.show = true;
                    }
                    this._updateUrl();
                } else {
                    scope.winError = errorsString.noimage;
                    scope.inner.show = true;
                }
                this._windowResize();
                this.updateScope();
                $timeout(function () {
                    windowSectors.wrap.el.removeClass("win-close");
                    windowSectors.wrap.el.addClass("win-show");
                }, 50);
                this.body.style.overflow = "hidden";
                this._trigger("window:afterContentLoaded", this.currContent, windowSectors);
            },
            _windowHtmlLoaded: function (e, item) {
                this.queue.push(item);
                //убираем прелодер
                scope.navigation.preloader = false;
                //доп данные
                angular.extend(scope.content, item.param);
                this.currContent = item;
                scope.inner.show = true;
                this._windowResize();
                this.updateScope();
                $timeout(function () {
                    windowSectors.wrap.el.removeClass("win-close");
                    windowSectors.wrap.el.addClass("win-show");
                }, 50);
                this.body.style.overflow = "hidden";
                this._trigger("window:afterContentLoaded", this.currContent, windowSectors);
                this._updateUrl();
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
                sizes = this.getTrueWindowSize(), newWinWidth = sizes.pageWidth, newWinHeight = sizes.viewHeight, newSizes = null, wrap = null;
                scope.inner.width = newWinWidth;
                scope.inner.height = newWinHeight;
                if (config.resize) {
                    //Размер всплывающего окна
                    wrap = this.getWrapWidth();
                    scope.wrap.width = wrap;

                    //Размер изображения внутри окна
                    if (!this.currContent.param.noResize) {
                        newSizes = this.getNewSize(this.currContent);
                        if (this.currContent.img.ratio < 1) {
                            if (newSizes[0] <= config.minSizes.width) {
                                scope.wrap.width = config.minSizes.width;
                            } else {
                                scope.wrap.width = newSizes[0];
                            }
                        } else {
                            scope.wrap.width = newSizes[0];
                        }
                        scope.content.img.width = scope.content.img.el.width = newSizes[0];
                        scope.content.img.height = scope.content.img.el.height = newSizes[1];
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
                } else if (d.body.scrollHeight > d.body.offsetHeight) {
                    xScroll = d.body.scrollWidth;
                    yScroll = d.body.scrollHeight;
                } else if (doc && doc.scrollHeight > doc.offsetHeight) {
                    xScroll = doc.scrollWidth;
                    yScroll = doc.scrollHeight;
                } else {
                    xScroll = d.body.offsetWidth;
                    yScroll = d.body.offsetHeight;
                }

                if (self.innerHeight) {
                    windowWidth = self.innerWidth;
                    windowHeight = self.innerHeight;
                } else if (doc && doc.clientHeight) {
                    windowWidth = doc.clientWidth;
                    windowHeight = doc.clientHeight;
                } else if (d.body) {
                    windowWidth = d.body.clientWidth;
                    windowHeight = d.body.clientHeight;
                }

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

                return sizes = {
                    'pageWidth': pageWidth,
                    'pageHeight': pageHeight,
                    'viewWidth': windowWidth,
                    'viewHeight': windowHeight,
                    'pageWidthScroll': xScroll,
                    'pageHeightScroll': yScroll
                };
            },
            getNewSize: function (item) {
                var wrapWidth = this.currWrapWidth || scope.wrap.width, winHeight = sizes.viewHeight, result = {};
                //Желаемые размеры картинки
                var desiredWidth = wrapWidth, desiredHeight = winHeight - (config.margin * 2 + config.padding * 2);

                if (item.img.ratio < 1) {
                    desiredHeight -= config.outPadding;
                }
                //Проверка на минимальную высоту
                if (desiredHeight < config.minSizes.height) {
                    desiredHeight = config.minSizes.height;
                }
                if ((item.img.oric_width / desiredWidth) > (item.img.oric_height / desiredHeight)) {
                    result[0] = desiredWidth;
                    result[1] = Math.round(item.img.oric_height * desiredWidth / item.img.oric_width);
                } else {
                    result[0] = Math.round(item.img.oric_width * desiredHeight / item.img.oric_height);
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
                scope.inner.show = false;
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
            data: {
            }
        };

        var Item = function (obj, type) {
            this.unicid = win.el[0].getAttribute("unicid") || getUnicId();
            this.win_id = win.win_id;
            this.openConfig = config;

            switch (config.winType) {
                case 'image':
                    this.img = {};
                    var link = win.el[0].href;
                    if (!link) {
                        throw ("Вы не заполнили атребут href у источника!");
                    } else {
                        this.createImage(link);
                    }
                    break;
                case 'ajax':
                    switch (type) {
                        case 'image':
                            this.img = {};
                            var link = obj[0].src;
                            if (!link) {
                                throw ("Вы не заполнили атребут src у источника!");
                            } else {
                                this.createImage(link);
                            }
                            break;
                        case 'html'://Это обычный html контент не предпологает элементов с изменяемыми размерами
                            this.createHtml(obj);
                            break;
                        case 'json'://контент из json строки
                            if (obj.params) {
                                angular.extend(elemAttr, obj.params);
                            }
                            //проверка передана ли картинка
                            if (obj.src) {
                                this.img = {};
                                this.createImage(obj.src);
                            }
                            break;
                        case 'giglet':
                            return this.createGiglet(obj);
                            break;
                    }
                    break;
            }
        };

        Item.prototype = {
            imageRendering: function (img, link) {
                this.img.oric_width = img.width;
                this.img.oric_height = img.height;
                this.img.src = link;
                this.img.el = img;
                this.img.ratio = this.img.oric_width / this.img.oric_height;
                var newSizes = win.getNewSize(this);
                this.img.width = this.img.el.width = newSizes[0];
                this.img.height = this.img.el.height = newSizes[1];
                this.param = {};
                angular.extend(this.param, elemAttr);
            },
            createImage: function (link) {
                if (win.loadImages[link]) {
                    this.imageRendering(win.loadImages[link], link);
                    scope.$broadcast("window:imageLoaded", this);
                } else {
                    var img = new Image();
                    img.onload = function () {
                        this.imageRendering(img, link);
                        scope.$broadcast("window:imageLoaded", this);
                        win.loadImages[link] = img;
                        img = 0;
                    }.bind(this);
                    img.onerror = function () {
                        this.img.error = true;
                        this.img.el = img;
                        scope.$broadcast("window:imageLoaded", this);
                        img = 0;
                    }.bind(this);
                    img.src = link;
                }
            },
            createHtml: function (obj) {
                this.param = {};
                this.el = obj;
                elemAttr.noResize = true;
                angular.extend(this.param, elemAttr);
                scope.$broadcast("window:htmlLoaded", this);
            },
            createGiglet: function (obj) {
                this.param = {};
                this.el = obj;
                elemAttr.noResize = true;
                angular.extend(this.param, elemAttr);
            }
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