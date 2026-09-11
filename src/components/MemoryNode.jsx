import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Lock, Users, Image as ImageIcon, CalendarDays, Flower2, Leaf, Star } from 'lucide-react';

const CORE_SYMBOLS = {
  leaf: Leaf,
  flower: Flower2,
  star: Star
};

function MemoryNode({ data, selected }) {
  const cover = data.images?.[0];
  const isLife = data.kind === 'Root';
  const kindClass = `kind-${(data.kind || 'album').toLowerCase().replace(/\s+/g, '-')}`;
  const CoreSymbol = CORE_SYMBOLS[data.coreSymbol] || Leaf;

  return (
    <div className={`memory-node ${kindClass} ${isLife ? 'life-node' : ''} ${data.isBoardCore ? `board-core-node core-color-${data.coreColor || 'dark'}` : ''} ${selected ? 'is-selected' : ''}`}>
      <Handle id="top" type="target" position={Position.Top} className="node-handle" />
      <Handle id="right" type="target" position={Position.Right} className="node-handle" />
      <Handle id="bottom" type="target" position={Position.Bottom} className="node-handle" />
      <Handle id="left" type="target" position={Position.Left} className="node-handle" />

      <div className="node-cover">
        {cover ? (
          <img src={cover} alt="" />
        ) : (
          <div className="cover-placeholder">
            <span className="cover-orb" />
            {data.isBoardCore ? (
              <CoreSymbol className="core-symbol" size={34} strokeWidth={1.35} />
            ) : (
              <ImageIcon size={20} strokeWidth={1.5} />
            )}
          </div>
        )}

        <span className="node-kind">{data.kind}</span>
        <span className="node-privacy">
          {data.visibility === 'shared' ? <Users size={10}/> : <Lock size={10}/>}
          {data.visibility === 'shared' ? 'Shared' : 'Private'}
        </span>
      </div>

      <div className="node-body">
        <div className="node-title">{data.title}</div>
        {data.note && <div className="node-note">{data.note}</div>}
        <div className="node-meta">
          {data.date && <span><CalendarDays size={11}/>{data.date}</span>}
          {!!data.images?.length && <span><ImageIcon size={11}/>{data.images.length}</span>}
        </div>
      </div>

      <Handle id="top" type="source" position={Position.Top} className="node-handle" />
      <Handle id="right" type="source" position={Position.Right} className="node-handle" />
      <Handle id="bottom" type="source" position={Position.Bottom} className="node-handle" />
      <Handle id="left" type="source" position={Position.Left} className="node-handle" />
    </div>
  );
}

export default memo(MemoryNode);
