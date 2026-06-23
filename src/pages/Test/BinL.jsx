// BinL.jsx
import React from 'react';

const BinL = ({ id, isTarget, onClick }) => {
  return (
    <svg
      id={id}
      onClick={() => onClick(id)}
      viewBox="0 0 308.52 205.25"
      preserveAspectRatio="xMidYMax meet"
      style={{
        width: '100%',
        height: 'auto',
        cursor: 'pointer',
        overflow: 'visible'
      }}
    >
      <g>
        <polygon className="outline" vectorEffect="non-scaling-stroke" points="298.26 .12 285.26 .12 23.26 .12 10.26 .12 .26 .12 .26 164.12 10.47 177.05 15.26 205.12 293.26 205.12 298.05 177.05 308.26 164.12 308.26 .12" style={{ fill: '#4d4d4d' }} />
        <polygon points="308.26 .12 308.26 164.12 .26 164.12 .26 .12 23.26 .12 23.26 90.12 40.26 90.12 40.26 107.12 268.26 107.12 268.26 90.12 285.26 90.12 285.26 .12 308.26 .12" style={{ fill: '#ffeb00', stroke: '#603813', strokeMiterlimit: 10, strokeWidth: '.25px' }} />
        <polygon points="298.26 .12 298.26 8.12 285.26 8.12 285.26 90.12 268.26 90.12 268.26 107.12 40.26 107.12 40.26 90.12 23.26 90.12 23.26 8.12 10.26 8.12 10.26 .12 298.26 .12" style={{ fill: '#9a7206' }} />
        <polygon points="242.26 107.12 242.26 112.01 234.85 112.01 234.85 151.12 75.67 151.12 75.67 112.01 68.26 112.01 68.26 107.12 242.26 107.12" style={{ fill: '#f4d600' }} />
        <polygon points="308.26 164.12 298.05 177.05 293.26 205.12 15.26 205.12 10.47 177.05 .26 164.12 308.26 164.12" style={{ fill: '#cfb007', stroke: '#603813', strokeMiterlimit: 10, strokeWidth: '.25px' }} />
      </g>
    </svg>
  );
};

export default BinL;
