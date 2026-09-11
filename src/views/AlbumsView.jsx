import { Folder } from 'lucide-react';

export default function AlbumsView({ albumNodes, onFocusNode }) {
  return (
    <section className="view-shell">
      <div className="view-head">
        <span>Albums</span>
        <h1>Collections with room for series.</h1>
        <p>Later, selected related albums can become a new main album. For now this gives us the clean overview.</p>
      </div>
      <div className="album-index">
        {albumNodes.map(node => (
          <button key={node.id} className="album-index-item" onClick={() => onFocusNode(node.id)}>
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
