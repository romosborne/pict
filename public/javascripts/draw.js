var lineTool;
var incomingPaths = {};
var incomingTools = {};

$(document).ready(function(){
    paper.install(window);
    paper.setup('draw');
    paper.view.setViewSize(1000, 600);

    $('#tool-thickness').slider()
        .on('slide', function(event){
            $('#tool-thickness-display').val(event.value);
            lineTool.thickness=event.value;
        });

    function onMouseDown(event){
        var color = randomColor();
        drawNewPath(event.point, lineTool.thickness, color, io.id);
        emitNewPath(event.point, lineTool.thickness, color);
    }

    lineTool = new Tool();
    lineTool.thickness = 10;
    lineTool.minDistance = 10;
    lineTool.onMouseDown = onMouseDown;
    lineTool.onMouseDrag = function(event){
        appendToPath(event.point, io.id);
        emitPathPoint(event.point);
    }
    lineTool.activate();
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
    path.strokeColor=color;
    path.strokeCap='round';
    path.add(point);
    incomingPaths[sessionId] = path;
    paper.view.draw();
}

function appendToPath(point, sessionId){
    incomingPaths[sessionId].add(point);
    paper.view.draw();
}

function emitNewPath(point, thickness, color){
    var data = {
        point: point,
        thickness: thickness,
        color: color,
        sessionId: io.id
    };

    io.emit('newPath', data);
}

function emitPathPoint(point){
    var data = {
        point: point,
        sessionId: io.id
    };

    io.emit('pathPoint', data);
}

io.on('newPath', function( data ){
    drawNewPath(data.point, data.thickness, data.color, data.sessionId);
});

io.on('pathPoint', function( data ){
    appendToPath(data.point, data.sessionId)
});

io.on( 'drawCircle', function( data ) {
  drawCircle( data.x, data.y, data.radius, data.color );
});

io.on('your-turn', function(data){
    console.log("my turn: " + data);
    lineTool.activate();
    $('#word-to-draw').text(data);
});

io.on('turn-start', function(data){
    console.log("turn start");
    lineTool.remove();
    $('#word-to-draw').text(data + " drawing...");
});

io.on('successful-guess', function(data){
    
});
