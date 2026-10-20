import { CUSTOMERS, JUSTIFICATION_DEFINITION } from '../data/mockData';
import { parseCents, dollars, fmt, methodLabel } from './format';

// Pure helpers over the draft shape:
// draft = {
//   customer: 'C-...', selected: Set<feeId>, collapsed: Set<feeId>,
//   amounts: { [feeId]: { mode: 'full'|'partial', input: '12.34' } },
//   remitters: { [feeId]: { editing, touched, name, address, method, email } },
//   justification: { code, text }, certified: bool, startedAt: iso,
// }

export const draftCustomer = (draft) => (draft ? CUSTOMERS[draft.customer] : null);

export const selectedFees = (draft) =>
  draft ? draftCustomer(draft).fees.filter((f) => draft.selected.has(f.id)) : [];

export const initialFeeState = (fee) => ({
  amount: { mode: 'full', input: dollars(fee.cents) },
  remitter: fee.remitter
    ? {
        editing: false,
        touched: false,
        name: fee.remitter.name,
        address: fee.remitter.address,
        method: fee.remitter.method,
        email: fee.remitter.email,
      }
    : { editing: true, touched: false, name: '', address: '', method: 'original', email: null },
});

export const remitterSource = (fee, draft) => {
  const r = draft.remitters[fee.id];
  if (!fee.remitter) return 'manual';
  return r.name === fee.remitter.name &&
    r.address === fee.remitter.address &&
    r.method === fee.remitter.method
    ? 'record'
    : 'customized';
};

export const remitterValid = (fee, draft) => {
  const r = draft.remitters[fee.id];
  return Boolean(r.name.trim() && r.address.trim());
};

export const refundCents = (fee, draft) => {
  const a = draft.amounts[fee.id];
  return a.mode === 'partial' ? parseCents(a.input) : fee.cents;
};

export const amountValid = (fee, draft) => {
  const a = draft.amounts[fee.id];
  if (a.mode !== 'partial') return true;
  const c = refundCents(fee, draft);
  return Number.isInteger(c) && c >= 1 && c <= fee.cents;
};

export const feeValid = (fee, draft) => amountValid(fee, draft) && remitterValid(fee, draft);

export const draftTotal = (draft) =>
  selectedFees(draft).reduce((s, f) => s + (amountValid(f, draft) ? refundCents(f, draft) : 0), 0);

export const justificationValid = (draft) => {
  const j = draft.justification;
  return Boolean(j.code) && (j.code !== 'other' || Boolean(j.text.trim()));
};

export const step2Valid = (draft) =>
  selectedFees(draft).every((f) => feeValid(f, draft)) && justificationValid(draft);

// Notes recorded on the request document when a remitter was changed or
// entered manually. Works for both drafts (via accessor fns) and submitted
// requests (which store remitterSource/recordRemitter on each fee).
export const remitterNotes = (fees, getSource, getRecord) =>
  fees
    .map((f) => {
      const src = getSource(f);
      if (src === 'record') return null;
      if (src === 'manual')
        return {
          feeId: f.id,
          text: 'Remitter entered manually by the submitter; the payment record has no remitter on file.',
        };
      const o = getRecord(f);
      return {
        feeId: f.id,
        text: `Remitter changed from the payment record by the submitter. Record shows: ${o.name}, ${o.address}, ${methodLabel(f, o.method)}.`,
      };
    })
    .filter(Boolean);

// Wording for a submitted request's record. Shared by the request modal and its PDF so the two
// always say the same thing; stated literally, since the record is used for legal purposes.

// The card number is joined with non-breaking spaces so it never splits across lines.
export const paidLabel = (f) =>
  `${fmt(f.cents)} by ${f.method}${f.card !== '—' ? ` ${f.card.replace(/ /g, ' ')}` : ''}`;

export const refundMethodLabel = (f) =>
  f.remitter.method === 'check'
    ? 'Refund method: paper check mailed to this address'
    : `Refund method: returned to the original payment, ${f.instrument}`;

export const refundExtentLabel = (f) => (f.refund < f.cents ? 'Partial refund' : 'Full refund');

export const deliveryLabel = (n) =>
  n.to ? `Emailed to ${n.to}` : 'Mailed to the remittance address (no email on file)';

// Requests store the definition in force when they were certified; older records predate that,
// so they fall back to the current one.
export const justificationDefinition = (j) => j.definition ?? JUSTIFICATION_DEFINITION[j.code];

// Status changes and E-Note deliveries as one chronological list. Notifications sent at the same
// moment form one E-Note entry, placed right after the status change that triggered it.
export const requestActivity = (request) => {
  const events = request.timeline.map((t) => ({ ...t, kind: 'status' }));
  [...new Set(request.notifications.map((n) => n.at))].forEach((at) =>
    events.push({ kind: 'enote', at, notified: request.notifications.filter((n) => n.at === at) })
  );
  const order = { status: 0, enote: 1 };
  return events.sort((a, b) =>
    a.at < b.at ? -1 : a.at > b.at ? 1 : order[a.kind] - order[b.kind]
  );
};

export const enoteTitle = (e) =>
  `E-Note sent ${e.notified.length} notification${e.notified.length === 1 ? '' : 's'}`;
