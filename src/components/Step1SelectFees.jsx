import { ActionIcon, Button, Checkbox, Group, Paper, Table, Text, Title } from '@mantine/core';
import { useRefund } from '../state/RefundContext';
import { fmt, fmtDate } from '../lib/format';
import { Mono, LumpSumBadge } from './shared';

const Caret = ({ open }) => (
  <svg
    viewBox="0 0 12 12"
    width="12"
    height="12"
    aria-hidden="true"
    style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 120ms' }}
  >
    <path
      d="M4 2l4 4-4 4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function Step1SelectFees() {
  const { customer, draft, toggleFee, toggleCollapsed, setStep } = useRefund();
  const selectedCount = draft.selected.size;
  const eligibleCents = customer.fees
    .filter((f) => draft.selected.has(f.id))
    .reduce((s, f) => s + f.cents, 0);

  return (
    <>
      <Paper withBorder radius="sm">
        <Group justify="space-between" p="md" wrap="wrap">
          <Title order={2} fz="lg">
            Fees available for refund
          </Title>
          <Text fz="sm" c="var(--text-secondary)" maw={520}>
            Check each fee to include. Fees paid through a service such as PayPal or Splitwise are
            one lump sum: the items are shown for reference and are refunded together.
          </Text>
        </Group>
        <Table.ScrollContainer minWidth={900}>
          <Table verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th w={44} />
                <Table.Th w={32} />
                <Table.Th miw={240} w="30%">
                  Fee
                </Table.Th>
                <Table.Th>Paid on</Table.Th>
                <Table.Th>Bank</Table.Th>
                <Table.Th>Account</Table.Th>
                <Table.Th>Payment method</Table.Th>
                <Table.Th>Card</Table.Th>
                <Table.Th ta="right">Amount</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {customer.fees.map((fee) => {
                const isSelected = draft.selected.has(fee.id);
                const isOpen = fee.items && !draft.collapsed.has(fee.id);
                return [
                  <Table.Tr key={fee.id} bg={isSelected ? 'ocfo.0' : undefined}>
                    <Table.Td>
                      <Checkbox
                        checked={isSelected}
                        onChange={() => toggleFee(fee)}
                        aria-label={`Include ${fee.desc} (${fee.id})`}
                      />
                    </Table.Td>
                    <Table.Td px={4}>
                      {fee.items && (
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          size="sm"
                          onClick={() => toggleCollapsed(fee.id)}
                          aria-expanded={Boolean(isOpen)}
                          aria-label={`${isOpen ? 'Hide' : 'Show'} items for ${fee.desc}`}
                        >
                          <Caret open={isOpen} />
                        </ActionIcon>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Group gap={6} align="baseline" wrap="wrap">
                        <Text component="label" fw={600} style={{ cursor: 'pointer' }} onClick={() => toggleFee(fee)}>
                          {fee.desc}
                        </Text>
                        {fee.items && <LumpSumBadge count={fee.items.length} />}
                      </Group>
                      <Mono c="var(--text-tertiary)" fz="xs">
                        {fee.id}
                      </Mono>
                    </Table.Td>
                    <Table.Td style={{ whiteSpace: 'nowrap' }}>{fmtDate(fee.date)}</Table.Td>
                    <Table.Td style={{ whiteSpace: 'nowrap' }}>{fee.bank}</Table.Td>
                    <Table.Td>
                      <Mono>{fee.acct}</Mono>
                    </Table.Td>
                    <Table.Td style={{ whiteSpace: 'nowrap' }}>{fee.method}</Table.Td>
                    <Table.Td style={{ whiteSpace: 'nowrap' }}>
                      <Mono>{fee.card}</Mono>
                    </Table.Td>
                    <Table.Td ta="right" style={{ whiteSpace: 'nowrap' }}>
                      <Mono>{fmt(fee.cents)}</Mono>
                    </Table.Td>
                  </Table.Tr>,
                  ...(isOpen
                    ? fee.items.map((item, i) => (
                        <Table.Tr key={`${fee.id}-item-${i}`} bg="gray.0">
                          <Table.Td />
                          <Table.Td />
                          <Table.Td
                            style={{ paddingLeft: 22, borderLeft: '3px solid var(--mantine-color-gray-4)' }}
                          >
                            <Text fz="sm" c="var(--text-secondary)">
                              {item.desc}
                            </Text>
                          </Table.Td>
                          <Table.Td colSpan={5} />
                          <Table.Td ta="right">
                            <Mono fz="sm" c="var(--text-secondary)">
                              {fmt(item.cents)}
                            </Mono>
                          </Table.Td>
                        </Table.Tr>
                      ))
                    : []),
                ];
              })}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Paper>

      <Group justify="space-between" wrap="wrap">
        <Text c="var(--text-secondary)">
          <Text component="span" fw={600} c="dark">
            {selectedCount}
          </Text>{' '}
          fee{selectedCount === 1 ? '' : 's'} selected ·{' '}
          <Mono fw={600} c="dark">
            {fmt(eligibleCents)}
          </Mono>{' '}
          eligible
        </Text>
        <Button disabled={!selectedCount} onClick={() => setStep(2)}>
          Continue to details →
        </Button>
      </Group>
    </>
  );
}
