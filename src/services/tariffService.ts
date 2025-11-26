import knex from '../postgres/knex.js';
import { logger } from '../utils/logger.js';
import { BoxTariffRecord, GoogleSheetConfig } from '../types/tariff.js';

export class TariffService {
  async saveOrUpdateDailyTariffs(tariffsData: any[]): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      await knex.transaction(async (trx) => {
        await trx('box_tariffs')
          .where('tariff_date', today)
          .delete();
        await trx('box_tariffs')
          .insert(tariffsData);

        logger.info(`Successfully updated ${tariffsData.length} tariffs for date ${today.toISOString().split('T')[0]}`);
      });
    } catch (error) {
      logger.error('Error saving/updating tariffs to database:', error);
      throw error;
    }
  }

  async getTodayTariffs(): Promise<BoxTariffRecord[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      const tariffs = await knex('box_tariffs')
        .where('tariff_date', today)
        .orderBy('boxStorageCoefExpr', 'asc') // сортировка по коэффициенту
        .select('*');

      return tariffs;
    } catch (error) {
      logger.error('Error fetching today tariffs from database:', error);
      throw error;
    }
  }

  async getAllActiveSheetConfigs(): Promise<GoogleSheetConfig[]> {
    try {
      const configs = await knex('google_sheets_config')
        .where('is_active', true)
        .select('*');

      return configs;
    } catch (error) {
      logger.error('Error fetching Google Sheets configs:', error);
      throw error;
    }
  }

  async updateSheetLastUpdated(sheetId: string): Promise<void> {
    try {
      await knex('google_sheets_config')
        .where('sheet_id', sheetId)
        .update({
          last_updated: new Date(),
        });
    } catch (error) {
      logger.error('Error updating sheet last_updated:', error);
      throw error;
    }
  }

  async addGoogleSheetConfig(sheetId: string, sheetName: string = 'stocks_coefs'): Promise<void> {
    try {
      await knex('google_sheets_config')
        .insert({
          sheet_id: sheetId,
          sheet_name: sheetName,
          is_active: true,
        })
        .onConflict('sheet_id')
        .merge();
      
      logger.info(`Added/updated Google Sheet config: ${sheetId}`);
    } catch (error) {
      logger.error('Error adding Google Sheet config:', error);
      throw error;
    }
  }
}