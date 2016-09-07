var express = require('express');
var morgan = require('morgan');
var bp = require('body-parser');
var mo = require('method-override');
var db = require('../db/prefData/userPrefDB.js');
var session = require('express-session');
var path = require('path');
//users, 
//users/preferences, login, signup,
// restrict function for sessions
//init live data stream when hit before login
// save , get user pref after login
// when hit root open data stream to client.
// authentication w/ sessions

/*
somewhat done: 
server setup, 
login, 
/users/prefs, 

*/

//-------- SERVER & SOCKET SET UP ----------//
var app = express();
var server = require('http').createServer(app);

var io = require('socket.io')(server);
server.listen(8080, '127.0.0.1');

io.on('connection', function (socket) {
  console.log('Connected to socket in server.');
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});

db.findAll(db.users, console.log);
db.add(db.users, {id: 78, username: 'Stevie Ray', password: 'sercret'}, console.log);

// create application/json parser
var jsonParser = bp.json();
// create application/x-www-form-urlencoded parser
var urlencodedParser = bp.urlencoded({ extended: false });

//initialize session
app.use(session({secret: 'secret'}));

//serve static assets
app.use(express.static('../Public'));


//-------------------------- ROOT -------------------------//
app.get('/', function(req, res) {
  //if user in session
  if (req.session.username && req.session.password) {
    console.log(req.session.username + ' has been logged in.');
    //redirect to /users/prefs
    res.redirect('/users/preferences');
  } else {
  //else go to login page
    //res.redirect('/login');
    res.sendfile(path.resolve('../Public/index.html'));
  }
});


//----------- user/pref & save pref -------------//

//find all users, send them back
app.get('/users/preferences', function(req, res) {
  console.log('now at /users/pref');
  //get all users from db
  // if (req.session.username && req.session.password) {
  //   db.findAll(db.preferences, function(err, prefs) {
  //     if (err) {
  //       console.log('Oops! error: ', err);
  //     } else {
  //       console.log('Got all user prefs: ', prefs);
  //       res.json(prefs);
  //     }
  //   });  
  // } else {
  //   alert('Please log in.');
  //   res.redirect('/login');
  // }

  //version without sessions
  db.findAll(db.preferences, function(err, allPrefs) {
    if (err) {
      console.log('Oops! error: ', err);
    } else {
      console.log('Got all user prefs: ', allPrefs);
      var prefs = allPrefs.toArray();
      prefs.forEach(function(aPref) {
        //find matching id to user's

          //update pref

      });
    }
  });  
});

app.post('/users/preferences', urlencodedParser, function(req, res) {
  //console.log(typeof JSON.parse(req.body.prefs), 'parsed body!!!');
  if (req.session.username && req.session.password) {
    db.add(db.preferences, JSON.parse(req.body.prefs), function(err, newPref) {
      if (err) {
        console.log('Error in getting preferences.', err);
      } else {
        console.log('Got preferences.', newPref);
        var allPrefs = newPref.toArray();

        res.json('saved prefs', newPref);
      }
    });
  } else {
    console.log('hey. not logged in for /users/preferences');
    //should redirect to login page.
  }
});

//------------------------LOGIN--------------------//

app.get('/login', function(req, res) {
  console.log('Now at login.');
  //res.sendfile(__dirname + '../Public/index.html');
});

//new user submitted, add new user to db
app.post('/login', function(req, res) {
  req.session.username = req.body.username;
  req.session.password = req.body.password;

  db.add(db.users, req.body.prefs, function(err, newUser) {

    if (err) {
      console.log('error in adding new user: ', err);
      return;
    }

    console.log('New user added: ' + newUser);
    res.json(newUser);
  });
});

//--------------------------SIGN UP---------------//
app.get('/signup', function(req, res) {
  console.log('signing up...');
  //load sign up page.
});

app.post('/signup', function(req, res) {
  //check how to access in req the username and pw, store in var
  //add new user to db
});

//--------------------------- LOGOUT --------------//

app.get('/logout', function(req, res) {
  alert('You have been logged out.');
  res.redirect('/login');
});

app.listen(3000, function() {
  console.log('server listening at port 3000');
});