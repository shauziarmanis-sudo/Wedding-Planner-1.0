import { google, sheets_v4, drive_v3 } from 'googleapis';
import { withRateLimit } from './rateLimiter';
import { initialSheetSchema } from './sheetSchema';
import { SHEETS_CONFIG } from '../config/sheets';

export class GoogleSheetsService {
  private sheets: sheets_v4.Sheets;
  private drive: drive_v3.Drive;

  constructor(accessToken: string) {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    this.sheets = google.sheets({ version: 'v4', auth });
    this.drive = google.drive({ version: 'v3', auth });
  }

  async findSpreadsheet(): Promise<string | null> {
    return withRateLimit(async () => {
      const response = await this.drive.files.list({
        q: `name='${SHEETS_CONFIG.dbName}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
        spaces: 'drive',
        fields: 'files(id, name)',
      });

      const files = response.data.files;
      if (files && files.length > 0) {
        return files[0].id || null;
      }
      return null;
    });
  }

  async createSpreadsheet(): Promise<string> {
    return withRateLimit(async () => {
      const response = await this.sheets.spreadsheets.create({
        requestBody: initialSheetSchema as any,
        fields: 'spreadsheetId',
      });

      if (!response.data.spreadsheetId) {
        throw new Error('Failed to create spreadsheet');
      }

      return response.data.spreadsheetId;
    });
  }

  async readRows(spreadsheetId: string, range: string): Promise<any[][] | null> {
    return withRateLimit(async () => {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });

      return response.data.values || null;
    });
  }

  async appendRow(spreadsheetId: string, range: string, values: any[]): Promise<void> {
    return withRateLimit(async () => {
      await this.sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [values],
        },
      });
    });
  }

  async updateRow(spreadsheetId: string, range: string, values: any[]): Promise<void> {
    return withRateLimit(async () => {
      await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [values],
        },
      });
    });
  }
}
