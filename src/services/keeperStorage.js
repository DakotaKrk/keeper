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
  return {
    ...state,
    nodes: (state.nodes || []).map(node => ({
      ...node,
      position: DEMO_LAYOUT[node.id] || node.position,
      data: translateLegacyData(node.data)
    })),
    edges: state.edges || []
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
