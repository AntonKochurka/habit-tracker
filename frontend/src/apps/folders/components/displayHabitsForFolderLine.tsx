import { useEffect, useState, useCallback } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import type { Folder } from "../services/types";
import type { Habit } from "@app/habits/service/types";
import api, { getErrorMessage } from "@shared/api";
import { useAppDispatch, useAppSelector } from "@shared/store";
import type { PaginationResponse } from "@shared/types";
import { toastBus } from "@shared/bus";
import { foldersActions } from "../redux";
import { getHabitsState, habitsActions, selectHabitsByFolderId, selectPaginationByFolderId } from "@app/habits/redux";

interface Props {
    folder: Folder;
}

interface HabitsFetch {
    folderId: number;
    page: number;
    pageSize?: number;
}

export default function DisplayHabitsForFolderLine({ folder }: Props) {
    const dispatch = useAppDispatch();
    const hState = useAppSelector(getHabitsState);
    const current_day = hState.current_day;
    const habits = useAppSelector(selectHabitsByFolderId(folder.id));
    const { page, hasMore } = useAppSelector(selectPaginationByFolderId(folder.id));
    const [autoLoading, setAutoLoading] = useState(true);

    const fetchHabits = useCallback(async ({ folderId, page }: HabitsFetch) => {
        try {
            const response = await api.get(`/habits?page=${page}&current_day=${current_day}&is_representative=true&folder_id=${folderId}`);
            if (response.status === 200) {
                const data: PaginationResponse<Habit> = response.data;
                return { items: data.items, hasMore: data.page < data.pages, ids: data.ids };
            }
        } catch (error) {
            toastBus.emit({ message: getErrorMessage(error) || "Unknown error", type: "error" });
        }
        return { items: [], hasMore: false, ids: null };
    }, [current_day]);

    const loadMore = useCallback(async () => {
        const { items, hasMore: newHasMore, ids } = await fetchHabits({
            folderId: folder.id,
            page,
            pageSize: 6,
        });

        dispatch(habitsActions.upsertMany(items));

        if (ids) {
            const existingIds = new Set(folder.habit_ids ?? []);
            const uniqueIds = ids.filter(id => !existingIds.has(id));

            if (uniqueIds.length > 0) {
                dispatch(foldersActions.addIdsToFolder({ folderId: folder.id, ext: uniqueIds }));
            }
        }

        dispatch(
            habitsActions.setPagination({
                folderId: folder.id,
                page: page + 1,
                hasMore: newHasMore,
            })
        );
    }, [fetchHabits, folder.id, page, dispatch]);

    useEffect(() => {
        if (habits.length === 0) {
            dispatch(habitsActions.resetPagination({ folderId: folder.id }));
        }
    }, [folder.id]);

    useEffect(() => {
        const autoLoad = async () => {
            const container = document.getElementById(`habits-folder-${folder.id}`);
            if (!container) return;
            let safetyCounter = 0;
            while (container.scrollHeight <= container.clientHeight && hasMore && safetyCounter < 10) {
                const prevCount = habits.length;
                await loadMore();
                safetyCounter++;
                if (habits.length === prevCount) break;
            }
            setAutoLoading(false);
        };

        if (autoLoading && hasMore) {
            autoLoad();
        }
    }, [autoLoading, hasMore, loadMore, habits.length, folder.id]);

    return (
        <InfiniteScroll
            dataLength={habits.length}
            next={loadMore}
            hasMore={hasMore}
            loader={<p className="text-center py-2">Loading...</p>}
            endMessage={<p className="text-center py-2 text-gray-500">No more habits</p>}
        >
            <div id={`habits-folder-${folder.id}`} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {habits.map((habit) => (
                    <div key={habit.id} className="shadow-md rounded-2xl border">
                        <div className="p-4">
                            <h3 className="font-semibold text-lg">{habit.title}</h3>
                            <p className="text-sm text-gray-600">{habit.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </InfiniteScroll>
    );
}
