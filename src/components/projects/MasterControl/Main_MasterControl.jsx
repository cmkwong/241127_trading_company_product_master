/* eslint-disable react-refresh/only-export-components */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useMasterContext } from '../../../store/MasterContext';
import AddNewBtn from '../../common/Buttons/AddNewBtn';
import DeleteBtn from '../../common/Buttons/DeleteBtn';
import Main_TextField from '../../common/InputOptions/TextField/Main_TextField';
import EditableDataTable from '../../common/Table/EditableDataTable';
import styles from './Main_MasterControl.module.css';

const asInputValue = (value) => {
  if (value === null || value === undefined) return '';
  return String(value);
};

const isBooleanType = (type = '') => {
  const t = String(type || '').toLowerCase();
  return (
    t.includes('boolean') || t.includes('bool') || t.includes('tinyint(1)')
  );
};

const isNumberType = (type = '') => {
  const t = String(type || '').toLowerCase();
  return (
    t.includes('int') ||
    t.includes('decimal') ||
    t.includes('numeric') ||
    t.includes('float') ||
    t.includes('double')
  );
};

const parseInputValue = (rawValue, schemaField = {}) => {
  if (isBooleanType(schemaField?.type)) {
    const normalized = String(rawValue || '')
      .trim()
      .toLowerCase();
    return ['true', '1', 'yes', 'y'].includes(normalized);
  }

  if (isNumberType(schemaField?.type)) {
    if (rawValue === '') return '';
    const parsed = Number(rawValue);
    return Number.isNaN(parsed) ? rawValue : parsed;
  }

  return rawValue;
};

