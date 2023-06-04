<script lang="ts">
    import { createEventDispatcher } from "svelte";

    import { unlock } from './svg';

    const dispatch = createEventDispatcher();

    export function unMaskScreen() {
        dispatch("unmask");
    }
</script>

<div id="global-mask">
    <!-- 右上角的关闭按钮 -->
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
