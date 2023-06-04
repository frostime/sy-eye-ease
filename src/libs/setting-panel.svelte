<script>
    import SettingItem from "./setting-item.svelte";
    import { showMessage } from "siyuan";
    import { onMount, onDestroy } from "svelte";
    onMount(() => {
        showMessage("Setting panel opened");
    });
    onDestroy(() => {
        showMessage("Setting panel closed");
    });
</script>

<!--
You can use this template to quickly create a setting panel,
with the same UI style in SiYuan
-->

<div class="config__tab-container">
    <div data-type="Header" class="fn__flex b3-label">
        <div class="fn_flex-1">
            <h4>This setting panel is provided by a svelte component</h4>
            <div class="b3-label__text">
                <span class="fn__flex-1">
                    See:
                    <pre
                        style="display: inline">/lib/setting-pannel.svelte</pre>
                </span>
            </div>
        </div>
    </div>
    <SettingItem
        type="checkbox"
        title="启用 / Enable"
        text="启用倒计时 / Enable countdown"
        settingKey="Checkbox"
        settingValue={true}
        on:changed={(event) => {
            showMessage(
                `Checkbox changed: ${event.detail.key} = ${event.detail.value}`
            );
        }}
    />
    <SettingItem
        type="input"
        title="工作时长 / Work time"
        text="秒 / seconds"
        settingKey="Input"
        settingValue=""
        placeholder=""
        on:changed={(event) => {
            showMessage(
                `Input changed: ${event.detail.key} = ${event.detail.value}`
            );
        }}
    />
    <SettingItem
        type="input"
        title="工作时长 / Work time"
        text="秒 / seconds"
        settingKey="Input"
        settingValue=""
        placeholder=""
        on:changed={(event) => {
            showMessage(
                `Input changed: ${event.detail.key} = ${event.detail.value}`
            );
        }}
    />
</div>
