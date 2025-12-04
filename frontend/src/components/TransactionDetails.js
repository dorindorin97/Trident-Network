import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Spinner from './Spinner';
import CopyButton from './CopyButton';
import { QRCodeButton } from './QRCodeModal';
import { fetchApi, getErrorMessage } from '../apiUtils';
import { API_BASE_PATH } from '../config';

function TransactionDetails() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [tx, setTx] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransaction = async () => {
      setLoading(true);
      try {
        const data = await fetchApi(`${API_BASE_PATH}/transactions/${id}`);
        setTx(data);
        setError(null);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchTransaction();
  }, [id]);

  if (loading) return <Spinner />;
  if (error || !tx) return <p className="error">{error || t('Transaction not found')}</p>;

  return (
    <div className="container">
      <h2>
        {t('Transaction Details')}
        <CopyButton value={tx.txId} />
        <QRCodeButton value={tx.txId} label="Transaction" />
      </h2>
      <p>{t('TxID')}: {tx.txId}</p>
      <p>
        {t('From')}: <Link to={`/account/${tx.from}`}>{tx.from}</Link>
        <CopyButton value={tx.from} />
        <QRCodeButton value={tx.from} label="From Address" />
      </p>
      <p>
        {t('To')}: <Link to={`/account/${tx.to}`}>{tx.to}</Link>
        <CopyButton value={tx.to} />
        <QRCodeButton value={tx.to} label="To Address" />
      </p>
      <p>{t('Amount')}: {tx.amount}</p>
      {tx.blockNumber && <p>{t('Block')}: <Link to={`/block/${tx.blockNumber}`}>{tx.blockNumber}</Link></p>}
      <p>{t('Timestamp')}: {tx.timestamp}</p>
    </div>
  );
}

export default TransactionDetails;
