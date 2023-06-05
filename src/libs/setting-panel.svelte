<script lang="ts">
    import SettingItem from "./setting-item.svelte";
    import { showMessage } from "siyuan";
    import { onMount, onDestroy, createEventDispatcher } from "svelte";

    const distpatch = createEventDispatcher();

    export let storage: { [key: string]: any };
    let enabled: number;
    let workTime: number;
    let lockTime: number;

    onMount(() => {
        enabled = storage["enabled"];
        workTime = storage["workTime"];
        lockTime = storage["lockTime"];
    });
    onDestroy(() => {
        showMessage("Setting panel closed");
    });
    function onChanged(event: CustomEvent) {
        let key = event.detail.key;
        let value = event.detail.value;
        switch (key) {
            case "enabled":
                enabled = value;
                break;
            case "workTime":
                workTime = value;
                break;
            case "lockTime":
                lockTime = value;
                break;
        }
    }
    function doUpdateSetting() {
        distpatch("changed", {
            enabled: enabled,
            workTime: workTime,
            lockTime: lockTime,
        });
    }
</script>

<!--
You can use this template to quickly create a setting panel,
with the same UI style in SiYuan
-->

<div class="config__tab-container">
    <SettingItem
        type="checkbox"
        title="启用"
        text="启用倒计时"
        settingKey="enabled"
        settingValue={enabled}
        on:changed={onChanged}
    />
    <SettingItem
        type="number"
        title="工作时长"
        text="秒"
        settingKey="workTime"
        settingValue={workTime}
        placeholder=""
        on:changed={onChanged}
    />
    <SettingItem
        type="number"
        title="锁屏时长"
        text="秒"
        settingKey="lockTime"
        settingValue={lockTime}
        placeholder=""
        on:changed={onChanged}
    />
    <SettingItem
        type="button"
        title="保存"
        text="保存设置"
        settingKey="Save"
        settingValue="保存设置"
        on:clicked={doUpdateSetting}
    />
</div>
