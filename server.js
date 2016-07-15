var express = require('express');
var connect = require('connect');
var path = require('path');
var app = express();
var bodyParser = require('body-parser');
var mysql = require('mysql');

var port = Number(process.env.PORT || 5000);

var pool = mysql.createPool({
host:'nj5rh9gto1v5n05t.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
user:'dm1hckioeuf6q8a7',
password:'ajavgx3ftunxe4sg',
database:'yiih66ar40rxzfc8',
port: 3306,
debug: false,
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


app.use(function(req, res, next) {
  console.log(`${req.method} request for ${req.url}`);
  next();

});

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static('public'));

app.post('/postdata', function (req, res) {
  handle_database();
  pool.query('SELECT * FROM checkin', function(err, result) {
    if(err){
        throw err;
      } else {
          res.send(result);                
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