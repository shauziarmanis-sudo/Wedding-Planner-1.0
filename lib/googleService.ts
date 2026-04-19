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

  // ── Drive Operations ──

  async findSpreadsheet(): Promise<string | null> {
    return withRateLimit(async () => {
      const response = await this.drive.files.list({
        q: `name='${SHEETS_CONFIG.dbName}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
        spaces: 'drive',
        fields: 'files(id, name)',
      });
      const files = response.data.files;
      return files && files.length > 0 ? files[0].id || null : null;
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

  async addSheetWithHeaders(spreadsheetId: string, title: string, headers: string[]): Promise<void> {
    await withRateLimit(async () => {
      try {
        // 1. Add the sheet
        await this.sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: [
              {
                addSheet: {
                  properties: { title },
                },
              },
            ],
          },
        });
        
        // 2. Add headers
        await this.sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `${title}!A1`,
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: [headers] },
        });
      } catch (error: any) {
        // Ignore if sheet already exists
        if (!error?.message?.includes("already exists")) {
          throw error;
        }
      }
    });
  }

  // ── Sheet CRUD ──

  async readRows(spreadsheetId: string, range: string): Promise<string[][] | null> {
    return withRateLimit(async () => {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });
      return (response.data.values as string[][]) || null;
    });
  }

  async appendRow(spreadsheetId: string, range: string, values: (string | number)[]): Promise<void> {
    await withRateLimit(async () => {
      await this.sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [values] },
      });
    });
  }

  async appendRows(spreadsheetId: string, range: string, rows: (string | number)[][]): Promise<void> {
    await withRateLimit(async () => {
      await this.sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: rows },
      });
    });
  }

  async updateRow(spreadsheetId: string, range: string, values: (string | number)[]): Promise<void> {
    await withRateLimit(async () => {
      await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [values] },
      });
    });
  }

  async updateRows(spreadsheetId: string, range: string, rows: (string | number)[][]): Promise<void> {
    await withRateLimit(async () => {
      await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: rows },
      });
    });
  }

  async clearRange(spreadsheetId: string, range: string): Promise<void> {
    await withRateLimit(async () => {
      await this.sheets.spreadsheets.values.clear({
        spreadsheetId,
        range,
      });
    });
  }

  async clearRow(spreadsheetId: string, range: string): Promise<void> {
    return this.clearRange(spreadsheetId, range);
  }

  /**
   * Find a row by matching a value in a specific column.
   * Returns the 1-based row index (sheet row number) or null.
   */
  async findRowIndex(
    spreadsheetId: string,
    sheetRange: string,
    columnIndex: number,
    searchValue: string
  ): Promise<number | null> {
    const rows = await this.readRows(spreadsheetId, sheetRange);
    if (!rows) return null;
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][columnIndex] === searchValue) {
        return i + 2; // +2 because row 1 is header, data starts at row 2, and i is 0-indexed
      }
    }
    return null;
  }
}
