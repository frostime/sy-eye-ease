import {
    Plugin, showMessage,
} from "siyuan";
import "./index.scss";

import Mask from "./mask.svelte";

let UnMaskScreenEvent: EventListener;
export default class PluginSample extends Plugin {

    maskDiv: HTMLDivElement;
    mask: Mask;

    LockInterval: number = 1000 * 15;
    LockTimeRemains: number = 0;
    LockTimer: any;

    async onload() {
        UnMaskScreenEvent = () => this.doUnmaskScreen();
        this.startLockCountdown();
    }

    private startLockCountdown() {
        this.LockTimeRemains = this.LockInterval;
        setTimeout(() => {
            this.doMaskScreen();
        }, this.LockInterval);
        this.LockTimer = setInterval(() => {
            this.LockTimeRemains -= 1000;
            if (this.LockTimeRemains <= 0) {
                this.LockTimeRemains = 0;
            }
        }, 1000);
    }

    private doMaskScreen() {
        showMessage("休息一下吧！", 5000);
        this.maskDiv = document.createElement("div");
        this.mask = new Mask({
            target: this.maskDiv,
        });
        this.mask.$on("unmask", UnMaskScreenEvent);
        document.body.appendChild(this.maskDiv);
        //close timer
        if (this.LockTimer) {
            clearInterval(this.LockTimer);
        }
    }

    private doUnmaskScreen() {
        showMessage("unmask");
        if (this.maskDiv) {
            this.mask.$destroy();
            document.body.removeChild(this.maskDiv);
            //继续开始新的计时
            this.startLockCountdown();
        }
    }
}
