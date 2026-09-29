import { Container } from '@mantine/core';
import { useRefund } from './state/RefundContext';
import HomePage from './components/HomePage';
import FlowPage from './components/FlowPage';
import ConfirmationPage from './components/ConfirmationPage';

export default function App() {
  const { view } = useRefund();
  return (
    <Container size={1120} py="xl">
      {view === 'home' && <HomePage />}
      {view === 'flow' && <FlowPage />}
      {view === 'confirm' && <ConfirmationPage />}
    </Container>
  );
}
