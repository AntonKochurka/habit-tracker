import InfiniteScroll from "react-infinite-scroll-component";
import { useAppSelector, useAppDispatch } from "@shared/store";
import FolderLine from "@app/folders/components/folderLine";
import { folderSelector} from "@app/folders/redux";
import { fetchFoldersPage } from "@app/folders/redux/thunks";
import { useEffect } from "react";
import NeedAuth from "@shared/decorators/needAuth";
import CalendarLine from "@app/habits/components/calendarLine";

export default function HomePage() {
  const dispatch = useAppDispatch();
  const fState = useAppSelector((state) => state.folders);
  const folders = useAppSelector(folderSelector.selectAll);


  useEffect(() => {
    dispatch(fetchFoldersPage(1))
  }, [dispatch, fState.filters])
  
  const fetchMore = () => {
    if (fState.hasMore) dispatch(fetchFoldersPage(fState.page + 1));
  };

  return (
    <div>
      <NeedAuth/>
      <CalendarLine />
      <InfiniteScroll
        dataLength={folders.length}
        next={fetchMore}
        hasMore={fState.hasMore}
        loader={<h4>Loading...</h4>}
      >
        {folders.map((folder) => (
          <FolderLine key={folder.id} folder={folder} />
        ))}
      </InfiniteScroll>
    </div>
  );
}
