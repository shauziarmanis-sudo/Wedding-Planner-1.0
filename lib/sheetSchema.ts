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
      properties: { title: SHEETS_CONFIG.tabs.budget },
      data: [{
        rowData: [
          {
            values: [
              { userEnteredValue: { stringValue: 'vendor_id' } },
              { userEnteredValue: { stringValue: 'category' } },
              { userEnteredValue: { stringValue: 'vendor_name' } },
              { userEnteredValue: { stringValue: 'contact_name' } },
              { userEnteredValue: { stringValue: 'phone_wa' } },
              { userEnteredValue: { stringValue: 'instagram' } },
              { userEnteredValue: { stringValue: 'estimated_cost' } },
              { userEnteredValue: { stringValue: 'actual_cost' } },
              { userEnteredValue: { stringValue: 'dp_amount' } },
              { userEnteredValue: { stringValue: 'dp_date' } },
              { userEnteredValue: { stringValue: 'paid_amount' } },
              { userEnteredValue: { stringValue: 'status' } },
              { userEnteredValue: { stringValue: 'payment_notes' } },
              { userEnteredValue: { stringValue: 'contract_signed' } },
              { userEnteredValue: { stringValue: 'contract_date' } },
              { userEnteredValue: { stringValue: 'vendor_rating' } },
              { userEnteredValue: { stringValue: 'notes' } },
              { userEnteredValue: { stringValue: 'created_at' } },
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
    },
    {
      properties: { title: SHEETS_CONFIG.tabs.checklist },
      data: [{
        rowData: [
          {
            values: [
              { userEnteredValue: { stringValue: 'task_id' } },
              { userEnteredValue: { stringValue: 'phase_label' } },
              { userEnteredValue: { stringValue: 'days_before' } },
              { userEnteredValue: { stringValue: 'category' } },
              { userEnteredValue: { stringValue: 'title' } },
              { userEnteredValue: { stringValue: 'description' } },
              { userEnteredValue: { stringValue: 'adat_tags' } },
              { userEnteredValue: { stringValue: 'is_required' } },
              { userEnteredValue: { stringValue: 'is_custom' } },
              { userEnteredValue: { stringValue: 'status' } },
              { userEnteredValue: { stringValue: 'completed_at' } },
              { userEnteredValue: { stringValue: 'assignee' } },
              { userEnteredValue: { stringValue: 'notes' } },
              { userEnteredValue: { stringValue: 'added_by_adat_switch' } },
            ]
          }
        ]
      }]
    },
    {
      properties: { title: SHEETS_CONFIG.tabs.documents },
      data: [{
        rowData: [
          {
            values: [
              { userEnteredValue: { stringValue: 'doc_id' } },
              { userEnteredValue: { stringValue: 'religion' } },
              { userEnteredValue: { stringValue: 'party' } },
              { userEnteredValue: { stringValue: 'category' } },
              { userEnteredValue: { stringValue: 'doc_name' } },
              { userEnteredValue: { stringValue: 'is_required' } },
              { userEnteredValue: { stringValue: 'status' } },
              { userEnteredValue: { stringValue: 'note' } },
              { userEnteredValue: { stringValue: 'created_at' } },
              { userEnteredValue: { stringValue: 'updated_at' } },
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
              { userEnteredValue: { stringValue: 'guest_id' } },
              { userEnteredValue: { stringValue: 'name' } },
              { userEnteredValue: { stringValue: 'category' } },
              { userEnteredValue: { stringValue: 'phone_wa' } },
              { userEnteredValue: { stringValue: 'address' } },
              { userEnteredValue: { stringValue: 'pax_estimate' } },
              { userEnteredValue: { stringValue: 'rsvp_status' } },
              { userEnteredValue: { stringValue: 'actual_pax' } },
              { userEnteredValue: { stringValue: 'gift_amount' } },
              { userEnteredValue: { stringValue: 'gift_type' } },
              { userEnteredValue: { stringValue: 'rsvp_at' } },
              { userEnteredValue: { stringValue: 'table_number' } },
              { userEnteredValue: { stringValue: 'seat_notes' } },
              { userEnteredValue: { stringValue: 'invitation_sent' } },
              { userEnteredValue: { stringValue: 'invitation_sent_at' } },
              { userEnteredValue: { stringValue: 'notes' } },
              { userEnteredValue: { stringValue: 'created_at' } },
            ]
          }
        ]
      }]
    }
  ]
};
