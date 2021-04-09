/**
 * CardController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

    // action - list
    list: async function (req, res) {

        if (req.method == "GET") {
            var everyones = await BankCard.find();

            return res.view('bankcard/list', { bankcards: everyones, session: req.session });
        } else {
            if (req.wantsJSON) {
                return res.json(req.session)
            }
        }

    },

    // action - create
    create: async function (req, res) {

        if (req.method == "GET") return res.view('bankcard/create');

        if (req.wantsJSON) {
            var bankcard = await BankCard.create(req.body).fetch();

            return res.json(bankcard.id);
        } else {
            return res.redirect('/');			// for normal request
        }

    },

      // action - read
      read: async function (req, res) {

        if (!req.session.username) return res.json("Please log in first");

        var thatBankCard = await BankCard.findOne(req.params.id);

        if (!thatBankCard) return res.notFound();

        return res.view('bankcard/read', { bankcard: thatBankCard });

    },


};

