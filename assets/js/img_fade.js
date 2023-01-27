// $(window).scroll(function() {
//     if ($(this).scrollTop()> 0) {
//         $('.image').fadeOut();
//      }
//     else {
//       $('.image').fadeIn();
//      }
//  });

 $(window).bind('scroll', function() {
    if ($(window).scrollTop() > 0) {
        $('#photo').hide();
    }
    else {
        $('#photo').show();
    }
});