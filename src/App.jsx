import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  addEdge,
  useEdgesState,
  useNodesState,
  BaseEdge,
  getBezierPath
} from '@xyflow/react';
import { ArrowLeft, Album, Folder, Home, Plus, RotateCcw, Search, Settings, Tags, UserRound, Leaf, Sparkles } from 'lucide-react';

import seed from './data/seed.json';
import MemoryNode from './components/MemoryNode.jsx';
import AlbumPanel from './components/AlbumPanel.jsx';
import EditPanel from './components/EditPanel.jsx';

const STORAGE_KEY = 'keeper-tree-v1';
const LEGACY_STORAGE_KEY = 'minnesboard-tree-v1';
const BRANCH_COLORS = ['green', 'gold', 'blue', 'rose'];

const ENGLISH_KIND = {
  Huvudnod: 'Root',
  År: 'Year',
  Månad: 'Month',
  Plats: 'Place',
  Samling: 'Collection'
};

const ENGLISH_COPY = {
  'Mitt liv': 'My life',
  Familj: 'Family',
  'Mina bästa år med mormor': 'The best years with grandma',
  Fjällen: 'The mountains',
  Januari: 'January',
  Sommar: 'Summer',
  Resor: 'Travel',
  'Alla mina minnen hänger ihop.': 'Every memory belongs somewhere.',
  'Människorna jag vill minnas.': 'The people I want to remember.',
  'Inte perfekta bilder – viktiga minnen.': 'Not perfect photos. Important memories.',
  'Ett år av minnen.': 'A year of memories.',
  'Snö, tystnad och tid tillsammans.': 'Snow, quiet and time together.',
  'Vintern, vardagen och små ögonblick.': 'Winter, daily life and small moments.',
  'Ljusa dagar. Stora minnen.': 'Long days. Big memories.',
  'Platser som förändrar oss.': 'Places that changed us.',
  Åre: 'Aspen'
};

function translateLegacyData(data = {}) {
  return {
    ...data,
    title: ENGLISH_COPY[data.title] || data.title,
    kind: ENGLISH_KIND[data.kind] || data.kind,
    note: ENGLISH_COPY[data.note] || data.note,
    place: ENGLISH_COPY[data.place] || data.place
  };
}

function normalizeState(state) {
  return {
    ...state,
    nodes: (state.nodes || []).map(node => ({
      ...node,
      data: translateLegacyData(node.data)
    })),
    edges: state.edges || []
  };
}

function readState() {
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

function uid(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function OrganicEdge(props) {
  const [path] = getBezierPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    targetX: props.targetX,
    targetY: props.targetY,
    sourcePosition: props.sourcePosition,
    targetPosition: props.targetPosition,
    curvature: 0.42
  });

  const branch = props.data?.branch || 'green';
  return <BaseEdge path={path} className={`organic-edge branch-${branch}`} />;
}

async function fileToDataUrl(file, maxSize = 1700, quality = 0.84) {
  const src = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const img = await new Promise((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = src;
  });

  const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', quality);
}

