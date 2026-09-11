import { useMemo } from 'react';

export function useKeeperSearch(nodes, query) {
  return useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return nodes.filter(n =>
      [n.data.title, n.data.kind, n.data.note, n.data.place, n.data.date]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [query, nodes]);
}
