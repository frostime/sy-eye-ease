<script lang="ts">
    import SettingItem from "./setting-item.svelte";
    import { showMessage } from "siyuan";
    import { onMount, onDestroy } from "svelte";
    onMount(() => {
        showMessage("Setting panel opened");
    });
    onDestroy(() => {
        showMessage("Setting panel closed");
    });

    export let enabled: number;
    export let workTime: number;
    export let lockTime: number;

</script>

<!--
You can use this template to quickly create a setting panel,
with the same UI style in SiYuan
-->

<div class="config__tab-container">
    <SettingItem
        type="checkbox"
        title="启用 / Enable"
        text="启用倒计时 / Enable countdown"
        settingKey="Checkbox"
        settingValue={enabled}
        on:changed={(event) => {
            showMessage(
                `Checkbox changed: ${event.detail.key} = ${event.detail.value}`
            );
        }}
    />
    <SettingItem
        type="number"
        title="工作时长 / Work time"
        text="秒 / seconds"
        settingKey="Input"
        settingValue={workTime}
        placeholder=""
        on:changed={(event) => {
            showMessage(
                `Input changed: ${event.detail.key} = ${event.detail.value}`
            );
        }}
    />
    <SettingItem
        type="number"
        title="锁屏时长 / Screen lock time"
        text="秒 / seconds"
        settingKey="Input"
        settingValue={lockTime}
        placeholder=""
        on:changed={(event) => {
            showMessage(
                `Input changed: ${event.detail.key} = ${event.detail.value}`
            );
        }}
    />
</div>
