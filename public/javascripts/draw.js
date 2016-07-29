var lineTool;
var incomingPaths = {};

$(document).ready(function(){
    paper.install(window);
    paper.setup('draw');

    $('#tool-thickness').slider()
        .on('slide', function(event){
            $('#tool-thickness-display').val(event.value);
            lineTool.thickness=event.value;
        });

    function onMouseDown(event){
        var color = randomColor();
        drawNewPath(event.point, lineTool.thickness, color, io.socket.sessionId);
        emitNewPath(event.point, lineTool.thickness, color);
    }

    lineTool = new Tool();
    lineTool.minDistance = 10;
    lineTool.onMouseDown = onMouseDown;
    lineTool.onMouseDrag = function(event){
        appendToPath(event.point, io.socket.sessionId);
        emitPathPoint(event.point);
    }
    lineTool.activate()
});


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

function drawCircle( x, y, radius, color ) {
  // Render the circle with Paper.js
  var circle = new paper.Path.Circle( new Point( x, y ), radius );
  circle.fillColor = new RgbColor( color.red, color.green, color.blue, color.alpha );

  // Refresh the view, so we always get an update, even if the tab is not in focus
  paper.view.draw();
} 
 
function drawRectangle(x1, y1, x2, y2, color){
    var rectangle = new paper.Path.Rectangle(new Point(x1, y1), new Point(x2, y2));
    rectangle.fillColor = new RgbColor(color.red, color.green, color.blue, color.alpha);
    paper.view.draw();
}

function drawNewPath(point, thickness, color, sessionId){
    path = new Path();
    path.strokeWidth=thickness;
    path.strokeColor=randomColor();
    path.add(point);
    incomingPaths[sessionId] = path;
    paper.view.draw();
}

function appendToPath(point, sessionId){
    incomingPaths[sessionId].add(point);
    paper.view.draw();
}

function emitNewPath(point, thickness, color){
    var sessionId = io.socket.sessionId;
    var data = {
        point: point,
        thickness: thickness,
        color: color,
        sessionId: sessionId
    };

    io.emit('newPath', data, sessionId);
}

function emitPathPoint(point){
    var sessionId = io.socket.sessionId;
    var data = {
        point: point,
        sessionId: sessionId
    };

    io.emit('pathPoint', data, sessionId);
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
  //console.log( data )

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
    //console.log(data);
}


io.on( 'drawRectangle', function( data ){
    drawRectangle(data.x1, data.y1, data.x2, data.y2, data.color);
});

io.on('newPath', function( data ){
    drawNewPath(data.point, data.thickness, data.color, data.sessionId);
});

io.on('pathPoint', function( data ){
    appendToPath(data.point, data.sessionId)
});

// Listen for 'drawCircle' events
// created by other users
io.on( 'drawCircle', function( data ) {

  //console.log( 'drawCircle event recieved:', data );

  // Draw the circle using the data sent
  // from another user
  drawCircle( data.x, data.y, data.radius, data.color );
  
})
