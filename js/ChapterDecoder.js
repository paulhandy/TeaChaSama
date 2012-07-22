var background, popdiv;
function ChapterDecoder(data){
    this.text = {};
    this.paragraphs = {
        en: [],
        jp: []
    };
    this.wrapper = document.getElementById('chapterdecoder');
    this.exceptions = ["Mrs.","Mr.","Ms.","Prof.","Dr.","Gen.","Rep.","Sen.","St.","Sr.","Jr.","Ph.D.","M.D.","B.A.","M.A.","D.D.S.","a.m.","p.m.","i.e.","etc."];
    var proto=this;
    this.audioclipper = data.audioclipper;
    background = document.getElementById('popbackground');
    popdiv =document.getElementById('popover');
    $(background).center();
    $(window).resize(function(){
        $(popdiv).center();
        $(background).center();
    });
    this.editPreloadedParagraphs = function(args){
        var argkeys = Object.keys(args), pgkeys=[], lnkeys=[], translated=false,
        clipped=false;
        if(argkeys.indexOf('paragraph')>=0){
            //stuff for paragraphs
            if(args.paragraph.length>0){
                pgkeys=Object.keys(args.paragraph[0]);
                if(pgkeys.indexOf('line')>=0){
                    lnkeys = Object.keys(args.paragraph[0].line[0]);
                    if(lnkeys.indexOf('translation')>=0){
                        translated = true;
                    }
                    if(lnkeys.indexOf('audio')>=0){
                        clipped = true;
                    }
                }
            }
        }
        if(argkeys.indexOf('raw')>=0){
            if(!translated){
                
                this.paragraphs.tofix = this.checkLengths({
                    en:args.raw.en,
                    jp:args.raw.jp
                });
                this.fixSentences({
                    tofix: this.paragraphs.tofix,
                    en: args.raw.en,
                    jp:args.raw.jp
                });
                
            }
        }
        
    };
    this.getParagraphs = function(args){
        var proto = this;
        var prevonkeydown;
        var instructionDiv = document.getElementById('cdinstructions'), 
        instruction= "Enter Text: English on the left, Translation on the right.", 
        submit = document.getElementById('cdEnterTextButton'),
        _gpWrapper = document.getElementById('cdenterText');
        _gpWrapper.style.display='block';
        background.style.display='block';
        this.wrapper.style.display='block';
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
        popdiv.style.height = this.wrapper.offsetHeight+250+'px';
        
        $(background).center();
        $(popdiv).center();
        submit.onkeydown = getTextAndMoveOn;
        submit.onclick = getTextAndMoveOn;
        prevonkeydown = document.onkeydown;
        
        function getTextAndMoveOn(){
            _gpWrapper.style.display='none';
            proto.text.en = CKEDITOR.instances.entext.getData();
            proto.text.jp = CKEDITOR.instances.jatext.getData();
            proto.paragraphs = proto.splitParagraphs({
                en: proto.text.en,
                jp: proto.text.jp
            });
            proto.paragraphs = proto.splitSentences({
                en: proto.paragraphs.en,
                jp: proto.paragraphs.jp,
                ex: proto.exceptions
            });
            
            data.chapter.paragraph = proto.paragraphs.en;
            data.chapter.raw = proto.paragraphs;
            data.chapter.raw.entext = proto.text.en;
            data.chapter.raw.jptext = proto.text.jp;
            
            if(args.skip){
                console.log('skipping sentence translation arrangement');
                if(args.toClipper){
                    $(proto.wrapper).hide();
                    $(popdiv).hide();
                    
                    proto.audioclipper.chapter= data.chapter;
                    data = proto.audioclipper.chapter;
                    console.log(data);
                    proto.audioclipper.show();
                    proto.audioclipper.decodeLineSet();
                    proto.audioclipper.setListeners();
                    proto.audioclipper.displayNextTwoLines();
                }
            }else{
                proto.paragraphs.tofix = proto.checkLengths({
                    en: proto.paragraphs.en,
                    jp: proto.paragraphs.jp
                });
                if(proto.paragraphs.tofix === false){
                    proto.fixParagraphs(proto.paragraphs);
                }
                proto.fixSentences(proto.paragraphs);
                proto.sortChapter({
                    rawpgr: proto.paragraphs,
                    chapter: data.chapter
                });
            }
            
        }
    };
}
var Proto = ChapterDecoder.prototype;
Proto.splitParagraphs = function(args){
    var paragraph = {};
    var splitP = /<(?=p|\/p)[^>]*?>/g;
    var englishFilterRe = /<[^>]*?>/g;
    var jaFilterRe = /<(?!ruby|rb|rt|\/rb|\/rt|\/ruby|h\d|\/h\d)[^>]*?>/g;
    var andFilter = /&[^;]+?;/g;
    var supFilter = /<(?=sup).*?(?=\/sup)[^>]*?>/g;
    var newLineSplit = /[\s]*?\n[\s]*/g;
    var text, soup;
    text = args.en;
    soup = text.replace("\u201d", '"').replace("\u201c", '"').replace('\u2019', '\'')
    .replace(andFilter, ' ').replace(supFilter, ' ').replace(splitP, '\n')
    .replace(englishFilterRe, ' ').replace(newLineSplit, '\n').trim();
    paragraph.en = soup.split(newLineSplit);
    text = args.jp;
    soup = text.replace(andFilter, '').replace(supFilter, '').replace(splitP, '\n').replace(jaFilterRe, '').replace(newLineSplit, '\n').trim();
    paragraph.jp = soup.split(newLineSplit);
    return paragraph;
};
Proto.splitSentences = function(args){
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
Proto.checkLengths = function(args){
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
    console.log(j[0].en);
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
    return mySentences;
}
    
function splitIntoSentences(args){
    var abbreviation = false;
    var index = 0;
    var re = /[^\.\?!]+[a-zA-Z]+?[\.\?!]*"*?[$]*?/g;
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
    if(mySentences.length==0){
        alert(args.text);
    }
    return mySentences;
}
