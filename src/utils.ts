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

let DebounceTimer: any = null;

export function debounce<T extends Function>(cb: T, wait = 20) {
    let callable = (...args: any) => {
        clearTimeout(DebounceTimer);
        DebounceTimer = setTimeout(() => cb(...args), wait);
    };
    return <T>(<any>callable);
}
