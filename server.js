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
host:'uoa25ublaow4obx5.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
user:'bikjev1qj9iiyqo8',
password:'npkb2rqdf9m6rdfq',
database:'s3zaxupkdhjfrv79',
port: 3306,
connectionLimit: 10,
dateStrings: true,
timezone: 'ct'
});


app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/b*', function (req, res) {
    bid = path.basename(req.path);
    res.sendFile(__dirname + '/public/about.html');
});

app.post('/postdata', function (req, res) {
  pool.getConnection(function(err, connection){
  connection.query('SELECT location from beacon where balias = ?', bid, function(err, result) {
  if(err){
    res.sendFile(__dirname + '/public/beaconerror.html');
  } else {
    try{
      var bloc = result[0].location;
      var data ={ beaconId: bid,
    status: "Activated",
    location: bloc
  };
     connection.query('INSERT INTO checkin SET ?', data, function(err, result) {
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
});

app.post('/postcheckout', function(req,res){
 pool.getConnection(function(err, connection){
 connection.query('SELECT location from beacon where balias = ?', bid, function(err, result) {
  if(err){
    throw err;
  } else {
    data ={ beaconId: bid,
    status: "Deactivated",
    location: result[0].location
  };
     connection.query('INSERT INTO checkin SET ?', data, function(err, result) {
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
});

app.set('view engine', 'ejs');
var obj = {};

app.get('/data', function(req, res){
  pool.getConnection(function(err, connection){
  connection.query( 'SELECT * FROM checkin',  function(err, result){
    if(err) {
      throw err;
    }else{
      obj = {checkin: result};
      res.render('layout', obj);
    }
  });
  connection.release();
});
});

app.get('/refresh', function(req, res){
  pool.getConnection(function(err, connection){
  connection.query( 'SELECT * FROM checkin',  function(err, result){
    if(err) {
      throw err;
    }else{
      obj = {checkin: result};
      res.render('layout', obj);
    }
  });
  connection.release();
});
});

app.post('/resettable', function(req, res){
  pool.getConnection(function(err, connection){
  connection.query('TRUNCATE table checkin');
  connection.query( 'SELECT * FROM checkin',  function(err, result){
    if(err) {
      throw err;
    }else{
      obj = {checkin: result};
      res.render('layout', obj);
    }
  });
  connection.release();
});
});

app.listen(port, function(err, req, res){
  if (err){
    console.log("Failed to start app at port:%s", port);
  } else {
    console.log("Project app running at port:%s", port);
  }
});