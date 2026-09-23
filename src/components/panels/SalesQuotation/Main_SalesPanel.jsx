import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useSalesQuotationContext } from '../../../store/SalesQuotationContext';
import { useMasterContext } from '../../../store/MasterContext';
import { toSafeString } from './utils/quotationTotals';
import Main_SalesDocument from './Main_SalesDocument';

const SALES_ROUTE_PATH = '/panel/sales';
const DEFAULT_DOC_TYPE_NAME = 'Sales Quotation';
const DOC_TYPE_NAMES = [
  'Sales Order',
  'Delivery Note',
  'AR Downpayment Invoice',
  'AR Invoice',
  'Packing List',
];

const Main_SalesPanel = () => {
  const { quotations, selectedQuotationId } = useSalesQuotationContext();
  const { getDocTypeIdByName } = useMasterContext();
  const { quotation_id } = useParams();

  const selectedDocTypeId = useMemo(() => {
    const id = toSafeString(quotation_id || selectedQuotationId);
    if (!id) return '';
    const selectedDoc = (quotations || []).find(
      (item) => toSafeString(item?.id) === id,
    );
    return toSafeString(selectedDoc?.doc_type);
  }, [quotation_id, selectedQuotationId, quotations]);

  const docTypeName = useMemo(() => {
    if (!selectedDocTypeId) {
      return DEFAULT_DOC_TYPE_NAME;
    }

    const matchedName = DOC_TYPE_NAMES.find(
      (name) => selectedDocTypeId === getDocTypeIdByName(name),
    );

    return matchedName || DEFAULT_DOC_TYPE_NAME;
  }, [selectedDocTypeId, getDocTypeIdByName]);

  return (
    <Main_SalesDocument
      docTypeName={docTypeName}
      routePath={SALES_ROUTE_PATH}
    />
  );
};

export default Main_SalesPanel;
