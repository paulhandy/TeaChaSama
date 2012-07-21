<?php
/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
?>
<!DOCTYPE html>
<html>
    <head>
        <script type="text/javascript" src="js/jquery-1.7.1.min.js"></script>
        <script type="text/javascript" src="ckeditor/ckeditor.js"></script>
        <script type="text/javascript" src="js/TeaChaSama.js"></script>
        <script type="text/javascript" src="js/AuthoringTools.js"></script>

        <script type="text/javascript" src="bootstrap/js/bootstrap.min.js"></script>
        <script src="johndyer-mediaelement-b090320/build/mediaelement-and-player.js" type="text/javascript"></script>
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
        <link rel="stylesheet" href="johndyer-mediaelement-b090320/build/mediaelementplayer.css" />
        <meta http-equiv="Content-Type" content="text/html;" charset="UTF-8" />
        <link href="bootstrap/css/bootstrap.css" rel="stylesheet" type="text/css" />
        <link href="css/teacha.css" rel="stylesheet" type="text/css" />
        <script type="text/javascript">
            var audioclipper ;
            $(function() {

                var url = 'nov10-9.ogg';
                audioclipper = new AudioClipper({
                    audio: {
                        filename: url
                    },
                    paragraph: [{
                            line: [{
                                    text: 'Those of us who come to this pulpit during conference feel the power of your prayers.'
                                }, {
                                    text: 'We need them, and we thank you for them.'
                                }]
                        }, {
                            line: [{
                                    text: 'Our Father in Heaven understood that for us to make desired progress during our mortal probation, we would need to face difficult challenges.'
                                }]
                        }]
                });
                audioclipper.setAudioDiv();
                audioclipper.decodeLineSet();
                audioclipper.setListeners();

                
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
                        <li><a href='#' id="goHome">Main Menu(ホーム)</a></li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="container-fluid" style="text-align:center">

            <div>
                <div id="audiowrapper">
                    
                </div>
                <br><br>
                <div class="btn-group">
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
                <div class="well span6">
                    <h3 id="audioCurrentLine"></h3>
                    <h4 class="greyedOut" id="audioNextLine"></h4>
                </div>
            </div>
        </div>
    </body>
</html>

