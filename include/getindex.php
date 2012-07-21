<?php
include("opendb.php");
$courseNumber = mysql_escape_string($_GET['course']);

$query = sprintf("SELECT * FROM `courses` WHERE course_number = '%d'", $courseNumber);
$results = mysql_query($query) or die(mysql_error());
$num_results = mysql_num_rows($results);
if($num_results>0){
  $index = mysql_fetch_assoc($results);
  $index;
}

?>