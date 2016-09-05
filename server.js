var express = require('express');
var path = require('path');
var app = express();
var bodyParser = require('body-parser');
var mysql = require('mysql');
var favicon = require('express-favicon');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(favicon(__dirname + '/public/favicon.ico'));

var port = Number(process.env.PORT || 5000);

var pool = mysql.createPool({
host:'nj5rh9gto1v5n05t.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
user:'biwc8bxt1o6ddcof',
password:'ad3z6d6hi38qx7hq',
database:'d8qezgj2y3scpj7i',
port: 3306,
connectionLimit: 100,
dateStrings: true,
timezone: 'ct'
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


app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/b*', function (req, res) {
    bid = path.basename(req.path);
    res.sendFile(__dirname + '/public/about.html');
});

app.post('/postdata', function (req, res) {
  handle_database();
  pool.query('SELECT location from beacon where balias = ?', bid, function(err, result) {
  if(err){
    res.sendFile(__dirname + '/public/beaconerror.html');
  } else {
    try{
      var bloc = result[0].location;
      var data ={ beaconId: bid,
    status: "Activated",
    location: bloc
  };
     pool.query('INSERT INTO checkin SET ?', data, function(err, result) {
  if(err){
    throw err;
  } else {
    res.sendFile(__dirname + '/public/logout.html');                
  }
  });
    } catch (error) {
        res.sendFile(__dirname + '/public/beaconerror.html');
    }             
  }
  });
  connection.release();
});

app.post('/postcheckout', function(req,res){
 handle_database();
 pool.query('SELECT location from beacon where balias = ?', bid, function(err, result) {
  if(err){
    throw err;
  } else {
    data ={ beaconId: bid,
    status: "Deactivated",
    location: result[0].location
  };
     pool.query('INSERT INTO checkin SET ?', data, function(err, result) {
  if(err){
    throw err;
  } else {
    res.sendFile(__dirname + '/public/thankyou.html');                
  }
  });             
  }
  });
 connection.release();
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
  connection.release();
});

app.post('/resettable', function(req, res){
  handle_database();
  pool.query('TRUNCATE table checkin');
  pool.query('SELECT * FROM checkin', function(err, result) {
    if(err){
      throw err;
    } else {
      obj = {checkin: result};
      res.render('layout', obj);                
    }
  });
  connection.release();
});

app.listen(port, function(err, req, res){
  if (err){
    console.log("Failed to start app at port:%s", port);
  } else {
    console.log("Project app running at port:%s", port);
  }
});