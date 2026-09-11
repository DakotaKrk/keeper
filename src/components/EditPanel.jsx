import React from 'react';
import { X, Upload, Trash2 } from 'lucide-react';

export default function EditPanel({ node, onClose, onPatch, onDelete, onFiles }) {
  if (!node) return null;
  const d = node.data;

  return (
    <aside className="edit-panel">
      <div className="edit-head">
        <div>
          <div className="detail-kicker">Edit branch</div>
          <h3>{d.title}</h3>
        </div>
        <button className="icon-button" onClick={onClose}><X size={18}/></button>
      </div>

      <div className="edit-scroll">
        <label className="field">
          <span>Title</span>
          <input value={d.title || ''} onChange={e => onPatch({ title: e.target.value })}/>
        </label>

        <div className="field-grid">
          <label className="field">
            <span>Type</span>
            <select value={d.kind || 'Album'} onChange={e => onPatch({ kind: e.target.value })}>
              <option>Album</option>
              <option>Year</option>
              <option>Month</option>
              <option>Event</option>
              <option>Person</option>
              <option>Place</option>
              <option>Period</option>
              <option>Collection</option>
              <option>Root</option>
            </select>
          </label>

          <label className="field">
            <span>Visibility</span>
            <select value={d.visibility || 'private'} onChange={e => onPatch({ visibility: e.target.value })}>
              <option value="private">Private</option>
              <option value="shared">Shared</option>
            </select>
          </label>
        </div>

        <label className="field">
          <span>Story</span>
          <textarea rows="4" value={d.note || ''} onChange={e => onPatch({ note: e.target.value })}/>
        </label>

        <div className="field-grid">
          <label className="field">
            <span>Date</span>
            <input value={d.date || ''} onChange={e => onPatch({ date: e.target.value })} placeholder="Jan 2026"/>
          </label>
          <label className="field">
            <span>Place</span>
            <input value={d.place || ''} onChange={e => onPatch({ place: e.target.value })} placeholder="Aspen"/>
          </label>
        </div>

        <label className="upload-button">
          <Upload size={16}/>
          Add images
          <input type="file" accept="image/*" multiple onChange={e => onFiles(e.target.files)}/>
        </label>

        <button className="delete-button" onClick={onDelete}>
          <Trash2 size={15}/>Delete branch
        </button>
      </div>
    </aside>
  );
}
