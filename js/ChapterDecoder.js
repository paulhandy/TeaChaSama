var background, popdiv;
function ChapterDecoder(data){
    this.text = {};
    this.paragraphs = {
        en: [],
        jp: []
    };
    this.wrapper = document.getElementById('chapterdecoder');
    this.exceptions = ["Mrs.","Mr.","Ms.","Prof.","Dr.","Gen.","Rep.","Sen.","St.","Sr.","Jr.","Ph.D.","M.D.","B.A.","M.A.","D.D.S.","a.m.","p.m.","i.e.","etc."];
    var proto=this, totalMisaligned=0;
    this.audioclipper = data.audioclipper;
    background = document.getElementById('popbackground');
    popdiv =document.getElementById('popover');
    $(background).center();
    $(window).resize(function(){
        $(popdiv).center();
        $(background).center();
    });
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
        console.log(this.wrapper.offsetHeight);
        $(background).center();
        $(popdiv).center();
        submit.onkeydown = getTextAndMoveOn;
        submit.onclick = getTextAndMoveOn;
        prevonkeydown = document.onkeydown;
        
        function getTextAndMoveOn(e){
            _gpWrapper.style.display='none';
            proto.text.en = CKEDITOR.instances.entext.getData();
            proto.text.jp = CKEDITOR.instances.jatext.getData();
            console.log(CKEDITOR.instances);
            proto.paragraphs = proto.splitParagraphs({
                en: proto.text.en,
                jp: proto.text.jp
            });
            proto.paragraphs = proto.splitSentences({
                en: proto.paragraphs.en,
                jp: proto.paragraphs.jp,
                ex: proto.exceptions
            });
            proto.paragraphs.tofix = proto.checkLengths({
                en: proto.paragraphs.en,
                jp: proto.paragraphs.jp
            });
            totalMisaligned = proto.paragraphs.tofix.length;
            data.chapter.paragraph = proto.paragraphs.en;
            data.chapter.raw = proto.paragraphs;
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
                proto.fixSentences(proto.paragraphs);
            }
            
        }
    };
}
var Proto = ChapterDecoder.prototype;
Proto.splitParagraphs = function(args){
    var paragraph = {};
    var splitP = /<(?=p|\/p)[^>]*?>/g;
    var englishFilterRe = /<(?!h\d|\/h\d)[^>]*?>/g;
    var jaFilterRe = /<(?!ruby|rb|rt|\/rb|\/rt|\/ruby|h\d|\/h\d)[^>]*?>/g;
    var andFilter = /&[^;]+?;/g;
    var supFilter = /<(?=sup).*?(?=\/sup)[^>]*?>/g;
    var newLineSplit = /[\s]*?\n[\s]*/g;
    var text, soup;
    text = args.en;
    soup = text.replace("\u201d", '"').replace("\u201c", '"').replace('\u2019', '\'')
    .replace(andFilter, '').replace(supFilter, '').replace(splitP, '\n')
    .replace(englishFilterRe, '').replace(newLineSplit, '\n').trim();
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
    if(args.jp.length != args.jp.length){
        return false;
    }
    var i, j=[], offSet;
    for(i=0;i<args.en.length;i++){
        if(args.en[i].line.length != args.jp[i].line.length){
            offSet = {
                en: args.en[i].length,
                jp: args.jp[i].length,
                index: i
            };
            j.push(offSet);
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
    return mySentences;
}
    
function splitIntoSentences(args){
    var abbreviation = false;
    var index = 0;
    var re = /[^\.\?!]+[\.\?!]*"?[$]*?/g
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
            || (lastWord.length == 2 && (lastWord.toLocaleUpperCase()).charCodeAt(0) <=90);
            
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
