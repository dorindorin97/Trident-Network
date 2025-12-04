import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import './Footer.css';

const NETWORK_INFO = {
  name: process.env.REACT_APP_NETWORK_NAME || 'Trident Network',
  version: process.env.REACT_APP_VERSION || '1.1.0',
  chainId: '0x76a81b116bfaa26e',
  consensus: 'Modified BFT PoS'
};

/**
 * Footer component with network information and useful links
 */
function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h4>{t('Network Info')}</h4>
          <ul>
            <li><strong>{t('Network')}:</strong> {NETWORK_INFO.name}</li>
            <li><strong>{t('Chain ID')}:</strong> {NETWORK_INFO.chainId}</li>
            <li><strong>{t('Consensus')}:</strong> {NETWORK_INFO.consensus}</li>
            <li><strong>{t('Version')}:</strong> {NETWORK_INFO.version}</li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>{t('Explorer')}</h4>
          <ul>
            <Link to="/">{t('Latest Block')}</Link>
            <Link to="/validators">{t('Validators')}</Link>
            <Link to="/account">{t('Account Lookup')}</Link>
            <Link to="/admin">{t('Admin Dashboard')}</Link>
          </ul>
        </div>

        <div className="footer-section">
          <h4>{t('Resources')}</h4>
          <ul>
            <a href="https://github.com/dorindorin97/Trident-Network" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <a href="https://github.com/dorindorin97/Trident-Network/blob/main/API.md" target="_blank" rel="noopener noreferrer">
              API Docs
            </a>
            <a href="https://github.com/dorindorin97/Trident-Network/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer">
              Contributing
            </a>
            <a href="https://github.com/dorindorin97/Trident-Network/blob/main/SECURITY.md" target="_blank" rel="noopener noreferrer">
              Security
            </a>
          </ul>
        </div>

        <div className="footer-section">
          <h4>{t('About')}</h4>
          <p className="footer-description">
            {t('Trident Explorer is an open-source blockchain explorer for the Trident Network.')}
          </p>
          <p className="footer-warning">
            ⚠️ {t('Testnet Explorer - Do not use real assets')}
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          © {currentYear} Trident Network Explorer. 
          {' '}<a href="https://github.com/dorindorin97/Trident-Network/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">
            MIT License
          </a>
        </p>
        <p className="footer-credits">
          Built with ❤️ by the community
        </p>
      </div>
    </footer>
  );
}

export default Footer;
