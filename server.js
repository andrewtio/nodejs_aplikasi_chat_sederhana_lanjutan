var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
// var diatas saling berhubungan satu sama lain lewat parameternya di paling belakang

// req & res merupakan callback
app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

//---------- BACKEND ---------------//

io.on('connection', function(socket){
    // kalo ada message baru, newMessage adalah parameter yang harus sama dengan frontend
    socket.on('newMessage', function(msg){
        io.emit('newMessage', msg);
        console.log('Chat baru: ' + msg);
    });
    //
    // kalo user disconnect
    socket.on('disconnect', function(msg){
        console.log('user disconnected');
    });
});

http.listen(3000, function(){
    console.log('listening on 3000...');
});