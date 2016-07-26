var username = "";

$(document).ready(function(){

    $("#usernameModal").modal('show');

    $('#enter-username').click(function(){
        username = $("#username-input").val();
        $('#username').append(username);
    });


    $('#submit').click(function(){
        sendMessage();
    });

    $('#messageBox').keypress(function(e){
        var key = e.which;
        if(key == 13){
            sendMessage();
        }
    });
});

function sendMessage(){
        var text = $('#messageBox').val();
        if (text === "") return;
        $('#messageBox').val('');
    
        // Each Socket.IO connection has a unique session id
        var sessionId = io.socket.sessionid;
      
        // An object to describe the circle's draw data
        var data = {
            message: text,
            username: username
        };
    
      // send a 'drawCircle' event with data and sessionId to the server
      io.emit( 'sendMessage', data, sessionId )
    
      // Lets have a look at the data we're sending
      console.log( data )

}
