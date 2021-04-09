/**
 * Transac.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    remittance_card_number: {
      type: "number"
    },

    remittance_account: {
      type: "number"
    },

    remittance_name: {
      type: "string"
    },

    remittance_time: {
      type: "string"
    },

    remittance_balance: {
      type: "number"
    },

    receiving_card_number: {
      type: "number"
    },

    receiving_account: {
      type: "number"
    },

    receiving_name: {
      type: "string"
    },
    receiving_time: {
      type: "string"
    },

    receiving_balance: {
      type: "number"
    },

    transaction_amount: {
      type: "number"
    },

    business_summary: {
      type: "string"
    },

    Trading_channel: {
      type: "string"
    },

    postscript: {
      type: "string"
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝


    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

  },

};

