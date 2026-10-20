import { useMemo, useState } from 'react';
import {
  Anchor,
  Button,
  Checkbox,
  Group,
  Menu,
  Paper,
  Select,
  Table,
  Text,
  TextInput,
  Title,
  UnstyledButton,
} from '@mantine/core';
import { useRefund } from '../state/RefundContext';
import { CUSTOMERS } from '../data/mockData';
import { STATUS_META } from '../theme';
import { fmt, fmtDate } from '../lib/format';
import { downloadHistoryCsv, downloadHistoryPdf, downloadHistoryDocx } from '../lib/exports';
import { StatusBadge, Mono } from './shared';
import RequestModal from './RequestModal';

const COLUMNS = [
  { key: 'id', label: 'Request ID' },
  { key: 'customer', label: 'Customer' },
  { key: 'submittedAt', label: 'Date submitted' },
  { key: 'status', label: 'Status' },
  { key: 'statusDate', label: 'Status date' },
  { key: 'total', label: 'Amount', align: 'right' },
];

export default function HistoryTable() {
  const { requests, draft, resumeDraft } = useRefund();
  const [filters, setFilters] = useState({ status: 'all', from: '', to: '', q: '' });
  const [sort, setSort] = useState({ key: 'submittedAt', dir: 'desc' });
  const [selected, setSelected] = useState(new Set());
  const [openId, setOpenId] = useState(null);

  const allRows = useMemo(() => {
    const rows = requests.map((r) => ({
      id: r.id,
      isDraft: false,
      customer: r.customer,
      submittedAt: r.submittedAt,
      status: r.status,
      statusDate: r.statusDate,
      total: r.total,
    }));
    if (draft)
      rows.push({
        id: null,
        isDraft: true,
        customer: draft.customer,
        submittedAt: null,
        status: 'draft',
        statusDate: draft.startedAt.slice(0, 10),
        total: null,
      });
    return rows;
  }, [requests, draft]);

  const rows = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    const filtered = allRows.filter(
      (r) =>
        (filters.status === 'all' || r.status === filters.status) &&
        (!filters.from || (r.submittedAt && r.submittedAt.slice(0, 10) >= filters.from)) &&
        (!filters.to || (r.submittedAt && r.submittedAt.slice(0, 10) <= filters.to)) &&
        (!q ||
          CUSTOMERS[r.customer].name.toLowerCase().includes(q) ||
          r.customer.toLowerCase().includes(q) ||
          (r.id || '').toLowerCase().includes(q))
    );
    const dir = sort.dir === 'asc' ? 1 : -1;
    const value = (r) =>
      sort.key === 'customer'
        ? CUSTOMERS[r.customer].name
        : sort.key === 'status'
          ? STATUS_META[r.status].label
          : sort.key === 'total'
            ? (r.total ?? -1)
            : (r[sort.key] ?? '');
    return [...filtered].sort((a, b) => {
      const x = value(a);
      const y = value(b);
      return (x < y ? -1 : x > y ? 1 : 0) * dir;
    });
  }, [allRows, filters, sort]);

  const exportable = rows.filter((r) => !r.isDraft);
  const selectedRows = exportable.filter((r) => selected.has(r.id));
  const exportRows = selectedRows.length ? selectedRows : exportable;
  const allSelected = exportable.length > 0 && selectedRows.length === exportable.length;
  const anyFilter = filters.status !== 'all' || filters.from || filters.to || filters.q;

  const toggleSort = (key) =>
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: ['submittedAt', 'statusDate', 'total'].includes(key) ? 'desc' : 'asc' }
    );

  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(exportable.map((r) => r.id)));

  const toggleRow = (id) =>
    setSelected((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <Paper withBorder radius="sm">
      <Group justify="space-between" p="md" pb="sm" wrap="wrap">
        <Title order={2} fz="lg">
          Your refund requests
        </Title>
        <Text fz="sm" c="var(--text-secondary)">
          Click a request ID to view the full request.
        </Text>
      </Group>

      <Group px="md" pb="md" gap="sm" align="flex-end" wrap="wrap">
        <Select
          label="Status"
          data={[
            { value: 'all', label: 'All statuses' },
            ...Object.entries(STATUS_META).map(([value, meta]) => ({ value, label: meta.label })),
          ]}
          value={filters.status}
          onChange={(status) => setFilters((f) => ({ ...f, status: status || 'all' }))}
          w={220}
        />
        <TextInput
          type="date"
          label="Date from"
          value={filters.from}
          onChange={(e) => setFilters((f) => ({ ...f, from: e.currentTarget.value }))}
          w={160}
        />
        <TextInput
          type="date"
          label="Date to"
          value={filters.to}
          onChange={(e) => setFilters((f) => ({ ...f, to: e.currentTarget.value }))}
          w={160}
        />
        <TextInput
          label="Customer or request ID"
          placeholder="Name, customer ID, or RR number"
          value={filters.q}
          onChange={(e) => setFilters((f) => ({ ...f, q: e.currentTarget.value }))}
          style={{ flex: 1, minWidth: 200 }}
        />
        <Button
          variant="default"
          size="sm"
          disabled={!anyFilter}
          onClick={() => setFilters({ status: 'all', from: '', to: '', q: '' })}
        >
          Clear filters
        </Button>
      </Group>

      <Group justify="space-between" px="md" py="xs" bg="gray.0" wrap="wrap">
        <Text fz="sm" c="var(--text-secondary)">
          Showing{' '}
          <Text component="span" fw={600} c="dark">
            {rows.length}
          </Text>{' '}
          of {allRows.length}
          {selectedRows.length > 0 && (
            <>
              {' · '}
              <Text component="span" fw={600} c="dark">
                {selectedRows.length}
              </Text>{' '}
              selected
            </>
          )}
        </Text>
        <Menu position="bottom-end" withinPortal>
          <Menu.Target>
            <Button variant="default" size="sm" disabled={!exportable.length}>
              {selectedRows.length
                ? `Download ${selectedRows.length} selected`
                : `Download all (${exportable.length})`}{' '}
              ▾
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item onClick={() => downloadHistoryCsv(exportRows)}>
              CSV
              <Text fz="xs" c="var(--text-tertiary)">
                Spreadsheet-ready table
              </Text>
            </Menu.Item>
            <Menu.Item onClick={() => downloadHistoryDocx(exportRows)}>
              Word document
              <Text fz="xs" c="var(--text-tertiary)">
                .docx with the table
              </Text>
            </Menu.Item>
            <Menu.Item onClick={() => downloadHistoryPdf(exportRows)}>
              PDF
              <Text fz="xs" c="var(--text-tertiary)">
                Printable table
              </Text>
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>

      <Table.ScrollContainer minWidth={820}>
        <Table verticalSpacing="sm" highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={40}>
                <Checkbox
                  checked={allSelected}
                  onChange={toggleAll}
                  disabled={!exportable.length}
                  aria-label="Select all shown requests"
                />
              </Table.Th>
              {COLUMNS.map((col) => (
                <Table.Th key={col.key} ta={col.align}>
                  <UnstyledButton onClick={() => toggleSort(col.key)} aria-label={`Sort by ${col.label}`}>
                    <Text fz="xs" tt="uppercase" fw={600} lts="0.05em" c={sort.key === col.key ? 'dark' : 'var(--text-tertiary)'}>
                      {col.label} {sort.key === col.key ? (sort.dir === 'asc' ? '▲' : '▼') : ''}
                    </Text>
                  </UnstyledButton>
                </Table.Th>
              ))}
              {draft && <Table.Th />}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={draft ? 8 : 7}>
                  <Text ta="center" c="var(--text-secondary)" py="lg">
                    {anyFilter ? 'No requests match these filters.' : 'No refund requests yet.'}
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
            {rows.map((r) => (
              <Table.Tr key={r.id || 'draft'}>
                <Table.Td>
                  <Checkbox
                    checked={Boolean(r.id) && selected.has(r.id)}
                    onChange={() => toggleRow(r.id)}
                    disabled={r.isDraft}
                    aria-label={`Select ${r.id || 'draft'}`}
                  />
                </Table.Td>
                <Table.Td>
                  {r.isDraft ? (
                    <Text c="var(--text-secondary)">—</Text>
                  ) : (
                    <Anchor component="button" type="button" onClick={() => setOpenId(r.id)} ff="monospace" fw={500}>
                      {r.id}
                    </Anchor>
                  )}
                </Table.Td>
                <Table.Td>
                  <Text>{CUSTOMERS[r.customer].name}</Text>
                  <Mono c="var(--text-tertiary)" fz="xs">
                    {r.customer}
                  </Mono>
                </Table.Td>
                <Table.Td>
                  {r.isDraft ? <Text c="var(--text-secondary)">Not submitted</Text> : fmtDate(r.submittedAt)}
                </Table.Td>
                <Table.Td>
                  <StatusBadge status={r.status} />
                </Table.Td>
                <Table.Td>{fmtDate(r.statusDate)}</Table.Td>
                <Table.Td ta="right">
                  {r.isDraft ? <Text c="var(--text-secondary)">—</Text> : <Mono>{fmt(r.total)}</Mono>}
                </Table.Td>
                {draft && (
                  <Table.Td ta="right">
                    {r.isDraft && (
                      <Button size="xs" variant="default" onClick={resumeDraft}>
                        Resume
                      </Button>
                    )}
                  </Table.Td>
                )}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      <RequestModal requestId={openId} onClose={() => setOpenId(null)} />
    </Paper>
  );
}
