import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('box_tariffs', (table) => {
    table.increments('id').primary();
    table.decimal('boxDeliveryBase', 10, 2).comment('boxDeliveryBase');
    table.decimal('boxDeliveryCoefExpr', 10, 2).comment('boxDeliveryCoefExpr');
    table.decimal('boxDeliveryLiter', 10, 2).comment('boxDeliveryLiter');
    table.decimal('boxDeliveryMarketplaceBase', 10, 2).comment('boxDeliveryMarketplaceBase');
    table.decimal('boxDeliveryMarketplaceCoefExpr', 10, 2).comment('boxDeliveryMarketplaceCoefExpr');
    table.decimal('boxDeliveryMarketplaceLiter', 10, 2).comment('boxDeliveryMarketplaceLiter');
    table.decimal('boxStorageBase', 10, 2).comment('boxStorageBase');
    table.decimal('boxStorageCoefExpr', 10, 2).comment('boxStorageCoefExpr');
    table.decimal('boxStorageLiter', 10, 2).comment('boxStorageLiter');
    table.string('geoName').notNullable().comment('geoName');
    table.string('warehouseName').notNullable().comment('warehouseName');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.date('tariff_date').notNullable().comment('Дата действия тарифа');

    table.index(['tariff_date']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('box_tariffs');
}