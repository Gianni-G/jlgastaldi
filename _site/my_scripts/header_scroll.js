$(window).scroll(function(){
    $("#header_scroll").css("top", Math.max(0, 50 - $(this).scrollTop()));
});