export interface UserMetadata {
  userId: string;
  email: string;
  name: string;
  spreadsheetId: string | null;
  status: 'WEDDING' | 'MARRIED';
  createdAt: string;
  updatedAt: string;
}
