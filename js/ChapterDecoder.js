var background, popdiv;
var searchExceptions = ["Mrs.","Mr.","Ms.","Prof.","Dr.","Gen.","Rep.","Sen.","St.","Sr.","Jr.","Ph.D.","M.D.","B.A.","M.A.","D.D.S.","a.m.","p.m.","i.e.","etc."];
var ChapterDecoder = function(){
    this.data = null;
    this.text = {};
    this.paragraphs = {
        en: [],
        jp: []
    };
    $(background).center();
    $(window).resize(function(){
        $(popdiv).fitHeight().center();
        $(background).center();
    });
}
ChapterDecoder.editPreloadedParagraphs = function(args){
    console.log('preloading chapter:')
    console.log(args);
    var tofix = checkLengths(args.raw == undefined? args.paragraph:args.raw);
    if(args.raw == undefined){
        args.paragraph.tofix = tofix;
    }else{
        args.raw.tofix = tofix;
    }
    SentenceFixer.pgr = args.raw == undefined? args.paragraph:args.raw;
    SentenceFixer.fixSentences();
};
ChapterDecoder.init = function(){
    this.wrapper = document.getElementById('chapterdecoder');
    background = document.getElementById('popbackground');
    popdiv =document.getElementById('popover');
};
ChapterDecoder.getParagraphs = function(args){
        
    var instructionDiv = document.getElementById('cdinstructions'), 
    instruction= "Enter Text: English on the left, Translation on the right.", 
    submit = document.getElementById('cdEnterTextButton'),
    _gpWrapper = document.getElementById('cdenterText');
    _gpWrapper.style.display='block';
    background.style.display='block';
    ChapterDecoder.wrapper.style.display='block';
    if(CKEDITOR.instances.entext !=null){
        CKEDITOR.instances.entext.destroy();
        CKEDITOR.instances.jatext.destroy();
    }
        
    CKEDITOR.replace('entext', {
        uiColor: '#34DFA1',
        extraPlugins : 'uicolor',
        toolbar : [ [ 'Source' ], [ 'UIColor' ] ],
        width: '400px'
    });
    CKEDITOR.instances.entext.focus();
    CKEDITOR.replace( 'jatext',
    {
        uiColor: '#14B8C4',
        extraPlugins : 'uicolor',
        toolbar : [ [ 'Source' ], [ 'UIColor' ] ],
        width: '400px'
    });
    popdiv.style.display='block';
    popdiv.style.height = ChapterDecoder.wrapper.offsetHeight+250+'px';
        
    $(background).center();
    $(popdiv).center();
    submit.onkeydown = getTextAndMoveOn;
    submit.onclick = getTextAndMoveOn;
        
    function getTextAndMoveOn(){
        _gpWrapper.style.display='none';
        ChapterDecoder.text = {
            en: CKEDITOR.instances.entext.getData(),
            jp: CKEDITOR.instances.jatext.getData()
        };
        
        //proto.text.en = CKEDITOR.instances.entext.getData();
        //proto.text.jp = CKEDITOR.instances.jatext.getData();
        ChapterDecoder.paragraphs = ChapterDecoder.splitParagraphs({
            en: ChapterDecoder.text.en,
            jp: ChapterDecoder.text.jp
        });
        ChapterDecoder.paragraphs = ChapterDecoder.splitSentences({
            en: ChapterDecoder.paragraphs.en,
            jp: ChapterDecoder.paragraphs.jp,
            ex: searchExceptions
        });
        if(args.replaceJapanese === true){
            if(ChapterDecoder.data.chapter.raw == null){
                ChapterDecoder.data.chapter.raw = {};
            }
            ChapterDecoder.data.chapter.raw.jp = ChapterDecoder.paragraphs.jp;
            return;
        }
        ChapterDecoder.data.chapter.paragraph = ChapterDecoder.paragraphs.en;
        ChapterDecoder.data.chapter.raw = ChapterDecoder.paragraphs;
        ChapterDecoder.data.chapter.raw.entext = ChapterDecoder.text.en;
        ChapterDecoder.data.chapter.raw.jptext = ChapterDecoder.text.jp;
        
        
        if(args.skip){
            console.log('skipping sentence translation arrangement');
            if(args.toClipper){
                $(ChapterDecoder.wrapper).hide();
                $(popdiv).hide();
                AudioClipper.chapter= ChapterDecoder.data.chapter;
                AudioClipper.show();
                AudioClipper.decodeLineSet();
                AudioClipper.setListeners();
                AudioClipper.displayNextTwoLines();
            }
        }else{
            ChapterDecoder.paragraphs.tofix = checkLengths({
                en: ChapterDecoder.paragraphs.en,
                jp: ChapterDecoder.paragraphs.jp
            });
            if(ChapterDecoder.paragraphs.tofix === false){
                ChapterDecoder.fixParagraphs(ChapterDecoder.paragraphs);
            }
            //var sf = new SentenceFixer(proto.paragraphs.tofix == undefined?-1:(proto.paragraphs.tofix.length==0?-1:proto.paragraphs.tofix[0].index));
            SentenceFixer.pgr = ChapterDecoder.paragraphs;
            SentenceFixer.fixSentences();
        /*ChapterDecoder.sortChapter({
                rawpgr: ChapterDecoder.paragraphs,
                chapter: ChapterDecoder.data.chapter
            });*/
        }
            
    }
};
ChapterDecoder.splitParagraphs = function(args){
    var paragraph = {};
    var splitP = /<(?=p|\/p|div|\/div|h\d|\/h\d)[^>]*?>/g;
    var englishFilterRe = /<[^>]*?>/g;
    var jaFilterRe = /<(?!ruby|rb|rt|\/rb|\/rt|\/ruby)[^>]*?>/g;
    var andFilter = /&[^;]+?;/g;
    var supFilter = /<(?=sup).*?(?=\/sup)[^>]*?>/g;
    var newLineSplit = /[\s]*?\n[\s]*/g;
    var text, soup;
    text = args.en;
    soup = text.replace(/(&#8220;|&#8221;)/g, '"').replace(/(&#39;|&#8217;&#8216;)/g, '\'')
    .replace(andFilter, ' ').replace(supFilter, ' ').replace(splitP, '\n')
    .replace(englishFilterRe, ' ').replace(newLineSplit, '\n').trim();
    paragraph.en = soup.split(newLineSplit);
    text = args.jp;
    soup = text.replace(/\s/g, '').replace(andFilter, '').replace(/<(?=sup).*?(?=\/sup)[^>]*?>[\s]*/g, '').replace(splitP, '\n').replace(jaFilterRe, '').replace(/[\s]+/g, '\n').trim();
    paragraph.jp = soup.split(/[\s]+/g);
    return paragraph;
};
ChapterDecoder.splitSentences = function(args){
    var i, line;
    for(i=0;i<args.en.length;i++){
        args.en[i] = {
            line: splitIntoSentences({
                text: args.en[i],
                ex: args.ex
            })
        };
    }
    for(i=0;i<args.jp.length;i++){
        args.jp[i] = {
            line: splitJapaneseSentences(args.jp[i])
        };
    }
    return args;
};
function checkLengths(args){
    console.log(args);
    if(args.en.length != args.jp.length){
        return false;
    }
    var i, j=[], offSet;
    for(i=0;i<args.en.length;i++){
        
        if(args.en[i].line.length != args.jp[i].line.length){
            if(args.en[i].line.length==1){
                while(args.jp[i].line.length>1){
                    args.jp[i].line[0].text += args.jp[i].line.splice(1, 1)[0].text;
                }
            }else{
                offSet = {
                    en: args.en[i].line.length,
                    jp: args.jp[i].line.length,
                    index: i
                };
                j.push(offSet);
            }
            
        }
    }
    return j;
};
function splitJapaneseSentences(myString){
    /*
     *'\uff1f'+'is ?'
     *'\uff01'+'is !'
     *'\u3002'+'is maru'
     *'\u300d'+'is single quote'
     *'\u300f'+'is double quote'
     *'\uff08' is open parentheses
     *'\uff09' is close parentheses
     * '\u3001' is comma
     */
        
    var index = 0,
    re = /[^\u3002]+[\u3002]+(\u300d|\u300f|\u300d\u300f)?(\uff08([^\uff09]+)\uff09)?/g,
    mySentences = [],
    match;
    while ((match = re.exec(myString)) != null){    
        mySentences[index]= {};
        mySentences[index].text= match[0];
        
        index++;
    }
    if(mySentences.length >0){
        var ls = mySentences[index-1].text;
        var substr = myString.substr(myString.indexOf(ls)+ls.length);
        if(substr.length > 0){
            mySentences[index-1].text += substr;
            console.log(ls);
            console.log(substr);
        }
    }
    
    
    if(mySentences.length == 0){
        if(myString == null || myString.length == 0){
            return [];
        }
        return [{
            text: myString
        }];
    }
    
    return mySentences;
}
    
function splitIntoSentences(args){
    var abbreviation = false;
    var index = 0;
    var re =   /[^\.\?!]+[\.\?!]*"?(\([^\)]+\))?/g;
    //var re = /[^\.\?!]+[\.\?!]+"?/g;
    var mySentences = [];
    var line = {};
    var match;
    while ((match = re.exec(args.text)) != null)
    {
        if (abbreviation)
        {
            mySentences[index].text += match[0];
        }
        else
        {
            mySentences[index] = {};
            mySentences[index].text = match[0];
        }
        
        var splitSentence = match[0].split(/\s/g);
        var lastWord = splitSentence[splitSentence.length-1].trim();
        var abbreviation = args.ex.indexOf(lastWord.replace(/[^a-zA-Z.]/g, '')) >= 0 
        || (lastWord.replace(/[^a-zA-Z.]/g, '').length == 2 && (lastWord.replace(/[^a-zA-Z.]/g, '').toLocaleUpperCase()).charCodeAt(0) <=90 
            && lastWord.replace(/[^a-zA-Z.]/g, '').charAt(0) != 'I');
        if (abbreviation)
        {
            abbreviation = true;
        }
        else
        {
            abbreviation = false;
            index++;
        }
    }
    if(mySentences.length == 0){
        if(args.text == null || args.text.length == 0){
            return [];
        }
        return [{
            text: args.text
        }];
    }
    var ls = mySentences[mySentences.length-1].text;
    var substr = args.text.substr(args.text.indexOf(ls)+ls.length);
    if(substr.length > 0){
        mySentences.push({
            text: substr
        });
    }
    return mySentences;
}
ChapterDecoder.fixParagraphs = function(args){
    console.log('fix paragraphs');
    
    console.log(args);
}
var MoveToParagraph = function(args){
    args.paragraph = {
        en: args.raw.en,
        jp: args.raw.jp
    }
    args.raw = undefined;
}