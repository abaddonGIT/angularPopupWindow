var app = angular.module("app", ['popupWindow']);
app.controller("baseController", ['$scope', '$document', '$compile', '$popupWindow', function ($scope, $document, $compile, $popupWindow) {

    $scope.images = [
        {
            src: 'img/1.jpg',
            title: '1 картинка',
            id: '1'
        },
        {
            src: 'img/2.jpg',
            title: '2 картинка',
            id: '2'
        },
        {
            src: 'img/3.jpg',
            title: '3 картинка',
            id: '3'
        },
        {
            src: 'img/4.jpg',
            title: '4 картинка',
            id: '4'
        },
        {
            src: 'img/5.jpg',
            title: '5 картинка',
            id: '5'
        },
        {
            src: 'img/6.jpg',
            title: '6 картинка',
            id: '6'
        },
        {
            src: 'img/7.jpg',
            title: '7 картинка',
            id: '7'
        },
        {
            src: 'img/8.jpg',
            title: '8 картинка',
            id: '8'
        },
        {
            src: 'img/9.jpg',
            title: '9 картинка',
            id: '9'
        },
        {
            src: 'img/10.jpg',
            title: '10 картинка',
            id: '10'
        },
        {
            src: 'img/11.jpg',
            title: '11 картинка',
            id: '11'
        },
        {
            src: 'img/12.jpg',
            title: '12 картинка',
            id: '12'
        }
    ];
    //Настройка модуля
    $scope.$on("win:ready", function (e, win) {
       console.log(win);
    });

    //получение инстанса модуля
    $scope.open = function (e) {
        e.preventDefault();
        var elem = e.currentTarget;
        switch (elem.className) {
            case 'attr':
                $popupWindow.open({
                    target: elem,
                    source: "data-img"
                });
                break;
            case 'inline':
                $popupWindow.open({
                    //target: elem,
                    type: 'inline',
                    requestParam: {
                        title: "Заголовок 2"
                    },
                    innerTpl: 'tpl/inlineTpl.html'
                });
                break;
            case 'ajax':
                $popupWindow.open({
                    target: elem,
                    type: 'ajax',
                    pushState: true,
                    ajax: {
                        method: 'get'
                    },
                    requestParam: {
                        id: elem.getAttribute('img')
                    },
                    beforeContentLoaded: function (eventName, win, sectors) {
                        win.requestParam.title = "Заголовок был сменен в событии beforeContentLoaded";
                    },
                    innerTpl: 'tpl/ajaxJsonTpl.html'
                });
                break;
            case 'ajaxhtml':
                $popupWindow.open({
                    target: elem,
                    type: 'ajax',
                    innerTpl: 'tpl/ajaxHtmlTpl.html'
                });
                break;
            case 'list ng-scope':
                $popupWindow.open({
                    target: elem,
                    type: 'image',
                    pushState: true,
                    source: 'data-src',
                    beforeContentLoaded: function (eventName, win, sectors) {
                        win.requestParam = {
                            title: "Заголовок был сменен в событии beforeContentLoaded"
                        };
                    }
                });
                break;
            case 'ajaxlist ng-scope':
                $popupWindow.open({
                    target: elem,
                    type: 'ajax',
                    href: 'test.php',
                    pushState: true,
                    requestParam: {
                        id: elem.getAttribute('img')
                    },
                    beforePagination: function (eventName, win, sectors, elem) {
                        win.requestParam = {
                            id: elem.target[0].getAttribute('img')
                        };
                    }
                });
                break;
            default:
                $popupWindow.open({
                    target: elem,
                    requestParam: {
                        title: "Заголовок"
                    }
                });
        }
    };

    var el = $document[0].querySelector('.no-elem');
    angular.element(el).on('click', function () {
        $popupWindow.open({
            type: 'inline',
            href: 'tpl/test.html',
            innerTpl: 'tpl/inlineTpl.html',
            requestParam: {
                title: "Без элемента"
            }
        });
    });
} ]);