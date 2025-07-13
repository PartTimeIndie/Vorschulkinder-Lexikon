import '../styles/globals.css';
import FaviconManager from '../components/FaviconManager';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <FaviconManager />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp; 