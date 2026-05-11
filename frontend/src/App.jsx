import { useRoutes } from 'react-router-dom';
import { getRoutes } from './routes';

function App() {
  const routing = useRoutes(getRoutes());
  console.log(routing);
  return routing;
}

export default App;
