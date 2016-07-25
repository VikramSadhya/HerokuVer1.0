var express = require('express');
var path = require('path');
var app = express();
var bodyParser = require('body-parser');
var mysql = require('mysql');
var favicon = require('express-favicon');

var port = Number(process.env.PORT || 5000);

var pool = mysql.createPool({
host:'hostname',
user:'username',
password:'password',
database:'dbname',
port: 3306,
connectionLimit: 100
});

function handle_database(req,res) {
    pool.getConnection(function(err,connection){
        if (err) {
          connection.release();
          console.log('Database Connection failed');
          return;
        } else {
          console.log('Connected to database'); 
        }
        });
  };

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static('public'));
app.use(favicon(__dirname + '/public/favicon.ico'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/b*', function (req, res) {
    bid = path.basename(req.path);
    res.sendFile(__dirname + '/public/about.html');
});

app.post('/postdata', function (req, res) {
  handle_database();
  var loc = "Bldg" + bid.match(/\d+$/)[0];
  var data ={ beaconId: bid,
      status: "Activated",
      location: loc
  };
  pool.query('INSERT INTO checkin SET ?', data, function(err, result) {
    if(err){
        throw err;
      } else {
          res.sendFile(__dirname + '/public/logout.html');                
        }
    });
});

app.post('/postcheckout', function(req,res){
 handle_database();
 var loc = "Bldg" + bid.match(/\d+$/)[0];
  var data ={ beaconId: bid,
      status: "Deactivated",
      location: loc
  };
  pool.query('INSERT INTO checkin SET ?', data, function(err, result) {
    if(err){
        throw err;
      } else {
          res.sendFile(__dirname + '/public/thankyou.html');                
        }
    });
});

app.set('view engine', 'ejs');
var obj = {};
app.get('/data', function(req, res){
  handle_database();
  pool.query('SELECT * FROM checkin', function(err, result) {
    if(err){
      throw err;
    } else {
      obj = {checkin: result};
      res.render('layout', obj);                
    }
  });
});

app.listen(port, function(err, req, res){
  if (err){
    console.log("Failed to start app at port:%s", port);
  } else {
    console.log("Project app running at port:%s", port);
  }
});