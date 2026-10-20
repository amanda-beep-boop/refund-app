import { useState } from 'react';
import {
  Button,
  Card,
  Code,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useRefund } from '../state/RefundContext';
import { CUSTOMERS } from '../data/mockData';
import { accountAge, fmtDate } from '../lib/format';
import { Mono } from './shared';

export default function CustomerSearch() {
  const { startDraft } = useRefund();
  const [query, setQuery] = useState('');
  // undefined = no search yet; null = no match; object = found customer
  const [result, setResult] = useState(undefined);

  const search = (e) => {
    e.preventDefault();
    const id = query.trim().toUpperCase();
    setResult(id ? CUSTOMERS[id] || null : undefined);
  };

  return (
    <Paper withBorder radius="sm" p="lg">
      <Title order={2} fz="lg" mb="md">
        Start a new refund request
      </Title>
      <form onSubmit={search}>
        <Group align="flex-end" gap="sm">
          <TextInput
            label="Customer ID"
            placeholder="Search by customer ID"
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
            ff="monospace"
            style={{ flex: 1, minWidth: 220 }}
          />
          <Button type="submit">Search</Button>
        </Group>
      </form>
      <Text fz="sm" c="var(--text-secondary)" mt="xs">
        Sample accounts: <Code>C-104822</Code>, <Code>C-220917</Code>, <Code>C-301550</Code>
      </Text>

      {result === null && (
        <Paper withBorder radius="sm" p="md" mt="md" style={{ borderStyle: 'dashed' }}>
          <Text c="var(--text-secondary)">
            No account matches <Mono>{query.trim().toUpperCase()}</Mono>. Check the ID and try
            again.
          </Text>
        </Paper>
      )}

      {result && (
        <Card withBorder radius="sm" p="lg" mt="md">
          <Group justify="space-between" align="center" wrap="wrap">
            <Stack gap="xs" style={{ flex: 1, minWidth: 260 }}>
              <Group gap="xs" align="baseline">
                <Text fz="lg" fw={600}>
                  {result.name}
                </Text>
                <Mono c="var(--text-secondary)">{result.id}</Mono>
              </Group>
              <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
                <InfoCell label="Team" value={result.team} />
                <InfoCell label="Position" value={result.position} />
                <InfoCell
                  label="Account age"
                  value={`${accountAge(result.accountOpened)} (since ${fmtDate(result.accountOpened)})`}
                />
                <InfoCell label="Fees on file" value={String(result.fees.length)} />
              </SimpleGrid>
            </Stack>
            <Button onClick={() => startDraft(result.id)}>Start refund request →</Button>
          </Group>
        </Card>
      )}
    </Paper>
  );
}

const InfoCell = ({ label, value }) => (
  <div>
    <Text fz="xs" tt="uppercase" c="var(--text-tertiary)" fw={600} lts="0.05em">
      {label}
    </Text>
    <Text fw={500}>{value}</Text>
  </div>
);
