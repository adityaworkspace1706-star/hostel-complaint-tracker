// ---------------------------------------------------------------------------
// Complaint ID generation: CMP-0001, CMP-0002, …
//
// IDs are derived from the HIGHEST suffix ever used (not from a document
// count), so deleting a complaint can never cause a duplicate ID to be
// handed out again. A unique index + retry in the controller covers races.
// ---------------------------------------------------------------------------

export const COMPLAINT_ID_PREFIX = 'CMP-';

export const formatComplaintId = (suffix) =>
  `${COMPLAINT_ID_PREFIX}${String(suffix).padStart(4, '0')}`;

/** CMP-0042 → 42, anything else → null */
export const parseComplaintId = (complaintId) => {
  const match = new RegExp(`^${COMPLAINT_ID_PREFIX}(\\d+)$`).exec(String(complaintId || ''));
  return match ? Number(match[1]) : null;
};

/** Next ID given the highest numeric suffix seen so far (or null/undefined). */
export const nextComplaintIdFromMax = (maxSuffix) => {
  const max = Number.isFinite(maxSuffix) && maxSuffix > 0 ? Math.floor(maxSuffix) : 0;
  return formatComplaintId(max + 1);
};

/** Next ID given a list of existing complaint IDs (invalid entries ignored). */
export const nextComplaintIdFromIds = (existingIds = []) => {
  let max = 0;
  for (const id of existingIds) {
    const suffix = parseComplaintId(id);
    if (suffix !== null && suffix > max) max = suffix;
  }
  return formatComplaintId(max + 1);
};
