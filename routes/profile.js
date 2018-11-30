const express       = require('express');
const router        = express.Router();

const User          = require('../schema/User')
const Post          = require('../schema/Post')

router.route("/:profile/questions/:post")
    .get((req, res) => {
        if(!req.isAuthenticated()) return res.send("You should Log in First");
        let profileUsername = req.user.username
        if (req.params.profile !== profileUsername) return res.send("You are not allowed to view this page")
        Post.findById(req.params.post, (err, post) => {
            if (err) return res.send(err, "ERROR");
            console.log(post);
            if (profileUsername !== post.userAsked) return res.send("You are not allowed to view this page,,,")
            if(post.questionAnswered)
                return res.send(post);
            res.render("question", {postBody: post.body, userAsking: post.userAsking, username: profileUsername, postId: post._id})
        })
    })
    .post((req, res) => {
        if(!req.isAuthenticated()) return res.send("You should Log in First");
        let profileUsername = req.user.username
        if (req.params.profile !== profileUsername) return res.send("You are not allowed to view this page")
        Post.findById(req.params.post, (err, post) => {
            if (err) return res.send(err, "ERROR");
            if (profileUsername !== post.userAsked) return res.send("You are not allowed to view this page,,,")
            let answerPost = post;
            answerPost.answer = req.body.answer, answerPost.questionAnswered = true;
            Post.findOneAndUpdate({_id: req.params.post}, answerPost).then((post) => {
                res.redirect('/profile/' + profileUsername + '/questions/');
            });
        })
    })

router.route("/:profile/questions")
    .get((req, res) => {
        if(!req.isAuthenticated()) return res.send("You should Log in First");
        let profileUsername = req.user.username
        if (req.params.profile !== profileUsername) return res.send("You are not allowed to view this page")
        Post.find({userAsked: profileUsername}, (err, post) => {
            if(err) return res.send("err from post inside profile");
            let data = post.filter((answer) => {
                return answer.questionAnswered === false
            })
            if(!data || data.length === 0) return res.send("You Have No Questions")
            res.send(data)
        })
    })

router.route("/:profile")
    .get((req, res) => {
        const profileUsername = req.params.profile;
        User.findOne({username: profileUsername}, (err, profile) => {
            if (err) return res.send("Error");
            if (!profile || profile == null) return res.send("Profile not found")
            Post.find({userAsked: profileUsername}, (err, post) => {
                if(err) return res.send("err from post inside profile");
                console.log(post);
                let data = post.filter((answer) => {
                    return answer.questionAnswered === true
                })
                if(!data || data.length === 0) return res.send("No questions answered by this person")
                res.send(data)
            })
        })
    })
    .post((req, res) => {
        const profileUsername = req.params.profile;
        User.findOne({username: profileUsername}, (err, profile) => {
            if (err) return res.send("Error");
            if (!profile || profile == null) return res.send("Profile not found")
            const body = req.body;
            if(!body.allowName)
                body.userAsking = null;
            body.userAsked = req.params.profile;
            body.answer = null;
            let newPost = new Post(body);
            newPost.save()
                .then(() => {
                    res.send("Question has been sent")
                })
                .catch((err) => {
                    console.log(err);
                    res.status(503).send("Error");
                })
        })        
    })

module.exports = router