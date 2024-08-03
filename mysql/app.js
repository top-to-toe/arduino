var fs = require('fs');
var ejs = require('ejs');
var http = require('http');
var mysql = require('mysql');

var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();  

// connect database
var mySqlClient = mysql.createConnection({
	user:'user1',
	password:'1234',
	database:'dht11'
});

// generate & excute express web server
var app = express();
http.createServer(app).listen(8000,function(){
	console.log('Server running at http://127.0.0.1:8000');
});

// http://localhost:8000/ ---- list.html
app.get('/',function(req,res)
{
	fs.readFile('list.html','utf8',function(error,data)
	{
		if(error)
		{
			console.log('readFile Error');
		}
		else
		{
			mySqlClient.query('select * from dev01', function(error,results)
			{
				if(error)
				{
					console.log('error: ', error.message);
				}
				else
				{
					res.send(ejs.render(data,{ prodList:results }));
				}
			});
		}
	})
});

// http://locakhost:8000/insert ------ insert.html 
app.get('/insert',function(req,res)
{
	fs.readFile('insert.html','utf8',function(error,data)
	{
		if(error)
		{
			console.log('read file error');
		}
		else
		{
			res.send(data);
		}
	})
});

// http://locakhost:8000/edit/3 ---- edit.html
app.get('/edit/:id',function(req,res)
{
	fs.readFile('edit.html','utf8',function(error,data)
	{
		mySqlClient.query('select * from dev01 where id = ?',
		[req.params.id], function(error,result)
		{
			if(error)
			{
				console.log('read file error');
			}
			else
			{
				res.send(ejs.render(data,{ dev01:result[0] }));
			}
		});
	});
});

// http://localhost:8000/delete/3 
app.get('/delete/:id',function(req,res)
{
	mySqlClient.query('delete from dev01 where id = ?',
	[req.params.id],function(error,result)
	{
		if(error)
		{
			console.log('delete error');
		}
		else
		{
			console.log('delete id = %d',req.params.id);
			res.redirect('/');	// return main
		}
	});
});

// handle parameter transfered by POST method
app.use(bodyParser.urlencoded({ extended: true }));

app.post( '/insert', function(req, res)
{
	var body = req.body;
	
	mySqlClient.query( 'insert into dev01(Temperature, Humidity) values(?,?,?)',
	[body.Temperature, body.Humidity],function(error,result)
	{
		if(error)
		{
			console.log('insert error: ', error.message);
		}
		else
		{
			res.redirect('/');
		}
	});
});

app.post( '/edit/:id', function(req, res)
{
	var body = req.body;
	
	mySqlClient.query( 'update dev01 set Temperature=?, Humidity=? where id=?',
	[body.Temperature,body.Humidity,body.id],function(error,result)
	{
		if(error)
		{
			console.log('update error: ', error.message);
		}
		else
		{
			res.redirect('/');
		}
	});
});
		
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;

// 저번 시간에 데이터베이스(dht11) 및 테이블(dev01) 생성, esp8266 보드와 dht11 센서를 통해 얻은 온/습도 데이터 추가의 과정에 관련된 웹 페이지 제작
// 수정 원본 파일 경로 - https://www.dropbox.com/scl/fo/sh05nl33unxil1bodb1mc/AJE8wRlpI8yu1agTkurYVgU/work/nodejs?rlkey=hxq3t8pivi9w75o1j59d4atfc&subfolder_nav_tracking=1&dl=0

// Nodejs prompt
// express mysql --ejs		// Embedded JavaScript Template 약자의 옵션 추가 입력
// 패키지 생성 후 자동 제공되는 입력 명령 수행
// npm은 mysql만 install (npm install mysql)
// 실행은 node app.js도 되긴하지만 SET DEBUG=mysql:* & npm start을 입력해도 실행됨.