var username = "";

$(document).ready(function(){

    $("#usernameModal").modal('show');

    $("#username-form").submit(function(event){
        event.preventDefault();
    });

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

io.on('message', function (data) {
    console.log('received message: ', data);
    $('#chat-list').append("<li class='single-message'><span class='sender-name'>"+data.username+":</span> <span class='message-content'> "+ data.message+"</span></li>");
    var chatWindow = $("#chatWindow");
    var height = chatWindow[0].scrollHeight;
    chatWindow.scrollTop(height);
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
