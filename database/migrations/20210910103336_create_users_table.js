exports.up = async function up(knex) {
    await knex.schema.createTable('users', table => {
        table.increments('id').unsigned().notNullable().primary();
        table.string('user_id', 20).unique().notNullable();
        table.string('email', 100).unique().notNullable();
        table.string('name', 100).notNullable();
        table.string('password', 100).unique().notNullable();
        table.float('balance').notNullable().defaultTo(0);
        table.enum('status', ['active','not_active']).notNullable().defaultTo('active');
        table.dateTime('created').notNullable().defaultTo(knex.fn.now());
    });
};
  
exports.down = async function down(knex) {
    await knex.schema.dropTable('users');
};
  