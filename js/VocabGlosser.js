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
        for(j=0;j<VocabGlosser.data.paragraph.en[i].line.length;j++){
            $('#vocabglosser').append('<a id="pickfrom'+i+'-'+j+'" class=glossline>'+VocabGlosser.data.paragraph.en[i].line[j].text+'</a>');
        }
    }
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
    var i,j, loc;
    args.found = [];
    var glosser = document.createElement('div');
    glosser.innerHTML = '<table><tr><td>Text: </td><td><input type="text" name="selected_text" id="hlt_txt" /></td></tr>\n\
    <tr><td>Translation: </td><td><input type="text" name="term_trans" id="v_tr_txt"/></td></tr></table>\n\
    <button id="submit_vocab">save</button>\n\
    <div id="glosstrans">'+VocabGlosser.data.paragraph.jp[i].line[j].text+'</div>\n\
    <div>Select from below lines which have related vocabluary words.</div>\n\
    <button id="select_every_line_glosser">select all</button><button id="deselect_every_line_glosser">Deselect all</button>\n\
    <ul id="glosser_related_lines_list"></ul>';
    $('#hlt_txt').attr('value', args.text);
    for(i=0;i<VocabGlosser.data.paragraph.en.length;i++){
        for(j=0;j<VocabGlosser.data.paragraph.en[i].line.length;j++){
            loc = VocabGlosser.data.paragraph.en[i].line[j].text.indexOf(args.data);
            if(loc>-1){
                args.found.push[{
                    pg:i,
                    ln:j, 
                    inx: loc
                }]
            };
            $('#glosser_related_lines_list').append('<li id=related'+(args.found.length-1)+'" class="related_line">'+VocabGlosser.data.paragraph.en[i].line[j].text+'</li>');
        }
    }
    // append glosser here
    glosser.setAttribute('class', 'row rounded-white');
    document.body.appendChild(glosser);
    $('#submit_vocab').click(function(){
        VocabGlosser.data.vocab = VocabGlosser.data.vocab || [];
        args.text = $('#hlt_txt').attr('value');
        VocabGlosser.data.vocab.push({
            term: $('#hlt_txt').attr('value'),
            trans: $('#v_tr_txt').attr('value')
        });
        $('.related_line.isRelated').each(function(){
            var ix = $(this).attr('id').replace(/[^\d]/g, '');
            VocabGlosser.data.paragraph.en[i].line[j].vocab = VocabGlosser.data.paragraph.en[i].line[j].vocab || [];
            VocabGlosser.data.paragraph.en[i].line[j].vocab.push({
                lineIndex: args.found.inx,
                vocabIndex: VocabGlosser.data.vocab.indexOf(args.text)
            });
        });
        document.body.removeChild(glosser);
    });
    $('#glosstrans').bind('mouseup', function(){
        var txt = getSelectedText();
        $('#v_tr_txt').attr(val, txt);
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