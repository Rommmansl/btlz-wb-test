import knex, { migrate, seed } from "./postgres/knex.js";
import { logger } from './utils/logger.js';

export class Migration {
    async runMigrations(): Promise<void> {
        try {
          logger.info('Running database migrations...');
          await migrate.latest();
          
          logger.info('Running database seeds...');
          await seed.run();
          
          logger.info('All migrations and seeds completed successfully');
          console.log("All migrations and seeds have been run");
        } catch (error) {
          logger.error('Error running migrations:', error);
          console.log("Error running migrations");
          throw error;
        }
      }
}


