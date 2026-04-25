import { MastraClient } from "@mastra/client-js";

const MASTRA_URL = process.env.MASTRA_URL ?? "http://localhost:4111";

export const mastraClient = new MastraClient({ baseUrl: MASTRA_URL });

export { MASTRA_URL };
