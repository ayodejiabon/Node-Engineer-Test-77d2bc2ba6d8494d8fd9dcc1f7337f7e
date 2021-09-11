exports.up = async function up(knex) {

    await knex.schema.createTable('beneficiary_banks', table => {
        table.increments('id').unsigned().notNullable().primary();
        table.string('user_id', 20).notNullable();
        table.string('bank_code', 10).notNullable();
        table.string('bank_account', 20).notNullable();
        table.string('transfer_code', 100).unique().notNullable();
        table.dateTime('created').notNullable().defaultTo(knex.fn.now());
        
        table.foreign('user_id').references('users.user_id');
    });
};
  
exports.down = async function down(knex) {
    await knex.schema.dropTable('beneficiary_banks');
};
  