/* eslint-disable react-refresh/only-export-components */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuthContext } from '../../../store/AuthContext';
import { useMasterContext } from '../../../store/MasterContext';
import AddNewBtn from '../../common/Buttons/AddNewBtn';
import DeleteBtn from '../../common/Buttons/DeleteBtn';
import Main_Dropdown from '../../common/InputOptions/Dropdown/Main_Dropdown';
import Main_FileUploads from '../../common/InputOptions/FileUploads/Main_FileUploads';
import Main_Suggest from '../../common/InputOptions/Suggest/Main_Suggest';
import Main_TextField from '../../common/InputOptions/TextField/Main_TextField';
import { sortByDisplayOrder } from '../../../utils/arr';
import MasterControlHeader from './components/MasterControlHeader';
import MasterControlSidebar from './components/MasterControlSidebar';
import MasterControlTablePanel from './components/MasterControlTablePanel';
import MasterControlSavePageContainer from './Container/MasterControlSavePageContainer';
import {
  asInputValue,
  isBooleanType,
  normalizeReferenceTarget,
  parseInputValue,
} from './utils/masterControlUtils';
import {
  buildMasterServiceImageMutations as buildMasterServiceImageMutationsPayload,
  buildMasterServiceImagesRelatedDryRunPreview,
  getDefaultMasterServiceImagesForService,
  normalizePendingMasterServiceImages,
  resolveMasterServiceImageRelationField,
} from './utils/masterServiceUtils';
import styles from './Main_MasterControl.module.css';

