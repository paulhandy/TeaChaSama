function docreate(_name, _class, _id, _inner){
    var d = document.createElement(_name);
    if(_class)
        d.setAttribute('class', ''+_class);
    if(_id)
        d.setAttribute('id', ''+_id);
    if(_inner)
        d.innerHTML = _inner;
    return d;
}