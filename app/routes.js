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
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/cover', // redirect to the secure cover section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/cover', // redirect to the secure cover section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // COVER SECTION =====================
    // =====================================
    app.get('/cover', isLoggedIn, function(req, res) {

        Board.find({}, function(err, boards){
            if(boards){
                res.render('cover.ejs', {
                    boards:boards,
                    user:req.user
                });
            }
            if(err){
                res.render('/',{
                    message:'Error finding Boards',
                    user:req.user,
                    boards:[]
                })
            
            }
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
                res.redirect('/cover')
           }
        })
    });
    app.post('/b/:board', isLoggedIn, function(req, res){
        Board.findOne({name : req.params.board}, function(err, board){
            // if(board){
            //     board.remove();
            //     res.redirect('/cover');
            // } 
        });
    });


    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
        
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}

