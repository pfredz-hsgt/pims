// BinS.jsx
import React from 'react';

const BinS = ({ id, isTarget, onClick }) => {
  return (
    <svg
      id={id}
      onClick={() => onClick(id)}
      viewBox="0 0 150.25 128.25"
      preserveAspectRatio="xMidYMax meet"
      style={{
        width: '100%',
        height: 'auto',
        cursor: 'pointer',
        overflow: 'visible'
      }}
    >
      <g>
        <polygon className="outline" vectorEffect="non-scaling-stroke" points="145.13 .12 141.13 .12 9.13 .12 5.13 .12 .13 .12 1.13 65.12 5.13 70.12 5.13 108.12 7.13 128.12 143.13 128.12 145.13 108.12 145.13 70.12 149.13 65.12 150.13 .12" style={{ fill: '#4d4d4d' }} />
        <polygon points="150.13 .12 149.13 65.12 145.13 70.12 145.13 108.12 5.13 108.12 5.13 70.12 1.13 65.12 .13 .12 5.13 .12 145.13 .12 150.13 .12" style={{ fill: '#ffeb00', stroke: '#603813', strokeMiterlimit: 10, strokeWidth: '.25px' }} />
        <polygon points="141.13 .12 140.13 62.12 10.13 62.12 9.13 .12 141.13 .12" style={{ fill: '#9a7206' }} />
        <rect x="16.2" y="63.12" width="118.86" height="39" style={{ fill: '#f4dc00', stroke: '#f2e860', strokeMiterlimit: 10, strokeWidth: '.93px' }} />
        <polygon points="145.13 108.12 143.13 128.12 7.13 128.12 5.13 108.12 145.13 108.12" style={{ fill: '#cfb007', stroke: '#603813', strokeMiterlimit: 10, strokeWidth: '.25px' }} />
      </g>
    </svg>
  );
};

export default BinS;
