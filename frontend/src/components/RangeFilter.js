import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

/**
 * Reusable range filter component
 * Renders min/max input fields for filtering by range
 */
function RangeFilter({ label, minValue, maxValue, minPlaceholder, maxPlaceholder, onChange, type = 'number' }) {
  const { t } = useTranslation();

  const handleMinChange = (e) => {
    onChange({ ...{ min: minValue, max: maxValue }, min: e.target.value });
  };

  const handleMaxChange = (e) => {
    onChange({ ...{ min: minValue, max: maxValue }, max: e.target.value });
  };

  const commonProps = type === 'number' ? { min: '0', step: label.includes('Amount') ? '0.000001' : '1' } : {};

  return (
    <div className="form-group">
      <label>{t(label)}</label>
      <div className="range-inputs">
        <input
          type={type}
          placeholder={t(minPlaceholder)}
          value={minValue}
          onChange={handleMinChange}
          {...commonProps}
        />
        <span className="range-separator">—</span>
        <input
          type={type}
          placeholder={t(maxPlaceholder)}
          value={maxValue}
          onChange={handleMaxChange}
          {...commonProps}
        />
      </div>
    </div>
  );
}

RangeFilter.propTypes = {
  label: PropTypes.string.isRequired,
  minValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  maxValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  minPlaceholder: PropTypes.string,
  maxPlaceholder: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  type: PropTypes.oneOf(['number', 'date'])
};

RangeFilter.defaultProps = {
  type: 'number',
  minPlaceholder: 'Min',
  maxPlaceholder: 'Max'
};

export default RangeFilter;
