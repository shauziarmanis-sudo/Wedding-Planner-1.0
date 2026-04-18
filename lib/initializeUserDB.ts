import { GoogleSheetsService } from './googleService';
import { SHEETS_CONFIG } from '../config/sheets';

export async function initializeUserDatabase(accessToken: string, email: string, name: string): Promise<string> {
  const service = new GoogleSheetsService(accessToken);

  // 1. Check if DB exists
  let spreadsheetId = await service.findSpreadsheet();

  // 2. If not exists, create it
  if (!spreadsheetId) {
    spreadsheetId = await service.createSpreadsheet();

    // 3. Initialize Metadata
    const now = new Date().toISOString();
    await service.appendRow(spreadsheetId, SHEETS_CONFIG.ranges.metadata, [
      email, // using email as userId for now
      email,
      name,
      'WEDDING', // Initial status
      now,
      now
    ]);
  }

  return spreadsheetId;
}
