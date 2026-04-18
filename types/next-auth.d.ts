import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Menambahkan custom properties ke Session object
   */
  interface Session {
    accessToken?: string;
    spreadsheetId?: string;
    user: {
      id?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  /**
   * Menambahkan custom properties ke JWT token
   */
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    spreadsheetId?: string;
  }
}
