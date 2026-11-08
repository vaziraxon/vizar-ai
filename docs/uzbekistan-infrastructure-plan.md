# Document checker — in-country infrastructure plan

> **Status: planned, NOT connected.** No server in Uzbekistan exists yet. Real
> document upload is closed in production (`documentUploadsEnabled()` always
> returns `false` there, and the storage/database insert policies are dropped —
> see `supabase/document_upload_lock.sql`). The only working checker today is
> the admin-only synthetic bench at `/sinov/document-checker`, which never runs
> on the production site and never sends or stores anything.

## Goal

Check visa documents (passport page, bank statement, employment letter,
insurance) **inside Uzbekistan**, on infrastructure we control, without
sending files to any foreign AI, analytics, telemetry or log service.

What the checker may say:

- which required fields were read and which are missing;
- whether the passport stays valid long enough after the trip (3 months
  Schengen, 6 months for most others);
- whether the file is readable (type PDF/JPG/PNG, size, resolution);
- whether the document is on the application's list and what the visa book
  says about it.

What it must never say: that a document is genuine or forged, or that a visa
will (or will not) be issued.

## Code that already exists

`src/lib/document-check/checker.ts` — the modular core:

```
reader (adapter) → extracted fields + file facts → rules → findings
```

- `syntheticReader` — works now, only on made-up samples
  (`src/lib/document-check/synthetic.ts`, all `TEST…` names and numbers).
- `qwenLocalReader`, `paddleOcrLocalReader` — placeholders with
  `connected: false` that throw "mahalliy server hali ulanmagan". The UI shows
  them as "Ulanmagan". They must stay that way until the server below is live.
- `checkDocument()` — the rules, covered by
  `scripts/dashboard/document-checker.test.mjs`.

Connecting the real service means replacing a placeholder's `read()` with a
call to the internal API below. The rules don't change.

## Target architecture

```
Browser ──TLS──▶ vizarai.com (Vercel, metadata only)
   │
   └──TLS (direct upload, short-lived signed URL)──▶ UZ gateway
                                                     │ mTLS, private network
                                    ┌────────────────┼────────────────┐
                                    ▼                ▼                ▼
                             Object storage     OCR worker       Vision worker
                             (encrypted)        (PaddleOCR)      (Qwen-VL, local GPU)
                                    │                │                │
                                    └──── checker API (rules) ◀───────┘
                                                     │
                                              findings only (no image,
                                              no passport number) ──▶ Supabase
```

### 1. Local private storage
- S3-compatible object storage (e.g. MinIO) on servers physically in
  Uzbekistan, in a licensed data centre.
- Private bucket only; no public URLs. Uploads go straight from the browser to
  the gateway with a signed URL valid for minutes; files never pass through
  Vercel or Supabase.
- One object per document, keyed by random id — never by name or passport
  number.

### 2. Qwen (local vision model)
- Open-weights Qwen vision-language model, self-hosted on our own GPU server.
  No calls to any hosted model API.
- Used only to locate fields and read layout; prompts ask for field values,
  never for an authenticity judgement.
- No internet egress from the model host (firewall: deny all outbound).

### 3. PaddleOCR
- Self-hosted PaddleOCR for text and the passport MRZ lines.
- MRZ check digits give a reliable cross-check of number, birth date and
  expiry read by Qwen; disagreements become "o'qilmadi" (not read), never a
  guess.

### 4. Secure API
- One internal checker API; the workers are reachable only from it, over mTLS
  on a private network.
- The public gateway accepts only: signed upload, "run check", "get findings",
  "delete". Rate-limited per user.
- Findings returned to the website contain levels and Uzbek messages only —
  no images, no extracted passport number or JShShIR.

### 5. Encryption
- In transit: TLS 1.2+ at the edge, mTLS inside.
- At rest: disk encryption plus per-object envelope encryption (a data key per
  document, wrapped by a master key kept in a local KMS/HSM, not in code or
  env files on the app servers).

### 6. Access control
- Role-based: `user` (own documents only), `reviewer` (assigned cases, read
  only), `admin` (operations, no bulk export).
- MFA for every staff account; access over VPN only; no shared accounts.
- Production users' documents are never copied to test or staging servers.
  Test and staging use synthetic samples only.

### 7. Audit log
- Append-only log of who did what and when: upload, check run, view,
  download, delete, role change.
- The log records ids and actions, never document content or extracted
  personal fields.
- Kept in Uzbekistan; reviewed monthly; tamper-evident (hash chain or WORM
  storage).

### 8. Backups
- Encrypted backups to a second site in Uzbekistan.
- Short retention matching the deletion policy below; no backups abroad.
- Restore drill every quarter, with the result written down.

### 9. Deletion
- The user can delete a document at any time; deletion removes the object and
  destroys its data key (crypto-shredding), so copies in backups become
  unreadable.
- Automatic deletion after a fixed period (proposal: 30 days after the
  application closes).
- Account deletion deletes every document and finding.

## Phases

| Phase | What | Exit condition |
|---|---|---|
| 0 (now) | Upload closed, readiness test (no files), synthetic bench | Done |
| 1 | Legal review; choose a data centre in Uzbekistan | Written legal opinion; contract signed |
| 2 | Storage + gateway + audit log, no AI | Pen test passed; deletion and restore drills pass |
| 3 | PaddleOCR + MRZ, then Qwen, on synthetic documents only | Accuracy measured on synthetic set |
| 4 | Closed beta with consenting users; `DOCUMENT_UPLOAD_ENABLED` opened only for them | Incident-free beta; user approval |
| 5 | General availability | Explicit go-ahead from the owner |

Until phase 4, the site keeps showing the "sinov bosqichida" notice and the
readers stay "Ulanmagan".

## Legal notes (to confirm with a lawyer)

- The personal-data law's localisation rule was eased by the 2026 amendments,
  so the current metadata in Japan (Supabase, Vercel `hnd1`) is not the
  blocker. Document scans are the sensitive part, which is why they are planned
  in-country from the start.
- Open question: whether passport scans (with the face photo) count as
  biometric data, which would bring stricter consent and storage rules.
- The privacy policy and consent text must be updated before phase 4.
