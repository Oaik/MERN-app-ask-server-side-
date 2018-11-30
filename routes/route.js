const express       = require('express');
const router        = express.Router();
const config        = require('../config/config')
const passport      = require('passport')
const bcrypt        = require('bcrypt')

const User          = require('../schema/User')
const Post          = require('../schema/Post')

router.route('/')
    .get( (req, res) => {
        res.render('index', { title: 'Hey', message: 'Hello there!' })
        // next()
    })

router.route('/register')
    .get((req, res) => {
        res.render("register");
    })
    .post((req, res) => {
        req.body.username = req.body.username.toLowerCase();
        let userInfo = req.body;
        User.findOne({username: userInfo.username}, (err, user) => {
            if (err) return res.send(err)
            if (user) return res.status(404).send("this user already registerted")
            bcrypt.hash(req.body.password, config.saltRound, (err, hash) => {
                if(err) return console.log(err)
                userInfo.password = hash;
                let newUser = new User(userInfo);
                newUser.save().then(() => {
                    console.log("User Saved!!!")
                    req.login(newUser, (err) => {
                        if (err) return console.log(err);
                        res.redirect("/")
                    });
                }).catch((err) => {
                    res.send(`Error: ${err}`)
                })
            })
        })    
    })

router.route("/login")
    .get((req, res) => {
        res.render('login');
    })
    .post(passport.authenticate('local',{
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: false 
    }))

router.route("/account")
    .get((req, res) => {
        if(req.isAuthenticated())
            res.send(req.user);
        else
            res.send("You not allowed to view this page, Please Login")
    })

module.exports = router