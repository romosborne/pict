var username = "";

$(document).ready(function(){

    $("#usernameModal").modal('show');

    $("#username-form").submit(function(event){
        event.preventDefault();
    });

    $('#enter-username').click(function(){
        username = $("#username-input").val();
        io.emit('user-name', {sessionId:io.id, name:username});
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

    $('#ready-checkbox').click(function(){
        if($('#ready-checkbox').is(':checked')){
            io.emit('ready', {isReady:true, sessionId:io.id});
        }
        else{
            io.emit('ready', {isReady:false, sessionId:io.id});
        }
    });
});

io.on('message', function (data) {
    $('#chat-list').append("<li class='single-message'><span class='sender-name'>"+data.username+":</span> <span class='message-content'> "+ data.message+"</span></li>");
    var chatWindow = $("#chatWindow");
    var height = chatWindow[0].scrollHeight;
    chatWindow.scrollTop(height);
});

io.on('close-guess', function(data){
    $('#chat-list').append("<li class='close-guess'><span>Your guess was close! " + data.toString() + "</span></li>");
    var chatWindow = $("#chatWindow");
    var height = chatWindow[0].scrollHeight;
    chatWindow.scrollTop(height);
});

io.on('successful-guess', function(user){
});

io.on('user-join', function (data) {
    // Nothing at the moment, maybe make an annoying noise later...
});

io.on('game-started', function(data){
    $('#ready-checkbox').attr('disabled', true);
});

io.on('your-turn', function(data){
    console.log("It's my turn!");
});

io.on('turn-start', function(data){
    console.log("It's "+data+" turn");
});

io.on('update-scores', function(data){
    $('#scores-body').empty();

    data.sort(function(a, b){
        return a.score - b.score
    });

    data.forEach(function(entry){
        $('#scores-body').append("<tr><td>"+entry.name+"</td><td>"+entry.score+"</td></tr>");
    });
});

function sendMessage(){
        var text = $('#messageBox').val();
        if (text === "") return;
        $('#messageBox').val('');

        var sessionId = io.id;

        var data = {
            message: text,
            username: username
        };

      io.emit( 'sendMessage', data, sessionId )
}
