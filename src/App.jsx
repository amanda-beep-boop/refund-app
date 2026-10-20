import { useEffect, useRef } from 'react';
import { Box, Container, Text } from '@mantine/core';
import { useRefund } from './state/RefundContext';
import HomePage from './components/HomePage';
import FlowPage, { STEP_TITLES } from './components/FlowPage';
import ConfirmationPage from './components/ConfirmationPage';

const APP_NAME = 'Fee Refund Requests';

export default function App() {
  const { view, step } = useRefund();
  const firstRender = useRef(true);

  // A view or step change replaces the page content, so retitle the document and move focus
  // to the new heading. Screen readers then announce where the user landed.
  useEffect(() => {
    const page =
      view === 'flow'
        ? `Step ${step} of ${STEP_TITLES.length}: ${STEP_TITLES[step - 1]}`
        : view === 'confirm'
          ? 'Request submitted'
          : null;
    document.title = page ? `${page} – ${APP_NAME}` : APP_NAME;

    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo(0, 0);
    document.getElementById('page-heading')?.focus();
  }, [view, step]);

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <Box component="header" bg="var(--mantine-color-body)" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <Container size={1120} py="sm">
          <Text fw={600}>{APP_NAME}</Text>
        </Container>
      </Box>
      <Container component="main" id="main-content" tabIndex={-1} size={1120} py="xl" style={{ outline: 'none' }}>
        {view === 'home' && <HomePage />}
        {view === 'flow' && <FlowPage />}
        {view === 'confirm' && <ConfirmationPage />}
      </Container>
    </>
  );
}
