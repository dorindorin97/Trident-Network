import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import PropTypes from 'prop-types';
import './QRCodeModal.css';

/**
 * QR Code Modal Component
 * Displays a QR code for an address or transaction hash
 */
function QRCodeModal({ value, label, onClose }) {
  const [size, setSize] = useState(256);
  const modalRef = useRef(null);
  const closeBtnRef = useRef(null);

  // Focus the close button when the modal opens
  useEffect(() => {
    closeBtnRef.current?.focus();
  }, []);

  // Close on Escape and trap focus within the modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll(
          'button, input, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
          e.preventDefault();
          (e.shiftKey ? last : first).focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleDownload = () => {
    const svg = document.getElementById('qr-code-svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = size;
      canvas.height = size;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      
      const downloadLink = document.createElement('a');
      downloadLink.download = `qr-${label || 'code'}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const headingId = 'qr-modal-title';

  return (
    <div className="qr-modal-overlay" onClick={onClose}>
      <div
        ref={modalRef}
        className="qr-modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="qr-modal-header">
          <h3 id={headingId}>{label || 'QR Code'}</h3>
          <button ref={closeBtnRef} onClick={onClose} className="qr-close-btn" aria-label="Close">
            ×
          </button>
        </div>
        <div className="qr-modal-body">
          <div className="qr-code-wrapper">
            <QRCodeSVG
              id="qr-code-svg"
              value={value}
              size={size}
              level="H"
              includeMargin={true}
            />
          </div>
          <div className="qr-value">{value}</div>
          <div className="qr-size-control">
            <label>
              Size: {size}px
              <input
                type="range"
                min="128"
                max="512"
                step="64"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
              />
            </label>
          </div>
        </div>
        <div className="qr-modal-footer">
          <button onClick={handleDownload} className="btn-primary">
            📥 Download PNG
          </button>
          <button onClick={onClose} className="btn-primary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

QRCodeModal.propTypes = {
  value: PropTypes.string.isRequired,
  label: PropTypes.string,
  onClose: PropTypes.func.isRequired
};

/**
 * QR Code Button Component
 * Triggers the QR code modal
 */
export function QRCodeButton({ value, label }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="qr-button"
        title="Show QR Code"
        aria-label="Show QR Code"
      >
        📱
      </button>
      {showModal && (
        <QRCodeModal
          value={value}
          label={label}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}

QRCodeButton.propTypes = {
  value: PropTypes.string.isRequired,
  label: PropTypes.string
};

export default QRCodeModal;
