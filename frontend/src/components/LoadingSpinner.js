import React from 'react';
import PropTypes from 'prop-types';
import './LoadingSpinner.css';

function LoadingSpinner({ message, size = 'medium' }) {
  const sizeClass = `spinner-${size}`;
  
  return (
    <div className="loading-container">
      <div className={`spinner ${sizeClass}`} />
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
}

LoadingSpinner.propTypes = {
  message: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large'])
};

export default LoadingSpinner;
