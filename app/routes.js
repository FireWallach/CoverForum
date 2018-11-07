var Board = require('../app/models/board');

module.exports = function(app, passport) {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') }); 
    });

    // process the login form
    // app.post('/login', do all our passport stuff here);

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    // app.post('/signup', do all our passport stuff here);

    // =====================================
    // COVER SECTION =====================
    // =====================================
    app.get('/cover', isLoggedIn, function(req, res) {
        res.render('cover.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });

    // =====================================
    // BOARD SECTION =====================
    // =====================================
    app.get('/b', isLoggedIn, function(req, res){
        res.render('newBoard.ejs', {
            user: req.user,
            message : req.flash('boardCreateMessage')
        })
    });
    app.post('/b', isLoggedIn, function(req,res){
        Board.findOne({ 'name' :  req.body.name }, function(err, board) {
            if(err){
                res.render('newBoard.ejs', {
                    board: req.board,
                    message : 'Error Looking Up Board.'
                });
            }
            if(board){
                res.render('newBoard.ejs', {
                    board: req.board,
                    message :'Board Already Exists.'
                })
            }
            if(board == null){
                var newBoard = new Board();
                newBoard.name = req.body.name;
                newBoard.description = req.body.description;
                newBoard.save(function(err) {
                    if (err)
                        throw err;
                });
                res.render('cover.ejs', {
                    user : req.user // get the user out of session and pass to template
                });            }
        })
    });


    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
        // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/cover', // redirect to the secure cover section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/cover', // redirect to the secure cover section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}

