<?php

include("../../Include/opendb.php");
$courseNumber = mysql_escape_string($_POST['course_number']);
$data = mysql_escape_string($_POST['data']);
$query = sprintf("SELECT * FROM `courses` WHERE course_number = '%d'", $courseNumber);
$results = mysql_query($query) or die(mysql_error());
$num_results = mysql_num_rows($results);

if($num_results >0){
    
    $query = sprintf("UPDATE `courses` SET `index_data` = '%s' WHERE `course_number`= '%d'", $data, $courseNumber);
    $result = mysql_query('SET NAMES utf8');
    $results = mysql_query($query) or die(mysql_error());
}else{
    $query = sprintf("INSERT INTO `courses` (`index_data`) values ('%d', '%s')", $data);
    $result = mysql_query('SET NAMES utf8');
    $results = mysql_query($query) or die(mysql_error());
    echo $results;
}

?>
