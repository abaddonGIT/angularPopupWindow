<?php
/**
 * Created by PhpStorm.
 * User: abaddon
 * Date: 03.05.14
 * Time: 15:56
 */
if ($_POST['type']) {
$outer = '<div><img src="' . $_POST['href'] . '" width="{{content.img.width}}" height="{{content.img.height}}" alt="" data-image-incontent /><div>. Nulla Nullam pellentesque feugiat turpis sit amet laoreet. Nulla tempus ipsum sed nisl mattis congue. Duis rhoncus tellus vel auctor rutrum. Nunc luctus arcu at cursus gravida. Sed condimentum elit eget neque elementum fringilla. Morbi facilisis
Nullam pellentesque feugiat turpis sit amet laoreet. Nulla tempus ipsum sed nisl mattis congue. Duis rhoncus tellus vel auctor rutrum. Nunc luctus arcu at cursus gravida. Sed condimentum elit eget neque elementum fringilla. Morbi facilisis
Nullam pellentesque feugiat turpis sit amet laoreet. Nulla tempus ipsum sed nisl mattis congue. Duis rhoncus tellus vel auctor rutrum. Nunc luctus arcu at cursus gravida. Sed condimentum elit eget neque elementum fringilla. Morbi facilisis
Nullam pellentesque feugiat turpis sit amet laoreet. Nulla tempus ipsum sed nisl mattis congue. Duis rhoncus tellus vel auctor rutrum. Nunc luctus arcu at cursus gravida. Sed condimentum elit eget neque elementum fringilla. Morbi facilisis
Nullam pellentesque feugiat turpis sit amet laoreet. Nulla tempus ipsum sed nisl mattis congue. Duis rhoncus tellus vel auctor rutrum. Nunc luctus arcu at cursus gravida. Sed condimentum elit eget neque elementum fringilla. Morbi facilisistempus ipsum sed nisl mattis congue. Duis rhoncus tellus vel auctor rutrum. Nunc luctus arcu at cursus gravida. Sed condimentum elit eget neque elementum fringilla.</div></div>';
echo $outer;
} else {

$outer = array(
    'src' => "img/" . $_POST['id'] . ".jpg",
    'params' => array(
        'content' => array(
            'id' => $_POST['id']
        ),
        'header' => array(
            'title' => 'Картинка из json №' . $_POST['id']
        ),
        'footer' => array(
            'description' => 'amet laoreet.<b>' . $_POST['id'] . '</b> Nulla tempus ipsum sed nisl mattis congue. Dui')
        )
    );
//echo $outer;

echo json_encode($outer);
}