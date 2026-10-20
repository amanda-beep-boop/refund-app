import { alpha, createTheme, DEFAULT_THEME } from '@mantine/core';

// Text and status colors, each checked for at least 4.5:1 contrast (WCAG 2.1 AA) against
// white, gray.0, and ocfo.0 backgrounds.
const TEXT = {
  secondary: '#4F5966',
  tertiary: '#5F6975', // labels, hints, table headers, uppercase labels, placeholders
};
const STATUS_TEXT = {
  approved: '#196F45',
  review: '#9A5500', // Mantine's yellow text is under 3:1 on its light background
};

// POC palette. Swap for the product design system's tokens at implementation time.
export const theme = createTheme({
  fontFamily: "'Source Sans 3', 'Source Sans Pro', system-ui, -apple-system, sans-serif",
  fontFamilyMonospace: "'IBM Plex Mono', ui-monospace, Menlo, Consolas, monospace",
  headings: {
    fontFamily: "'Source Sans 3', 'Source Sans Pro', system-ui, sans-serif",
    fontWeight: '600',
  },
  primaryColor: 'ocfo',
  primaryShade: 6,
  colors: {
    ocfo: [
      '#E8F3FB',
      '#C1DDF0',
      '#9BC8E6',
      '#74B2DB',
      '#4D9CD0',
      '#2787C6',
      '#0071BB', // primary
      '#005A96', // hover
      '#004574',
      '#003559',
    ],
  },
  other: { text: TEXT, statusText: STATUS_TEXT },
  defaultRadius: 'sm',
});

// primaryShade applies to every color. Keep the non-primary colors on shade 9 (the
// previous primaryShade) so red/blue/yellow text keeps its contrast, and use the
// palette's lightest tint for primary light backgrounds and quiet-button hovers.
export const cssVariablesResolver = (t) => {
  const light = {
    '--mantine-color-ocfo-light': t.colors.ocfo[0],
    '--mantine-color-ocfo-light-hover': t.colors.ocfo[0],
    '--mantine-color-dimmed': TEXT.secondary,
    '--mantine-color-placeholder': TEXT.tertiary,
    '--text-secondary': TEXT.secondary,
    '--text-tertiary': TEXT.tertiary,
  };
  Object.keys(DEFAULT_THEME.colors).forEach((name) => {
    const nine = t.colors[name][9];
    Object.assign(light, {
      [`--mantine-color-${name}-filled`]: `var(--mantine-color-${name}-9)`,
      [`--mantine-color-${name}-filled-hover`]: `var(--mantine-color-${name}-8)`,
      [`--mantine-color-${name}-light`]: alpha(nine, 0.1),
      [`--mantine-color-${name}-light-hover`]: alpha(nine, 0.12),
      [`--mantine-color-${name}-light-color`]: `var(--mantine-color-${name}-9)`,
      [`--mantine-color-${name}-outline`]: `var(--mantine-color-${name}-9)`,
      [`--mantine-color-${name}-outline-hover`]: alpha(nine, 0.05),
    });
  });
  light['--mantine-color-yellow-light-color'] = STATUS_TEXT.review;
  return { variables: {}, light, dark: {} };
};

// Status display metadata shared across the history table, modal, and confirmation.
export const STATUS_META = {
  draft: { label: 'Draft', color: 'gray' },
  submitted: { label: 'Submitted to OCFO', color: 'blue' },
  review: { label: 'Under OCFO review', color: 'yellow' },
  approved: { label: 'Approved', color: STATUS_TEXT.approved },
  returned: { label: 'Returned for correction', color: 'red' },
};
