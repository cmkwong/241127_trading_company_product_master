import { useCallback } from 'react';

// Generic utility function for handling row changes in any component
export const useRowsHandler = (
  items,
  updateProductPageData,
  fieldName,
  defaultItemTemplate,
  rowRefs
) => {
  return useCallback(
    (newRowCount) => {
      // Ensure items array has the correct number of items
      const currentItems = [...items];

      // If we need more rows, add empty ones
      if (newRowCount > currentItems.length) {
        for (let i = currentItems.length; i < newRowCount; i++) {
          // Use the provided template function to create a new item
          // This allows each component to define its own item structure
          const newItem =
            typeof defaultItemTemplate === 'function'
              ? defaultItemTemplate(i)
              : { ...defaultItemTemplate, id: i + 1 };

          currentItems.push(newItem);
        }

        // Update the context with the new array
        updateProductPageData(fieldName, currentItems);

        // Focus the new row after a short delay if rowRefs is provided
        if (rowRefs && rowRefs.current) {
          setTimeout(() => {
            const newRowIndex = newRowCount - 1;
            if (rowRefs.current[newRowIndex]) {
              rowRefs.current[newRowIndex].focus();
            }
          }, 50);
        }
      }
      // If we need fewer rows, remove from the end
      else if (newRowCount < currentItems.length) {
        currentItems.splice(newRowCount);
        updateProductPageData(fieldName, currentItems);
      }
    },
    [items, updateProductPageData, fieldName, defaultItemTemplate, rowRefs]
  );
};
