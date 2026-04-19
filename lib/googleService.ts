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

  async addSheet(spreadsheetId: string, title: string, headers: string[]): Promise<void> {
    await withRateLimit(async () => {
      try {
        await this.sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: [
              {
                addSheet: {
                  properties: { title }
                }
              }
            ]
          }
        });

        // Add headers
        await this.appendRow(spreadsheetId, `${title}!A1:${String.fromCharCode(64 + headers.length)}1`, headers);
      } catch (error: any) {
        // If sheet already exists, we can ignore this error
        if (!error.message?.includes('already exists')) {
          throw error;
        }
      }
    });
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

  /**
   * Physically delete a row from a sheet using sheetId (numeric).
   * sheetId berbeda dari spreadsheetId — sheetId adalah ID tab individual.
   * Untuk mendapatkan sheetId, gunakan getSheetId() helper.
   * rowIndex adalah 0-based index (baris header = 0, data mulai dari 1).
   */
  async deleteRow(spreadsheetId: string, sheetId: number, rowIndex: number): Promise<void> {
    await withRateLimit(async () => {
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{
            deleteDimension: {
              range: {
                sheetId: sheetId,
                dimension: 'ROWS',
                startIndex: rowIndex,
                endIndex: rowIndex + 1,
              }
            }
          }]
        }
      });
    });
  }

  /**
   * Get the numeric sheetId for a tab by its title.
   */
  async getSheetId(spreadsheetId: string, sheetTitle: string): Promise<number> {
    return withRateLimit(async () => {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId,
        fields: 'sheets(properties(sheetId,title))',
      });
      const sheet = response.data.sheets?.find(
        s => s.properties?.title === sheetTitle
      );
      if (!sheet?.properties?.sheetId && sheet?.properties?.sheetId !== 0) {
        throw new Error(`Sheet "${sheetTitle}" not found`);
      }
      return sheet.properties.sheetId;
    });
  }

  /**
   * Batch update multiple ranges and values in a single API call
   */
  async batchUpdateValues(
    spreadsheetId: string, 
    data: { range: string; values: (string | number)[][] }[]
  ): Promise<void> {
    await withRateLimit(async () => {
      await this.sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: {
          valueInputOption: 'USER_ENTERED',
          data: data,
        },
      });
    });
  }
}
