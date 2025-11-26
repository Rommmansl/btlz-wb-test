import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('google_sheets_config', (table) => {
    table.increments('id').primary();
    table.string('sheet_id').notNullable().unique().comment('ID Google таблицы');
    table.string('sheet_name').defaultTo('stocks_coefs').comment('Название листа');
    table.boolean('is_active').defaultTo(true).comment('Активна ли таблица для обновления');
    table.timestamp('last_updated').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index(['sheet_id']);
    table.index(['is_active']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('google_sheets_config');
}