import {
    Plugin, showMessage,
} from "siyuan";
import "./index.scss";

import Mask from "./mask.svelte";
import Settings from "./libs/setting-panel.svelte";
import { time2String } from "./utils";

const STORAGE_NAME = "eye-config";
const ENABLED = true;
const WORK_TIME = 30; // seconds
const LOCK_TIME = 5 * 60; // seconds

let UnMaskScreenEvent: EventListener;
export default class PluginSample extends Plugin {

    maskDiv: HTMLDivElement;
    mask: Mask;
    status: HTMLDivElement

    LockInterval: number = 1000 * 20;
    LockTimeRemains: number = 0;
    LockTimer: any;

    onload() {
        UnMaskScreenEvent = () => this.doUnmaskScreen();

        this.data[STORAGE_NAME] = {
            enabled: ENABLED,
            workTime: WORK_TIME,
            lockTime: LOCK_TIME,
        }

        this.initStatusBar();

        this.loadData(STORAGE_NAME);

        this.LockInterval = this.data[STORAGE_NAME].workTime * 1000;

        this.startLockCountdown();
    }

    onunload(): void {
        this.mask.$destroy();
        document.body.removeChild(this.maskDiv);
        if (this.LockTimer) {
            clearInterval(this.LockTimer);
        }
        this.saveData(STORAGE_NAME, this.data[STORAGE_NAME]);
    }

    private initStatusBar() {
        this.status = document.createElement("div");
        this.status.innerHTML = `${time2String(0)}`;

        this.addStatusBar({
            element: this.status,
            position: "right",
        });
    }

    private startLockCountdown() {
        //1. X 秒后锁屏
        this.LockTimeRemains = this.LockInterval;
        setTimeout(() => {
            this.doMaskScreen();
        }, this.LockInterval);

        //2. 显示倒计时
        this.status.innerHTML = `${time2String(this.LockTimeRemains / 1000)}`;
        this.LockTimer = setInterval(() => {
            this.LockTimeRemains -= 1000;
            if (this.LockTimeRemains <= 0) {
                this.LockTimeRemains = 0;
            }
            this.status.innerHTML = `${time2String(this.LockTimeRemains / 1000)}`;
        }, 1000);
    }

    private doMaskScreen() {
        showMessage("休息一下吧！", 5000);
        this.maskDiv = document.createElement("div");
        this.mask = new Mask({
            target: this.maskDiv,
            props: {
                timeRemains: this.data[STORAGE_NAME].lockTime,
            },
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
