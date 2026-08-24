import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import './main.css';
import './components/common/variables.css';
import App from './App.jsx';
import {
  queryClient,
  queryPersister,
} from './utils/TanStackUtils/queryClient.js';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister: queryPersister }}
      >
        <App />
      </PersistQueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
);
