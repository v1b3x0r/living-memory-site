# The share card

`og-card.html` is the source of `public/og.jpg` — the single 1200×630 image every
page shares. It is checked in so the card can be regenerated rather than redrawn,
and so every string on it can be traced.

Regenerate:

```bash
cp ../../public/brand/lme-whale.webp whale.webp   # the card uses the real hero art
python3 -m http.server 8791                        # from this directory
# screenshot the page at exactly 1200×630, save as public/og.jpg
```

Rules this card has to keep, learned the expensive way:

- **Every claim on it must be true and checkable.** A card is read by more people
  than the page. A previous version advertised "Recall with Codex" — a client we
  have never tested — and a proposed replacement carried a GitHub URL that 404s,
  a licence we do not use, and `lme.viibe.to` as a link for humans (it answers
  404 JSON; it is the MCP host, not a web page).
- **One image for the whole site.** No per-page cards: there is nobody to
  maintain them.
- **Only the locked vocabulary.** room and world. Not "cloud", not "trial".
- **No client logos or names** unless that client has actually been tested.
