
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

var SentenceFixer = {
    isActive : false,
    pgr : null,
    fixWrapper : null,
    instructionDiv : null,
    splittingSentences : false,
    isEditingSentences : false,
    backup : null,
    messageDiv : null,
    leftnav : null,
    rightnav : null,
    leftHeader : null, 
    rightHeader : null, 
    leftList : [],
    rightList : [], 
    joinUpIcon : docreate('i','icon-hand-up', 'combineSentenceUp'),
    splitSentenceIcon : docreate('i','icon-resize-full', 'sentenceSplitter'),
    editTextIcon : docreate('i', 'icon-edit', 'editTextButton'),
    removeTextIcon: docreate('i', 'icon-remove', 'editTextButton'),
    currentJp : 0,
    currentEn : 0,
    editingSentence : null
};
SentenceFixer.fixParagraphs = function(){
    
};
SentenceFixer.fixSentences = function(){
    this.isActive = true;
    this.fixWrapper = document.getElementById('cdFixParagraphs');
    
    if(typeof this.pgr.tofix == 'boolean'){
        if(!this.pgr.tofix){
            closeFixer();
            return;
        }
    }
    if(this.pgr.tofix.length == 0){
        closeFixer();
        return;
    }
    this.backup = {
        en: pgclone(this.pgr.en[this.pgr.tofix[0].index]),
        jp: pgclone(this.pgr.jp[this.pgr.tofix[0].index]),
        index: this.pgr.tofix[0].index
    };
    this.pgr.previous = this.pgr.previous == undefined? []:this.pgr.previous;
    if(this.pgr.backup != undefined){
        this.pgr.previous.push(this.pgr.backup);
    }
    this.pgr.backup = this.backup;
    function pgclone(o){
        return {
            line: o.line==[]?[]:o.line.slice(0).map(function(e){
                return {
                    text: e.text==undefined?undefined:e.text,
                    clip: e.clip== undefined?undefined:{
                        start:e.clip.start, 
                        end:e.clip.end
                    },
                    index:e.index==undefined?undefined:e.index
                };
            })
        }
    }
    document.getElementById('cdenterText').style.display = 'none';
    this.fixWrapper.style.display = 'block';
    document.getElementById('chapterdecoder').style.display = 'block';
    popdiv.style.display = 'block';
    background.style.display = 'block';
    background.style.top = '0px';
    background.style.bottom = '0px';
    background.style.left = '0px';
    background.style.right = '0px';
    background.style.position = 'fixed';
    this.fixWrapper.style.display = 'block';
    background.style.height = document.offsetHeight;
    background.style.width = document.offsetWidth;
    this.instructionDiv = document.getElementById('fixerInstruction');
    this.messageDiv = document.getElementById('fixerMessage');
    this.leftnav = document.getElementById('fixLeftNav');
    this.rightnav =document.getElementById('fixRightNav');
    this.leftHeader = document.getElementById('fixLeftNavHeader');
    this.rightHeader = document.getElementById('fixRightNavHeader');
    this.leftHeader.innerHTML = 'English Sentences:';
    this.rightHeader.innerHTML = 'Translated Sentences:';
    this.joinUpIcon.style.cursor = 'pointer';
    this.joinUpIcon.setAttribute('title', 'Recombine With Above Sentence');
    this.splitSentenceIcon.style.cursor = 'pointer';
    this.splitSentenceIcon.setAttribute('title', 'Split at [,]/[;] or selected point.');
    this.fixWrapper.focus();
    SentenceFixer.leftList = [];
    SentenceFixer.rightList = [];
        
    resetLists();
    var i;
    this.instructionDiv.firstElementChild.innerHTML = this.pgr.tofix.length+') Do any sentences need to be Recombined or split? type F to move forward. R to restart. P for previous';
};
function resetLists(){
    if(!SentenceFixer.isActive){
        return;
    }
    
    var i;
    SentenceFixer.leftnav.innerHTML = '';
    SentenceFixer.rightnav.innerHTML = '';
    SentenceFixer.leftHeader = SentenceFixer.leftnav.appendChild(SentenceFixer.leftHeader);
    SentenceFixer.rightHeader = SentenceFixer.rightnav.appendChild(SentenceFixer.rightHeader);
    for(i=0;i<SentenceFixer.leftList.length;i++){
        removeListListeners(SentenceFixer.leftList[i]);
    }
    
    for(i=0;i<SentenceFixer.rightList.length;i++){
        removeListListeners(SentenceFixer.rightList[i]);
    }
    SentenceFixer.leftList = [];
    SentenceFixer.rightList = [];    
    
    for(i=0; i<SentenceFixer.pgr.en[SentenceFixer.pgr.tofix[0].index].line.length;i++){
        SentenceFixer.leftList[i] = docreate('li', 'enSentence', 'en'+i);
        SentenceFixer.leftnav.appendChild(docreate('li', 'divider'));
        SentenceFixer.leftList[i] = SentenceFixer.leftnav.appendChild(SentenceFixer.leftList[i]);
        SentenceFixer.leftList[i].innerHTML = SentenceFixer.pgr.en[SentenceFixer.pgr.tofix[0].index].line[i].text;
        setLineListeners({
            li: SentenceFixer.leftList[i],
            index: i,
            line: SentenceFixer.pgr.en[SentenceFixer.pgr.tofix[0].index].line
        });
    }
        
    for(i=0; i<SentenceFixer.pgr.jp[SentenceFixer.pgr.tofix[0].index].line.length;i++){
        SentenceFixer.rightList[i] = docreate('li', 'jaSentence', 'ja'+i); 
        SentenceFixer.rightnav.appendChild(docreate('li', 'divider'));
        SentenceFixer.rightList[i] = SentenceFixer.rightnav.appendChild(SentenceFixer.rightList[i]);
        SentenceFixer.rightList[i].innerHTML = SentenceFixer.pgr.jp[SentenceFixer.pgr.tofix[0].index].line[i].text;
        setLineListeners({
            li:SentenceFixer.rightList[i],
            index: i,
            line: SentenceFixer.pgr.jp[SentenceFixer.pgr.tofix[0].index].line
        });
    }
    popdiv.style.height = SentenceFixer.fixWrapper.offsetHeight+'px';

    $(popdiv).fitHeight().center();
}
function shiftUp(args){
    if(!SentenceFixer.isActive){
        return;
    }
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
    SentenceFixer.routineFixIsActive = false;
    if(!SentenceFixer.isActive){
        return;
    }
    for(i=0;i<SentenceFixer.leftList.length;i++){
        removeListListeners(SentenceFixer.leftList[i]);
    }
    for(i=0;i<SentenceFixer.rightList.length;i++){
        removeListListeners(SentenceFixer.rightList[i]);
    }
    SentenceFixer.pgr.en[SentenceFixer.pgr.tofix[0].index] = SentenceFixer.pgr.en[SentenceFixer.pgr.tofix[0].index];
    SentenceFixer.pgr.jp[SentenceFixer.pgr.tofix[0].index] = SentenceFixer.pgr.jp[SentenceFixer.pgr.tofix[0].index];
    moveOn();
}
function moveOn(){
    if(!SentenceFixer.isActive){
        return;
    }
    SentenceFixer.pgr.tofix = checkLengths(SentenceFixer.pgr);
    if(SentenceFixer.pgr.tofix.length>0){
        SentenceFixer.fixSentences(SentenceFixer.pgr);
    }else{
        closeFixer();
    }
}
function setLineListeners(args){
    var action;
    args.li.onclick = OnClick;
    args.li.onkeydown = OnClick;
    args.li.onmouseover = function(e){
        if(!args.li.classList.contains('greyedOut')){
            args.li.appendChild(SentenceFixer.editTextIcon);
            args.li.appendChild(SentenceFixer.joinUpIcon);
            args.li.appendChild(SentenceFixer.splitSentenceIcon);
            args.li.appendChild(SentenceFixer.removeTextIcon);
        }
        $('.enSentence').removeClass('activeSentence');
        args.li.classList.add('activeSentence');
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
        action = e.target == SentenceFixer.joinUpIcon ? 1: 
        (e.target == SentenceFixer.splitSentenceIcon ? 2: (e.target == SentenceFixer.editTextIcon?3:
        (e.target == SentenceFixer.removeTextIcon? 4: 0)));
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
                editSentenceText({
                    line: args.line,
                    index: args.index,
                    li: args.li
                });
                break;
            case 4:
                args.line.splice(args.index, 1);
            default:
                break;
        }
    }
}
function editSentenceText(args){
    // args.line, args.index, args.li
    if(!SentenceFixer.isEditingSentences){
        SentenceFixer.isEditingSentences = true;
        SentenceFixer.editingSentence = args;
        
        var textArea = document.createElement('textarea');
        textArea.setAttribute('cols', 50);
        textArea.setAttribute('rows', 6);
        textArea.innerHTML = args.line[args.index].text;
        args.li.innerHTML = '';
        args.li.appendChild(textArea);
        textArea.focus();
        SentenceFixer.editingSentence.textarea = textArea;
        SentenceFixer.editTextIcon.setAttribute('class', 'icon-check');
    }else{
        SentenceFixer.isEditingSentences = false;
        SentenceFixer.editTextIcon.setAttribute('class', 'icon-edit');
        SentenceFixer.editingSentence.line[SentenceFixer.editingSentence.index].text = SentenceFixer.editingSentence.textarea.value;
        SentenceFixer.editingSentence.li.innerHTML = SentenceFixer.editingSentence.textarea.value;
        resetLists();
    }
    
}
function joinSentencesUp(args){
    if(!SentenceFixer.isActive){
        return;
    }
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
function closeFixer(){
    SentenceFixer.isActive = false;
    SentenceFixer.fixWrapper.style.display = 'none';
    document.getElementById('chapterdecoder').style.dislay= 'none';
    popdiv.style.display = 'none';
    background.style.display = 'none';
    console.log('Translation Complete!');
}
function removeListListeners(li){
    li.onmouseout = null;
    li.onmouseover = null;
    li.click = null;
    li.onkeydown = null;
}
function routineFix(arg){
    
    if(!SentenceFixer.isActive){
        return;
    }
    if(SentenceFixer.pgr.tofix[0] == null || SentenceFixer.pgr.tofix.length == 0 || Object.keys(SentenceFixer.pgr).indexOf('tofix')<0){
        moveOn();
        return;
    }
    if(arg == undefined){
        arg = {
            en:SentenceFixer.pgr.tofix[0].en > SentenceFixer.pgr.tofix[0].jp?1:0,
            jp:SentenceFixer.pgr.tofix[0].en > SentenceFixer.pgr.tofix[0].jp?0:1
        };
    }
    SentenceFixer.currentJp = arg.jp;
    SentenceFixer.currentEn = arg.en;    
    if(SentenceFixer.pgr.en[SentenceFixer.pgr.tofix[0].index].line.length == SentenceFixer.pgr.jp[SentenceFixer.pgr.tofix[0].index].line.length ){
        doNextParagraph();
        return;
    }
    SentenceFixer.englishIsLonger = SentenceFixer.pgr.tofix[0].en > SentenceFixer.pgr.tofix[0].jp;
    highlightMovers({
        rflength: SentenceFixer.englishIsLonger? SentenceFixer.pgr.jp[SentenceFixer.pgr.tofix[0].index].line.length:SentenceFixer.pgr.en[SentenceFixer.pgr.tofix[0].index].line.length,
        yflength: SentenceFixer.englishIsLonger? SentenceFixer.pgr.en[SentenceFixer.pgr.tofix[0].index].line.length:SentenceFixer.pgr.jp[SentenceFixer.pgr.tofix[0].index].line.length,
        r: SentenceFixer.englishIsLonger? arg.jp:arg.en,
        y: SentenceFixer.englishIsLonger? arg.en:arg.jp,
        rl: SentenceFixer.englishIsLonger? SentenceFixer.rightList:SentenceFixer.leftList,
        yl: SentenceFixer.englishIsLonger? SentenceFixer.leftList:SentenceFixer.rightList
    });
    SentenceFixer.routineFixIsActive = true;
    if(SentenceFixer.englishIsLonger){
        console.log(SentenceFixer.pgr.jp[SentenceFixer.pgr.tofix[0].index].line.length-1 +":"+arg.jp);
        if(SentenceFixer.pgr.jp[SentenceFixer.pgr.tofix[0].index].line.length-1 == arg.jp){
            while(SentenceFixer.pgr.en[SentenceFixer.pgr.tofix[0].index].line.length > SentenceFixer.pgr.jp[SentenceFixer.pgr.tofix[0].index].line.length){
                //pgr.en[ndx].line[arg.jp].text += pgr.en[ndx].line.pop().text;
                SentenceFixer.pgr.en[SentenceFixer.pgr.tofix[0].index].line = shiftUp({
                    array:SentenceFixer.pgr.en[SentenceFixer.pgr.tofix[0].index].line, 
                    index:arg.jp+1
                });
            }
            resetLists();
            routineFix(arg.en, arg.jp);
        }
    }else{
        if(SentenceFixer.pgr.en[SentenceFixer.pgr.tofix[0].index].line.length -1== arg.en){
            while(SentenceFixer.pgr.jp[SentenceFixer.pgr.tofix[0].index].line.length > SentenceFixer.pgr.en[SentenceFixer.pgr.tofix[0].index].line.length){
                //pgr.jp[ndx].line[pgr.tofix[0].jp-2].text +=pgr.jp[ndx].line.pop().text;
                SentenceFixer.pgr.jp[SentenceFixer.pgr.tofix[0].index].line = shiftUp({
                    array:SentenceFixer.pgr.jp[SentenceFixer.pgr.tofix[0].index].line, 
                    index:arg.en+1
                });
            }
            routineFix(arg.en, arg.jp);
        }
    }
}
function highlightMovers(args){
    if(!SentenceFixer.isActive){
        return;
    }
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
function splitSentences(args){
    if(!SentenceFixer.isActive){
        return;
    }
    SentenceFixer.splittingSentences=true;
    SentenceFixer.instructionDiv.firstElementChild.innerHTML;
    SentenceFixer.instructionDiv.firstElementChild.innerHTML = 'Highlight Part to be split into the next sentence. Type "C" to cancel, "F" to move forward. "R" to restart';
    $(args.li).bind("mouseup", function(){
        if(SentenceFixer.splittingSentences){
            SentenceFixer.splittingSentences = false;
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
}