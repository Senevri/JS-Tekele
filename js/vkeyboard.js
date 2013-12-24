$(document).ready(function(){
    var rawletters="abcdefghijklmnopqrstuvwxyzåäö";
    var ll = "";
    for(var l=0; l<rawletters.length; l++) {
        
        ll = ll.concat("<span>" + rawletters[l] + "</span>");
        //console.log(ll);
    }
    var $kbd = $('#keyboardstrip').append("<h3>"+ll+"</h3>");
    $kbd.css('position', 'fixed');
    $kbd.css('left', '10%');
    $('#kbdcontainer').on('mousemove', function(e) {
        //$('span').animate({'font-size': '100%'}, 200, function(){});
        $('span').css('font-size', '100%');
        //$kbd.css('left', e.offsetX + 'px');
        //console.log(e);
        
    });
    $('span').mouseover(function(e) {
        $('#kbdout').append($(e.currentTarget).html())
        //console.log(e);
        //$(e.currentTarget).animate({'font-size': '+=50%'}, 300, function() {});
    });
});