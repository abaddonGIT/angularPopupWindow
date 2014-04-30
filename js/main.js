var app = angular.module("app", ['popupWindow']);
app.controller("baseController", ['$scope','$document','$popupWindow', function ($scope, $document, $popupWindow) {
   $scope.images = [
       {
           src: 'img/002.jpg'
       },{
           src: 'img/003.jpg'
       },{
           src: 'img/01.jpg'
       },{
           src: 'img/02.jpg'
       },{
           src: 'img/03.jpg'
       },{
           src: 'img/04.jpg'
       },{
           src: 'img/05.jpg'
       },{
           src: 'img/06.jpg'
       },{
           src: 'img/07.jpg'
       },{
           src: 'img/003.jpg'
       },{
           src: 'img/002.jpg'
       },{
           src: 'img/10.jpg'
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

} ]);

//style="width: {{inner.width || 0}}px; height: {{inner.height || 0}}px; {{inner.padding}}"