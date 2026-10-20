import { Alert, Button, Group, Stack, Text, Title, Divider } from '@mantine/core';
import { useRefund } from '../state/RefundContext';
import { CUSTOMERS } from '../data/mockData';
import { Mono } from './shared';
import CustomerSearch from './CustomerSearch';
import HistoryTable from './HistoryTable';

export default function HomePage() {
  const { draft, resumeDraft, discardDraft } = useRefund();
  const draftCustomer = draft ? CUSTOMERS[draft.customer] : null;

  return (
    <Stack gap="lg">
      <div>
        <Title order={1}>Fee Refund Requests</Title>
        <Text c="var(--text-secondary)" mt={6} maw={640}>
          Look up a customer account, select the fees eligible for refund, and submit a refund
          request to the Office of the Chief Financial Officer (OCFO) for review. Every request you
          have submitted, with its current status, is listed below.
        </Text>
      </div>
      <Divider />

      {draft ? (
        <Alert color="yellow" variant="light" radius="sm">
          <Group justify="space-between" wrap="wrap">
            <Text>
              <Text component="span" fw={600}>
                You have a draft in progress
              </Text>{' '}
              for {draftCustomer.name} (<Mono>{draft.customer}</Mono>). Finish or discard it before
              starting a new request.
            </Text>
            <Group gap="xs">
              <Button size="xs" color="red" variant="subtle" onClick={discardDraft}>
                Discard draft
              </Button>
              <Button size="xs" onClick={resumeDraft}>
                Resume draft
              </Button>
            </Group>
          </Group>
        </Alert>
      ) : (
        <CustomerSearch />
      )}

      <HistoryTable />
    </Stack>
  );
}
