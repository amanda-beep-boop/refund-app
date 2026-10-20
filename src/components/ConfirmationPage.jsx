import { useState } from 'react';
import { Button, Divider, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { useRefund } from '../state/RefundContext';
import { CUSTOMERS } from '../data/mockData';
import { fmt, fmtDateTime } from '../lib/format';
import { StatusBadge, Mono } from './shared';
import RequestModal from './RequestModal';

export default function ConfirmationPage() {
  const { lastSubmitted, setView } = useRefund();
  const [modalOpen, setModalOpen] = useState(false);
  if (!lastSubmitted) return null;
  const customer = CUSTOMERS[lastSubmitted.customer];

  return (
    <Stack gap="lg">
      <div>
        <Text fz="sm" c="var(--text-secondary)">
          Fee Refund Requests /{' '}
          <Text component="span" fw={500} c="dark.3">
            Request submitted
          </Text>
        </Text>
        <Title order={1} mt={4}>
          Request submitted to the OCFO
        </Title>
      </div>

      <Paper withBorder radius="sm" p="lg">
        <Text fz="xs" tt="uppercase" c="var(--text-tertiary)" fw={600} lts="0.05em">
          Request ID
        </Text>
        <Mono fz={32} fw={500}>
          {lastSubmitted.id}
        </Mono>
        <Text c="var(--text-secondary)" mt={6} maw={640}>
          Submitted {fmtDateTime(lastSubmitted.submittedAt)}. This ID identifies the request through
          OCFO review and final disposition; use it in any correspondence.
        </Text>

        <Divider my="md" />
        <Group gap="xl" wrap="wrap">
          <Chip label="Status">
            <StatusBadge status={lastSubmitted.status} />
          </Chip>
          <Chip label="Customer">
            {customer.name}{' '}
            <Mono c="var(--text-tertiary)" fz="xs">
              {customer.id}
            </Mono>
          </Chip>
          <Chip label="Fees">{lastSubmitted.fees.length}</Chip>
          <Chip label="Total refund">
            <Mono fw={600}>{fmt(lastSubmitted.total)}</Mono>
          </Chip>
        </Group>
        <Divider my="md" />

        <Title order={3} fz="md" mb="xs">
          Notifications sent
        </Title>
        <Stack gap={4}>
          {lastSubmitted.notifications.map((n, i) => (
            <Group key={i} gap="md" wrap="nowrap" align="baseline">
              <Text fz="sm" c="var(--text-secondary)" w={90}>
                {n.role}
              </Text>
              <Text fz="sm">
                {n.name} ·{' '}
                <Text component="span" c="var(--text-secondary)">
                  {n.to || 'no email on file — notified by mail to the remittance address'}
                </Text>
              </Text>
            </Group>
          ))}
        </Stack>

        <Group mt="lg" gap="sm">
          <Button onClick={() => setModalOpen(true)}>View request details</Button>
          <Button variant="default" onClick={() => setView('home')}>
            Back to refund requests
          </Button>
        </Group>
      </Paper>

      <RequestModal
        requestId={modalOpen ? lastSubmitted.id : null}
        onClose={() => setModalOpen(false)}
      />
    </Stack>
  );
}

const Chip = ({ label, children }) => (
  <div>
    <Text fz="xs" tt="uppercase" c="var(--text-tertiary)" fw={600} lts="0.05em">
      {label}
    </Text>
    <Text component="div">{children}</Text>
  </div>
);
