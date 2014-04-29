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

popup.directive("popupWrap", ['$popupWindow', '$http', '$compile', function ($popupWindow, $http, $compile) {
    return function (scope, elem, attr) {
        var conf = $popupWindow.config();

        scope.hello = 'asdasd';

        $http.post(conf.wrapTpl).success(function (data) {
            elem.html(data);
            var content = elem.contents();
            $compile(content)(scope);

        });
    };
}]);

popup.factory("$popupWindow", ["$rootScope", function ($rootScope) {
    var config = {}, win = null;

    var Window = function (settings) {
        if (!(this instanceof Window)) {
            return new Window(settings);
        }

        angular.extend(this, {
            scope: $rootScope,
            url: 1
        }, settings);

        this.scope.$on('window:open', function (e, elem, attr) {
            //Проверяем не были ли переданы настройки непосредственно через элемент
            if (this.locScope) {
                if (attr.windowSettings) {
                    var set = this.scope.$eval(attr.windowSettings);

                    angular.extend(config, this, set);
                } else {
                    angular.extend(config, this);
                }
                this.el = elem;

                this.openWindow();
            } else {
                throw ("Вы не передали локальный scope в ф-ю инициализации!");
            }
        }.bind(this));

        win = this;
    };

    Window.prototype = {
        updateScope: function () {
            this.scope.$$phase || this.scope.$digest();
        },
        openWindow: function () {
            var scope = this.locScope;
            //Открываем окно

            scope.popup.show = true;
            this.updateScope();
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