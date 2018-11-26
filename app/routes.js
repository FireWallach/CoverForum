var Board = require('../app/models/board')
var Thread = require('../app/models/thread')
var Reply = require('../app/models/reply')

module.exports = function (app, passport) {

  // =====================================
  // HOME PAGE (with login links) ========
  // =====================================
  app.get('/', function (req, res) {
    res.render('index.ejs'); // load the index.ejs file
  })

  // =====================================
  // LOGIN ===============================
  // =====================================
  // show the login form
  app.get('/login', function (req, res) {

    // render the page and pass in any flash data if it exists
    res.render('login.ejs', { message: req.flash('loginMessage') })
  })
  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/cover', // redirect to the secure cover section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }))

  // =====================================
  // SIGNUP ==============================
  // =====================================

  app.get('/signup', function (req, res) {

    // render the page and pass in any flash data if it exists
    res.render('signup.ejs', { message: req.flash('signupMessage') })
  })

  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/cover', // redirect to the secure cover section
    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }))

  // =====================================
  // COVER SECTION =====================
  // =====================================
  app.get('/cover', isLoggedIn, function (req, res) {
    Board.find({}, function (err, boards) {
      if (boards) {
        res.render('cover.ejs', {
          boards: boards,
          user: req.user
        })
      }
      if (err) {
        res.render('/', {
          message: 'Error finding Boards',
          user: req.user,
          boards: []
        })
      }
    })
  })

  // =====================================
  // BOARD SECTION =====================
  // =====================================
  app.get('/b', isLoggedIn, function (req, res) {
    res.render('newBoard.ejs', {
      user: req.user,
      message: req.flash('boardCreateMessage')
    })
  })
  app.post('/b', isLoggedIn, function (req, res) {
    Board.findOne({ 'name': req.body.name }, function (err, board) {
      if (err) {
        res.render('newBoard.ejs', {
          board: req.board,
          message: 'Error Looking Up Board.'
        })
      }
      if (board) {
        res.render('newBoard.ejs', {
          board: req.board,
          message: 'Board Already Exists.'
        })
      }
      if (board == null) {
        var newBoard = new Board()
        newBoard.name = req.body.name
        newBoard.description = req.body.description
        newBoard.save(function (err) {
          if (err)
            throw err
        })
        res.redirect('/cover')
      }
    })
  })

  // Update the object if new data is provided, delete it if not.
  app.post('/b/:board', isLoggedIn, function (req, res) {
    // Use the path variable to determine the board (because the ID is gross) and use the body new attributes
    if (req.body.name == undefined) {
      Board.deleteOne({ name: req.params.board }, function (err, board) {
        res.redirect('/cover')
      })
    } else if (req.body.name) {
      var upBoard = {
        name: req.body.name,
        description: req.body.description
      }

      Board.findOneAndUpdate({ name: req.params.board }, upBoard, function (err, board) {
        if (err) {
          res.render('login.ejs', { message: 'Error updating, Sorry!' })
        } else {
          res.redirect('/cover')
        }
      })
    }
  })

  app.get('/b/:boardName/', isLoggedIn, function (req, res) {
    Board.findOne({ 'name': req.params.boardName }, function (err, board) {
      if (err) {
        res.render('login.ejs', {
          board: req.board,
          message: 'Error Looking Up Board.'
        })
      }
      if (board) {
        Thread.find({ parentBoard: board.name }, function (err, threads) {
          if (err) {
            res.render('login.ejs', {
              board: req.board,
              message: 'Error Looking Up Threads.'
            })
          }
          if (threads) {
            res.render('board.ejs', {
              boardName: board.name,
              boardDescription: board.description,
              threads: threads,
              user: req.user
            })
          }
        })
      }
    })
  })

  // =====================================
  // THREAD SECTION ======================
  // =====================================

  app.get('/b/:boardName/newThread', isLoggedIn, function (req, res) {
    res.render('newThread.ejs', {
      boardName: req.params.boardName,
      message: ''
    })
  })

  app.post('/b/:boardName/newThread', isLoggedIn, function (req, res) {
    Thread.findOne({ 'name': req.body.name }, function (err, thread) {
      if (err) {
        res.render('newThread.ejs', {
          boardName: req.thread,
          message: 'Error Looking Up Thread.'
        })
      }
      if (req.body.name) {
        if (req.body.name.toUpperCase() === 'NEWTHREAD') {
          res.render('newThread.ejs', {
            boardName: req.thread,
            message: "'newthread' is a protected term"
          })
          return
        }
      }

      if (thread) {
        res.render('newThread.ejs', {
          boardName: req.params.boardName,
          message: 'Thread Name Taken.'
        })
        return
      }
      if (thread == null) {
        var regex = /^[a-z\d\-_\s]+$/i
        if (!regex.test(req.body.name)) { // /NOTE TO SELF, CHECK INPUT AGAINST THIS /^[a-z0-9]+$/i
          res.render('newThread.ejs', {
            boardName: req.params.boardName,
            message: 'No Special Characters in board name'
          })
          return
        }
        var newThread = new Thread()
        newThread.name = req.body.name
        newThread.initialPost = req.body.initialPost
        newThread.parentBoard = req.params.boardName
        newThread.save(function (err) {
          if (err)
            throw err
        })
        res.redirect('/b/'.concat(req.params.boardName))
      }
    })
  })
  app.post('/b/:boardName/:threadName', isLoggedIn, function (req, res) {
    // Use the path variable to determine the thread (because the ID is gross) and use the body new attributes
    if (req.body.delete == true) {
      Thread.deleteOne({ name: req.params.threadName }, function (err, thread) {
        res.redirect('/b/'.concat(req.params.boardName))
      })
    } else if (req.body.name) {
      var upThread = {
        name: req.body.name,
        initialPost: req.body.initialPost,
        parentBoard: req.params.boardName
      }

      Thread.findOneAndUpdate({ name: req.body.name }, upThread, function (err, thread) {
        if (err) {
          res.render('login.ejs', { message: 'Error updating, Sorry!' })
        } else {
          res.redirect('/b/'.concat(req.params.boardName))
        }
      })
    }
  })

  app.post('/b/:boardName/:threadName/delete', isLoggedIn, function (req, res) {
    Thread.findOneAndDelete({ name: req.params.threadName }, function (err, thread) {
      if (err) {
        res.render('login.ejs', { message: 'Error deleting' })
      } else {
        res.redirect('/b/'.concat(req.params.boardName))
      }
    })
  })

  app.get('/b/:boardName/:threadName', isLoggedIn, function (req, res) {
    Thread.findOne({ parentBoard: req.params.boardName, name: req.params.threadName }, function (err, thread) {
      if (err) {
        res.render('login.ejs', {
          message: 'Error finding thread, sorry!'
        })
      } else if (thread) {
        Reply.find({ parentThread: req.params.threadName }, function (err, replies) {
          if (err) {
            res.render('login.ejs', {
              message: 'Error finding replies, Sorry!'
            })
          } else if (replies) {
            res.render('thread.ejs', {
              user: req.user,
              boardName: req.params.boardName,
              threadName: req.params.threadName,
              thread: thread,
              replies: replies
            })
          }
        })
      } else {
        res.render('login.ejs', {
          message: 'Board not found, Sorry!'
        })
      }
    })
  })

  app.post('/b/:boardName/:threadName/new', isLoggedIn, function (req, res) {
    // If there's abody do what you have
    if (req.body.replyBody) {
      var newReply = new Reply()
      newReply.parentThread = req.params.threadName
      newReply.poster = req.user.local.email
      newReply.replyBody = req.body.replyBody
      newReply.save(function (err) {
        if (err)
          throw err
      })
    } else if(req.body.image){
      var newReply = new Reply()
      newReply.parentThread = req.params.threadName
      newReply.poster = req.user.local.email
      newReply.image = req.body.image
      newReply.save(function (err) {
        if (err)
          throw err
      })
    }
    res.redirect('/b/'.concat(req.params.boardName).concat('/').concat(req.params.threadName))
  })

  app.post('/b/:boardName/:threadName/cdelete', isLoggedIn, function (req, res) {
    Reply.findOneAndDelete({ $or:[ {replyBody:req.body.replyBody}, {image:req.body.image} ]}, function (err, reply) {
      if (err) {
        throw err
      } else {
        res.redirect('/b/'.concat(req.params.boardName).concat('/').concat(req.params.threadName))
      }
    })
  })

  // =====================================
  // LOGOUT ==============================
  // =====================================
  app.get('/logout', function (req, res) {
    req.logout()
    res.redirect('/')
  })
}

// route middleware to make sure a user is logged in
function isLoggedIn (req, res, next) {

  // if user is authenticated in the session, carry on 
  if (req.isAuthenticated())
    return next()

  // if they aren't redirect them to the home page
  res.redirect('/')
}
