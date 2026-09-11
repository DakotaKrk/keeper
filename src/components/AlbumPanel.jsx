import React, { useState } from 'react';
import { ArrowLeft, Camera, ChevronLeft, ChevronRight, FolderOpen, X, Pencil, Printer, ImagePlus, CalendarDays, MoreHorizontal, Tags, UserRound } from 'lucide-react';

const mountainDemoImages = [
  'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1491555103944-7c647fd857e6?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80'
];

export default function AlbumPanel({ node, onClose, onEdit, onAddImages, onOpenFolder, canOpen, isOpen, onPatch }) {
  const [albumView, setAlbumView] = useState('polaroid');
  const [panelSize, setPanelSize] = useState('half');
  const [activeImage, setActiveImage] = useState(null);
  if (!node) return null;
  const d = node.data;
  const ownImages = d.images || [];
  const isMountainDemo = d.title?.toLowerCase().includes('mountain');
  const images = ownImages.length ? ownImages : (isMountainDemo ? mountainDemoImages : []);
  const cover = images[0];
  const gallery = images.slice(1);
  const fileCounts = {
    all: images.length,
    jpg: images.length,
    raw: Math.max(0, Math.round(images.length * 0.7)),
    video: Math.max(0, Math.floor(images.length / 5)),
    favorites: Math.min(images.length, Math.max(0, Math.ceil(images.length / 4)))
  };
  const tags = ['#keeper', '#memories', d.kind ? `#${d.kind.toLowerCase()}` : '#album'];
  const related = ['Winter 2024', 'Summer 2025'];
  const captions = [
    'Our little cabin in the clouds.',
    'Further than we thought.',
    'Cold nose. Warm heart.',
    'Stillness hits different up here.',
    'Same view. Different chapter.',
    'Good company.'
  ];
  const memoryCaptions = d.captions || [];

  function captionFor(index) {
    return memoryCaptions[index] || captions[index % captions.length];
  }

  function updateCaption(index, value) {
    const next = [...memoryCaptions];
    next[index] = value;
    onPatch?.({ captions: next });
  }

  function stepImage(direction) {
    setActiveImage(current => {
      if (current === null || !images.length) return current;
      return (current + direction + images.length) % images.length;
    });
  }

  return (
    <aside className={`detail-panel album-experience album-size-${panelSize}`}>
      <div className={`album-cover ${cover ? 'has-cover' : ''}`}>
        {cover && <img src={cover} alt="" />}
        <button className="album-back" onClick={onClose}><ArrowLeft size={15}/>Back to board</button>
        <div className="album-size-switch">
          <button className={panelSize === 'half' ? 'is-active' : ''} onClick={() => setPanelSize('half')}>Half</button>
          <button className={panelSize === 'full' ? 'is-active' : ''} onClick={() => setPanelSize('full')}>Full</button>
        </div>
        <button className="icon-button album-close" onClick={onClose}><X size={18}/></button>
        <button className="cover-edit"><Pencil size={13}/>Edit cover</button>
        <div className="album-cover-title">
          <div className="detail-kicker">{d.kind}</div>
          <h2>{d.title}{d.date ? ` — ${d.date}` : ''}</h2>
          <p>{images.length ? `${images.length} images` : 'No images yet'}{d.note ? ` · ${d.note}` : ''}</p>
        </div>
      </div>

      <div className="detail-scroll">
        <div className="album-title-row">
          <div>
            <div className="detail-kicker">{d.kind}</div>
            <h2>{d.title}</h2>
            <div className="detail-meta">
              {!!images.length && <span>{images.length} images</span>}
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
          <button><UserRound size={14}/>People</button>
          <button><Tags size={14}/>Tags</button>
          <button><Pencil size={14}/>Notes</button>
        </div>

        <div className="asset-tabs">
          <button className="is-active">All <span>{fileCounts.all}</span></button>
          <button>JPG <span>{fileCounts.jpg}</span></button>
          <button>RAW <span>{fileCounts.raw}</span></button>
          <button>Video <span>{fileCounts.video}</span></button>
          <button>Favorites <span>{fileCounts.favorites}</span></button>
        </div>

        <div className="delivery-strip">
          <span><Camera size={14}/>Client delivery</span>
          <p>Sort originals, selects and export-ready files inside the same album.</p>
        </div>

        <div className="album-view-switch">
          <span>Album layout</span>
          <div className="segmented-control">
            <button className={albumView === 'grid' ? 'is-active' : ''} onClick={() => setAlbumView('grid')}>Grid</button>
            <button className={albumView === 'polaroid' ? 'is-active' : ''} onClick={() => setAlbumView('polaroid')}>Polaroid</button>
          </div>
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
              <div className={albumView === 'polaroid' ? 'polaroid-gallery' : 'photo-masonry'}>
                {images.map((src, i) => (
                  <button
                    className={albumView === 'polaroid' ? `polaroid-photo p${i % 4}` : `masonry-photo p${i % 7}`}
                    key={i}
                    onClick={() => setActiveImage(i)}
                  >
                    <img src={src} alt="" />
                    {albumView === 'polaroid' && <span>{captionFor(i)}</span>}
                  </button>
                ))}
                <button className={albumView === 'polaroid' ? 'polaroid-photo add-photo-tile' : 'masonry-photo add-photo-tile'} onClick={onAddImages}>
                  <ImagePlus size={18}/>Add more
                </button>
              </div>
            )}
          </section>

          <aside className="album-aside">
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

        {activeImage !== null && images[activeImage] && (
          <div className="image-lightbox" role="dialog" aria-modal="true">
            <button className="icon-button lightbox-close" onClick={() => setActiveImage(null)}><X size={18}/></button>
            <button className="icon-button lightbox-step prev" onClick={() => stepImage(-1)}><ChevronLeft size={20}/></button>
            <div className="lightbox-card">
              <img src={images[activeImage]} alt="" />
              <label>
                <span>Memory note</span>
                <textarea
                  rows="3"
                  value={memoryCaptions[activeImage] || ''}
                  placeholder={captionFor(activeImage)}
                  onChange={e => updateCaption(activeImage, e.target.value)}
                />
              </label>
            </div>
            <button className="icon-button lightbox-step next" onClick={() => stepImage(1)}><ChevronRight size={20}/></button>
          </div>
        )}
      </div>
    </aside>
  );
}
