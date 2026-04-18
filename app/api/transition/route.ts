import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { GoogleSheetsService } from '@/lib/googleService';
import { SHEETS_CONFIG } from '@/config/sheets';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.accessToken || !session.spreadsheetId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const service = new GoogleSheetsService(session.accessToken as string);
    const spreadsheetId = session.spreadsheetId as string;

    // 1. Audit Gifts (Income)
    const giftsData = await service.readRows(spreadsheetId, SHEETS_CONFIG.ranges.gifts);
    let totalGifts = 0;
    if (giftsData && giftsData.length > 0) {
      // Assuming structure: [ID, GuestName, Amount, Notes, Date]
      totalGifts = giftsData.reduce((sum, row) => sum + (parseFloat(row[2]) || 0), 0);
    }

    // 2. Audit Vendors (Expenses)
    const vendorsData = await service.readRows(spreadsheetId, SHEETS_CONFIG.ranges.vendors);
    let totalUnpaid = 0;
    if (vendorsData && vendorsData.length > 0) {
      // Assuming structure: [ID, Category, Name, TotalCost, PaidAmount, Status, DueDate, Notes]
      totalUnpaid = vendorsData.reduce((sum, row) => {
        const totalCost = parseFloat(row[3]) || 0;
        const paidAmount = parseFloat(row[4]) || 0;
        return sum + (totalCost - paidAmount);
      }, 0);
    }

    // 3. Calculate Net Balance
    const initialBalance = totalGifts - totalUnpaid;

    // 4. Update Metadata Status to MARRIED
    // Note: In a real app, you'd find the exact row, but here we assume row 2 for the single user metadata
    const now = new Date().toISOString();
    await service.updateRow(spreadsheetId, 'Metadata!D2:F2', [
      'MARRIED',
      now, // Just updating a dummy field or keep original created at
      now  // Updated at
    ]);

    // 5. Create Initial Transaction in Finance Sheet
    const txId = `tx-${Date.now()}`;
    await service.appendRow(spreadsheetId, SHEETS_CONFIG.ranges.transactions, [
      txId,
      now,
      initialBalance,
      'Initial Balance (Wedding)',
      initialBalance >= 0 ? 'INCOME' : 'EXPENSE',
      `Auto-calculated during transition. Gifts: ${totalGifts}, Unpaid: ${totalUnpaid}`
    ]);

    return NextResponse.json({ 
      success: true, 
      message: 'Transitioned to Married Mode',
      details: { totalGifts, totalUnpaid, initialBalance }
    });

  } catch (error: any) {
    console.error('Transition error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
