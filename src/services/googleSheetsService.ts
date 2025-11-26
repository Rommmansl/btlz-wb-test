import { google, sheets_v4, Auth } from 'googleapis';
import { logger } from '../utils/logger.js';
import { BoxTariffRecord } from '../types/tariff.js';

export class GoogleSheetsService {
  private sheets: sheets_v4.Sheets;

  constructor() {
    let key = process.env.GOOGLE_PRIVATE_KEY || ''
    let cleaned = key.replace(/"/g, '');
    cleaned = cleaned.replace(/\\n/g, '\n');
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: cleaned,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    this.sheets = google.sheets({ version: 'v4', auth });
  }

  async updateSheetWithTariffs(sheet_id: string, sheet_name: string, tariffs: BoxTariffRecord[]): Promise<void> {
    try {
      logger.info(`Updating Google Sheet ${sheet_id}, tab ${sheet_name}`);
      const values = this.prepareSheetData(tariffs);
      await this.sheets.spreadsheets.values.clear({
        spreadsheetId: sheet_id,
        range: `${sheet_name}!A2:Z`,
      });
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: sheet_id,
        range: `${sheet_name}!A2`,
        valueInputOption: 'RAW',
        requestBody: {
          values,
        },
      });
      await this.updateHeaders(sheet_id, sheet_name);
      logger.info(`Successfully updated Google Sheet ${sheet_id}`);
    } catch (error) {
      logger.error(`Error updating Google Sheet ${sheet_id}:`, error);
      throw error;
    }
  }

  private prepareSheetData(tariffs: BoxTariffRecord[]): any[][] {
    return tariffs.map(tariff => [
      tariff.tariff_date.toISOString().split('T')[0],
      tariff.createdAt?.toISOString().split('T')[0] || '',
      tariff.warehouseName,
      tariff.geoName,
      tariff.boxStorageLiter,
      tariff.boxStorageCoefExpr,
      tariff.boxStorageBase,
      tariff.boxDeliveryMarketplaceLiter,
      tariff.boxDeliveryMarketplaceCoefExpr,
      tariff.boxDeliveryMarketplaceBase,
      tariff.boxDeliveryLiter,
      tariff.boxDeliveryCoefExpr,
      tariff.boxDeliveryBase
    ]);
  }

  private async updateHeaders(sheetId: string, sheetName: string): Promise<void> {
    const headers = [
      'tariff_date',
      'createdAt',
      'warehouseName',
      'geoName',
      'boxStorageLiter',
      'boxStorageCoefExpr',
      'boxStorageBase',
      'boxDeliveryMarketplaceLiter',
      'boxDeliveryMarketplaceCoefExpr',
      'boxDeliveryMarketplaceBase',
      'boxDeliveryLiter',
      'boxDeliveryCoefExpr',
      'boxDeliveryBase',
    ];

    await this.sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `${sheetName}!A1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [headers],
      },
    });

    await this.sheets.spreadsheets.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: await this.getSheetId(sheetId, sheetName),
                startRowIndex: 0,
                endRowIndex: 1,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.8, green: 0.8, blue: 0.8 },
                  textFormat: { bold: true },
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat)',
            },
          },
        ],
      },
    });
  }

  private async getSheetId(sheetId: string, sheetName: string): Promise<number> {
    const response = await this.sheets.spreadsheets.get({
      spreadsheetId: sheetId,
    });

    const sheet = response.data.sheets?.find(s => 
      s.properties?.title === sheetName
    );

    return sheet?.properties?.sheetId || 0;
  }
}