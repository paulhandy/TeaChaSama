
 <?php
        $dbhost = 'localhost';
        $dbuser = 'eego_user';
        $dbpass = 'use_site';

if (!$con)
{
        $con = mysql_connect($dbhost, $dbuser, $dbpass);


        if (!$con)
          {
          die('Could not connect: ' . mysql_error());
          }

        mysql_select_db("eegodb", $con);
}
        /* Sets the session variable, associated to whoever is logged on
        */

        if(!isset($_SESSION["Session_Var"]))
                {
                        session_register("Session_Var");
                        $_SESSION["Session_Var"]->set = 1;
                }

        $Session_Var = &$_SESSION["Session_Var"];
        if ($Session_Var->user_group == "") $Session_Var->user_group = 4;

        // some code
?>


