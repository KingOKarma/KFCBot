export function arrayPage<T>(array: T[], pageSize: number, pageNumber: number): T[] {
    return array.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
}