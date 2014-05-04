<?php
/**
 * Created by PhpStorm.
 * User: abaddon
 * Date: 03.05.14
 * Time: 15:56
 */
/*
$outer = '<div><img src="img/001.jpg" width="{{content.img.width}}" height="{{content.img.height}}" alt="" data-image-incontent /><div>. Nulla Nullam pellentesque feugiat turpis sit amet laoreet. Nulla tempus ipsum sed nisl mattis congue. Duis rhoncus tellus vel auctor rutrum. Nunc luctus arcu at cursus gravida. Sed condimentum elit eget neque elementum fringilla. Morbi facilisis
Nullam pellentesque feugiat turpis sit amet laoreet. Nulla tempus ipsum sed nisl mattis congue. Duis rhoncus tellus vel auctor rutrum. Nunc luctus arcu at cursus gravida. Sed condimentum elit eget neque elementum fringilla. Morbi facilisis
Nullam pellentesque feugiat turpis sit amet laoreet. Nulla tempus ipsum sed nisl mattis congue. Duis rhoncus tellus vel auctor rutrum. Nunc luctus arcu at cursus gravida. Sed condimentum elit eget neque elementum fringilla. Morbi facilisis
Nullam pellentesque feugiat turpis sit amet laoreet. Nulla tempus ipsum sed nisl mattis congue. Duis rhoncus tellus vel auctor rutrum. Nunc luctus arcu at cursus gravida. Sed condimentum elit eget neque elementum fringilla. Morbi facilisis
Nullam pellentesque feugiat turpis sit amet laoreet. Nulla tempus ipsum sed nisl mattis congue. Duis rhoncus tellus vel auctor rutrum. Nunc luctus arcu at cursus gravida. Sed condimentum elit eget neque elementum fringilla. Morbi facilisistempus ipsum sed nisl mattis congue. Duis rhoncus tellus vel auctor rutrum. Nunc luctus arcu at cursus gravida. Sed condimentum elit eget neque elementum fringilla.</div></div>';
*/
$outer = array(
    'src' => "img/" . $_POST['id'] . ".jpg",
    'params' => array(
        'title' => 'Картинка из json №' . $_POST['id'],
        'id' => $_POST['id'],
        'description' => 'amet laoreet. Nulla tempus ipsum sed nisl mattis congue. Dui'
    )
);
//echo $outer;
echo json_encode($outer);