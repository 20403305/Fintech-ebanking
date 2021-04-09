/**
 * TransacController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    transfer: async function (req, res) {

        // if (!req.session.username) return res.status(404).json("Please log in first");
        if (!req.session.username) return res.view('user/login_black', { layout: 'layouts/u_layout' });

        if (req.method == "GET") {

            var user = await User.findOne(req.session.userid).populate("bankcards");

            if (!user) return res.notFound();

            return res.view('transac/transfer',{users: user,});

        }

        if (req.wantsJSON) {


            // var thatUser = await User.findOne({ username: req.session.username });

            // if (!await User.findOne(req.params.id)) return res.status(404).json("Please log in first");

            //查找是否有这个卡号和所属银行是否正确
            if (!req.body.receiving_card_number) return res.status(401).json("请输入卡号");
            if (req.body.payment_card_number == req.body.receiving_card_number) return res.status(401).json("请勿自转账");

            var curr_receiving_card_number = await BankCard.findOne({ id: req.body.receiving_card_number });
            if (!curr_receiving_card_number) return res.status(401).json("没有这张卡号");
            if (curr_receiving_card_number.region != req.body.receiving_bank) return res.status(401).json("收款银行 not found");

            //检查这个卡号绑定的人名
            var thatBankCard = await BankCard.findOne(req.body.receiving_card_number);
            if (thatBankCard.owner == "")
                return res.status(401).json("此卡还没被用户注册"); // conflict
            if (thatBankCard.owner != req.body.receiving_name)
                return res.status(401).json("收款人名称错误"); // conflict
            // var thatBankCard = await BankCard.findOne(req.body.receiving_card_number).populate("creditors", { username: req.body.receiving_name });
            // if (thatBankCard.creditors.length <= 0)
            //     return res.status(401).json("未找到对应收款人，收款人名称错误"); // conflict


            //检查汇款账户的balances够不够 和 检查卡号的支付密码是否正确
            if (!req.body.remittance_amount) return res.status(401).json("请输入汇款金额");
            var curr_payment_card_number = await BankCard.findOne({ id: req.body.payment_card_number });
            if (!curr_payment_card_number) return res.status(401).json("卡号not found-->系统bug");

            var match = await sails.bcrypt.compare(req.body.payment_password, curr_payment_card_number.payment_password);
            if (!match) return res.status(401).json("支付密码错误");
            // if (curr_payment_card_number.payment_password != req.body.payment_password) return res.status(401).json("支付密码错误");


            if (req.body.remittance_amount > curr_payment_card_number.balances) return res.status(401).json("账户余额不足");

            //扣除相应的汇款账户的balances
            var payment_card_number_curr_balances = parseFloat(curr_payment_card_number.balances) - parseFloat(req.body.remittance_amount);
            if (payment_card_number_curr_balances < 0) return res.json("Not enough balances-->系统bug");
            var updatedcurr_payment_card_number = await BankCard.updateOne(curr_payment_card_number.id).set({ balances: payment_card_number_curr_balances });
            if (!updatedcurr_payment_card_number) return res.status(404).json("Server error! bug");

            //添加收款账户相应的balances
            var receiving_card_number_curr_balances = parseFloat(curr_receiving_card_number.balances) + parseFloat(req.body.remittance_amount);
            if (receiving_card_number_curr_balances < 0) return res.json("Not enough balances-->系统bug");
            var updatedcurr_receiving_card_number = await BankCard.updateOne(curr_receiving_card_number.id).set({ balances: receiving_card_number_curr_balances });
            if (!updatedcurr_receiving_card_number) return res.status(404).json("Server error! bug");


            // 格式只有年月日
            function getNowFormatDate() {
                var date = new Date();
                var seperator1 = "-";
                var year = date.getFullYear();
                var month = date.getMonth() + 1;
                var strDate = date.getDate();
                if (month >= 1 && month <= 9) {
                    month = "0" + month;
                }
                if (strDate >= 0 && strDate <= 9) {
                    strDate = "0" + strDate;
                }
                var currentdate = year + seperator1 + month + seperator1 + strDate;
                return currentdate;
            }

            // 格式有年月日 时分秒
            function getFormatDate() {
                var date = new Date();
                var month = date.getMonth() + 1;
                var strDate = date.getDate();
                if (month >= 1 && month <= 9) {
                    month = "0" + month;
                }
                if (strDate >= 0 && strDate <= 9) {
                    strDate = "0" + strDate;
                }
                var currentDate = date.getFullYear() + "-" + month + "-" + strDate +
                    " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
                return currentDate;
            }
            var getNowDate = getFormatDate();

            await Transac.createEach([{
                remittance_card_number: curr_payment_card_number.id,
                remittance_account: 20403305,
                remittance_name: curr_payment_card_number.owner,
                remittance_time: getNowDate,
                remittance_balance: payment_card_number_curr_balances,
                receiving_card_number: curr_receiving_card_number.id,
                // receiving_account:
                receiving_name: req.body.receiving_name,
                receiving_time: getNowDate,
                receiving_balance: receiving_card_number_curr_balances,
                transaction_amount: parseFloat(req.body.remittance_amount),
                business_summary: "小额汇款",
                Trading_channel: "网上银行",
                postscript: req.body.postscript
            }]);


            return res.json("转账成功！"); // for ajax request
        } else {

            return res.redirect("/");

        }

    },

      // json function
      records: async function (req, res) {

        // if (!req.session.username) return res.status(404).json("Please log in first");
        if (!req.session.username) return res.view('user/login_black', { layout: 'layouts/u_layout' });


        if (!req.body.card_number) return res.json("请选择卡号");

        // 默认搜索从句（条件）为空
        var expenditure = {};
        var incomerecord = {};

        var card_number = parseInt(req.body.card_number);
        // 支出交易纪录
        if (req.body.card_number) expenditure.remittance_card_number = card_number;
        var every_expand_transac = await Transac.find({
            where: expenditure,
            sort: 'remittance_time DESC'
        });

        // 收入交易纪录
        if (req.body.card_number) incomerecord.receiving_card_number = card_number;
        var every_income_transac = await Transac.find({
            where: incomerecord,
            sort: 'receiving_time DESC'
        });

        // //总纪录
        var every_transac = await Transac.find({
            or: [
                { remittance_card_number: card_number },
                { receiving_card_number: card_number }
            ]
        });

        var user = await User.findOne(req.session.userid).populate("bankcards");


        return res.view('transac/records', { curr_card_number: card_number, users: user, hisexpand: every_expand_transac, hisincome: every_income_transac, histransacs: every_transac });
    },

        // json function
        details: async function (req, res) {
            if (!req.session.username) return res.json("Please log in first");
            // 交易纪录
            if (!req.body.histransac_id) return res.json("系统bug");
            if (!req.body.curr_card_number) return res.json("系统bug");
            var one_trading = await Transac.findOne({ id: req.body.histransac_id });
            return res.view('transac/details', { objtransac: one_trading, curr_card_number: req.body.curr_card_number });
        },
    

};