const MasterControlContent = () => {
  const {
    masterDataMap,
    masterTableNames,
    fetchMasterData,
    fetchMasterTableSchema,
    updateMasterTableData,
    deleteMasterTableData,
  } = useMasterContext();

  const tableNames = useMemo(() => {
    if (Array.isArray(masterTableNames) && masterTableNames.length > 0) {
      return masterTableNames;
    }
    return Object.keys(masterDataMap || {}).sort();
  }, [masterDataMap, masterTableNames]);

  const [selectedTable, setSelectedTable] = useState('');
  const [tableSchema, setTableSchema] = useState(null);
  const [draftRows, setDraftRows] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!selectedTable && tableNames.length > 0) {
      setSelectedTable(tableNames[0]);
    }
  }, [selectedTable, tableNames]);

  const loadTableData = useCallback(async () => {
    if (!selectedTable) return;

    setIsLoading(true);
    setError('');
    try {
      const rows = await fetchMasterData(selectedTable);

      let schema = null;
      try {
        schema = await fetchMasterTableSchema(selectedTable);
      } catch (schemaError) {
        console.warn('Master schema endpoint is unavailable:', schemaError);
      }

      const normalizedRows = Array.isArray(rows)
        ? rows.map((row) => ({ ...row, _isNew: false }))
        : [];

      setDraftRows(normalizedRows);
      setTableSchema(schema || null);
    } catch (err) {
      setError(err?.message || 'Failed to load master table');
    } finally {
      setIsLoading(false);
    }
  }, [fetchMasterData, fetchMasterTableSchema, selectedTable]);

  useEffect(() => {
    loadTableData();
  }, [loadTableData]);

  const columns = useMemo(() => {
    const schemaFields = tableSchema?.fields;
    if (schemaFields && typeof schemaFields === 'object') {
      return Object.keys(schemaFields);
    }

    const keys = new Set();
    draftRows.forEach((row) => {
      Object.keys(row || {}).forEach((key) => {
        if (!String(key).startsWith('_')) {
          keys.add(key);
        }
      });
    });

    return Array.from(keys);
  }, [draftRows, tableSchema]);

  const schemaFieldByColumn = useMemo(() => {
    return tableSchema?.fields || {};
  }, [tableSchema]);

  const handleReload = useCallback(async () => {
    await loadTableData();
  }, [loadTableData]);

  const handleAddRow = useCallback(() => {
    const nextRow = {
      _isNew: true,
      _localId: uuidv4(),
    };

    columns.forEach((column) => {
      if (column === 'id') {
        nextRow.id = uuidv4();
        return;
      }

      const schemaField = schemaFieldByColumn[column] || {};
      if (isBooleanType(schemaField.type)) {
        nextRow[column] = false;
        return;
      }

      nextRow[column] = '';
    });

    setDraftRows((prev) => [...prev, nextRow]);
  }, [columns, schemaFieldByColumn]);

  const handleCellChange = useCallback(
    (rowIndex, key, value) => {
      setDraftRows((prev) => {
        const next = [...prev];
        const current = next[rowIndex] || {};
        const schemaField = schemaFieldByColumn[key] || {};
        next[rowIndex] = {
          ...current,
          [key]: parseInputValue(value, schemaField),
        };
        return next;
      });
    },
    [schemaFieldByColumn],
  );

  const handleDeleteRow = useCallback(
    async (row) => {
      if (!selectedTable || !row) return;

      const rowId = String(row?.id || '').trim();
      if (!rowId || row._isNew) {
        setDraftRows((prev) => prev.filter((item) => item !== row));
        return;
      }

      const confirmed = window.confirm('Delete this row from master table?');
      if (!confirmed) return;

      setIsSaving(true);
      setError('');
      try {
        await deleteMasterTableData(selectedTable, [{ id: rowId }]);
        await loadTableData();
      } catch (err) {
        setError(err?.message || 'Failed to delete row');
      } finally {
        setIsSaving(false);
      }
    },
    [deleteMasterTableData, loadTableData, selectedTable],
  );

  const tableColumns = useMemo(() => {
    const dataColumns = columns.map((column) => ({
      key: column,
      label: column,
      sortable: true,
      renderCell: (row) => {
        const rowIndex = draftRows.findIndex(
          (r) => (r.id || r._localId) === (row.id || row._localId),
        );

        const isReadonly = column === 'created_at' || column === 'updated_at';

        if (isBooleanType(schemaFieldByColumn[column]?.type)) {
          return (
            <input
              type="checkbox"
              checked={Boolean(row?.[column])}
              onChange={(event) =>
                handleCellChange(rowIndex, column, event.target.checked)
              }
              disabled={isReadonly}
            />
          );
        }

        return (
          <Main_TextField
            defaultValue={asInputValue(row?.[column])}
            onChange={(ov, nv) => handleCellChange(rowIndex, column, nv)}
            disabled={isReadonly}
            className={styles.cellTextField}
            placeholder=""
          />
        );
      },
    }));

    return [
      ...dataColumns,
      {
        key: '__actions',
        label: 'Actions',
        sortable: false,
        renderCell: (row) => (
          <DeleteBtn
            text="Delete"
            onClick={() => handleDeleteRow(row)}
            disabled={isSaving}
            className={styles.inlineDeleteBtn}
          />
        ),
      },
    ];
  }, [
    columns,
    draftRows,
    handleCellChange,
    handleDeleteRow,
    isSaving,
    schemaFieldByColumn,
  ]);

  const sanitizeRowForSave = useCallback((row) => {
    const cleaned = {};
    Object.entries(row || {}).forEach(([key, value]) => {
      if (String(key).startsWith('_')) return;
      cleaned[key] = value;
    });

    if (!cleaned.id) {
      cleaned.id = uuidv4();
    }

    return cleaned;
  }, []);

  const handleSaveAll = useCallback(async () => {
    if (!selectedTable) return;

    setIsSaving(true);
    setError('');
    try {
      const payloadRows = draftRows.map((row) => sanitizeRowForSave(row));
      if (payloadRows.length > 0) {
        await updateMasterTableData(selectedTable, payloadRows);
      }
      await loadTableData();
    } catch (err) {
      setError(err?.message || 'Failed to save master table rows');
    } finally {
      setIsSaving(false);
    }
  }, [
    draftRows,
    loadTableData,
    sanitizeRowForSave,
    selectedTable,
    updateMasterTableData,
  ]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Master Control</h2>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={handleReload}
            disabled={!selectedTable || isLoading || isSaving}
          >
            {isLoading ? 'Reloading...' : 'Reload'}
          </button>
          <AddNewBtn
            onClick={handleAddRow}
            text="Add Row"
            className={styles.inlineAddBtn}
            disabled={!selectedTable || isSaving}
          />
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={handleSaveAll}
            disabled={!selectedTable || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save All'}
          </button>
        </div>
      </div>

      <div className={styles.main}>
        <aside className={styles.sidebar}>
          {tableNames.map((tableName) => (
            <button
              key={tableName}
              type="button"
              className={`${styles.tableBtn} ${selectedTable === tableName ? styles.activeTableBtn : ''}`}
              onClick={() => setSelectedTable(tableName)}
            >
              {tableName}
            </button>
          ))}
        </aside>

        <section className={styles.tableSection}>
          {error ? <div className={styles.error}>{error}</div> : null}

          <div className={styles.tableWrap}>
            <EditableDataTable
              rows={draftRows}
              columns={tableColumns}
              rowKey={(row, rowIndex) => row.id || row._localId || rowIndex}
              emptyMessage="No rows in this table."
            />
          </div>
        </section>
      </div>
    </div>
  );
};

const Main_MasterControl = () => {
  return <MasterControlContent />;
};

export default Main_MasterControl;