export default function App() {
  const initial = readState();

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

  const [selectedId, setSelectedId] = useState('life');
  const [activeFolderId, setActiveFolderId] = useState(null);
  const [activeView, setActiveView] = useState('board');
  const [branchTheme, setBranchTheme] = useState('tree');
  const [nodeShape, setNodeShape] = useState('soft');
  const [editOpen, setEditOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [rf, setRf] = useState(null);
  const fileRef = useRef(null);

  const nodeTypes = useMemo(() => ({ memory: MemoryNode }), []);
  const edgeTypes = useMemo(() => ({ organic: OrganicEdge }), []);
  const selected = nodes.find(n => n.id === selectedId) || null;
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

    const ids = new Set([activeFolderId]);
    const visit = (id) => {
      (childIds.get(id) || []).forEach(childId => {
        ids.add(childId);
        visit(childId);
      });
    };
    visit(activeFolderId);
    return ids;
  }, [activeFolderId, childIds]);

  const visibleNodes = useMemo(
    () => nodes.filter(node => visibleIds.has(node.id)),
    [nodes, visibleIds]
  );

  const visibleEdges = useMemo(
    () => edges.filter(edge => visibleIds.has(edge.source) && visibleIds.has(edge.target)),
    [edges, visibleIds]
  );

  const canOpenSelected = !!selected && (childIds.get(selected.id) || []).length > 0;
  const selectedChildren = useMemo(
    () => (childIds.get(selectedId) || [])
      .map(id => nodes.find(node => node.id === id))
      .filter(Boolean),
    [childIds, nodes, selectedId]
  );

  const persist = useCallback((nextNodes, nextEdges = edges) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      nodes: nextNodes.map(n => ({ id: n.id, position: n.position, data: n.data })),
      edges: nextEdges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        branch: e.data?.branch || 'green'
      }))
    }));
  }, [edges]);

  const onNodesChangePersisted = useCallback((changes) => {
    onNodesChange(changes);
    requestAnimationFrame(() => {
      setNodes(current => {
        persist(current);
        return current;
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
    setNodes(current => {
      const next = current.map(n =>
        n.id === selectedId ? { ...n, data: { ...n.data, ...patch } } : n
      );
      persist(next);
      return next;
    });
  }

  function addBranch() {
    let position = { x: 620, y: 360 };
    if (rf) {
      const p = rf.screenToFlowPosition({
        x: window.innerWidth * 0.52,
        y: window.innerHeight * 0.48
      });
      position = { x: p.x - 115, y: p.y - 80 };
    }

    const id = uid('branch');
    const node = {
      id,
      type: 'memory',
      position,
      data: {
        title: 'New branch',
        kind: 'Album',
        note: '',
        date: '',
        place: '',
        visibility: 'private',
        images: []
      }
    };

    setNodes(current => {
      const next = [...current, node];
      persist(next);
      return next;
    });

    if (selectedId) {
      setEdges(current => {
        const next = addEdge({
          id: uid('edge'),
          source: selectedId,
          target: id,
          type: 'organic',
          data: { branch: 'green' }
        }, current);
        persist([...nodes, node], next);
        return next;
      });
    }

    setSelectedId(id);
    setEditOpen(true);
  }

  function openFolder(id = selectedId) {
    const node = nodes.find(n => n.id === id);
    if (!node) return;
    setActiveFolderId(id);
    setSelectedId(null);
    setEditOpen(false);
    requestAnimationFrame(() => {
      if (rf) {
        rf.fitView({ nodes: nodes.filter(n => n.id === id || visibleIds.has(n.id)), duration: 450, padding: 0.28 });
      }
    });
  }

  function closeFolder() {
    setActiveFolderId(null);
    setSelectedId('life');
    setEditOpen(false);
    requestAnimationFrame(() => rf?.fitView({ duration: 450, padding: 0.24 }));
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

    setSelectedId('life');
    setEditOpen(false);
  }

  function resetDemo() {
    if (!confirm('Reset Keeper to the demo content?')) return;
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  }

  const matches = useMemo(() => {
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
    if (rf) {
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

  const people = useMemo(() => ['Nathalie', 'Klara', 'Mom', 'Grandma', 'Friends'], []);
  const tagsIndex = useMemo(() => ['family', 'winter', 'travel', 'client work', 'favorites', 'legacy'], []);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'board', label: 'Board', icon: Folder },
    { id: 'albums', label: 'Albums', icon: Album },
    { id: 'people', label: 'People', icon: UserRound },
    { id: 'tags', label: 'Tags', icon: Tags }
  ];

  function renderViewShell() {
    if (activeView === 'home') {
      return (
        <section className="view-shell">
          <div className="view-head">
            <span>Keeper Home</span>
            <h1>Your memory archive, without the noise.</h1>
            <p>Start from the board, open a folder, and let albums branch into stories, people and related collections.</p>
          </div>
          <div className="shell-grid">
            <button className="shell-card is-wide" onClick={() => setActiveView('board')}>
              <Folder size={18}/>
              <strong>Open Board</strong>
              <span>{visibleNodes.length} visible branches right now</span>
            </button>
            <button className="shell-card" onClick={() => setActiveView('albums')}>
              <Album size={18}/>
              <strong>Albums</strong>
              <span>{albumNodes.length} collections</span>
            </button>
            <button className="shell-card" onClick={() => setActiveView('people')}>
              <UserRound size={18}/>
              <strong>People</strong>
              <span>Find memories by who was there</span>
            </button>
            <button className="shell-card" onClick={() => setActiveView('tags')}>
              <Tags size={18}/>
              <strong>Tags</strong>
              <span>Connect images across albums</span>
            </button>
          </div>
        </section>
      );
    }

    if (activeView === 'albums') {
      return (
        <section className="view-shell">
          <div className="view-head">
            <span>Albums</span>
            <h1>Collections with room for series.</h1>
            <p>Later, selected related albums can become a new main album. For now this gives us the clean overview.</p>
          </div>
          <div className="album-index">
            {albumNodes.map(node => (
              <button key={node.id} className="album-index-item" onClick={() => focusNode(node.id)}>
                <div>
                  {node.data.images?.[0] ? <img src={node.data.images[0]} alt="" /> : <Folder size={20}/>}
                </div>
                <strong>{node.data.title}</strong>
                <span>{node.data.kind}{node.data.date ? ` · ${node.data.date}` : ''}</span>
              </button>
            ))}
          </div>
        </section>
      );
    }

    if (activeView === 'people') {
      return (
        <section className="view-shell">
          <div className="view-head">
            <span>People</span>
            <h1>Faces become a way back in.</h1>
            <p>People stays in the MVP because it helps memories feel human, not just organized.</p>
          </div>
          <div className="people-index">
            {people.map(person => (
              <button key={person} className="person-index-item">
                <span>{person[0]}</span>
                <strong>{person}</strong>
                <small>Connected memories</small>
              </button>
            ))}
          </div>
        </section>
      );
    }

    return (
      <section className="view-shell">
        <div className="view-head">
          <span>Tags</span>
          <h1>Soft structure across albums.</h1>
          <p>Tags help you find all images from a theme, person, client delivery, or inherited archive.</p>
        </div>
        <div className="tag-index">
          {tagsIndex.map(tag => (
            <button key={tag}>#{tag}</button>
          ))}
        </div>
      </section>
    );
  }

  return (
    <div className={`app-shell branch-theme-${branchTheme} node-shape-${nodeShape} ${activeFolder ? 'is-inside-folder' : 'is-root-board'}`}>
      <aside className="side-nav">
        <div className="nav-logo"><Leaf size={18}/></div>
        <nav>
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-item ${activeView === item.id ? 'is-active' : ''}`}
                onClick={() => {
                  setActiveView(item.id);
                  setEditOpen(false);
                }}
              >
                <Icon size={18}/><span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <button className="nav-item nav-settings"><Settings size={18}/><span>Settings</span></button>
      </aside>

      <header className="topbar">
        <div className="brand">
          <div>
            <div className="brand-name">Keeper</div>
            <div className="brand-sub">your life in images</div>
          </div>
        </div>

        <div className="search">
          <Search size={17}/>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search memories, people, tags..."
          />
          {!!matches.length && (
            <div className="search-results">
              {matches.slice(0, 7).map(n => (
                <button key={n.id} onClick={() => focusNode(n.id)}>
                  <span>{n.data.title}</span>
                  <small>{n.data.kind}</small>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="top-actions">
          <button className="icon-button" onClick={resetDemo} title="Reset demo">
            <RotateCcw size={16}/>
          </button>
          <button className="primary-button" onClick={addBranch}>
            <Plus size={17}/>Add branch
          </button>
        </div>
      </header>

      <main className="workspace">
        {activeView === 'board' ? (
          <>
          <ReactFlow
          nodes={visibleNodes}
          edges={visibleEdges}
          onNodesChange={onNodesChangePersisted}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgeClick={onEdgeClick}
          onNodeClick={(_, node) => {
            if ((childIds.get(node.id) || []).length) {
              openFolder(node.id);
              return;
            }
            setSelectedId(node.id);
            setEditOpen(false);
          }}
          onPaneClick={() => setEditOpen(false)}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onInit={setRf}
          fitView
          minZoom={0.18}
          maxZoom={2}
          defaultEdgeOptions={{ type: 'organic' }}
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={30} size={0.85} />
          <Controls position="bottom-left" />
          <MiniMap position="bottom-right" pannable zoomable />

          <Panel position="top-left" className="canvas-hint">
            <Sparkles size={14}/>
            {activeFolder ? `Inside ${activeFolder.data.title}. Click an album to open it.` : 'My board. Click a folder to open its board.'}
          </Panel>

          <Panel position="top-right" className="style-panel">
            <div>
              <span>Branch theme</span>
              <div className="segmented-control">
                {['tree', 'ink', 'warm'].map(theme => (
                  <button
                    key={theme}
                    className={branchTheme === theme ? 'is-active' : ''}
                    onClick={() => setBranchTheme(theme)}
                  >
                    {theme}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span>Card shape</span>
              <div className="segmented-control">
                {['soft', 'square', 'polaroid'].map(shape => (
                  <button
                    key={shape}
                    className={nodeShape === shape ? 'is-active' : ''}
                    onClick={() => setNodeShape(shape)}
                  >
                    {shape}
                  </button>
                ))}
              </div>
            </div>
          </Panel>

          {activeFolder && (
            <Panel position="top-center" className="folder-crumb">
              <button onClick={closeFolder}><ArrowLeft size={14}/>All folders</button>
              <span>{activeFolder.data.title}</span>
            </Panel>
          )}

          <Panel position="bottom-center" className="tree-quote">
            A private space for images, years and stories.
          </Panel>
        </ReactFlow>

        <div className="ambient-leaves" aria-hidden="true">
          <span className="leaf l1"/>
          <span className="leaf l2"/>
          <span className="leaf l3"/>
          <span className="leaf l4"/>
          <span className="leaf l5"/>
        </div>

        <AlbumPanel
          node={selected}
          onClose={() => setSelectedId(null)}
          onEdit={() => setEditOpen(true)}
          onAddImages={() => fileRef.current?.click()}
          onOpenFolder={() => openFolder(selected?.id)}
          canOpen={canOpenSelected}
          isOpen={selected?.id === activeFolderId}
          onPatch={patchSelected}
          children={selectedChildren}
        />

        {selected && (
          <input
            ref={fileRef}
            className="hidden-file"
            type="file"
            accept="image/*"
            multiple
            onChange={e => addImages(e.target.files)}
          />
        )}

        {editOpen && selected && (
          <EditPanel
            node={selected}
            onClose={() => setEditOpen(false)}
            onPatch={patchSelected}
            onDelete={deleteSelected}
            onFiles={addImages}
          />
        )}
          </>
        ) : renderViewShell()}
      </main>
    </div>
  );
}
