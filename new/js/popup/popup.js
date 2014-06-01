/**
* Created by netBeans.
* Name: popupWindow
* User: Abaddon
* Date: 29.04.14
* Time: 17:15
* Description: Open popup window
*/
var win = angular.module('popupWindow', []);
//Кэш для шаблонов
win.factory("$tplCache", ["$cacheFactory", function ($cacheFactory) {
    return $cacheFactory("tplCache");
} ]);
//Сектора окна
win.value("$sectors", {});
//Группы
win.value("$groups", {});
//Разбивает шаблон по секторам
win.directive("ngSectors", ['$sectors', function ($sectors) {
    return function (scopem, elem, attr) {
        $sectors[attr.ngSectors] = elem;
    };
} ]);
//Формирует набор картинок по группам
win.directive("ngGroup", ["$groups", "$popupWindow", function ($groups, $popupWindow) {
    return function (scope, elem, attr) {
        var group = attr.ngGroup, unic = $popupWindow.unicid();
        elem[0].setAttribute('unicid', unic);
        if ($groups[group]) {
            $groups[group].push({ unicid: unic, target: elem });
        } else {
            $groups[group] = [];
            $groups[group].push({ unicid: unic, target: elem });
        }
    };
} ]);
//Формирует блон окна
win.directive("ngPopupWin", ['$popupWindow', '$rootScope', function ($popupWindow, $rootScope) {
    return {
        scope: {
            options: "=?",
            win: "=?",
            ngClick: "="
        },
        replace: false,
        //Обертка для окна
        template: '<div id="window-wrap" ng-show="show"></div><div ng-show="show" id="wrap-inner" ng-style="{width:inner.width + \'px\', height:inner.height + \'px\', padding:inner.padding}">' +
            '<div id="wrap-block" ng-sectors="wrap" ng-style="{width: content.width + \'px\', padding: content.padding + \'px\'}">' +
            '</div>' +
            '</div>',
        link: function (scope, elem, attr) {
            //Создаем объект окна
            if (scope.options) {
                scope.options.sc = scope;
            } else {
                scope.options = { sc: scope };
            }
            var win = $popupWindow.create(scope.options);
            //Закрытие окна
            scope.close = function () {
                win.close();
            };
            //Пагинация
            scope.prev = function () {
                win.prev();
            };
            scope.next = function () {
                win.next();
            };
        }
    };
} ]);
/*
* Сохранение конфига вызова окна в localStorage
*/
win.factory("$storage", [function () {
    //Сохраняет объект в хранилище
    var setItem = function (item) {
        var config = JSON.stringify(item, function (key, value) {
            switch (key) {
                case 'target':
                case 'scope':
                    return undefined;
                    break;
                case 'beforeContentLoaded':
                case 'beforePagination':
                case 'afterContentLoaded':
                    return value.toString();
                    break;
            }
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
} ]);
//Конструктор вызова
win.factory("$popupWindow", [
    '$rootScope',
    '$timeout',
    '$tplCache',
    '$sectors',
    '$document',
    '$window',
    '$http',
    '$compile',
    '$storage',
    '$location',
    '$groups',
    function ($rootScope, $timeout, $tplCache, $sectors, $document, $window, $http, $compile, $storage, $location, $groups) {
        "use strict";
        var config, thatWin, scope,
        //Дефолт для окна
            winConfig = {
                pushState: false,
                target: null,
                resize: true,
                margin: 10,
                effect: 1,
                source: null,
                scope: null,
                type: 'image',
                href: null,
                imageClass: 'resize',
                win_id: null,
                innerTpl: 'tpl/defInnerTpl.html',
                fullScreenTpl: 'tpl/defFullScreenTpl.html',
                outPadding: 100,
                padding: 10,
                resizeDelay: 100,
                requestParam: {},
                ajax: {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8' }
                },
                maxSizes: {
                    width: 1024,
                    height: 768
                },
                minSizes: {
                    width: 640,
                    height: 480
                }
            };
        //Конструктор модуля
        var WinModule = function (options) {
            if (!(this instanceof WinModule)) {
                return new WinModule(options);
            }
            //конфигурация модуля    
            config = this.config = {
                locScope: null,
                root: $rootScope,
                windows: [],
                currWindow: null,
                timestamp: Date.now(),
                timerDelay: 0
            };
            //Мержим
            angular.extend(config, options);
            scope = this.config.sc;
            //Открытие окна
            this.open = function (options) {
                //Создание объекта окна
                var win = new Window(options);
                //Подгрузка шаблона рабочей области
                this._loadTpl.call(win, 'innerTpl', function () {
                    //Шаблон подгружен, теперь дело за контентом
                    this._getContent(win);
                } .bind(this));
            };
            var searchString = $location.search();
            //Закрытие окна
            this.close = function () {
                scope.show = false;
                if (searchString['win_id']) {
                    delete searchString['win_id'];
                    $location.search(searchString);
                }
                angular.element($document[0].body).css('overflow', 'auto');
                $sectors.wrap.removeClass("win-show").addClass("win-close");
            };
            //Назад
            this.prev = function () {
                this.currWindow._navigate('prev');
            };
            //Вперед
            this.next = function () {
                this.currWindow._navigate('next');
            },
            //Событие на ресайз
            angular.element($window).on("resize", function () {
                if (this.currWindow) {
                    this.delay(function () {
                        this._resizeWindow();
                    } .bind(this));
                }
            } .bind(this));
            config.locScope.win = this;
            thatWin = this;

            //Востановление окна приперезагрузке
            if (searchString['win_id']) {
                var config = $storage.get(searchString['win_id']);
                if (!config.href) {
                    //Дожидаемся, когда будет найден элемент с id из конфига
                    var timer = function () {
                        $timeout(function () {
                            config.target = $document[0].querySelector("#" + searchString['win_id']);
                            if (config.target) {
                                this.open(config);
                            } else {
                                timer.call(this);
                            }
                        } .bind(this), 100);
                    }
                    timer.call(this);
                }
            }

            //Ожидает сигнала о готовности контента
            scope.$on("content:ready", function (e, result, win) {
                //Записываем данные в scope
                this.currWindow = win;
                if (angular.isObject(result)) {
                    scope.param = {};
                    angular.extend(scope.param, win.requestParam, result);
                } else {
                    scope.param = win.requestParam;
                }
                scope.show = true;
                //открытие окна
                $timeout(function () {
                    $sectors.wrap.removeClass("win-close").addClass("win-show");
                    angular.element($document[0].body).css('overflow', 'hidden');
                    //Навигация
                    if (win.group) {
                        var count = $groups[win.group].length;
                        scope.count = count; //кол-во фоток с одинаковой группой
                        scope.index = win.index + 1;
                        if (count === 1) {
                            scope.nav = { prev: false, next: false };
                        } else if (win.index === 0) {
                            scope.nav = { prev: false, next: true };
                        } else if (win.index === count - 1) {
                            scope.nav = { prev: true, next: false };
                        } else {
                            scope.nav = { prev: true, next: true };
                        }
                    } else {
                        scope.nav = { prev: false, next: false };
                    }
                    this.callEvent("afterContentLoaded", win, $sectors);
                } .bind(this), 100);
                this._updateUrl(win);
                this.updateScope();
            } .bind(this));
        };

        WinModule.prototype = {
            delay: function (after) {
                $timeout.cancel(this.timerDelay);
                this.timerDelay = $timeout(function () {
                    after();
                }, this.currWindow.resizeDelay);
            },
            //Пересчет размеров окна
            _resizeWindow: function () {
                var newSize = this._winSize.call(this.currWindow), elem = this.currWindow.content;
                //Изменение размеров окна
                scope.inner.width = newSize.pageWidth;
                scope.inner.height = newSize.viewHeight;
                if (this.currWindow.resize) {
                    scope.content.width = newSize.wrap;
                    //Пересчет размера картинки
                    if (this.currWindow.imgResize) {
                        var imageSize = this.currWindow._getImageSize(elem);
                        scope.param.width = imageSize[0];
                        scope.param.height = imageSize[1];
                    }
                }
                this.updateScope();
            },
            //Подгружает шаблон
            _loadTpl: function (name, after) {
                var mark = $sectors.wrap[0].querySelector("[mark=" + this[name + 'Mark'] + "]"), //Поиск блока в html
                    tpl = $tplCache.get(this[name + 'Mark']); //Поиск в хранилище

                if (!mark && !tpl) {//Если везде пусто
                    $http.post(this[name]).success(function (template) {
                        $sectors.wrap.html(template);
                        var content = $sectors.wrap.contents();
                        content[0].setAttribute('mark', this[name + 'Mark']);
                        $compile(content)(thatWin.config.sc);
                        //Сохраняем шаблон в кэш
                        $tplCache.put(this[name + 'Mark'], template);
                        after();
                    } .bind(this));
                } else if (!mark && tpl) {//Если нет в html, но есть в хранилище
                    $sectors.wrap.html(tpl);
                    var content = $sectors.wrap.contents();
                    $compile(content)(thatWin.config.sc);
                    after();
                } else {
                    after();
                }
            },
            _getContent: function (win) {
                var tag = win.target ? win.target[0].tagName : 'noelem', link;
                //Тип подгрузки
                switch (tag) {
                    case "IMG":
                        link = win.target.attr('src');
                        break;
                    case "A":
                        link = win.target.attr('href');
                        break;
                    case "noelem":
                        link = win.href;
                        break;
                    default: //Если в качестве элемента выступает другой элемент то ссылка на картинку ищется в аттрибуте переданном через source
                        link = win.target[0].getAttribute(win.source);
                };

                link = link || win.href;
                if (link) {
                    switch (win.type) {
                        case 'image': //Просто подгружает картинку 
                            win._getImage(link, function (result) {
                                //Говорим что картинка подгружена и готова к вставке
                                scope.$broadcast('content:ready', result, win);
                            });
                            break;
                        case 'ajax': //Запросы через ajax возвращаться может все что угодно
                            win._getAjax(link);
                            break;
                        case 'inline': //просто подгрузить контен по ссылке (только кусок html)
                            win._getInline(link);
                            break;
                    }
                    //Записываем конфиг вызова в хранилище
                    if (win.pushState) {
                        $storage.set(win);
                    }
                } else {
                    throw ("Не получилось отыскать ссылку на запрашиваемый контент!");
                }
            },
            _updateUrl: function () {
                if (this.currWindow['pushState']) {
                    var searchString = $location.search();
                    searchString['win_id'] = this.currWindow['win_id'];
                    $location.search(searchString);
                }
            },
            //Размеры окна
            _winSize: function () {
                var w = $window, pageWidth = w.innerWidth, viewHeight = w.innerHeight, wrap;
                //Ширина области контента с учетов боковых отступов
                wrap = pageWidth - 2 * this.outPadding;
                if (this.resize) {
                    if (wrap < this.minSizes.width) {
                        wrap = this.minSizes.width;
                    } else if (wrap > this.maxSizes.width) {
                        wrap = this.maxSizes.width;
                    }
                } else {
                    wrap = this.maxSizes.width;
                }
                return {
                    'pageWidth': pageWidth,
                    'viewHeight': viewHeight,
                    'wrap': wrap
                };
            },
            //Запуск грязной проверки 
            updateScope: function () {
                this.config.root.$$phase || this.config.root.$digest();
            },
            callEvent: function () {
                var name = arguments[0], win = this.currWindow;
                if (typeof win[name] === "string") {
                    new Function('call = ' + win[name] + '; return call.apply(win, arguments);').apply(win, arguments);
                } else {
                    win[name].apply(win, arguments);
                }
            }
        };
        //Конструктор окна
        var Window = function (options) {
            //настроики с которыми было вызвано окно
            this.callOptions = options;
            //Конфиг вызова
            angular.extend(this, winConfig, options);
            //Обертка jQuery lite
            if (this.target) {
                this.target = this.target[0] ? this.target : angular.element(this.target);
                this._getCurrUnicID();
            } else {//если элемент не передан
                this.noelem = true;
            }
            //Метод ajax запроса
            this.ajax.method = this.ajax.method.toUpperCase();
            //Метка времени
            this.timestamp = Date.now();
            //Если pushState true, то пятаемся взять аттрибут id для маркировки окна
            if (this.pushState) {
                this.win_id = this.win_id || this.target[0].id;
                if (!this.win_id) this.pushState = false;
            }
            //Формирование подписей для шаблонов        
            this.innerTplMark = this.innerTpl.replace(/[\/,\.]/g, '__');
            this.fullScreenTplMark = this.fullScreenTpl.replace(/[\/,\.]/g, '__');
            //Заполнение переменных окна первоночальными данными
            this._defWinScopeVariable();
            return this;
        };
        Window.prototype = {
            _navigate: function (phase) {
                var index;
                switch (phase) {
                    case 'prev':
                        index = this.index - 1;
                        break;
                    case 'next':
                        index = this.index + 1;
                        break;
                };
                var elem = $groups[this.group][index];
                if (elem) {
                    this.callOptions.target = elem.target;
                    $sectors.wrap.removeClass("win-show").addClass("win-close");
                    $timeout(function () {
                        thatWin.open(this.callOptions);
                    } .bind(this), 600);
                } else {
                    if (phase === "prev") {
                        scope.nav.prev = false;
                    } else {
                        scope.nav.next = false;
                    }
                }
            },
            _getCurrUnicID: function () {
                var unicid = this.unicid = this.target[0].getAttribute('unicid');
                if (unicid) {
                    this.group = this.target[0].getAttribute('ng-group');
                    angular.forEach($groups[this.group], function (v, k) {
                        if (v.unicid === unicid) {
                            this.index = k;
                        }
                    } .bind(this));
                }
            },
            _getAjax: function (link) {
                var win = this, toParam = function (obj) {
                    var requestStr = '';
                    if (angular.isObject(obj)) {
                        angular.forEach(obj, function (v, k) {
                            if (angular.isObject(v)) {
                                requestStr += toParam(obj[k]);
                            } else {
                                requestStr += k + '=' + v + '&';
                            }
                        });
                        return requestStr.substr(0, requestStr.length - 1);
                    } else {
                        throw ("Дополнительные параметры должны передаваться в виде объекта!");
                    }
                };
                switch (win.ajax.method.toUpperCase()) {
                    case 'POST':
                        win.ajax.data = win.requestParam;
                        win.ajax.transformRequest = function (data) {
                            return toParam(data);
                        } .bind(this);
                        break;
                    case 'GET':
                        win.ajax.params = win.requestParam
                        break;
                    default:
                        throw ('Ваш метод отправки не поддерживается!');
                };
                win.ajax.url = link;
                var ajaxConfig = {};
                angular.extend(ajaxConfig, winConfig.ajax, win.ajax);
                $http(ajaxConfig).success(function (data) {
                    if (angular.isObject(data)) {//json
                        //Проверяем есть ли картинка
                        if (data.src) {
                            win._getImage(data.src, function (result) {
                                angular.extend(data, result);
                                console.log(win);
                                scope.$broadcast('content:ready', data, win);
                            });
                        } else {//Нсли нет картинки то просто вставляем контент
                            scope.$broadcast('content:ready', data, win);
                        }
                    } else {//html
                        $sectors.content.html(data);
                        var content = $sectors.content.contents();
                        $compile(content)(scope);
                        this._checkImgInContent(data);
                    }
                } .bind(this));
            },
            _getInline: function (link) {
                var win = this;
                $http.post(link).success(function (data) {
                    if ($sectors.content) {
                        $sectors.content.html(data);
                        var content = $sectors.content.contents();
                        $compile(content)(scope);
                        this._checkImgInContent(data);
                    } else {
                        throw ("При типе вызова inline в подгружаемом шаблоне должна быть диектива ng-sectors='content'");
                    }
                } .bind(this));
            },
            _checkImgInContent: function (data) {
                //проверка на изображение для резайза
                var resImg = $sectors.content[0].querySelector("img." + this.imageClass), win = this;
                if (resImg) {
                    var link = resImg.src;
                    this._getImage(link, function (result) {
                        result.data = data;
                        scope.$broadcast('content:ready', result, win);
                    });
                } else {
                    scope.$broadcast('content:ready', data, win);
                }
            },
            _getImage: function (link, after) {
                var img = new Image(), win = this, result = {};
                img.onload = function () {
                    angular.extend(result, {
                        oric_height: img.height,
                        oric_width: img.width,
                        elem: img,
                        src: link
                    });
                    result.ratio = result.oric_width / result.oric_height;
                    var newSize = win._getImageSize(result);
                    result.width = newSize[0];
                    result.height = newSize[1];
                    //Даем добро на ресайз картинки
                    win.imgResize = true;
                    after(result);
                };
                img.onerror = function () {
                    throw ('Картинки с таким адресом не существует!');
                };
                img.src = link;
            },
            //Размеры картинки в зависимости от размера окна
            _getImageSize: function (item) {
                var wrapWidth = scope.content.width, winHeight = scope.inner.height, result = [];
                //Желаемые размеры картинки
                var desiredWidth = wrapWidth, desiredHeight = winHeight - (this.margin * 2 + this.padding * 2);

                if (item.ratio < 1) {
                    desiredHeight -= this.outPadding;
                }
                //Проверка на минимальную высоту
                if (desiredHeight < this.minSizes.height) {
                    desiredHeight = this.minSizes.height;
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
            _defWinScopeVariable: function () {
                var sizes = thatWin._winSize.call(this);

                angular.extend(scope, {
                    show: false,
                    content: {
                        width: sizes.wrap,
                        padding: this.padding
                    },
                    inner: {
                        width: sizes.pageWidth,
                        height: sizes.viewHeight,
                        padding: this.margin + 'px 0 ' + this.margin + 'px 0'
                    }
                });
                //Эффект открытия
                $sectors.wrap.addClass("win-effect-" + this.effect);
                this.scope = scope;
            },
            bind: function (event, handler) {
                var name = event + ":" + this.timestamp;
                scope.$on(name, handler.bind(this));
            },
            trigger: function (event) {
                arguments[0] = event + ":" + this.timestamp;
                scope.$broadcast.apply(scope, arguments);
            }
        };

        var getUnicId = function () {
            return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        };

        return {
            create: function (options) {
                return WinModule(options);
            },
            getInstance: function (scope, name, callback) {
                $timeout(function () {
                    callback(scope[name])
                }, 0)
            },
            unicid: getUnicId
        }
    } ]);