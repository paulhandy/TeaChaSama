/* 
 * Purpose of this is to align audio with lines in the text.
 */
var _actimeline, _acxhr, _url, _acTexttrack, _acisVisible;
var  _acAudio, _acSource1, _acSource2, _acCurrentLine, _acNextLine, _acAudioPrevLine, _acBtnwrapper, _acLinewrapper;
var AudioClipper = {
    chapter: null,
    lineSet: [],
    audioTrack: '',
    media: null,
    wrapper: null,
    index: {
        line:0
    },
    activeSegments: [],
    timeline: null,
    segmentCount: 0,
    rewriteIndex: [],
    hasWave: false
};
AudioClipper.init = function(){
    _actimeline = document.getElementById('timeline');
    _acCurrentLine = document.getElementById('audioCurrentLine');
    _acNextLine = document.getElementById('audioNextLine');
    _acAudioPrevLine = document.getElementById('audioPrevLine');
    _acBtnwrapper = document.getElementById('audioEditorButtonGroup');
    _acLinewrapper = document.getElementById('audioEditorLines');
    this.wrapper = document.getElementById('audioEditor');
}
AudioClipper.tellme = function(){
    console.log(this);
}
AudioClipper.decodeLineSet = function(){
    var i, j, k=0;
    for(i=0;i<this.chapter.paragraph.length;i++){
        for(j=0;j<this.chapter.paragraph[i].line.length;j++){
            this.chapter.paragraph[i].line[j].index = k;
            this.lineSet[k] = (this.chapter.paragraph[i].line[j]);
            k++;
        }
    }
};
AudioClipper.hide = function(){
    document.getElementById('popbackground').style.display = 'none';
    this.wrapper.style.top = '-10000px';
    this.wrapper.style.left="-10000px";
    this.timeline.removeAudioTrack('audiofile');
};
AudioClipper.show = function(){
    this.wrapper.style.zIndex = 750;
    $(this.wrapper).fitHeight().center();
    this.wrapper.style.top = '50px';
    _acBtnwrapper.style.display = 'block';
    _acLinewrapper.style.display = 'block';      
};
AudioClipper.setAudioDiv = function(){
    var typeGiven = AudioClipper.chapter.audio.filename.substr(AudioClipper.chapter.audio.filename.length-3, 3);
    var nameOfFile = AudioClipper.chapter.audio.filename.substr(0, AudioClipper.chapter.audio.filename.length-4);
    var alternate = typeGiven == 'mp3'? nameOfFile+'.ogg':nameOfFile+'.mp3';
    _acAudio = document.createElement('audio');
    _acAudio.setAttribute('src', AudioClipper.chapter.audio.filename);
    document.getElementById('audiowrapper').appendChild(_acAudio);
    _acAudio.load();
    setTimeout(AudioClipper.clipMedia, 50);
};
AudioClipper.addClipData = function(seg){
        
    if(this.index.line < this.lineSet.length || this.rewriteIndex.length > 0){
        if(!this.media.paused){
            AudioClipper.timeline.currentTime = seg.startTime;
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
        _acAudioPrevLine.innerHTML = seg.text;
    }else{
        this.timeline.tracker.undo();
    }
};
AudioClipper.displayNextTwoLines = function(){
    if(this.lineSet.length > this.index.line){
        _acCurrentLine.innerHTML = this.lineSet[this.index.line].text;
        if(this.lineSet.length-1> this.index.line){
            _acNextLine.innerHTML = this.lineSet[this.index.line+1].text;
        }else{
            _acNextLine.innerHTML = '';
        }
    }else{
        _acCurrentLine.innerHTML = '';
        _acNextLine.innerHTML = '';
    }
    if(this.rewriteIndex.length>0){
        _acCurrentLine.innerHTML = this.lineSet[this.rewriteIndex[this.rewriteIndex.length-1]].text;
    }
    $(this.wrapper).fitHeight();
};
AudioClipper.clipMedia = function(){
    $(_acAudio).mediaelementplayer({
        success: function (mediaElement, domObject) {
            AudioClipper.media = mediaElement;
            mediaElement.style.width = '1px';
            mediaElement.style.height = '1px';
            mediaElement.style.opacity = '0';
            AudioClipper.timeline = new Timeline(_actimeline, {
                length: mediaElement.duration,
                start: 0,
                end: 60
            });
                
            _acTexttrack = 'audio-clip-track';
            AudioClipper.timeline.addTextTrack([], _acTexttrack, "en");
            //create, select, move, etc.
            AudioClipper.timeline.currentTool = Timeline.CREATE;
            mediaElement.addEventListener('timeupdate', function(){
                AudioClipper.timeline.currentTime = mediaElement.currentTime;
            }, false);
            AudioClipper.timeline.on('jump', function(time){
                mediaElement.setCurrentTime(time);
            });
            AudioClipper.timeline.on('select', function(seg){
                if(AudioClipper.timeline.tracks[0].segments.length>AudioClipper.segmentCount){
                    if(Math.abs(seg.endTime - seg.startTime) > .001){
                        AudioClipper.addClipData(seg);
                    }else{
                        AudioClipper.timeline.tracker.undo();
                    }
                    AudioClipper.segmentCount = AudioClipper.timeline.tracks[0].segments.length;
                }
                AudioClipper.displayNextTwoLines();       
                    
            });
            window.setInterval(AudioClipper.findDeletedSentence, 500);
        }
    });      
};
AudioClipper.getWaveForm = function(){
    console.log('preparing waveform');
    _acxhr = new XMLHttpRequest();
    _acxhr.responseType = 'arraybuffer';
    _acxhr.open('GET', AudioClipper.chapter.audio.filename);
    _acxhr.onreadystatechange = function(){
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
                    AudioClipper.timeline.width,
                    AudioClipper.timeline.trackHeight,
                    1, //buffer.numberOfChannels,
                    buffer.sampleRate
                    );
                wave.addFrame(buffer.getChannelData(0));
                console.log("loaded");
                document.body.style.cursor = 'auto';
                AudioClipper.timeline.addAudioTrack(wave,'audiofile');
                AudioClipper.timeline.setAudioTrack(_acTexttrack,'audiofile');
            }, function(err, msg){
                console.log(err);
                console.log(msg);
                document.body.style.cursor = 'auto';
            });
        }
    };
    _acxhr.send();
    AudioClipper.hasWave = true;
};
AudioClipper.setListeners = function(){
    prevOnKeyPress = document.onkeypress;
    document.onkeypress = this.keyListener;
    document.getElementById('playbtn').addEventListener('click', function(){
        AudioClipper.media.play();
    }, false);
    document.getElementById('pausebtn').addEventListener('click', function(){
        AudioClipper.media.pause();
    }, false);
    document.getElementById('createbtn').addEventListener('click', function(){
        AudioClipper.timeline.currentTool = Timeline.CREATE;
    }, false);
    document.getElementById('selectbtn').addEventListener('click', function(){
        AudioClipper.timeline.currentTool = Timeline.SELECT;
    }, false);
    document.getElementById('movebtn').addEventListener('click', function(){
        AudioClipper.timeline.currentTool = Timeline.MOVE;
    }, false);
    document.getElementById('resizebtn').addEventListener('click', function(){
        AudioClipper.timeline.currentTool = Timeline.RESIZE;
    }, false);
    document.getElementById('scrollbtn').addEventListener('click', function(){
        AudioClipper.timeline.currentTool = Timeline.SCROLL;
    }, false);
    document.getElementById('undobtn').addEventListener('click', AudioClipper.backtrack, false);
    document.getElementById('deletebtn').addEventListener('click', function(){
        AudioClipper.timeline.currentTool = Timeline.DELETE ;
    }, false);
    document.getElementById('finishedbtn').addEventListener('click', function(){
        AudioClipper.checkFinished();
        AudioClipper.hide();
    }, false);
    document.getElementById('wavebtn').addEventListener('click', function(){
        if(!AudioClipper.hasWave){
            AudioClipper.getWaveForm();
        }
    }, false);
        
    _acAudio.addEventListener("timeupdate", function() {
        AudioClipper.timeline.currentTime = AudioClipper.media.currentTime;
    },false);
};
AudioClipper.keyListener = function(e){
    if(e.keyCode == 32){
        if(AudioClipper.media.paused){
            AudioClipper.media.play();
        }else{
            AudioClipper.media.pause();
        }
        e.preventDefault();
        _actimeline.focus();
    }
    switch(String.fromCharCode(e.charCode).toLocaleUpperCase()){
        case 'C':
            AudioClipper.timeline.currentTool = Timeline.CREATE;
            break;
        case 'S':
            AudioClipper.timeline.currentTool = Timeline.SELECT;
            break;
        case 'M':
            AudioClipper.timeline.currentTool = Timeline.MOVE;
            break;
        case 'R':
            AudioClipper.timeline.currentTool = Timeline.RESIZE;
            break;
        case 'Q':
            AudioClipper.timeline.currentTool = Timeline.SCROLL;
            break;
        case 'U':
            AudioClipper.backtrack();
            break;
        case 'W':
            if(!AudioClipper.hasWave){
                AudioClipper.getWaveForm();
            }
            break;
        case 'D':
            AudioClipper.timeline.currentTool = Timeline.DELETE ;
            break;
        case 'F':
            if(AudioClipper.checkFinished()){
                AudioClipper.hide();
            }
            break;
    }
}
AudioClipper.backtrack=function(){
    if(AudioClipper.timeline.tracker.events.length>0){
        var txt = AudioClipper.timeline.tracker.events[AudioClipper.timeline.tracker.events.length-1].type =="changetext";
        AudioClipper.timeline.tracker.undo();
        if(txt){
            var ln;
            AudioClipper.timeline.tracker.undo();
            ln = Number(AudioClipper.index.line);
            AudioClipper.index.line = ln> 0?AudioClipper.index.line-1:0;
        }
        AudioClipper.displayNextTwoLines();   
    }
};
AudioClipper.getActiveSegments = function(){
    this.activeSegments=[];
    var seg=AudioClipper.timeline.tracks[0].segments, i, counter=0;
    for(i=0;i<seg.length;i++){
        if(!seg[i].deleted){
            this.activeSegments.push(seg[i]);
            counter++;
        }
    }
    return counter;
};
AudioClipper.findDeletedSentence = function(){
    var seg=AudioClipper.timeline.tracks[0].segments, i, foundOne = false;
    for(i=0;i<seg.length;i++){
        if(seg[i].deleted && seg[i].cue.text.length > 0){
            _acNextLine.innerHTML = _acCurrentLine.innerHTML;
            _acCurrentLine.innerHTML = AudioClipper.lineSet[seg[i].audioIndex].text;
            seg[i].cue.text = '';
            foundOne = true;
            AudioClipper.rewriteIndex.push(seg[i].audioIndex);
        }
    }
};
AudioClipper.checkFinished = function(){
    this.updateLineSetClipData();
    var result = true;
    if(this.lineSet.length > this.activeSegments.length){
        alert('If you don\'t keep on going, you can\'t return to it later.');
        result = false;
    }
    var i,j,k;
    for(i=0;i<AudioClipper.chapter.paragraph.length;i++){
        for(j=0;j<AudioClipper.chapter.paragraph[i].line.length;j++){
            if(AudioClipper.chapter.paragraph[i].line[j].index == k){
                AudioClipper.chapter.paragraph[i].line[j] = AudioClipper.lineSet[k];
            }
            k++;
        }
    }
    data = AudioClipper.chapter;
}
AudioClipper.updateLineSetClipData = function(){
    this.getActiveSegments();
    var i, j, k=0;
    for(i=0;i<this.activeSegments.length;i++){
        j = this.activeSegments[i].audioIndex;
        this.lineSet[j].clip = {};
        this.lineSet[j].clip.start = this.activeSegments[i].startTime;
        this.lineSet[j].clip.end = this.activeSegments[i].endTime;
    }
};