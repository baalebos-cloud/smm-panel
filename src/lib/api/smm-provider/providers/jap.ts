import { BaseAPIProvider } from "../base-provider";

const JAP_API_URL = "https://justanotherpanel.com/api/v2";

export class JAPProvider extends BaseAPIProvider {
  constructor(apiKey: string) {
    super("JustAnotherPanel", JAP_API_URL, apiKey);
  }
}

export const createJAPProvider = (): JAPProvider => {
  const apiKey = process.env.JAP_API_KEY;
  
  if (!apiKey) {
    throw new Error("JAP_API_KEY not configured");
  }

  return new JAPProvider(apiKey);
};
