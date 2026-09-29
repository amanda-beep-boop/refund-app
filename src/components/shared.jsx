import { Badge, Text } from '@mantine/core';
import { STATUS_META } from '../theme';

export const StatusBadge = ({ status }) => (
  <Badge variant="light" color={STATUS_META[status].color} radius="xl" size="lg" fw={600}>
    {STATUS_META[status].label}
  </Badge>
);

export const Mono = ({ children, ...props }) => (
  <Text component="span" ff="monospace" fz="sm" {...props}>
    {children}
  </Text>
);

// Badge describing where a fee's remitter came from.
export const RemitterSourceBadge = ({ source }) => {
  if (source === 'record')
    return (
      <Badge variant="light" color="gray" radius="sm">
        From payment record
      </Badge>
    );
  if (source === 'manual')
    return (
      <Badge variant="light" color="blue" radius="sm">
        Entered manually
      </Badge>
    );
  return (
    <Badge variant="light" color="yellow" radius="sm">
      Changed from payment record
    </Badge>
  );
};

export const LumpSumBadge = ({ count }) => (
  <Badge variant="light" color="yellow" radius="sm">
    Lump sum{count ? ` · ${count} items` : ''}
  </Badge>
);
