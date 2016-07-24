var express = require('express');
var path = require('path');
var app = express();
var bodyParser = require('body-parser');
var mysql = require('mysql');

var port = Number(process.env.PORT || 5000);

var pool = mysql.createPool({
host:'nj5rh9gto1v5n05t.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
user:'uchuz9pmlrpancnr',
password:'f5bqyxfgb9xrfqo6',
database:'v15rdekxud3l4cjn',
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

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('*', function (req, res) {
    res.sendFile(__dirname + '/public/about.html');
});

app.post('/postdata', function (req, res) {
  handle_database();
  var data ={ beaconId: req.url,
      status: "Activated",
      location: "Bld1"
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
  var data ={ beaconId: req.url,
      status: "Deactivated",
      location: "Bld1"
  };
pool.query('INSERT INTO checkin SET ?', data, function(err, result) {
    if(err){
        throw err;
      } else {
          res.sendFile(__dirname + '/public/thankyou.html');                
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