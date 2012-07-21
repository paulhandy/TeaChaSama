/* 
 * Purpose of this is to align audio with lines in the text.
 */
function AudioClipper(data){
    this.chapter = data;
    this.lineSet = [];
    this.audioTrack = '';
    this.media = null;
    this.wrapper = document.getElementById('audioEditor');
    this.index = {
        line:0
    };
    this.activeSegments = [];
    this.timeline = null;
    this.segmentCount = 0;
    this.rewriteIndex = [];
    var _timeline, xhr, _url, texttrack, proto = this, isVisible;
    var  _audio, _source1, _source2, _currentLine, _nextLine, 
    //_audioProgress = document.getElementById('audioProgress'), 
    _audioPrevLine = document.getElementById('audioPrevLine'), 
    _btnwrapper = document.getElementById('audioEditorButtonGroup'), 
    _linewrapper = document.getElementById('audioEditorLines');
    _currentLine = document.getElementById('audioCurrentLine');
    _nextLine = document.getElementById('audioNextLine');
    _timeline = document.getElementById('timeline');
    this.hasWave = false;
    this.decodeLineSet = function(){
        var i, j, k=0;
        for(i=0;i<this.chapter.paragraph.length;i++){
            for(j=0;j<this.chapter.paragraph[i].line.length;j++){
                this.chapter.paragraph[i].line[j].index = k;
                this.lineSet[k] = (this.chapter.paragraph[i].line[j]);
                k++;
            }
        }
    };
    this.hide = function(){
        document.getElementById('popbackground').style.display = 'none';
        this.wrapper.style.top = '-10000px';
        this.wrapper.style.left="-10000px";
        this.timeline.removeAudioTrack('audiofile');
    };
    this.show = function(){
        this.wrapper.style.zIndex = 750;
        this.wrapper.style.height = _timeline.offsetHeight+_linewrapper.offsetHeight+_btnwrapper.offsetHeight+'px';
        $(this.wrapper).center();
        this.wrapper.style.top = '50px';
        _btnwrapper.style.display = 'block';
        _linewrapper.style.display = 'block';
        
    };
    this.setAudioDiv = function(){
        var typeGiven = proto.chapter.audio.filename.substr(proto.chapter.audio.filename.length-3, 3);
        var nameOfFile = proto.chapter.audio.filename.substr(0, proto.chapter.audio.filename.length-4);
        var alternate = typeGiven == 'mp3'? nameOfFile+'.ogg':nameOfFile+'.mp3';
        _audio = document.createElement('audio');
        _audio.setAttribute('src', proto.chapter.audio.filename);
        document.getElementById('audiowrapper').appendChild(_audio);
        _audio.load();
        setTimeout(proto.clipMedia, 50);
        _audio.addEventListener("load", function() {
            console.log('audio loaded');
            
        }, true);
    };
    this.addClipData = function(seg){
        
        if(this.index.line < this.lineSet.length || this.rewriteIndex.length > 0){
            if(!this.media.paused){
                proto.timeline.currentTime = seg.startTime;
                this.media.setCurrentTime(seg.startTime);
            }
            if(this.rewriteIndex.length > 0){
                var i = this.rewriteIndex.pop();
                seg.text = this.lineSet[i].text;
                seg.audioIndex = this.lineSet[i].index;
            }else{
                seg.text = this.lineSet[this.index.line].text;
                seg.audioIndex = this.lineSet[this.index.line].index;
                this.index.line++;
            }
            _audioPrevLine.innerHTML = seg.text;
        }else{
            this.timeline.tracker.undo();
        }
    };
    this.displayNextTwoLines = function(){
        if(this.lineSet.length > this.index.line){
            _currentLine.innerHTML = this.lineSet[this.index.line].text;
            if(this.lineSet.length-1> this.index.line){
                _nextLine.innerHTML = this.lineSet[this.index.line+1].text;
            }else{
                _nextLine.innerHTML = '';
            }
        }else{
            _currentLine.innerHTML = '';
            _nextLine.innerHTML = '';
        }
        if(this.rewriteIndex.length>0){
            _currentLine.innerHTML = this.lineSet[this.rewriteIndex[this.rewriteIndex.length-1]].text;
        }
        this.wrapper.style.height = _timeline.offsetHeight+_linewrapper.offsetHeight+_btnwrapper.offsetHeight+100+'px';
    };
    this.clipMedia = function(){
        $(_audio).mediaelementplayer({
            success: function (mediaElement, domObject) {
                proto.media = mediaElement;
                mediaElement.style.width = '1px';
                mediaElement.style.height = '1px';
                mediaElement.style.opacity = '0';
                proto.timeline = new Timeline(_timeline, {
                    length: mediaElement.duration,
                    start: 0,
                    end: 60
                });
                
                texttrack = 'audio-clip-track';
                window.setInterval(proto.findDeletedSentence, 500);
                proto.timeline.addTextTrack([], texttrack, "en");
                //create, select, move, etc.
                proto.timeline.currentTool = Timeline.CREATE;
                mediaElement.addEventListener('timeupdate', function(){
                    proto.timeline.currentTime = mediaElement.currentTime;
                }, false);
                proto.timeline.on('jump', function(time){
                    mediaElement.setCurrentTime(time);
                });
                proto.timeline.on('select', function(seg){
                    if(proto.timeline.tracks[0].segments.length>proto.segmentCount){
                        if(Math.abs(seg.endTime - seg.startTime) > .001){
                            proto.addClipData(seg);
                        }else{
                            proto.timeline.tracker.undo();
                        }
                        proto.segmentCount = proto.timeline.tracks[0].segments.length;
                    }
                    proto.displayNextTwoLines();       
                    
                });

            }
        });      
    };
    this.getWaveForm = function(){
        console.log('preparing waveform');
        xhr = new XMLHttpRequest();
        xhr.responseType = 'arraybuffer';
        xhr.open('GET', proto.chapter.audio.filename);
        xhr.onreadystatechange = function(){
            if(this.readyState==4){
                if(this.status>=200 &&  this.status<400){
                    document.body.style.cursor = 'progress';
                    decodeAudio(this.response);
                }else{
                    console.log('error found in loading. no audio for u');
                }
            }
            function decodeAudio(response){
                (new webkitAudioContext).decodeAudioData(response, function(buffer) {
                    console.log("Decoded");
                    var wave = new WaveForm(
                        proto.timeline.width,
                        proto.timeline.trackHeight,
                        1, //buffer.numberOfChannels,
                        buffer.sampleRate
                        );
                    wave.addFrame(buffer.getChannelData(0));
                    console.log("loaded");
                    document.body.style.cursor = 'auto';
                    proto.timeline.addAudioTrack(wave,'audiofile');
                    proto.timeline.setAudioTrack(texttrack,'audiofile');
                }, function(err, msg){
                    console.log(err);
                    console.log(msg);
                    document.body.style.cursor = 'auto';
                });
            }
        };
        xhr.send();
        proto.hasWave = true;
    }
    this.setListeners = function(){
        prevOnKeyPress = document.onkeypress;
        document.onkeypress = this.keyListener;
        document.getElementById('playbtn').addEventListener('click', function(){
            proto.media.play();
        }, false);
        document.getElementById('pausebtn').addEventListener('click', function(){
            proto.media.pause();
        }, false);
        document.getElementById('createbtn').addEventListener('click', function(){
            proto.timeline.currentTool = Timeline.CREATE;
        }, false);
        document.getElementById('selectbtn').addEventListener('click', function(){
            proto.timeline.currentTool = Timeline.SELECT;
        }, false);
        document.getElementById('movebtn').addEventListener('click', function(){
            proto.timeline.currentTool = Timeline.MOVE;
        }, false);
        document.getElementById('resizebtn').addEventListener('click', function(){
            proto.timeline.currentTool = Timeline.RESIZE;
        }, false);
        document.getElementById('scrollbtn').addEventListener('click', function(){
            proto.timeline.currentTool = Timeline.SCROLL;
        }, false);
        document.getElementById('undobtn').addEventListener('click', proto.backtrack, false);
        document.getElementById('deletebtn').addEventListener('click', function(){
            proto.timeline.currentTool = Timeline.DELETE ;
        }, false);
        document.getElementById('finishedbtn').addEventListener('click', function(){
            proto.checkFinished();
            proto.hide();
        }, false);
        document.getElementById('wavebtn').addEventListener('click', function(){
            if(!proto.hasWave){
                proto.getWaveForm();
            }
        }, false);
        
        _audio.addEventListener("timeupdate", function() {
            proto.timeline.currentTime = proto.media.currentTime;
        },false);
    };
    this.keyListener = function(e){
        if(e.keyCode == 32){
            if(proto.media.paused){
                proto.media.play();
            }else{
                proto.media.pause();
            }
            e.preventDefault();
            _timeline.focus();
        }
        switch(String.fromCharCode(e.charCode).toLocaleUpperCase()){
            case 'C':
                proto.timeline.currentTool = Timeline.CREATE;
                break;
            case 'S':
                proto.timeline.currentTool = Timeline.SELECT;
                break;
            case 'M':
                proto.timeline.currentTool = Timeline.MOVE;
                break;
            case 'R':
                proto.timeline.currentTool = Timeline.RESIZE;
                break;
            case 'Q':
                proto.timeline.currentTool = Timeline.SCROLL;
                break;
            case 'U':
                proto.backtrack();
                break;
            case 'W':
                if(!proto.hasWave){
                    proto.getWaveForm();
                }
                break;
            case 'D':
                proto.timeline.currentTool = Timeline.DELETE ;
                break;
            case 'F':
                if(proto.checkFinished()){
                    proto.hide();
                }
                break;
        }
    }
    this.backtrack=function(){
        if(proto.timeline.tracker.events.length>0){
            var txt = proto.timeline.tracker.events[proto.timeline.tracker.events.length-1].type =="changetext";
            proto.timeline.tracker.undo();
            if(txt){
                var ln;
                proto.timeline.tracker.undo();
                ln = Number(proto.index.line);
                proto.index.line = ln> 0?proto.index.line-1:0;
            }
            proto.displayNextTwoLines();   
        }
    };
    this.getActiveSegments = function(){
        this.activeSegments=[];
        var seg=proto.timeline.tracks[0].segments, i, counter=0;
        for(i=0;i<seg.length;i++){
            if(!seg[i].deleted){
                this.activeSegments.push(seg[i]);
                counter++;
            }
        }
        return counter;
    };
    this.findDeletedSentence = function(){
        var seg=proto.timeline.tracks[0].segments, i, foundOne = false;
        for(i=0;i<seg.length;i++){
            if(seg[i].deleted && seg[i].cue.text.length > 0){
                _nextLine.innerHTML = _currentLine.innerHTML;
                _currentLine.innerHTML = proto.lineSet[seg[i].audioIndex].text;
                seg[i].cue.text = '';
                foundOne = true;
                proto.rewriteIndex.push(seg[i].audioIndex);
            }
        }
    };
    this.checkFinished = function(){
        this.updateLineSetClipData();
        var result = true;
        if(this.lineSet.length > this.activeSegments.length){
            alert('If you don\'t keep on going, you can\'t return to it later.');
            result = false;
        }
        var i,j,k;
        for(i=0;i<proto.chapter.paragraph.length;i++){
            for(j=0;j<proto.chapter.paragraph[i].line.length;j++){
                if(proto.chapter.paragraph[i].line[j].index == k){
                    proto.chapter.paragraph[i].line[j] = proto.lineSet[k];
                }
                k++;
            }
        }
        data = proto.chapter;
    }
    this.updateLineSetClipData = function(){
        this.getActiveSegments();
        var i, j, k=0;
        for(i=0;i<this.activeSegments.length;i++){
            j = this.activeSegments[i].audioIndex;
            this.lineSet[j].clip = {};
            this.lineSet[j].clip.start = this.activeSegments[i].startTime;
            this.lineSet[j].clip.end = this.activeSegments[i].endTime;
        }
    };
}