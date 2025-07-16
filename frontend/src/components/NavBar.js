import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { parseSearch } from '../utils';

const APP_TITLE = process.env.REACT_APP_APP_TITLE || 'Trident Explorer';


function NavBar({ wallet, logout, language, setLanguage, theme, toggleTheme }) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const input = search.trim();
    if (!input) return;
    const { type, value } = parseSearch(input);
    if (type === 'block') navigate(`/block/${value}`);
    else if (type === 'account') navigate(`/account/${value}`);
    else if (type === 'tx') navigate(`/tx/${value}`);
    else navigate('/404');
    setSearch('');
  };

  return (
    <nav className="navbar">
      <img src="/trident-logo.svg" alt={APP_TITLE} />
      <span className="brand">{APP_TITLE}</span>
      <Link to="/">{t('Latest Block')}</Link>
      <Link to="/account">{t('Account Lookup')}</Link>
      <Link to="/validators">{t('Validator List')}</Link>
      <Link to="/wallet">{t('Wallet')}</Link>
      <form onSubmit={handleSearch} className="ml-auto">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t('Search Placeholder')}
          autoFocus
        />
      </form>
      <button onClick={handleSearch} className="ml-sm" disabled={!search.trim()}>{t('Search')}</button>
      <select value={language} onChange={e => setLanguage(e.target.value)} className="ml-sm">
        <option value="en">EN</option>
        <option value="pt">PT</option>
        <option value="es">ES</option>
      </select>
      <button onClick={toggleTheme} className="ml-sm">
        {theme === 'dark' ? t('Light Mode') : t('Dark Mode')}
      </button>
      {wallet && (
        <span className="ml-sm">
          {wallet.address}{' '}
          <button onClick={logout}>{t('Logout')}</button>
        </span>
      )}
    </nav>
  );
}

export default NavBar;
