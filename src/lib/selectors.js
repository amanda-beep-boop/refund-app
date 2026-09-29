import { CUSTOMERS } from '../data/mockData';
import { parseCents, dollars, methodLabel } from './format';

// Pure helpers over the draft shape:
// draft = {
//   customer: 'C-...', selected: Set<feeId>, collapsed: Set<feeId>,
//   amounts: { [feeId]: { mode: 'full'|'partial', input: '12.34' } },
//   remitters: { [feeId]: { editing, touched, name, address, method, email } },
//   justification: { code, text }, attested: bool, startedAt: iso,
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
