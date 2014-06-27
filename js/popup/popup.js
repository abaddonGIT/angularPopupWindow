/**
 * Created by netBeans.
 * Name: popupWindow
 * User: Abaddon
 * Date: 29.04.14
 * Time: 17:15
 * Description: Open popup window
 */
var win = angular.module('popupWindow', []);
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
win.directive("ngPopupWin", ['$popupWindow', '$rootScope', '$interval', function ($popupWindow, $rootScope, $interval) {
    return {
        scope: {},
        replace: false,
        //Обертка для окна
        template: '<div id="window-wrap" ng-show="show"></div><div ng-show="show" id="wrap-inner" ng-style="{width:inner.width + \'px\', height:inner.height + \'px\', padding:inner.padding}">' +
            '<div id="wrap-block" ng-sectors="wrap" ng-hide="fullscreen" ng-style="{width: content.width + \'px\', padding: content.padding + \'px\'}">' +
            '</div>' +
            '</div><div ng-sectors="fullScreen" ng-show="fullscreen"></div>',
        link: function (scope, elem, attr) {
            //Создаем объект окна
            var win = $popupWindow.create({ sc: scope });
            //Сигналим что объект модуля был создан
            var locScope = elem.scope();
            //Говорим что модуль проинициализирован
            locScope.$emit("win:ready", win);
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
            //Полноэкранный режим
            scope.full = function () {
                win.full();
            };
            //Выход из полноэкранного режима
            scope.unfull = function () {
                win.unfull();
            }
            var slideshow;
            //слайдшоу для полноэкранного режима
            scope.$watch("slideshow", function (value) {
                if (value !== undefined) {
                    if (value) {
                        $interval.cancel(slideshow);
                        slideshow = $interval(function () {
                            win.next();
                        }, 5000);
                    } else {
                        $interval.cancel(slideshow);
                    }
                }
            });
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
                case 'afterClose':
                case 'winResize':
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
/*
 * FullScreen api
 */
win.factory("$fullScreen", ['$document', '$rootScope', function ($document, $rootScope) {
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
                    $rootScope.$emit("window:fullScreenClose");
                }
            }, false);
        } else if (d.mozFullScreenEnabled) {
            d.addEventListener("mozfullscreenchange", function () {
                if (!d.mozFullScreen) {
                    $rootScope.$emit("window:fullScreenClose");
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
                    $rootScope.$emit("window:fullScreenClose");
                }
            }, false);
        }
    };

    return {
        openFullScreen: open,
        cancelFullScreen: cancel,
        fullScreeEvent: addEvent
    };
} ]);
//Конструктор вызова
win.factory("$popupWindow", [
    '$rootScope',
    '$timeout',
    '$interval',
    '$sectors',
    '$document',
    '$window',
    '$http',
    '$compile',
    '$storage',
    '$location',
    '$groups',
    '$fullScreen',
    '$templateCache',
    function ($rootScope, $timeout, $interval, $sectors, $document, $window, $http, $compile, $storage, $location, $groups, $fullScreen, $templateCache) {
        "use strict";
        var config, thatWin, scope, fullWatcher,
        //Дефолт для окна
            winConfig = {
                pushState: false,
                target: null,
                resize: true,
                margin: 10,
                effect: 1,
                source: null,
                scope: null,
                locScope: null,
                type: 'image',
                href: null,
                imageClass: 'resize',
                keyControll: true,
                win_id: null,
                innerTpl: 'tpl/defInnerTpl.html',
                fullScreenTpl: 'tpl/fullScreenTpl.html',
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
        //Изменение отображения
        $fullScreen.fullScreeEvent();
        //Конструктор модуля
        var WinModule = function (options) {
            if (!(this instanceof WinModule)) {
                return new WinModule(options);
            }
            //конфигурация модуля    
            config = this.config = {
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
                    this._getContent(win);
                }.bind(this));
            };
            var searchString = $location.search();
            //Событие на ресайз
            angular.element($window).on("resize", function () {
                if (this.currWindow) {
                    this.delay(function () {
                        this._resizeWindow();
                    }.bind(this));
                }
            }.bind(this));
            thatWin = this;
            //Востановление окна приперезагрузке
            if (searchString['win_id']) {
                var config = $storage.get(searchString['win_id']);
                //Дожидаемся, когда будет найден элемент с id из конфига
                var timer = function () {
                    $timeout(function () {
                        config.target = $document[0].querySelector("#" + searchString['win_id']);
                        if (config.target) {
                            this.open(config);
                        } else {
                            timer.call(this);
                        }
                    }.bind(this), 100);
                }
                timer.call(this);
            }
            //Ожидает сигнала о готовности контента
            scope.$on("content:ready", function (e, result, win) {
                //Записываем данные в scope
                win.content = result;
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
                    if (scope.fullscreen) {
                        $sectors.fullScreen.removeClass("win-close").addClass("win-show");
                    } else {
                        $sectors.wrap.removeClass("win-close").addClass("win-show");
                    }
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
                }.bind(this), 100);
                this._updateUrl(win);
                this.updateScope();
            }.bind(this));
            //Закрытие окна
            this.close = function () {
                scope.show = false;
                if (searchString['win_id']) {
                    delete searchString['win_id'];
                    $location.search(searchString);
                }
                angular.element($document[0].body).css('overflow', 'auto');
                $sectors.wrap.removeClass("win-show").addClass("win-close");
                this.callEvent("afterClose", this.currWindow, $sectors);
                this.currWindow = null;
            };
            //Откытие полноэкранного режима
            this.full = function () {
                var win = this.currWindow;
                //Прослушка закрытия полноэкранного режима
                fullWatcher = this.config.root.$on("window:fullScreenClose", function () {
                    this.unfull(win);
                }.bind(this));
                //Подгрузка шаблона для полноэкранного режима
                this._loadTpl.call(win, 'fullScreenTpl', function () {
                    //Показываем во весь экран
                    $sectors.fullScreen.addClass("win-effect-1 win-show");
                }.bind(this), 'fullScreen');
                scope.fullscreen = true;
                $fullScreen.openFullScreen($sectors.fullScreen[0]);
            };
            //Закрытие полноэкранного режима
            this.unfull = function (win) {
                fullWatcher();
                $sectors.fullScreen.removeClass("win-effect-1 win-show");
                scope.fullscreen = false;
                scope.slideshow = false;
                $fullScreen.cancelFullScreen();
            };
            //Назад
            this.prev = function () {
                this.currWindow._navigate('prev');
            };
            //Вперед
            this.next = function () {
                this.currWindow._navigate('next');
            };
            //Управление стрелками
            $document.on("keydown", function (e) {
                var win = this.currWindow;
                if (win) {
                    if (win.keyControll && win.group) {
                        var code = e.keyCode;
                        switch (code) {
                            case 39:
                                this.currWindow._navigate('next');
                                break;
                            case 37:
                                this.currWindow._navigate('prev');
                                break;
                        }
                    }
                }
            }.bind(this));
        };
        //Методы модуля
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
                this.callEvent("winResize", this.currWindow, $sectors, newSize);
                this.updateScope();
            },
            //Подгружает шаблон
            _loadTpl: function (name, after, sector) {
                var mark = $sectors.wrap[0].querySelector("[mark=" + this[name + 'Mark'] + "]"), //Поиск блока в html
                    tpl = $templateCache.get(this[name]); //Поиск в хранилище
                if (!sector) sector = 'wrap';
                if (!mark) {//Если везде пусто
                    $http({ cache: $templateCache, url: this[name], method: "get" }).success(function (template) {
                        $sectors[sector].html(template);
                        var content = $sectors[sector].contents();
                        content[0].setAttribute('mark', this[name + 'Mark']);
                        $compile(content)(thatWin.config.sc);
                        after(template);
                    }.bind(this));
                } else {
                    after(tpl);
                }
            },
            _getContent: function (win) {
                var tag = win.target ? win.target[0].tagName : 'noelem', link;
                this.callEvent("beforeContentLoaded", win, $sectors);
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
                }
                ;

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
                    //Если тип inline то проверяем доп. шаблон
                    if (win.type === "inline") {
                        win._getInline();
                    } else {
                        throw ("Не получилось отыскать ссылку на запрашиваемый контент!");
                    }
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
                var w = $window, pageWidth = w.innerWidth, viewHeight = w.innerHeight, wrap, maxSizes;
                //Ширина области контента с учетов боковых отступов
                wrap = pageWidth - 2 * this.outPadding;

                if (scope.fullscreen) {
                    maxSizes = { width: pageWidth, height: viewHeight };
                } else {
                    maxSizes = this.maxSizes;
                }

                if (this.resize) {
                    if (wrap < this.minSizes.width) {
                        wrap = this.minSizes.width;
                    } else if (wrap > maxSizes.width) {
                        wrap = maxSizes.width;
                    }
                } else {
                    wrap = maxSizes.width;
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
                var name = arguments[0], win = this.currWindow || arguments[1];
                if (win[name]) {
                    if (typeof win[name] === "string") {//Если ф-я строка полученная из хранилища
                        new Function('call = ' + win[name] + '; return call.apply(win, arguments);').apply(win, arguments);
                    } else {
                        win[name].apply(win, arguments);
                    }
                }
            }
        };
        //Конструктор окна
        var Window = function (options) {
            //настроики с которыми было вызвано окно
            this.callOptions = options;
            if (!this.callOptions.maxSizes) {
                this.callOptions.maxSizes = winConfig.maxSizes;
            }
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
        //Методы окна
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
                }
                ;
                var elem = $groups[this.group][index];
                if (elem) {
                    this.callOptions.target = elem.target;
                    if (scope.fullscreen) {
                        $sectors.fullScreen.removeClass("win-show").addClass("win-close");
                    } else {
                        $sectors.wrap.removeClass("win-show").addClass("win-close");
                    }
                    thatWin.callEvent("beforePagination", this.callOptions, $sectors, elem);
                    $timeout(function () {
                        thatWin.open(this.callOptions);
                    }.bind(this), 600);
                } else {
                    if (scope.slideshow) {
                        this.index = -1;
                    } else {
                        if (phase === "prev") {
                            scope.nav.prev = false;
                        } else {
                            scope.nav.next = false;
                        }
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
                    }.bind(this));
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
                        }.bind(this);
                        break;
                    case 'GET':
                        win.ajax.params = win.requestParam
                        break;
                    default:
                        throw ('Ваш метод отправки не поддерживается!');
                }
                ;
                win.ajax.url = link;
                var ajaxConfig = {};
                angular.extend(ajaxConfig, winConfig.ajax, win.ajax);
                $http(ajaxConfig).success(function (data) {
                    if (angular.isObject(data)) {//json
                        //Проверяем есть ли картинка
                        if (data.src) {
                            win._getImage(data.src, function (result) {
                                angular.extend(data, result);
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
                }.bind(this));
            },
            _getInline: function (link) {
                var win = this;
                if (link) {
                    $http.post(link).success(function (data) {
                        if ($sectors.content) {
                            $sectors.content.html(data);
                            var content = $sectors.content.contents();
                            $compile(content)(scope);
                            this._checkImgInContent(data);
                        } else {
                            throw ("При типе вызова inline в подгружаемом шаблоне должна быть диектива ng-sectors='content'");
                        }
                    }.bind(this));
                } else {
                    var data = {};
                    this._checkImgInContent(data);
                }
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
            }
        };
        var getUnicId = function () {
            return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        };
        return {
            create: function (options) {
                return WinModule(options);
            },
            open: function (options) {
                if (thatWin) {
                    thatWin.open(options);
                } else {
                    throw ("Не могу найти текущий объект окна!");
                }
            },
            unicid: getUnicId
        }
    } ]);