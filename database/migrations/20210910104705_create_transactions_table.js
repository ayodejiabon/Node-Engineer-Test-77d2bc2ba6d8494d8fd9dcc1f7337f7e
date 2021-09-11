exports.up = async function up(knex) {

    await knex.schema.createTable('debit_transactions', table => {

        table.increments('id').unsigned().notNullable().primary();
        table.string('user_id', 20).notNullable();
        table.enum('trx_type', ['transfer','withdraw']).notNullable();
        table.string('ref_code', 100).unique().notNullable();
        table.text('meta_data').nullable().defaultTo(null);
        table.float('amount').notNullable();
        table.enum('status', ['pending','completed', 'failed']).notNullable().defaultTo('pending');
        table.dateTime('created').notNullable().defaultTo(knex.fn.now());

        table.foreign('user_id').references('users.user_id');
    });

    await knex.schema.createTable('credit_transactions', table => {
        table.increments('id').unsigned().notNullable().primary();
        table.string('user_id', 20).notNullable();
        table.enum('channel', ['card','transfer','bank_transfer']).notNullable();
        table.string('ref_code', 100).unique().notNullable();
        table.text('meta_data').nullable().defaultTo(null);
        table.float('amount').notNullable();
        table.enum('status', ['pending','completed','failed']).notNullable().defaultTo('pending');
        table.dateTime('created').notNullable().defaultTo(knex.fn.now());

        table.foreign('user_id').references('users.user_id');
    });
};
  
exports.down = async function down(knex) {
    await knex.schema.dropTable('debit_transactions');
    await knex.schema.dropTable('credit_transactions');
};
  