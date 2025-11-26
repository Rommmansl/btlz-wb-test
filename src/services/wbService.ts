import axios from "axios";
import { logger } from '../utils/logger.js';
import { WBBoxTariff } from '../types/tariff.js';

export class WBService {
  private apiClient;

  constructor() {
    this.apiClient = axios.create({
      baseURL: 'https://common-api.wildberries.ru/api/v1',
      headers: {
        'Authorization': `Bearer ${process.env.WB_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  async getBoxTariffs(): Promise<WBBoxTariff[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      console.log(`Fetching tariffs for date: ${today}`);
      
      const response = await this.apiClient.get('/tariffs/box', {
        params: { date: today }
      });

      const responseData = response?.data;
      
      if (!responseData) {
        console.log('Empty response from API');
        return [];
      }

      if (Array.isArray(responseData)) {
        console.log(`Found ${responseData.length} tariffs`);
        return responseData;
      }

      const possibleArrays = ['data', 'tariffs', 'result', 'items', 'list'];
      for (const key of possibleArrays) {
        if (Array.isArray(responseData[key])) {
          console.log(`Found ${responseData[key].length} tariffs in key: ${key}`);
          return responseData[key];
        }
      }

      console.log('No array found in response');
      return responseData.response.data.warehouseList;

    } catch (error: any) {
      console.error('API call failed:');
      console.error('Message:', error.message);
      
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
      }
      
      logger.error('Error fetching box tariffs:', error.message);
      return [];
    }
  }

  transformTariffData(tariffs: WBBoxTariff[], tariffDate: Date): any[] {
    return tariffs.map(tariff => ({
      tariff_date: tariffDate,
      created_at: new Date(),
      warehouseName: tariff.warehouseName,
      geoName: tariff.geoName,
      boxStorageLiter: tariff.boxStorageLiter === '-' ? null : parseFloat(tariff.boxStorageLiter.replace(',', '.')),
      boxStorageCoefExpr: tariff.boxStorageCoefExpr === '-' ? null : parseFloat(tariff.boxStorageCoefExpr.replace(',', '.')),
      boxStorageBase: tariff.boxStorageBase === '-' ? null : parseFloat(tariff.boxStorageBase.replace(',', '.')),
      boxDeliveryMarketplaceLiter: tariff.boxDeliveryMarketplaceLiter === '-' ? null : parseFloat(tariff.boxDeliveryMarketplaceLiter.replace(',', '.')),
      boxDeliveryMarketplaceCoefExpr: tariff.boxDeliveryMarketplaceCoefExpr === '-' ? null : parseFloat(tariff.boxDeliveryMarketplaceCoefExpr.replace(',', '.')),
      boxDeliveryMarketplaceBase: tariff.boxDeliveryMarketplaceBase === '-' ? null : parseFloat(tariff.boxDeliveryMarketplaceBase.replace(',', '.')),
      boxDeliveryLiter: tariff.boxDeliveryLiter === '-' ? null : parseFloat(tariff.boxDeliveryLiter.replace(',', '.')),
      boxDeliveryCoefExpr: tariff.boxDeliveryCoefExpr === '-' ? null : parseFloat(tariff.boxDeliveryCoefExpr.replace(',', '.')),
      boxDeliveryBase: tariff.boxDeliveryBase === '-' ? null : parseFloat(tariff.boxDeliveryBase.replace(',', '.'))
    }));
  }
}

