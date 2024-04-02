// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Container from 'react-bootstrap/esm/Container';
import { Outlet } from 'react-router-dom';
import { AppFooter } from './layout/footer';
import { AppHeader } from './layout/header';

function AppContent() {
  return (
    <div className="app-page-content">
      <Container>
        <Outlet />
      </Container>
    </div>
  );
}

export function App() {
  return (
    <>
      <AppHeader />
      <AppContent />
      <AppFooter />
    </>
  );
}

export default App;
