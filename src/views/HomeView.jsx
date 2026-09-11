import { Album, Folder, Tags, UserRound } from 'lucide-react';

export default function HomeView({ visibleCount, albumCount, onChangeView }) {
  return (
    <section className="view-shell">
      <div className="view-head">
        <span>Keeper Home</span>
        <h1>Your memory archive, without the noise.</h1>
        <p>Start from the board, open a folder, and let albums branch into stories, people and related collections.</p>
      </div>
      <div className="shell-grid">
        <button className="shell-card is-wide" onClick={() => onChangeView('board')}>
          <Folder size={18}/>
          <strong>Open Board</strong>
          <span>{visibleCount} visible branches right now</span>
        </button>
        <button className="shell-card" onClick={() => onChangeView('albums')}>
          <Album size={18}/>
          <strong>Albums</strong>
          <span>{albumCount} collections</span>
        </button>
        <button className="shell-card" onClick={() => onChangeView('people')}>
          <UserRound size={18}/>
          <strong>People</strong>
          <span>Find memories by who was there</span>
        </button>
        <button className="shell-card" onClick={() => onChangeView('tags')}>
          <Tags size={18}/>
          <strong>Tags</strong>
          <span>Connect images across albums</span>
        </button>
      </div>
    </section>
  );
}
