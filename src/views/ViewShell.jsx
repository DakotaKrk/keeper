import { PEOPLE, TAGS_INDEX } from '../constants/keeperConstants';
import AlbumsView from './AlbumsView';
import HomeView from './HomeView';
import PeopleView from './PeopleView';
import TagsView from './TagsView';

export default function ViewShell({ activeView, visibleCount, albumNodes, onChangeView, onFocusNode }) {
  if (activeView === 'home') {
    return (
      <HomeView
        visibleCount={visibleCount}
        albumCount={albumNodes.length}
        onChangeView={onChangeView}
      />
    );
  }

  if (activeView === 'albums') {
    return <AlbumsView albumNodes={albumNodes} onFocusNode={onFocusNode} />;
  }

  if (activeView === 'people') {
    return <PeopleView people={PEOPLE} />;
  }

  return <TagsView tags={TAGS_INDEX} />;
}
