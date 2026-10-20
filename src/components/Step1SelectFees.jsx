import { ActionIcon, Button, Checkbox, Group, Paper, Stack, Table, Text, Title, VisuallyHidden } from '@mantine/core';
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
          <Table verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th w={44}>
                  <VisuallyHidden>Include</VisuallyHidden>
                </Table.Th>
                <Table.Th w={40}>
                  <VisuallyHidden>Items</VisuallyHidden>
                </Table.Th>
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
                      <Group gap={6} align="baseline" wrap="wrap">
                        <Text component="label" htmlFor={checkboxId} fw={600} style={{ cursor: 'pointer' }}>
                          {fee.desc}
                        </Text>
                        {fee.items && <LumpSumAnnotation count={fee.items.length} />}
                      </Group>
                      <Mono c="dimmed">{fee.id}</Mono>
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
                            <Text fz="sm">
                              <VisuallyHidden>Item in {fee.desc}: </VisuallyHidden>
                              {item.desc}
                            </Text>
                          </Table.Td>
                          <Table.Td colSpan={5} />
                          <Table.Td ta="right">
                            <Amount cents={item.cents} fz="sm" />
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
          fee{selectedCount === 1 ? '' : 's'} selected ·{' '}
          <Amount cents={eligibleCents} fw={600} /> eligible
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
