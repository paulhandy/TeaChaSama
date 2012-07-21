

function TalkGrabber(){
    this.url = '';
    this.paragraphs = {};
    
    this.decoder = null;
    var grabber = this;
    this.jDone = false;
    this.eDone = false;
    this.getEnglish = function(setUp, goOn){
        var _url = this.url;
        var myIframe = document.createElement('iframe');
        var content;
        myIframe.setAttribute('src', _url);
        myIframe.style.display = 'none';
        myIframe = document.body.appendChild(myIframe);
        $(myIframe).load(function(){
            content = myIframe.contentWindow.document.body;
            setEnglishParagraphs(content);  
            setUp();
            if(this.jDone && this.eDone){
                goOn();
            }
        });
    }
    this.getJapanese = function(setUp, goOn){
        var _url = this.url+'&clang=jpn';
        var myIframe = document.createElement('iframe');
        var content;
        myIframe.setAttribute('src', _url);
        myIframe.style.display = 'none';
        myIframe = document.body.appendChild(myIframe);
        
        $(myIframe).load(function(){
            console.log('loaded');
            content = myIframe.contentWindow.document.body;
            setJapaneseParagraphs(content);
            setUp();
            if(this.jDone && this.eDone){
                goOn();
            }
        });
    };
    // Grab English Paragraphs
    function setEnglishParagraphs(data){
        
        grabber.paragraphs.english = [];
        
        $(data).find('article-id').next().find('sup').remove();
        $(data).find('article-id').next().find('p').each(function(){
            this.paragraphs.english.push($(this).text());
        });
        grabber.eDone = true;
        return grabber.paragraphs.english;
    }
    
    function setJapaneseParagraphs(data){
        grabber.paragraphs.japanese = [];
        var reference = document.getElementById('references');
        
        var paragraphs=[];
        var p = reference.previousElementSibling;
        while (p.nodeName === 'P'){
            var re = /<(?!ruby|rb|rt|\/rb|\/rt|\/ruby)[^>]*?>/g;
            var inner = p.innerHTML;
            paragraphs.unshift(inner.replace(re, ''));
            p = p.previousElementSibling;
        }
        grabber.jDone = true;
        grabber.paragraphs.japanese = paragraphs;
    }
    
}

