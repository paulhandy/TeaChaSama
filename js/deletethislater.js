







var stuffToSave = [];

var i, j;
var line = [];
var enline=[];
var jaline = [];
var newline = {};
for (i=0; i<foo.length; i++){
    line = [];
    enline=[];
    jaline = [];
    for(j=0; j< foo[i].rawlines.en.length; j++){
        newline = {
            text: foo[i].rawlines.en[j],
            translation: foo[i].rawlines.jp.length > j? foo[i].rawlines.jp[j] : undefined
        };
        enline.push({text: foo[i].rawlines.en[j]});
        jaline.push({text: foo[i].rawlines.jp[j]});
        line.push(newline);
    }
    stuffToSave.push({
        paragraph: [{line: line}],
        index: foo[i].rawlines.chapterIndex,
        book: 2,
        raw: {
            en: [{line: enline}],
            jp: [{line:jaline}]
        }
    });
    
}

var i, j;
for(i in LessonWriter.data.chapter){
    for(j in chapter.paragraph[0].line){
        LessonWriter.data.chapter[i].paragraph[0].line[j].clip = LessonWriter.data.chapter[i].en[0].line[j].clip
    }
}

