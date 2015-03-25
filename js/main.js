

// resize content area to window height and width
$( document ).ready(function() {
    $(window).on('resize', resizeContainer);
    resizeContainer();
    
});

function resizeContainer() {
    $('#content-container').css('height',$(window).height()+'px');
    $('#content-container').css('width',$(window).width()+'px');
}

