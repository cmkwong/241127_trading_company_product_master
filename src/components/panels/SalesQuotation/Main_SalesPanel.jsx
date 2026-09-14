import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useSalesQuotationContext } from '../../../store/SalesQuotationContext';
import { useMasterContext } from '../../../store/MasterContext';
import { toSafeString } from './utils/quotationTotals';
import Main_SalesQuotation from './Main_SalesQuotation';
import Main_SalesOrder from './Main_SalesOrder';
import Main_SalesDN from './Main_SalesDN';
import Main_SalesDPINV from './Main_SalesDPINV';
import Main_SalesINV from './Main_SalesINV';

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

  if (
    selectedDocTypeId &&
    selectedDocTypeId === getDocTypeIdByName('Sales Order')
  ) {
    return <Main_SalesOrder />;
  }
  if (
    selectedDocTypeId &&
    selectedDocTypeId === getDocTypeIdByName('Delivery Note')
  ) {
    return <Main_SalesDN />;
  }
  if (
    selectedDocTypeId &&
    selectedDocTypeId === getDocTypeIdByName('AR Downpayment Invoice')
  ) {
    return <Main_SalesDPINV />;
  }
  if (
    selectedDocTypeId &&
    selectedDocTypeId === getDocTypeIdByName('AR Invoice')
  ) {
    return <Main_SalesINV />;
  }

  return <Main_SalesQuotation />;
};

export default Main_SalesPanel;
