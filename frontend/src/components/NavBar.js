import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const APP_TITLE = process.env.REACT_APP_APP_TITLE || 'Trident Explorer';

function NavBar({ wallet, logout, language, setLanguage, theme, toggleTheme }) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const input = search.trim();
    if (!input) return;
    if (/^\d+$/.test(input)) {
      navigate(`/block/${input}`);
    } else if (/^T\w{33}$/.test(input)) {
      navigate(`/account/${input}`);
    } else if (/^(0x)?[0-9a-fA-F]{64}$/.test(input)) {
      const id = input.startsWith('0x') ? input : `0x${input}`;
      navigate(`/tx/${id}`);
    }
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
      <Link to="/admin">{t('Admin Panel')}</Link>
      <form onSubmit={handleSearch} className="ml-auto">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t('Search Placeholder')}
        />
      </form>
      <button onClick={handleSearch} className="ml-sm">{t('Search')}</button>
      <select value={language} onChange={e => setLanguage(e.target.value)} className="ml-sm">
        <option value="en">EN</option>
        <option value="pt">PT</option>
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
