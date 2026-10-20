import {
  Button,
  Checkbox,
  Group,
  List,
  Paper,
  SimpleGrid,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { useRefund } from '../state/RefundContext';
import { SUBMITTER, JUSTIFICATION_LABEL } from '../data/mockData';
import { fmt, fmtDate, methodLabel } from '../lib/format';
import { refundCents, remitterSource, remitterNotes } from '../lib/selectors';
import { Mono, RemitterSourceBadge, LumpSumBadge } from './shared';

export default function Step3Review() {
  const { draft, customer, fees, total, sending, setCertified, setStep, submit } = useRefund();
  const partials = fees.filter((f) => refundCents(f, draft) < f.cents).length;
  const notes = remitterNotes(
    fees,
    (f) => remitterSource(f, draft),
    (f) => f.remitter
  );

  return (
    <>
      <Paper withBorder radius="sm" p="md">
        <Title order={2} fz="lg" mb="sm">
          Request summary
        </Title>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs" verticalSpacing={6}>
          <Field label="Submitted by">
            {SUBMITTER.name} ·{' '}
            <Text component="span" c="var(--text-secondary)">
              {SUBMITTER.email}
            </Text>
          </Field>
          <Field label="Customer">
            {customer.name} · <Mono>{customer.id}</Mono> · {customer.team}, {customer.position}
          </Field>
          <Field label="Justification">
            {JUSTIFICATION_LABEL[draft.justification.code]}
            {draft.justification.code === 'other' && (
              <Text c="var(--text-secondary)" fz="sm">
                {draft.justification.text}
              </Text>
            )}
          </Field>
          <Field label="Refund type">
            {partials
              ? `${partials} partial, ${fees.length - partials} full`
              : 'Full refund of every selected fee'}
          </Field>
          <Field label="Routed to">
            Office of the Chief Financial Officer (OCFO), Refund Review
          </Field>
        </SimpleGrid>
      </Paper>

      <Paper withBorder radius="sm">
        <Title order={2} fz="lg" p="md">
          Fees in this request
        </Title>
        <Table.ScrollContainer minWidth={760}>
          <Table verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th miw={220}>Fee</Table.Th>
                <Table.Th>Paid</Table.Th>
                <Table.Th ta="right">Paid amount</Table.Th>
                <Table.Th ta="right">Refund</Table.Th>
                <Table.Th>Remit to</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {fees.map((fee) => {
                const r = draft.remitters[fee.id];
                const source = remitterSource(fee, draft);
                return (
                  <Table.Tr key={fee.id}>
                    <Table.Td>
                      <Group gap={6} align="baseline">
                        <Text fw={600}>{fee.desc}</Text>
                        {fee.items && <LumpSumBadge count={fee.items.length} />}
                      </Group>
                      <Mono c="var(--text-tertiary)" fz="xs">
                        {fee.id}
                      </Mono>
                    </Table.Td>
                    <Table.Td>
                      {fmtDate(fee.date)}
                      <Text fz="sm" c="var(--text-secondary)">
                        {fee.method}
                        {fee.card !== '—' ? ` ${fee.card}` : ''}
                      </Text>
                    </Table.Td>
                    <Table.Td ta="right">
                      <Mono>{fmt(fee.cents)}</Mono>
                    </Table.Td>
                    <Table.Td ta="right">
                      <Mono>{fmt(refundCents(fee, draft))}</Mono>
                      {refundCents(fee, draft) < fee.cents && (
                        <Text fz="xs" c="var(--text-tertiary)">
                          partial
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Text fw={600}>{r.name}</Text>
                      <Text fz="sm" c="var(--text-secondary)">
                        {r.address}
                      </Text>
                      <Text fz="sm" c="var(--text-secondary)">
                        {methodLabel(fee, r.method)}
                      </Text>
                      {source !== 'record' && (
                        <div style={{ marginTop: 4 }}>
                          <RemitterSourceBadge source={source} />
                        </div>
                      )}
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
        <Group justify="flex-end" gap="xl" p="md" style={{ borderTop: '1px solid var(--mantine-color-gray-4)' }}>
          <Text c="var(--text-secondary)">Total refund requested</Text>
          <Mono fz="xl" fw={600}>
            {fmt(total)}
          </Mono>
        </Group>
      </Paper>

      <Paper withBorder radius="sm" p="md">
        <Group justify="space-between" mb="sm" wrap="wrap">
          <Title order={2} fz="lg">
            Remitter notes
          </Title>
          <Text fz="sm" c="var(--text-secondary)">
            Included in the request document sent to the OCFO.
          </Text>
        </Group>
        {notes.length ? (
          <List spacing="xs" fz="sm">
            {notes.map((n) => (
              <List.Item key={n.feeId}>
                <Mono fw={500}>{n.feeId}</Mono> — {n.text}
              </List.Item>
            ))}
          </List>
        ) : (
          <Text c="var(--text-secondary)">Every remitter matches the payment record.</Text>
        )}
      </Paper>

      <Paper withBorder radius="sm" p="md">
        <Checkbox
          checked={draft.certified}
          onChange={(e) => setCertified(e.currentTarget.checked)}
          label={
            <Text>
              I certify that the information in this request is accurate and complete to the best of
              my knowledge. By submitting, I am legally submitting this fee refund request to the
              Office of the Chief Financial Officer for review, and I understand that it will be
              transmitted digitally and recorded under my credentials.{' '}
              <Text component="span" fz="sm" c="var(--text-secondary)">
                (Placeholder wording, to be supplied by counsel.)
              </Text>
            </Text>
          }
        />
      </Paper>

      <Group justify="space-between" wrap="wrap">
        <Text c="var(--text-secondary)">Submitting sends the request to the OCFO. It can't be edited afterward.</Text>
        <Group gap="xs">
          <Button variant="default" disabled={sending} onClick={() => setStep(2)}>
            ← Back to details
          </Button>
          <Button disabled={!draft.certified} loading={sending} onClick={submit}>
            Submit to OCFO
          </Button>
        </Group>
      </Group>
    </>
  );
}

const Field = ({ label, children }) => (
  <div>
    <Text fz="xs" tt="uppercase" c="var(--text-tertiary)" fw={600} lts="0.05em">
      {label}
    </Text>
    <Text>{children}</Text>
  </div>
);
