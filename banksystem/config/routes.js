/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {

    /***************************************************************************
     *                                                                          *
     * Make the view located at `views/homepage.ejs` your home page.            *
     *                                                                          *
     * (Alternatively, remove this and add an `index.html` file in your         *
     * `assets` directory)                                                      *
     *                                                                          *
     ***************************************************************************/

    // '/': { view: 'pages/homepage' },


    /***************************************************************************
     *                                                                          *
     * More custom routes here...                                               *
     * (See https://sailsjs.com/config/routes for examples.)                    *
     *                                                                          *
     * If a request to a URL doesn't match any of the routes in this file, it   *
     * is matched against "shadow routes" (e.g. blueprint routes).  If it does  *
     * not match any of those, it is matched against static assets.             *
     *                                                                          *
     ***************************************************************************/

    'GET /': 'BankCardController.homepage',


    'GET /user/login': 'UserController.login',
    'POST /user/login': 'UserController.login',
    'POST /user/logout': 'UserController.logout',
    'GET /user/signup': 'UserController.signup',
    'POST /user/signup': 'UserController.signup',


    'POST /user/registercard/:fk': 'UserController.registercard',
    'GET /user/acc_overview': 'UserController.overview',
    'POST /user/tiedcard/': 'UserController.tiedcard',



    'GET /list': 'BankCardController.list',
    'POST /list': 'BankCardController.list',

    'GET /bankcard/create': 'BankCardController.create',
    'POST /bankcard/create': 'BankCardController.create',

    'GET /bankcard/read/:id': 'BankCardController.read',

    //转账请求
    'GET /transac/transfer/': 'TransacController.transfer',
    'POST /transac/transfer/': 'TransacController.transfer',


};