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
};

