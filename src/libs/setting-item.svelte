<script lang="ts">
    import { createEventDispatcher } from "svelte";
    export let type: string; // Setting Type
    export let title: string; // Displayint Setting Title
    export let text: string; // Displaying Setting Text
    export let settingKey: string;
    export let settingValue: any;

    //Optional
    export let placeholder: string = ""; // Use it if type is input
    export let options: { [key: string]: string } = {}; // Use it if type is select
    export let slider: {
        min: number;
        max: number;
        step: number;
    } = {min: 0, max: 100, step: 1}; // Use it if type is slider

    const dispatch = createEventDispatcher();

    function clicked() {
        dispatch("clicked");
    }

    function changed() {
        dispatch("changed", { key: settingKey, value: settingValue });
    }
</script>

<label class="fn__flex b3-label">
    <div class="fn__flex-1">
        {title}
        <div class="b3-label__text">
            {text}
        </div>
    </div>
    <span class="fn__space" />
    <!-- <slot /> -->
    {#if type === "checkbox"}
        <!-- Checkbox -->
        <input
            class="b3-switch fn__flex-center"
            id={settingKey}
            type="checkbox"
            bind:checked={settingValue}
            on:change={changed}
        />
    {:else if type === "input"}
        <!-- Text Input -->
        <input
            class="b3-text-field fn__flex-center fn__size200"
            id={settingKey}
            {placeholder}
            bind:value={settingValue}
            on:change={changed}
        />
    {:else if type === "number"}
        <!-- Text Input -->
        <input
            class="b3-text-field fn__flex-center fn__size200"
            id={settingKey}
            {placeholder}
            bind:value={settingValue}
            on:change={changed}
            type="number"
            min="10"
        />
    {:else if type === "button"}
        <!-- Button Input -->
        <button
            class="b3-button b3-button--outline fn__flex-center fn__size200"
            id={settingKey}
            on:click={clicked}
        >
            {settingValue}
        </button>
    {:else if type === "select"}
        <!-- Dropdown select -->
        <select
            class="b3-select fn__flex-center fn__size200"
            id="iconPosition"
            bind:value={settingValue}
            on:change={changed}
        >
            {#each Object.entries(options) as [value, text]}
                <option {value}>{text}</option>
            {/each}
        </select>
    {:else if type == "slider"}
        <!-- Slider -->
        <input
            class="b3-slider fn__size200"
            id="fontSize"
            min="{slider.min}"
            max="{slider.max}"
            step="{slider.step}"
            type="range"
            bind:value={settingValue}
            on:change={changed}
        />
    {/if}
</label>

<style lang="scss">
    :global(.config__tab-container) .b3-label {
        box-shadow: none !important;
        padding-bottom: 16px;
        margin-bottom: 16px;

        &:not(:last-child) {
            border-bottom: 1px solid var(--b3-border-color);
        }
    }
</style>
