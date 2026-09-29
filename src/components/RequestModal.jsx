import {
  Button,
  Divider,
  Group,
  List,
  Modal,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Timeline,
  Title,
} from '@mantine/core';
import { useRefund } from '../state/RefundContext';
import { CUSTOMERS, JUSTIFICATION_LABEL } from '../data/mockData';
import { STATUS_META } from '../theme';
import { fmt, fmtDate, fmtDateTime, methodLabel } from '../lib/format';
import { remitterNotes } from '../lib/selectors';
import { downloadRequestPdf } from '../lib/exports';
import { StatusBadge, Mono, RemitterSourceBadge, LumpSumBadge } from './shared';

export default function RequestModal({ requestId, onClose }) {
  const { requests } = useRefund();
  const request = requests.find((r) => r.id === requestId);
  if (!request) return <Modal opened={false} onClose={onClose} />;

  const c = CUSTOMERS[request.customer];
  const notes = remitterNotes(
    request.fees,
    (f) => f.remitterSource,
    (f) => f.recordRemitter
  );

  return (
    <Modal
      opened
      onClose={onClose}
      size="60rem"
      title={
        <Group gap="sm">
          <Mono fz="lg" fw={500}>
            {request.id}
          </Mono>
          <StatusBadge status={request.status} />
        </Group>
      }
    >
      <Stack gap="lg">
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs" verticalSpacing={6}>
          <Field label="Submitted">
            {fmtDateTime(request.submittedAt)} by {request.submittedBy.name} (
            {request.submittedBy.email})
          </Field>
          <Field label="Customer">
            {c.name} · <Mono>{c.id}</Mono> · {c.team}, {c.position}
          </Field>
          <Field label="Justification">
            {JUSTIFICATION_LABEL[request.justification.code]}
            {request.justification.text && (
              <Text c="dimmed" fz="sm">
                {request.justification.text}
              </Text>
            )}
          </Field>
          <Field label="Routed to">
            Office of the Chief Financial Officer (OCFO), Refund Review
          </Field>
        </SimpleGrid>

        <div>
          <Title order={3} fz="md" mb="sm">
            Status history
          </Title>
          <Timeline active={request.timeline.length - 1} bulletSize={14} lineWidth={2}>
            {request.timeline.map((t, i) => (
              <Timeline.Item
                key={i}
                title={STATUS_META[t.status].label}
                color={STATUS_META[t.status].color}
              >
                <Text fz="sm" c="dimmed">
                  {fmtDateTime(t.at)}
                </Text>
                {t.note && (
                  <Text fz="sm" c="red" mt={4}>
                    {t.note}
                  </Text>
                )}
              </Timeline.Item>
            ))}
          </Timeline>
        </div>

        <div>
          <Title order={3} fz="md" mb="sm">
            Fees
          </Title>
          <Table.ScrollContainer minWidth={720}>
            <Table verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Fee</Table.Th>
                  <Table.Th>Paid</Table.Th>
                  <Table.Th ta="right">Paid amount</Table.Th>
                  <Table.Th ta="right">Refund</Table.Th>
                  <Table.Th>Remit to</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {request.fees.map((f) => (
                  <Table.Tr key={f.id}>
                    <Table.Td>
                      <Group gap={6} align="baseline">
                        <Text fw={600}>{f.desc}</Text>
                        {f.items && <LumpSumBadge count={f.items.length} />}
                      </Group>
                      <Mono c="dimmed" fz="xs">
                        {f.id}
                      </Mono>
                    </Table.Td>
                    <Table.Td>
                      {fmtDate(f.date)}
                      <Text fz="sm" c="dimmed">
                        {f.method}
                        {f.card !== '—' ? ` ${f.card}` : ''}
                      </Text>
                    </Table.Td>
                    <Table.Td ta="right">
                      <Mono>{fmt(f.cents)}</Mono>
                    </Table.Td>
                    <Table.Td ta="right">
                      <Mono>{fmt(f.refund)}</Mono>
                      {f.refund < f.cents && (
                        <Text fz="xs" c="dimmed">
                          partial
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Text fw={600}>{f.remitter.name}</Text>
                      <Text fz="sm" c="dimmed">
                        {f.remitter.address}
                      </Text>
                      <Text fz="sm" c="dimmed">
                        {methodLabel(f, f.remitter.method)}
                      </Text>
                      {f.remitterSource !== 'record' && (
                        <div style={{ marginTop: 4 }}>
                          <RemitterSourceBadge source={f.remitterSource} />
                        </div>
                      )}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
              <Table.Tfoot>
                <Table.Tr>
                  <Table.Td colSpan={3} fw={600}>
                    Total refund requested
                  </Table.Td>
                  <Table.Td ta="right">
                    <Mono fw={600}>{fmt(request.total)}</Mono>
                  </Table.Td>
                  <Table.Td />
                </Table.Tr>
              </Table.Tfoot>
            </Table>
          </Table.ScrollContainer>
        </div>

        {notes.length > 0 && (
          <div>
            <Title order={3} fz="md" mb="sm">
              Remitter notes
            </Title>
            <List spacing="xs" fz="sm">
              {notes.map((n) => (
                <List.Item key={n.feeId}>
                  <Mono fw={500}>{n.feeId}</Mono> — {n.text}
                </List.Item>
              ))}
            </List>
          </div>
        )}

        <div>
          <Title order={3} fz="md" mb="sm">
            Notifications sent
          </Title>
          <Stack gap={4}>
            {request.notifications.map((n, i) => (
              <Group key={i} gap="md" wrap="nowrap" align="baseline">
                <Text fz="sm" c="dimmed" w={90}>
                  {n.role}
                </Text>
                <Text fz="sm">
                  {n.name} ·{' '}
                  <Text component="span" c="dimmed">
                    {n.to || 'no email on file — notified by mail to the remittance address'}
                  </Text>
                </Text>
              </Group>
            ))}
          </Stack>
        </div>

        <Text fz="sm" c="dimmed">
          Attested and submitted by {request.submittedBy.name} on {fmtDateTime(request.attestedAt)}.
        </Text>

        <Divider />
        <Group justify="flex-end">
          <Button variant="default" onClick={() => downloadRequestPdf(request)}>
            Download request (PDF)
          </Button>
          <Button onClick={onClose}>Close</Button>
        </Group>
      </Stack>
    </Modal>
  );
}

const Field = ({ label, children }) => (
  <div>
    <Text fz="xs" tt="uppercase" c="dimmed" fw={600} lts="0.05em">
      {label}
    </Text>
    <Text>{children}</Text>
  </div>
);
