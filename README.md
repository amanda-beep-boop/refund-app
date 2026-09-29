# Fee Refund Requests — POC

A working proof of concept of the fee refund request feature: authorized users look up a
customer account, select fees eligible for refund, confirm amounts and remitters, and
submit the request to the Office of the Chief Financial Officer (OCFO) for review.

This POC was produced by design to communicate the intended flow and interaction detail to
the dev team and the business. It runs entirely on mock data (`src/data/mockData.js`) — no
backend, no auth. Anything the backend would own is marked in code comments.

## Stack

- [Vite](https://vitejs.dev) + React 18
- [Mantine 7](https://mantine.dev) for UI components
- `jspdf` + `jspdf-autotable` and `docx` for the client-side export stand-ins

## Run it

```bash
npm install
npm run dev
```

Sample customer IDs for the search: `C-104822`, `C-220917`, `C-301550`.
`C-104822` is the richest walkthrough — it covers a lump-sum PayPal fee, a fee with no
remitter on file (manual entry required), and partial refunds.

## What the flow demonstrates

1. **Landing page** — request history (sort, filter, select, download as CSV/Word/PDF;
   request IDs open a detail modal) with "start a new request" above the table. One draft
   at a time.
2. **Select fees** — checkbox selection; lump-sum payments (PayPal, Splitwise) expanded by
   default, selectable only as a whole.
3. **Confirm details** — per-fee card with full/partial refund amount and the remitter from
   the payment record; remitters can be corrected (recorded as a note on the request) or
   entered when the record has none. One request-level justification.
4. **Review & submit** — full summary, remitter notes, legal attestation (placeholder
   wording), simulated digital submission.
5. **Confirmation** — permanent request ID, notification fan-out (submitter, OCFO, each
   remitter), and the new row in the history table as "Submitted to OCFO".

## Known POC shortcuts

- Request IDs, emails, and PDFs are generated client-side; in production these are
  backend-owned so the OCFO record and the download are the same artifact.
- Attestation wording and the justification list are placeholders pending counsel/business.
- No auth (the real page sits behind existing credentials), no "returned for correction"
  resubmit flow yet, no pagination on the history table.

Decision log: see `refund-feature-decisions.md` in the "Refund feature" Claude project.
