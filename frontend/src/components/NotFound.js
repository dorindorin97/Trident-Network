import React from 'react';
import { useTranslation } from 'react-i18next';

function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="container">
      <h2>{t('Not Found')}</h2>
      <p>{t('The requested page could not be found.')}</p>
    </div>
  );
}

export default NotFound;
