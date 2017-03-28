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

    $('#clearButton').click(function(){
        io.emit('clear');
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

function startTimer(timeout, mode){
    console.log("timeout: " + timeout);
    $('#circleTimer').circletimer({
        onComplete: function(){
            io.emit('timerComplete', mode);
        },
        timeout: timeout
    });
    $('#circleTimer').circletimer("start");
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

io.on('clear', function(data){
    project.activeLayer.removeChildren();
    paper.view.draw();
})

io.on('your-turn', function(data){
    console.log("my turn: " + data);
    lineTool.activate();
    $('#word-to-draw').text(data);
    $('#messageBox').prop('disabled', true);
    startTimer(10000, 'initial');
});

io.on('turn-start', function(data){
    console.log("turn start");
    lineTool.remove();
    $('#word-to-draw').text(data + " drawing...");
    $('#messageBox').prop('disabled', false);
    startTimer(60000, 'initial');
});

io.on('successful-guess', function(data){
    startTimer(20000, 'straggler');
});
