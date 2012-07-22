/*
 * ----------------------------------------------------------------------------
 * BookShelf
 */
function BookShelf(){
    this.title = null;
    this.courseNumber = null;
    this.book = [];
    this.rawData = null;
    var bookshelf = this;
    this.databaseIndexParser = function(data){
        
        data = JSON.parse(data);
        bookshelf.rawData = data;
        bookshelf.title = data.title;
        bookshelf.courseNumber = data.courseNumber;
        var i , j, book, chapter;
        for(i=0; i< data.book.length; i++)
        {
            book = new Book();
            book.parent = bookshelf;
            book.title = data.book[i].title;
            book.index = data.book[i].index;
            for(j=0; j< data.book[i].chapter.length ; j++)
            {
                chapter = new Chapter();
                chapter.parent = book;
                chapter.title = data.book[i].chapter[j].title;
                chapter.author = data.book[i].chapter[j].author;
                chapter.index = data.book[i].chapter[j].index;
                book.chapter.push(chapter);
            }
            bookshelf.book.push(book);
        }
    };

    this.getIndexHtml = function(){
        var tabarea, nav, li, a, tabcont, tabpane;
        tabarea = document.createElement('div');
        tabarea.setAttribute('class', 'tabbable tabs-left');
        nav = document.createElement('ul');
        nav.setAttribute('class', 'nav nav-tabs');
        tabcont = document.createElement('div');
        tabcont.setAttribute('class', 'tab-content');
        tabarea.appendChild(nav);
        tabarea.appendChild(tabcont);
        for(i=0;i<this.book.length;i++){
            li = document.createElement('li');
            a = document.createElement('a');
            a.setAttribute('href', '#tab'+(i+1));
            a.setAttribute('data-toggle', 'tab');
            a.innerHTML = this.book[i].title;
            li.appendChild(a);
            nav.appendChild(li);
            tabcont.appendChild(this.book[i].getIndexHtml(i+1));
        }
        return tabarea;
    };
}
/*
* ----------------------------------------------------------------------------
* Book
*/
function Book(){
    this.parent = null;
    this.title = null;
    this.index = 0;
    this.chapter = [];
    this.addChapter = function(){
        var c = new Chapter();
        this.chapter.push(c);
        return c;
    };
    this.getIndexHtml = function(paneindex){
        var i=0, pane, ul;
        pane = document.createElement('div');
        pane.setAttribute('class', 'tab-pane');
        pane.setAttribute('id', 'tab'+paneindex);
        ul = document.createElement('ul');
        ul.setAttribute('class', 'chapter-list');
        for(i=0;i<this.chapter.length;i++){
            ul.appendChild(this.chapter[i].getIndexCard(i));
        }
        pane.appendChild(ul);
        return pane;
    };
}
/*
* ----------------------------------------------------------------------------
* Chapter
*/
function Chapter(){
    this.parent = null;
    this.rawData = null;
    this.title = null;
    this.author = null;
    this.audio = null;
    this.index = null;
    this.paragraph = [];
    this.vocabulary = [];
    this.grammar = [];
    var proto=this;
    this.addParagraph = function(){
        var p = new Paragraph();
        this.paragraph.push(p);
        return p;
    };
  
    this.databaseChapterParser = function(_data){
        var chapter = this;
        $.ajax({
            url: 'include/getlesson.php',
            data: _data,
            type: 'GET',
            dataType: 'json',
            success: setChapter,
            error : function(j,t,e){
                console.log(j);
                console.log(t);
                console.log(e);
            }
        });
        function setChapter(data, status){
            if(data === null){
                console.log(status);
                return false;
            }
            console.log(data);
            //data = JSON.parse(data);
            var audio, paragraph, line, clip, reference, i, j, k, vocab, grammar;
            proto.rawData = data;
            
            audio = new AudioTrack();
            audio.fileName = data.audio.filename;
            audio.duration = data.audio.duration;
            proto.audio = audio;
            for(i=0; i < data.paragraph.length ; i++)
            {
                paragraph = new Paragraph();
                paragraph.parent = proto;
                for(j=0;j<data.paragraph[i].line[j].length; j++){
                    line = new Line();
                    line.parent = paragraph;
                    clip = new AudioClip();
                    clip.start = data.paragraph[i].line[j].clip.start;
                    clip.end = data.paragraph[i].line[j].clip.end;
                    clip.end = data.paragraph[i].line[j].clip.end;
                    line.text = data.paragraph[i].line[j].text;
                    line.translation = data.paragraph[i].line[j].translation;                    
                    line.audioClip = clip;
                    if(data.paragraph[i].line[j].vocab !== null){
                        for(k=0; k< data.paragraph[i].line[j].vocab.length; k++){
                            reference = new VocabReference();
                            reference.index = data.paragraph[i].line[j].vocab.index;
                            reference.start = data.paragraph[i].line[j].vocab.start;
                            reference.length = data.paragraph[i].line[j].vocab.length;
                            line.vocab.push(reference);
                        }
                    }
                    if(data.paragraph[i].line[j].grammar !== null){
                        for(k=0; k< data.paragraph[i].line[j].grammar.length; k++){
                            reference = new GrammarReference();
                            reference.index = data.paragraph[i].line[j].grammar.index;
                            reference.start = data.paragraph[i].line[j].grammar.start;
                            reference.length = data.paragraph[i].line[j].grammar.length;
                            line.grammar.push(reference);
                        }   
                    }
                    paragraph.line.push(line);
                }
            }
            for(i=0;i < data.vocab.length; i++){
                vocab = new Vocab();
                vocab.term = data.vocab[i].term;
                vocab.translation = data.vocab[i].translation;
                proto.vocabulary.push(vocab);
            }
            for(i=0;i < data.grammar.length; i++){
                grammar = new Grammar();
                grammar.principle = data.grammar[i].principle;
                grammar.explanation = data.grammar[i].explanation;
                proto.grammar.push(grammar);
            }
            return true;
        }
    };
    this.getIndexCard = function(i){
        var li, a, title, auth;
        li = document.createElement('li');
        li.setAttribute('class', 'index-list');
        a = document.createElement('a');
        a.setAttribute('href', '#chapter'+i);
        title = document.createElement('div');
        auth = document.createElement('div');
        title.setAttribute('class', 'chapter-index-title');
        title.innerHTML = this.title;
        auth.setAttribute('class', 'chapter-index-author');
        auth.innerHTML = this.author;
        a.appendChild(title);
        a.appendChild(auth);
        li.appendChild(a);
        li.onclick = function(e){
            var course = 'course='+proto.parent.parent.courseNumber;
            var book = 'book='+ proto.parent.index;
            var chap = 'chapter='+proto.index;
            proto.databaseChapterParser(course+'&'+book+'&'+chap);
        };
        
        return li;
    };
    this.getLessonHtml = function(){
        var title, author, article, i;
        title = document.createElement('h1');
        author = document.createElement('h6');
        article = document.createElement('article');
        for(i=0; i<this.paragraph.length;i++){
            article.appendChild(this.paragraph[i].getParagraphHtml());
        }
    };
}
/*
* ----------------------------------------------------------------------------
* Paragraph
*/
function Paragraph(){
    this.line = [];
    this.parent = null;
    
    this.getParagraphHtml = function(){
        var section = document.createElement('section'), i;
        for(i=0;i<this.line.length; i++){
            section.appendChild(this.line[i].getLineHtml());
        }
        return section;
    };
}

