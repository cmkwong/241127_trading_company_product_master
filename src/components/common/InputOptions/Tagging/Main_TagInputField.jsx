import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import Sub_TagPlate from './Sub_TagPlate';
import Sub_TagTextField from './Sub_TagTextField';
import Sub_TagList from './Sub_TagList';
import styles from './Main_TagInputField.module.css';
import { v4 as uuidv4 } from 'uuid';

const EMPTY_OPTIONS = [];
const EMPTY_SELECTED_OPTIONS = [];

const Main_TagInputField = (props) => {
  const {
    onChange = () => {},
    onAddNewOption = () => {},
    // Uncontrolled defaults
    defaultOptions = EMPTY_OPTIONS,
    defaultSelectedOptions = EMPTY_SELECTED_OPTIONS,
    // Control options
    canAddNewOptions = true,
    enableHierarchyViewToggle = false,
    hierarchyToggleLabel = 'Show hierarchy',
  } = props;

  // Internal state
  const [options, setOptions] = useState(defaultOptions);
  const [selectedOptions, setSelectedOptions] = useState(
    defaultSelectedOptions,
  );

  useEffect(() => {
    setOptions(defaultOptions);
  }, [defaultOptions]);

  useEffect(() => {
    setSelectedOptions(defaultSelectedOptions);
  }, [defaultSelectedOptions]);

  // UI controls
  const inputReference = useRef(null);
  const containerRef = useRef(null);
  const [inputValue, setInputValue] = useState('');
  const [showOption, setShowOption] = useState(false);
  const [selectionMouseIn, setSelectionMouseIn] = useState(false);
  const [showHierarchy, setShowHierarchy] = useState(enableHierarchyViewToggle);
  const [collapsedNodeIds, setCollapsedNodeIds] = useState(new Set());

  useEffect(() => {
    if (enableHierarchyViewToggle) {
      setShowHierarchy(true);
      return;
    }

    setShowHierarchy(false);
  }, [enableHierarchyViewToggle]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setShowOption(false);
      }
    };

    if (showOption) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showOption]);

  const parentById = useMemo(() => {
    const map = new Map();
    (options || []).forEach((item) => {
      map.set(item?.id, item?.parent_id ?? null);
    });
    return map;
  }, [options]);

  const getAncestorIds = useCallback(
    (startId) => {
      const ancestors = [];
      const visited = new Set([startId]);
      let cursor = parentById.get(startId);

      while (cursor != null && !visited.has(cursor)) {
        ancestors.push(cursor);
        visited.add(cursor);
        cursor = parentById.get(cursor);
      }

      return ancestors;
    },
    [parentById],
  );

  // Update selection for one option
  const updateOptionData = useCallback(
    (id, checked) => {
      const oldSelected = selectedOptions || [];
      const ancestorIds = checked ? getAncestorIds(id) : [];
      const nextSelected = checked
        ? Array.from(new Set([...(selectedOptions || []), id, ...ancestorIds]))
        : (selectedOptions || []).filter((x) => x !== id);

      setSelectedOptions(nextSelected);
      onChange?.(oldSelected, nextSelected);
    },
    [selectedOptions, onChange, getAncestorIds],
  );
  // Internal addOptionData
  const addOptionData = useCallback(
    (name) => {
      const oldSelected = selectedOptions || [];
      const trimmed = (name || '').trim();
      if (!trimmed) return;

      // Check duplicates (case-insensitive)
      const dup = (options || []).filter(
        (el) => el.name.toLowerCase() === trimmed.toLowerCase(),
      );
      if (dup.length > 0) {
        dup.forEach((el) => updateOptionData(el.id, true));
        return;
      }

      // Check if adding new options is allowed
      if (!canAddNewOptions) return;

      // Add new option
      const newId = uuidv4();
      const newOption = { id: newId, name: trimmed };
      const nextOptions = [...(options || []), newOption];
      const nextSelected = Array.from(
        new Set([...(selectedOptions || []), newId]),
      );

      setOptions(nextOptions);
      setSelectedOptions(nextSelected);
      onChange?.(oldSelected, nextSelected);
      onAddNewOption?.(newOption);
    },
    [
      selectedOptions,
      onChange,
      updateOptionData,
      options,
      canAddNewOptions,
      onAddNewOption,
    ],
  );

  // add the value into option
  const handleEnterPress = (value) => {
    if (!value) return;
    // hide the option choice
    setShowOption(false);
    // clear the value after enter pressed
    if (inputReference.current) inputReference.current.value = '';
    setInputValue('');
    // add data into option
    addOptionData(value);
  };

  // handle layout
  const handleFocus = () => {
    setShowOption(true);
  };
  const handleFocusOut = () => {
    if (!selectionMouseIn) {
      setShowOption(false);
    }
  };

  const handleSelectionMouseEnter = () => {
    setSelectionMouseIn(true);
  };
  const handleSelectionMouseOut = () => {
    setSelectionMouseIn(false);
  };
  const handleClickSelection = () => {
    // inputReference.current.focus();
  };

  const filteredOptions = useMemo(() => {
    if (!inputValue) return options || [];
    const v = inputValue.toLowerCase();
    return (options || []).filter((el) => {
      return el.name.toLowerCase().includes(v);
    });
  }, [options, inputValue]);

  useEffect(() => {
    const validIds = new Set((options || []).map((item) => item?.id));

    setCollapsedNodeIds((prev) => {
      if (!prev || prev.size === 0) return prev;

      const next = new Set();
      prev.forEach((id) => {
        if (validIds.has(id)) {
          next.add(id);
        }
      });

      if (next.size === prev.size) {
        return prev;
      }

      return next;
    });
  }, [options]);

  const hierarchicalOptions = useMemo(() => {
    const source = options || [];
    if (!source.length) return [];

    const byId = new Map(source.map((o) => [o.id, o]));
    const childrenByParent = new Map();

    source.forEach((item) => {
      const parentKey = item?.parent_id ?? null;
      if (!childrenByParent.has(parentKey)) {
        childrenByParent.set(parentKey, []);
      }
      childrenByParent.get(parentKey).push(item);
    });

    // Treat items with missing parent references as roots.
    const roots = source.filter((item) => {
      const p = item?.parent_id;
      return p == null || !byId.has(p);
    });

    const visited = new Set();
    const result = [];

    const walk = (node, level, isVisible = true) => {
      if (!node || visited.has(node.id)) return;
      visited.add(node.id);

      const children = childrenByParent.get(node.id) || [];
      const hasChildren = children.length > 0;
      const isCollapsed = collapsedNodeIds.has(node.id);

      if (isVisible) {
        result.push({ ...node, level, hasChildren, isCollapsed });
      }

      const childrenVisible = isVisible && !isCollapsed;
      children.forEach((child) => walk(child, level + 1, childrenVisible));
    };

    roots.forEach((root) => walk(root, 0, true));

    // Append any disconnected/cyclic leftovers safely.
    source.forEach((item) => {
      if (!visited.has(item.id)) {
        walk(item, 0, true);
      }
    });

    return result;
  }, [options, collapsedNodeIds]);

  const toggleNodeCollapsed = useCallback((id) => {
    if (!id) return;

    setCollapsedNodeIds((prev) => {
      const next = new Set(prev || []);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const displayOptions = useMemo(() => {
    // If searching, keep match-focused flat list even in hierarchy mode.
    if (inputValue) {
      return filteredOptions.map((item) => ({
        ...item,
        level: 0,
        hasChildren: false,
        isCollapsed: false,
      }));
    }
    if (showHierarchy) {
      return hierarchicalOptions;
    }
    return (options || []).map((item) => ({
      ...item,
      level: 0,
      hasChildren: false,
      isCollapsed: false,
    }));
  }, [
    inputValue,
    filteredOptions,
    showHierarchy,
    hierarchicalOptions,
    options,
  ]);

  const shouldShowAddNewHint =
    canAddNewOptions &&
    (inputValue || '').trim().length > 0 &&
    displayOptions.length === 0;

  const selectedTagOptions = useMemo(() => {
    const sourceOptions = options || [];
    const selectedSet = new Set(selectedOptions || []);
    if (selectedSet.size === 0) return [];

    const byId = new Map(sourceOptions.map((item) => [item.id, item]));
    const levelCache = new Map();

    const getLevel = (id, stack = new Set()) => {
      if (!id || !byId.has(id)) return 0;
      if (levelCache.has(id)) return levelCache.get(id);
      if (stack.has(id)) return 0;

      const nextStack = new Set(stack);
      nextStack.add(id);

      const parentId = byId.get(id)?.parent_id;
      const level =
        parentId && byId.has(parentId) ? getLevel(parentId, nextStack) + 1 : 0;

      levelCache.set(id, level);
      return level;
    };

    return sourceOptions
      .filter((item) => selectedSet.has(item.id))
      .map((item, index) => ({
        ...item,
        _level: getLevel(item.id),
        _sourceIndex: index,
      }))
      .sort((a, b) => {
        if (a._level !== b._level) return a._level - b._level;
        return a._sourceIndex - b._sourceIndex;
      });
  }, [options, selectedOptions]);

  const addNewWord = (inputValue || '').trim();

  return (
    <>
      <div ref={containerRef} className={styles.inputOption}>
        {enableHierarchyViewToggle && (
          <label className={styles.hierarchyToggle}>
            <input
              type="checkbox"
              checked={showHierarchy}
              onChange={(e) => setShowHierarchy(e.target.checked)}
            />
            <span>{hierarchyToggleLabel}</span>
          </label>
        )}

        <Sub_TagTextField
          reference={inputReference}
          onClick={handleFocus}
          onBlur={handleFocusOut}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              handleEnterPress(event.target.value);
            }
            if (event.key === 'Escape') {
              setShowOption(false);
            }
          }}
          // sorting the key words
          onChange={(ov, nv) => setInputValue(nv)}
        />
        {showOption && (
          <Sub_TagList
            handleSelectionMouseEnter={handleSelectionMouseEnter}
            handleSelectionMouseOut={handleSelectionMouseOut}
            handleClickSelection={handleClickSelection}
            filteredOptions={displayOptions}
            selectedOptions={selectedOptions}
            updateOptionData={updateOptionData}
            showHierarchy={showHierarchy && !inputValue}
            onToggleCollapse={toggleNodeCollapsed}
            showAddNewHint={shouldShowAddNewHint}
            addNewWord={addNewWord}
            onAddNewClick={() => handleEnterPress(addNewWord)}
          />
        )}
      </div>
      <div className={styles.tagContainer}>
        {selectedTagOptions.map((el) => (
          // Showing the tag plate
          <Sub_TagPlate
            key={el.id}
            id={el.id}
            name={el.name}
            updateOptionData={updateOptionData}
          />
        ))}
      </div>
    </>
  );
};

export default Main_TagInputField;
