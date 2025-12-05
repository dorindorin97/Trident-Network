import React from 'react';
import PropTypes from 'prop-types';
import './SkeletonLoader.css';

/**
 * Skeleton loader component for better loading UX
 */
function SkeletonLoader({ type = 'text', count = 1, height, width, className = '' }) {
  const getSkeletonClass = () => {
    switch (type) {
      case 'text':
        return 'skeleton-text';
      case 'title':
        return 'skeleton-title';
      case 'card':
        return 'skeleton-card';
      case 'avatar':
        return 'skeleton-avatar';
      case 'button':
        return 'skeleton-button';
      default:
        return 'skeleton-text';
    }
  };

  const style = {};
  if (height) style.height = height;
  if (width) style.width = width;

  return (
    <div className={`skeleton-container ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`skeleton ${getSkeletonClass()}`}
          style={style}
        />
      ))}
    </div>
  );
}

SkeletonLoader.propTypes = {
  type: PropTypes.oneOf(['text', 'title', 'card', 'avatar', 'button']),
  count: PropTypes.number,
  height: PropTypes.string,
  width: PropTypes.string,
  className: PropTypes.string
};

const MemoizedSkeletonLoader = React.memo(SkeletonLoader);

/**
 * Skeleton for block card
 */
export const BlockSkeleton = React.memo(function BlockSkeleton() {
  return (
    <div className="skeleton-block">
      <MemoizedSkeletonLoader type="title" height="2rem" width="60%" />
      <MemoizedSkeletonLoader type="text" count={3} height="1rem" />
    </div>
  );
});

/**
 * Skeleton for table rows
 */
export const TableSkeleton = React.memo(function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="skeleton-table">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="skeleton-row">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <MemoizedSkeletonLoader key={colIndex} type="text" height="1rem" width="90%" />
          ))}
        </div>
      ))}
    </div>
  );
});

TableSkeleton.propTypes = {
  rows: PropTypes.number,
  columns: PropTypes.number
};

export default MemoizedSkeletonLoader;
