import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  BaseEdge,
  getBezierPath
} from '@xyflow/react';
import { ArrowLeft, Sparkles } from 'lucide-react';

import AlbumPanel from '../components/AlbumPanel.jsx';
import EditPanel from '../components/EditPanel.jsx';
import StylePanel from '../components/board/StylePanel.jsx';

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

export const edgeTypes = { organic: OrganicEdge };

export default function BoardView({
  visibleNodes,
  visibleEdges,
  nodeTypes,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onEdgeClick,
  onNodeClick,
  onPaneClick,
  onInit,
  activeFolder,
  closeFolder,
  selected,
  editingNode,
  editOpen,
  setSelectedId,
  setEditOpen,
  setDraftBranch,
  fileRef,
  addImages,
  patchSelected,
  createDraftBranch,
  openFolder,
  canOpenSelected,
  selectedChildren,
  deleteSelected,
  selectedParentId,
  parentOptions,
  moveSelectedToBoard,
  styleProps
}) {
  return (
    <>
      <ReactFlow
        nodes={visibleNodes}
        edges={visibleEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeClick={onEdgeClick}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onInit={onInit}
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

        <Panel position="top-right">
          <StylePanel {...styleProps} />
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
        node={editOpen ? null : selected}
        onClose={() => setSelectedId(null)}
        onEdit={() => setEditOpen(true)}
        onAddImages={() => fileRef.current?.click()}
        onOpenFolder={() => openFolder(selected?.id)}
        canOpen={canOpenSelected}
        isOpen={selected?.id === activeFolder?.id}
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
          parentId={selectedParentId}
          parentOptions={parentOptions}
          onMove={moveSelectedToBoard}
        />
      )}

      {editOpen && editingNode?.data?.isDraft && (
        <EditPanel
          node={editingNode}
          onClose={() => {
            setDraftBranch(null);
            setEditOpen(false);
          }}
          onPatch={patchSelected}
          onDelete={deleteSelected}
          onFiles={addImages}
          parentId={selectedParentId}
          parentOptions={parentOptions}
          onMove={moveSelectedToBoard}
          onCreate={createDraftBranch}
        />
      )}
    </>
  );
}
