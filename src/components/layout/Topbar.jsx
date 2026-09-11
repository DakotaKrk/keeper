import { Plus, RotateCcw, Search } from 'lucide-react';
import { BRANCH_TYPES } from '../../constants/keeperConstants';

export default function Topbar({
  query,
  onQueryChange,
  matches,
  onFocusNode,
  onReset,
  addMenuOpen,
  onToggleAddMenu,
  onAddBranch
}) {
  return (
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
          onChange={e => onQueryChange(e.target.value)}
          placeholder="Search memories, people, tags..."
        />
        {!!matches.length && (
          <div className="search-results">
            {matches.slice(0, 7).map(n => (
              <button key={n.id} onClick={() => onFocusNode(n.id)}>
                <span>{n.data.title}</span>
                <small>{n.data.kind}</small>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="top-actions">
        <button className="icon-button" onClick={onReset} title="Reset demo">
          <RotateCcw size={16}/>
        </button>
        <div className="add-menu-wrap">
          <button className="primary-button" onClick={onToggleAddMenu}>
            <Plus size={17}/>Add branch
          </button>
          {addMenuOpen && (
            <div className="add-menu">
              {BRANCH_TYPES.map(kind => (
                <button key={kind} onClick={() => onAddBranch(kind)}>
                  <span>{kind}</span>
                  <small>{kind === 'Year' ? 'Main time group' : kind === 'Album' ? 'Photo collection' : 'Board branch'}</small>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
