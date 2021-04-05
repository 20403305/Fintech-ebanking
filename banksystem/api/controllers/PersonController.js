/**
 * PersonController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    // action - create
    create: async function(req, res) {

        if (req.method == "GET") return res.view('person/create');

        var person = await Person.create(req.body).fetch();

        return res.status(201).json({ id: person.id });
    },

    // json function
    json: async function(req, res) {

        var everyones = await Person.find();

        return res.json(everyones);
    },

    // action - list
    list: async function(req, res) {

        var everyones = await Person.find();

        return res.view('person/list', { persons: everyones });
    },

    // action - read
    read: async function(req, res) {

        var thatPerson = await Person.findOne(req.params.id);

        if (!thatPerson) return res.notFound();

        return res.view('person/read', { person: thatPerson });
    },

    // action - delete 
    delete: async function(req, res) {

        var deletedPerson = await Person.destroyOne(req.params.id);

        if (!deletedPerson) return res.notFound();

        return res.ok();
    },

    // action - update
    update: async function(req, res) {

        if (req.method == "GET") {

            var thatPerson = await Person.findOne(req.params.id);

            if (!thatPerson) return res.notFound();

            return res.view('person/update', { person: thatPerson });

        } else {

            var updatedPerson = await Person.updateOne(req.params.id).set(req.body);

            if (!updatedPerson) return res.notFound();

            return res.ok();
        }
    },
    login: async function(req, res) {

        if (req.method == "GET") return res.view('person/login', { layout: 'layouts/u_layout' });

        if (!req.body.username || !req.body.password) return res.badRequest();

        var person = await Person.findOne({ username: req.body.username });

        if (!person) return res.status(401).json("User not found");

        var match = await sails.bcrypt.compare(req.body.password, person.password);

        if (!match) return res.status(401).json("Wrong Password");

        // Reuse existing session 
        if (!req.session.username) {
            req.session.username = person.username;
            return res.json(person);
        }

        // Start a new session for the new login user
        req.session.regenerate(function(err) {

            if (err) return res.serverError(err);

            req.session.username = person.username;
            return res.json(person);
        });
    },
    logout: async function(req, res) {

        req.session.destroy(function(err) {

            if (err) return res.serverError(err);

            return res.json(req.session.id);
        });
    },
};