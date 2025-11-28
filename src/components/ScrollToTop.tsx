import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Koristi requestAnimationFrame za bolju kompatibilnost na mobilnim uređajima
    requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });
    });
  }, [pathname]);

  // Handle back/forward navigaciju (popstate)
  useEffect(() => {
    const handlePopState = () => {
      // Mali delay za mobilne uređaje
      setTimeout(() => {
        requestAnimationFrame(() => {
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        });
      }, 0);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return null;
};

export default ScrollToTop;
