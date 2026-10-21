import { Button, Group, Paper, Select, Stack, Text, Textarea, Title } from '@mantine/core';
import { useRefund } from '../state/RefundContext';
import { JUSTIFICATIONS } from '../data/mockData';
import {
  amountValid,
  justificationValid,
  justificationDefinition,
  remarkValid,
  remitterValid,
  step2Valid,
} from '../lib/selectors';
import { Amount, Chevron, DisabledHint, IncompleteLabel } from './shared';
import FeeCard from './FeeCard';

export default function Step2Details() {
  const { draft, fees, total, setJustification, setRemark, setStep } = useRefund();
  const canContinue = step2Valid(draft);
  const justOk = justificationValid(draft);
  const remarkOk = remarkValid(draft);
  const reasonOk = justOk && remarkOk;

  const missing = [
    ...fees.filter((f) => !amountValid(f, draft)).map((f) => `fix the refund amount for ${f.desc}`),
    ...fees.filter((f) => !remitterValid(f, draft)).map((f) => `add the remitter for ${f.desc}`),
    ...(justOk ? [] : ['choose a justification']),
    ...(remarkOk ? [] : ['add a requester remark']),
  ];

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
        style={reasonOk ? undefined : { borderColor: 'var(--border-warning)' }}
      >
        <Group justify="space-between" p="md" wrap="wrap">
          <Group gap="sm" align="baseline">
            <Title order={2} fz="lg">
              Reason for this request
            </Title>
            {!reasonOk && <IncompleteLabel />}
          </Group>
          <Text fz="sm" c="dimmed">
            One justification and remark cover every fee in the request.
          </Text>
        </Group>
        <Stack p="md" pt={0} gap="sm">
          <Select
            label="Justification"
            placeholder="Select a reason"
            required
            data={JUSTIFICATIONS}
            value={draft.justification.code}
            onChange={(code) => setJustification({ code })}
            maw={320}
          />
          {/* The definition is recorded with the request, so show what the analyst is choosing. */}
          {draft.justification.code && (
            <Text fz="sm" c="dimmed" className="readable" mt={-4}>
              Definition: {justificationDefinition(draft.justification)}
            </Text>
          )}
          {/* Required on every request, whatever the justification; for "Other" it is also where
              the analyst explains the reason. */}
          <Textarea
            label="Requester Remark"
            description="A short summary of what is being refunded and why."
            required
            autosize
            minRows={3}
            maw={640}
            value={draft.remark}
            onChange={(e) => setRemark(e.currentTarget.value)}
          />
        </Stack>
      </Paper>

      <Group justify="space-between" align="flex-start" wrap="wrap">
        <Text>
          <Text component="span" fw={600}>
            {fees.length}
          </Text>{' '}
          fee{fees.length === 1 ? '' : 's'}, total refund <Amount cents={total} fw={600} />
        </Text>
        <Stack gap={4} align="flex-end" maw={520}>
          <Group gap="xs">
            <Button variant="default" onClick={() => setStep(1)} leftSection={<Chevron dir="left" />}>
              Back to fees
            </Button>
            <Button disabled={!canContinue} onClick={() => setStep(3)} rightSection={<Chevron />}>
              Continue to review
            </Button>
          </Group>
          <DisabledHint items={missing} />
        </Stack>
      </Group>
    </>
  );
}
