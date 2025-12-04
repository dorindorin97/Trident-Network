import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Spinner from './Spinner';
import CopyButton from './CopyButton';
import { fetchApi, getErrorMessage } from '../apiUtils';
import { API_BASE_PATH } from '../config';

function BlockDetails() {
  const { t } = useTranslation();
  const { number } = useParams();
  const [block, setBlock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlock = async () => {
      setLoading(true);
      try {
        const endpoint = number.startsWith('0x') ?
          `${API_BASE_PATH}/blocks/hash/${number}` :
          `${API_BASE_PATH}/blocks/${number}`;
        const data = await fetchApi(endpoint);
        setBlock(data);
        setError(null);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchBlock();
  }, [number]);

  if (loading) return <Spinner />;
  if (error || !block) return <p className="error">{error || t('Block not found')}</p>;

  return (
    <div className="container">
      <h2>{t('Block')} {block.number}</h2>
      <p>{t('Hash')}: {block.hash}</p>
      <p>{t('Validator')}: {block.validator}</p>
      <p>{t('Timestamp')}: {block.timestamp}</p>
      <h4>{t('Transactions')}</h4>
      <table className="full-width">
        <thead>
          <tr>
            <th>{t('TxID')}</th>
            <th>{t('From')}</th>
            <th>{t('To')}</th>
            <th>{t('Amount')}</th>
            <th>{t('Timestamp')}</th>
          </tr>
        </thead>
        <tbody>
          {block.transactions.map(tx => (
            <tr key={tx.txId}>
              <td>
                <Link to={`/tx/${tx.txId}`}>{tx.txId}</Link>
                <CopyButton value={tx.txId} />
              </td>
              <td>
                <Link to={`/account/${tx.from}`}>{tx.from}</Link>
                <CopyButton value={tx.from} />
              </td>
              <td>
                <Link to={`/account/${tx.to}`}>{tx.to}</Link>
                <CopyButton value={tx.to} />
              </td>
              <td>{tx.amount}</td>
              <td>{tx.timestamp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default BlockDetails;
