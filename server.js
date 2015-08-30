/* ------------------------------------*
 *          include libraries 
 * ------------------------------------*/
var http = require('http'),
    path = require('path'),
    express = require('express'),
    sqlite3 = require('sqlite3').verbose(),
    db = new sqlite3.Database('wordy');

var app = express();
var server = http.Server(app);
var io = require('socket.io')(server);
var port = 3000;

/* -------------------------------------------*
 *             set up homepage
 * -------------------------------------------*/
app.engine('.html', require('ejs').__express); //ejs : Embedded JavaScript
app.set('views', __dirname + '/views');
app.set('view engine', 'html');

app.get('/', function(req, res){
    res.render('index');
});

app.use(express.static(path.join(__dirname,'public/')));

/* -------------------------------------------*
 * listen to client and interact with database
 * -------------------------------------------*/
io.on('connection',function(socket){
 	console.log('A user connected'); 

 	//check database initialization and put existing messages to the new client
	db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='talkpool'", function(err, row) {
		if(err !== null) {
			console.log(err);
		}
		else if(row == null) {
			db.run('CREATE TABLE "talkpool" ("id" INTEGER PRIMARY KEY AUTOINCREMENT, "name" VARCHAR(255), "msg" VARCHAR(255), "time" VARCHAR(255))', function(err) {
				if(err !== null) {
					console.log(err);
				}
				else {
					console.log("SQL Table 'talkpool' initialized.");
				}
			});
		}
		else {
			console.log("SQL Table 'talkpool' already initialized.");
			//put existing messages to the new client
			db.all("SELECT * FROM talkpool", function(err1, messages){
				messages.forEach(function(message){
					console.log(message);
					socket.emit('output', message);
				});
			});
		}
	});

	//update status
	sendStatus = function(s){
		socket.emit('status', s);
	}

	//Wait and input new (name, msg) to Database
	socket.on('input', function(data){
		console.log('name = '+ data.name + '; msg = ' + data.msg + '; time = ' + data.time);
		var name = data.name,
			msg  = data.msg,
			time = data.time;

		var whitespacePattern = /^\s*$/;
		if(whitespacePattern.test(name) || whitespacePattern.test(msg)){
			console.log('Invalid');
			sendStatus('Name and message are required');
		}
		else{
			console.log('Valid');
			sqlRequest = "INSERT INTO 'talkpool' (name, msg, time) VALUES ('" + name + "', '" + msg + "', '" + time + "')"
			db.run(sqlRequest, function(err) {
        		if(err !== null) {
          			console.log('Data input failed');
        		}
        		else {
        			console.log('Data input success');
        			//broadcast input from one client to all other clients
        			io.emit('output', data);
        			sendStatus({
        				message: 'Message sent',
        				clear : true
        			})
        		}
    		});
		}
	});
	
	//Record user's exit
	socket.on('disconnect', function(){
		console.log('A user disconnected');
	});
});


/* ------------------------------------*
 *       listen upon connection
 * ------------------------------------*/
server.listen(port, function(){
	console.log('listening on localhost:' + port);
});


