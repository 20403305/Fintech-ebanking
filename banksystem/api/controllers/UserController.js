/**
 * PersonController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

    login: async function (req, res) {

        if (req.method == "GET") return res.view('user/login_black', { layout: 'layouts/u_layout' });

        if (!req.body.username || !req.body.password) return res.badRequest();

        var user = await User.findOne({ username: req.body.username });

        if (!user) return res.status(401).json("User not found");

        var match = await sails.bcrypt.compare(req.body.password, user.password);
        if (!match) return res.status(401).json("Wrong Password");

        // Reuse existing session 
        if (!req.session.username) {
            req.session.username = user.username;
            req.session.userid = user.id
            req.session.userrole = user.role
            return res.json(user);
        }

        // Start a new session for the new login user
        req.session.regenerate(function (err) {

            if (err) return res.serverError(err);

            req.session.username = user.username;
            req.session.userid = user.id
            req.session.userrole = user.role
            return res.json(user);
        });
    },

    logout: async function (req, res) {
        req.session.destroy(function (err) {
            if (err) return res.serverError(err);
            return res.redirect("/");
        });
    },

    signup: async function (req, res) {

        if (req.method == "GET") return res.view('user/signup', { layout: 'layouts/signup_layout' });

        if (!req.body.username || !req.body.password) return res.badRequest();

        var user = await User.findOne({ username: req.body.username });

        if (user) return res.status(401).json("Username have been used");

        var signup_username = req.body.username;
        var signup_password = req.body.password;


        sails.bcrypt = require('bcryptjs');
        var salt = await sails.bcrypt.genSalt(10);

        var hash = await sails.bcrypt.hash(signup_password, salt);

        await User.createEach([
            { username: signup_username, password: hash, role: "member"},
            // etc.
        ]);

        return res.json("Success Create!");
    },

};