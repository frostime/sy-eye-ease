<script lang="ts">
    import { showMessage } from "siyuan";
    import SettingItem from "./setting-item.svelte";
    import { onMount, onDestroy, createEventDispatcher } from "svelte";

    const distpatch = createEventDispatcher();

    export let storage: { [key: string]: any };
    export let i18n: any;
    let enabled: number;
    let workTime: number;
    let lockTime: number;
    let pauseOnRest: boolean;
    let checkRestInterval: number;
    let isValid: boolean = true;

    onMount(() => {
        // console.log(storage);
        enabled = storage["enabled"];
        workTime = storage["workTime"];
        lockTime = storage["lockTime"];
        pauseOnRest = storage["pauseOnRest"];
        checkRestInterval = storage["checkRestInterval"];
    });
    onDestroy(() => {
        // showMessage("Setting panel closed");
    });
    function onChanged(event: CustomEvent) {
        let key = event.detail.key;
        let value = event.detail.value;
        switch (key) {
            case "enabled":
                enabled = value;
                break;
            case "workTime":
                if (value < 10) {
                    isValid = false;
                    showMessage(i18n.msgMinTime);
                    return;
                }
                workTime = value;
                break;
            case "lockTime":
                if (value < 10) {
                    isValid = false;
                    showMessage(i18n.msgMinTime);
                    return;
                }
                lockTime = value;
                break;
            case "pauseOnRest":
                pauseOnRest = value;
                break;
            case "checkRestInterval":
                if (value < 10) {
                    isValid = false;
                    showMessage(i18n.msgMinTime);
                    return;
                }
                checkRestInterval = value;
                break;
        }
    }
    function doUpdateSetting() {
        if (!isValid) {
            return;
        }
        distpatch("changed", {
            enabled: enabled,
            workTime: workTime,
            lockTime: lockTime,
            pauseOnRest: pauseOnRest,
            checkRestInterval: checkRestInterval
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
        title={i18n.enabled.title}
        text={i18n.enabled.text}
        settingKey="enabled"
        settingValue={enabled}
        on:changed={onChanged}
    />
    <SettingItem
        type="number"
        title={i18n.workTime.title}
        text={i18n.workTime.text}
        settingKey="workTime"
        settingValue={workTime}
        placeholder=""
        on:changed={onChanged}
    />
    <SettingItem
        type="number"
        title={i18n.lockTime.title}
        text={i18n.lockTime.text}
        settingKey="lockTime"
        settingValue={lockTime}
        placeholder=""
        on:changed={onChanged}
    />
    <SettingItem
        type="checkbox"
        title={i18n.pauseOnRest.title}
        text={i18n.pauseOnRest.text}
        settingKey="pauseOnRest"
        settingValue={pauseOnRest}
        on:changed={onChanged}
    />
    <SettingItem
        type="number"
        title={i18n.checkRestInterval.title}
        text={i18n.checkRestInterval.text}
        settingKey="checkRestInterval"
        settingValue={checkRestInterval}
        placeholder=""
        on:changed={onChanged}
    />
    <SettingItem
        type="button"
        title=""
        text={i18n.save.text}
        settingKey="Save"
        settingValue={i18n.save.title}
        on:clicked={doUpdateSetting}
    />
</div>
