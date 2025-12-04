import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './LoadingBar.css';

/**
 * Global loading bar that appears during route transitions
 * Shows progress animation at the top of the page
 */
function LoadingBar() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const location = useLocation();

  useEffect(() => {
    // Start loading on route change
    setLoading(true);
    setProgress(20);

    // Simulate progress
    const timer1 = setTimeout(() => setProgress(40), 100);
    const timer2 = setTimeout(() => setProgress(60), 200);
    const timer3 = setTimeout(() => setProgress(80), 300);
    
    // Complete loading
    const timer4 = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 200);
    }, 500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [location.pathname]);

  if (!loading && progress === 0) return null;

  return (
    <div className="loading-bar-container">
      <div 
        className="loading-bar"
        style={{ 
          width: `${progress}%`,
          opacity: loading ? 1 : 0
        }}
      />
    </div>
  );
}

export default LoadingBar;
