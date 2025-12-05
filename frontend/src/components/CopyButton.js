import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { useToast } from './Toast';

function CopyButton({ value }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(t('Copied to clipboard!'), 2000);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error(t('Failed to copy'), 3000);
      setCopied(false);
    }
  };

  return (
    <button 
      onClick={handleCopy} 
      className="ml-sm" 
      title={copied ? t('Copied!') : t('Copy')}
      disabled={copied}
    >
      {copied ? '✓' : t('Copy')}
    </button>
  );
}

CopyButton.propTypes = {
  value: PropTypes.string.isRequired
};

export default React.memo(CopyButton);
