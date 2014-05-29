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
//Разбивает шаблон по секторам
win.directive("ngSectors", ['$sectors', function ($sectors) {
    return function (scopem, elem, attr) {
        $sectors[attr.ngSectors] = elem;
    };
} ]);
//Формирует блон окна
win.directive("ngPopupWin", ['$popupWindow', '$rootScope', function ($popupWindow, $rootScope) {
    return {
        scope: {
            options: "=?",
            win: "=?"
        },
        replace: false,
        //Обертка для окна
        template: '<div id="window-wrap" ng-show="show"></div><div ng-show="show" id="wrap-inner" ng-style="{width:inner.width + \'px\', height:inner.height + \'px\', padding:inner.padding}">' +
                '<div id="wrap-content" ng-sectors="wrap" ng-style="{width: content.width + \'px\'}">' +
                '</div>' +
                '</div>',
        link: function (scope, elem, attr) {
            //Создаем объект окна
            if (scope.options) {
                scope.options.sc = scope;
            } else {
                scope.options = { sc: scope };
            }
            $popupWindow.create(scope.options);
        }
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
    function ($rootScope, $timeout, $tplCache, $sectors, $document, $window) {
        "use strict";
        var config, thatWin,
        //Дефолт для окна
        winConfig = {
            pushState: false,
            target: null,
            resize: true,
            margin: 10,
            effect: 1,
            source: 'href',
            scope: null,
            type: 'image',
            win_id: null,
            innerTpl: 'tpl/defInnerTpl.html',
            fullScreenTpl: 'tpl/defFullScreenTpl.html',
            ajax: {
                method: 'post',
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
                currContent: null,
                timestamp: Date.now()
            };
            //Мержим
            angular.extend(config, options);
            //Открытие окна
            this.open = function (options) {
                var win = new Window(options);
                
            };

            config.locScope.win = this;
            thatWin = this;
        };

        WinModule.prototype = {
            //Подгружает шаблон
            _loadTpl: function (name, after) {
                console.log($sectors);
            },
            //Размеры окна
            _winSize: function () {
                var w = $window;
                return {
                    'pageWidth': w.innerWidth,
                    'viewHeight': w.innerHeight
                };
            },
            //Запуск грязной проверки 
            updateScope: function () {
                this.config.root.$$phase || this.config.root.$digest();
            }
        };
        //Конструктор окна
        var Window = function (options) {
            //Конфиг вызова
            angular.extend(this, winConfig, options);
            //Обертка jQuery lite
            if (!this.target[0]) {
                this.target = angular.element(this.target);
            }
            //Если pushState true, то пятаемся взять аттрибут id для маркировки окна
            if (this.pushState) {
                this.win_id = this.target[0].id;
            }
            //Формирование подписей для шаблонов        
            this.innerTplMark = this.innerTpl.replace(/[\/,\.]/g, '__');
            this.fullScreenTplMark = this.fullScreenTpl.replace(/[\/,\.]/g, '__');
            //Заполнение переменных окна первоночальными данными
            this._defWinScopeVariable();

            return this;
        };
        Window.prototype = {
            _defWinScopeVariable: function () {
                var sizes = thatWin._winSize(), scope = thatWin.config.sc;

                angular.extend(scope, {
                    show: false,
                    inner: {
                        width: sizes.pageWidth,
                        height: sizes.viewHeight
                    }
                });
                //Эффект открытия
                $sectors.wrap.addClass("win-effect-" + this.effect);
                this.scope = scope;
            }
        };

        return {
            create: function (options) {
                return WinModule(options);
            },
            getInstance: function (scope, name, callback) {
                $timeout(function () {
                    callback(scope[name])
                }, 0)
            }
        }
    } ]);