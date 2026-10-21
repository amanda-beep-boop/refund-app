import { useState } from 'react';
import { Button, Divider, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { useRefund } from '../state/RefundContext';
import { CUSTOMERS } from '../data/mockData';
import { fmtDateTime } from '../lib/format';
import { enoteTitle } from '../lib/selectors';
import { StatusBadge, Mono, Amount, Field, FieldLabel, Breadcrumb, NotificationList } from './shared';
import RequestModal from './RequestModal';

export default function ConfirmationPage() {
  const { lastSubmitted, setView } = useRefund();
  const [modalOpen, setModalOpen] = useState(false);
  if (!lastSubmitted) return null;
  const customer = CUSTOMERS[lastSubmitted.customer];

  return (
    <Stack gap="lg">
      <div>
        <Breadcrumb current="Request submitted" onBack={() => setView('home')} />
        <Title order={1} mt={4} id="page-heading" tabIndex={-1}>
          Request submitted to the OCFO
        </Title>
      </div>

      <Paper withBorder radius="sm" p="lg">
        <FieldLabel>Request ID</FieldLabel>
        <Mono fz={32} fw={500}>
          {lastSubmitted.id}
        </Mono>
        <Text mt={6} maw={640}>
          Submitted {fmtDateTime(lastSubmitted.submittedAt)}. This ID identifies the request through
          OCFO review and final disposition; use it in any correspondence.
        </Text>

        <Divider my="md" />
        <Group gap="xl" wrap="wrap" align="flex-start">
          <Field label="Status">
            <StatusBadge status={lastSubmitted.status} />
          </Field>
          <Field label="Customer">
            <Text inherit>{customer.name}</Text>
            <Text inherit c="dimmed">
              Customer ID <Mono fz={13} c="inherit">{customer.id}</Mono>
            </Text>
          </Field>
          <Field label="Fees">{lastSubmitted.fees.length}</Field>
          <Field label="Total refund">
            <Amount cents={lastSubmitted.total} fw={600} />
          </Field>
        </Group>
        <Divider my="md" />

        <Title order={2} fz="md" mb="xs">
          {enoteTitle({ notified: lastSubmitted.notifications })}
        </Title>
        <NotificationList notifications={lastSubmitted.notifications} />

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
