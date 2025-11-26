import cron from 'node-cron';
import { logger } from '../utils/logger.js';
import { WBService } from './wbService.js';
import { TariffService } from './tariffService.js';
import { GoogleSheetsService } from './googleSheetsService.js';

export class SchedulerService {
  private wbService: WBService;
  private tariffService: TariffService;
  private googleSheetsService: GoogleSheetsService;

  constructor() {
    this.wbService = new WBService();
    this.tariffService = new TariffService();
    this.googleSheetsService = new GoogleSheetsService();
  }

  async initialize(): Promise<void> {
    for (const sheetId of process.env.GOOGLE_SHEET_IDS?.split(',') || []) {
      if (sheetId.trim()) {
        await this.tariffService.addGoogleSheetConfig(sheetId.trim());
      }
    }
  }

  start(): void {
    cron.schedule(process.env.CRON_TARIFFS_FETCH || '0 * * * *', async () => {
      logger.info('Starting scheduled box tariffs fetch task');
      await this.fetchAndSaveTariffs();
    });

    cron.schedule(process.env.CRON_SHEETS_UPDATE || '30 * * * *', async () => {
      logger.info('Starting scheduled Google Sheets update task');
      await this.updateAllGoogleSheets();
    });

    logger.info('Scheduler service started');
  }

  private async fetchAndSaveTariffs(): Promise<void> {
    try {
      const tariffs = await this.wbService.getBoxTariffs();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const transformedData = this.wbService.transformTariffData(tariffs, today);
      await this.tariffService.saveOrUpdateDailyTariffs(transformedData);
      
      logger.info('Box tariffs fetch and save task completed successfully');
    } catch (error) {
      logger.error('Error in fetch and save box tariffs task:', error);
    }
  }

  private async updateAllGoogleSheets(): Promise<void> {
    try {
      const sheetConfigs = await this.tariffService.getAllActiveSheetConfigs();
      const tariffs = await this.tariffService.getTodayTariffs();
      if (tariffs.length === 0) {
        logger.warn('No tariffs found for today, skipping Google Sheets update');
        return;
      }

      for (const config of sheetConfigs) {
        try {
          await this.googleSheetsService.updateSheetWithTariffs(
            config.sheet_id,
            config.sheet_name,
            tariffs
          );
          await this.tariffService.updateSheetLastUpdated(config.sheet_id);
          logger.info(`Successfully updated sheet: ${config.sheet_id}`);
        } catch (error) {
          logger.error(`Failed to update sheet ${config.sheet_id}:`, error);
        }
      }

      logger.info('Google Sheets update task completed');
    } catch (error) {
      logger.error('Error in Google Sheets update task:', error);
    }
  }

  async manualFetchAndSave(): Promise<void> {
    await this.fetchAndSaveTariffs();
  }

  async manualUpdateSheets(): Promise<void> {
    await this.updateAllGoogleSheets();
  }
}