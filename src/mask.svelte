<script lang="ts">
    import { createEventDispatcher, onDestroy } from "svelte";

    import { unlock } from './svg';
    import { time2String } from './utils';

    const dispatch = createEventDispatcher();

    export let timeRemains; // 倒计时剩余时间，单位：毫秒
    let timer: any;
    let timeStr: string;

    export function restart(lockTime: number) {
        timeRemains = lockTime;
        const deadline = (new Date()).getTime() + timeRemains;
        timer = setInterval(() => {
            timeRemains = (deadline - (new Date()).getTime());
            if (timeRemains < 0) {
                timeRemains = 0;
            }
        }, 1000);
    }
    export function unMaskScreen() {
        dispatch("unmask");
        clearInterval(timer);
    }

    onDestroy(() => {
        clearInterval(timer);
    });

    $: if (timeRemains === 0) {
        unMaskScreen();
    }
    $: timeStr = time2String(timeRemains / 1000);

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
