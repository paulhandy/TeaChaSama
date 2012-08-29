var VocabGlosser = {
    data: null
}
VocabGlosser.displayLines = function(){
    if(!VocabGlosser.data){
        return;
    }
    var i,j;
    $('#vocabglosser').html('');
    for(i=0;i<VocabGlosser.data.paragraph.en.length;i++){
        $('#vocabglosser').append('<p>');
        for(j=0;j<VocabGlosser.data.paragraph.en[i].line.length;j++){
            $('#vocabglosser').append('<a id="pickfrom'+i+'-'+j+'" class=glossline>'+VocabGlosser.data.paragraph.en[i].line[j].text+'</a>');
        }
        $('#vocabglosser').append('</p>');
    }
    $(popdiv).show().fitHeight().center();
    $(background).show().center();
    background.style.position = 'fixed';
    $('.glossline').bind('mouseup', function(){
        var id = $(this).attr('id').replace(/[^-\d]/g, '').split('-');
        var text = getSelectedText();
        if(text.length>0){
            VocabGlosser.glossText({
                id:id, 
                text:text
            });
        }
    });
};
VocabGlosser.glossText = function(args){
    console.log(args);
    var i,j, loc;
    args.found = [];
    var glosser = document.createElement('div');
    console.log(VocabGlosser.data);
    glosser.innerHTML = '<table><tr><td>Text: </td><td><input type="text" name="selected_text" id="hlt_txt" value="'+args.text+'"/></td></tr>\n\
    <tr><td>Translation: </td><td><input type="text" name="term_trans" id="v_tr_txt"/></td></tr></table>\n\
    <button id="submit_vocab">save</button>\n\
    <div id="glosstrans">'+VocabGlosser.data.paragraph.jp[args.id[0]].line[args.id[1]].text+'</div>\n\
    <div>Select from below lines which have related vocabluary words.</div>\n\
    <button id="select_every_line_glosser">select all</button><button id="deselect_every_line_glosser">Deselect all</button>\n\
    <ul id="glosser_related_lines_list"></ul>';
    // append glosser here
    glosser.setAttribute('class', 'row rounded-white');
    background.classList.add('forwardBackground');
    glosser.style.zIndex = '1002';
    $('body').append(glosser);
    $(glosser).center();
    for(i=0;i<VocabGlosser.data.paragraph.en.length;i++){
        for(j=0;j<VocabGlosser.data.paragraph.en[i].line.length;j++){
            loc = VocabGlosser.data.paragraph.en[i].line[j].text.indexOf(args.text);
            if(loc != -1){
                args.found.push[{
                    pg:i,
                    ln:j, 
                    inx: loc
                }];
                $('#glosser_related_lines_list').append('<li id=related'+(args.found.length-1)+'" class="related_line">'+VocabGlosser.data.paragraph.en[i].line[j].text+'</li>');
            }
        }
    }
    $(glosser).fitHeight();
    $('#submit_vocab').click(function(){
        VocabGlosser.data.vocab = VocabGlosser.data.vocab || [];
        args.text = $('#hlt_txt').attr('value');
        VocabGlosser.data.vocab.push({
            term: $('#hlt_txt').attr('value'),
            trans: $('#v_tr_txt').attr('value')
        });
        background.classList.remove('forwardBackground');
        $('.related_line.isRelated').each(function(){
            var ix = $(this).attr('id').replace(/[^\d]/g, '');
            VocabGlosser.data.paragraph.en[args.id[0]].line[args.id[1]].vocab = VocabGlosser.data.paragraph.en[args.id[0]].line[args.id[1]].vocab || [];
            console.log(args.found);
            VocabGlosser.data.paragraph.en[args.id[0]].line[args.id[1]].vocab.push({
                lineIndex: args.found[ix].inx,
                vocabIndex: VocabGlosser.data.vocab.indexOf(args.text)
            });
        });
        document.body.removeChild(glosser);
    });
    $('.forwardBackground').click(function(e){
        try{
            document.body.removeChild(glosser);
            background.classList.remove('forwardBackground');
        }catch(e){
            
        }
    });
    $('#glosstrans').bind('mouseup', function(){
        var txt = getSelectedText();
        $('#v_tr_txt').val(txt);
    });
    $('.related_line').click(function(){
        if(this.classList.contains('isRelated')){
            this.classList.remove('isRelated');
        }else{
            this.classList.add('isRelated');
        }
    });
    $('#select_every_line_glosser').click(function(){
        $('.related_line').each(function(){
            this.classList.add('isRelated');
        })
    });
    $('#deselect_every_line_glosser').click(function(){
        $('.related_line').each(function(){
            this.classList.remove('isRelated');
        })
    });
};
function getSelectedText(){
    var t = '';
    // the following if/else statement was borrowed from CodeToad at
    // http://www.codetoad.com/javascript_get_selected_text.asp
    if(window.getSelection){
        t = window.getSelection();
    }else if(document.getSelection){
        t = document.getSelection();
    }else if(document.selection){
        t = document.selection.createRange().text;
    }
    return String(t);
}