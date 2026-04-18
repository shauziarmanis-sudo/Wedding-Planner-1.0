import { SHEETS_CONFIG } from '../config/sheets';
import { SheetSchema } from '../types/sheets';

export const initialSheetSchema: SheetSchema = {
  properties: {
    title: SHEETS_CONFIG.dbName,
  },
  sheets: [
    {
      properties: { title: SHEETS_CONFIG.tabs.metadata },
      data: [{
        rowData: [
          {
            values: [
              { userEnteredValue: { stringValue: 'UserId' } },
              { userEnteredValue: { stringValue: 'Email' } },
              { userEnteredValue: { stringValue: 'Name' } },
              { userEnteredValue: { stringValue: 'Status' } },
              { userEnteredValue: { stringValue: 'CreatedAt' } },
              { userEnteredValue: { stringValue: 'UpdatedAt' } },
            ]
          }
        ]
      }]
    },
    {
      properties: { title: SHEETS_CONFIG.tabs.guests },
      data: [{
        rowData: [
          {
            values: [
              { userEnteredValue: { stringValue: 'ID' } },
              { userEnteredValue: { stringValue: 'Name' } },
              { userEnteredValue: { stringValue: 'Category' } },
              { userEnteredValue: { stringValue: 'Pax' } },
              { userEnteredValue: { stringValue: 'Status' } },
              { userEnteredValue: { stringValue: 'Slug' } },
              { userEnteredValue: { stringValue: 'CreatedAt' } },
            ]
          }
        ]
      }]
    },
    {
      properties: { title: SHEETS_CONFIG.tabs.vendors },
      data: [{
        rowData: [
          {
            values: [
              { userEnteredValue: { stringValue: 'ID' } },
              { userEnteredValue: { stringValue: 'Category' } },
              { userEnteredValue: { stringValue: 'Name' } },
              { userEnteredValue: { stringValue: 'TotalCost' } },
              { userEnteredValue: { stringValue: 'PaidAmount' } },
              { userEnteredValue: { stringValue: 'Status' } },
              { userEnteredValue: { stringValue: 'DueDate' } },
              { userEnteredValue: { stringValue: 'Notes' } },
            ]
          }
        ]
      }]
    },
    {
      properties: { title: SHEETS_CONFIG.tabs.gifts },
    },
    {
      properties: { title: SHEETS_CONFIG.tabs.transactions },
    },
    {
      properties: { title: SHEETS_CONFIG.tabs.savings },
    }
  ]
};
