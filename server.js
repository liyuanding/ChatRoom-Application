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
 	sqlRequest = "SELECT name FROM sqlite_master WHERE type='table' AND name='talkpool'";
	db.get(sqlRequest, function(err, row) {
		if(err !== null) {
			console.log(err);
		}
		else if(row == null) {
			//create a new database if not exists
			sqlRequest = 'CREATE TABLE "talkpool" ("id" INTEGER PRIMARY KEY AUTOINCREMENT, "name" VARCHAR(255), "msg" VARCHAR(255), "time" VARCHAR(255))';
			db.run(sqlRequest, function(err) {
				if(err !== null) {
					console.log(err);
				}
				else {
					console.log("SQL Table 'talkpool' initialized.");
				}
			});
		}
		else {
			//put existing messages to the new client
			console.log("SQL Table 'talkpool' already initialized.");
			sqlRequest = "SELECT * FROM talkpool";
			db.all(sqlRequest, function(err1, messages){
				messages.forEach(function(message){
					console.log(message);
					socket.emit('output', message);
				});

				//notify others when someone enters the chatty room
 				//var clientEnterMessage = { enter:true, leave : false};
				//io.emit('output', clientEnterMessage);
			});

		}
	});


	//check if checkName already exists in the database
	//socket.on('chatName',function(data){
	//	//data here only contain name
	//	sqlRequest = "SELECT * FROM talkpool WHERE name = '" + data.name + "'";
	//	db.get(sqlRequest, function(err, row){
	//		if(row == null)
	//			socket.emit('existName', false);
	//		else
	//			socket.emit('existName', true);
	//	});
	//});

	//Wait and input new (name, msg) to Database
	socket.on('input', function(data){
		console.log('name = '+ data.name + '; msg = ' + data.msg + '; time = ' + data.time);
		var name = data.name,
			msg  = data.msg,
			time = data.time;
			
			//double ' to the name
			var name_p="";
			for (var i=0; i<name.length;i++){
				name_p+=name.charAt(i);
				if (name.charAt(i)=="'"){
					name_p+="'";
				}
			};

			var msg_p="";
			for (var j=0; j<msg.length;j++){
				msg_p+=msg.charAt(j);
				if (msg.charAt(j)=="'"){
					msg_p+="'";
				}
			};

		var whitespacePattern = /^\s*$/;
		if(whitespacePattern.test(name) || whitespacePattern.test(msg)){
			console.log('Invalid');
		}
		else{
			//if not null, insert new (name, msg) to the database
			console.log('Valid');
			console.log('Actual name = '+ name_p + '; msg = ' + msg_p + '; time = ' + time);
			sqlRequest = "INSERT INTO 'talkpool' (name, msg, time) VALUES ('" + name_p + "', '" + msg_p + "', '" + time + "')";
			db.run(sqlRequest, function(err) {
        		if(err !== null) {
          			console.log('Data input failed');
        		}
        		else {
        			console.log('Data input success');
        			//broadcast input from one client to all other clients
        			io.emit('output', data);
        			socket.emit('status', {clear :true});
        		}
    		});
		}
	});
	
	//Record user's exit
	socket.on('disconnect', function(){
		console.log('A user disconnected');
		
		//notify others that one user left
		//var clientQuitMessage = { enter: false, leave : true};
		//io.emit('output', clientQuitMessage);
	});
});


/* ------------------------------------*
 *       listen upon connection
 * ------------------------------------*/
server.listen(port, function(){
	console.log('listening on localhost:' + port);
});


