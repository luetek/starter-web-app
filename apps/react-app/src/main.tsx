import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { commonModels } from '@luetek/common-models';
import App from './app/app';

// eslint-disable-next-line no-console
console.log(commonModels());
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
