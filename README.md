angularPopupWindow
==================

Скрипт модального окна на angular js.

<h2>Как использовать?</h2>

<ol>
    <li>
        <h3>Подключение:</h3>
        <pre>var app = angular.module('app', ['popupWindow']);</pre>
    </li>
    <li>
        <h3>Настройка:</h3>
        <ul>
            <li>
                <b>В шаблоне:</b>
<pre>
//коллекция картинок
&lt;div class="images"&gt;
    &lt;a ng-repeat="image in images" id="image_{{image.id}}" data-popup-window href="{{image.src}}" ng-click="open($event)" data-group="first" class="win-image"&gt;&lt;img class="like" width="100" src="{{image.src}}" alt="" /&gt;&lt;/a&gt;
&lt;/div&gt;
//просто вызов
&lt;div ng-click="open($event)" class="win-json"&gt;Просто json без картинки&lt;/div&gt;
//Сюда будет подгруженно окно
&lt;div data-popup-wrap>&lt;/div&gt;
</pre>
                Тут в "коллекции картинок" на элементе дополнительно вызывается директива <b>data-popup-window</b>, это
                директива присваивает элементу уникальный идентификатор и составляет коллекцию элементов по группе,
                наименование которой передается
                через аттрибут <b>data-group</b>. Это необходимо для осуществления пагинации по элементам.
            </li>
            <li>
                <b>В контроллере:</b>
                <pre>
app.controller("baseController", ['$scope', '$document', '$popupWindow', function ($scope, $document, $popupWindow) {
    //Инициализация модуля
    var window = $scope.popup = $popupWindow.init({
        scope: $scope//Необходимо передать scope в модуль
    });
    //Ф-я открытия окна например может быть такой
    $scope.open = function (event) {
        event.preventDefault();
        var target = event.currentTarget;
        
        switch (target.className) {
            case 'win-image ng-scope':
                window.open({
                    el: angular.element(target),
                    winType: "image",
                    dataRequest: {
                        title: "test",
                        description: "ololosha"
                    },
                    beforeContentLoaded: function (config, sectors) {
                        config.dataRequest.description = "Это штуковина работает!!!!";
                    },
                    beforePagination: function (item, sectors) {
                        console.log(item);
                    },
                    afterContentLoaded: function (content, sectors, response) {
                        console.log(content);
                    }
                });
                break;
            case 'win-json':
                window.open({
                    el: angular.element(target),
                    winType: 'ajax',
                    innerTpl: 'tpl/jsonTpl.html',
                    dataRequest: {
                        title: 'Простой ответ JSON',
                        description: 'Полученные значения просто записываются в скоп',
                        type: 'json'
                    }
                });
                break;
        };
    };
}]);
</pre>
                <b>Параметры вызова окна:</b>
                <ul>
                    <li><b>resize</b> - нужен ли резайз окна в зависимости от разрешения монитора (true - default,
                        false)
                    </li>
                    <li><b>padding</b> - внутренний отступ (15px - default)</li>
                    <li><b>margin</b> - отступ от верхнего края монитора</li>
                    <li><b>outPadding</b> - отступы справа и слева от контента окна до границ монитора при, котором
                        начинается ресайз окна
                    </li>
                    <li><b>winType</b> - тип вызываемого окна (image - default, ajax)</li>
                    <li><b>innerTpl</b> - шаблон внутренней части окна</li>
                    <li><b>fullScreenTpl</b> - шаблон для полноэкранного режима просмотра</li>
                    <li><b>maxSizes</b> - максимальные размеры окна ({
                        width: 1024,
                        height: 768
                        } - default. Если параметер resize - false, то эти рамеры считаются фиксированными)
                    </li>
                    <li><b>minSizes</b> - {
                        width: 640,
                        height: 480
                        } - минимальные размеры окна
                    </li>
                    <li><b>ajax</b> - параметры для ajax-запроса (такие же как $http, если <b>winType</b> - ajax)</li>
                    <li><b>dataRequest</b> - параметры которые в зависимости от типа вызова окна попадут либо в объект
                        окна, для типа image, либо будут добавлены к запросу, для типа ajax (Пример: {title: "Ежик в
                        тумане"})
                    </li>
                    <li><b>effect</b> - Эффект открытия окна (так же распостраняется и на пагинацию. От 1 до 5)</li>
                    <li><b>userControl</b> - если эта опция подключена то вставка полученного контента ложится на
                        пользователя (В этом случаи все действия с полученным контентом выполняются через событие <b>window:userControll</b>)
                    </li>
                    <li><b>beforeContentLoaded</b> - ф-я которая отрабатывает перед получением контента и его вставки в окно (ф-я получает объект вызыва и объекты секторов окна)</li>
                    <li><b>beforePagination</b> - ф-я отрабатывает перед перелистыванием между картинками (ф-я получает объект слудующего элемента и объекты секторов окна)</li>
                    <li><b>afterContentLoaded</b> - ф-я отрабатывает после прогрузки и вставки контента в окно (ф-я получает текущий объект, объекты секторов окна и сырой результат запроса)</li>
                </ul>
                <b>Методы объекта окна:</b>
                <ul>
                    <li><b>open</b> - открывает окно, ожидает в качестве параметра объект настроек описаных выше</li>
                    <li><b>closeWindow</b> - закрывает окно</li>
                    <li><b>getNext</b> - следующий слайд</li>
                    <li><b>getPrev</b> - предыдущий слайд</li>
                    <li><b>fullScreen</b> - полноэкранный режим</li>
                    <li><b>cancelFullScreen</b> - закрытие полноэкранного режима</li>
                </ul>
                <pre>
window.open({
    el: angular.element(target),
    winType: 'ajax',
    innerTpl: 'tpl/jsonTpl.html',
    dataRequest: {
        title: 'Простой ответ JSON',
        description: 'Полученные значения просто записываются в скоп',
        type: 'json'
    }
});
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
                
$scope.fullScreen = function () {
    window.fullScreen();
};
                
$scope.cancelFullScreen = function () {
    window.cancelFullScreen();
};
                </pre>
                <b>Как это выглядит в шаблоне (Пример innerTpl - defaultWrapTpl.html):</b>
                <pre>
&lt;div id="window-styled-block"&gt;
    &lt;div id="window-header" data-window-section="header"&gt;
        &lt;b>{{winpopup.content.param.title}}&lt;/b&gt;
        &lt;a ng-click="close()" class="close">Закрыть&lt;/a&gt;
        &lt;a ng-click="prev()" class="prev nav" ng-show="winpopup.navigation.prev">Назад&lt;/a&gt;
        &lt;a ng-click="next()" class="next nav" ng-show="winpopup.navigation.next">Вперед&lt;/a&gt;
    &lt;/div&gt;
    &lt;div id="content" data-window-section="content"&gt;
        &lt;img src="{{winpopup.content.src}}" alt="" width="{{winpopup.content.width}}"
             height="{{winpopup.content.height}}"/&gt;
    &lt;/div&gt;

    &lt;div id="window-footer" data-window-section="footer"&gt;
        {{winpopup.content.param.description}}
        &lt;h3>({{winpopup.index}} из {{winpopup.counter}})&lt;/h3&gt;
        &lt;a ng-click="fullScreen()"&gt;Полноэкранный режим&lt;/a&gt;
    &lt;/div&gt;
&lt;/div>
                </pre>
        </ul>
</ol>
