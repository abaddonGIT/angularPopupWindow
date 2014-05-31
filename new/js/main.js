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
    $scope.options = {
        locScope: $scope
    };
    //получение инстанса модуля
    $popupWindow.getInstance($scope, 'win', function (win) {
        $scope.open = function (e) {
            e.preventDefault();
            var elem = e.currentTarget;
            switch (elem.className) {
                case 'attr':
                    win.open({
                        target: elem,
                        source: "data-img"
                    });
                    break;
                case 'inline':
                    win.open({
                        target: elem,
                        type: 'inline',
                        innerTpl: 'tpl/inlineTpl.html'
                    });
                    break;
                case 'ajax':
                    win.open({
                        target: elem,
                        type: 'ajax',
                        pushState: true,
                        ajax: {
                            method: 'get'
                        },
                        innerTpl: 'tpl/ajaxJsonTpl.html'
                    });
                    break;
                case 'ajaxhtml':
                    win.open({
                        target: elem,
                        type: 'ajax',
                        innerTpl: 'tpl/ajaxHtmlTpl.html'
                    });
                    break;
                default:
                    win.open({
                        target: elem
                    });
            }
        };

        var el = $document[0].querySelector('.no-elem');
        angular.element(el).on('click', function () {
            win.open({
                type: 'inline',
                href: 'tpl/test.html',
                innerTpl: 'tpl/inlineTpl.html'
            });
        });
    });
} ]);