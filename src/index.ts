// index.ts
import dotenv from 'dotenv';
dotenv.config(); // Добавьте это в самом начале

import { SchedulerService } from './services/schedulerService.js';
import { logger } from './utils/logger.js';
import { Migration } from './app.js'

class Application {
  private schedulerService: SchedulerService;
  constructor() {
    this.schedulerService = new SchedulerService();
  }

  async start(): Promise<void> {
    try {
      logger.info('Starting WB Box Tariffs Service...');

      await this.schedulerService.initialize();

      this.schedulerService.start();

      logger.info('WB Box Tariffs Service started successfully');

      process.on('SIGINT', this.shutdown.bind(this));
      process.on('SIGTERM', this.shutdown.bind(this));

    } catch (error) {
      logger.error('Failed to start application:', error);
      process.exit(1);
    }
  }

  private async shutdown(): Promise<void> {
    logger.info('Shutting down WB Box Tariffs Service...');
    process.exit(0);
  }
}

const migration = new Migration()
const app = new Application();
// Запуск приложения
await migration.runMigrations().then(() => {
  app.start().catch(error => {
    logger.error('Unhandled error during application startup:', error);
    process.exit(1);
  });
})
