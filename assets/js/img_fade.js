// $(window).scroll(function() {
//     if ($(this).scrollTop()> 0) {
//         $('.image').fadeOut();
//      }
//     else {
//       $('.image').fadeIn();
//      }
//  });

// $('photo').hide();
// document.getElementsByClassName("image").style.visibility = "hidden";

var photo = document.getElementsByClassName("image");

photo[O].style.visibility = "hidden";

// $(window).bind('scroll', function() {
//     if ($(window).scrollTop() > 10) {
//         photo[O].style.visibility = "hidden";
//     }
//     else {
//         photo[O].style.visibility = "visible";
//     }
// });

$(window).scroll(function() {
    if ($(this).scrollTop()> 10) {
        photo[O].style.visibility = "hidden";
     }
    else {
      photo[O].style.visibility = "visible";
     }
 });