function getSelectedText(){
    var t = '';
    /* the following if/else statement was borrowed from CodeToad at
     * http://www.codetoad.com/javascript_get_selected_text.asp
     */ 
    if(window.getSelection){
        t = window.getSelection();
    }else if(document.getSelection){
        t = document.getSelection();
    }else if(document.selection){
        t = document.selection.createRange().text;
    }
    return String(t);
}