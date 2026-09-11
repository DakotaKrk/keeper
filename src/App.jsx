import React, { useCallback, useMemo, useRef, useState } from 'react';
import { addEdge, useEdgesState, useNodesState } from '@xyflow/react';

import MemoryNode from './components/MemoryNode.jsx';
import Sidebar from './components/layout/Sidebar.jsx';
import Topbar from './components/layout/Topbar.jsx';
import BoardView from './views/BoardView.jsx';
import ViewShell from './views/ViewShell.jsx';
import { BRANCH_COLORS } from './constants/keeperConstants';
import { clearKeeperState, readKeeperState, writeKeeperState } from './services/keeperStorage';
import { useKeeperSearch } from './hooks/useKeeperSearch';
import { fileToDataUrl } from './utils/images';
import { uid } from './utils/ids';
import { edgeHandlesFor, layoutBoard, nextBranchPosition, resetBoardCamera } from './utils/treeLayout';

export default function App() {
  const initial = readKeeperState();

  const [nodes, setNodes, onNodesChange] = useNodesState(
    initial.nodes.map(n => ({ ...n, type: 'memory' }))
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    initial.edges.map(e => ({
      ...e,
      type: 'organic',
      data: { branch: e.branch || 'green' }
    }))
  );

  const [selectedId, setSelectedId] = useState(null);
  const [activeFolderId, setActiveFolderId] = useState(null);
  const [activeView, setActiveView] = useState('board');
  const [branchTheme, setBranchTheme] = useState('tree');
  const [nodeShape, setNodeShape] = useState('soft');
  const [coreSymbol, setCoreSymbol] = useState('leaf');
  const [coreColor, setCoreColor] = useState('dark');
  const [boardLayoutMode, setBoardLayoutMode] = useState('tree');
  const [editOpen, setEditOpen] = useState(false);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [draftBranch, setDraftBranch] = useState(null);
  const [query, setQuery] = useState('');
  const [rf, setRf] = useState(null);
  const fileRef = useRef(null);

  const nodeTypes = useMemo(() => ({ memory: MemoryNode }), []);
  const selected = nodes.find(n => n.id === selectedId) || null;
  const editingNode = draftBranch || selected;
  const activeFolder = activeFolderId ? nodes.find(n => n.id === activeFolderId) : null;

  const childIds = useMemo(() => {
    const map = new Map();
    edges.forEach(edge => {
      if (!map.has(edge.source)) map.set(edge.source, []);
      map.get(edge.source).push(edge.target);
    });
    return map;
  }, [edges]);

  const visibleIds = useMemo(() => {
    if (!activeFolderId) {
      return new Set(['life', ...(childIds.get('life') || [])]);
    }

    return new Set([activeFolderId, ...(childIds.get(activeFolderId) || [])]);
  }, [activeFolderId, childIds]);

  const visibleNodes = useMemo(
    () => layoutBoard(
      nodes.filter(node => visibleIds.has(node.id)),
      childIds,
      activeFolderId,
      boardLayoutMode
    ).map(node => ({
      ...node,
      data: {
        ...node.data,
        isBoardCore: activeFolderId ? node.id === activeFolderId : node.id === 'life',
        coreSymbol,
        coreColor
      }
    })),
    [activeFolderId, boardLayoutMode, childIds, coreColor, coreSymbol, nodes, visibleIds]
  );

  const visibleEdges = useMemo(
    () => boardLayoutMode === 'no-lines'
      ? []
      : edges
      .filter(edge => visibleIds.has(edge.source) && visibleIds.has(edge.target))
      .map(edge => {
        const source = visibleNodes.find(node => node.id === edge.source);
        const target = visibleNodes.find(node => node.id === edge.target);
        if (!source || !target) return edge;
        return { ...edge, ...edgeHandlesFor(source, target) };
      }),
    [boardLayoutMode, edges, visibleIds, visibleNodes]
  );

  const canOpenSelected = !!selected && (childIds.get(selected.id) || []).length > 0;
  const selectedChildren = useMemo(
    () => (childIds.get(selectedId) || [])
      .map(id => nodes.find(node => node.id === id))
      .filter(Boolean),
    [childIds, nodes, selectedId]
  );
  const selectedParentId = useMemo(
    () => edges.find(edge => edge.target === selectedId)?.source || '',
    [edges, selectedId]
  );
  const draftParentId = draftBranch?.parentId || activeFolderId || selectedId || 'life';
  const parentOptions = useMemo(() => {
    const activeId = draftBranch ? null : selectedId;
    if (!activeId) return nodes;

    const descendants = new Set();
    const visit = (id) => {
      (childIds.get(id) || []).forEach(childId => {
        descendants.add(childId);
        visit(childId);
      });
    };
    visit(activeId);

    return nodes.filter(node => node.id !== activeId && !descendants.has(node.id));
  }, [childIds, draftBranch, nodes, selectedId]);

  const persist = useCallback((nextNodes, nextEdges = edges) => {
    writeKeeperState(nextNodes, nextEdges);
  }, [edges]);

  const onNodesChangePersisted = useCallback((changes) => {
    onNodesChange(changes);
    requestAnimationFrame(() => {
      setNodes(current => {
        const movedIds = new Set(
          changes
            .filter(change => change.type === 'position' && change.dragging === false)
            .map(change => change.id)
        );
        const next = movedIds.size
          ? current.map(node => movedIds.has(node.id)
            ? { ...node, data: { ...node.data, hasCustomPosition: true } }
            : node)
          : current;
        persist(next);
        return next;
      });
    });
  }, [onNodesChange, persist, setNodes]);

  const onConnect = useCallback((params) => {
    setEdges(current => {
      const next = addEdge({
        ...params,
        id: uid('edge'),
        type: 'organic',
        data: { branch: 'green' }
      }, current);
      persist(nodes, next);
      return next;
    });
  }, [nodes, persist, setEdges]);

  const onEdgeClick = useCallback((_, edge) => {
    setEdges(current => {
      const next = current.map(item => {
        if (item.id !== edge.id) return item;
        const currentColor = item.data?.branch || 'green';
        const nextColor = BRANCH_COLORS[(BRANCH_COLORS.indexOf(currentColor) + 1) % BRANCH_COLORS.length];
        return { ...item, data: { ...item.data, branch: nextColor } };
      });
      persist(nodes, next);
      return next;
    });
  }, [nodes, persist, setEdges]);

  function patchSelected(patch) {
    if (draftBranch) {
      setDraftBranch(current => ({
        ...current,
        data: { ...current.data, ...patch },
        parentId: patch.parentId || current.parentId
      }));
      return;
    }

    setNodes(current => {
      const next = current.map(n =>
        n.id === selectedId ? { ...n, data: { ...n.data, ...patch } } : n
      );
      persist(next);
      return next;
    });
  }

  function moveSelectedToBoard(parentId) {
    if (draftBranch) {
      setDraftBranch(current => ({ ...current, parentId }));
      return;
    }

    if (!selectedId || !parentId || selectedId === 'life') return;

    setEdges(current => {
      const keptEdges = current.filter(edge => edge.target !== selectedId);
      const next = addEdge({
        id: uid('edge'),
        source: parentId,
        target: selectedId,
        type: 'organic',
        data: { branch: 'green' }
      }, keptEdges);
      persist(nodes, next);
      return next;
    });
  }

  function addBranch(kind = 'Collection') {
    const parentId = selectedId || activeFolderId || 'life';
    setDraftBranch({
      id: 'draft-branch',
      type: 'memory',
      position: { x: 0, y: 0 },
      parentId,
      data: {
        title: '',
        kind,
        note: '',
        date: '',
        place: '',
        visibility: 'private',
        images: [],
        isDraft: true
      }
    });
    setSelectedId(null);
    setEditOpen(true);
    setAddMenuOpen(false);
  }

  function availableBranchPosition(parentNode, siblingCount) {
    const center = parentNode?.position || { x: 650, y: 360 };
    const offsets = [
      { x: 0, y: -330 },
      { x: 360, y: 0 },
      { x: -360, y: 0 },
      { x: 0, y: 330 },
      { x: 360, y: -260 },
      { x: 360, y: 260 },
      { x: -360, y: -260 },
      { x: -360, y: 260 },
      { x: 720, y: 0 },
      { x: -720, y: 0 },
      { x: 0, y: -660 },
      { x: 0, y: 660 }
    ];
    const occupied = visibleNodes.map(node => node.position);
    const isOpen = position => occupied.every(existing =>
      Math.abs(existing.x - position.x) >= 280 || Math.abs(existing.y - position.y) >= 230
    );

    for (let i = 0; i < offsets.length; i += 1) {
      const offset = offsets[(siblingCount + i) % offsets.length];
      const position = { x: center.x + offset.x, y: center.y + offset.y };
      if (isOpen(position)) return position;
    }

    return nextBranchPosition(parentNode, siblingCount);
  }

  function createDraftBranch() {
    if (!draftBranch) return;
    const parentId = draftBranch.parentId || activeFolderId || 'life';
    const parentNode = visibleNodes.find(n => n.id === parentId) || nodes.find(n => n.id === parentId);
    const siblingCount = childIds.get(parentId)?.length || 0;
    let position = availableBranchPosition(parentNode, siblingCount);
    if (rf) {
      const p = rf.screenToFlowPosition({
        x: window.innerWidth * 0.5,
        y: window.innerHeight * 0.5
      });
      if (!parentNode) position = { x: p.x - 115, y: p.y - 80 };
    }

    const id = uid('branch');
    const node = {
      id,
      type: 'memory',
      position,
      data: {
        ...draftBranch.data,
        title: draftBranch.data.title?.trim() || `Untitled ${draftBranch.data.kind.toLowerCase()}`,
        images: [],
        isDraft: false
      }
    };

    setNodes(current => {
      const next = [...current, node];
      persist(next);
      return next;
    });

    if (parentId) {
      setEdges(current => {
        const next = addEdge({
          id: uid('edge'),
          source: parentId,
          target: id,
          type: 'organic',
          data: { branch: 'green' }
        }, current);
        persist([...nodes, node], next);
        return next;
      });
    }

    setSelectedId(id);
    setDraftBranch(null);
    setEditOpen(false);
  }

  function openFolder(id = selectedId) {
    const node = nodes.find(n => n.id === id);
    if (!node) return;
    setActiveFolderId(id);
    setSelectedId(null);
    setDraftBranch(null);
    setEditOpen(false);
    resetBoardCamera(rf);
  }

  function closeFolder() {
    setActiveFolderId(null);
    setSelectedId(null);
    setDraftBranch(null);
    setEditOpen(false);
    resetBoardCamera(rf);
  }

  async function addImages(files) {
    if (!selected || !files?.length) return;

    const converted = [];
    for (const file of Array.from(files).slice(0, 12)) {
      if (!file.type.startsWith('image/')) continue;
      converted.push(await fileToDataUrl(file));
    }

    patchSelected({ images: [...(selected.data.images || []), ...converted] });
  }

  function deleteSelected() {
    if (!selected || selected.id === 'life') return;

    setEdges(currentEdges => {
      const nextEdges = currentEdges.filter(
        e => e.source !== selected.id && e.target !== selected.id
      );

      setNodes(currentNodes => {
        const nextNodes = currentNodes.filter(n => n.id !== selected.id);
        persist(nextNodes, nextEdges);
        return nextNodes;
      });

      return nextEdges;
    });

    setSelectedId(null);
    setDraftBranch(null);
    setEditOpen(false);
  }

  function resetDemo() {
    if (!confirm('Reset Keeper to the demo content?')) return;
    clearKeeperState();
    location.reload();
  }

  const matches = useKeeperSearch(nodes, query);

  function focusNode(id) {
    const node = nodes.find(n => n.id === id);
    if (!node) return;
    setActiveView('board');
    if ((childIds.get(id) || []).length) {
      openFolder(id);
    } else {
      setSelectedId(id);
    }
    setQuery('');
    if (rf && !(childIds.get(id) || []).length) {
      rf.setCenter(node.position.x + 120, node.position.y + 90, {
        zoom: 1.15,
        duration: 500
      });
    }
  }

  const albumNodes = useMemo(
    () => nodes.filter(n => ['Album', 'Year', 'Collection', 'Period'].includes(n.data.kind)),
    [nodes]
  );

  return (
    <div className={`app-shell branch-theme-${branchTheme} node-shape-${nodeShape} ${activeFolder ? 'is-inside-folder' : 'is-root-board'}`}>
      <Sidebar
        activeView={activeView}
        onChangeView={(view) => {
          setActiveView(view);
          setDraftBranch(null);
          setEditOpen(false);
        }}
      />

      <Topbar
        query={query}
        onQueryChange={setQuery}
        matches={matches}
        onFocusNode={focusNode}
        onReset={resetDemo}
        addMenuOpen={addMenuOpen}
        onToggleAddMenu={() => setAddMenuOpen(open => !open)}
        onAddBranch={addBranch}
      />

      <main className="workspace">
        {activeView === 'board' ? (
          <BoardView
            visibleNodes={visibleNodes}
            visibleEdges={visibleEdges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChangePersisted}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onEdgeClick={onEdgeClick}
            onNodeClick={(_, node) => {
              if (node.id === 'life') {
                setSelectedId(null);
                setEditOpen(false);
                return;
              }
              if ((childIds.get(node.id) || []).length) {
                openFolder(node.id);
                return;
              }
              setSelectedId(node.id);
              setEditOpen(false);
            }}
            onPaneClick={() => {
              setDraftBranch(null);
              setEditOpen(false);
            }}
            onInit={setRf}
            activeFolder={activeFolder}
            closeFolder={closeFolder}
            selected={selected}
            editingNode={editingNode}
            editOpen={editOpen}
            setSelectedId={setSelectedId}
            setEditOpen={setEditOpen}
            setDraftBranch={setDraftBranch}
            fileRef={fileRef}
            addImages={addImages}
            patchSelected={patchSelected}
            createDraftBranch={createDraftBranch}
            openFolder={openFolder}
            canOpenSelected={canOpenSelected}
            selectedChildren={selectedChildren}
            deleteSelected={deleteSelected}
            selectedParentId={draftBranch ? draftParentId : selectedParentId}
            parentOptions={parentOptions}
            moveSelectedToBoard={moveSelectedToBoard}
            styleProps={{
              branchTheme,
              setBranchTheme,
              nodeShape,
              setNodeShape,
              coreSymbol,
              setCoreSymbol,
              coreColor,
              setCoreColor,
              boardLayoutMode,
              setBoardLayoutMode
            }}
          />
        ) : (
          <ViewShell
            activeView={activeView}
            visibleCount={visibleNodes.length}
            albumNodes={albumNodes}
            onChangeView={setActiveView}
            onFocusNode={focusNode}
          />
        )}
      </main>
    </div>
  );
}
