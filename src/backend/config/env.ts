export const ENV = {
  PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID || '',
  PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET || '',
  PAYPAL_ENVIRONMENT: (process.env.PAYPAL_ENVIRONMENT || 'SANDBOX').toUpperCase() as 'SANDBOX' | 'PRODUCTION',
  
  // Channel3 Live Commerce API for Proof-of-Work Artifacts
  CHANNEL3_API_KEY: process.env.CHANNEL3_API_KEY || '',

  // AI Keys (Optional)
  GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY || '',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  
  // Trust Router Due Diligence Settings
  MIN_TRUST_SCORE_THRESHOLD: parseFloat(process.env.MIN_TRUST_SCORE_THRESHOLD || process.env.TRUST_THRESHOLD || '75'),
  BUYER_AGENT_ID: process.env.BUYER_AGENT_ID || process.env.DEFAULT_BUYER_AGENT_ID || 'agent://treasury-prime.eth',
  COMPANY_EMAIL: process.env.COMPANY_EMAIL || 'sb-gv7wr53521203@business.example.com',
  BUYER_SANDBOX_EMAIL: process.env.BUYER_SANDBOX_EMAIL || 'sb-yup9z53548171@personal.example.com'
};

export function hasPayPalCredentials(): boolean {
  return Boolean(ENV.PAYPAL_CLIENT_ID && ENV.PAYPAL_CLIENT_SECRET);
}

export function hasChannel3ApiKey(): boolean {
  return Boolean(ENV.CHANNEL3_API_KEY);
}

export function hasAiCredentials(): boolean {
  return Boolean(ENV.GOOGLE_GENERATIVE_AI_API_KEY || ENV.OPENAI_API_KEY);
}
