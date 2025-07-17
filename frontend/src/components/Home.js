import React from 'react';
import { useTranslation } from 'react-i18next';
import LatestBlock from './LatestBlock';
import BlockHistory from './BlockHistory';

function Home() {
  const { t } = useTranslation();
  return (
    <div className="container">
      <p className="warning">{t('This explorer is connected to a testnet. Do not use real assets.')}</p>
      <LatestBlock />
      <BlockHistory />
    </div>
  );
}

export default Home;
