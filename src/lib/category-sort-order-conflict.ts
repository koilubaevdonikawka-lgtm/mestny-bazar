/**
 * Задача №242 — mirrors CategoryAdminService.assertSortOrderFree's scoping
 * (server/domain/category-admin.service.ts, Задача №232) exactly: a
 * sortOrder collision only matters among siblings sharing the same
 * parentId (two subcategories under different parents may freely share a
 * value — not a conflict). Run client-side against the already-loaded
 * category list, before the save request, so a collision is caught with a
 * clear reason instead of only surfacing as the server's raw/untranslated
 * rejection message once the request round-trips.
 */
export interface CategorySortOrderCandidate {
  id: string;
  parentId: string | null;
  sortOrder: string;
}

export function findSortOrderConflict<T extends CategorySortOrderCandidate>(
  categories: readonly T[],
  selfId: string,
  parentId: string | null,
  sortOrder: string,
): T | undefined {
  return categories.find(
    (c) => c.id !== selfId && c.parentId === parentId && c.sortOrder === sortOrder,
  );
}
