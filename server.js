//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//
var http = require('http');
var path = require('path');

var async = require('async');
//var socketio = require('socket.io');
var express = require('express');

var bodyParser = require('body-parser');

//
// ## SimpleServer `SimpleServer(obj)`
//
// Creates a new instance of SimpleServer with the following options:
//  * `port` - The HTTP port to listen on. If `process.env.PORT` is set, _it overrides this value_.
//
var app = express();
//var server = http.createServer(router);
var server = http.createServer(app);
//var io = socketio.listen(server);

var proxy = require('./proxy');

app.use(bodyParser.json()); // get information from html forms
//app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(function(req, res, next){
  console.log('req.url: ' + req.url);
  next();
});

app.use(proxy);


app.get('/data',function(req, res, next){
    res.sendFile(path.join(__dirname+'/data.json'));
	//next();
});

app.get('/',function(req, res, next){
    res.sendFile(path.join(__dirname+'/index.html'));
	//next();
});

/*
app.use(function(req,res,next){
    
    console.log("unhandled request");
    console.log(req.query);
    next();
});
*/

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Server listening at", addr.address + ":" + addr.port);
});
