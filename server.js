// =======================
// get the packages we need ============
// =======================
var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');

var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file
var User   = require('./app/models/user'); // get our mongoose model
var Course = require('./app/models/course'); // get our mongoose model
    
// =======================
// configuration =========
// =======================
var port = process.env.PORT || 1234; // used to create, sign, and verify tokens
mongoose.connect(config.database); // connect to database
app.set('superSecret', config.secret); // secret variable

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// use morgan to log requests to the console
app.use(morgan('dev'));

app.use(express.static(__dirname + '/public'));

// =======================
// routes ================
// =======================
// basic route
app.get('/', function(req, res) {
    //res.send('Hello! The API is at http://localhost:' + port + '/api');
    res.sendFile(__dirname + '/public/templates/index.html');
});

app.get('/signin', function(req, res) {
	res.sendFile(__dirname + '/public/templates/signin.html');
});

/*app.post('/signin', function(req, res) {
  res.redirect('/');
});*/

app.post('/setup', function(req, res) {

    User.findOne({
        email: req.body.email
    }, function(err, user) {
        if (err) throw err;

        if (!user) {

        	var user = new User({
		        name: req.body.name,
		        email: req.body.email,
		        password: req.body.password,
		        admin: false
		    });

            user.save(function(err) {
              if (err) throw err;
              console.log('User saved successfully');
              res.json({
                success: true
              });
            });
        } else {
            res.json({
                success: false,
                message: 'User already exists!'
            })
        }
    });
});



// API ROUTES -------------------
// we'll get to these in a second
// get an instance of the router for api routes
var apiRoutes = express.Router(); 

// TODO: route to authenticate a user (POST http://localhost:8080/api/authenticate)
// route to authenticate a user (POST http://localhost:8080/api/authenticate)
apiRoutes.post('/authenticate', function(req, res) {

  // find the user
  User.findOne({
    email: req.body.email
  }, function(err, user) {

    if (err) throw err;

    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else if (user) {

      // check if password matches
      if (user.password != req.body.password) {
        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
      } else {

        // if user is found and password is right
        // create a token
        var token = jwt.sign(user, app.get('superSecret'), {
          expiresInMinutes: 1440 // expires in 24 hours
        });

        user.password = '';

        // return the information including token as JSON
        res.json({
          success: true,
          message: 'Enjoy your token!',
          user: user,
          token: token
        });
      }   

    }

  });
});

// TODO: route middleware to verify a token
apiRoutes.use(function(req, res, next) {

  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, app.get('superSecret'), function(err, decoded) {      
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });    
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;    
        next();
      }
    });

  } else {

    // if there is no token
    // return an error
    return res.status(403).send({ 
        success: false, 
        message: 'No token provided.' 
    });
    
  }
});

app.get('/courses/:courseid', function(req, res) {
	res.sendFile(__dirname + '/public/templates/coursepage.html');
});

app.get('/courses', function(req, res) {
  res.sendFile(__dirname + '/public/templates/courses.html');
});

// route to show a random message (GET http://localhost:8080/api/)
apiRoutes.get('/', function(req, res) {
  res.json({ message: 'Welcome to the coolest API on earth!' });
});

// route to return all users (GET http://localhost:8080/api/users)
apiRoutes.get('/users', function(req, res) {
  User.find({}, function(err, users) {
    res.json(users);
  });
});

// route to return all courses (GET http://localhost:8080/api/courses)
apiRoutes.get('/courses', function(req, res) {
  Course.find({}, function(err, courses) {
    res.json({
      success: true,
      courses: courses
    });
  });
});

// route to updata one courses (GET http://localhost:8080/api/courses/:courseid)
apiRoutes.put('/courses/:courseid', function(req, res) {
	Course.findOne({
		_id: req.body.courseid
	}, function(err, course) {
		if (err) throw err;

		if (!course) {
			res.json({ success: false, message: 'Register failed. Course not found.' });
		} else {
			course.attendees = JSON.parse(req.body.attendees);

			course.save(function(err) {
			    if (err) throw err;

			    console.log('Registered successfully');
			    res.json({ success: true, course: course });
			});
		}
	});
});

apiRoutes.get('/courses/:courseid', function(req, res) {
	Course.findOne({_id: req.params.courseid}).populate('attendees', '-password -admin').exec(function(error, course) {
		res.json({ success: true, course: course});
	});
});  

// apply the routes to our application with the prefix /api
app.use('/api', apiRoutes);

// =======================
// start the server ======
// =======================
app.listen(port);
console.log('Magic happens at http://localhost:' + port);