
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

function findInArray(array, attr, value){
    for(var i=0; i<array.length; i+=1){
        if(array[i][attr] === value){
            return i;
        }
    }
    return -1;
}

function findInArray2(array, attr1, attr2, value){
    for(var i=0; i<array.length; i+=1){
        if(array[i][attr1][attr2] === value){
            return i;
        }
    }
    return -1;
}

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

    this.StartGame = function(){
        console.log("GameStarted");
        io.sockets.emit('game-started');
        this.NextTurn();
    };

    this.AddPlayer = function(user){
        this.Users.push({id:user.id, name:user.name, score:0, turnsPlayed:0, ready:false});
    };

    this.SetReady = function(value, id){
        var index = findInArray(this.Users, 'id', id);
        this.Users[index].ready = value;

        var ready = true;
        for(var i = 0; i<this.Users.length; i++){
            ready = ready && this.Users[i].ready;
        }
        if(ready===true){
            this.StartGame();
        }
    };

    this.GetNextPlayer = function(){
        var lowestTurn = Math.min.apply(null, (this.Users.map(
            function(a) {
                return a.turnsPlayed;
            }
        )));

        console.log("LowestTurn: "+lowestTurn);

        if(lowestTurn === this.TurnsPerPlayer) {
            this.EndGame();
            return;
        }

        var nextPlayer = this.Users.filter(
            function(b){
                return (b.turnsPlayed === lowestTurn);
        })[0];

        console.log("NextPlayer: "+nextPlayer);
        console.log("Id: "+nextPlayer.id);

        var nextPlayerIndex = findInArray(this.Users, 'id', nextPlayer.id);
        this.Users[nextPlayerIndex].turnsPlayed++;
        return nextPlayer;
    };

    this.NextTurn = function(){
        var nextPlayer = this.GetNextPlayer();
        var nextWord = this.GetNextWord();

        io.to(nextPlayer.id).emit('your-turn', nextWord);

        console.log("Sending your-turn ("+nextWord+") to "+nextPlayer.id);
        for(var i=0; i<clients.length; i++){
            console.log(clients[i].id);
            if(clients[i].id !== nextPlayer.id){
                io.to(clients[i].id).emit('turn-start', nextPlayer.name);
            }
        }
    }

    this.EndGame = function(){
        console.log("GameEnded");
    }
};

var game = new Game(JSON.parse(fs.readFileSync("wordlist.json")).words);
var clients = [];

// A user connects to the server (opens a socket)
io.sockets.on('connection', function (socket) {
    clients.push(socket);
    socket.on('disconnect', function(){
        clients.splice(clients.indexOf(socket), 1);
    });

  socket.on('newPath', function( data ){
      socket.broadcast.emit( 'newPath', data);
  });

  socket.on('pathPoint', function( data){
      socket.broadcast.emit('pathPoint', data);
  });

  socket.on('sendMessage', function(data) {
      var guess = game.RateGuess(data.message);

      if(guess.Success === true){
          io.sockets.emit('successful-guess', data.username);
      } else if (guess.CloseWords.length > 0) {
          socket.emit('close-guess', guess.CloseWords);
      }
      else{
          io.sockets.emit('message', data);
      }
  });

  socket.on('user-name', function(data){
      io.sockets.emit('user-join', data);
      game.AddPlayer({id:socket.id, name:data.name});
      io.sockets.emit('update-scores', game.Users);
  });

    socket.on('ready', function(data){
        game.SetReady(data.isReady, socket.id);
    });
});
