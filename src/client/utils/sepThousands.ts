export function sepThousands(string: string | number): string {
    if (typeof string === "string") {
        return string.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    return string.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

}