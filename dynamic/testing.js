(function(){
    "use strict"
    var main = document.getElementById("main");
    console.log(main);
    var text = document.createTextNode("Helloworkdff");
    main.appendChild(
        document.createElement("P")
            .appendChild(text));
    console.log(main);
    
    var scripts = document.getElementById("scripts");
    
    window.game = {
        update: function() {
            console.log("game.update");
            text.nodeValue = game.text;            
        },
        
        reload: function() {
            location.reload(true);
            
        }
    
    }
    var game = window.game;
    game.text="word";
    
    
    
    var heartbeat = window.setInterval(function (){
        game.update();
        /*start heartbeat*/
        //dom.text.nodeValue= "Hellotime, seconds ".concat(foo);		
        /*end heartbeat*/				
        //foo++;
        //location.reload(true);
        //scripts.innerHtml = '<script src=testing.js></script>';
        
	}, 1000);
})();