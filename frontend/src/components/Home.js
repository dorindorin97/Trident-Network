import React from 'react';
import LatestBlock from './LatestBlock';
import BlockHistory from './BlockHistory';

function Home() {
  return (
    <div className="container">
      <LatestBlock />
      <BlockHistory />
    </div>
  );
}

export default Home;
