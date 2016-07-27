$(document).ready(function(){
    paper.install(window);
    paper.setup('draw');
});
// The faster the user moves their mouse
// the larger the circle will be
// We dont want it to be larger than this
//tool.maxDistance = 50;


// Returns an object specifying a semi-random color
// The color will always have a red value of 0
// and will be semi-transparent (the alpha value)
function randomColor() {
  
  return {
    red: 0,
    green: Math.random(),
    blue: Math.random(),
    alpha: ( Math.random() * 0.25 ) + 0.05
  };

}


// every time the user drags their mouse
// this function will be executed
function onMouseDrag(event) {

  // Take the click/touch position as the centre of our circle
  var x = event.middlePoint.x;
  var y = event.middlePoint.y;
  
  // The faster the movement, the bigger the circle
  var radius = event.delta.length / 2;
  
  // Generate our random color
  var color = randomColor();

  // Draw the circle 
  drawCircle( x, y, radius, color );
  
   // Pass the data for this circle
  // to a special function for later
  emitCircle( x, y, radius, color );

}

function onMouseUp(event){
    var p1 = event.downPoint;
    var p2 = event.point;
    var color = randomColor();
    drawRectangle(p1.x, p1.y, p2.x, p2.y, color);
    emitRectangle(p1.x, p1.y, p2.x, p2.y, color);
}


function drawCircle( x, y, radius, color ) {

  // Render the circle with Paper.js
  var circle = new paper.Path.Circle( new Point( x, y ), radius );
  circle.fillColor = new RgbColor( color.red, color.green, color.blue, color.alpha );

  // Refresh the view, so we always get an update, even if the tab is not in focus
  paper.view.draw();
} 
 
function drawRectangle(x1, y1, x2, y2, color){
    console.log("drawing rectangle!");
    var rectangle = new paper.Path.Rectangle(new Point(x1, y1), new Point(x2, y2));
    rectangle.fillColor = new RgbColor(color.red, color.green, color.blue, color.alpha);
    paper.view.draw();
}

// This function sends the data for a circle to the server
// so that the server can broadcast it to every other user
function emitCircle( x, y, radius, color ) {

  // Each Socket.IO connection has a unique session id
  var sessionId = io.socket.sessionid;
  
  // An object to describe the circle's draw data
  var data = {
    x: x,
    y: y,
    radius: radius,
    color: color
  };

  // send a 'drawCircle' event with data and sessionId to the server
  io.emit( 'drawCircle', data, sessionId )

  // Lets have a look at the data we're sending
  console.log( data )

}

function emitRectangle(x1, y1, x2, y2, color){
    var sessionId = io.socket.sessionid;

    var data = {
        x1: x1,
        y1: y1,
        x2: x2,
        y2: y2,
        color: color
    };

    io.emit( 'drawRectangle', data, sessionId);
    console.log(data);
}


io.on( 'drawRectangle', function( data ){
    console.log('drawRectangle: ', data);
    drawRectangle(data.x1, data.y1, data.x2, data.y2, data.color);
});

// Listen for 'drawCircle' events
// created by other users
io.on( 'drawCircle', function( data ) {

  console.log( 'drawCircle event recieved:', data );

  // Draw the circle using the data sent
  // from another user
  drawCircle( data.x, data.y, data.radius, data.color );
  
})
