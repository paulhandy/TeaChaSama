var IndexWriter = {
    data: {},
    divs: [],
    save: function(args){
        $.ajax({
            url: args.url,
            data: args.data,
            type: "POST"
        }).done(function(msg){
            console.log(msg);
        });
    }
};


var LessonWriter = {
    data : {
        chapter: []
    },
    load: function(args){
        $.ajax({
            url: args.url,
            type: "GET"
        }).done(function(msg){
            console.log(msg);
        });
    },
    save:function(args){
        $.ajax({
            url: args.url,
            data: args.data,
            type: "POST"
        }).done(function(msg){
            console.log(msg);
        });
    }
};

function CourseEditor(args){
    if(Object.keys(IndexWriter.data).length === 0){
        IndexWriter.data = {
            title: prompt("what is the name of this course?", 'General Conference Talks'),
            coursenum: prompt('what is the course number', 'ENG311'),
            book: []
        };
    }
    this.bookeditor = new BookEditor({
        indexsave: args.indexsave,
        lessonsave: args.lessonsave,
        lessonget: args.lessonget,
        indexget: args.indexget
    });
    this.bookeditor.showExistingBooks();
}
function BookEditor(urldata){
    this.urldata = urldata;
    this.chapterdecoder = null;
    this.bookLiSet = [];
    var proto = this;
    this.bookeditortab = document.getElementById('bookEditorTab');
    this.chaptereditortab = document.getElementById('chapterEditorTab');
    this.addBookButton = document.getElementById('addbook');
    this.addBooki = this.addBookButton.getElementsByTagName('i')[0];
    
    this.showExistingBooks = function(){
        if(IndexWriter.data.book.length>0){
            var i, nav, j, end;
            for(i=0;i<IndexWriter.data.book.length;i++){
                
                nav = this.addBook(IndexWriter.data.book[i]);
                end = Number(IndexWriter.data.book[i].chapter.length);
                for(j=0;j<end;j++){
                    
                    this.addChapter({
                        book: IndexWriter.data.book[i],
                        nav: nav.nav,
                        before: nav.before,
                        chapter:IndexWriter.data.book[i].chapter[j]
                    });
                }
                    
            }
        }
    };
    this.addBook = function(bk){
        if(bk != null){
            var Book = bk;
        }else{
            var Book = {
                title: window.prompt("Enter the book title.", "Y. M. General Conference"),
                chapter: []
            };
            var lastBook = IndexWriter.data.book.pop();
            var chapterpane, divindex;
            Book.index = lastBook !=null?(Number(lastBook.index)+ 1):0;
        
            if(lastBook !=null){
                IndexWriter.data.book.push(lastBook, Book);
            }else{
                IndexWriter.data.book.push(Book);
            }
        }
        
        
        var bookLiInner = '<a href="#'+IndexWriter.data.coursenum+'book'+Book.index+'">'+Book.title+'</a>';
        var newBook = docreate('li', '', '',bookLiInner);
        var chapterIndexPane = docreate('div', 'tab-pane span5', IndexWriter.data.coursenum+'book'+Book.index);
        var chapterIndexNav = docreate('ul', 'nav nav-list', '', '<li class="nav-header">Chapters</li>');
        var addChapterli = docreate('li', '', '', '<a href="#"><i class="icon-plus"></i><b>Add a new Lesson</b></a>');            
        this.bookeditortab.insertBefore(newBook, this.addBookButton);
        chapterIndexNav.appendChild(addChapterli);
        chapterIndexNav = chapterIndexPane.appendChild(chapterIndexNav);
        this.chaptereditortab.appendChild(chapterIndexPane);
        this.bookLiSet.push(newBook);
        divindex = IndexWriter.divs.push({
            book: newBook, 
            chapter: []
        })-1;
        IndexWriter.divs[divindex].chapter.push(chapterIndexNav);
        addChapterli.onclick = chapterAddListener;
        
        $('#bookEditorTab a').click(function (e) {
            e.preventDefault();
            $(this).tab('show');
        });
        $(newBook).tab('show');
        function chapterAddListener(e){
            proto.addChapter({
                book: Book, 
                nav: chapterIndexNav, 
                before: this
            });
            e.preventDefault();
        }
        return {
            nav: chapterIndexNav, 
            before: addChapterli
        };
    };
    this.addChapter = function(args){
        var isNew = true, dataLoaded=false;
        args.lesson = {
            book: args.book.index
        };
        if(args.chapter == null){
            args.chapter = {
                title: prompt("Enter the lesson Title:", ""),
                author: prompt("Enter the Author's Name:", ""),
                index: args.book.chapter.length + 1
            };
            args.lesson.index= args.chapter.index;
            LessonWriter.data.chapter.push(args.lesson);
            args.book.chapter.push(args.chapter);
        }
        
        args.lesson.index= args.chapter.index;
        
        var id = 'book'+args.book.index+'ch'+args.chapter.index;
        var text = args.chapter.index+") "+args.chapter.author + " - "+args.chapter.title;
        var anchor = docreate('a', '', '', text);
        anchor.setAttribute('href','#');
        var newChapterLi = docreate('li', 'indexEditChapter',id);
        var toolBar = docreate('span', 'pull-right editChapterNav');
        var ncEdit = docreate('i', 'icon-pencil editButton');
        ncEdit.setAttribute('title', 'Add or Edit Text');
        var ncEditClips = docreate('i', 'icon-tag editButton');
        ncEditClips.setAttribute('title', 'Edit Audio Clips');
        var ncAddAudio = docreate('i', 'icon-headphones editButton');
        ncAddAudio.setAttribute('title', 'Add Audio Track');
        var ncRemoveSelf = docreate('i', 'icon-remove editButton');
        ncRemoveSelf.setAttribute('title', 'Delete Chapter');
        toolBar.appendChild(ncEdit);
        toolBar.appendChild(ncAddAudio);
        toolBar.appendChild(ncEditClips);
        toolBar.appendChild(ncRemoveSelf);
        anchor.appendChild(toolBar);
        newChapterLi.appendChild(anchor);
        args.nav.insertBefore(newChapterLi, args.before);
        anchor.onclick = function(e){
            e.preventDefault();
        }
        ncEdit.onclick      = editTextListener;
        ncEditClips.onclick = editClipsListener;
        ncAddAudio.onclick  = addTrackListener;
        ncRemoveSelf.onclick = addRemoveListener;
        
        function addRemoveListener(e){
            args.book.chapter.splice(args.chapter);
            LessonWriter.data.chapter.splice(args.lesson);
            ncEdit.onclick      = null;
            ncEditClips.onclick = null;
            ncAddAudio.onclick  = null;
            ncRemoveSelf.onclick = null;
            args.nav.removeChild(newChapterLi);
        }
        var ajxdat = 'course=1&book='+args.book.index+'&chapter='+args.lesson.index;
        
        function editTextListener(e){
            if(!dataLoaded){
                $.ajax({
                    url: urldata.lessonget,
                    data: ajxdat,
                    type: 'get',
                    dataType: 'json',
                    success: function(data){
                        args.lesson = data;
                        isNew = false;
                    },
                    error: function(msg){
                        console.log(msg.error());
                    },
                    complete:function(j, txt){
                        console.log(txt);
                        dataLoaded=true;
                        proto.editChapterText({
                            madeNew: isNew,
                            chapter: args.lesson,
                            book: args.book
                        });
                    }
                });
                
            }else{
                proto.editChapterClips({
                    madeNew: isNew,
                    chapter: args.lesson,
                    book: args.book
                });
            }
            e.preventDefault();
        }
        function editClipsListener(e){
            if(!dataLoaded){
                $.ajax({
                    url: urldata.lessonget,
                    data: ajxdat,
                    type: 'get',
                    dataType: 'json',
                    success: function(data){
                        args.lesson = data;
                        isNew = false;
                    },
                    error: function(msg){
                        console.log(msg.error());
                    },
                    complete:function(j, txt){
                        console.log(txt);
                        dataLoaded=true;
                        proto.editChapterClips({
                            madeNew: isNew,
                            chapter: args.lesson,
                            book: args.book
                        });
                    }
                });
            }else{
                proto.editChapterClips({
                    madeNew: isNew,
                    chapter: args.lesson,
                    book: args.book
                });
            }
            e.preventDefault();
        }
        function addTrackListener(e){
            if(!dataLoaded){
                $.ajax({
                    url: urldata.lessonget,
                    data: ajxdat,
                    type: 'get',
                    dataType: 'json',
                    success:function(data){
                        isNew = false
                        args.lesson = data;
                    },
                    error: function(msg){
                        console.log(msg.error());
                    },
                    complete:function(j, txt){
                        console.log(txt);
                        dataLoaded=true;
                        proto.addChapterAudioTrack({
                            madeNew: isNew,
                            chapter: args.lesson
                        });
                    }
                        
                });
                
            }else{
                proto.editChapterClips({
                    madeNew: isNew,
                    chapter: args.lesson,
                    book: args.book
                });
            }
            e.preventDefault();
        }
    };
    this.editChapterText = function(args){
        if(LessonWriter.data.chapter.indexOf(args.chapter)<0){
            LessonWriter.data.chapter.push(args.chapter);
        }
        proto.chapterdecoder = new ChapterDecoder(args);
        console.log(args.makeNew? "New Chapter text":"Edit Chapter Text");
        if(args.madeNew){
            proto.chapterdecoder.getParagraphs({
                skip:false
            });
        }else{
            proto.chapterdecoder.editPreloadedParagraphs(args.chapter);
        }
    };
    this.editChapterClips = function(args){
        if(LessonWriter.data.chapter.indexOf(args.chapter)<0){
            LessonWriter.data.chapter.push(args.chapter);
        }
        var ac = IndexWriter.audioclipper;
            if(IndexWriter.audioclipper == null || args.chapter.index != ac.chapter.index){
                ac = new AudioClipper(args.chapter);
                ac.setAudioDiv();
                ac.getWaveForm();
            }
            proto.chapterDecoder = new ChapterDecoder({
                chapter: args.chapter,
                audioclipper: ac
            });
        if(args.madeNew){
            
            proto.chapterDecoder.getParagraphs({
                skip:true,
                toClipper: true
            });
        }else{
            proto.chapterDecoder.getParagraphs({
                skip:true,
                toClipper: true
            });
        }
    };
    this.addChapterAudioTrack = function(args){
        if(LessonWriter.data.chapter.indexOf(args.chapter)<0){
            LessonWriter.data.chapter.push(args.chapter);
        }
        var pop = document.getElementById('minipop');
        var bg = document.getElementById('popbackground');
        var afd = document.createElement('div');
        afd.setAttribute('class', 'well');
        var input = document.createElement('input');
        input.setAttribute('type', 'text');
        var submit = docreate('button', '', '', 'Done');
        pop.appendChild(input);
        pop.appendChild(submit);
        pop.appendChild(afd);
        $.ajax({
            url: 'audio/index.php',
            type: 'GET',
            success: function(data){
                pop.style.display = 'block';
                pop.style.width = '500px';
                $(pop).center();
                $(bg).show().center();
                afd.innerHTML = data;
                afd.onmouseup = function(){
                    input.setAttribute('value', getSelectedText().trim());
                }
                submit.onclick = addTheTrack;
            }
        });
        function addTheTrack(e){
            submit.onclick = null;
            pop.onmouseup = null;
            $(pop).hide();
            $(bg).hide();
            args.chapter.audio = {
                filename: input.getAttribute('value')
            };
            IndexWriter.audioclipper = new AudioClipper(args.chapter);
            IndexWriter.audioclipper.setAudioDiv();
            IndexWriter.audioclipper.getWaveForm();
        }
    };
    this.setListeners = (function(){
        proto.addBookButton.onmouseover = function(){
            proto.addBooki.classList.add('icon-white');
        };
        proto.addBookButton.onmouseout = function(){
            proto.addBooki.classList.remove('icon-white');
        }
        proto.addBookButton.onclick = addBookListener;
    })();
    function addBookListener(e){
        proto.addBook();
    }
}