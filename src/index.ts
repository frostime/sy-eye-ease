import {
    Plugin, showMessage,
} from "siyuan";
import "./index.scss";

import Mask from "./mask.svelte";

let UnMaskScreenEvent: EventListener;
export default class PluginSample extends Plugin {

    maskDiv: HTMLDivElement;
    mask: Mask;

    async onload() {
        UnMaskScreenEvent = () => this.doUnmaskScreen();

        this.doMaskScreen();
    }

    private doMaskScreen() {
        this.maskDiv = document.createElement("div");
        this.mask = new Mask({
            target: this.maskDiv,
        });
        this.mask.$on("unmask", UnMaskScreenEvent);
        document.body.appendChild(this.maskDiv);
    }

    private doUnmaskScreen() {
        showMessage("unmask");
        if (this.maskDiv) {
            this.mask.$destroy();
            document.body.removeChild(this.maskDiv);
        }
    }
}
