/**
 * CardController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

    // action - list
    list: async function (req, res) {
        if (!req.session.username) return res.json("Please log in first");

//         ????问什么会不行
//         member
// error: Sending 500 ("Server Error") response: 
//  Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client
//     at ServerResponse.setHeader (_http_outgoing.js:518:11)
//     at ServerResponse.header (C:\Users\HP\Desktop\7300project\banksystem\node_modules\express\lib\response.js:771:10)

        // console.log(req.session.userrole)
        if (req.session.userrole != "admin") res.json("Not permission");
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

    // action - list
    homepage: async function (req, res) {
            return res.view('bankcard/homepage');
    },


};

