
// Express requires these dependencies
var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
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
    res.send(users);
});
app.get('/reset', function(req, res){
    res.send('game reset');
    users=[];
});
app.get('/next-word', function(req, res){
    res.send(game.GetNextWord());
});
app.get('/guess/:word', function(req, res){
    res.send(game.IsCloseGuess(req.params.word));
});

// Enable Socket.io
var server = http.createServer(app).listen( app.get('port') );
var io = require('socket.io').listen( server );

var Game = function(){
    this.CurrentWord = "";
    this.WordsDone = [];

    this.GetNextWord = function(){
        if(words.length === this.WordsDone.length) return null;

        var item = words[Math.floor(Math.random()*words.length)];
        while(item in this.WordsDone){
            var item = words[Math.floor(Math.random()*words.length)];
        }
        this.WordsDone.push(item);
        this.CurrentWord = item;
        return item;
    };

    this.IsCloseGuess = function(guess){
        var closeGuesses = [];
        if(this.CurrentWord == null) return null;
        if(guess == null) return null;
        var currentSplits = this.CurrentWord.Split(' ');
        var guessSplits = guess.Split(' ');

        for(guessSplit in guessSplits){
            for(currentSplit in currentSplits){
                if(guessSplit.substring(0, 3).toUpperCase() === currentSplit.substring(0, 3).toUpperCase()){
                    closeGuesses.push(guessSplit);
                }
            }
        }

        var result = new Set(closeGuesses);
        if( result.size === 0 ) return null;

        return result;
    };
};

var users = [];
var game = new Game();

// A user connects to the server (opens a socket)
io.sockets.on('connection', function (socket) {
  socket.on('newPath', function( data, session ){
      socket.broadcast.emit( 'newPath', data);
  });

  socket.on('pathPoint', function( data, session){
      socket.broadcast.emit('pathPoint', data);
  });

  socket.on('sendMessage', function(data, session) {

      io.sockets.emit('message', data);
  });

  socket.on('user-name', function(data, session){
      io.sockets.emit('user-join', data);
      users.push({id:session.id, name:data, score:0});
      io.sockets.emit('update-scores', users);
  });

  socket.on('game-start', function(data, session){
  });

  socket.on('game-progress', function(data, session){
  });

  socket.on('game-end', function(data, session){
  });

  socket.on('game-progress', function(data, session){
  });
});


var words = [
    "The Godfather",
    "The Shawshank Redemption",
    "Schindler's List",
    "Raging Bull",
    "Casablanca",
    "Citizen Kane",
    "Gone with the Wind",
    "The Wizard of Oz",
    "One Flew Over the Cuckoo's Nest",
    "Lawrence of Arabia",
    "Vertigo",
    "Psycho",
    "The Godfather: Part II",
    "On the Waterfront",
    "Sunset Boulevard",
    "Forrest Gump",
    "The Sound of Music",
    "12 Angry Men",
    "West Side Story",
    "Star Wars: Episode IV - A New Hope",
    "2001: A Space Odyssey",
    "E.T. the Extra-Terrestrial",
    "The Silence of the Lambs",
    "Chinatown",
    "The Bridge on the River Kwai",
    "Singin' in the Rain",
    "It's a Wonderful Life",
    "Dr. Strangelove or: How I Learned to Stop Worrying and Love the Bomb",
    "Some Like It Hot",
    "Ben-Hur",
    "Apocalypse Now",
    "The Lord of the Rings: The Return of the King",
    "Gladiator",
    "Amadeus",
    "Titanic",
    "From Here to Eternity",
    "Saving Private Ryan",
    "Unforgiven",
    "Raiders of the Lost Ark",
    "Rocky",
    "A Streetcar Named Desire",
    "The Philadelphia Story",
    "To Kill a Mockingbird",
    "An American in Paris",
    "The Best Years of Our Lives",
    "My Fair Lady",
    "A Clockwork Orange",
    "Doctor Zhivago",
    "Patton",
    "Jaws",
    "Braveheart",
    "Butch Cassidy and the Sundance Kid",
    "The Good, the Bad and the Ugly",
    "The Treasure of the Sierra Madre",
    "The Apartment",
    "Platoon",
    "High Noon",
    "Dances with Wolves",
    "Jurassic Park",
    "The Pianist",
    "The Exorcist",
    "Goodfellas",
    "The Deer Hunter",
    "All Quiet on the Western Front",
    "Bonnie and Clyde",
    "The French Connection",
    "City Lights",
    "It Happened One Night",
    "A Place in the Sun",
    "Midnight Cowboy",
    "Mr. Smith Goes to Washington",
    "Rain Man",
    "Annie Hall",
    "Tootsie",
    "Fargo",
    "Giant",
    "The Grapes of Wrath",
    "Shane",
    "The Green Mile",
    "Close Encounters of the Third Kind",
    "Nashville",
    "Network",
    "The Graduate",
    "American Graffiti",
    "Good Will Hunting",
    "Terms of Endearment",
    "Pulp Fiction",
    "The African Queen",
    "Stagecoach",
    "Mutiny on the Bounty",
    "The Great Dictator",
    "The Maltese Falcon",
    "Wuthering Heights",
    "Double Indemnity",
    "Taxi Driver",
    "Rebel Without a Cause",
    "Rear Window",
    "The Third Man",
    "North by Northwest",
    "Yankee Doodle Dandy"
];
