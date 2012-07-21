<?php

include("../../Include/opendb.php");
$courseNumber = mysql_escape_string($_POST['cnum']);
$bookIndex = mysql_escape_string($_POST['bki']);
$chapterIndex = mysql_escape_string($_POST['chi']);
$data = mysql_escape_string($_POST['dat']);
$data = str_replace("'", "\'", $data);
$query = sprintf("SELECT * FROM `course_lessons` WHERE course_number = '%d' AND `book_index`='%d' AND `chapter_index`='%d'", $courseNumber, $bookIndex, $chapterIndex);
$results = mysql_query($query) or die(mysql_error());
$num_results = mysql_num_rows($results);
if ($num_results > 0) {    
    $query = sprintf("UPDATE `course_lessons` SET `lesson_data` = '%s' WHERE `course_number`= '%d' AND `book_index`='%d' AND `chapter_index`='%d'", $data, $courseNumber, $bookIndex, $chapterIndex);
    $result = mysql_query('SET NAMES utf8');
    $results = mysql_query($query) or die(mysql_error());
    echo $results;
} else {
    $query = sprintf("INSERT INTO `course_lessons` (`course_number`, `book_index`, `chapter_index`, `lesson_data`) values ('%d', '%d', '%d', '%s')", $courseNumber, $bookIndex, $chapterIndex, $data);
    $result = mysql_query('SET NAMES utf8');
    $results = mysql_query($query) or die(mysql_error());
    echo $results;
}
?>
