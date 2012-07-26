<?php
include("../Include/opendb.php");
include("include/getindex.php");
mb_internal_encoding('UTF-8');
header('Content-Type: text/html; charset=UTF-8');
?>
<!DOCTYPE html>
<html>
    <head>
        <script type="text/javascript" src="js/jquery-1.7.1.min.js"></script>
        <script type="text/javascript" src="js/jquery.center.js"></script>
        <script type="text/javascript" src="js/getSelectedText.js"></script>
        <script type="text/javascript" src="js/docreate.js"></script>
        <script type="text/javascript" src="ckeditor/ckeditor.js"></script>
        <script src="johndyer-mediaelement-b090320/build/mediaelement-and-player.js" type="text/javascript"></script>
        <script type="text/javascript" src="js/TeaChaSama.js"></script>
        <script type="text/javascript" src="js/ChapterDecoder.js"></script>
        <script type="text/javascript" src="js/FixSentences.js"></script>
        <script type="text/javascript" src="js/KeyListener.js"></script>
        <script type="text/javascript" src="js/AuthoringTools.js"></script>
        <script type="text/javascript" src="bootstrap/js/bootstrap.min.js"></script>
        <!-- Time line stuff -->
        <script src="js/timeline/Cue.js"></script>
        <script src="js/timeline/WebVTT.js"></script>
        <script src="js/timeline/SRT.js"></script>
        <script src="js/timeline/Ayamel.js"></script>
        <script src="js/timeline/Text.js"></script>
        <script src="js/timeline/Caption.js"></script>
        <script src="js/timeline/Timeline.js"></script>
        <script src="js/timeline/Slider.js"></script>
        <script src="js/timeline/Placeholder.js"></script>
        <script src="js/timeline/TimelineSkin.js"></script>
        <script src="js/timeline/TimelineAction.js"></script>
        <script src="js/timeline/TimelineTracker.js"></script>
        <script src="js/timeline/TimelinePersistence.js"></script>
        <script src="js/timeline/TimelineView.js"></script>
        <script src="js/timeline/TextTrack.js"></script>
        <script src="js/timeline/WaveForm.js"></script>
        <script src="js/timeline/AudioTrack.js"></script>
        <!-- End time line stuff -->

        <script type="text/javascript" src="js/AudioClipper.js"></script>
        <script type="text/javascript" src="js/GetAudioClips.js"></script>

        <meta http-equiv="Content-Type" content="text/html;" charset="UTF-8" />
        <link href="bootstrap/css/bootstrap.css" rel="stylesheet" type="text/css" />
        <link href="css/teacha.css" rel="stylesheet" type="text/css" />
        <script type="text/javascript">
            var courseEditor;
            var COURSENUMBER = <?php echo $index['course_number']; ?>;
            var _url = {
                indexsave:'include/saveindex.php',
                lessonsave:'include/savelesson.php',
                lessonget:'include/getlesson.php',
                indexget:'include/getindex.php'
            }
            $(function(){
                $(window).resize(function(){
                    $(popdiv).fitHeight().center();
                    $(background).center();
                });
                $('#audioEditor').css('width', $(window).width()-100+'px');
                document.getElementById("popbackground").style.display = 'none';
                document.getElementById("popover").style.display = 'none';
                document.getElementById("minipop").style.display = 'none';
                $('#popbackground').click(function(){
                    $('#popover').hide();
                    $('#minipop').hide();
                    $('#popbackground').hide();
                    $('#cdFixParagraphs').hide();
                    
                });
                ChapterDecoder.init();
                $('#bookEditorTab a').click(function (e) {
                    e.preventDefault();
                    $(this).tab('show');
                });
                var str = document.getElementById('index_json_data').innerHTML;
                document.getElementById('index_json_data').innerHTML = '';
                if(str.length > 0){
                    try{
                        IndexWriter.data = JSON.parse(str);
                    }catch(e){
                        str = str.replace(/\\\'/g, '\'');
                        while(str.indexOf('\\\'')>0){
                            str = str.replace(/\\\'/g, '\'');
                        }
                        str = str.replace(/\'\'/g, '\'');
                        IndexWriter.data = JSON.parse(str);
                    }
                    console.log(IndexWriter.data);
                }
                IndexWriter.coursenum = COURSENUMBER;
                courseEditor = new CourseEditor(_url);
                $('#saveIndex').click(function(e){
                    var string = JSON.stringify(IndexWriter.data);
                    var data = {
                        course_number:COURSENUMBER,
                        data:string
                    };
                    console.log(data);
                    IndexWriter.save({
                        url: _url.indexsave,
                        data: data
                    }); 
                    e.preventDefault();     
                });
                $('#saveLessons').click(function(e){
                    $('#saveIndex').trigger('click');
                    console.log('saving lessons');
                    
                    for(i=0;i<LessonWriter.data.chapter.length;i++){
                        var string = JSON.stringify(LessonWriter.data.chapter[i]);
                        var data = {
                            cnum: COURSENUMBER,
                            bki:LessonWriter.data.chapter[i].book,
                            chi: LessonWriter.data.chapter[i].index,
                            dat: string
                        };
                        console.log(data);
                        LessonWriter.save({
                            url: _url.lessonsave,
                            data: data
                        });
                    }
                    
                    e.preventDefault();
                });
            });
        </script>
    </head>
    <body>
        <div class="navbar ">
            <div class="navbar-inner">
                <div class="container">
                    <a class="brand" href="#">
                        Tea-Cha様 Admin
                    </a>
                    <ul class="nav pull-right">
                        <li><a href='#' id="saveIndex">Save Index</a></li>
                        <li><a href='#' id="saveLessons">Save Everything</a></li>
                        <li><a href='#' id="goHome">Main Menu(ホーム)</a></li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="container-fluid">
            <div class="row-fluid">
                <div id="adminDiv">
                    <div class="tabbable tabs-left">
                        <ul class="nav nav-tabs" id="bookEditorTab">
                            <li id="addbook"><a><center><i class="icon icon-plus-sign addBookIcon"></i></center></a></li>
                        </ul>
                        <div class="tab-content" id="chapterEditorTab">
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="" id="audioEditor">
            <h4 class="row" id="audioPrevLine" style="margin-left:50px;margin-top:50px;"></h4>
            <div class="row">
                <div id="audiowrapper"></div>
                <!--div class="progress progress-striped active">
                    <div class="bar" style="width:0%;" id="audioProgress""></div>
                </div-->
                <br><br>
                <div class="btn-group" id="audioEditorButtonGroup">
                    <button class="btn btn-inverse" id="playbtn" title="Play"><i class="icon-play icon-white"></i></button>
                    <button class="btn btn-inverse" id="pausebtn" title="Pause"><i class="icon-pause icon-white"></i></button>
                    <button class="btn  btn-primary" id="createbtn" title="Add Captions"><i class="icon-plus icon-white"></i>Create</button>
                    <button class="btn  btn-info" id="selectbtn" title="Select caption"><i class="icon-hand-up icon-white"></i> Select</button>
                    <button class="btn btn-warning" id="movebtn" title="Move"><i class="icon-move icon-white"></i> Move</button>
                    <button class="btn btn-warning" id="resizebtn" title="Resize"><i class="icon-resize-horizontal icon-white"></i> Resize</button>
                    <button class="btn btn-warning" id="scrollbtn" title="Scroll"><i class="icon-resize-horizontal icon-white"></i>(Q)Scroll</button>
                    <button class="btn  btn-success" id="undobtn" title="Undo"><i class="icon-chevron-left icon-white"></i> Undo</button>
                    <button class="btn btn-danger" id="deletebtn" title="Delete Captions"><i class="icon-trash icon-white"></i> Delete</button>
                    <button class="btn btn-danger" id="wavebtn" title="Show waveform"><i class="icon-fire icon-white"></i>WaveForm</button>
                    <button class="btn" id="finishedbtn" title="Delete Captions"><i class="icon-ok"></i>Finished</button>

                </div>
                <div  id="timeline"></div>
                <div class="well span6" id="audioEditorLines">
                    <h3 id="audioCurrentLine"></h3>
                    <h4 class="greyedOut" id="audioNextLine"></h4>
                </div>
            </div>

        </div>
        <div class="translucent" id="popbackground"></div>
        <div class="row rounded-white span12" id="popover">
            <div id="chapterdecoder">
                <div id="cdenterText">
                    <h3 id="cdinstructions">Please Provide the text of the Lesson.</h3>
                    <div class="row" id="cdEnterRow">
                        <span class="span5" id="enwell">
                            <h4>English Text</h4>
                            <textarea id="entext" height="300px"></textarea>

                        </span>
                        <span class="span5" id="jawell" style="position:relative;left: 50px">
                            <h4>Translation Text</h4>
                            <textarea id="jatext" height="300px" ></textarea>
                        </span>
                        <button class="btn btn-large btn-primary" id="cdEnterTextButton">Continue</button>
                    </div>

                </div>
                <div id="cdFixParagraphs" style="display:none">
                    <div id="fixerInstruction">
                        <h4>Here we have unmatched sentences. Align them</h4>

                        <div class="well" id="fixerMessage">
                            <span class="badge badge-info">Click <i class="icon-hand-up"></i>To Recombine Up.</span>
                            <span class="badge badge-info">Click<i class="icon-resize-horizontal"></i>To Split a sentence</span><br/>
                        </div>
                    </div>
                    <div class="row">
                        <div class="well span5">
                            <ul class="nav nav-list" id="fixLeftNav">
                                <li class="nav-header" id="fixLeftNavHeader"></li>
                            </ul>
                        </div>
                        <div class="well span5">
                            <ul class="nav nav-list" id="fixRightNav">
                                <li class="nav-header" id="fixRightNavHeader"></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="row rounded-white span12" id="minipop"></div>
        <div id="index_json_data" style="display:none"><?php echo $index['index_data']; ?></div>
    </body>
</html>
