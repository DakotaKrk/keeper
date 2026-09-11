import React from 'react';
import { FolderOpen, X, Pencil, Printer, ImagePlus, CalendarDays, MapPin, MoreHorizontal, Share2, Tags, UserRound } from 'lucide-react';

export default function AlbumPanel({ node, onClose, onEdit, onAddImages, onOpenFolder, canOpen, isOpen }) {
  if (!node) return null;
  const d = node.data;
  const images = d.images || [];
  const cover = images[0];
  const gallery = images.slice(1);
  const tags = ['#keeper', '#memories', d.kind ? `#${d.kind.toLowerCase()}` : '#album'];
  const related = ['Winter 2024', 'Summer 2025'];

  return (
    <aside className="detail-panel">
      <div className={`album-cover ${cover ? 'has-cover' : ''}`}>
        {cover && <img src={cover} alt="" />}
        <button className="icon-button album-close" onClick={onClose}><X size={18}/></button>
        <button className="cover-edit"><Pencil size={13}/>Edit cover</button>
      </div>

      <div className="detail-scroll">
        <div className="album-title-row">
          <div>
            <div className="detail-kicker">{d.kind}</div>
            <h2>{d.title}</h2>
            <div className="detail-meta">
              {!!images.length && <span>{images.length} images</span>}
              {d.place && <span><MapPin size={14}/>{d.place}</span>}
              {d.date && <span><CalendarDays size={14}/>{d.date}</span>}
            </div>
            <p className="album-intro">{d.note || 'Add a story to this memory.'}</p>
          </div>
          <div className="album-title-actions">
            <button className="primary" onClick={onAddImages}><ImagePlus size={15}/>Add images</button>
            <button><MoreHorizontal size={17}/></button>
          </div>
        </div>

        <div className="album-tabs">
          <button className="is-active"><ImagePlus size={14}/>Images</button>
          <button><MapPin size={14}/>Map</button>
          <button><UserRound size={14}/>People</button>
          <button><Pencil size={14}/>Notes</button>
        </div>

        <div className="album-layout">
          <section className="album-main">
            {!images.length ? (
              <div className="detail-empty empty-album">
                <ImagePlus size={30} strokeWidth={1.5}/>
                <span>No images here yet</span>
                <button onClick={onAddImages}>Add images</button>
              </div>
            ) : (
              <div className="photo-masonry">
                {images.map((src, i) => (
                  <div className={`masonry-photo p${i % 7}`} key={i}>
                    <img src={src} alt="" />
                  </div>
                ))}
                <button className="masonry-photo add-photo-tile" onClick={onAddImages}>
                  <ImagePlus size={18}/>Add more
                </button>
              </div>
            )}
          </section>

          <aside className="album-aside">
            <div className="info-card">
              <strong><MapPin size={14}/>Places</strong>
              <div className="mini-map">{d.place || 'No place yet'}</div>
            </div>

            <div className="info-card">
              <strong><Tags size={14}/>Tags</strong>
              <div className="tag-list">
                {tags.map(tag => <span key={tag}>{tag}</span>)}
                <button>+</button>
              </div>
            </div>

            <div className="info-card">
              <strong><UserRound size={14}/>People</strong>
              <div className="people-row">
                <span>N</span><span>K</span><span>S</span><button>+</button>
              </div>
            </div>

            <div className="info-card">
              <strong><FolderOpen size={14}/>Related albums</strong>
              <div className="related-grid">
                {related.map((title, i) => (
                  <div key={title}>
                    <div className="related-thumb">{gallery[i] && <img src={gallery[i]} alt="" />}</div>
                    <span>{title}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>

        <div className="detail-actions">
          {canOpen && !isOpen && (
            <button className="primary span-action" onClick={onOpenFolder}>
              <FolderOpen size={15}/>Open folder
            </button>
          )}
          <button onClick={onEdit}><Pencil size={15}/>Edit</button>
          <button className="primary"><Printer size={15}/>Create print set</button>
        </div>
      </div>
    </aside>
  );
}
