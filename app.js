var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var world = require('./public/js/server_world');

app.use(express.static(__dirname + '/public'));

app.get('/skysun', function(req, res){
    res.sendFile(__dirname + '/skysun.html');
});

app.get('/webvr', function(req, res){
    res.sendFile(__dirname + '/webvr.html');
});

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});


// Add code to adjust public/static folders
//
//app.use( express.static(__dirname + '/js'));



/*
app.get('/js/client_world.js', function(req, res){
    res.sendFile(__dirname + '/js/client_world.js');
});
*/

io.on('connection', function(socket){
    console.log('a user connected');

    var id = socket.id;
    world.addPlayer(id);

    var player = world.playerForId(id);
    socket.emit('createPlayer', player);

    socket.broadcast.emit('addOtherPlayer', player);

    socket.on('requestOldPlayers', function(){
        for (var i = 0; i < world.players.length; i++){
            if (world.players[i].playerId != id)
                socket.emit('addOtherPlayer', world.players[i]);
        }
    });
    socket.on('updatePosition', function(data){
        var newData = world.updatePlayerData(data);
        socket.broadcast.emit('updatePosition', newData);
    });
    socket.on('disconnect', function(){
        console.log('user disconnected');
        io.emit('removeOtherPlayer', player);
        world.removePlayer( player );
    });
    socket.on('seeObject', function(){
        console.log('Esta viendo el cubo');
    });

    socket.on('lookat', function(cube){
        console.log('Estas Mirando al cubo ' + cube);
    });

});

var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

http.listen(port, ip_address, function(){
    console.log( "Listening on " + ip_address + ", server_port " + port );
});

/*
http.listen(3000, function(){
   console.log('listening on *: 3000');
});
*/
