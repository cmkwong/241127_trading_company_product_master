import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';
import styles from './Main_FileUploads.module.css';

const TERMINAL_STATUSES = ['completed', 'completed-with-errors', 'failed'];

/**
 * Modal that collects the AI editing prompt and submits it, then shows live
 * progress while the background job runs and a result summary once finished.
 *
 * Presentational only: the parent (Main_FileUploads) owns the network calls and
 * passes the current job state down.
 */
const Sub_AiPromptModal = ({
  isOpen,
  onClose,
  defaultPrompt = '',
  selectedCount = 0,
  selectedImages = [],
  isGenerating = false,
  job = null,
  error = null,
  onGenerate = () => {},
  onReload = null,
}) => {
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [modalPosition, setModalPosition] = useState(null);
  const dragStateRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setPrompt(defaultPrompt);
      setModalPosition(null);
    }
  }, [isOpen, defaultPrompt]);

  if (!isOpen) return null;

  const handleHeaderPointerDown = (event) => {
    const modal = event.currentTarget.closest('[data-ai-prompt-modal]');
    if (!modal) return;

    const rect = modal.getBoundingClientRect();
    dragStateRef.current = {
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
    };
    setModalPosition({ left: rect.left, top: rect.top });
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handleHeaderPointerMove = (event) => {
    if (!dragStateRef.current) return;
    setModalPosition({
      left: event.clientX - dragStateRef.current.offsetX,
      top: event.clientY - dragStateRef.current.offsetY,
    });
  };

  const handleHeaderPointerUp = (event) => {
    dragStateRef.current = null;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const status = job?.status || (isGenerating ? 'processing' : 'idle');
  const isTerminal = TERMINAL_STATUSES.includes(status);

  const results = Array.isArray(job?.results) ? job.results : [];
  const completedCount = results.filter((r) => r.status === 'completed').length;
  const failedCount = results.filter((r) => r.status === 'failed').length;

  const canSubmit =
    !isGenerating && !isTerminal && String(prompt).trim().length > 0;
  const hasCompleted = completedCount > 0 && typeof onReload === 'function';

  let statusLine = null;
  if (isGenerating || status === 'processing') {
    statusLine = (
      <div className={styles.aiPromptProgress}>
        {job ? `Processing ${job.processed}/${job.total}…` : 'Submitting…'}
      </div>
    );
  } else if (status === 'completed') {
    statusLine = (
      <div className={styles.aiPromptSuccess}>
        Completed {completedCount} of {job.total} image(s).
      </div>
    );
  } else if (status === 'completed-with-errors') {
    statusLine = (
      <div className={styles.aiPromptError}>
        Completed {completedCount}, failed {failedCount} of {job.total}.
      </div>
    );
  } else if (status === 'failed') {
    statusLine = (
      <div className={styles.aiPromptError}>
        AI generation failed{job?.error ? `: ${job.error}` : '.'}
      </div>
    );
  } else if (error) {
    statusLine = <div className={styles.aiPromptError}>{error}</div>;
  }

  return createPortal(
    <div
      className={`${styles.sequenceEditorOverlay} ${styles.aiPromptOverlay}`}
      onClick={onClose}
    >
      <div
        className={`${styles.sequenceEditorModal} ${styles.aiPromptModal}`}
        data-ai-prompt-modal="true"
        style={
          modalPosition
            ? {
                left: `${modalPosition.left}px`,
                top: `${modalPosition.top}px`,
                transform: 'none',
              }
            : undefined
        }
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`${styles.sequenceEditorHeader} ${styles.aiPromptHeader}`}
          onPointerDown={handleHeaderPointerDown}
          onPointerMove={handleHeaderPointerMove}
          onPointerUp={handleHeaderPointerUp}
          onPointerCancel={handleHeaderPointerUp}
        >
          <div className={styles.sequenceEditorHeaderText}>
            <div className={styles.sequenceEditorTitle}>AI Edit Images</div>
            <div className={styles.sequenceEditorHint}>
              Drag this bar to move the window. Enter the prompt used to edit
              the selected image(s).
            </div>
          </div>
        </div>

        <div className={styles.aiPromptBody}>
          <div className={styles.aiPromptTargets}>
            <div className={styles.aiPromptTargetsHeader}>
              {selectedImages.length} image(s) will be processed:
            </div>
            {selectedImages.length === 0 ? (
              <div className={styles.aiPromptTargetEmpty}>
                No images selected.
              </div>
            ) : (
              <ul className={styles.aiPromptTargetList}>
                {selectedImages.map((img) => (
                  <li key={img.id} className={styles.aiPromptTargetItem}>
                    <span
                      className={styles.aiPromptTargetId}
                      title={img.id}
                    >
                      {img.id}
                    </span>
                    {img.name && (
                      <span className={styles.aiPromptTargetName}>
                        {img.name}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <textarea
            className={styles.aiPromptTextarea}
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            disabled={isGenerating}
            placeholder="Describe how to edit the image…"
            spellCheck={false}
          />
          <div className={styles.aiPromptToolbar}>
            <button
              type="button"
              className={styles.aiPromptResetLink}
              onClick={() => setPrompt(defaultPrompt)}
              disabled={isGenerating}
            >
              Reset to default
            </button>
          </div>
          {statusLine}
        </div>

        <div className={styles.sequenceEditorFooter}>
          <div className={styles.sequenceEditorFooterLeft}>
            <span className={styles.sequenceEditorFooterTotal}>
              {selectedCount}
            </span>
            <span className={styles.sequenceEditorFooterSelected}>
              {selectedCount === 1 ? 'image selected' : 'images selected'}
            </span>
          </div>

          <div className={styles.aiPromptActions}>
            {hasCompleted && (
              <button
                type="button"
                className={styles.aiPromptSecondaryBtn}
                onClick={() => {
                  onReload();
                  onClose();
                }}
              >
                Reload to view
              </button>
            )}
            {isTerminal || isGenerating ? (
              <button
                type="button"
                className={styles.sequenceEditorCloseBtn}
                onClick={onClose}
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating…' : 'Close'}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className={styles.aiPromptSecondaryBtn}
                  onClick={onClose}
                  disabled={isGenerating}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.aiPromptPrimaryBtn}
                  onClick={() => onGenerate(prompt)}
                  disabled={!canSubmit}
                >
                  Generate
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

Sub_AiPromptModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  defaultPrompt: PropTypes.string,
  selectedCount: PropTypes.number,
  selectedImages: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
    }),
  ),
  isGenerating: PropTypes.bool,
  job: PropTypes.shape({
    status: PropTypes.string,
    total: PropTypes.number,
    processed: PropTypes.number,
    error: PropTypes.string,
    results: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        status: PropTypes.string,
        image_url: PropTypes.string,
        taskId: PropTypes.string,
        error: PropTypes.string,
      }),
    ),
  }),
  error: PropTypes.string,
  onGenerate: PropTypes.func,
  onReload: PropTypes.func,
};

export default Sub_AiPromptModal;