const MasterControlContent = () => {
  const { token } = useAuthContext();
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
  const [serviceImagesSchema, setServiceImagesSchema] = useState(null);
  const [pendingServiceImagesByServiceId, setPendingServiceImagesByServiceId] =
    useState({});
  const [originalRows, setOriginalRows] = useState([]);
  const [draftRows, setDraftRows] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const canEdit = Boolean(token);

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
      setOriginalRows(normalizedRows);
      setTableSchema(schema || null);

      if (selectedTable === 'master_services') {
        try {
          await fetchMasterData('master_service_images');
        } catch (serviceImageError) {
          console.warn(
            'Failed to load master_service_images rows:',
            serviceImageError,
          );
        }

        try {
          const imageSchema = await fetchMasterTableSchema(
            'master_service_images',
          );
          setServiceImagesSchema(imageSchema || null);
        } catch (serviceImageSchemaError) {
          console.warn(
            'Failed to load master_service_images schema:',
            serviceImageSchemaError,
          );
          setServiceImagesSchema(null);
        }
      } else {
        setServiceImagesSchema(null);
      }

      setPendingServiceImagesByServiceId({});
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

  const displayNameField = useMemo(() => {
    const candidates = [
      'name',
      'label',
      'service_name',
      'category_name',
      'title',
      'value',
      'description',
    ];

    for (const field of candidates) {
      if (columns.includes(field)) {
        return field;
      }
    }

    const nameLike = columns.find((field) => String(field).endsWith('_name'));
    return nameLike || 'id';
  }, [columns]);

  const selfReferenceField = useMemo(() => {
    if (!selectedTable) return '';

    for (const [fieldName, fieldSchema] of Object.entries(
      schemaFieldByColumn,
    )) {
      const refTarget = normalizeReferenceTarget(fieldSchema);
      if (
        refTarget &&
        refTarget.includes(String(selectedTable).toLowerCase())
      ) {
        return fieldName;
      }
    }

    if (columns.includes('parent_id') && columns.includes('id')) {
      return 'parent_id';
    }

    return '';
  }, [columns, schemaFieldByColumn, selectedTable]);

  const nodeById = useMemo(() => {
    const map = new Map();
    draftRows.forEach((row) => {
      const id = String(row?.id || '').trim();
      if (id) {
        map.set(id, row);
      }
    });
    return map;
  }, [draftRows]);

  const hierarchyPathByRowKey = useMemo(() => {
    const pathMap = new Map();
    if (!selfReferenceField) return pathMap;

    const resolveLabel = (row) => {
      const candidate = row?.[displayNameField];
      if (candidate === null || candidate === undefined || candidate === '') {
        return row?.id || '(unnamed)';
      }
      return String(candidate);
    };

    const resolvePath = (row) => {
      const visited = new Set();
      const labels = [];

      let cursor = row;
      while (cursor) {
        const currentId = String(cursor?.id || '').trim();
        if (currentId && visited.has(currentId)) {
          labels.unshift('(cycle)');
          break;
        }
        if (currentId) {
          visited.add(currentId);
        }

        labels.unshift(resolveLabel(cursor));

        const parentId = String(cursor?.[selfReferenceField] || '').trim();
        if (!parentId) break;
        const parentRow = nodeById.get(parentId);
        if (!parentRow) {
          labels.unshift(`(missing:${parentId})`);
          break;
        }
        cursor = parentRow;
      }

      return labels.join(' -> ');
    };

    draftRows.forEach((row, index) => {
      const key = row?.id || row?._localId || index;
      pathMap.set(key, resolvePath(row));
    });

    return pathMap;
  }, [displayNameField, draftRows, nodeById, selfReferenceField]);

  const selfReferenceOptions = useMemo(() => {
    if (!selfReferenceField) return [];

    const options = [{ id: '', name: '(None)' }];
    draftRows.forEach((row) => {
      const id = String(row?.id || '').trim();
      if (!id) return;
      const label = row?.[displayNameField] || id;
      options.push({ id, name: `${label} (${id.slice(0, 8)})` });
    });
    return options;
  }, [displayNameField, draftRows, selfReferenceField]);

  const selfReferenceSuggestionMaps = useMemo(() => {
    const labelToId = new Map();
    const idToLabel = new Map();
    const suggestions = [];

    draftRows.forEach((row) => {
      const id = String(row?.id || '').trim();
      if (!id) return;

      const label = String(row?.[displayNameField] || id).trim();
      const suggestionLabel = `${label} (${id})`;

      labelToId.set(suggestionLabel, id);
      idToLabel.set(id, suggestionLabel);
      suggestions.push(suggestionLabel);
    });

    return {
      labelToId,
      idToLabel,
      suggestions,
    };
  }, [displayNameField, draftRows]);

  const resolveSuggestionToReferenceId = useCallback(
    (rawValue) => {
      const text = String(rawValue || '').trim();
      if (!text) {
        return { resolved: true, value: '' };
      }

      const matchedId = selfReferenceSuggestionMaps.labelToId.get(text);
      if (matchedId) {
        return { resolved: true, value: matchedId };
      }

      const fullUuidMatch = text.match(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
      if (fullUuidMatch) {
        return { resolved: true, value: text };
      }

      const uuidInSuffix = text.match(
        /\(([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\)\s*$/i,
      );
      if (uuidInSuffix?.[1]) {
        return { resolved: true, value: uuidInSuffix[1] };
      }

      return { resolved: false, value: text };
    },
    [selfReferenceSuggestionMaps.labelToId],
  );

  const serviceImageRows = useMemo(() => {
    return masterDataMap?.master_service_images || [];
  }, [masterDataMap]);

  const masterServiceImageRelationField = useMemo(() => {
    return resolveMasterServiceImageRelationField(
      serviceImagesSchema,
      serviceImageRows,
    );
  }, [serviceImageRows, serviceImagesSchema]);

  const buildBlankRow = useCallback(() => {
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

    return nextRow;
  }, [columns, schemaFieldByColumn]);

  const handleReload = useCallback(async () => {
    await loadTableData();
    setSaveSuccess(false);
    setSaveError('');
  }, [loadTableData]);

  const handleAddRow = useCallback(() => {
    setDraftRows((prev) => [...prev, buildBlankRow()]);
    setSaveSuccess(false);
    setSaveError('');
  }, [buildBlankRow]);

  const handleInsertRowAfter = useCallback(
    (row) => {
      const targetKey = row?.id || row?._localId;
      if (!targetKey) {
        setDraftRows((prev) => [...prev, buildBlankRow()]);
        return;
      }

      setDraftRows((prev) => {
        const index = prev.findIndex(
          (candidate) => (candidate?.id || candidate?._localId) === targetKey,
        );
        if (index < 0) {
          return [...prev, buildBlankRow()];
        }

        const next = [...prev];
        next.splice(index + 1, 0, buildBlankRow());
        return next;
      });
      setSaveSuccess(false);
      setSaveError('');
    },
    [buildBlankRow],
  );

  const handleCellChange = useCallback(
    (rowIndex, key, value) => {
      if (!canEdit) return;

      setDraftRows((prev) => {
        const next = [...prev];
        const current = next[rowIndex] || {};
        const schemaField = schemaFieldByColumn[key] || {};

        if (key === selfReferenceField) {
          const nextParentId = String(value || '').trim();
          const currentId = String(current?.id || '').trim();

          if (nextParentId && nextParentId === currentId) {
            return prev;
          }

          if (nextParentId) {
            const byId = new Map();
            next.forEach((row) => {
              const id = String(row?.id || '').trim();
              if (id) byId.set(id, row);
            });

            const visited = new Set([currentId]);
            let cursorId = nextParentId;
            while (cursorId) {
              if (visited.has(cursorId)) {
                return prev;
              }
              visited.add(cursorId);

              const cursor = byId.get(cursorId);
              cursorId = String(cursor?.[selfReferenceField] || '').trim();
            }
          }
        }

        next[rowIndex] = {
          ...current,
          [key]: parseInputValue(value, schemaField),
        };
        return next;
      });
      setSaveSuccess(false);
      setSaveError('');
    },
    [canEdit, schemaFieldByColumn, selfReferenceField],
  );

  const handleDeleteRow = useCallback(
    async (row) => {
      if (!canEdit) return;
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
      setSaveSuccess(false);
      setSaveError('');
      try {
        await deleteMasterTableData(selectedTable, [{ id: rowId }]);
        await loadTableData();
      } catch (err) {
        setError(err?.message || 'Failed to delete row');
      } finally {
        setIsSaving(false);
      }
    },
    [canEdit, deleteMasterTableData, loadTableData, selectedTable],
  );

  const handleMasterServiceImagesChange = useCallback(
    (serviceRow, oldFiles = [], newFiles = []) => {
      if (!canEdit) return;
      if (selectedTable !== 'master_services') return;

      const serviceId = String(serviceRow?.id || '').trim();
      if (!serviceId) return;

      const oldList = Array.isArray(oldFiles) ? oldFiles : [];
      const newList = Array.isArray(newFiles) ? newFiles : [];

      const removedImages = oldList.filter(
        (oldImage) => !newList.some((newImage) => newImage.id === oldImage.id),
      );

      const addedImages = newList.filter(
        (newImage) => !oldList.some((oldImage) => oldImage.id === newImage.id),
      );

      const sameLength = oldList.length === newList.length;
      const sameOrder =
        sameLength && oldList.every((img, i) => img.id === newList[i]?.id);

      if (removedImages.length === 0 && addedImages.length === 0 && sameOrder) {
        return;
      }

      const imageSchemaFields = serviceImagesSchema?.fields || {};
      setSaveSuccess(false);
      setSaveError('');
      const normalized = normalizePendingMasterServiceImages(
        newList,
        imageSchemaFields,
      );

      setPendingServiceImagesByServiceId((prev) => ({
        ...prev,
        [serviceId]: normalized,
      }));
    },
    [canEdit, selectedTable, serviceImagesSchema],
  );

  const getDefaultServiceImagesForService = useCallback(
    (serviceId) => {
      return getDefaultMasterServiceImagesForService({
        serviceId,
        serviceImageRows,
        masterServiceImageRelationField,
      });
    },
    [masterServiceImageRelationField, serviceImageRows],
  );

  const buildMasterServiceImageMutations = useCallback(async () => {
    return buildMasterServiceImageMutationsPayload({
      pendingServiceImagesByServiceId,
      serviceImagesSchema,
      serviceImageRows,
      masterServiceImageRelationField,
    });
  }, [
    masterServiceImageRelationField,
    pendingServiceImagesByServiceId,
    serviceImageRows,
    serviceImagesSchema,
  ]);

  const tableColumns = useMemo(() => {
    const hierarchyColumn = selfReferenceField
      ? [
          {
            key: '__hierarchy_path',
            label: 'Hierarchy',
            sortable: true,
            getSortValue: (row) => {
              const key = row?.id || row?._localId;
              return hierarchyPathByRowKey.get(key) || '';
            },
            renderCell: (row) => {
              const key = row?.id || row?._localId;
              const path = hierarchyPathByRowKey.get(key) || '';
              return (
                <span className={styles.hierarchyPath}>{path || '-'}</span>
              );
            },
          },
        ]
      : [];

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
              disabled={isReadonly || !canEdit}
            />
          );
        }

        if (column === selfReferenceField) {
          if (
            selectedTable === 'master_supplier_types' ||
            selectedTable === 'master_categories'
          ) {
            const currentId = String(row?.[column] || '').trim();
            const displayValue =
              selfReferenceSuggestionMaps.idToLabel.get(currentId) || currentId;

            return (
              <Main_Suggest
                defaultSuggestions={selfReferenceSuggestionMaps.suggestions}
                defaultValue={displayValue}
                onChange={(ov, nv) => {
                  const resolved = resolveSuggestionToReferenceId(nv);
                  if (!resolved.resolved) return;
                  handleCellChange(rowIndex, column, resolved.value);
                }}
                placeholder="Type to search parent..."
              />
            );
          }

          return (
            <Main_Dropdown
              defaultOptions={selfReferenceOptions}
              defaultSelectedOption={String(row?.[column] || '')}
              onChange={(ov, nv) => handleCellChange(rowIndex, column, nv)}
              size="S"
              disabled={!canEdit || isSaving}
            />
          );
        }

        return (
          <Main_TextField
            defaultValue={asInputValue(row?.[column])}
            onChange={(ov, nv) => handleCellChange(rowIndex, column, nv)}
            disabled={isReadonly || !canEdit}
            className={styles.cellTextField}
            placeholder=""
          />
        );
      },
    }));

    const serviceImageColumn =
      selectedTable === 'master_services'
        ? [
            {
              key: '__service_images',
              label: 'Service Images',
              sortable: false,
              renderCell: (row) => {
                const relationId = String(row?.id || '').trim();

                const pending = pendingServiceImagesByServiceId[relationId];
                const defaults = Array.isArray(pending)
                  ? sortByDisplayOrder(pending)
                  : getDefaultServiceImagesForService(relationId);

                return (
                  <div className={styles.uploadsCell}>
                    <Main_FileUploads
                      mode="image"
                      label=""
                      compact
                      compactButtonText="Upload"
                      tableCell
                      hoverPreview
                      defaultImages={defaults}
                      disabled={!canEdit || isSaving}
                      onChange={(ov, nv) =>
                        handleMasterServiceImagesChange(row, ov, nv)
                      }
                      onError={(uploadError) => {
                        console.error(
                          'Master service image upload error:',
                          uploadError,
                        );
                      }}
                    />
                  </div>
                );
              },
            },
          ]
        : [];

    return [
      ...hierarchyColumn,
      ...dataColumns,
      ...serviceImageColumn,
      {
        key: '__actions',
        label: 'Actions',
        sortable: false,
        renderCell: (row) => {
          return (
            <div className={styles.rowActionsGroup}>
              <AddNewBtn
                text="Insert Below"
                onClick={() => handleInsertRowAfter(row)}
                className={styles.inlineInsertBtn}
                disabled={isSaving || !canEdit}
              />
              <DeleteBtn
                text="Delete"
                onClick={() => handleDeleteRow(row)}
                disabled={isSaving || !canEdit}
                className={styles.inlineDeleteBtn}
              />
            </div>
          );
        },
      },
    ];
  }, [
    columns,
    draftRows,
    handleCellChange,
    handleDeleteRow,
    handleInsertRowAfter,
    handleMasterServiceImagesChange,
    hierarchyPathByRowKey,
    isSaving,
    canEdit,
    getDefaultServiceImagesForService,
    selfReferenceField,
    selfReferenceOptions,
    selfReferenceSuggestionMaps,
    resolveSuggestionToReferenceId,
    pendingServiceImagesByServiceId,
    selectedTable,
    schemaFieldByColumn,
  ]);

  const sanitizeRowForSave = useCallback(
    (row) => {
      const cleaned = {};
      Object.entries(row || {}).forEach(([key, value]) => {
        if (String(key).startsWith('_')) return;
        if (key === 'created_at' || key === 'updated_at') return;

        const schemaField = schemaFieldByColumn?.[key] || {};
        const hasReference = Boolean(normalizeReferenceTarget(schemaField));
        const isLikelyIdField = String(key).toLowerCase().endsWith('_id');

        if (value === '' && (hasReference || isLikelyIdField)) {
          cleaned[key] = null;
          return;
        }

        cleaned[key] = value;
      });

      if (!cleaned.id) {
        cleaned.id = uuidv4();
      }

      return cleaned;
    },
    [schemaFieldByColumn],
  );

  const getMasterControlDryRunData = useCallback(async () => {
    const originalById = new Map();
    const draftById = new Map();

    const sanitizedOriginalRows = (originalRows || []).map((row) =>
      sanitizeRowForSave(row),
    );
    const sanitizedDraftRows = (draftRows || []).map((row) =>
      sanitizeRowForSave(row),
    );

    sanitizedOriginalRows.forEach((row) => {
      const id = String(row?.id || '').trim();
      if (id) originalById.set(id, row);
    });

    sanitizedDraftRows.forEach((row) => {
      const id = String(row?.id || '').trim();
      if (id) draftById.set(id, row);
    });

    const createRows = [];
    const updateRows = [];

    sanitizedDraftRows.forEach((row) => {
      const id = String(row?.id || '').trim();
      if (!id || !originalById.has(id)) {
        createRows.push(row);
        return;
      }

      const originalRow = originalById.get(id);
      if (JSON.stringify(originalRow) !== JSON.stringify(row)) {
        updateRows.push(row);
      }
    });

    const deleteRows = [];
    sanitizedOriginalRows.forEach((row) => {
      const id = String(row?.id || '').trim();
      if (id && !draftById.has(id)) {
        deleteRows.push({ id });
      }
    });

    const upsertRows = [...createRows, ...updateRows];
    let hasRelatedChanges = false;

    const preview = {
      endpoint: 'http://localhost:3001/api/v1/trade_business/master/rows',
      method: 'POST',
      table: selectedTable,
      create: { [selectedTable]: createRows },
      update: { [selectedTable]: updateRows },
      delete: { [selectedTable]: deleteRows },
      payload: {
        data: {
          [selectedTable]: upsertRows,
        },
      },
    };

    if (selectedTable === 'master_services') {
      const { deleteRows: imageDeleteRows, upsertRows: imageUpsertRows } =
        await buildMasterServiceImageMutations();

      const { hasRelatedChanges: hasServiceImageChanges, relatedPayload } =
        buildMasterServiceImagesRelatedDryRunPreview({
          imageDeleteRows,
          imageUpsertRows,
        });
      hasRelatedChanges = hasServiceImageChanges;

      preview.relatedPayloads = {
        master_service_images: relatedPayload,
      };
    }

    preview.message =
      upsertRows.length === 0 && deleteRows.length === 0 && !hasRelatedChanges
        ? 'No changes detected'
        : undefined;

    return preview;
  }, [
    buildMasterServiceImageMutations,
    draftRows,
    originalRows,
    sanitizeRowForSave,
    selectedTable,
  ]);

  const handleSaveAll = useCallback(async () => {
    if (!canEdit) return;
    if (!selectedTable) return;

    setIsSaving(true);
    setError('');
    setSaveSuccess(false);
    setSaveError('');
    try {
      const payloadRows = draftRows.map((row) => sanitizeRowForSave(row));

      if (selectedTable === 'master_services') {
        const { deleteRows, upsertRows } =
          await buildMasterServiceImageMutations();

        if (deleteRows.length > 0) {
          await deleteMasterTableData('master_service_images', deleteRows);
        }

        if (upsertRows.length > 0) {
          await updateMasterTableData('master_service_images', upsertRows);
        }
      }

      if (payloadRows.length > 0) {
        await updateMasterTableData(selectedTable, payloadRows);
      }
      await loadTableData();
      setSaveSuccess(true);
    } catch (err) {
      const message = err?.message || 'Failed to save master table rows';
      setError(message);
      setSaveError(message);
    } finally {
      setIsSaving(false);
    }
  }, [
    buildMasterServiceImageMutations,
    deleteMasterTableData,
    canEdit,
    draftRows,
    loadTableData,
    sanitizeRowForSave,
    selectedTable,
    updateMasterTableData,
  ]);

  return (
    <MasterControlSavePageContainer
      saveButtonText="Save All"
      successMessage="Master rows saved successfully!"
      showSaveButton={canEdit && Boolean(selectedTable)}
      customSaveAction={handleSaveAll}
      dryRunAction={getMasterControlDryRunData}
      isSaving={isSaving}
      saveSuccess={saveSuccess}
      saveError={saveError}
    >
      <div className={styles.container}>
        <MasterControlHeader
          isLoading={isLoading}
          isSaving={isSaving}
          selectedTable={selectedTable}
          canEdit={canEdit}
          onReload={handleReload}
          onAddRow={handleAddRow}
        />

        {!canEdit ? (
          <div className={styles.authNotice}>
            Please login to edit master data. View mode is enabled.
          </div>
        ) : null}

        <div className={styles.main}>
          <MasterControlSidebar
            tableNames={tableNames}
            selectedTable={selectedTable}
            onSelect={setSelectedTable}
          />

          <MasterControlTablePanel
            error={error}
            rows={draftRows}
            columns={tableColumns}
            rowKey={(row, rowIndex) => row.id || row._localId || rowIndex}
          />
        </div>
      </div>
    </MasterControlSavePageContainer>
  );
};

const Main_MasterControl = () => {
  return <MasterControlContent />;
};

export default Main_MasterControl;
