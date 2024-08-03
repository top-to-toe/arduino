var fs = require('fs');
var ejs = require('ejs');
var http = require('http');
var mysql = require('mysql');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// 데이터베이스 연결 설정
var mySqlClient = mysql.createConnection({
	user: 'user1',
	password: '1234',
	database: 'dht11'
});

// Express 웹 서버 생성 및 실행
http.createServer(app).listen(8000, function () {
	console.log('Server running at http://127.0.0.1:8000');
});

// 홈 페이지 라우트 (http://localhost:8000/)
// list.html 파일을 읽어 데이터베이스에서 데이터를 조회하여 렌더링
app.get('/', function (req, res) {
	fs.readFile('list.html', 'utf8', function (error, data) {
		if (error) {
			console.log('readFile Error'); // 파일 읽기 오류
		} else {
			mySqlClient.query('select * from dev01', function (error, results) {
				if (error) {
					console.log('error: ', error.message); // 쿼리 오류
				} else {
					res.send(ejs.render(data, { dht: results })); // 조회된 데이터를 ejs 템플릿에 전달
				}
			});
		}
	});
});

// 데이터 입력 페이지 라우트 (http://localhost:8000/insert)
// insert.html 파일을 읽어 클라이언트에게 전송
app.get('/insert', function (req, res) {
	fs.readFile('insert.html', 'utf8', function (error, data) {
		if (error) {
			console.log('read file error'); // 파일 읽기 오류
		} else {
			res.send(data); // 파일 내용을 클라이언트에게 전송
		}
	});
});

// 데이터 수정 페이지 라우트 (http://localhost:8000/edit/:id)
// URL 파라미터에서 ID를 추출하여 해당 데이터 조회
// 주석 처리된 코드는 클라이언트가 JSON 형식으로 데이터를 받도록 설계된 코드
// app.get('/edit/:id', function (req, res) {
//     mySqlClient.query('select * from dev01 where id = ?', [req.params.id], function (error, result) {
//         if (error) {
//             console.log('read file error');
//             res.status(500).send({ error: '데이터를 가져오는 중 오류 발생' });
//         } else {
//             res.json({ dev01: result });
//         }
//     });
// });

app.get('/edit/:id', function (req, res) {
	mySqlClient.query('select * from dev01 where id = ?', [req.params.id], function (error, result) {
		if (error) {
			console.error('Edit query error:', error.message); // 쿼리 오류 로그
			res.status(500).send({ error: '데이터를 가져오는 중 오류 발생' }); // 오류 응답
		} else {
			res.json({ dev01: result }); // 조회된 데이터 반환
		}
	});
});

// 데이터 삭제 라우트 (http://localhost:8000/delete/:id)
// URL 파라미터에서 ID를 추출하여 해당 데이터 삭제
app.get('/delete/:id', function (req, res) {
	mySqlClient.query('delete from dev01 where id = ?', [req.params.id], function (error, result) {
		if (error) {
			console.log('delete error'); // 삭제 오류
		} else {
			console.log('delete id = %d', req.params.id); // 삭제된 ID 로그
			res.redirect('/'); // 성공 시 홈 페이지로 리다이렉트
		}
	});
});

// POST 메소드로 전달된 파라미터 처리
app.use(bodyParser.urlencoded({ extended: true }));

// 데이터 입력 라우트 (POST 요청)
// 폼 데이터에서 온도와 습도 값을 추출하여 데이터베이스에 삽입
app.post('/insert', function (req, res) {
	var body = req.body;

	console.log('Insert request body:', body); // 요청 데이터 로그

	mySqlClient.query('insert into dev01(Temperature, Humidity) values(?, ?)', [body.Temperature, body.Humidity], function (error, result) {
		if (error) {
			console.error('Insert error: ', error.message); // 삽입 오류 로그
		} else {
			res.redirect('/'); // 성공 시 홈 페이지로 리다이렉트
		}
	});
});

// 데이터 수정 라우트 (POST 요청)
// 폼 데이터에서 온도와 습도 값을 추출하여 해당 ID의 데이터 업데이트
app.post('/edit/:id', function (req, res) {
	var body = req.body;

	mySqlClient.query('update dev01 set Temperature=?, Humidity=? where id=?', [body.Temperature, body.Humidity, req.params.id], function (error, result) {
		if (error) {
			console.log('update error: ', error.message); // 업데이트 오류 로그
		} else {
			res.redirect('/'); // 성공 시 홈 페이지로 리다이렉트
		}
	});
});

// 뷰 엔진 설정
app.set('views', path.join(__dirname, 'views')); // 뷰 파일 경로 설정
app.set('view engine', 'ejs'); // EJS를 뷰 엔진으로 설정

// 미들웨어 설정
app.use(logger('dev')); // 요청 로깅
app.use(bodyParser.json()); // JSON 데이터 파싱
app.use(bodyParser.urlencoded({ extended: false })); // URL 인코딩된 데이터 파싱
app.use(cookieParser()); // 쿠키 파싱
app.use(express.static(path.join(__dirname, 'public'))); // 정적 파일 제공

// 라우트 모듈 사용
app.use('/', routes);
app.use('/users', users);

// 404 오류 처리
app.use(function (req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// 에러 핸들러

// 개발 환경에서의 에러 핸들러
if (app.get('env') === 'development') {
	app.use(function (err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

// 프로덕션 환경에서의 에러 핸들러
app.use(function (err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});

module.exports = app;

// 저번 시간에 데이터베이스(dht11) 및 테이블(dev01) 생성, esp8266 보드와 dht11 센서를 통해 얻은 온/습도 데이터 추가의 과정에 관련된 웹 페이지 제작
// 수정 원본 파일 경로 - https://www.dropbox.com/scl/fo/sh05nl33unxil1bodb1mc/AJE8wRlpI8yu1agTkurYVgU/work/nodejs?rlkey=hxq3t8pivi9w75o1j59d4atfc&subfolder_nav_tracking=1&dl=0

// Nodejs 명령어
// express mysql --ejs		// Embedded JavaScript Template 약자의 옵션 추가 입력
// 패키지 생성 후 자동 제공되는 입력 명령 수행
// npm은 mysql만 설치 (npm install mysql)
// 실행은 node app.js도 되지만 SET DEBUG=mysql:* & npm start 명령어로 실행 가능.