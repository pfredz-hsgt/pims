// BinM.jsx
import React from 'react';

const BinM = ({ id, isTarget, onClick }) => {
  return (
    <svg
      id={id}
      onClick={() => onClick(id)}
      /* The viewBox numbers (min-x, min-y, width, height) tightly crop your specific polygon points */
      viewBox="15 40 95 68.85"
      preserveAspectRatio="xMidYMax meet"
      style={{
        width: '100%',
        height: 'auto',
        cursor: 'pointer',
        overflow: 'visible'
      }}
    >
      <g>
        <polygon className='outline' vectorEffect="non-scaling-stroke" points="103.77 44.44 20.68 44.44 18.72 44.44 18.72 75.01 21.85 80.89 21.85 93.83 23.42 108.72 101.03 108.72 102.59 93.83 102.59 80.89 105.73 75.01 105.73 44.44 103.77 44.44" style={{ fill: '#4d4d4d' }} />
        <polygon points="105.73 44.44 105.73 75.01 102.59 80.89 102.59 93.83 21.85 93.83 21.85 80.89 18.72 75.01 18.72 44.44 20.68 44.44 20.68 46.01 24.2 46.01 24.2 74.62 100.24 74.62 100.24 46.01 103.77 46.01 103.77 44.44 105.73 44.44" style={{ fill: '#ffeb00', stroke: '#603813', strokeMiterlimit: 10, strokeWidth: '.1px' }} />
        <polygon points="102.59 93.83 101.03 108.72 23.42 108.72 21.85 93.83 102.59 93.83" style={{ fill: '#cfb007', stroke: '#ceaf07', strokeMiterlimit: 10, strokeWidth: '.25px' }} />
        <polygon points="93.38 74.43 93.38 75.6 89.86 75.6 89.86 90.5 34.98 90.5 34.98 75.6 31.45 75.6 31.45 74.43 93.38 74.43" style={{ fill: '#f4dc00', stroke: '#f2e860', strokeMiterlimit: 10, strokeWidth: '.36px' }} />
        <polygon points="103.77 44.44 103.77 46.01 100.24 46.01 100.24 74.62 24.2 74.62 24.2 46.01 20.68 46.01 20.68 44.44 103.77 44.44" style={{ fill: '#9a7206', stroke: 'gray', strokeMiterlimit: 10, strokeWidth: '.25px' }} />
      </g>
    </svg>
  );
};

export default BinM;