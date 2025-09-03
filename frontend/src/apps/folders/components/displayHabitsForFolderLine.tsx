import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import type { Folder } from "../services/types";
import type { Habit } from "@app/habits/service/types";
import api, { getErrorMessage } from "@shared/api";
import { useAppDispatch, useAppSelector } from "@shared/store";
import type { PaginationResponse } from "@shared/types";
import { toastBus } from "@shared/bus";
import { foldersActions } from "../redux";
import { getHabitsState, habitsActions, selectHabitsByFolderId } from "@app/habits/redux";

interface Props {
    folder: Folder;
}

interface HabitsFetch {
    folderId: number;
    page: number;
    pageSize?: number;
}

async function fetchFakeHabits({
    folderId,
    page,
    pageSize = 3,
}: HabitsFetch): Promise<{ items: Habit[]; hasMore: boolean, ids: number[] | null }> {
    return new Promise((resolve) => {
        setTimeout(() => {
            const total = 100;
            const start = (page - 1) * pageSize;
            const end = start + pageSize;

            const fakeHabits: Habit[] = Array.from({
                length: Math.min(pageSize, total - start),
            }).map((_, i) => ({
                id: start + i + 1,
                title: `Habit ${start + i + 1}`,
                description: "Some description",
                folderId,
                habit_type: "default",
                target_value: 10,
                record: null,
            }));

            resolve({ items: fakeHabits, hasMore: end < total, ids: fakeHabits.map(h => h.id) });
        }, 500);
    });
}

export default function DisplayHabitsForFolderLine({ folder }: Props) {
    const dispatch = useAppDispatch();

    const hState = useAppSelector(getHabitsState);
    const current_day = hState.current_day;
    const habits = useAppSelector(selectHabitsByFolderId(folder.id));

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchHabits = async ({ folderId, page }: HabitsFetch) => {
        try {
            const response = await api.get(`/habits?page=${page}&current_day=${current_day}&is_representative=true&folder_id=${folderId}`)
            if (response.status === 200) {
                const data: PaginationResponse<Habit> = response.data;


                return data.items, data.page < data.pages, data.ids
            }
        } catch (error) {
            toastBus.emit({ message: getErrorMessage(error) || "Unknown error", type: "error" })
        }
    }

    const loadMore = async () => {
        console.log(page);
        
        const { items, hasMore, ids } = await fetchFakeHabits({
            folderId: folder.id,
            page,
            pageSize: 6,
        });

        dispatch(habitsActions.upsertMany(items));

        if (ids)
            dispatch(foldersActions.addIdsToFolder({ folderId: folder.id, ext: ids }))

        setPage((prev) => prev + 1);
        setHasMore(hasMore);
    };

    useEffect(() => {
        loadMore();
    }, []);

    return (
        <InfiniteScroll
            dataLength={habits.length}
            next={loadMore}
            hasMore={hasMore}
            loader={<p className="text-center py-2">Loading...</p>}
            endMessage={<p className="text-center py-2 text-gray-500">No more habits</p>}
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
