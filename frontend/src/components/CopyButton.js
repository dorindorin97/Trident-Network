import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

function CopyButton({ value }) {
  const { t } = useTranslation();
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
  };
  return (
    <button onClick={handleCopy} className="ml-sm" title={t('Copy')}>
      {t('Copy')}
    </button>
  );
}

CopyButton.propTypes = {
  value: PropTypes.string.isRequired
};

export default CopyButton;
