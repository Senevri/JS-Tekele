$(document).ready(function(){
    // Create keyboard.
    var rawletters="abcdefghijklmnopqrstuvwxyzåäö";
    var mystring = "";
    
    for(var l=0; l<rawletters.length; l++) {        
        mystring = mystring.concat("<span class=\"vkeyboard\">" + rawletters[l] + "</span>");
        //console.log(mystring);
    }
    
    //if keyboardstrip is empty, populate it.
    if ($('#keyboardstrip').is(':empty')) {
        var $kbd = $('#keyboardstrip').append("<h3>"+mystring+"</h3>");
        $kbd.css('position', 'fixed');
        $kbd.css('left', '10%');
    }
    
    $('#kbdcontainer').on('mousemove', function(e) {
        //$('span').animate({'font-size': '100%'}, 200, function(){});
        $('span').css('font-size', '100%');
        //$kbd.css('left', e.offsetX + 'px');
        //console.log(e);
        
    });
    
    // could do something clever with mouseover?
    $('span').click(function(e) {
        $('#kbdout').append($(e.currentTarget).html())
        //console.log(e);        
        $(e.currentTarget).animate({'font-size': '+=10%'}, 100, function() {});
    });
});