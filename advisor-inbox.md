# Advisor Inbox — append-only

## 2026-09-01 | GPT | เรื่อง: นิยามของหน้า What's New

> "Treat What's New as 'what can a human see, try, or discover now?' — not an engineering
> changelog. Engineering changes belong only when they create something externally observable."

- [x] A1: What's New เปลี่ยนนิยามจาก changelog เป็น "อะไรที่คนเข้ามาเห็น/ลอง/ค้นพบได้ตอนนี้" (P1) → resolved: doctrine block ที่หัว `content/whats-new.ts` เขียนใหม่ ประโยคนำคือ "WHAT CAN A HUMAN SEE, TRY, OR DISCOVER NOW?" (2026-09-01)
- [x] A2: engineering change ขึ้นหน้านี้ได้ต่อเมื่อมันสร้างสิ่งที่สังเกตได้จากภายนอก (P1) → resolved: doctrine ระบุตรงๆ ว่า engineering change ขึ้นได้เมื่อสร้างของที่สังเกตได้จากภายนอก พร้อมตัวอย่าง `LME_HIDE_CLIENT_TOOLS` ที่ไม่ผ่าน → known-issues (2026-09-01)
- [x] A3: ผลที่ตามมา — LEDE + comment doctrine ที่หัว `content/whats-new.ts` ต้องแก้ตาม ไม่งั้นไฟล์
      จะสั่งอย่าง หน้าเว็บเป็นอีกอย่าง (P1, สืบเนื่องจาก A1) → resolved: LEDE + doctrine เขียนใหม่ทั้งบล็อก, `app/whats-new/page.tsx` metadata ตามไปด้วย (2026-09-01)
- [x] A4: ผลที่ตามมา — schema ต้องมีที่ให้ "ไปลองตรงไหน สังเกตอะไร" ปัจจุบัน `blurb` ถูกบังคับให้เป็น
      หนึ่งประโยค และ `href` มีได้เฉพาะเมื่อมีหน้าเขียนยาวจริง (P2, สืบเนื่องจาก A1) → resolved: ฟิลด์ `tryIt?: { href, label, notice }` + บล็อก "Go and look:" ในหน้า index + `.feed__try` (2026-09-01)
- [ ] A5: เคสทดสอบนิยามใหม่ทันที — WINK front desk (สังเกตได้ 100%, ไม่มี merge ในสองรีโปนี้เลย)
      เข้าได้ภายใต้นิยามใหม่ / เข้าไม่ได้ภายใต้นิยามเดิม (opinion)

## 2026-09-01 | GPT (รอบสอง, ชี้แจง scope) | เรื่อง: repo ไม่ใช่ขอบของจักรวาล

> "What's New ไม่ควรมี repo เป็น universe boundary ไม่งั้นสิ่งใหม่ที่เกิดใน WINK, WebMCP,
> external agent, production world จะหายหมด เพียงเพราะมันไม่ได้เกิดเป็น commit ใน repo
> ที่ Claude เปิดอยู่"

- [x] A6: `merged` ตาม doctrine เดิมนิยามตัวเองว่า "a fact about this repository and nothing else"
      → ตัวฟิลด์นั่นแหละคือขอบจักรวาล ต้องทำให้ optional (P1, ยืนยัน A1) → resolved: `merged` เป็น optional, วันที่ที่แสดงทุกที่เปลี่ยนเป็น `verified` (index + ticker), `verified`/`verifiedBy` ยัง required (2026-09-01)
- [x] A7: ขอบเขตของหน้านี้ = สิ่งที่มนุษย์ไปถึงได้ ไม่ใช่สิ่งที่รีโปนี้มี — production world และ
      ระบบของบุคคลที่สามที่ต่อกับ Living Memory นับ (P1) → resolved: LEDE ปิดท้ายว่าของในโค้ดกับของนอกโค้ดไม่ถูกจัดลำดับต่างกัน เพราะคนอ่านแยกไม่ออกจากจุดที่ยืน (2026-09-01)
