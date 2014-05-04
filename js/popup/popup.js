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
popup.directive("popupWindow", ['$popupWindow', function ($popupWindow) {
    return {
        link: function (scope, elem, attr) {
            //Создаем наборы из однотипных элементов
            if (attr.group) {
                var config = $popupWindow.config(), group = attr.group;
                if (config.setElements[group]) {
                    config.setElements[group].push(elem);
                } else {
                    config.setElements[group] = [];
                    config.setElements[group].push(elem);
                }
            }

            elem.bind("click", function (e) {
                e.preventDefault();
                scope.$emit('window:open', elem, attr);
            });
        }
    };
}]);
/*
* Подгрузка компонентов шаблона
 */
popup.directive("popupSection",['$popupWindow', '$http', '$compile', 'templateCache', function ($popupWindow, $http, $compile, templateCache) {
    return function (scope, elem, attr) {
        var sector = attr.popupSection, config = $popupWindow.config();
        switch (sector) {
            case 'header':
                scope.header = {el: elem};
                var temp = templateCache.get(config.tpls.headerTpl), tpl = config.tpls.headerTpl;
                break;
            case 'content':
                scope.content = {el: elem};
                var temp = templateCache.get(config.tpls.contentTpl), tpl = config.tpls.contentTpl;
                break;
            case 'footer':
                scope.footer = {el: elem};
                var temp = templateCache.get(config.tpls.footerTpl), tpl = config.tpls.footerTpl;
                break;
        }

        if (temp) {
            $compile(temp)(scope);
            scope[sector].tplLoad = true;
        } else {
            $http.post(tpl).success(function (template) {
                elem.html(template);
                var content = elem.contents();
                $compile(content)(scope);
                scope[sector].tplLoad = true;
                templateCache.put(tpl, content);
            });
        }
    };
}]);
/*
 * Основной шаблон
 */
