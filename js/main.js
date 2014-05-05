var app = angular.module("app", ['popupWindow']);
app.controller("baseController", ['$scope','$document','$popupWindow', function ($scope, $document, $popupWindow) {
   $scope.images = [
       {
           src: 'img/01.jpg',
           title: '1 картинка',
           id: '01'
       },{
           src: 'img/001.jpg',
           title: '2 картинка',
           id: '001'
       },{
           src: 'img/02.jpg',
           title: '3 картинка',
           id: '02'
       },{
           src: 'img/002.jpg',
           title: '4 картинка',
           id: '002'
       },{
           src: 'img/03.jpg',
           title: '5 картинка',
           id: '03'
       },{
           src: 'img/003.jpg',
           title: '6 картинка',
           id: '003'
       },{
           src: 'img/04.jpg',
           title: '7 картинка',
           id: '04'
       },{
           src: 'img/05.jpg',
           title: '8 картинка',
           id: '05'
       },{
           src: 'img/06.jpg',
           title: '9 картинка',
           id: '06'
       },{
           src: 'img/03.jpg',
           title: '10 картинка',
           id: '03'
       },{
           src: 'img/10.jpg',
           title: '11 картинка',
           id: '10'
       },{
           src: 'img/01.jpg',
           title: '12 картинка',
           id: '01'
       }
   ];

   var window = $scope.popup =  $popupWindow.init({
       tpls: {
           wrapTpl: 'tpl/wrapTpl.html',
           headerTpl: 'tpl/windowHeaderTpl.html',
           contentTpl: 'tpl/windowContentTpl.html',
           footerTpl: 'tpl/windowFooterTpl.html'
       },
       scope: $scope
   });
   //закрывает окно
   $scope.close = function () {
       window.closeWindow();
   };

   $scope.next = function () {
       window.getNext();
   };

    $scope.prev = function () {
        window.getPrev();
    }

} ]);

//style="width: {{inner.width || 0}}px; height: {{inner.height || 0}}px; {{inner.padding}}"