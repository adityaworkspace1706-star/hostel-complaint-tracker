// ---------------------------------------------------------------------------
// Optional list pagination.
//
// List endpoints accept `?page=&limit=`. When neither is provided the full
// result set is returned (the frontend filters/sorts client-side), so adding
// pagination here is backwards compatible.
// ---------------------------------------------------------------------------

export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

/** Returns { page, limit, skip } or null when pagination was not requested. */
export const parsePagination = (query = {}) => {
  if (query.page === undefined && query.limit === undefined) return null;

  const page = Number.parseInt(query.page, 10);
  const limit = Number.parseInt(query.limit, 10);

  const safePage = Number.isFinite(page) && page > 0 ? page : 1;
  const safeLimit =
    Number.isFinite(limit) && limit > 0 ? Math.min(limit, MAX_LIMIT) : DEFAULT_LIMIT;

  return { page: safePage, limit: safeLimit, skip: (safePage - 1) * safeLimit };
};

export const buildPaginationMeta = ({ page, limit, total }) => ({
  page,
  limit,
  total,
  totalPages: Math.max(1, Math.ceil(total / limit)),
});
