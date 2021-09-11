const Model = require('../objection');

exports.creditTransactionModel = class creditTransaction extends Model {
    
    static get tableName() {
      return 'credit_transactions';
    }
  
    static get idColumn() {
      return 'ref_code';
    }

    static get jsonSchema() {
      return {
        type: 'object',
        required: ['user_id', 'channel', 'ref_code', 'meta_data', 'amount', 'created'],
        properties: {
          user_id: { type: 'string' },
          channel: {type: 'string'},
          ref_code: {type: 'string'},
          meta_data: {type: ['string', null]},
          amount: {type: 'number'},
          captured: {type: Date}
        }
      };
    }
}

exports.debitTransactionModel = class debitTransaction extends Model {
    
    static get tableName() {
      return 'debit_transactions';
    }
  
    static get idColumn() {
      return 'ref_code';
    }

    static get jsonSchema() {
      return {
        type: 'object',
        required: ['user_id', 'trx_type', 'ref_code', 'meta_data', 'amount', 'created'],
        properties: {
          user_id: { type: 'string' },
          trx_type: {type: 'string'},
          ref_code: {type: 'string'},
          meta_data: {type: ['string', null]},
          amount: {type: 'number'},
          captured: {type: Date}
        }
      };
    }
}