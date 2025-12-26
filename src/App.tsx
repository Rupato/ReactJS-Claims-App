import { BrowserRouter } from 'react-router-dom';
import ClaimsDashboard from './features/claims-management/components/ClaimsDashboard';

function App() {
  return (
    <BrowserRouter>
      <ClaimsDashboard />
    </BrowserRouter>
  );
}

export default App;
