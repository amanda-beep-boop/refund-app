import { Button, Divider, Group, Paper, Stack, Stepper, Text, Title } from '@mantine/core';
import { useRefund } from '../state/RefundContext';
import { accountAge, fmtDate } from '../lib/format';
import { Mono, Field, Breadcrumb, DiscardDraftButton } from './shared';
import Step1SelectFees from './Step1SelectFees';
import Step2Details from './Step2Details';
import Step3Review from './Step3Review';

export const STEP_TITLES = ['Select fees', 'Confirm details', 'Review & submit'];

export default function FlowPage() {
  const { step, customer, saveAndExit } = useRefund();

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-start" wrap="wrap">
        <div>
          <Breadcrumb current="New request" onBack={saveAndExit} />
          <Text fz="sm" fw={600} c="dimmed" mt={4}>
            Step {step} of {STEP_TITLES.length}
          </Text>
          <Title order={1} id="page-heading" tabIndex={-1}>
            {STEP_TITLES[step - 1]}
          </Title>
        </div>
        <Group gap="xs">
          <Button variant="subtle" onClick={saveAndExit}>
            Save draft &amp; exit
          </Button>
          <DiscardDraftButton />
        </Group>
      </Group>
      <Divider />

      {/* The step count is in the text above; the stepper is a visual summary. */}
      <Stepper active={step - 1} size="sm" allowNextStepsSelect={false} aria-hidden="true">
        {STEP_TITLES.map((title) => (
          <Stepper.Step key={title} label={title} />
        ))}
      </Stepper>

      <Paper bg="brand.0" radius="sm" p="md">
        <dl className="field-grid">
          <Field label="Customer">
            <Text inherit>{customer.name}</Text>
            <Text inherit c="dimmed">
              Customer ID <Mono fz={13} c="inherit">{customer.id}</Mono>
            </Text>
          </Field>
          <Field label="Team">{customer.team}</Field>
          <Field label="Position">{customer.position}</Field>
          <Field label="Account age">
            <Text inherit>{accountAge(customer.accountOpened)}</Text>
            <Text inherit c="dimmed">
              Since {fmtDate(customer.accountOpened)}
            </Text>
          </Field>
        </dl>
      </Paper>

      {step === 1 && <Step1SelectFees />}
      {step === 2 && <Step2Details />}
      {step === 3 && <Step3Review />}
    </Stack>
  );
}
