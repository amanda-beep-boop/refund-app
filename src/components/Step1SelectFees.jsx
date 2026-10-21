import { ActionIcon, Box, Button, Checkbox, Group, Paper, Stack, Table, Text, Title, VisuallyHidden } from '@mantine/core';
import { useRefund } from '../state/RefundContext';
import { fmtDate } from '../lib/format';
import { Mono, Amount, LumpSumAnnotation, Chevron, DisabledHint } from './shared';

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
          <Text fz="sm" c="dimmed" maw={520}>
            Check each fee to include. Fees paid through a service such as PayPal or Splitwise are
            one lump sum: the items are shown for reference and are refunded together.
          </Text>
        </Group>
        <Table.ScrollContainer minWidth={900}>
          <Table verticalSpacing="sm" horizontalSpacing="md" fz="sm" styles={{ td: { verticalAlign: 'top' } }}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th w={44}>
                  <VisuallyHidden>Include</VisuallyHidden>
                </Table.Th>
                <Table.Th w={40}>
                  <VisuallyHidden>Items</VisuallyHidden>
                </Table.Th>
                <Table.Th miw={240} w="38%">
                  Fee
                </Table.Th>
                <Table.Th>Paid on</Table.Th>
                <Table.Th>Payment</Table.Th>
                <Table.Th ta="right">Amount</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {customer.fees.map((fee) => {
                const isSelected = draft.selected.has(fee.id);
                const isOpen = fee.items && !draft.collapsed.has(fee.id);
                const checkboxId = `include-${fee.id}`;
                return [
                  <Table.Tr key={fee.id} bg={isSelected ? 'brand.0' : undefined}>
                    <Table.Td>
                      <Checkbox
                        id={checkboxId}
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
                          size="lg"
                          onClick={() => toggleCollapsed(fee.id)}
                          aria-expanded={Boolean(isOpen)}
                          aria-label={`${isOpen ? 'Hide' : 'Show'} items for ${fee.desc}`}
                        >
                          <Chevron dir={isOpen ? 'down' : 'right'} />
                        </ActionIcon>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Text component="label" htmlFor={checkboxId} inherit style={{ cursor: 'pointer' }}>
                        {fee.desc}
                      </Text>
                      <Text inherit c="dimmed">
                        Fee ID <Mono fz={13} c="inherit">{fee.id}</Mono>
                      </Text>
                      {fee.items && (
                        <Box mt={4}>
                          <LumpSumAnnotation count={fee.items.length} />
                        </Box>
                      )}
                    </Table.Td>
                    <Table.Td style={{ whiteSpace: 'nowrap' }}>{fmtDate(fee.date)}</Table.Td>
                    <Table.Td>
                      <Text inherit>{fee.method}</Text>
                      {paymentDetails(fee).map((line) => (
                        <Text inherit c="dimmed" key={line}>
                          {line}
                        </Text>
                      ))}
                    </Table.Td>
                    <Table.Td ta="right" style={{ whiteSpace: 'nowrap' }}>
                      <Amount cents={fee.cents} />
                    </Table.Td>
                  </Table.Tr>,
                  ...(isOpen
                    ? fee.items.map((item, i) => (
                        <Table.Tr key={`${fee.id}-item-${i}`} bg="var(--surface-inset)">
                          <Table.Td />
                          <Table.Td />
                          <Table.Td
                            style={{ paddingLeft: 22, borderLeft: '3px solid var(--border-strong)' }}
                          >
                            <Text inherit>
                              <VisuallyHidden>Item in {fee.desc}: </VisuallyHidden>
                              {item.desc}
                            </Text>
                          </Table.Td>
                          <Table.Td colSpan={2} />
                          <Table.Td ta="right">
                            <Amount cents={item.cents} />
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

      <Group justify="space-between" align="flex-start" wrap="wrap">
        <Text>
          <Text component="span" fw={600}>
            {selectedCount}
          </Text>{' '}
          fee{selectedCount === 1 ? '' : 's'} selected, totaling{' '}
          <Amount cents={eligibleCents} fw={600} />
        </Text>
        <Stack gap={4} align="flex-end">
          <Button disabled={!selectedCount} onClick={() => setStep(2)} rightSection={<Chevron />}>
            Continue to details
          </Button>
          <DisabledHint items={selectedCount ? [] : ['select at least one fee']} />
        </Stack>
      </Group>
    </>
  );
}

// The card and the account a fee was paid from, each on its own line. Services such as PayPal
// are their own "bank", so only the account (an email address) is shown for them. Numbers use
// non-breaking spaces so they never split across lines.
const paymentDetails = (fee) => {
  const keep = (s) => s.replace(/ /g, '\u00a0');
  return [
    fee.card !== '—' && keep(fee.card),
    fee.bank === fee.method ? fee.acct : `${fee.bank} account ${keep(fee.acct)}`,
  ].filter(Boolean);
};
