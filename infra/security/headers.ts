export const securityHeaders = {
    // Enforces HTTPS
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',

    // mitigates ClickJacking credentials
    'X-Frame-Options': 'DENY',

    // block MIME type sniffing
    'X-Content-Type-Options': 'nosniff',

    // Control information leakage
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // CSP (Content Security Policy) - HIGHLY RESTRICTIVE
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://vercel.live https://*.supabase.co; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https://*.supabase.co; connect-src 'self' https://*.supabase.co https://*.sentry.io;",

    // Permissions Policy
    'Permissions-Policy': "camera=(), microphone=(), geolocation=()"
};
