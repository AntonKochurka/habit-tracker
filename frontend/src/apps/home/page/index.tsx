import InfiniteScroll from "react-infinite-scroll-component";
import { useAppSelector, useAppDispatch } from "@shared/store";
import FolderLine from "@app/folders/components/folderLine";
import { getFolders, fetchFoldersPage } from "@app/folders/redux";

export default function HomePage() {
  const dispatch = useAppDispatch();
  const folders = Object.values(useAppSelector(getFolders));
  const hasMore = useAppSelector((state) => state.folders.hasMore);
  const page = useAppSelector((state) => state.folders.page);

  const fetchMore = () => {
    if (hasMore) dispatch(fetchFoldersPage(page + 1));
  };

  return (
    <InfiniteScroll
      dataLength={folders.length}
      next={fetchMore}
      hasMore={hasMore}
      loader={<h4>Loading...</h4>}
    >
      {folders.map((folder) => (
        <FolderLine key={folder.id} folder={folder} />
      ))}
    </InfiniteScroll>
  );
}
