jQuery.fn.center = function () {
    this.css("position", "absolute");
    this.css("top", Math.max(0, ($(window).height() - this.height()))/ 2 + $(window).scrollTop() + "px");
    this.css("left", Math.max(0,($(window).width() - this.width())) / 2 + $(window).scrollLeft() + "px");
    return this;
};
jQuery.fn.fitHeight = function() {   
    var children_height = 0;  
    this.children().each(function(){children_height += $(this).height();});
    this.height(Math.max(children_height, $('#main').height()));
    return this;
};