popup.directive("popupWrap", ['$popupWindow', '$http', '$compile', 'templateCache', function ($popupWindow, $http, $compile, templateCache) {
    return function (scope, elem, attr) {
        scope.inner = {};
        scope.wrap = {};
        scope.navigation = {};

        var config = $popupWindow.config(), temp = templateCache.get(config.tpls.wrapTpl);
        if (temp) {
            $compile(temp)(scope);
            scope.inner.tplLoad = true;
        } else {
            $http.post(config.tpls.wrapTpl).success(function (template) {
                elem.html(template);
                var content = elem.contents();
                $compile(content)(scope);
                scope.inner.tplLoad = true;
                templateCache.put(config.tpls.wrapTpl, content);
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

popup.factory("$popupWindow", ["$rootScope", "$window", "$document", "$interval", "$http", "$compile", function ($rootScope, $window, $document, $interval, $http, $compile) {
    var config = {}, win = null, scope = null, sizes = null, elemAttr = null;

    var Window = function (settings) {
        if (!(this instanceof Window)) {
            return new Window(settings);
        }

        angular.extend(this, {
            root: $rootScope,
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
            ajax: {
                method: 'post',
                url: 'test.php',
                headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'},
                data: {}
            },
            queue: [],
            setElements: {},
            loadImages: {},
            timestamp: Date.now()
        }, settings);

        /*
         * Открывает окно
         */
        this.scope.$on('window:open', function (e, elem, attr) {
            scope = this.scope;
            this.group = attr.group;
            //текущий элемент в наборе
            if (this.group) {
                this.index = this.setElements[this.group].indexOf(elem);
            }

            if (attr.request) {
                elemAttr = scope.$eval(attr.request);
            } else {
                elemAttr = {};
            }
            //Проверяем не были ли переданы настройки непосредственно через элемент
            if (scope) {
                if (attr.settings) {
                    var set = this.scope.$eval(attr.settings);
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
        /*
         * Пагинация
         */
        this.scope.$on("window:navigate", function (e, elem, act) {
            switch (act) {
                case 'next':
                    this.index = this.index + 1;
                    break;
                case 'prev':
                    this.index = this.index - 1;
                    break;
            }
            this.el = elem;
            elemAttr = this.scope.$eval(elem[0].getAttribute("data-request")) || {};
            //сброс всех блоков на дефолт
            this.defaultWindow();
            //Новая картинка
            this.loadContent();
        }.bind(this));
        win = this;
    };

    Window.prototype = {
        bind: function (event, handler) {
            var name = event + ":" + this.timestamp;
            scope.$on(name, handler.bind(this));
        },
        trigger: function (event) {
            arguments[0] = event + ":" + this.timestamp;
            scope.$broadcast.apply(scope, arguments);
        },
        defaultWindow: function () {
            sizes = this.sizes = this.getTrueWindowSize();
            var inner = {
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
            var navigation = {
                prev: {
                    show: false
                },
                next: {
                    show: false
                }
            }
            var footer = {};

            angular.extend(scope.wrap, wrap);
            angular.extend(scope.inner, inner);
            angular.extend(scope.navigation, navigation);
            angular.extend(scope.header, header);
            angular.extend(scope.content, content);
            angular.extend(scope.footer, footer);
        },
        /*
         * Building popup
         */
        buildWindow: function () {
            this.defaultWindow();
            //Как только все части окна подгруженны начинаем впихивать туда контент
            var loadTpl = $interval(function () {
                if (scope.inner.tplLoad && scope.header.tplLoad && scope.content.tplLoad && scope.footer.tplLoad) {
                    $interval.cancel(loadTpl);
                    this.loadContent();
                    //this.updateScope();
                }
            }.bind(this), 100);

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
                if (config.resize) {
                    //Размер всплывающего окна
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

                    //Размер изображения внутри окна
                    if (!this.currContent.param.noResize) {
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
                    }
                }
            }.bind(this));
        },
        loadContent: function () {
            switch (config.winType) {
                case 'image':
                    var item = new Item();
                    break;
                case 'ajax'://подгрузка контента через ajax
                    angular.extend(config.ajax.data, elemAttr, this.data);
                    config.ajax.transformRequest = function (data) {
                        return this.toParam(data);
                    }.bind(this);
                    $http(config.ajax).success(function (data, status) {
                            if (data instanceof Object) {//если вернули json
                                var item = new Item(data, 'json');
                            } else {
                                var content = scope.content.el;
                                content.html(data);
                                $compile(content.contents())(scope);
                            }
                        }.bind(this)).error(function (data, status) {
                        throw ("При попытке получения данных произошел сбой!");
                    });
                    //картинка, которая была внутри полученного контента загружена
                    this.root.$on("window:imageContent", function (e, img, attr) {
                        var item = new Item(img, 'image');
                    }.bind(this));
                    //просто html контент загружен
                    this.root.$on("window:htmlContent", function (e, elem, attr) {
                        var item = new Item(elem, 'html');
                    });
                    break;
            }
            //После разбора и создания объекта отображения, который включает в себя изображение
            this.root.$on("window:imageLoaded", function (e, item) {
                if (!item.error) {
                    this.queue.push(item);
                    //данные по картинке
                    angular.extend(scope.content.img, item);
                    //доп данные
                    angular.extend(scope.content, item.param);

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
                    scope.inner.show = true;
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
                    this.updateScope();
                }
            }.bind(this));
            //После создания объекта отображения, который представляет из себя просто кусок html-кода
            this.root.$on("window:htmlLoaded", function (e, item) {
                //доп данные
                angular.extend(scope.content, item.param);
                this.currContent = item;
                scope.inner.show = true;
                this.updateScope();
            }.bind(this));
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
        //закрывает окно
        closeWindow: function () {
            scope.inner.show = false;
        },
        //вперед
        getNext: function () {
            var next = this.setElements[this.group][this.index + 1];
            scope.$emit("window:navigate", next, 'next');
        },
        //Назад
        getPrev: function () {
            var prev = this.setElements[this.group][this.index - 1];
            scope.$emit("window:navigate", prev, 'prev');
        },
        data: {}
    };

    var Item = function (obj, type) {
        switch (config.winType) {
            case 'image':
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
                            this.createImage(obj.src);
                        }
                        break;
                }
                break;
        }
    };

    Item.prototype = {
        imageRendering: function (img, link) {
            this.oric_width = img.width;
            this.oric_height = img.height;
            this.src = link;
            this.el = img;
            this.ratio = this.oric_width / this.oric_height;
            var newSizes = win.getNewSize(this);
            this.width = newSizes[0];
            this.height = newSizes[1];
            this.param = {};
            angular.extend(this.param, elemAttr);
        },
        createImage: function (link) {
            if (win.loadImages[link]) {
                this.imageRendering(win.loadImages[link], link);
                win.root.$broadcast("window:imageLoaded", this);
            } else {
                var img = new Image();
                img.onload = function () {
                    this.imageRendering(img, link);
                    win.root.$broadcast("window:imageLoaded", this);
                    win.loadImages[link] = img;
                    img = 0;
                }.bind(this);
                img.onerror = function () {
                    this.error = true;
                    this.el = img;
                    win.root.$broadcast("window:imageLoaded", this);
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
            win.root.$broadcast("window:htmlLoaded", this);
        }
    };

    return {
        init: function (settings) {
            return Window(settings);
        },
        config: function () {
            return win;
        },
        closeWindow: this.closeWindow,
        getNext: this.getNext,
        getPrev: this.getPrev
    }
}]);