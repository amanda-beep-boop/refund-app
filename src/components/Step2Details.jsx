import { Button, Group, Paper, Select, Stack, Text, Textarea, Title } from '@mantine/core';
import { useRefund } from '../state/RefundContext';
import { JUSTIFICATIONS } from '../data/mockData';
import { fmt } from '../lib/format';
import { justificationValid, step2Valid } from '../lib/selectors';
import { Mono } from './shared';
import FeeCard from './FeeCard';

export default function Step2Details() {
  const { draft, fees, total, setJustification, setStep } = useRefund();
  const canContinue = step2Valid(draft);
  const justOk = justificationValid(draft);

  return (
    <>
      <Text c="dimmed" mt={-8} maw={640}>
        Confirm the refund amount and the remitter for each fee. Remitter details come from the
        original payment record; change them only if the record is wrong.
      </Text>

      {fees.map((fee) => (
        <FeeCard key={fee.id} fee={fee} />
      ))}

      <Paper
        withBorder
        radius="sm"
        style={justOk ? undefined : { borderColor: 'var(--mantine-color-yellow-6)' }}
      >
        <Group justify="space-between" p="md" wrap="wrap">
          <Title order={2} fz="lg">
            Reason for this request
          </Title>
          <Text fz="sm" c="dimmed">
            One justification covers every fee in the request.
          </Text>
        </Group>
        <Stack p="md" pt={0} gap="sm">
          <Select
            label="Justification"
            placeholder="Select a reason…"
            required
            data={JUSTIFICATIONS}
            value={draft.justification.code}
            onChange={(code) => setJustification({ code })}
            maw={320}
          />
          {draft.justification.code === 'other' && (
            <Textarea
              label="Describe the reason"
              placeholder="Why should these fees be refunded?"
              required
              autosize
              minRows={3}
              value={draft.justification.text}
              onChange={(e) => setJustification({ text: e.currentTarget.value })}
            />
          )}
        </Stack>
      </Paper>

      <Group justify="space-between" wrap="wrap">
        <Text c="dimmed">
          <Text component="span" fw={600} c="dark">
            {fees.length}
          </Text>{' '}
          fee{fees.length === 1 ? '' : 's'} · total refund{' '}
          <Mono fw={600} c="dark">
            {fmt(total)}
          </Mono>
        </Text>
        <Group gap="xs">
          <Button variant="default" onClick={() => setStep(1)}>
            ← Back to fees
          </Button>
          <Button disabled={!canContinue} onClick={() => setStep(3)}>
            Continue to review →
          </Button>
        </Group>
      </Group>
    </>
  );
}
