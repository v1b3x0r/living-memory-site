# Frontend AgentID dependency security follow-up

The failing dependency-advisories job on PR #15 (run 38016865040, job 114108960987) ran `npm audit --omit=dev` and reported three affected package entries: DOMPurify, fast-uri, and ajv (inherited fast-uri advisory).

| Entry | Dependency chain | Minimal compatible fix |
| --- | --- | --- |
| `node_modules/dompurify` | `posthog-js@1.425.1` → `dompurify@3.4.13` (`^3.4.13`) | Lock DOMPurify 3.4.16 within the existing parent range. |
| `node_modules/fast-uri` | `react-server-dom-webpack@19.2.8` → `webpack@5.106.2` → `schema-utils@4.3.3` → `ajv@8.20.0` → `fast-uri@3.1.7` | Update the existing fast-uri override to patched 3.1.8 and its lock entry. |
| `node_modules/{schema-utils,ajv-formats}/node_modules/ajv` | schema-utils → ajv directly and through `ajv-formats@2.1.1`; both AJV 8.20.0 entries depend on `fast-uri:^3.0.1` | The same fast-uri patch fixes both AJV paths; no AJV major upgrade. ESLint's separate AJV 6 branch is unaffected by this advisory. |

Advisories: [DOMPurify hook removal](https://github.com/advisories/GHSA-p98j-92pf-mc4p), [DOMPurify rawtext root](https://github.com/advisories/GHSA-6688-9rhm-gjv2), [fast-uri host normalization](https://github.com/advisories/GHSA-hrr3-gc8f-f4qj). Published registry integrity values match both patched lock entries. No broad lockfile refresh, audit exception, suppression or CI change.

Validation from `npm ci` using the revised lockfile: production audit reports zero vulnerabilities; full `npm test` passed (49 unit tests, 31 rendered tests, project boundary, typecheck, production build, presentation policy and production audit). Production build used AgentID disabled, TEST mode disabled and no loopback proof endpoint configuration.

`npm run lint` was also executed: it reports 13 errors and 5 warnings in source already present before this dependency patch (React effect-state rules and explicit-any test types). It is not part of the existing CI workflow. This patch does not suppress rules or claim lint passed. Lint cleanup remains separate from the three dependency advisories.

Production is not deployed. No LIVE configuration, credentials or billing changed.
