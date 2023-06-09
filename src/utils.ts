export function time2String(time: number) {
    let hour = Math.floor(time / 3600);
    let minute = Math.floor((time % 3600) / 60);
    let second = Math.round(time % 60);
    let timeArr = [];
    if (hour > 0) {
        timeArr.push(hour.toString().padStart(2, "0"));
    }
    timeArr.push(minute.toString().padStart(2, "0"));
    timeArr.push(second.toString().padStart(2, "0"));
    return timeArr.join(":");
}

export function debounce<T extends (...args: any[]) => void>(
    callback: T,
    wait: number,
    immediate = false,
) {
    // This is a number in the browser and an object in Node.js,
    // so we'll use the ReturnType utility to cover both cases.
    let timeout: ReturnType<typeof setTimeout> | null;

    return function <U>(this: U, ...args: Parameters<typeof callback>) {
        const context = this;
        const later = () => {
            timeout = null;

            if (!immediate) {
                callback.apply(context, args);
            }
        };
        const callNow = immediate && !timeout;

        if (typeof timeout === "number") {
            clearTimeout(timeout);
        }

        timeout = setTimeout(later, wait);

        if (callNow) {
            callback.apply(context, args);
        }
    };
}
