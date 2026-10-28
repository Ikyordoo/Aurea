/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LifeOSProvider } from './context/LifeOSContext';
import { AppShell } from './components/AppShell';

export default function App() {
  return (
    <LifeOSProvider>
      <AppShell />
    </LifeOSProvider>
  );
}
