export interface WBBoxTariff {
    warehouseName: string;
    geoName: string;
    boxStorageLiter: string;
    boxStorageCoefExpr: string;
    boxStorageBase: string;
    boxDeliveryMarketplaceLiter: string;
    boxDeliveryMarketplaceCoefExpr: string;
    boxDeliveryMarketplaceBase: string;
    boxDeliveryLiter: string;
    boxDeliveryCoefExpr: string;
    boxDeliveryBase: string;
    tariff_date: Date
  }

  export interface WBBoxTariffResponse {
    data: WBBoxTariff[];
    timestamp: number;
  }
  
  export interface BoxTariffRecord {
    id?: number;
    warehouseName: string;
    geoName: string;
    boxStorageLiter: string;
    boxStorageCoefExpr: string;
    boxStorageBase: string;
    boxDeliveryMarketplaceLiter: string;
    boxDeliveryMarketplaceCoefExpr: string;
    boxDeliveryMarketplaceBase: string;
    boxDeliveryLiter: string;
    boxDeliveryCoefExpr: string;
    boxDeliveryBase: string;
    tariff_date: Date;
    createdAt?: Date;
  }
  
  export interface GoogleSheetConfig {
    id?: number;
    sheet_id: string;
    sheet_name: string;
    is_active: boolean;
    last_updated?: Date;
    created_at?: Date;
  }