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


/* ------------------------------------*
 *       listen upon connection
 * ------------------------------------*/
server.listen(port, function(){
	console.log('listening on localhost:' + port);
});


