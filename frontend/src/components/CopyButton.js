import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

function CopyButton({ value }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button 
      onClick={handleCopy} 
      className="ml-sm" 
      title={copied ? t('Copied!') : t('Copy')}
      disabled={copied}
    >
      {copied ? t('Copied!') : t('Copy')}
    </button>
  );
}

CopyButton.propTypes = {
  value: PropTypes.string.isRequired
};

export default CopyButton;
