<?php

include("opendb.php");
$courseNumber = mysql_escape_string($_POST['course_number']);
$bookIndex = mysql_escape_string($_POST['book_index']);
$chapterIndex = mysql_escape_string($_POST['chapter_index']);
$data = mysql_escape_string($_POST['data']);

$query = sprintf("SELECT * FROM `course_lessons` WHERE course_number = '%d' AND `book_index`='%d' AND `chapter_index`='%d'", $courseNumber, $bookIndex, $chapterIndex);
$results = mysql_query($query) or die(mysql_error());
$num_results = mysql_num_rows($results);
if($num_results>0){
  $row = mysql_fetch_assoc($results);
  echo $row;
}
?>