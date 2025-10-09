import React from 'react';
import './DataTable.css';

const DataTable = ({ rows = [], columns = [] }) => {
  // Default columns if not provided
  const defaultColumns = [
    { key: 'id', label: 'Mã đơn hàng', sortable: true },
    { key: 'customer', label: 'Khách hàng', sortable: true },
    { key: 'car', label: 'Xe thuê', sortable: true },
    { key: 'rentDate', label: 'Ngày thuê', sortable: true },
    { key: 'status', label: 'Trạng thái', sortable: false },
    { key: 'total', label: 'Tổng tiền', sortable: true },
  ];

  const tableColumns = columns.length > 0 ? columns : defaultColumns;

  const getStatusClass = (status) => {
    if (!status || typeof status !== 'object') return 'status-default';
    
    const variantMap = {
      'success': 'status-success',
      'warning': 'status-warning',
      'error': 'status-error',
      'info': 'status-info',
      'success-muted': 'status-success-muted',
    };
    
    return variantMap[status.variant] || 'status-default';
  };

  const renderCellContent = (column, row) => {
    const value = row[column.key];
    
    if (column.key === 'status' && value && typeof value === 'object') {
      return (
        <span className={`status-badge ${getStatusClass(value)}`}>
          {value.label || value}
        </span>
      );
    }
    
    return value || '-';
  };

  return (
    <div className="data-table-container">
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead className="data-table__header">
            <tr>
              {tableColumns.map((column) => (
                <th 
                  key={column.key} 
                  className={`data-table__cell data-table__cell--header ${column.sortable ? 'data-table__cell--sortable' : ''}`}
                >
                  <div className="data-table__cell-content">
                    {column.label}
                    {column.sortable && (
                      <span className="data-table__sort-icon" aria-hidden="true">
                        ↕️
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="data-table__body">
            {rows.length > 0 ? (
              rows.map((row, index) => (
                <tr key={row.id || index} className="data-table__row">
                  {tableColumns.map((column) => (
                    <td key={column.key} className="data-table__cell">
                      <div className="data-table__cell-content">
                        {renderCellContent(column, row)}
                      </div>
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr className="data-table__row data-table__row--empty">
                <td 
                  colSpan={tableColumns.length} 
                  className="data-table__cell data-table__cell--empty"
                >
                  <div className="data-table__empty-state">
                    <span className="data-table__empty-icon" aria-hidden="true">
                      📋
                    </span>
                    <p>Không có dữ liệu để hiển thị</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
