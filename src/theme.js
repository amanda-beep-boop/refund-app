import { createTheme } from '@mantine/core';

// POC palette. Swap for the product design system's tokens at implementation time.
export const theme = createTheme({
  fontFamily: "'Source Sans 3', 'Source Sans Pro', system-ui, -apple-system, sans-serif",
  fontFamilyMonospace: "'IBM Plex Mono', ui-monospace, Menlo, Consolas, monospace",
  headings: {
    fontFamily: "'Source Sans 3', 'Source Sans Pro', system-ui, sans-serif",
    fontWeight: '600',
  },
  primaryColor: 'ocfo',
  primaryShade: 9,
  colors: {
    ocfo: [
      '#E3EFF2',
      '#D0E4E9',
      '#A8CDD6',
      '#7FB6C3',
      '#5BA3B3',
      '#4295A7',
      '#348D9F',
      '#22798B',
      '#156A7B',
      '#0F5C6E',
    ],
  },
  defaultRadius: 'sm',
});

// Status display metadata shared across the history table, modal, and confirmation.
export const STATUS_META = {
  draft: { label: 'Draft', color: 'gray' },
  submitted: { label: 'Submitted to OCFO', color: 'blue' },
  review: { label: 'Under OCFO review', color: 'yellow' },
  approved: { label: 'Approved', color: 'green' },
  returned: { label: 'Returned for correction', color: 'red' },
};
