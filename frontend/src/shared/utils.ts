export function filters_to_query(filters: Record<string, any>) {
    return Object.entries(filters)
        .map(([key, value]) => {
            if (value instanceof Date) {
                return `${key}=${value.toISOString()}`;
            }
            return `${key}=${value}`;
        })
        .join('&');
}