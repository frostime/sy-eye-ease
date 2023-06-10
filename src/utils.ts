export function time2String(time: number) {
    // console.log(time);
    time = Math.round(time);
    let hour = Math.floor(time / 3600);
    let minute = Math.floor((time % 3600) / 60);
    let second = (time % 60);
    let timeArr = [];
    if (hour > 0) {
        timeArr.push(hour.toString().padStart(2, "0"));
    }
    timeArr.push(minute.toString().padStart(2, "0"));
    timeArr.push(second.toString().padStart(2, "0"));
    return timeArr.join(":");
}
