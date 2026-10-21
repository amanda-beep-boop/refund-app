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

1. **Landing page** — every request submitted by the analyst's office, with who requested
   it (sort, filter, select, download as CSV/Word/PDF). Newest first by default, with a draft
   in progress at the top. "Start a new request" sits above the table. One draft at a time.
   Request IDs open the request record.
2. **Select fees** — checkbox selection; lump-sum payments (PayPal, Splitwise) expanded by
   default, selectable only as a whole.
3. **Confirm details** — per-fee card with full/partial refund amount and the remitter from
   the payment record; remitters can be corrected (recorded as a note on the request) or
   entered when the record has none. One request-level justification.
4. **Review & submit** — full summary, remitter notes, legal certification (placeholder
   wording), simulated digital submission.
5. **Confirmation** — permanent request ID, the E-Note emails sent (to the submitter and the
   OCFO; remitters are never notified), and the new row in the history table as "Submitted
   to OCFO".
6. **Request record** — the modal behind each request ID is a living record. On top, a
   snapshot of what was submitted, laid out like an invoice: customer and requester, the
   justification with its definition as it stood at submission, fees with explicit refund
   destinations, and the certification. Below it, Activity: status changes, OCFO notes, and
   the deliveries made by E-Note (the automated notification system). A note on the current
   status is pinned at the top and links to Activity. The PDF download mirrors the record
   using the same wording.

### Design system notes

- One secondary gray (`c="dimmed"`) for labels, details, hints and table headers.
- A filled pill (`StatusBadge`) is reserved for workflow status. Flags about data use
  `Annotation`: an icon plus text with no fill, so they can't be mistaken for buttons
  (neutral gray, or amber for anything the analyst should check).

## Known POC shortcuts

- Request IDs, emails, and PDFs are generated client-side; in production these are
  backend-owned so the OCFO record and the download are the same artifact.
- Certification wording, the justification list and each justification's definition are
  placeholders pending counsel/business. In production the backend should store the
  definition with each request, as the POC does at submission.
- E-Note deliveries are simulated; notifications currently go out only at submission.
- No auth (the real page sits behind existing credentials), no "returned for correction"
  resubmit flow yet, no pagination on the history table.

Decision log: see `refund-feature-decisions.md` in the "Refund feature" Claude project.
