<?php
include("../Include/opendb.php");
include("include/getindex.php");
?>
<!DOCTYPE html>
<html>
    <head>
        <script type="text/javascript" src="js/jquery-1.7.1.min.js"></script>
        <script type="text/javascript" src="ckeditor/ckeditor.js"></script>
        <script src="johndyer-mediaelement-b090320/build/mediaelement-and-player.js" type="text/javascript"></script>
        <link rel="stylesheet" href="johndyer-mediaelement-b090320/build/mediaelementplayer.css" />
        <script type="text/javascript" src="js/TeaChaSama.js"></script>
        <script type="text/javascript" src="bootstrap/js/bootstrap.min.js"></script>
        <meta http-equiv="Content-Type" content="text/html;" charset="UTF-8" />
        <link href="bootstrap/css/bootstrap.css" rel="stylesheet" type="text/css" />
        <link href="css/teacha.css" rel="stylesheet" type="text/css" />
        <script type="text/javascript">
            var bookshelf;
            $(function(){
                var str = document.getElementById('indexJSONDiv').innerHTML;
                document.getElementById('indexJSONDiv').innerHTML = '';
                bookshelf = new BookShelf();
                bookshelf.databaseIndexParser(str);
                $('#bookNav').append(bookshelf.getIndexHtml());
                $('#bookNav .nav a').click(function (e) {
                    e.preventDefault();
                    console.log(this);
                    $(this).tab('show');
                });
                
            });
            
            
            
        </script>
    </head>
    <body>
        <div class="navbar ">
            <div class="navbar-inner">
                <div class="container">
                    <a class="brand" href="#">
                        Tea-Cha様
                    </a>
                    <ul class="nav pull-right">
                        <li><a href='#' id="goHome">Main Menu(ホーム)</a></li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="container-fluid">

            <div class="row-fluid">
                <div id="bookNav">
                </div>
                <div id="lessonDiv">
                    <div class="span4">
                        <div id="audioDiv" style="position:fixed;top:50px;left:20px;"></div>
                    </div>
                    <div class="span9" id="lesson-content-wrapper">
                        <h1 id="lesson-title"></h1>
                        <h5 id="lesson-author"></h5>
                        <article id="lesson-article" class="span8 well" style="display:none;"></article>
                    </div>
                    
                </div>

            </div>
        </div>
        <div style="display:none" id="indexJSONDiv"><?php echo $index['index_data']; ?></div>
    </body>
</html>
