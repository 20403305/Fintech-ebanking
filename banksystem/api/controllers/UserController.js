/**
 * PersonController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

    login: async function (req, res) {

        if (req.method == "GET") return res.view('user/login_black', { layout: 'layouts/u_layout' });

        if (!req.body.identifying_code) return res.status(401).json("Please enter verification code");

        if (req.body.identifying_code != req.body.real_identifying_code) return res.status(401).json("Verification code error");

        // if (!req.body.username || !req.body.password) return res.badRequest();

        if (!req.body.username) return res.status(401).json("Enter username, please~");
        
        if (!req.body.password) return res.status(401).json("Enter password, please~");

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

    self_info: async function (req, res) {
        if (!req.session.username) return res.view('user/login_black', { layout: 'layouts/u_layout' });

        var user = await User.findOne(req.session.userid);

        return res.view('user/self_info', { user: user });
    },
    
    change_password: async function (req, res) {
        if (!req.session.username) return res.view('user/login_black', { layout: 'layouts/u_layout' });

        if (req.method == "GET") return res.view('user/change_password');

        if (!req.body.old_password) return res.json("??????????????????");

        if (!req.body.new_password) return res.json("??????????????????");
        if (!req.body.new_password_verify) return res.json("????????????????????????");


        var user = await User.findOne(req.session.userid);

        var match = await sails.bcrypt.compare(req.body.old_password, user.password);
        if (!match) return res.status(401).json("???????????????");

        if (req.body.new_password != req.body.new_password_verify) return res.json("??????????????????????????????");

        if (req.body.old_password == req.body.new_password) return res.json("????????????????????????????????????");

        sails.bcrypt = require('bcryptjs');
        var salt = await sails.bcrypt.genSalt(10);

        var hash = await sails.bcrypt.hash(req.body.new_password, salt);

        var updated_password = await User.updateOne(req.session.userid).set({ password: hash });
        if (!updated_password) return res.status(404).json("Server error! bug");

        return res.json('??????????????????');
    },

    registercard: async function (req, res) {
        if (!req.session.username) return res.json("Please log in first");

        if (req.wantsJSON) {
            //???????????????????????????????????????
            var thatBankCard = await BankCard.findOne(req.params.fk);
            if (thatBankCard.owner != "")
                return res.json("???????????????????????????"); // conflict

            if (!req.body.owner) return res.json("????????????????????????");
            if (!req.body.owner_idcard) return res.json("???????????????????????????");
            if (!req.body.reserve_phone_number) return res.json("?????????????????????????????????");
            if (!req.body.payment_password) return res.json("?????????????????????");

            sails.bcrypt = require('bcryptjs');
            var salt = await sails.bcrypt.genSalt(10);
            var hash = await sails.bcrypt.hash(req.body.payment_password, salt);
            req.body.payment_password = hash;

            //??????????????????????????????
            // var updatedcard_info = await BankCard.updateOne(req.params.fk).set({ owner: req.session.username });
            var updatedcard_info = await BankCard.updateOne(req.params.fk).set(req.body);
            if (!updatedcard_info) return res.status(404).json("Server error! bug");

            return res.json("Registercard Success"); // for ajax request
        } else {

            return res.redirect("/");

        }
    },


    overview: async function (req, res) {
        if (!req.session.username) return res.view('user/login_black', { layout: 'layouts/u_layout' });
        if (req.wantsJSON) {
        var user = await User.findOne(req.session.userid).populate("bankcards");

        return res.json(user);
        }
        else{
            var user = await User.findOne(req.session.userid).populate("bankcards");

            return res.view('user/acc_overview', { users: user });
        }
    },
    
    tiedcard: async function (req, res) {
        if (!req.session.username) return res.view('user/login_black', { layout: 'layouts/u_layout' });
        if (req.wantsJSON) {

            //??????????????????????????????????????????????????????
            if (!req.body.new_card_number) return res.status(401).json("???????????????");

            var new_card_number = await BankCard.findOne({ id: req.body.new_card_number });
            if (!new_card_number) return res.status(401).json("???????????????");

            //????????????????????????????????????????????????
            var thatBankCard = await BankCard.findOne(req.body.new_card_number);
            if (thatBankCard.owner == "") return res.status(401).json("bug--???????????????????????????");

            //????????????????????????????????????????????????
            if (new_card_number.owner != req.session.username) return res.status(401).json("??????????????????????????????????????????");

            //?????????????????????????????????????????????????????????
            var thatBankCard = await BankCard.findOne(new_card_number).populate("creditors");
            if (thatBankCard.creditors.length > 0)
                return res.status(401).json("??????????????????????????????"); // conflict

            //?????????????????????????????????????????????????????????
            await User.addToCollection(req.session.userid, "bankcards").members(new_card_number.id);


            return res.json("Add Success"); // for ajax request
        } else {
            return res.redirect("/");

        }

    },


};