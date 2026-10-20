import {
  Alert,
  Button,
  Group,
  NumberInput,
  Paper,
  SegmentedControl,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useRefund } from '../state/RefundContext';
import { fmt, fmtDate, dollars, methodLabel } from '../lib/format';
import {
  amountValid,
  remitterSource,
  remitterValid,
  refundCents,
  feeValid,
} from '../lib/selectors';
import { Mono, Amount, FieldGroup, IncompleteLabel, RemitterSourceAnnotation, LumpSumAnnotation } from './shared';

export default function FeeCard({ fee }) {
  const { draft, setAmount, setRemitter, restoreRemitter } = useRefund();
  const amount = draft.amounts[fee.id];
  const remitter = draft.remitters[fee.id];
  const source = remitterSource(fee, draft);
  const partial = amount.mode === 'partial';
  const amountOk = amountValid(fee, draft);
  const remitterOk = remitterValid(fee, draft);
  const invalid = !feeValid(fee, draft);
  const showForm = remitter.editing || (source === 'manual' && !remitter.name.trim());

  const nameError = remitter.touched && !remitter.name.trim() ? "Enter the remitter's full name." : null;
  const addressError = remitter.touched && !remitter.address.trim() ? 'Enter the remittance address.' : null;

  return (
    <Paper
      withBorder
      radius="sm"
      component="section"
      aria-labelledby={`fee-${fee.id}-title`}
      style={invalid ? { borderColor: 'var(--border-warning)' } : undefined}
    >
      <Group justify="space-between" p="md" wrap="wrap" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <Group gap={8} align="baseline">
          <Title order={2} fz="md" id={`fee-${fee.id}-title`}>
            {fee.desc}
          </Title>
          {fee.items && <LumpSumAnnotation />}
          <Mono c="dimmed">{fee.id}</Mono>
          {invalid && <IncompleteLabel />}
        </Group>
        <Text fz="sm">
          Paid {fmtDate(fee.date)} · {fee.method}
          {fee.card !== '—' ? ` ${fee.card}` : ''} · <Amount cents={fee.cents} fw={600} />
        </Text>
      </Group>

      <Group p="md" gap="xl" align="flex-start" wrap="wrap">
        <FieldGroup legend="Refund amount" style={{ flex: '1 1 240px', minWidth: 240 }}>
          <Stack gap="xs">
            <Group gap="sm" align="flex-start">
              <SegmentedControl
                size="sm"
                data={[
                  { value: 'full', label: 'Full' },
                  { value: 'partial', label: 'Partial' },
                ]}
                value={amount.mode}
                onChange={(mode) =>
                  setAmount(fee.id, { mode, input: mode === 'full' ? dollars(fee.cents) : amount.input })
                }
              />
              <NumberInput
                value={partial ? amount.input : dollars(fee.cents)}
                onChange={(value) => setAmount(fee.id, { input: String(value) })}
                disabled={!partial}
                prefix="$"
                decimalScale={2}
                hideControls
                w={150}
                error={amountOk ? null : `Enter an amount between $0.01 and ${fmt(fee.cents)}.`}
                aria-label={`Refund amount for ${fee.desc}`}
              />
            </Group>
            {partial && amountOk && (
              <Text fz="sm">
                Refunding <Amount cents={refundCents(fee, draft)} /> of <Amount cents={fee.cents} />
              </Text>
            )}
          </Stack>
        </FieldGroup>

        <FieldGroup legend="Remit to" style={{ flex: '1.5 1 300px', minWidth: 280 }}>
          {showForm ? (
            <Stack gap="sm">
              {!fee.remitter ? (
                <Alert color="blue" variant="light" radius="sm" p="xs">
                  The payment record has no remitter on file. Enter who this refund should go to.
                </Alert>
              ) : (
                <Alert color="yellow" variant="light" radius="sm" p="xs">
                  Change this only if you know the payment record is wrong. The change is noted on
                  the request sent to the OCFO.
                </Alert>
              )}
              <TextInput
                label="Remittance full name"
                required
                value={remitter.name}
                onChange={(e) => setRemitter(fee.id, { name: e.currentTarget.value })}
                onBlur={() => setRemitter(fee.id, { touched: true })}
                error={nameError}
              />
              <TextInput
                label="Remittance address"
                required
                value={remitter.address}
                onChange={(e) => setRemitter(fee.id, { address: e.currentTarget.value })}
                onBlur={() => setRemitter(fee.id, { touched: true })}
                error={addressError}
              />
              <Select
                label="Refund method"
                data={[
                  { value: 'original', label: methodLabel(fee, 'original') },
                  { value: 'check', label: methodLabel(fee, 'check') },
                ]}
                value={remitter.method}
                onChange={(method) => setRemitter(fee.id, { method: method || 'original' })}
              />
              <Group gap="xs">
                <RemitterSourceAnnotation source={source} />
                <Button
                  size="sm"
                  variant="default"
                  disabled={!remitterOk}
                  onClick={() => setRemitter(fee.id, { editing: false, touched: true })}
                >
                  Done
                </Button>
                {fee.remitter && source !== 'record' && (
                  <Button size="sm" variant="subtle" onClick={() => restoreRemitter(fee)}>
                    Restore record
                  </Button>
                )}
                {fee.remitter && source === 'record' && (
                  <Button
                    size="sm"
                    variant="subtle"
                    onClick={() =>
                      setRemitter(fee.id, {
                        name: fee.remitter.name,
                        address: fee.remitter.address,
                        method: fee.remitter.method,
                        editing: false,
                      })
                    }
                  >
                    Cancel
                  </Button>
                )}
              </Group>
              {!remitterOk && (
                <Text fz="sm" c="var(--mantine-color-yellow-light-color)">
                  Enter a name and address to finish.
                </Text>
              )}
            </Stack>
          ) : (
            <Stack gap="xs">
              <div>
                <Text fw={600}>{remitter.name}</Text>
                <Text>{remitter.address}</Text>
                <Text>{methodLabel(fee, remitter.method)}</Text>
              </div>
              <Group gap="xs">
                <RemitterSourceAnnotation source={source} />
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => setRemitter(fee.id, { editing: true })}
                  aria-label={`Change remitter for ${fee.desc}`}
                >
                  Change
                </Button>
                {source === 'customized' && (
                  <Button size="sm" variant="subtle" onClick={() => restoreRemitter(fee)}>
                    Restore record
                  </Button>
                )}
              </Group>
            </Stack>
          )}
        </FieldGroup>
      </Group>
    </Paper>
  );
}
