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

var Game = function(){
    this.CurrentWord = "";
    this.WordsDone = [];

    this.GetNextWord = function(){
        var item = words[Math.floor(Math.random()*words.length)];
        while(item in this.wordsDone){
            var item = words[Math.floor(Math.random()*words.length)];
        }
        this.wordsDone.append(item);
        return item;
    };
};

$(document).ready(function(){
});