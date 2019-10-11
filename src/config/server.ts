import { name, version } from "../../package.json";

export const PORT: number = Number(process.env.PORT) || 8080;
export const NAME: string = process.env.SERVER_NAME || name;
export const VERSION: string = version;
