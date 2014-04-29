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
         elem.bind("click", function () {
            scope.$emit('window:open', elem, scope, attr);
            return false;
         });
     }
   };
}]);

popup.factory("$popupWindow", ["$rootScope", function ($rootScope) {
    var config = {};

    var Window = function (settings) {
        if(!(this instanceof Window)) {
            return new Window(settings);
        }

        angular.extend(this, {
            scope: $rootScope
        }, settings);

        this.scope.$on('window:open', function (e, elem, scope, attr) {
            this.locScope = scope;
            //Проверяем не были ли переданы настройки непосредственно через элемент
            if (attr.windowSettings) {
                var set = scope.$eval(attr.windowSettings);

                angular.extend(this, set);
            }

        }.bind(this));
    };

    return {
        init: function (settings) {
            return Window(settings);
        },
        config: config
    }
}]);