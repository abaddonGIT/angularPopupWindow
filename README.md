angularPopupWindow (alpha version 2.0)
==================

Скрипт модального окна на angular js. (IE9 и выше, Opera, Firefox, Chrome, Safary)
<b><a href="http://angular.demosite.pro/popup/" target="_blank">Демка</b></a>
<ol>
    <li>
        <h3>Установка:</h3>
        <pre>var app = angular.module('app', ['popupWindow']);</pre>
    </li>
    <li>
        <h3>В шаблоне:</h3>
        В html шаблон необходимо поместить элемент, в который будет подгруженно окно
        <pre>
//Вызывается один раз на странице
&lt;div ng-popup-win &gt;&lt;/div&gt;
</pre>
        Примеры элементов с вызовом
        <pre>
&lt;a href="img/1.jpg" ng-click="open($event)" id="test1"&gt;
    &lt;img src="img/1.jpg" alt="" width="150" /&gt;
&lt;/a&gt;
</pre>
    </li>
    <li>
        <h3>В контроллере:</h3>
        Для начала необходимо проинициализировать модуль:
        <pre>
app.controller("baseController", ['$scope', '$popupWindow', function ($scope, $popupWindow) {
    $scope.open = function (e) {
        e.preventDefault();
        var elem = e.currentTarget;
        $popupWindow.open({
            target: elem
        });
    }
}]);
</pre>
        Для открытия окна используется ф-я <b>open</b>. Параметры вызова:
        <ul>
            <li>
                <b>href</b> - сюда  может быть передан либо url для ajax запроса, либо адрес картинки (если не задан аттрибут target),
                либо адрес контента для вставки;
            </li>
            <li>
                <b>target</b> - html элемент, на котором было вызвано окно;
            </li>
            <li>
                <b>source</b> - имя аттрибута, откуда будет браться адрес запроса (по умолчанию href);
            </li>
            <li>
                <b>imageClass</b> - имя класса, который должен присутствовать у картинки, полученной в виде html кода и которая должна резайзиться (по умолчанию resize);
            </li>
            <li>
                <b>keyControll</b> - разрешает пагинаю при помощи клавиш;
            </li>
            <li>
                <b>resizeDelay</b> - задержка между пересчетами размера окна (по умолчанию 100);
            </li>
            <li>
                <b>resize</b> - нужен ли резайз окна в зависимости от разрешения монитора (true - default, false);
            </li>
            <li>
                <b>padding</b> - внутренний отступ (15px - default);
            </li>
            <li>
                <b>margin</b> - отступ от верхнего края монитора;
            </li>
            <li>
                <b>outPadding</b> - отступы справа и слева от контента окна до границ монитора, при котором начинается ресайз;
            </li>
            <li>
                <b>type</b> - тип вызываемого окна (image - default, ajax, inline);
            </li>
            <li>
                <b>innerTpl</b> - шаблон внутренней части окна;
            </li>
            <li>
                <b>fullScreenTpl</b> - шаблон для полноэкранного режима просмотра (полноэкранный режим реализован при помощи FullScreenAPI HTML5);
            </li>
            <li>
                <b>maxSizes</b> - максимальные размеры окна ({
                                width: 1024,
                                height: 768
                                } - default. Если параметр resize - false, то по этим размерам строится окно);
            </li>
            <li>
                <b>minSizes</b> - {
                                width: 640,
                                height: 480
                                } - минимальные размеры окна;
            </li>
            <li>
                <b>ajax</b> - параметры для ajax-запроса (такие же как $http, кроме параметра url, в качестве его используется параметр вызова <b>href</b> для <b>type</b> - "ajax");
            </li>
            <li><b>requestParam</b> - параметры, которые в зависимости от типа вызова окна попадут либо в объект
                                окна, для типа image, либо будут добавлены к запросу, для типа ajax (Пример: {title: "Ежик в
                                тумане"});
            </li>
            <li><b>pushState</b> - Если стоит true, то для открытого окна будет формироваться url, который позволит восcтановить его после обновления страницы (Это будет работать при условии,
            что у элемента, на котором было вызвано окно, имеется уникальный аттрибут <b>id</b>, так же обязательно должен быть передан параметр <b>target</b>);
            </li>
            <li>
               <b>effect</b> - Эффект открытия окна (так же распостраняется и на пагинацию. От 1 до 5);
            </li>
            <li><b>beforeContentLoaded</b> - ф-я, которая отрабатывает перед получением контента и его вставки в окно (ф-я получает объект вызыва и объекты секторов окна);</li>
            <li><b>beforePagination</b> - ф-я отрабатывает перед перелистыванием между картинками (ф-я получает объект слудующего элемента и объекты секторов окна);</li>
            <li><b>afterContentLoaded</b> - ф-я отрабатывает после прогрузки и вставки контента в окно (ф-я получает текущий объект, объекты секторов окна и сырой результат запроса);</li>
            <li><b>afterClose</b> - ф-я отрабатывает после закрытия окна (ф-я получает текущий объект, объекты секторов окна);</li>
            <li><b>winResize</b> - ф-я отрабатывает при пересчете размера окна (ф-я получает текущий объект, объекты секторов окна и новые размеры).</li>
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
Стандартные методы окна доступные в его шаблонах
    <ul>
        <li>
            <b>prev</b> - следующий слайд;
        </li>
        <li>
            <b>next</b> - предыдущий слайд;
        </li>
        <li>
            <b>close</b> - закрывает окно;
        </li>
        <li>
            <b>full</b> - переводит окно в полноэкранный режим;
        </li>
        <li>
            <b>unfull</b> - выход из полноэкранного режима.
        </li>
    </ul>
    Вы так же можете создавать свои ф-и и вешать их на элементы окна. Выглядеть это будет примерно так
    <pre>
//Это событие наступает когда был создан объект окна
$scope.$on("win:ready", function (e, win) {
   var sc = win.config.sc;
   sc.testFunc = function () {
        console.log("Я буду работать внутри окна!");
   };
});
</pre>
    Список стандартных переменных:
        <ul>
            <li><b>nav.prev</b> - показывает, есть ли предыдущий элемент;</li>
            <li><b>nav.next</b> - показывает, есть ли следующий элемент;</li>
            <li><b>index</b> - порядковый номер текущего эемента в наборе;</li>
            <li><b>count</b> - общее кол-во элементов в наборе;</li>
            <li><b>param</b> - сюда попадают все остальные переменные, полученные окном (например при типе "image", param.width и param.height представляют собой размеры картинки).</li>
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
        Шаблон окна можно разделить на сектора, которые будут сохраняться и будут доступны из callback - ков. Окно разбивается на сектора при помощи директивы
        ngSector. Но практически всегда придется объявлять сектор "content", именно в него будет вставляться подгруженный код. Все остальные сектора вы именуете сами и добавляете
        как хотите.
    </li>
    <li>
        <h3>Коллекция изображений</h3>
        Для формирования коллекции однотипных изображений вам необходимо отнести их к одной группе. Делается это при помощи директивы <b>ngGroup</b>, которая вешается на элементе, на котором
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
<hr />
angularPopupWindow (alpha version 2.0)
==================

Modal window script on angular js. (IE9 and higher, Opera, Firefox, Chrome, Safary)
<b><a href="http://angular.demosite.pro/popup/" target="_blank">Demo</b></a>
<ol>
    <li>
        <h3>Installation:</h3>
        <pre>var app = angular.module('app', ['popupWindow']);</pre>
    </li>
    <li>
        <h3>Call in template:</h3>
        <pre>
//Is called once on page
&lt;div ng-popup-win &gt;&lt;/div&gt;
</pre>
        Examples of called elements
        <pre>
&lt;a href="img/1.jpg" ng-click="open($event)" id="test1"&gt;
    &lt;img src="img/1.jpg" alt="" width="150" /&gt;
&lt;/a&gt;
</pre>
    </li>
    <li>
        <h3>In controller:</h3>
        For the first you should initialize the module:
        <pre>
app.controller("baseController", ['$scope', '$popupWindow', function ($scope, $popupWindow) {
    $scope.open = function (e) {
        e.preventDefault();
        var elem = e.currentTarget;
        $popupWindow.open({
            target: elem
        });
    }
}]);
</pre>
        Function <b>open</b> used for opening the window. Function parameters are:
        <ul>
            <li>
                <b>href</b> - here can be send url for ajax query, or picture address (if attribute 'target' is not set), or content address for insert;
            </li>
            <li>
                <b>target</b> - element on which window was called;
            </li>
            <li>
                <b>source</b> - name of attribute from which address of query will be set (by default href);
            </li>
            <li>
                <b>imageClass</b> - class name for picture in html code which will be resided (by default resize);
            </li>
            <li>
                <b>keyControll</b> - pagination by keyboard is allowed; 
            </li>
            <li>
                <b>resizeDelay</b> - delay before re-calculations of window size (by default 100);
            </li>
            <li>
                <b>resize</b> - indicates if resize of window is needed in depend on display resolution (true(default) or false);
            </li>
            <li>
                <b>padding</b> - padding (15px - default);
            </li>
            <li>
                <b>margin</b> - margin from top of display;
            </li>
            <li>
                <b>outPadding</b> - left and right margins from content to display bounds in which resize is occured; 
            </li>
            <li>
                <b>type</b> - type of called window (image - default, ajax, inline);
            </li>
            <li>
                <b>innerTpl</b> - template of inner part of window; 
            </li>
            <li>
                <b>fullScreenTpl</b> - template for full-screen mode (full-screen mode is implemented with FullScreenAPI HTML5);
            </li>
            <li>
                <b>maxSizes</b> - maximum size of window ({ width: 1024, height: 768 } - default. If parameter resize is false, then window is displayed according to these sizes); 
            </li>
            <li>
                <b>minSizes</b> { width: 640, height: 480 } - minimum size of window;
            </li>
            <li>
                <b>ajax</b> - parameters for ajax-query (the same as <b>$http</b>, except parameter url, instead of which parameter <b>href</b> is used for type - "ajax");
            </li>
            <li><b>requestParam</b> - parameters which will be added in depend on type of window call to object type (for type image) or to query (for ajax type) (Example: {title: "Fire in the hole"});
            </li>
            <li><b>pushState</b> - if this parameter is true, then for the opened window url will be generated, which than allow as to restore it after page refresh (it works only on conditions that element on which window is called has unique attribute id, also it is necessary to send parameter target);
            </li>
            <li>
               <b>effect</b> - effect of opening window (also extended on pagination. Ranged from 1 to 5);
            </li>
            <li><b>beforeContentLoaded</b> - function-event which is called before receiving content and inserting it in window (function receives call object and objects of window sectors);</li>
            <li><b>beforePagination</b> - function is called before pagination;</li>
            <li><b>afterContentLoaded</b> - function is called after content is loaded;</li>
            <li><b>afterClose</b> - function is called after window closure;</li>
            <li><b>winResize</b> - function is called when window size is changed (function receives current object, objects of window sectors and new sizes of window).</li>
        </ul>
    </li>
    <li>
        <h3>Example of inner template of window:</h3>
        <pre>
&lt;div id="content"&gt;
   &lt;div ng-sector="header"&gt;
        &lt;h1&gt;{{param.title}}&lt;/h1&gt;
        &lt;a ng-click="close()"&gt;Close&lt;/a&gt;
        &lt;a class="nav-prev" ng-show="nav.prev" ng-click="prev()"&gt;Previous&lt;/a&gt;
        &lt;a class="nav-next" ng-show="nav.next" ng-click="next()"&gt;Next&lt;/a&gt;
    &lt;/div&gt;
    &lt;div ng-sectors="content"&gt;
       &lt;img src="{{param.src}}" width="{{param.width}}" height="{{param.height}}" alt="" /&gt;
    &lt;/div&gt;
    &lt;div ng-sectors="footer"&gt;
        &lt;a ng-click="full()"&gt;Fullscreen-mode&lt;/a&gt;
        {{index}} - {{count}}
    &lt;/div&gt;
&lt;/div&gt;
</pre>
Standard methods:
    <ul>
        <li>
            <b>prev</b> - get previous slide;
        </li>
        <li>
            <b>next</b> - get next slide;
        </li>
        <li>
            <b>close</b> - closing of current window;
        </li>
        <li>
            <b>full</b> - turn on full-screen mode;
        </li>
        <li>
            <b>unfull</b> - turn off full-screen mode.
        </li>
    </ul>
    You also can create your own functions and call them in window template. It is implemented like this:
    <pre>
//This event occur when window object is initialized
$scope.$on("win:ready", function (e, win) {
   var sc = win.config.sc;
   sc.testFunc = function () {
        console.log("I will work inside the window!");
   };
});
</pre>
    List of standard variables:
        <ul>
            <li><b>nav.prev</b> - is TRUE when previous element is exist;</li>
            <li><b>nav.next</b> - is TRUE when next element is exist;</li>
            <li><b>index</b> - index of element in set;</li>
            <li><b>count</b> - count of elements in set</li>
            <li><b>param</b> - variables received by window.</li>
        </ul>
    </li>
    <li>
        <h3>Full-screen mode template example:</h3>
        <pre>
&lt;h3>({{index}} of {{count}})&lt;/h3&gt;
&lt;a class="full-managment cancel" ng-click="unfull()"&gt;Standard view&lt;/a&gt;
&lt;a ng-click="prev()" class="prev nav" ng-show="nav.prev"&gt;Previous&lt;/a&gt;
&lt;a ng-click="next()" class="next nav" ng-show="nav.next"&gt;Next&lt;/a&gt;
&lt;label id="slideshow" for="slides"&gt;&lt;input id="slides" type="checkbox" ng-model="slideshow"/&gt;Slideshow&lt;/label&gt;
&lt;div class="fullScreenImage"&gt;
    &lt;img src="{{param.src}}" width="{{param.width}}" height="{{param.height}}" alt="" /&gt;
&lt;/div&gt;
</pre>
    </li>
    <li>
        <h3>Template sectors</h3>
        Template can be split into sectors, which can be accessible by functions defined above (beforeContentLoaded etc). Template is split by using directive ngSector.
    </li>
    <li>
        <h3>Image collection</h3>
        For generation collection of single-type images it is necessary to relate them to one group. You can do it by using directive ngGroup, which is called from element, on which window is initialized. 
        <pre>
&lt;ul&gt;
    &lt;li ng-repeat="item in images" class="ajaxlist" ng-group="ajaxfantasy" ng-click="open($event)" id="img_ajax_{{item.id}}" img="{{item.id}}"&gt;
        &lt;img src="{{item.src}}" width="150" alt="" /&gt;
   &lt;/li&gt;
&lt;/ul&gt;
</pre>
Here list of images, which are related to group ajaxfantasy, is outputted. After opening the window these images can be switched by each other.
<pre>
win.open({
    target: elem,
    type: 'image',
    pushState: true,
    source: 'data-src',
    beforeContentLoaded: function (eventName, win, sectors) {
        win.requestParam = {
            title: "Title was changed in event beforeContentLoaded"
        };
    }
});
</pre>
    </li>
</ol>