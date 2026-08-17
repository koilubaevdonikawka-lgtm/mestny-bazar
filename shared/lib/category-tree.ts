import type { CategoryDTO, CategoryTreeNode } from "@shared/contracts/catalog";

/**
 * Builds a category tree from a flat, already-fetched list — no recursive
 * SQL, no extra round trips. The category set is small (dozens, not
 * thousands), so an in-memory graph walk is simpler and cheaper than a
 * recursive CTE, and keeps tree-building testable as a pure function.
 *
 * Cycle-safe: a category whose parent chain loops back on itself (which the
 * `categories_parent_not_self` constraint doesn't fully prevent for chains
 * longer than one hop) is treated as top-level rather than causing infinite
 * recursion — a defensive fallback, not the expected path.
 */
export function buildCategoryTree(categories: CategoryDTO[]): CategoryTreeNode[] {
  const nodesById = new Map<string, CategoryTreeNode>(
    categories.map((category) => [category.id, { ...category, children: [] }]),
  );

  const roots: CategoryTreeNode[] = [];
  for (const category of categories) {
    const node = nodesById.get(category.id)!;
    const parent = category.parentId ? nodesById.get(category.parentId) : undefined;
    if (parent && !isDescendantOf(parent, node.id, nodesById)) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

/** Guards buildCategoryTree against a corrupt multi-hop cycle: true if
 * `candidateId` appears anywhere in `node`'s own ancestor chain. */
function isDescendantOf(
  node: CategoryTreeNode,
  candidateId: string,
  nodesById: Map<string, CategoryTreeNode>,
  seen = new Set<string>(),
): boolean {
  if (node.id === candidateId) return true;
  if (seen.has(node.id)) return false;
  seen.add(node.id);
  const parent = node.parentId ? nodesById.get(node.parentId) : undefined;
  return parent ? isDescendantOf(parent, candidateId, nodesById, seen) : false;
}

/**
 * Returns the chain of ancestors for `categoryId`, ordered root-first (e.g.
 * for breadcrumbs: [grandparent, parent]) — the category itself is not
 * included. Empty array for a top-level category or an unknown id.
 */
export function getCategoryAncestry(categories: CategoryDTO[], categoryId: string): CategoryDTO[] {
  const byId = new Map(categories.map((category) => [category.id, category]));
  const chain: CategoryDTO[] = [];
  const seen = new Set<string>();

  let current = byId.get(categoryId);
  while (current?.parentId) {
    if (seen.has(current.id)) break; // cycle guard
    seen.add(current.id);
    const parent = byId.get(current.parentId);
    if (!parent) break;
    chain.unshift(parent);
    current = parent;
  }
  return chain;
}
