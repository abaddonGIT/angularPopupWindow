var app = angular.module("app", ['popupWindow']);
app.controller("baseController", ['$scope', '$document', '$popupWindow', function ($scope, $document, $popupWindow) {

    $scope.images = [
        {
            src: 'img/01.jpg',
            title: '1 картинка',
            id: '01'
        },
        {
            src: 'img/001.jpg',
            title: '2 картинка',
            id: '001'
        },
        {
            src: 'img/02.jpg',
            title: '3 картинка',
            id: '02'
        },
        {
            src: 'img/002.jpg',
            title: '4 картинка',
            id: '002'
        },
        {
            src: 'img/03.jpg',
            title: '5 картинка',
            id: '03'
        },
        {
            src: 'img/003.jpg',
            title: '6 картинка',
            id: '003'
        },
        {
            src: 'img/04.jpg',
            title: '7 картинка',
            id: '04'
        },
        {
            src: 'img/05.jpg',
            title: '8 картинка',
            id: '05'
        },
        {
            src: 'img/06.jpg',
            title: '9 картинка',
            id: '06'
        },
        {
            src: 'img/03.jpg',
            title: '10 картинка',
            id: '03'
        },
        {
            src: 'img/10.jpg',
            title: '11 картинка',
            id: '10'
        },
        {
            src: 'img/01.jpg',
            title: '12 картинка',
            id: '01'
        }
    ];

    var window = $scope.popup = $popupWindow.init({
        wrapTpl: 'tpl/wrapTpl.html',
        scope: $scope
    });

    $scope.open = function (event) {
        event.preventDefault();
        var target = event.currentTarget;
        console.log(target.className);
        switch (target.className) {
            case 'win-image ng-scope':
                window.open({
                    el: angular.element(target),
                    winType: "image",
                    dataRequest: {
                        header: {
                            title: "test"
                        }
                    }
                });
                break;
            case 'win-image-ajax ng-scope ng-binding':
                window.open({
                    el: angular.element(target),
                    winType: 'ajax',
                    dataRequest: {
                        id: target.id
                    }
                });
                break;
            case 'win-html':
                window.open({
                    el: angular.element(target),
                    winType: 'ajax',
                    dataRequest: {
                        title: 'Первая картинка',
                        type: 'html',
                        href: 'img/01.jpg'
                    }
                });
                break;
        };
    };
    /*
    * Перед пагинацией
     */
    window.bind("window:beforePagination", function (e, item, sectors) {
        window.config.dataRequest.id = item[0].id;
    });
    /*
     * Перед загрузкой контента
     */
    window.bind("window:beforeContentLoaded", function (e, sectors) {
        //console.log(sectors);
    });
    /*
     * После подгрузки контента
     */
    window.bind("window:afterContentLoaded", function (e, content, sectors) {
        //console.log(content);
    });
    //закрывает окно
    $scope.close = function () {
        window.closeWindow();
    };
    //Вперед
    $scope.next = function () {
        window.getNext();
    };
    //Назад
    $scope.prev = function () {
        window.getPrev();
    };

    /*
    * Пользовательская обработка результата при подгрузки картинки
     */
    window.bind("window:userImageLoaded", function (e, item, sectors) {
        console.log("asdas");
        var content = sectors.content.el, img = item.img.el;
        content.html('').append(img);
        $scope.inner.show = true;
    });

    window.bind("window:userHtmlLoaded", function (e, item, sectors) {
        var content = sectors.content.el;
        content.html(item.el);
        $scope.inner.show = true;
    });

} ]);

//style="width: {{inner.width || 0}}px; height: {{inner.height || 0}}px; {{inner.padding}}"