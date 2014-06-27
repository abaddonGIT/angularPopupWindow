angularPopupWindow (alpha version 2.0)
==================

Скрипт модального окна на angular js.
<b><a href="http://angular.demosite.pro/popup/" target="_blank">Демка</b></a>
<ol>
    <li>
        <h3>Установка:</h3>
        <pre>var app = angular.module('app', ['popupWindow']);</pre>
    </li>
    <li>
        <h3>В шаблоне:</h3>
        В html шаблон необходимо поместить елемент в который будет подгруженно окно
        <pre>
//Вызывается один раз на странице
&lt;div ng-popup-win &gt;&lt;/div&gt;
</pre>
        Примеры елементов с вызовом
        <pre>
&lt;a href="img/1.jpg" ng-click="open($event)" id="test1"&gt;
    &lt;img src="img/1.jpg" alt="" width="150" /&gt;
&lt;/a&gt;
</pre>
    </li>
    <li>
        <h3>В контроллере:</h3>
        Для начало необходимо проинициализировать модуль:
        <pre>
app.controller("baseController", ['$scope', '$popupWindow', function ($scope, $popupWindow) {
    $popupWindow.open({
        target: elem
    });
}]);
</pre>
        Для открытия окна используется ф-я <b>open</b> нашего созданного объекта <b>win</b>. Параметры вызова:
        <ul>
            <li>
                <b>href</b> - сюда  может быть передан либо url для ajax запроса, либо адрес картинки (если не задан аттрибут target),
                либо адрес контента для вставки
            </li>
            <li>
                <b>target</b> - html - элемент на котором было вызвано окно
            </li>
            <li>
                <b>source</b> - имя аттрибуда откуда будет браться адрес запроса (по умолчанию href)
            </li>
            <li>
                <b>imageClass</b> - имя класа, который должен присутствовать у картинки полученной в виде html кода и которая должна резайзмиться (по умолчанию resize)
            </li>
            <li>
                <b>keyControll</b> - разрешает пагинаю при помощи клавиш
            </li>
            <li>
                <b>resizeDelay</b> - задержка между пересчетами размера окна (по умолчанию 100)
            </li>
            <li>
                <b>resize</b> - нужен ли резайз окна в зависимости от разрешения монитора (true - default, false)
            </li>
            <li>
                <b>padding</b> - внутренний отступ (15px - default)
            </li>
            <li>
                <b>margin</b> - отступ от верхнего края монитора
            </li>
            <li>
                <b>outPadding</b> - отступы справа и слева от контента окна до границ монитора при, котором начинается ресайз
            </li>
            <li>
                <b>type</b> - тип вызываемого окна (image - default, ajax, inline)
            </li>
            <li>
                <b>innerTpl</b> - шаблон внутренней части окна
            </li>
            <li>
                <b>fullScreenTpl</b> - шаблон для полноэкранного режима просмотра (Полноэкранный режим реализован при помощи FullScreenAPI HTML5)
            </li>
            <li>
                <b>maxSizes</b> - максимальные размеры окна ({
                                width: 1024,
                                height: 768
                                } - default. Если параметер resize - false, то по этим размерам строится окно)
            </li>
            <li>
                <b>minSizes</b> - {
                                width: 640,
                                height: 480
                                } - минимальные размеры окна
            </li>
            <li>
                <b>ajax</b> - параметры для ajax-запроса (такие же как $http, кроме параметра url, в качестве его используется параметер вызова <b>href</b> для <b>type</b> - "ajax")
            </li>
            <li><b>requestParam</b> - параметры которые в зависимости от типа вызова окна попадут либо в объект
                                окна, для типа image, либо будут добавлены к запросу, для типа ajax (Пример: {title: "Ежик в
                                тумане"})
            </li>
            <li><b>pushState</b> - Если стоит true, то для открытого окна будет формироваться url, который позволит восcтановить его после обновления страницы (Это будет работать при условии,
            что у элемента на котором было вызвано окно имеет уникальный аттрибут <b>id</b>, так же обязательно должен быть передан параметер <b>target</b>)
            </li>
            <li>
               <b>effect</b> - Эффект открытия окна (так же распостраняется и на пагинацию. От 1 до 5)
            </li>
            <li><b>beforeContentLoaded</b> - ф-я которая отрабатывает перед получением контента и его вставки в окно (ф-я получает объект вызыва и объекты секторов окна)</li>
            <li><b>beforePagination</b> - ф-я отрабатывает перед перелистыванием между картинками (ф-я получает объект слудующего элемента и объекты секторов окна)</li>
            <li><b>afterContentLoaded</b> - ф-я отрабатывает после прогрузки и вставки контента в окно (ф-я получает текущий объект, объекты секторов окна и сырой результат запроса)</li>
            <li><b>afterClose</b> - ф-я отрабатывает после закрытия окна (ф-я получает текущий объект, объекты секторов окна)</li>
            <li><b>winResize</b> - ф-я отрабатывает при пересчете размера окна (ф-я получает текущий объект, объекты секторов окна и новые размеры)</li>
        </ul>
    </li>
    <li>
        <h3>Пример шаблона внутренней части окна:</h3>
        <pre>
&lt;div id="content"&gt;
   &lt;div ng-sector="header"&gt;
        &lt;h1&gt;{{param.title}}&lt;/h1&gt;
        &lt;a ng-click="close()"&gt;Закрыть&lt;/a&gt;
        &lt;a class="nav-prev" ng-show="nav.prev" ng-click="prev()"&gt;Назад&lt;/a&gt;
        &lt;a class="nav-next" ng-show="nav.next" ng-click="next()"&gt;Вперед&lt;/a&gt;
    &lt;/div&gt;
    &lt;div ng-sectors="content"&gt;
       &lt;img src="{{param.src}}" width="{{param.width}}" height="{{param.height}}" alt="" /&gt;
    &lt;/div&gt;
    &lt;div ng-sectors="footer"&gt;
        &lt;a ng-click="full()"&gt;Полноэкранный режим&lt;/a&gt;
        {{index}} - {{count}}
    &lt;/div&gt;
&lt;/div&gt;
</pre>
Стандартные методы окна жоступные в его шаблонах
    <ul>
        <li>
            <b>prev</b> - следующий слайд
        </li>
        <li>
            <b>next</b> - предыдущий слайд
        </li>
        <li>
            <b>close</b> - закрывает окно
        </li>
        <li>
            <b>full</b> - переводит окно в полноэкранный режим
        </li>
        <li>
            <b>unfull</b> - выход из полноэкранного режима
        </li>
    </ul>
    Вы так же можите создавать свои ф-и и вешать их на элементы окна. Выглядеть это будет примерно так
    <pre>
//Это событие наступает когда был создан объект окна
$scope.$on("win:ready", function (e, win) {
   var sc = win.config.sc;
   sc.testFunc = function () {
        console.log("Я буду работать внутри окна!");
   };
});
</pre>
    Список стандартных переменных используеммых в окне:
        <ul>
            <li><b>nav.prev</b> - показывает есть ли предыдущий элемент</li>
            <li><b>nav.next</b> - показывает есть ли следующий элемент</li>
            <li><b>index</b> - порядковый номер текущего эемента в наборе</li>
            <li><b>count</b> - общее кол-во элементов в наборе</li>
            <li><b>param</b> - сюда попадают все остальные переменные полученные окном (например при типе "image", param.width и param.height представляют собой размеры картинки)</li>
        </ul>
    </li>
    <li>
        <h3>Пример шаблона для полноэкранного показа:</h3>
        <pre>
&lt;h3>({{index}} из {{count}})&lt;/h3&gt;
&lt;a class="full-managment cancel" ng-click="unfull()"&gt;Обычный вид&lt;/a&gt;
&lt;a ng-click="prev()" class="prev nav" ng-show="nav.prev"&gt;Назад&lt;/a&gt;
&lt;a ng-click="next()" class="next nav" ng-show="nav.next"&gt;Вперед&lt;/a&gt;
&lt;label id="slideshow" for="slides"&gt;&lt;input id="slides" type="checkbox" ng-model="slideshow"/&gt;Показ
    слайдов&lt;/label&gt;
&lt;div class="fullScreenImage"&gt;
    &lt;img src="{{param.src}}" width="{{param.width}}" height="{{param.height}}" alt="" /&gt;
&lt;/div&gt;
</pre>
    </li>
    <li>
        <h3>Сектора шаблона</h3>
        Оно можно делить на сектора, которые будут сохраняться и будут доступны из callback - ков окна. Окно разбивается на сектора при помощи директивы
        ngSector. Но практически всегда придется объявлять сектор "content", именно в него будет вставляться подгруженный код. Все остальные сектора вы именнуете сами и добавляете
        как хотите.
    </li>
    <li>
        <h3>Коллекция изображений</h3>
        Для формирования коллекции однотипных изображений вам необходимо отнести их к одной группе. Делается это при помощи директивы <b>ngGroup</b>, которая вешается на элементе на котором
        инициализируется окно.
        <pre>
&lt;ul&gt;
    &lt;li ng-repeat="item in images" class="ajaxlist" ng-group="ajaxfantasy" ng-click="open($event)" id="img_ajax_{{item.id}}" img="{{item.id}}"&gt;
        &lt;img src="{{item.src}}" width="150" alt="" /&gt;
   &lt;/li&gt;
&lt;/ul&gt;
</pre>
Тут выводится список изображений, которые будут приписаны к группе <b>ajaxfantasy</b>. После открытия окна по этим эелементам будет доступна возможность переключения.
<pre>
win.open({
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
</pre>
    </li>
</ol>
