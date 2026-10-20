import {
  Anchor,
  Box,
  Button,
  Group,
  List,
  Modal,
  Stack,
  Table,
  Text,
  Timeline,
  Title,
} from '@mantine/core';
import { useRefund } from '../state/RefundContext';
import { CUSTOMERS, JUSTIFICATION_LABEL } from '../data/mockData';
import { STATUS_META } from '../theme';
import { fmtDate, fmtDateTime } from '../lib/format';
import {
  remitterNotes,
  requestActivity,
  justificationDefinition,
  paidLabel,
  refundMethodLabel,
  refundExtentLabel,
  enoteTitle,
} from '../lib/selectors';
import { downloadRequestPdf } from '../lib/exports';
import {
  StatusBadge,
  Mono,
  Amount,
  FieldLabel,
  NotificationList,
  RemitterSourceAnnotation,
  LumpSumAnnotation,
} from './shared';

// The modal is a living record: a snapshot of what was submitted, then Activity (everything after
// submission), which keeps growing below it. Type rules for the whole modal: section headings
// 16/600; labels 14/600 gray; values 14/400 dark; details 14/400 in the same gray; weight
// otherwise only on event titles and the total.
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
  // A note on the current status (e.g. why it was returned) is what the analyst has to act on.
  // It lives in Activity; a pinned notice at the top links to it.
  const latest = request.timeline[request.timeline.length - 1];
  const leadNote = latest.note ? latest : null;
  const events = requestActivity(request);
  const { code, text } = request.justification;
  const definition = justificationDefinition(request.justification);

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
        {leadNote && <PinnedNotice event={leadNote} />}

        <section className="form-record" aria-labelledby="submitted-request-heading">
          <div className="form-record-header">
            <Title order={3} fz="md" id="submitted-request-heading">
              Submitted request
            </Title>
          </div>

          <div className="form-record-fields">
            <RecordField label="Customer">
              <Text inherit>{c.name}</Text>
              <Text inherit c="dimmed">
                Customer ID <Mono fz={13} c="inherit">{c.id}</Mono>
              </Text>
              <Text inherit c="dimmed">
                {c.team}, {c.position}
              </Text>
            </RecordField>
            <RecordField label="Requested by">
              <Text inherit>{request.submittedBy.name}</Text>
              <Text inherit c="dimmed">
                {request.submittedBy.email}
              </Text>
            </RecordField>
          </div>

          <div className="form-record-section form-record-pad">
            <RecordField label="Justification">
              <Text inherit>{JUSTIFICATION_LABEL[code]}</Text>
              <Text inherit c="dimmed" className="readable">
                Definition at the time of submission: {definition}
              </Text>
              {text && (
                <>
                  <FieldLabel mt="sm">
                    Submitter’s explanation
                  </FieldLabel>
                  <Text inherit className="readable">
                    {text}
                  </Text>
                </>
              )}
            </RecordField>
          </div>

          <div className="form-record-section">
            <Table.ScrollContainer minWidth={760} type="native">
              {/* Invoice layout: refunds sit in the last column so they line up with the total. */}
              <Table
                verticalSpacing="sm"
                horizontalSpacing="md"
                fz="sm"
                styles={{ td: { verticalAlign: 'top' } }}
              >
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th w="26%">Fee</Table.Th>
                    <Table.Th w="22%">Paid</Table.Th>
                    <Table.Th>Refund to</Table.Th>
                    <Table.Th ta="right" w={140}>
                      Refund
                    </Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {request.fees.map((f) => (
                    <Table.Tr key={f.id}>
                      <Table.Td>
                        <Text inherit>{f.desc}</Text>
                        <Text inherit c="dimmed">
                          Fee ID <Mono fz={13} c="inherit">{f.id}</Mono>
                        </Text>
                        {f.items && (
                          <Box mt={4}>
                            <LumpSumAnnotation count={f.items.length} />
                          </Box>
                        )}
                      </Table.Td>
                      <Table.Td>
                        <Text inherit style={{ whiteSpace: 'nowrap' }}>
                          {fmtDate(f.date)}
                        </Text>
                        <Text inherit c="dimmed">
                          {paidLabel(f)}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text inherit>{f.remitter.name}</Text>
                        <Text inherit c="dimmed">
                          {f.remitter.address}
                        </Text>
                        <Text inherit c="dimmed">
                          {refundMethodLabel(f)}
                        </Text>
                        {f.remitterSource !== 'record' && (
                          <Box mt={4}>
                            <RemitterSourceAnnotation source={f.remitterSource} />
                          </Box>
                        )}
                      </Table.Td>
                      <Table.Td ta="right">
                        <Amount cents={f.refund} />
                        <Text inherit c="dimmed">
                          {refundExtentLabel(f)}
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
                <Table.Tfoot>
                  <Table.Tr>
                    <Table.Th colSpan={3} scope="row" ta="right">
                      Total refund requested
                    </Table.Th>
                    <Table.Td ta="right">
                      <Amount cents={request.total} fw={600} />
                    </Table.Td>
                  </Table.Tr>
                </Table.Tfoot>
              </Table>
            </Table.ScrollContainer>
          </div>

          {notes.length > 0 && (
            <div className="form-record-section form-record-pad">
              <FieldLabel>Remitter notes</FieldLabel>
              <List spacing={4} fz="sm" mt={4} className="readable">
                {notes.map((n) => (
                  <List.Item key={n.feeId}>
                    <Mono fz={13}>{n.feeId}</Mono>: {n.text}
                  </List.Item>
                ))}
              </List>
            </div>
          )}

          <div className="form-record-footer">
            <FieldLabel>Certification</FieldLabel>
            <Text fz="sm">
              Certified and submitted by {request.submittedBy.name} on{' '}
              {fmtDateTime(request.certifiedAt)}. Routed to the Office of the Chief Financial
              Officer (OCFO), Refund Review.
            </Text>
          </div>
        </section>

        <section aria-labelledby="activity-heading">
          <Title order={3} fz="md" mb="sm" id="activity-heading">
            Activity
          </Title>
          <Timeline
            active={events.length - 1}
            bulletSize={14}
            lineWidth={2}
            styles={{ itemTitle: { fontSize: 'var(--mantine-font-size-sm)', fontWeight: 600 } }}
          >
            {events.map((e, i) =>
              e.kind === 'enote' ? (
                <Timeline.Item
                  key={i}
                  title={enoteTitle(e)}
                  color="var(--mantine-color-gray-6)"
                  bullet={<MailIcon />}
                >
                  <Text fz="sm" c="dimmed">
                    {fmtDateTime(e.at)}
                  </Text>
                  <Box mt="xs">
                    <NotificationList notifications={e.notified} />
                  </Box>
                </Timeline.Item>
              ) : (
                <Timeline.Item
                  key={i}
                  title={STATUS_META[e.status].label}
                  color={STATUS_META[e.status].color}
                >
                  <Text fz="sm" c="dimmed">
                    {fmtDateTime(e.at)}
                  </Text>
                  {e.note && (
                    <Box mt={6}>
                      <StatusNote id={noteId(e)} status={e.status} at={e.at}>
                        {e.note}
                      </StatusNote>
                    </Box>
                  )}
                </Timeline.Item>
              )
            )}
          </Timeline>
        </section>
      </Stack>

      {/* Pinned to the bottom of the scrolling modal so the actions stay in reach. */}
      <Group
        justify="flex-end"
        gap="xs"
        style={{
          position: 'sticky',
          bottom: 0,
          margin: 'var(--mantine-spacing-lg) calc(var(--mb-padding, var(--mantine-spacing-md)) * -1) calc(var(--mb-padding, var(--mantine-spacing-md)) * -1)',
          padding: 'var(--mantine-spacing-sm) var(--mb-padding, var(--mantine-spacing-md))',
          background: 'var(--mantine-color-body)',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <Button variant="default" onClick={onClose}>
          Close
        </Button>
        <Button onClick={() => downloadRequestPdf(request)}>Download request (PDF)</Button>
      </Group>
    </Modal>
  );
}

const noteId = (e) => `note-${e.at}`;

// Envelope for E-Note entries, so automated deliveries read differently from status changes.
const MailIcon = () => (
  <svg viewBox="0 0 16 16" width={10} height={10} aria-hidden="true">
    <rect x="1.5" y="3.5" width="13" height="9" rx="1" fill="none" stroke="currentColor" strokeWidth="1.6" />
    <path d="m2 4.5 6 4.5 6-4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
  </svg>
);

// Short notice above the record that the current status carries an OCFO note. The note itself
// stays in Activity; the link scrolls to it and moves focus there.
const PinnedNotice = ({ event }) => {
  const color = STATUS_META[event.status].color;
  const goToNote = (ev) => {
    ev.preventDefault();
    const el = document.getElementById(noteId(event));
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    el?.focus({ preventScroll: true });
  };
  return (
    <Group
      justify="space-between"
      gap="xs"
      px="md"
      py="sm"
      bg={`var(--mantine-color-${color}-light)`}
      style={{
        borderLeft: `3px solid var(--mantine-color-${color}-filled)`,
        borderRadius: 'var(--mantine-radius-sm)',
      }}
    >
      <Text fz="sm">
        <Text component="span" inherit fw={600} c={`var(--mantine-color-${color}-light-color)`}>
          {STATUS_META[event.status].label}
        </Text>{' '}
        on {fmtDateTime(event.at)}. The OCFO left a note.
      </Text>
      <Anchor href={`#${noteId(event)}`} onClick={goToNote} fz="sm" fw={600}>
        Read the note in Activity
      </Anchor>
    </Group>
  );
};

// A reviewer's note on a status change. Notes can run to several paragraphs, so only the header
// strip carries the status color; the note itself is body text on white at a readable measure.
const StatusNote = ({ id, status, at, children }) => {
  const color = STATUS_META[status].color;
  return (
    <Box
      id={id}
      tabIndex={-1}
      className="status-note"
      style={{
        border: '1px solid var(--border-subtle)',
        borderLeft: `3px solid var(--mantine-color-${color}-filled)`,
        borderRadius: 'var(--mantine-radius-sm)',
      }}
    >
      <Group justify="space-between" gap="xs" px="md" py={6} bg={`var(--mantine-color-${color}-light)`}>
        <Text fz="sm" fw={600} c={`var(--mantine-color-${color}-light-color)`}>
          Note from the OCFO
        </Text>
        <Text fz="sm" c="dimmed">
          {fmtDateTime(at)}
        </Text>
      </Group>
      <Text fz="sm" px="md" py="sm" className="readable" style={{ whiteSpace: 'pre-line' }}>
        {children}
      </Text>
    </Box>
  );
};

// A label above its value lines. Children are the lines: the first dark, the rest gray.
const RecordField = ({ label, children }) => (
  <div>
    <FieldLabel>{label}</FieldLabel>
    <Text component="div" fz="sm" mt={2}>
      {children}
    </Text>
  </div>
);
