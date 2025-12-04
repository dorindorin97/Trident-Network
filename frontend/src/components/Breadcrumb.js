import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import './Breadcrumb.css';

/**
 * Breadcrumb navigation component
 * Automatically generates breadcrumbs based on current route
 */
function Breadcrumb({ customItems }) {
  const { t } = useTranslation();
  const location = useLocation();

  // Generate breadcrumb items from pathname
  const generateBreadcrumbs = () => {
    if (customItems) return customItems;

    const paths = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ label: t('Home'), path: '/' }];

    let currentPath = '';
    paths.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Format segment name
      let label = segment.charAt(0).toUpperCase() + segment.slice(1);
      
      // Map specific routes to readable names
      const routeMap = {
        'account': t('Account Lookup'),
        'validators': t('Validators'),
        'wallet': t('Wallet'),
        'admin': t('Admin Panel'),
        'block': t('Block'),
        'tx': t('Transaction'),
        '404': t('Not Found')
      };

      // Handle dynamic segments (block numbers, transaction IDs, addresses)
      if (index > 0 && paths[index - 1] in routeMap) {
        // This is a dynamic segment (ID), truncate if too long
        if (segment.length > 20) {
          label = `${segment.substring(0, 10)}...${segment.substring(segment.length - 6)}`;
        }
      } else if (routeMap[segment]) {
        label = routeMap[segment];
      }

      breadcrumbs.push({ label, path: currentPath });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumbs on home page
  if (location.pathname === '/') return null;

  return (
    <nav className="breadcrumb" aria-label="breadcrumb">
      <ol className="breadcrumb-list">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          
          return (
            <li 
              key={crumb.path} 
              className={`breadcrumb-item ${isLast ? 'active' : ''}`}
            >
              {isLast ? (
                <span aria-current="page">{crumb.label}</span>
              ) : (
                <>
                  <Link to={crumb.path}>{crumb.label}</Link>
                  <span className="breadcrumb-separator">›</span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

Breadcrumb.propTypes = {
  customItems: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired
    })
  )
};

export default Breadcrumb;
