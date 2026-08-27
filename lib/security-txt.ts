// security-txt.ts — RFC 9116 vulnerability-disclosure contact (served at
// /.well-known/security.txt). Same doctrine as llms.txt: a plain-text surface
// with one job, served by the worker before the app router is consulted.
//
// Expires is a hard requirement of the RFC and must be kept in the future —
// a stale date reads as an unmaintained security contact. Bump it when it
// comes within sight, the same way a certificate is renewed.

export const SECURITY_TXT = `# Security contact for viibe.to and its services
# (Living Memory — lme.viibe.to — and this site).

Contact: mailto:support@viibe.to
Expires: 2027-08-24T00:00:00.000Z
Canonical: https://viibe.to/.well-known/security.txt
Preferred-Languages: en, th
`;
