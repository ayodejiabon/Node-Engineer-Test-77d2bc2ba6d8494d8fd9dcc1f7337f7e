const Model = require('../objection');

exports.usersModel = class Users extends Model {
    
    static get tableName() {
      return 'users';
    }
  
    static get idColumn() {
      return 'user_id';
    }

    static get jsonSchema() {
      return {
        type: 'object',
        required: ['user_id', 'email', 'name', 'password', 'created'],
        properties: {
          user_id: { type: 'string' },
          name: {type: 'string'},
          email: {type: 'string'},
          password: {type: 'string'},
          captured: {type: Date}
        }
      };
    }
}

exports.userBanksModel = class UserBanks extends Model {

    static get tableName() {
      return 'beneficiary_banks';
    }
  
    static get idColumn() {
      return 'transfer_code';
    }

    static get jsonSchema() {
      return {
        type: 'object',
        required: ['user_id', 'bank_code', 'bank_account', 'transfer_code', 'created'],
        properties: {
          user_id: {type: 'string' },
          bank_code: {type: 'string'},
          bank_account: {type: 'string'},
          transfer_code: {type: 'string'},
          captured: {type: Date}
        }
      };
    }
}