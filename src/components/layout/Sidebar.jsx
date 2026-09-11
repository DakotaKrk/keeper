import { Leaf, Settings } from 'lucide-react';
import { NAV_ITEMS } from '../../constants/keeperConstants';

export default function Sidebar({ activeView, onChangeView }) {
  return (
    <aside className="side-nav">
      <div className="nav-logo"><Leaf size={18}/></div>
      <nav>
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`nav-item ${activeView === item.id ? 'is-active' : ''}`}
              onClick={() => onChangeView(item.id)}
            >
              <Icon size={18}/><span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      <button className="nav-item nav-settings"><Settings size={18}/><span>Settings</span></button>
    </aside>
  );
}
