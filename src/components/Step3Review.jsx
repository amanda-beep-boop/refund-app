import {
  Button,
  Checkbox,
  Group,
  List,
  Paper,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Title,
  VisuallyHidden,
} from '@mantine/core';
import { useRefund } from '../state/RefundContext';
import { SUBMITTER, JUSTIFICATION_LABEL } from '../data/mockData';
import { fmtDate, methodLabel } from '../lib/format';
import { refundCents, remitterSource, remitterNotes } from '../lib/selectors';
import { Mono, Amount, Field, Chevron, DisabledHint, RemitterSourceAnnotation, LumpSumAnnotation } from './shared';

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
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" verticalSpacing="sm">
          <Field label="Submitted by">
            {SUBMITTER.name} · {SUBMITTER.email}
          </Field>
          <Field label="Customer">
            {customer.name} · <Mono>{customer.id}</Mono> · {customer.team}, {customer.position}
          </Field>
          <Field label="Justification">
            {JUSTIFICATION_LABEL[draft.justification.code]}
            {draft.justification.code === 'other' && <Text mt={2}>{draft.justification.text}</Text>}
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
                        {fee.items && <LumpSumAnnotation count={fee.items.length} />}
                      </Group>
                      <Mono c="dimmed">{fee.id}</Mono>
                    </Table.Td>
                    <Table.Td>
                      {fmtDate(fee.date)}
                      <Text fz="sm" c="dimmed">
                        {fee.method}
                        {fee.card !== '—' ? ` ${fee.card}` : ''}
                      </Text>
                    </Table.Td>
                    <Table.Td ta="right">
                      <Amount cents={fee.cents} />
                    </Table.Td>
                    <Table.Td ta="right">
                      <Amount cents={refundCents(fee, draft)} />
                      {refundCents(fee, draft) < fee.cents && (
                        <Text fz="sm" c="dimmed">
                          Partial
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Text fw={600}>{r.name}</Text>
                      <Text fz="sm">{r.address}</Text>
                      <Text fz="sm">{methodLabel(fee, r.method)}</Text>
                      {source !== 'record' && (
                        <div style={{ marginTop: 4 }}>
                          <RemitterSourceAnnotation source={source} />
                        </div>
                      )}
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
        <Group justify="flex-end" gap="xl" p="md" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <Text fw={600}>Total refund requested</Text>
          <Amount cents={total} fz="xl" fw={600} />
        </Group>
      </Paper>

      <Paper withBorder radius="sm" p="md">
        <Group justify="space-between" mb="sm" wrap="wrap">
          <Title order={2} fz="lg">
            Remitter notes
          </Title>
          <Text fz="sm" c="dimmed">
            Included in the request document sent to the OCFO.
          </Text>
        </Group>
        {notes.length ? (
          <List spacing="xs">
            {notes.map((n) => (
              <List.Item key={n.feeId}>
                <Mono fw={500}>{n.feeId}</Mono>: {n.text}
              </List.Item>
            ))}
          </List>
        ) : (
          <Text>Every remitter matches the payment record.</Text>
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
              <Text component="span" fz="sm" c="dimmed">
                (Placeholder wording, to be supplied by counsel.)
              </Text>
            </Text>
          }
        />
      </Paper>

      <Group justify="space-between" align="flex-start" wrap="wrap">
        <Text>Submitting sends the request to the OCFO. It can't be edited afterward.</Text>
        <Stack gap={4} align="flex-end">
          <Group gap="xs">
            <Button
              variant="default"
              disabled={sending}
              onClick={() => setStep(2)}
              leftSection={<Chevron dir="left" />}
            >
              Back to details
            </Button>
            <Button disabled={!draft.certified} loading={sending} onClick={submit}>
              Submit to OCFO
            </Button>
          </Group>
          <DisabledHint items={draft.certified ? [] : ['check the certification box above']} />
          <VisuallyHidden role="status" aria-live="polite">
            {sending ? 'Submitting your request to the OCFO…' : ''}
          </VisuallyHidden>
        </Stack>
      </Group>
    </>
  );
}
