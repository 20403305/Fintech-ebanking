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

    registercard: async function (req, res) {
        if (!req.session.username) return res.json("Please log in first");

        if (req.wantsJSON) {
            //检查这个卡号是否绑定的人名
            var thatBankCard = await BankCard.findOne(req.params.fk);
            if (thatBankCard.owner != "")
                return res.json("此卡已有绑定过用户"); // conflict

            if (!req.body.owner) return res.json("请输入持卡人姓名");
            if (!req.body.owner_idcard) return res.json("请输入持卡人身份证");
            if (!req.body.reserve_phone_number) return res.json("请输入持卡人预留手机号");
            if (!req.body.payment_password) return res.json("请输入支付密码");

            sails.bcrypt = require('bcryptjs');
            var salt = await sails.bcrypt.genSalt(10);
            var hash = await sails.bcrypt.hash(req.body.payment_password, salt);
            req.body.payment_password = hash;

            //将这张卡与此用户绑定
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

        var user = await User.findOne(req.session.userid).populate("bankcards");

        return res.view('user/acc_overview', { users: user });
    },
    
    tiedcard: async function (req, res) {
        if (!req.session.username) return res.view('user/login_black', { layout: 'layouts/u_layout' });
        if (req.wantsJSON) {

            //查找是否有这个卡号和所属银行是否正确
            if (!req.body.new_card_number) return res.status(401).json("请输入卡号");

            var new_card_number = await BankCard.findOne({ id: req.body.new_card_number });
            if (!new_card_number) return res.status(401).json("没有该卡号");

            //检查这个卡号的持卡人是否是该用户
            var thatBankCard = await BankCard.findOne(req.body.new_card_number);
            if (thatBankCard.owner == "") return res.status(401).json("bug--该卡号没有被持卡人");

            //检查这个卡号的持卡人是否是该用户
            if (new_card_number.owner != req.session.username) return res.status(401).json("卡号绑定的用户信息与您不匹配");

            //检查这个卡号是否绑定过到网上银行的账户
            var thatBankCard = await BankCard.findOne(new_card_number).populate("creditors");
            if (thatBankCard.creditors.length > 0)
                return res.status(401).json("此卡已有绑过网上银行"); // conflict

            //将用户输入的卡号与用户网上银行账户绑定
            await User.addToCollection(req.session.userid, "bankcards").members(new_card_number.id);


            return res.json("Add Success"); // for ajax request
        } else {
            return res.redirect("/");

        }

    },


};