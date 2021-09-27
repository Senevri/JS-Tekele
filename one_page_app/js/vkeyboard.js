$(document).ready(function(){
    // Create keyboard.
    var rawletters="abcdefghijklmnopqrstuvwxyzåäö";
    var symbols=",.-'\"!;:"
    var specialkeys=[
        "[backspace]",
        "[space]",
        "[enter]",
        "[caps]"
    ]

    keyboard = {}

    function spanWrapEach(keys){
        if (typeof keys === 'string' || keys instanceof String) {
            key_list = keys.split("")
        } else { key_list = keys }
        var buf=""
        key_list.forEach((key)=> {
            buf = buf.concat(
                "<span class=\"vkeyboard\">" + key +"</span>")
        })
        return buf
    }
    keyboard['lcase'] = spanWrapEach(rawletters)
    keyboard['ucase'] = spanWrapEach(rawletters.toUpperCase())
    keyboard['symbols'] = spanWrapEach(symbols)
    keyboard['special'] = spanWrapEach(specialkeys)



    //if keyboardstrip is empty, populate it.
    if ($('#keyboardstrip').is(':empty')) {
        var $kbd = $('#keyboardstrip')
        for (row_name in keyboard) {
            $kbd.append("<h3 id='"+row_name+"'>"+keyboard[row_name]+"</h3>")
        }
        $kbd.css('position', 'fixed');
        $kbd.css('left', '10%');
    }

    $("#ucase").hide()

    $('#kbdcontainer').on('mousemove', function(e) {
        //$('span').animate({'font-size': '100%'}, 200, function(){});
        $('span').css('font-size', '100%');
        //$kbd.css('left', e.offsetX + 'px');
        //console.log(e);

    });

    let handleBackspace = ()=>{
        _txt = $('#kbdout').html()
        if (_txt.slice(-4,0) == "<br/>") {
            $('#kbdout').html(_txt.slice(0,-4))
        }else {
            $('#kbdout').html(_txt.slice(0,-1))
        }
    }

    // could do something clever with mouseover?
    $('span').click(function(e) {
        let _parent_id = $(e.currentTarget).parent().attr("id")
        if (["lcase", "ucase", "symbols"].includes(_parent_id)) {
            $('#kbdout').append($(e.currentTarget).html())
            //console.log(e);
            $(e.currentTarget).animate({'font-size': '+=10%'}, 100, function() {});
        } else {
            cmds = {
                "[backspace]":handleBackspace,
                "[space]":()=>{$('#kbdout').append(" ")},
                "[enter]":()=>{$('#kbdout').append("<br/>")},
                "[caps]":()=>{$("#ucase").toggle();$("#lcase").toggle()},
            }
            cmds[e.currentTarget.innerText]()
        }
    });
});