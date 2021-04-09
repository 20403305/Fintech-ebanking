/**
 * Seed Function
 * (sails.config.bootstrap)
 *
 * A function that runs just before your Sails app gets lifted.
 * > Need more flexibility?  You can also create a hook.
 *
 * For more information on seeding your app with fake data, check out:
 * https://sailsjs.com/config/bootstrap
 */

module.exports.bootstrap = async function() {
    // By convention, this is a good place to set up fake data during development.
    //
    // For example:
    // ```
    // // Set up fake development data (or if we already have some, avast)
    // if (await User.count() > 0) {
    //   return;
    // }
    //
    // await User.createEach([
    //   { emailAddress: 'ry@example.com', fullName: 'Ryan Dahl', },
    //   { emailAddress: 'rachael@example.com', fullName: 'Rachael Shaw', },
    //   // etc.
    // ]);
    // ```

    sails.bcrypt = require('bcryptjs');
    var salt = await sails.bcrypt.genSalt(10);


    // 创建用户
    if (await User.count() > 0) {
        return;
    }
    var hash = await sails.bcrypt.hash('0', salt);
    await User.createEach([
        { username: "admin", password: hash,role:"admin" },
        { username: "Kenny", password: hash,role:"member" }
    ]);



};