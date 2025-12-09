import { useUIStore } from './stores/ui';
import { ConnectionScreen } from './features/connection';
import { ChatScreen } from './features/chat';
import { SettingsScreen } from './features/settings';
import { Layout } from './features/layout';
import { Tooltip } from './features/ui/tooltip';

const SCREENS = {
  "chat": ChatScreen,
  "settings": SettingsScreen,
  "connection": ConnectionScreen,
}

function App() {
  const { currentScreen } = useUIStore();
  const ScreenComponent = SCREENS[currentScreen];

  return <><Layout><ScreenComponent /></Layout><Tooltip /></>;
}

export default App;
