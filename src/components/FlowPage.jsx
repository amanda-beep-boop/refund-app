import { Button, Divider, Group, Paper, SimpleGrid, Stack, Stepper, Text, Title } from '@mantine/core';
import { useRefund } from '../state/RefundContext';
import { accountAge } from '../lib/format';
import { Mono } from './shared';
import Step1SelectFees from './Step1SelectFees';
import Step2Details from './Step2Details';
import Step3Review from './Step3Review';

const STEP_TITLES = ['Select fees', 'Confirm details', 'Review & submit'];

export default function FlowPage() {
  const { step, customer, saveAndExit, discardDraft } = useRefund();

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-start" wrap="wrap">
        <div>
          <Text fz="sm" c="var(--text-secondary)">
            Fee Refund Requests /{' '}
            <Text component="span" fw={500} c="dark.3">
              New request
            </Text>
          </Text>
          <Title order={1} mt={4}>
            {STEP_TITLES[step - 1]}
          </Title>
        </div>
        <Group gap="xs">
          <Button variant="subtle" onClick={saveAndExit}>
            Save draft &amp; exit
          </Button>
          <Button variant="subtle" color="red" onClick={discardDraft}>
            Discard
          </Button>
        </Group>
      </Group>
      <Divider />

      <Stepper active={step - 1} size="sm" allowNextStepsSelect={false}>
        {STEP_TITLES.map((title) => (
          <Stepper.Step key={title} label={title} />
        ))}
      </Stepper>

      <Paper bg="ocfo.0" radius="sm" p="md">
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
          <ContextCell label="Customer">
            {customer.name} <Mono>{customer.id}</Mono>
          </ContextCell>
          <ContextCell label="Team">{customer.team}</ContextCell>
          <ContextCell label="Position">{customer.position}</ContextCell>
          <ContextCell label="Account age">{accountAge(customer.accountOpened)}</ContextCell>
        </SimpleGrid>
      </Paper>

      {step === 1 && <Step1SelectFees />}
      {step === 2 && <Step2Details />}
      {step === 3 && <Step3Review />}
    </Stack>
  );
}

const ContextCell = ({ label, children }) => (
  <div>
    <Text fz="xs" tt="uppercase" c="var(--text-tertiary)" fw={600} lts="0.05em">
      {label}
    </Text>
    <Text>{children}</Text>
  </div>
);
