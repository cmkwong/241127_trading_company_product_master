import { useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';
import Main_TextArea from '../../../common/InputOptions/Textarea/Main_TextArea';
import Main_FileUploads from '../../../common/InputOptions/FileUploads/Main_FileUploads';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import EmptyState from '../../../common/State/EmptyState';
import RemoveRowBtn from '../../../common/Buttons/RemoveRowBtn';
import styles from './Main_CertificateData.module.css';
import { useProductContext } from '../../../../store/ProductContext';
import { useMasterContext } from '../../../../store/MasterContext';
import { sortByDisplayOrder } from '../../../../utils/arr';

const Main_CertificateData = () => {
  const { pageData, upsertProductPageData } = useProductContext();
  const { certType } = useMasterContext();
  const certificateRows = pageData.product_certificates || [];

  const certTypeOptions = useMemo(
    () =>
      (certType || []).map((item) => ({
        id: item.id,
        label: item.label ?? item.name ?? '',
      })),
    [certType],
  );

  const upsertCertificateRow = useCallback(
    (row, patch) => {
      upsertProductPageData({
        product_certificates: [
          {
            id: row?.id || uuidv4(),
            product_id: pageData.id,
            ...patch,
          },
        ],
      });
    },
    [upsertProductPageData, pageData.id],
  );

  const handleAddCertificateRow = useCallback(() => {
    upsertProductPageData({
      product_certificates: [
        {
          id: uuidv4(),
          product_id: pageData.id,
          certificate_type_id: '',
          remark: '',
          product_certificate_files: [],
        },
      ],
    });
  }, [upsertProductPageData, pageData.id]);

  const handleDeleteCertificateRow = useCallback(
    (row) => {
      if (!row?.id) return;

      upsertProductPageData({
        product_certificates: [
          {
            id: row.id,
            _delete: true,
          },
        ],
      });
    },
    [upsertProductPageData],
  );

  const handleCertificateFilesChange = useCallback(
    (row, oldFiles = [], newFiles = []) => {
      const oldList = Array.isArray(oldFiles) ? oldFiles : [];
      const newList = Array.isArray(newFiles) ? newFiles : [];

      const removedFiles = oldList.filter(
        (oldFile) => !newList.some((newFile) => newFile.id === oldFile.id),
      );

      const addedFiles = newList.filter(
        (newFile) => !oldList.some((oldFile) => oldFile.id === newFile.id),
      );

      const sameLength = oldList.length === newList.length;
      const sameOrder =
        sameLength && oldList.every((file, i) => file.id === newList[i]?.id);

      if (removedFiles.length === 0 && addedFiles.length === 0 && sameOrder) {
        return;
      }

      if (removedFiles.length > 0) {
        upsertCertificateRow(row, {
          product_certificate_files: removedFiles.map((file) => ({
            id: file.id,
            _delete: true,
          })),
        });
      }

      if (newList.length > 0) {
        const addedFileIds = new Set(addedFiles.map((file) => file.id));

        upsertCertificateRow(row, {
          product_certificate_files: newList.map((file, index) => ({
            id: file.id,
            display_order: index + 1,
            ...(addedFileIds.has(file.id)
              ? {
                  file_name: file.name,
                  file_size: file.size,
                  file_type: file.type,
                  file_url: file.url,
                }
              : {}),
          })),
        });
      }
    },
    [upsertCertificateRow],
  );

  const dropdownCertTypeOptions = useMemo(
    () =>
      certTypeOptions.map((item) => ({
        id: item.id,
        name: item.label,
      })),
    [certTypeOptions],
  );

  return (
    <Main_InputContainer
      label="Certificates"
      onAddNew={handleAddCertificateRow}
      addNewText="Add Certificate"
    >
      <div className={styles.certificateRows}>
        {certificateRows.length === 0 ? (
          <EmptyState message="No certificates yet. Click Add Certificate." />
        ) : (
          certificateRows.map((row, index) => {
            const defaultFiles = sortByDisplayOrder(
              row.product_certificate_files || [],
            ).map((file, fileIndex) => ({
              id: file.id || uuidv4(),
              name: file.file_name || `file_${fileIndex + 1}`,
              size: file.file_size || file._file_size || 0,
              type:
                file.file_type || file._file_type || 'application/octet-stream',
              url: file.file_url || '',
              display_order: file.display_order,
            }));

            return (
              <div
                key={row?.id || `certificate-row-${index}`}
                className={styles.certificateRowCard}
              >
                <div className={styles.rowTools}>
                  <span className={styles.rowToolsSpacer} aria-hidden="true" />
                  <RemoveRowBtn
                    ariaLabel="Delete certificate row"
                    title="Delete certificate row"
                    onClick={() => handleDeleteCertificateRow(row)}
                  />
                </div>

                <div className={styles.certificateTypeField}>
                  <label className={styles.fieldLabel}>Certificate Type</label>
                  <div className={styles.dropdownInputWrap}>
                    <Main_Dropdown
                      matchParentWidth
                      defaultOptions={dropdownCertTypeOptions}
                      defaultSelectedOption={row.certificate_type_id || ''}
                      onChange={(ov, nv) =>
                        upsertCertificateRow(row, {
                          certificate_type_id: nv,
                        })
                      }
                    />
                  </div>
                </div>

                <div className={styles.bottomRow}>
                  <div className={styles.filesBlock}>
                    <div className={styles.filesUploaderWrap}>
                      <Main_FileUploads
                        mode="file"
                        label=""
                        compact
                        tableCell
                        compactButtonText="Upload"
                        defaultFiles={defaultFiles}
                        maxFiles={5}
                        maxSizeInMB={2}
                        acceptedTypes={[
                          'application/pdf',
                          'application/msword',
                          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                          'image/jpeg',
                          'image/jpg',
                          'image/png',
                          'image/gif',
                          'image/webp',
                          'image/svg+xml',
                          'image/bmp',
                          'image/tiff',
                        ]}
                        onChange={(ov, nv) =>
                          handleCertificateFilesChange(row, ov, nv)
                        }
                        onError={(errorMessage) => {
                          console.error(`File upload error: ${errorMessage}`);
                        }}
                      />
                    </div>
                    <div className={styles.scrollbarTrack}>
                      <div className={styles.scrollbarThumb} />
                    </div>
                  </div>

                  <div className={styles.remarkBlock}>
                    <label className={styles.fieldLabel}>Remark</label>
                    <div className={styles.remarkInputWrap}>
                      <Main_TextArea
                        defaultValue={row.remark || ''}
                        placeholder="Add remark..."
                        rows={2}
                        resize="none"
                        onChange={(ov, nv) =>
                          upsertCertificateRow(row, { remark: nv })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Main_InputContainer>
  );
};

export default Main_CertificateData;
