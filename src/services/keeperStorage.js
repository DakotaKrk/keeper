import seed from '../data/seed.json';
import { ENGLISH_COPY, ENGLISH_KIND, LEGACY_STORAGE_KEY, STORAGE_KEY } from '../constants/keeperConstants';
import { DEMO_LAYOUT } from '../utils/treeLayout';

function translateLegacyData(data = {}) {
  return {
    ...data,
    title: ENGLISH_COPY[data.title] || data.title,
    kind: ENGLISH_KIND[data.kind] || data.kind,
    note: ENGLISH_COPY[data.note] || data.note,
    place: ENGLISH_COPY[data.place] || data.place
  };
}

export function normalizeState(state) {
  const existingIds = new Set((state.nodes || []).map(node => node.id));
  const existingEdgeIds = new Set((state.edges || []).map(edge => edge.id));
  const missingSeedNodes = seed.nodes.filter(node => !existingIds.has(node.id));
  const missingSeedEdges = seed.edges.filter(edge => !existingEdgeIds.has(edge.id));

  return {
    ...state,
    nodes: [...(state.nodes || []), ...missingSeedNodes].map(node => {
      let translatedData = translateLegacyData(node.data);
      const shouldRefreshRoot = node.id === 'life' && translatedData.title === 'My life';

      if (node.id === 'jan' && translatedData.kind === 'Month') {
        translatedData = {
          ...translatedData,
          kind: 'Collection',
          note: translatedData.note || 'A month that can hold smaller albums.'
        };
      }

      if (node.id === 'mountains' && translatedData.kind === 'Period') {
        translatedData = {
          ...translatedData,
          kind: 'Album'
        };
      }

      return {
        ...node,
        position: DEMO_LAYOUT[node.id] || node.position,
        data: shouldRefreshRoot
          ? {
              ...translatedData,
              title: 'My personal archive',
              note: 'The heart of everything I want to keep.'
            }
          : translatedData
      };
    }),
    edges: [...(state.edges || []), ...missingSeedEdges].map(edge => {
      if (edge.id === 'e-life-summer') {
        return {
          ...edge,
          id: 'e-2026-summer',
          source: '2026'
        };
      }
      return edge;
    })
  };
}

export function readKeeperState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (raw) {
      const normalized = normalizeState(JSON.parse(raw));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      return normalized;
    }
  } catch {}
  return seed;
}

export function writeKeeperState(nodes, edges) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    nodes: nodes.map(n => ({ id: n.id, position: n.position, data: n.data })),
    edges: edges.map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
      branch: e.data?.branch || 'green'
    }))
  }));
}

export function clearKeeperState() {
  localStorage.removeItem(STORAGE_KEY);
}
