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
import { Mono, RemitterSourceBadge, LumpSumBadge } from './shared';

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
      style={invalid ? { borderColor: 'var(--mantine-color-yellow-6)' } : undefined}
    >
      <Group justify="space-between" p="md" wrap="wrap" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
        <Group gap={8} align="baseline">
          <Text fw={600}>{fee.desc}</Text>
          {fee.items && <LumpSumBadge />}
          <Mono c="var(--text-tertiary)" fz="xs">
            {fee.id}
          </Mono>
        </Group>
        <Text fz="sm" c="var(--text-secondary)">
          Paid {fmtDate(fee.date)} · {fee.method}
          {fee.card !== '—' ? ` ${fee.card}` : ''} ·{' '}
          <Mono fw={600} c="dark">
            {fmt(fee.cents)}
          </Mono>
        </Text>
      </Group>

      <Group p="md" gap="xl" align="flex-start" wrap="wrap">
        {/* Refund amount */}
        <Stack gap="xs" style={{ flex: '1 1 240px', minWidth: 240 }}>
          <Text fz="xs" tt="uppercase" c="var(--text-tertiary)" fw={600} lts="0.05em">
            Refund amount
          </Text>
          <Group gap="sm">
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
              w={130}
              error={!amountOk}
              aria-label={`Refund amount for ${fee.desc}`}
            />
          </Group>
          {!amountOk && (
            <Text fz="sm" c="red">
              Enter an amount between $0.01 and {fmt(fee.cents)}.
            </Text>
          )}
          {partial && amountOk && (
            <Text fz="sm" c="var(--text-secondary)">
              Refunding {fmt(refundCents(fee, draft))} of {fmt(fee.cents)}
            </Text>
          )}
        </Stack>

        {/* Remit to */}
        <Stack gap="xs" style={{ flex: '1.5 1 300px', minWidth: 280 }}>
          <Text fz="xs" tt="uppercase" c="var(--text-tertiary)" fw={600} lts="0.05em">
            Remit to
          </Text>

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
                <RemitterSourceBadge source={source} />
                <Button
                  size="xs"
                  variant="default"
                  disabled={!remitterOk}
                  onClick={() => setRemitter(fee.id, { editing: false, touched: true })}
                >
                  Done
                </Button>
                {fee.remitter && source !== 'record' && (
                  <Button size="xs" variant="subtle" onClick={() => restoreRemitter(fee)}>
                    Restore record
                  </Button>
                )}
                {fee.remitter && source === 'record' && (
                  <Button
                    size="xs"
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
            </Stack>
          ) : (
            <Stack gap="xs">
              <div>
                <Text fw={600}>{remitter.name}</Text>
                <Text>{remitter.address}</Text>
                <Text fz="sm" c="var(--text-secondary)">
                  {methodLabel(fee, remitter.method)}
                </Text>
              </div>
              <Group gap="xs">
                <RemitterSourceBadge source={source} />
                <Button
                  size="xs"
                  variant="default"
                  onClick={() => setRemitter(fee.id, { editing: true })}
                >
                  Change
                </Button>
                {source === 'customized' && (
                  <Button size="xs" variant="subtle" onClick={() => restoreRemitter(fee)}>
                    Restore record
                  </Button>
                )}
              </Group>
            </Stack>
          )}
        </Stack>
      </Group>
    </Paper>
  );
}
