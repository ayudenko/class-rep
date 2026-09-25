import {createRoot} from 'react-dom/client';
import {SessionProvider} from './core/session';
import App from './core/App';
import './core/styles.css';
createRoot(document.getElementById('root')!).render(<SessionProvider><App/></SessionProvider>);
