// Money is handled in integer cents everywhere; formatting happens at the edge.

export const fmt = (cents) =>
  (cents < 0 ? '-' : '') +
  '$' +
  (Math.abs(cents) / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const dollars = (cents) => (cents / 100).toFixed(2);

export const parseCents = (value) => {
  const n = Number(String(value).replace(/[$,\s]/g, ''));
  return Number.isFinite(n) ? Math.round(n * 100) : NaN;
};

export const fmtDate = (iso) =>
  iso
    ? new Date(iso.slice(0, 10) + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

export const fmtDateTime = (iso) =>
  iso
    ? new Date(iso).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : '';

export const nowISO = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(
    d.getMinutes()
  )}:${p(d.getSeconds())}`;
};

export const todayISO = () => nowISO().slice(0, 10);

export const accountAge = (openedISO) => {
  const days = (Date.now() - new Date(openedISO + 'T00:00:00')) / 864e5;
  const y = Math.floor(days / 365);
  const m = Math.floor((days % 365) / 30);
  return y ? `${y} yr${y > 1 ? 's' : ''} ${m} mo` : `${m} mo`;
};

export const methodLabel = (fee, method) =>
  method === 'check'
    ? 'Paper check to the remittance address'
    : `Original payment method: ${fee.instrument}`;
