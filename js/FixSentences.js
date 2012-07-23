Proto.fixSentences = function(pgr){
    /*
         * First, we make assumptions.  The Japanese text was probably split 
         * correctly in Japanese.  They rock like that.
         * 1. If there are more English Sentences, show each sentence in the 
         *  paragraph, separated, and have the editor chose one that should 
         *  be pushed up, finally selecting done.  Save the last item of 
         *  each English sentence as an example.
         * 2. If there are still more English sentences, we really screwed up.  
         *  Then we will do the reverse of the following algorithm.
         * 3. If there are more Japanese sentences, we will present the user 
         *  with two English sentences, starting with the first two; we will
         *  also present two japanese sentences, beginning with the second.
         *  We will ask with which sentence this matches.
         *  a) user chooses first sentence, we re-evaluate and continue if
         *      a match has not been made.
         *  b) user chooses second, so we remove the first sentence, and add
         *      the third in English, and move on in the line of Japanese
         *      sentences.
         * 4. We must provide a way of splitting sentences by ';' 
         *  or ','. If user selects split and the sentence, we then re-evaluate
         *  and re-present the fix dialogue if necessary.
         */
    document.onkeydown = null;
    var fixWrapper = document.getElementById('cdFixParagraphs');
    var splittingSentences=false;
    document.getElementById('cdenterText').style.display = 'none';
    fixWrapper.style.display = 'block';
    document.getElementById('chapterdecoder').style.display = 'block';
    popdiv.style.display = 'block';
    background.style.display = 'block';
    background.style.top = '0px';
    background.style.bottom = '0px';
    background.style.left = '0px';
    background.style.right = '0px';
    background.style.position = 'fixed';
    console.log(pgr);
    if(pgr.tofix.length == 0){
        closeFixer();
        return;
    }
    
    console.log('fixing sentences method start');
    var proto = this;
    
    fixWrapper.style.display = 'block';
    var prevOnkeydown, prevOnkeypress,wellHolder, instructions,message,leftwell, rightwell, leftnav, rightnav,leftHeader, rightHeader, leftNavHeader, rightNavHeader,leftList = [], rightList = [], joinUp, splitSentence, belongsTo, tmp;
    
    background.style.height = document.offsetHeight;
    background.style.width = document.offsetWidth;
    instructions = document.getElementById('fixerInstruction');
    message = document.getElementById('fixerMessage');
    leftnav = document.getElementById('fixLeftNav');
    rightnav =document.getElementById('fixRightNav');
    leftHeader = document.getElementById('fixLeftNavHeader');
    rightHeader = document.getElementById('fixRightNavHeader');
    leftHeader.innerHTML = 'English Sentences:';
    rightHeader.innerHTML = 'Translated Sentences:';
    
    joinUp = docreate('i','icon-hand-up');
    joinUp.style.cursor = 'pointer';
    joinUp.setAttribute('title', 'Recombine With Above Sentence');
    splitSentence = docreate('i','icon-resize-horizontal');
    splitSentence.style.cursor = 'pointer';
    splitSentence.setAttribute('title', 'Split at [,]/[;] or selected point.');
    belongsTo = docreate('i', 'icon-flag');
    fixWrapper.focus();
    
        
    resetLists();
    var i;
    instructions.firstElementChild.innerHTML = pgr.tofix.length+'Do any sentences need to be Recombined or split? type F to move forward. ';
    document.onkeypress = function(e){
        if(String.fromCharCode(e.charCode).toLocaleUpperCase() === 'F'){
            instructions.firstElementChild.innerHTML = "choose Up or down, corresponding to whether the red box goes in the top or bottom yellow boxes.";
            routineFix();
            document.onkeypress = null;
        }
        
    }
    
    function routineFix(arg){
        
        
        if(pgr.tofix[0] == null || pgr.tofix.length == 0 || Object.keys(pgr).indexOf('tofix')<0){
            console.log('moving on');
            moveOn();
            return;
        }
        if(arg == undefined){
            arg = {
                en:pgr.tofix[0].en > pgr.tofix[0].jp?1:0,
                jp:pgr.tofix[0].en > pgr.tofix[0].jp?0:1
            };
        }
        if(pgr.en[pgr.tofix[0].index].line.length == pgr.jp[pgr.tofix[0].index].line.length ){
            doNextParagraph();
            return;
        }
        var enRed = pgr.tofix[0].en > pgr.tofix[0].jp;
        highlightMovers({
            rflength: enRed? pgr.jp[pgr.tofix[0].index].line.length:pgr.en[pgr.tofix[0].index].line.length,
            yflength: enRed? pgr.en[pgr.tofix[0].index].line.length:pgr.jp[pgr.tofix[0].index].line.length,
            r: enRed? arg.jp:arg.en,
            y: enRed? arg.en:arg.jp,
            rl: enRed? rightList:leftList,
            yl: enRed? leftList:rightList
        });
        if(enRed){
            if(pgr.jp[pgr.tofix[0].index].line.length-1 == arg.jp){
                while(pgr.en[pgr.tofix[0].index].line.length > pgr.jp[pgr.tofix[0].index].line.length){
                    //pgr.en[ndx].line[arg.jp].text += pgr.en[ndx].line.pop().text;
                    pgr.en[pgr.tofix[0].index].line = shiftUp({
                        array:pgr.en[pgr.tofix[0].index].line, 
                        index:arg.jp+1
                    });
                }
                resetLists();
                routineFix(arg.en, arg.jp);
            }
            
            document.onkeydown = function(e){
                
                if(e.keyCode === 38){
                    //pgr.en[ndx].line[arg.en-1].text += pgr.en[ndx].line.splice(arg.en, 1)[0].text;
                    
                    pgr.en[pgr.tofix[0].index].line = shiftUp({
                        array:pgr.en[pgr.tofix[0].index].line, 
                        index:arg.en
                    });
                    resetLists();
                    document.onkeydown = null;
                    routineFix({
                        en:arg.en,
                        jp:arg.jp
                    });
                    
                }
                if(e.keyCode === 40){
                    document.onkeydown = null;
                    resetLists();
                    routineFix({
                        en:arg.en+1,
                        jp:arg.jp+1
                    });
                }
                
            }
        }else{
            if(pgr.en[pgr.tofix[0].index].line.length -1== arg.en){
                while(pgr.jp[pgr.tofix[0].index].line.length > pgr.en[pgr.tofix[0].index].line.length){
                    //pgr.jp[ndx].line[pgr.tofix[0].jp-2].text +=pgr.jp[ndx].line.pop().text;
                    pgr.jp[pgr.tofix[0].index].line = shiftUp({
                        array:pgr.jp[pgr.tofix[0].index].line, 
                        index:arg.en+1
                    });
                }
                routineFix(arg.en, arg.jp);
            }
            document.onkeydown = function(e){
                if(e.keyCode === 38){
                    pgr.jp[pgr.tofix[0].index].line = shiftUp({
                        array:pgr.jp[pgr.tofix[0].index].line, 
                        index:arg.jp
                    });
                    document.onkeydown = null;
                    resetLists();
                    routineFix({
                        en:arg.en,
                        jp:arg.jp
                    });
                }
                if(e.keyCode === 40){
                    document.onkeydown = null;
                    resetLists();
                    routineFix({
                        en:arg.en+1,
                        jp:arg.jp+1
                    });
                }
            }
            
        }
    }
    function highlightMovers(args){
        var i;
        
        //rflength, yflength, r, y , rcl, ycl;
        for(i=0; i<args.rl.length;i++){
            if(i != args.r && i!= args.r+1 && !args.rl[i].classList.contains('greyedOut')){
                args.rl[i].classList.add('greyedOut');
                args.rl[i].classList.remove('alert');
                args.rl[i].classList.remove('alert-warning');
            }else if(i == args.r || i== args.r+1){
                args.rl[i].classList.remove('greyedOut');
                args.rl[i].classList.add('alert');
                args.rl[i].classList.add('alert-warning');
            }
                    
        }
        for(i=0; i<args.yl.length;i++){
            if(i != args.y && !args.yl[i].classList.contains('greyedOut')){
                args.yl[i].classList.add('greyedOut');
                args.yl[i].classList.remove('alert');
                args.yl[i].classList.remove('alert-error');
            }else if (i == args.y){
                args.yl[i].classList.remove('greyedOut');
                args.yl[i].classList.add('alert');
                args.yl[i].classList.add('alert-error');
            }
        }
    }
    function shiftUp(args){
        if(args.index == 0){
            return args.array;
        }
        var text = '';
        if(args.insertChar == null){
            text += ' ';
        }else{
            text += args.insertChar;
        }
        var splice = args.array.splice(args.index, 1)[0];
        text +=  splice == null? '': splice.text;
        args.array[args.index-1].text += text;
        if(Object.keys(splice).indexOf('clip')>0){
            if(args.array[args.index-1].clip != null){
                var oclip = args.array[args.index-1].clip;
                args.array[args.index-1].clip.start = Math.min(oclip.start, splice.clip.start);
                args.array[args.index-1].clip.end = Math.max(oclip.end, splice.clip.end);
            }else{
                args.array[args.index-1].clip = splice.clip;
            }
        }
        return args.array;
    }
    function doNextParagraph(){
        document.onkeydown = prevOnkeydown;
        document.onkeypress =prevOnkeypress;
        for(i=0;i<leftList.length;i++){
            removeListListeners(leftList[i]);
        }
        for(i=0;i<rightList.length;i++){
            removeListListeners(rightList[i]);
        }
        pgr.en[pgr.tofix[0].index] = pgr.en[pgr.tofix[0].index];
        pgr.jp[pgr.tofix[0].index] = pgr.jp[pgr.tofix[0].index];
        moveOn();
    }
    function moveOn(){
        pgr.tofix = proto.checkLengths(pgr);
        if(pgr.tofix.length>0){
            console.log("fixing next paragraph");
            proto.fixSentences(pgr);
            return;
        }
        closeFixer();
    }
    function resetLists(){
        leftnav.innerHTML = '';
        rightnav.innerHTML = '';
        leftHeader = leftnav.appendChild(leftHeader);
        rightHeader = rightnav.appendChild(rightHeader);
        for(i=0;i<leftList.length;i++){
            removeListListeners(leftList[i]);
        }
        for(i=0;i<rightList.length;i++){
            removeListListeners(rightList[i]);
        }
        leftList = [];
        rightList = [];    
        for(i=0; i<pgr.en[pgr.tofix[0].index].line.length;i++){
            leftList[i] = docreate('li', 'enSentence', 'en'+i);
            leftnav.appendChild(docreate('li', 'divider'));
            leftList[i] = leftnav.appendChild(leftList[i]);
            leftList[i].innerHTML = pgr.en[pgr.tofix[0].index].line[i].text;
            setLineListeners({
                li: leftList[i],
                index: i,
                line: pgr.en[pgr.tofix[0].index].line
            });
        }
        
        for(i=0; i<pgr.jp[pgr.tofix[0].index].line.length;i++){
            rightList[i] = docreate('li', 'jaSentence', 'ja'+i); 
            rightnav.appendChild(docreate('li', 'divider'));
            rightList[i] = rightnav.appendChild(rightList[i]);
            rightList[i].innerHTML = pgr.jp[pgr.tofix[0].index].line[i].text;
            setLineListeners({
                li:rightList[i],
                index: i,
                line: pgr.jp[pgr.tofix[0].index].line
            });
        }
        popdiv.style.height = fixWrapper.offsetHeight+'px';

        $(popdiv).fitHeight().center();
    }
    function setLineListeners(args){
        var action;
        args.li.onclick = OnClick;
        args.li.onkeydown = OnClick;
        args.li.onmouseover = function(e){
            if(!args.li.classList.contains('greyedOut')){
                args.li.appendChild(belongsTo);
                args.li.appendChild(joinUp);
                args.li.appendChild(splitSentence);
            }
                
        }
        args.li.onmouseout =  function(e){
            if (e === null){
                e = window.event;
            }
                
        }
        function OnClick(e){
            if (e === null){
                e = window.event;
            }
            action = e.target == joinUp ? 1: 
            (e.target == splitSentence ? 2: (e.target == belongsTo?3:0));
            switch(action){
                case 1:
                    joinSentencesUp({
                        line: args.line,
                        index: args.index,
                        li: args.li
                    });
                    
                    break;
                case 2:
                    splitSentences({
                        line: args.line,
                        index: args.index,
                        li: args.li
                    });
                    break; 
                case 3:
                    break;
                default:
                    break;
            }
        }
    }
    function joinSentencesUp(args){
        if(args.index==0){
            var line = {
                clip: {
                    start: null,
                    end: null
                },
                text : '',
                index: 0
            }
            args.line.unshift(line);
            args.index += 1;
        }
        var ch = prompt('Type any characters to insert at this point.');
        args.line = shiftUp({
            array: args.line,
            index: args.index,
            insertChar: ch
        });
        resetLists();
        moveOn();
    }
    function splitSentences(args){
        splittingSentences=true;
        var oldInstructions = instructions.firstElementChild.innerHTML;
        instructions.firstElementChild.innerHTML = 'Highlight Part to be split into the next sentence. Type "C" to cancel, "F" to move forward.';
        $(args.li).bind("mouseup", function(){
            if(splittingSentences){
                var areatosplit = getSelectedText();
                var splitpoint = args.line[args.index].text.indexOf(areatosplit, 0);
                var substring = args.line[args.index].text.substr(splitpoint);
                var firstsentence = args.line[args.index].text.substr(0, splitpoint);
                args.line[args.index].text = firstsentence;
                args.line.splice(args.index+1, 0,{
                    text: substring,
                    clip: args.line[args.index].clip
                });
                resetLists();
            }
        });
        document.onkeydown = function(e){
            if(splittingSentences){
                if(String.fromCharCode(e.keyCode).toLocaleUpperCase() === 'C' && splittingSentences){
                    splittingSentences = false;
                    $(args.li).unbind('mouseup');
                    instructions.firstElementChild.innerHTML = oldInstructions;
                }
                if(String.fromCharCode(e.keyCode).toLocaleUpperCase() === 'F'){
                    instructions.firstElementChild.innerHTML = "choose Up or down, corresponding to whether the red box goes in the top or bottom yellow boxes.";
                    resetLists();
                    pgr.tofix = proto.checkLengths(pgr);
                    document.onkeydown = null;
                    routineFix();
                
                }
            }
        };
        
    }
    function removeListListeners(li){
        li.onmouseout = null;
        li.onmouseover = null;
        li.click = null;
        li.onkeydown = null;
    }
    function closeFixer(){
        console.log('all done!');
        fixWrapper.style.display = 'none';
        document.getElementById('chapterdecoder').style.dislay= 'none';
        popdiv.style.display = 'none';
        background.style.display = 'none';
    }
    $('#popbackground').click(function(){
        document.onkeydown = null;
        document.onkeypush = null;
        closeFixer();
    });
};
Proto.fixParagraphs = function(args){
    console.log('fix paragraphs');
    
    console.log(args);
}
Proto.sortChapter = function(args){
    var unclipped = Object.keys(args.chapter.paragraph[0].line[0]).indexOf('clip')<0;
    var i, j;
    for(i=0;i<args.rawpgr.en.length;i++){
        for(j=0;j<args.rawpgr.en[i].line.length;j++){
            args.rawpgr.en[i].line[j].translation = args.rawpgr.jp[i].line[j].text;
            if(args.chapter.paragraph.length > i){
            }
        }
    }
    args.chapter.organized = args.rawpgs.en;
    if(unclipped){
        args.chapter.paragraph = args.rawpgs.en;
    }else{
        args.chapter.organized = args.rawpgs.en;
    //some fancy code here to deal with merging clips.  like to ask each paragraph if there is a en text match, and go from there.
    }
}