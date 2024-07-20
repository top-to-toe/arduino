const express  = require('express');

const app      = express();
 
const path = require('path');
 
const SerialPort = require('serialport').SerialPort;

const sp = new SerialPort( {

  path:'COM3',

  baudRate: 9600
});


const port = 3000;


var tx_str = "pw";
app.get('/btn0',function(req,res)

{
	tx_str = tx_str + '0';
	console.log("pw string is now: "+tx_str);
});

app.get('/btn1',function(req,res)

{
	tx_str = tx_str + '1';
	console.log("pw string is now: "+tx_str);
});
app.get('/btn2',function(req,res)

{
	tx_str = tx_str + '2';
	console.log("pw string is now: "+tx_str);
});
app.get('/btn3',function(req,res)

{
	tx_str = tx_str + '3';
	console.log("pw string is now: "+tx_str);
});
app.get('/btn4',function(req,res)

{
	tx_str = tx_str + '4';
	console.log("pw string is now: "+tx_str);
});
app.get('/btn5',function(req,res)

{
	tx_str = tx_str + '5';
	console.log("pw string is now: "+tx_str);
});
app.get('/btn6',function(req,res)

{
	tx_str = tx_str + '6';
	console.log("pw string is now: "+tx_str);
});
app.get('/btn7',function(req,res)

{
	tx_str = tx_str + '7';
	console.log("pw string is now: "+tx_str);
});
app.get('/btn8',function(req,res)

{
	console.log("pw string is now: "+tx_str);
});
app.get('/btn9',function(req,res)

{
	tx_str = tx_str + '9';
	console.log("pw string is now: "+tx_str);
});
app.get('/open1',function(req,res)

{
	tx_str = tx_str + '\n';
	console.log("pw string is now: "+tx_str);
	sp.write(tx_str, function(err){

		if (err) {

            return console.log('Error on write: ', err.message);

        }

		res.writeHead(200, {'Content-Type': 'text/plain'});

		res.end(tx_str);

	});
});

/*
app.get('/open1',function(req,res)

{
	tx_str = tx_str + '\n';
	console.log("pw string is now: "+tx_str);
});
*/


app.get('/reset',function(req,res)

{
	console.log("reset");
	tx_str = "pw";
	console.log("pw string is now: "+tx_str);
});


app.use(express.static(__dirname + '/public'));

 

app.listen(port, function() {

    console.log('listening on *:' + port);

});
