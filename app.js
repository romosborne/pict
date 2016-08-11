
// Express requires these dependencies
var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , fs = require('fs')
  , path = require('path');

var app = express();

// Configure our application
app.configure(function(){
  app.set('port', process.env.PORT || 9002);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

// Configure error handling
app.configure('development', function(){
  app.use(express.errorHandler());
});

// Setup Routes
app.get('/', routes.index);
app.get('/users', function(req, res){
    res.send(game.Users);
});
app.get('/reset', function(req, res){
    game.reset();
    res.send('game reset');
});
app.get('/next-word', function(req, res){
    res.send(game.GetNextWord());
});
app.get('/next-round', function(req, res){
    game.GetNextWord();
    io.sockets.emit('your-turn', game.CurrentWord);
    res.send(game.CurrentWord);
});


// Enable Socket.io
var server = http.createServer(app).listen( app.get('port') );
var io = require('socket.io').listen( server );

var Game = function(words){
    this.CurrentWord = "";
    
    this.Words = words;
    this.Users = [];
    
    this.WordsDone = [];

    this.GetNextWord = function(){
        if(this.Words.length === this.WordsDone.length) return null;

        var item = this.Words[Math.floor(Math.random()*this.Words.length)];
        while(item in this.WordsDone){
            var item = this.Words[Math.floor(Math.random()*this.Words.length)];
        }
        this.WordsDone.push(item);
        this.CurrentWord = item;
        return item;
    };

    this.RateGuess = function(guess){

        var Guess = function(){
            this.Success;
            this.CloseWords;
        };

        var output = new Guess();

        var closeGuesses = [];
        if(this.CurrentWord === null) return null;
        if(guess === null) return null;

        if(guess.toUpperCase() === this.CurrentWord.toUpperCase()){
            output.Success = true;
            return output;
        };

        var currentSplits = this.CurrentWord.split(' ');
        var guessSplits = guess.split(' ');

        guessSplits.forEach(function(guessSplit){
            currentSplits.forEach(function(currentSplit){
                if(guessSplit.substring(0, 3).toUpperCase() === currentSplit.substring(0, 3).toUpperCase()){
                    console.log(guessSplit);
                    closeGuesses.push(guessSplit);
                }
            });
        });

        closeGuesses.reduce(function(p, c){
            if (p.indexOf(c) < 0) p.push(c);
            return p;
        }, []);

        output.CloseWords = closeGuesses;

        return output;
    };

    this.StartGame = function(){};
    this.AddPlayer = function(user){
        this.Users.push({user:user, score:0, turnsPlayed:0});
    };
    this.GetNextPlayer = function(){
        var lowestTurn = Math.min(this.Users.map(function(a) {return a.turnsPlayed}));
        if(lowestTurn === this.TurnsPerPlayer) {
            this.EndGame();
            return;
        }
        var nextPlayer = this.Users.filter(function(a) {a.turnsPlayed === lowestTurn})[0];
        nextPlayer.turnsPlayed++;
        return nextPlayer;
    };

    this.EndGame = function(){}
};

var game = new Game(JSON.parse(fs.readFileSync("cinema.json")).words);

// A user connects to the server (opens a socket)
io.sockets.on('connection', function (socket) {
  socket.on('newPath', function( data, session ){
      socket.broadcast.emit( 'newPath', data);
  });

  socket.on('pathPoint', function( data, session){
      socket.broadcast.emit('pathPoint', data);
  });

  socket.on('sendMessage', function(data, session) {
      var guess = game.RateGuess(data.message);
      if (guess.CloseWords.length > 0) {
          socket.emit('close-guess', guess.CloseWords);
      }
      else if(guess.success === true){
          io.sockets.emit('successful-guess', data.username);
      }
      else{
          io.sockets.emit('message', data);
      }
  });

  socket.on('user-name', function(data, session){
      io.sockets.emit('user-join', data);
      game.AddPlayer({id:session.id, name:data});
      io.sockets.emit('update-scores', game.Users);
  });
});
