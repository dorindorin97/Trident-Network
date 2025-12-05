import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';

/**
 * Reusable FormInput component with validation and error handling
 */
export function FormInput({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  disabled = false,
  required = false,
  maxLength,
  pattern,
  autoComplete,
  className = '',
  helperText,
  icon
}) {
  const [touched, setTouched] = useState(false);

  const handleBlur = useCallback((e) => {
    setTouched(true);
    if (onBlur) onBlur(e);
  }, [onBlur]);

  const showError = touched && error;

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={name} className="form-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <div className="input-wrapper">
        {icon && <span className="input-icon">{icon}</span>}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          pattern={pattern}
          autoComplete={autoComplete}
          required={required}
          className={`form-input ${showError ? 'input-error' : ''} ${icon ? 'has-icon' : ''}`}
          aria-invalid={showError}
          aria-describedby={showError ? `${name}-error` : helperText ? `${name}-helper` : undefined}
        />
      </div>
      {showError && (
        <div id={`${name}-error`} className="error-message">
          {error}
        </div>
      )}
      {helperText && !showError && (
        <div id={`${name}-helper`} className="helper-text">
          {helperText}
        </div>
      )}
    </div>
  );
}

FormInput.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  error: PropTypes.string,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  maxLength: PropTypes.number,
  pattern: PropTypes.string,
  autoComplete: PropTypes.string,
  className: PropTypes.string,
  helperText: PropTypes.string,
  icon: PropTypes.node
};

/**
 * Reusable FormSelect component
 */
export function FormSelect({
  label,
  name,
  value,
  onChange,
  options,
  error,
  disabled = false,
  required = false,
  placeholder,
  className = ''
}) {
  const [touched, setTouched] = useState(false);

  const showError = touched && error;

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={name} className="form-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={() => setTouched(true)}
        disabled={disabled}
        required={required}
        className={`form-select ${showError ? 'input-error' : ''}`}
        aria-invalid={showError}
        aria-describedby={showError ? `${name}-error` : undefined}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(({ value: optValue, label: optLabel }) => (
          <option key={optValue} value={optValue}>
            {optLabel}
          </option>
        ))}
      </select>
      {showError && (
        <div id={`${name}-error`} className="error-message">
          {error}
        </div>
      )}
    </div>
  );
}

FormSelect.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired
    })
  ).isRequired,
  error: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  placeholder: PropTypes.string,
  className: PropTypes.string
};

/**
 * Reusable FormButton component
 */
export function FormButton({
  type = 'button',
  label,
  onClick,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  icon,
  className = ''
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`form-button form-button-${variant} form-button-${size} ${
        fullWidth ? 'full-width' : ''
      } ${loading ? 'loading' : ''} ${className}`}
      aria-busy={loading}
    >
      {icon && <span className="button-icon">{icon}</span>}
      {loading ? 'Loading...' : label}
    </button>
  );
}

FormButton.propTypes = {
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'success']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  fullWidth: PropTypes.bool,
  icon: PropTypes.node,
  className: PropTypes.string
};

/**
 * Reusable FormCheckbox component
 */
export function FormCheckbox({
  label,
  name,
  checked,
  onChange,
  disabled = false,
  error,
  helperText,
  className = ''
}) {
  return (
    <div className={`form-group checkbox-group ${className}`}>
      <div className="checkbox-wrapper">
        <input
          id={name}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="form-checkbox"
          aria-describedby={helperText ? `${name}-helper` : undefined}
        />
        {label && (
          <label htmlFor={name} className="checkbox-label">
            {label}
          </label>
        )}
      </div>
      {error && <div className="error-message">{error}</div>}
      {helperText && !error && (
        <div id={`${name}-helper`} className="helper-text">
          {helperText}
        </div>
      )}
    </div>
  );
}

FormCheckbox.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  helperText: PropTypes.string,
  className: PropTypes.string
};

export default {
  FormInput,
  FormSelect,
  FormButton,
  FormCheckbox
};