/*
* ----------------------------------------------------------------------------
* Line
*/
function Line(){
    this.parent = null;
    this.text = null;
    this.translation = null;
    this.audioClip = null;
    this.vocab = [];
    this.grammar = [];
    var lineWrapper = document.createElement('span'),
    ddmbgp = document.createElement('div'),
    bcontainer = document.createElement('a'),
    b = document.createElement('span'),
    ul = document.createElement('ul'),
    li = document.createElement('li'),
    btnGroup = document.createElement('div'),
    soundbtn = document.createElement('button'),
    transbtn = document.createElement('button'),
    vocabbtn = document.createElement('button'),
    grammarbtn = document.createElement('button'),
    utterance = document.createElement('span');
    initialize();
    
    this.getLineHtml = function(){
        utterance.innerHTML = this.text;
        lineWrapper.appendChild(ddmbgp);
        lineWrapper.appendChild(utterance);
        return lineWrapper;
    };
    this.vocabInline = function(){
    
    };
    this.showTranslation = function(){
    
    };
    this.grammarInline = function(){
    
    };
    this.setListeners = function(){
        if(this.audioClip === null){
            this.addAudioClip();
        }
        soundbtn.onclick = this.audioClip.play;
        soundbtn.onkeydown = this.audioClip.play;
        transbtn.onclick = this.showTranslation;
        transbtn.onkeydown = this.showTranslation;
        vocabbtn.onkeydown = this.vocabInline;
        vocabbtn.onclick = this.vocabInline;
        grammarbtn.onkeydown = this.grammarInline;
        grammarbtn.onclick = this.grammarInline;
    };
  
    this.removeListeners = function(){
        soundbtn.onclick = null;
        soundbtn.onkeydown = null;
        transbtn.onclick = null;
        transbtn.onkeydown =null;
        vocabbtn.onkeydown =null;
        vocabbtn.onclick = null;
        grammarbtn.onkeydown =null;
        grammarbtn.onclick = null;
    };
    function initialize(){
        lineWrapper.setAttribute('class', 'line-wrapper');
        utterance.setAttribute('class', 'utterance-area');
        ddmbgp.setAttribute('class', 'btn-group');
        bcontainer.setAttribute('class', 'btn btn-mini dropdown-toggle');
        b.setAttribute('class', 'caret');
        ul.setAttribute('class', 'dropdown-menu');
        btnGroup.setAttribute('class', 'btn-group');
        soundbtn.setAttribute('class', 'btn btn-large');
        transbtn.setAttribute('class', 'btn btn-large');
        vocabbtn.setAttribute('class', 'btn btn-large');
        grammarbtn.setAttribute('class', 'btn btn-large');
        btnGroup.appendChild(soundbtn);
        btnGroup.appendChild(transbtn);
        btnGroup.appendChild(vocabbtn);
        btnGroup.appendChild(grammarbtn);
        li.appendChild(btnGroup);
        ul.appendChild(li);
        ul.style.minWidth = 0+'px';
        bcontainer.appendChild(b);
        ddmbgp.appendChild(bcontainer);
        ddmbgp.appendChild(ul);
        soundbtn.innerHTML = '<ruby><rb><i class="icon icon-headphones" ></i></rb><rt>\u805e\u304f</rt></ruby>';
        transbtn.innerHTML = '<ruby><rb><canvas class="translation-canvas" ></canvas></rb><rt>\u7ffb\u8a33</rt></ruby>';
        transbtn.style.padding = '9px 7px';
        vocabbtn.innerHTML = '<ruby><rb><i class="icon icon-book"></i></rb><rt>\u5358\u8a9e</rt></ruby>';
        grammarbtn.innerHTML = '<ruby><rb><canvas class="grammar-canvas"></canvas></rb><rt>\u6587\u6cd5</rt></ruby>';
        grammarbtn.style.padding = '9px 7px';
    }
}

/*
* ----------------------------------------------------------------------------
* Vocab
*/
function Vocab(){
    this.term = null;
    this.translation = null;
}
function VocabReference(){
    this.index = null;
    this.start = 0;
    this.length = 0;
}
/*
* ----------------------------------------------------------------------------
* Grammar
*/
function Grammar(){
    this.principle = null;
    this.explanation = null;
}
function GrammarReference(){
    this.index = null;
    this.start = 0;
    this.length = 0;
}
/*
* ----------------------------------------------------------------------------
* Audio Track
*/
function AudioTrack(){
    this.fileName = null;
    this.duration = 0;
}

/*
* ----------------------------------------------------------------------------
* Audio Clip
*/
function AudioClip(){
    this.start= 0;
    this.end= 0;
    this.play = function(){
    
    };
}