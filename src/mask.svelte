<script lang="ts">
    import { createEventDispatcher } from "svelte";

    import { unlock } from './svg';

    const dispatch = createEventDispatcher();

    export let timeRemains = 60 * 5; // 倒计时剩余时间，单位：秒
    let timeStr: string;

    let timer = setInterval(() => {
        timeRemains--;
        if (timeRemains === 0) {
            clearInterval(timer);
            dispatch("unmask");
        }
    }, 1000);

    $: if (timeRemains === 0) {
        unMaskScreen();
    }

    $: {
        let hour = Math.floor(timeRemains / 3600);
        let minute = Math.floor((timeRemains % 3600) / 60);
        let second = (timeRemains % 60);
        let timeArr = [];
        if (hour > 0) {
            timeArr.push(hour.toString().padStart(2, "0"));
        }
        timeArr.push(minute.toString().padStart(2, "0"));
        timeArr.push(second.toString().padStart(2, "0"));
        timeStr = timeArr.join(":");
    }

    export function unMaskScreen() {
        dispatch("unmask");
        clearInterval(timer);
    }
</script>

<div id="global-mask">

    <!-- 正中间的倒计时 -->
    <div id="countdown">
        {timeStr}
    </div>

    <!-- 关闭按钮 -->
    <div id="unmask" on:click={unMaskScreen} on:keypress={() => {}}>
        {@html unlock}
    </div>
</div>

<style lang="scss">
    #global-mask {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 9999;
        background-color: rgba(0, 0, 0, 1);
    }
    #countdown {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: rgb(220, 220, 220);
        font-size: 100px;
        font-weight: bold;
    }
    #unmask {
        position: absolute;
        bottom: 50px;
        right: 50px;
        width: 40px;
        height: 40px;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>
