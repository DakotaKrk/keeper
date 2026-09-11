import React from 'react';
import { Folder, X, Upload, Trash2 } from 'lucide-react';

const CARD_COLORS = [
  { id: 'linen', label: 'Linen' },
  { id: 'moss', label: 'Moss' },
  { id: 'wine', label: 'Wine' },
  { id: 'clay', label: 'Clay' },
  { id: 'ochre', label: 'Ochre' },
  { id: 'plum', label: 'Plum' }
];

export default function EditPanel({ node, onClose, onPatch, onDelete, onFiles, parentId, parentOptions = [], onMove, onCreate }) {
  if (!node) return null;
  const d = node.data;
  const isDraft = !!d.isDraft;
  const parent = parentOptions.find(option => option.id === parentId);

  return (
    <aside className="edit-panel">
      <div className="edit-head">
        <div>
          <div className="detail-kicker">{isDraft ? 'Create branch' : 'Edit branch'}</div>
          <h3>{d.title || 'New branch'}</h3>
        </div>
        <button className="icon-button" onClick={onClose}><X size={18}/></button>
      </div>

      <div className="edit-scroll">
        <section className="edit-section">
          <div className="section-label">1. Place it</div>
          <label className="field">
            <span>Branch type</span>
            <select value={d.kind || 'Album'} onChange={e => onPatch({ kind: e.target.value })}>
              <option>Collection</option>
              <option>Album</option>
              <option>Event</option>
              <option>Person</option>
              <option>Period</option>
              {!isDraft && <option>Root</option>}
            </select>
          </label>

          {d.kind !== 'Root' && (
            <label className="field">
              <span>Board</span>
              <select value={parentId || ''} onChange={e => onMove?.(e.target.value)}>
                {parentOptions.map(parent => (
                  <option key={parent.id} value={parent.id}>
                    {parent.data.title}
                  </option>
                ))}
              </select>
            </label>
          )}

          {isDraft && parent && (
            <div className="branch-preview-note">
              <Folder size={15}/>
              <span>This will be created inside <strong>{parent.data.title}</strong>.</span>
            </div>
          )}
        </section>

        <section className="edit-section">
          <div className="section-label">2. Name it</div>
          <label className="field">
            <span>Title</span>
            <input value={d.title || ''} onChange={e => onPatch({ title: e.target.value })} placeholder="Example: January, Family, Photo job 1"/>
          </label>
        </section>

        <section className="edit-section">
          <div className="section-label">3. Details</div>
          <label className="field">
            <span>Story, optional</span>
            <textarea rows="4" value={d.note || ''} onChange={e => onPatch({ note: e.target.value })} placeholder="Add your story now or later."/>
          </label>

          <div className="field-grid">
            <label className="field">
              <span>Date</span>
              <input type="date" value={d.date || ''} onChange={e => onPatch({ date: e.target.value })}/>
            </label>
            <label className="field">
              <span>Visibility</span>
              <select value={d.visibility || 'private'} onChange={e => onPatch({ visibility: e.target.value })}>
                <option value="private">Private</option>
                <option value="shared">Shared</option>
              </select>
            </label>
          </div>

          <div className="field">
            <span>Card color</span>
            <div className="color-palette" role="list">
              {CARD_COLORS.map(color => (
                <button
                  key={color.id}
                  type="button"
                  className={`color-swatch color-${color.id} ${(d.cardColor || 'linen') === color.id ? 'is-active' : ''}`}
                  onClick={() => onPatch({ cardColor: color.id })}
                  aria-label={color.label}
                  title={color.label}
                >
                  <span />
                </button>
              ))}
            </div>
          </div>
        </section>

        {!isDraft && (
          <label className="upload-button">
            <Upload size={16}/>
            Add images
            <input type="file" accept="image/*" multiple onChange={e => onFiles(e.target.files)}/>
          </label>
        )}

        {!isDraft && (
          <button className="delete-button" onClick={onDelete}>
            <Trash2 size={15}/>Delete branch
          </button>
        )}

        {isDraft && (
          <button className="done-button" onClick={onCreate}>
            Create branch
          </button>
        )}
      </div>
    </aside>
  );
}
