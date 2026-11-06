export const ENV = {
  PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID || '',
  PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET || '',
  PAYPAL_ENVIRONMENT: (process.env.PAYPAL_ENVIRONMENT || 'SANDBOX').toUpperCase() as 'SANDBOX' | 'PRODUCTION',
  
  // AI Keys (Optional - fallback to intelligent mock agent if not provided)
  GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY || '',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  
  // Spending Guardrails
  AUTO_APPROVE_THRESHOLD: parseFloat(process.env.AUTO_APPROVE_THRESHOLD || '350.00'),
  COMPANY_NAME: process.env.COMPANY_NAME || 'Acme Tech Labs Inc.',
  COMPANY_EMAIL: process.env.COMPANY_EMAIL || 'procurement@acmelabs.com'
};

export function hasPayPalCredentials(): boolean {
  return Boolean(ENV.PAYPAL_CLIENT_ID && ENV.PAYPAL_CLIENT_SECRET);
}

export function hasAiCredentials(): boolean {
  return Boolean(ENV.GOOGLE_GENERATIVE_AI_API_KEY || ENV.OPENAI_API_KEY);
}
