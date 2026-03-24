export const getDragPlacementUiState = ({
  draggedKey,
  overKey,
  currentKey,
}) => {
  const isDragging = draggedKey !== null && draggedKey !== undefined;
  const isDraggedItem = isDragging && draggedKey === currentKey;
  const isDropTarget =
    isDragging &&
    overKey !== null &&
    overKey !== undefined &&
    overKey === currentKey &&
    !isDraggedItem;

  return {
    isDragging,
    isDraggedItem,
    isDropTarget,
  };
};

export const DRAG_READY_LABEL = 'Release to place';
