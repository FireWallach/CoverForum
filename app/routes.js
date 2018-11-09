var Board = require('../app/models/board');
var Thread = require('../app/models/thread');

module.exports = function (app, passport) {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function (req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function (req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') });
    });
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/cover', // redirect to the secure cover section
        failureRedirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // =====================================
    // SIGNUP ==============================
    // =====================================

    app.get('/signup', function (req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/cover', // redirect to the secure cover section
        failureRedirect: '/signup', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // =====================================
    // COVER SECTION =====================
    // =====================================
    app.get('/cover', isLoggedIn, function (req, res) {

        Board.find({}, function (err, boards) {
            if (boards) {
                res.render('cover.ejs', {
                    boards: boards,
                    user: req.user
                });
            }
            if (err) {
                res.render('/', {
                    message: 'Error finding Boards',
                    user: req.user,
                    boards: []
                })

            }
        });
    });

    // =====================================
    // BOARD SECTION =====================
    // =====================================
    app.get('/b', isLoggedIn, function (req, res) {
        res.render('newBoard.ejs', {
            user: req.user,
            message: req.flash('boardCreateMessage')
        })
    });
    app.post('/b', isLoggedIn, function (req, res) {
        Board.findOne({ 'name': req.body.name }, function (err, board) {
            if (err) {
                res.render('newBoard.ejs', {
                    board: req.board,
                    message: 'Error Looking Up Board.'
                });
            }
            if (board) {
                res.render('newBoard.ejs', {
                    board: req.board,
                    message: 'Board Already Exists.'
                })
            }
            if (board == null) {
                var newBoard = new Board();
                newBoard.name = req.body.name;
                newBoard.description = req.body.description;
                newBoard.save(function (err) {
                    if (err)
                        throw err;
                });
                res.redirect('/cover')
            }
        })
    });
    app.post('/b/:board', isLoggedIn, function (req, res) {
        //Use the path variable to determine the board (because the ID is gross) and use the body new attributes
        if (req.body.name == undefined) {
            Board.deleteOne({ name: req.params.board }, function (err, board) {
                res.redirect('/cover');
            });
        } else if (req.body.name) {
            var upBoard = {
                name: req.body.name,
                description: req.body.description
            }

            Board.findOneAndUpdate({ name: req.params.board }, upBoard, function (err, board) {
                if (err) {
                    res.render('login.ejs', { message: 'Error updating, Sorry!' })
                }
                else {
                    res.redirect('/cover');
                }
            });
        }

    });

    app.get('/b/:boardName/', isLoggedIn, function (req, res) {
        Board.findOne({ 'name': req.params.boardName }, function (err, board) {
            if (err) {
                res.render('login.ejs', {
                    board: req.board,
                    message: 'Error Looking Up Board.'
                });
            }
            if (board) {
                Thread.find({parentBoard: board.name}, function(err, threads){
                    if(err){
                        res.render('login.ejs',{
                            board:req.board,
                            message: 'Error Looking Up Threads.'
                        })
                    }
                    if(threads){
                        res.render('board.ejs', {
                            boardName: board.name,
                            boardDescription: board.description,
                            threads : threads
                        })
                    }
                })
            }
        })
    });

    // =====================================
    // THREAD SECTION ======================
    // =====================================

    app.get('/b/:boardName/newThread',isLoggedIn, function(req, res){
        res.render('newThread.ejs',{
            boardName:req.params.boardName,
            message: ""
        })
    })

    app.post('/b/:boardName/newThread', isLoggedIn, function (req, res) {
        Thread.findOne({ 'name': req.body.name }, function (err, thread) {
            if (err) {
                res.render('newThread.ejs', {
                    boardName: req.thread,
                    message: 'Error Looking Up Thread.'
                });
            }
            if (thread) {
                res.render('newThread.ejs', {
                    thread: req.thread,
                    message: 'Thread Name Taken.'
                })
            }
            if (thread == null) {
                var newThread = new Thread();
                newThread.name = req.body.name;
                newThread.initialPost = req.body.initialPost;
                newThread.parentBoard = req.params.boardName;
                newThread.save(function (err) {
                    if (err)
                        throw err;
                });
                res.redirect('/b/'.concat(req.params.boardName))
            }
        })
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function (req, res) {
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

