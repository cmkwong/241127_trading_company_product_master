import { v4 as uuidv4 } from 'uuid';
import { normalizeStructuredTableResponse } from '../../../../utils/contextDataUtils';

export const COMPANY_API_BASE =
  'http://localhost:3001/api/v1/trade_business/panel/companys';

export const COMPANY_TABLE = 'companys';
export const COMPANY_ADDRESS_TABLE = 'company_address';

/**
 * Blank company draft (client-side UUID so it can be posted without a server
 * round-trip). `company_address` mirrors the child table name used server-side.
 */
export const createEmptyCompanyDraft = () => ({
  id: uuidv4(),
  name: '',
  remark: '',
  icon_name: '',
  icon_url: '',
  base64_image: '',
  created_at: '',
  updated_at: '',
  company_address: [],
});

/**
 * Normalize a `.../companys/data/list` response into a table-shaped object:
 *   { companys: [...], company_address: [...] }
 */
export const normalizeCompanyListResponse = (response) =>
  normalizeStructuredTableResponse(response, COMPANY_TABLE);

/**
 * Pick the first company from a normalized list together with its addresses.
 * Returns `null` when there are no companies.
 */
export const extractFirstCompany = (normalizedData) => {
  const companys = Array.isArray(normalizedData?.[COMPANY_TABLE])
    ? normalizedData[COMPANY_TABLE]
    : [];

  const company = companys[0];
  if (!company) return null;

  const companyId = String(company.id || '').trim();

  // The API nests child rows inside the parent record
  // (`companys[*].company_address`), matching the rest of the trade-business
  // endpoints (e.g. suppliers -> supplier_addresses). Fall back to a flat
  // `company_address` table array for older/alternate responses.
  const nestedAddresses = Array.isArray(company?.[COMPANY_ADDRESS_TABLE])
    ? company[COMPANY_ADDRESS_TABLE]
    : null;
  const flatAddresses = Array.isArray(normalizedData?.[COMPANY_ADDRESS_TABLE])
    ? normalizedData[COMPANY_ADDRESS_TABLE]
    : [];
  const addressSource = nestedAddresses ?? flatAddresses;

  const companyAddresses = addressSource.filter(
    (address) =>
      !address?.company_id ||
      String(address.company_id).trim() === companyId,
  );

  return { ...company, [COMPANY_ADDRESS_TABLE]: companyAddresses };
};

/**
 * Strip internal flags / server-managed columns that should never be sent back.
 */
const cleanCompanyRow = (company) => {
  const row = {
    id: company?.id,
    name: String(company?.name ?? '').trim(),
    remark: String(company?.remark ?? ''),
    icon_name: String(company?.icon_name ?? ''),
  };

  // `icon_url` is server-managed (written from the uploaded base64), so only the
  // raw data URI is ever sent, and only when a new icon was actually picked.
  const base64Image = String(company?.base64_image ?? '').trim();
  if (base64Image.startsWith('data:')) {
    row.base64_image = base64Image;
  }

  return row;
};

const cleanAddressRow = (companyId, row) => ({
  id: row?.id,
  company_id: companyId,
  contact_name: row?.contact_name ?? '',
  phone_number: row?.phone_number ?? '',
  address_type_id: row?.address_type_id ?? '',
  is_default: Boolean(row?.is_default),
  address_line1: row?.address_line1 ?? '',
  address_line2: row?.address_line2 ?? '',
  address_line3: row?.address_line3 ?? '',
  city: row?.city ?? '',
  state: row?.state ?? '',
  zip_code: row?.zip_code ?? '',
  country: row?.country ?? '',
});

/**
 * Build the write payload keyed by real table names.
 * `deletedAddressIds` are excluded from the address array (deletions are sent
 * separately to the `.../data/ids` DELETE endpoint).
 */
export const buildCompanyPayload = (record, deletedAddressIds = []) => {
  const company = record ?? {};
  const companyId = String(company.id || '').trim();

  const addressRows = Array.isArray(company[COMPANY_ADDRESS_TABLE])
    ? company[COMPANY_ADDRESS_TABLE]
    : [];

  const deleted = new Set(
    (deletedAddressIds || []).map((id) => String(id).trim()).filter(Boolean),
  );

  const addresses = addressRows
    .filter((row) => !row?._delete)
    .filter((row) => !deleted.has(String(row?.id || '').trim()))
    .map((row) => cleanAddressRow(companyId, row));

  return {
    [COMPANY_TABLE]: [cleanCompanyRow(company)],
    [COMPANY_ADDRESS_TABLE]: addresses,
  };
};

/**
 * Client-side validation mirroring the schema's NOT NULL constraints
 * (`name` on `companys`; `address_type_id` + `address_line1` on addresses).
 * Returns `{ ok, errors }`.
 */
export const validateCompany = (record) => {
  const company = record ?? {};
  const errors = [];

  if (!String(company.name ?? '').trim()) {
    errors.push('Company name is required.');
  }

  const addressRows = Array.isArray(company[COMPANY_ADDRESS_TABLE])
    ? company[COMPANY_ADDRESS_TABLE]
    : [];

  addressRows.forEach((row, index) => {
    if (row?._delete) return;
    const label = `Address ${index + 1}`;
    if (!String(row?.address_type_id ?? '').trim()) {
      errors.push(`${label}: address type is required.`);
    }
    if (!String(row?.address_line1 ?? '').trim()) {
      errors.push(`${label}: address line 1 is required.`);
    }
  });

  return { ok: errors.length === 0, errors };
};
