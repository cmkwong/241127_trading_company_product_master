import { useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Main_InputContainer from '../../../common/Container/Main_InputContainer';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import EditableDataForm from '../../../common/Forms/EditableDataForm';
import {
  upsertEntityData,
  useEntityRows,
} from '../../../../store/GeneralContext';

const METHOD_TYPE_OPTIONS = [
  { id: 'card', name: 'Card' },
  { id: 'bank_account', name: 'Bank Account' },
];

const Main_UserPaymentMethod = () => {
  const paymentRows = useEntityRows('user', 'user_payment_methods');

  const upsertRow = useCallback(
    (row, patch) => {
      upsertEntityData('user', {
        user_payment_methods: [
          { id: row?.id || uuidv4(), method_type: 'card', ...patch },
        ],
      });
    },
    [],
  );

  const handleAddPayment = useCallback(() => {
    upsertEntityData('user', {
      user_payment_methods: [
        { id: uuidv4(), method_type: 'card', is_default: false, status: 'active' },
      ],
    });
  }, []);

  const handleRemovePayment = useCallback((row) => {
    if (!row?.id) return;
    upsertEntityData('user', {
      user_payment_methods: [{ id: row.id, _delete: true }],
    });
  }, []);

  const columns = useMemo(
    () => [
      {
        key: 'method_type',
        label: 'Type',
        sortType: 'string',
        maxWidth: '150px',
        renderCell: (row) => (
          <Main_Dropdown
            defaultOptions={METHOD_TYPE_OPTIONS}
            defaultSelectedOption={row.method_type || 'card'}
            onChange={(ov, nv) => upsertRow(row, { method_type: nv })}
          />
        ),
      },
      {
        key: 'card_brand',
        label: 'Brand',
        sortType: 'string',
        maxWidth: '150px',
        renderCell: (row) => (
          <Main_TextField
            defaultValue={row.card_brand || ''}
            placeholder="Visa / Mastercard"
            onChange={(ov, nv) => upsertRow(row, { card_brand: nv })}
          />
        ),
      },
      {
        key: 'last_four',
        label: 'Last 4',
        sortType: 'string',
        maxWidth: '110px',
        renderCell: (row) => (
          <Main_TextField
            defaultValue={row.last_four || ''}
            placeholder="1234"
            onChange={(ov, nv) => upsertRow(row, { last_four: nv })}
          />
        ),
      },
      {
        key: 'expiry_month',
        label: 'Exp. Month',
        sortType: 'string',
        nextRow: true,
        maxWidth: '120px',
        renderCell: (row) => (
          <Main_TextField
            defaultValue={row.expiry_month != null ? String(row.expiry_month) : ''}
            placeholder="MM"
            onChange={(ov, nv) =>
              upsertRow(row, { expiry_month: nv === '' ? null : Number(nv) })
            }
          />
        ),
      },
      {
        key: 'expiry_year',
        label: 'Exp. Year',
        sortType: 'string',
        maxWidth: '120px',
        renderCell: (row) => (
          <Main_TextField
            defaultValue={row.expiry_year != null ? String(row.expiry_year) : ''}
            placeholder="YYYY"
            onChange={(ov, nv) =>
              upsertRow(row, { expiry_year: nv === '' ? null : Number(nv) })
            }
          />
        ),
      },
      {
        key: 'provider',
        label: 'Provider',
        sortType: 'string',
        maxWidth: '150px',
        renderCell: (row) => (
          <Main_TextField
            defaultValue={row.provider || ''}
            placeholder="Stripe"
            onChange={(ov, nv) => upsertRow(row, { provider: nv })}
          />
        ),
      },
      {
        key: 'is_default',
        label: 'Default',
        sortType: 'string',
        nextRow: true,
        maxWidth: '120px',
        renderCell: (row) => (
          <Main_Dropdown
            defaultOptions={[
              { id: 'false', name: 'No' },
              { id: 'true', name: 'Yes' },
            ]}
            defaultSelectedOption={row.is_default ? 'true' : 'false'}
            onChange={(ov, nv) => upsertRow(row, { is_default: nv === 'true' })}
          />
        ),
      },
      {
        key: 'status',
        label: 'Status',
        sortType: 'string',
        maxWidth: '120px',
        renderCell: (row) => (
          <Main_Dropdown
            defaultOptions={[
              { id: 'active', name: 'Active' },
              { id: 'expired', name: 'Expired' },
              { id: 'removed', name: 'Removed' },
            ]}
            defaultSelectedOption={row.status || 'active'}
            onChange={(ov, nv) => upsertRow(row, { status: nv })}
          />
        ),
      },
    ],
    [upsertRow],
  );

  return (
    <Main_InputContainer label="My Payment Methods">
      <EditableDataForm
        rows={paymentRows}
        columns={columns}
        rowKey="id"
        emptyMessage="No payment methods yet. Click + Add Payment Method."
        onAddRow={handleAddPayment}
        addRowText="Add Payment Method"
        onRemoveRow={handleRemovePayment}
      />
    </Main_InputContainer>
  );
};

export default Main_UserPaymentMethod;
