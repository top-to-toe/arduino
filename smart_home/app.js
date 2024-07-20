var express = require('express');
var app = express();

var http     = require('http').Server(app);
var io       = require('socket.io')(http);

var SerialPort = require('serialport').SerialPort;

var ReadlineParser = require('@serialport/parser-readline').ReadlineParser;

var parsers    = SerialPort.parsers;
var sp = new SerialPort( 
{

  path: 'COM7',

  baudRate: 9600,
});

var pw_str = "pw";

const parser = sp.pipe(new ReadlineParser({ delimiter: '\r\n' }));

sp.on('open', () => console.log('Port open'));

parser.on('data', function(data)
{
	if(data.substring(0,4) == "TEMP"){
		var temperature = data.substring(4);
		io.emit('temp', temperature);
		// console.log('temerature: ' + temperature + '℃');
	}
	else if(data.substring(0,4) == "HUMI"){
		var humidity = data.substring(4);
		io.emit('humi', humidity);
		// console.log('himidity: ' + humidity + '%');
	}
	else;
});

app.get('/gasfan_on',function(req,res)
{
	sp.write('gasfan_on\n', function(err){
		if (err) {
            return console.log('Error on write: ', err.message);
        }
        console.log('send: FAN On');
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.end('\r');
	});
});

app.get('/gasfan_off',function(req,res)
{
	sp.write('gasfan_off\n', function(err){
		if (err) {
            return console.log('Error on write: ', err.message);
        }
        console.log('send: FAN Off');
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.end('\r');
	});
});

app.get('/light_on',function(req,res)
{
        console.log('Light On');
	sp.write('light_on\n', function(err){
		if (err) {
            return console.log('Error on write: ', err.message);
        }
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.end('\r');
	});
});

app.get('/light_off',function(req,res)
{
	sp.write('light_off\n', function(err){
		if (err) {
            return console.log('Error on write: ', err.message);
        }
        console.log('send: FAN Off');
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.end('\r');
	});
});

app.get('/window_open',function(req,res)
{
	sp.write('window_open\n', function(err){
		if (err) {
            return console.log('Error on write: ', err.message);
        }
        console.log('send: Watwer valve open');
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.end('\r');
	});
});


app.get('/btn0',function(req,res)

{
	pw_str = pw_str + '0';
	console.log(pw_str);
});
app.get('/btn1',function(req,res)

{
	pw_str = pw_str + '1';
	console.log(pw_str);
});
app.get('/btn2',function(req,res)

{
	pw_str = pw_str + '2';
	console.log(pw_str);
});
app.get('/btn3',function(req,res)

{
	pw_str = pw_str + '3';
	console.log(pw_str);
});
app.get('/btn4',function(req,res)

{
	pw_str = pw_str + '4';
	console.log(pw_str);
});
app.get('/btn5',function(req,res)

{
	pw_str = pw_str + '5';
	console.log(pw_str);
});
app.get('/btn6',function(req,res)

{
	pw_str = pw_str + '6';
	console.log(pw_str);
});
app.get('/btn7',function(req,res)

{
	pw_str = pw_str + '7';
	console.log(pw_str);
});
app.get('/btn8',function(req,res)

{
	pw_str = pw_str + '8';
	console.log(pw_str);
});
app.get('/btn9',function(req,res)

{
	pw_str = pw_str + '9';
	console.log(pw_str);
});
app.get('/reset',function(req,res)

{
	pw_str="pw";
	console.log(pw_str);
});
app.get('/open_door',function(req,res)

{
	pw_str=pw_str + '\n';
	
	sp.write(pw_str, function(err){
		if (err) {
            return console.log('Error on write: ', err.message);
        }
        console.log('send: Watwer valve close');
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.end('\r');
	});
	pw_str="pw";
	console.log(pw_str);
	
});

app.get('/window_close',function(req,res)
{
	sp.write('window_close\n', function(err){
		if (err) {
            return console.log('Error on write: ', err.message);
        }
        console.log('send: Watwer valve close');
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.end('\r');
	});
});

app.get('/vent_pos0',function(req,res)
{
	sp.write('SERVO0\n\r', function(err){
		if (err) {
            return console.log('Error on write: ', err.message);
        }
        console.log('send: Vent shutter close');
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.end('\r');
	});
});

app.get('/vent_pos1',function(req,res)
{
	sp.write('SERVO1\n\r', function(err){
		if (err) {
            return console.log('Error on write: ', err.message);
        }
        console.log('send: Vent shutter open untill position1');
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.end('\r');
	});
});

app.get('/vent_pos2',function(req,res)
{
	sp.write('SERVO2\n\r', function(err){
		if (err) {
            return console.log('Error on write: ', err.message);
        }
        console.log('send: Vent shutter open untill position2');
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.end('\r');
	});
});

app.use(express.static(__dirname + '/public'));

http.listen(3000, function(){
    console.log('listening on *:3000');
});
