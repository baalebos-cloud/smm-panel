import { BaseAPIProvider } from "../base-provider";

const PEAKERR_API_URL = "https://peakerr.com/api/v2";

export class PeakerrProvider extends BaseAPIProvider {
  constructor(apiKey: string) {
    super("Peakerr", PEAKERR_API_URL, apiKey);
  }
}

export const createPeakerrProvider = (): PeakerrProvider => {
  const apiKey = process.env.PEAKERR_API_KEY;
  
  if (!apiKey) {
    throw new Error("PEAKERR_API_KEY not configured");
  }

  return new PeakerrProvider(apiKey);
};
