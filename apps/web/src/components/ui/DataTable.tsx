'use client';

import { useState, useMemo } from 'react';
import styles from './DataTable.module.css';

interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (row: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  pageSize?: number;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  actions?: React.ReactNode;
  selectable?: boolean;
  onSelectionChange?: (selected: T[]) => void;
}

export default function DataTable<T extends Record<string, any>>({
  columns, data, keyField = 'id', searchable = true,
  searchPlaceholder = 'Search...', pageSize = 10,
  onRowClick, emptyMessage = 'No data found', actions, selectable = false,
  onSelectionChange,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    let result = [...data];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(row =>
        Object.values(row).some(v =>
          v !== null && v !== undefined && String(v).toLowerCase().includes(q)
        )
      );
    }
    if (sortKey) {
      result.sort((a, b) => {
        const av = a[sortKey]; const bv = b[sortKey];
        if (av == null) return 1; if (bv == null) return -1;
        const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return result;
  }, [data, search, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) { setSortDir(d => d === 'asc' ? 'desc' : 'asc'); }
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIds(next);
    onSelectionChange?.(data.filter(r => next.has(r[keyField])));
  };

  const toggleAll = () => {
    if (selectedIds.size === paginated.length) {
      setSelectedIds(new Set());
      onSelectionChange?.([]);
    } else {
      const ids = new Set(paginated.map(r => r[keyField]));
      setSelectedIds(ids);
      onSelectionChange?.(paginated);
    }
  };

  return (
    <div className={styles.container}>
      {(searchable || actions) && (
        <div className={styles.toolbar}>
          {searchable && (
            <div className={styles.searchBox}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" placeholder={searchPlaceholder} value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
          )}
          {selectedIds.size > 0 && (
            <span className={styles.selectionCount}>{selectedIds.size} selected</span>
          )}
          <div className={styles.toolbarActions}>{actions}</div>
        </div>
      )}

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              {selectable && (
                <th style={{ width: 40 }}>
                  <input type="checkbox" checked={selectedIds.size === paginated.length && paginated.length > 0} onChange={toggleAll} />
                </th>
              )}
              {columns.map(col => (
                <th key={col.key} style={{ width: col.width }} className={col.sortable !== false ? styles.sortable : ''} onClick={() => col.sortable !== false && handleSort(col.key)}>
                  <span>{col.label}</span>
                  {sortKey === col.key && (
                    <svg className={styles.sortIcon} data-dir={sortDir} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((row, i) => (
              <tr key={row[keyField] || i} className={styles.row} onClick={() => onRowClick?.(row)} data-clickable={!!onRowClick} data-selected={selectedIds.has(row[keyField])}>
                {selectable && (
                  <td onClick={e => e.stopPropagation()}>
                    <input type="checkbox" checked={selectedIds.has(row[keyField])} onChange={() => toggleSelect(row[keyField])} />
                  </td>
                )}
                {columns.map(col => (
                  <td key={col.key}>{col.render ? col.render(row, i) : row[col.key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {paginated.length === 0 && (
        <div className={styles.empty}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
          <p>{emptyMessage}</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <span className={styles.pageInfo}>Showing {(page-1)*pageSize + 1}–{Math.min(page*pageSize, filtered.length)} of {filtered.length}</span>
          <div className={styles.pageButtons}>
            <button disabled={page <= 1} onClick={() => setPage(1)} className={styles.pageBtn}>«</button>
            <button disabled={page <= 1} onClick={() => setPage(p => p-1)} className={styles.pageBtn}>‹</button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = page <= 3 ? i + 1 : page + i - 2;
              if (p < 1 || p > totalPages) return null;
              return <button key={p} className={styles.pageBtn} data-active={p === page} onClick={() => setPage(p)}>{p}</button>;
            })}
            <button disabled={page >= totalPages} onClick={() => setPage(p => p+1)} className={styles.pageBtn}>›</button>
            <button disabled={page >= totalPages} onClick={() => setPage(totalPages)} className={styles.pageBtn}>»</button>
          </div>
        </div>
      )}
    </div>
  );
}
