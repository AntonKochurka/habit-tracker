import InfiniteScroll from "react-infinite-scroll-component";
import { useAppSelector, useAppDispatch } from "@shared/store";
import FolderLine from "@app/folders/components/folderLine";
import { folderSelector } from "@app/folders/redux";
import { fetchFoldersPage } from "@app/folders/redux/thunks";
import { useEffect, useState } from "react";
import NeedAuth from "@shared/decorators/needAuth";
import CalendarLine from "@app/habits/components/calendarLine";

export default function HomePage() {
  const dispatch = useAppDispatch();
  const fState = useAppSelector((state) => state.folders);
  const folders = useAppSelector(folderSelector.selectAll);
  const [autoLoading, setAutoLoading] = useState(true);

  const fetchMore = () => {
    if (fState.hasMore) {
      dispatch(fetchFoldersPage(fState.page + 1));
    }
  };

  useEffect(() => {
    if (folders.length === 0) {
      dispatch(fetchFoldersPage(1));
    }
  }, [dispatch, folders.length]);

  useEffect(() => {
    if (!autoLoading || !fState.hasMore) return;
    const container = document.getElementById("folders-container");
    if (!container) return;
    if (container.scrollHeight <= container.clientHeight) {
      dispatch(fetchFoldersPage(fState.page + 1));
    } else {
      setAutoLoading(false);
    }
  }, [folders.length, fState.page, fState.hasMore, autoLoading, dispatch]);

  return (
    <div>
      <NeedAuth />
      <CalendarLine />
      <div id="folders-container" style={{ height: "80vh", overflow: "auto" }}>
        <InfiniteScroll
          dataLength={folders.length}
          next={fetchMore}
          hasMore={fState.hasMore}
          loader={<h4>Loading...</h4>}
          scrollableTarget="folders-container"
        >
          {folders.map((folder) => (
            <FolderLine key={folder.id} folder={folder} />
          ))}
        </InfiniteScroll>
      </div>
    </div>
  );
}
