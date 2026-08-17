import { useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export interface AdminDataTableColumn<T> {
  key: string;
  header: string;
  sortable?: boolean;
  sortValue?: (row: T) => string | number;
  render: (row: T) => ReactNode;
  className?: string;
}

export interface AdminDataTableBulkAction {
  label: string;
  onClick: (selectedIds: string[]) => void;
  variant?: "default" | "destructive" | "outline";
}

interface AdminDataTableProps<T> {
  rows: T[];
  columns: AdminDataTableColumn<T>[];
  getRowId: (row: T) => string;
  searchPlaceholder?: string;
  searchFn?: (row: T, query: string) => boolean;
  filters?: ReactNode;
  selectable?: boolean;
  bulkActions?: AdminDataTableBulkAction[];
  rowActions?: (row: T) => ReactNode;
  /** Задача этапа №7 — принимает либо статичный узел (как раньше, все
   * текущие потребители продолжают работать без изменений), либо функцию
   * от текущего поискового запроса — так потребитель может показать
   * отдельный текст для "пусто вообще" и "пусто по этому запросу", не
   * дублируя фильтрацию/поиск снаружи компонента. */
  emptyState?: ReactNode | ((info: { query: string }) => ReactNode);
}

/**
 * Общий, переиспользуемый список для административной панели (Промпт №068)
 * — первый такой компонент в проекте; до этого каждый раздел вручную
 * повторял один и тот же shell. Визуально — точное совпадение с уже
 * существующим ручным вариантом (rounded-2xl card → ul из rounded-xl строк),
 * не новый язык дизайна. Только клиентская фильтрация/сортировка/выбор — как
 * и во всех текущих списках администратора (без серверной пагинации).
 */
export function AdminDataTable<T>({
  rows,
  columns,
  getRowId,
  searchPlaceholder,
  searchFn,
  filters,
  selectable,
  bulkActions,
  rowActions,
  emptyState,
}: AdminDataTableProps<T>) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    if (!query.trim() || !searchFn) return rows;
    return rows.filter((row) => searchFn(row, query.trim().toLowerCase()));
  }, [rows, query, searchFn]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const column = columns.find((c) => c.key === sortKey);
    if (!column?.sortValue) return filtered;
    const copy = [...filtered];
    copy.sort((a, b) => {
      const va = column.sortValue!(a);
      const vb = column.sortValue!(b);
      const cmp = va < vb ? -1 : va > vb ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [filtered, sortKey, sortDir, columns]);

  const toggleSort = (key: string) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
      return;
    }
    setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const resolvedEmptyState =
    typeof emptyState === "function"
      ? emptyState({ query: query.trim() })
      : (emptyState ?? "Ничего не найдено.");

  const allSelected = sorted.length > 0 && sorted.every((row) => selectedIds.has(getRowId(row)));
  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sorted.map(getRowId)));
    }
  };
  const toggleRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {(searchFn || filters) && (
        <div className="flex flex-wrap items-center gap-2">
          {searchFn && (
            <div className="relative max-w-xs flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder ?? "Поиск..."}
                className="pl-9"
              />
            </div>
          )}
          {/* Задача этапа №7 — счётчик найденного по активному поиску,
              виден только пока запрос не пустой. Считается по уже
              вычисленному sorted, без дублирования логики фильтрации. */}
          {searchFn && query.trim() && (
            <span className="shrink-0 text-xs text-muted-foreground">Найдено: {sorted.length}</span>
          )}
          {filters}
        </div>
      )}

      {selectable && bulkActions && bulkActions.length > 0 && selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl bg-secondary/60 px-4 py-2">
          <span className="text-sm text-muted-foreground">Выбрано: {selectedIds.size}</span>
          {bulkActions.map((action) => (
            <Button
              key={action.label}
              size="sm"
              variant={action.variant ?? "outline"}
              onClick={() => action.onClick([...selectedIds])}
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}

      <section className="rounded-2xl border border-border/60 bg-card p-6">
        {sorted.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">{resolvedEmptyState}</div>
        ) : (
          <ul className="space-y-3">
            <li className="hidden items-center gap-3 px-4 text-xs font-medium uppercase text-muted-foreground sm:flex">
              {selectable && (
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Выбрать всё"
                />
              )}
              {columns.map((column) => (
                <button
                  key={column.key}
                  type="button"
                  disabled={!column.sortable}
                  onClick={() => column.sortable && toggleSort(column.key)}
                  className={`flex items-center gap-1 ${column.sortable ? "cursor-pointer hover:text-foreground" : ""} ${column.className ?? "flex-1"}`}
                >
                  {column.header}
                  {column.sortable &&
                    (sortKey === column.key ? (
                      sortDir === "asc" ? (
                        <ArrowUp className="h-3 w-3" />
                      ) : (
                        <ArrowDown className="h-3 w-3" />
                      )
                    ) : (
                      <ArrowUpDown className="h-3 w-3 opacity-40" />
                    ))}
                </button>
              ))}
              {rowActions && <span className="w-24 shrink-0" />}
            </li>

            {sorted.map((row) => {
              const id = getRowId(row);
              return (
                <li
                  key={id}
                  className="flex flex-wrap items-center gap-3 rounded-xl bg-secondary/40 px-4 py-3"
                >
                  {selectable && (
                    <Checkbox
                      checked={selectedIds.has(id)}
                      onCheckedChange={() => toggleRow(id)}
                      aria-label="Выбрать строку"
                    />
                  )}
                  {columns.map((column) => (
                    <div key={column.key} className={column.className ?? "min-w-0 flex-1"}>
                      {column.render(row)}
                    </div>
                  ))}
                  {rowActions && (
                    <div className="flex shrink-0 items-center gap-2">{rowActions(row)}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
