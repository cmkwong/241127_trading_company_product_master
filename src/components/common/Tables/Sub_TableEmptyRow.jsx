import React from 'react';

const Sub_TableEmptyRow = ({ colSpan, className, message }) => {
  return (
    <tr>
      <td className={className} colSpan={colSpan}>
        {message}
      </td>
    </tr>
  );
};

export default Sub_TableEmptyRow;
