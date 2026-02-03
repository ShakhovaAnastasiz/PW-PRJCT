import { config as dotenvConfig } from "dotenv";
import { join } from "path";

dotenvConfig({ path: join(process.cwd(), ".env") });

export const API_BASE: string =
  process.env.API_BASE ?? "https://api.practicesoftwaretesting.com";
export const WEB_BASE: string =
  process.env.WEB_BASE ?? "https://practicesoftwaretesting.com";
export const USER_EMAIL: string =
  process.env.USER_EMAIL ?? "customer@practicesoftwaretesting.com";
export const USER_PASSWORD: string = process.env.USER_PASSWORD!;
export const USER_NAME: string = process.env.USER_NAME ?? "Jane Doe";
