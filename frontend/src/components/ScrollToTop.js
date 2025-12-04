import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './ScrollToTop.css';

/**
 * Scroll to top button
 * Appears when user scrolls down the page
 */
function ScrollToTop() {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when page is scrolled down 300px
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) return null;

  return (
    <button
      className="scroll-to-top"
      onClick={scrollToTop}
      title={t('Scroll to top')}
      aria-label={t('Scroll to top')}
    >
      ↑
    </button>
  );
}

export default ScrollToTop;
