<?php
include("../../Include/opendb.php");
 mb_internal_encoding( 'UTF-8' );
 header( 'Content-Type: text/html; charset=UTF-8' );
$courseNumber = mysql_escape_string($_GET['course']);
$bookIndex = mysql_escape_string($_GET['book']);
$chapterIndex = mysql_escape_string($_GET['chapter']);
$query = sprintf("SELECT * FROM `course_lessons` WHERE course_number = '%d' AND `book_index`='%d' AND `chapter_index`='%d'", $courseNumber, $bookIndex, $chapterIndex);
mysql_query('SET NAMES utf8');
$results = mysql_query($query) or die(mysql_error());
$num_results = mysql_num_rows($results);
if($num_results>0){
  $row = mysql_fetch_assoc($results);
  echo $row['lesson_data'];
}
?>
