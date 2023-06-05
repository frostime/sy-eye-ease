import {
    Dialog,
    Plugin, showMessage,
} from "siyuan";
import "./index.scss";

import Mask from "./mask.svelte";
import SettingPanel from "./libs/setting-panel.svelte";
import { time2String } from "./utils";

const STORAGE_NAME = "eye-config.json";
const ENABLED = true;
const WORK_TIME = 30; // seconds
const LOCK_TIME = 5 * 60; // seconds

let UnMaskScreenEvent: EventListener;
export default class PluginSample extends Plugin {

    maskDiv: HTMLDivElement;
    mask: Mask;
    status: HTMLDivElement

    WorkTimeRemains: number = 0;
    WorkTimer: any;

    onload() {
        UnMaskScreenEvent = () => this.doUnmaskScreen();

        this.data[STORAGE_NAME] = {
            enabled: ENABLED,
            workTime: WORK_TIME,
            lockTime: LOCK_TIME,
        }

        this.initStatusBar();

        this.loadData(STORAGE_NAME);
        console.log("DataConfig", this.data[STORAGE_NAME]);

        this.startLockCountdown();
    }

    onunload(): void {
        if (this.maskDiv) {
            this.mask.$destroy();
            this.maskDiv.remove();
        }
        if (this.WorkTimer) {
            clearInterval(this.WorkTimer);
        }
        this.saveData(STORAGE_NAME, this.data[STORAGE_NAME]);
    }

    openSetting(): void {
        let dialog = new Dialog({
            title: "SettingPannel",
            content: `<div id="SettingPanel"></div>`,
            width: "60%",
            destroyCallback: () => {
                //You must destroy the component when the dialog is closed
                pannel.$destroy();
            }
        });
        let pannel = new SettingPanel({
            target: dialog.element.querySelector("#SettingPanel"),
            props: {
                storage: this.data[STORAGE_NAME]
            }
        });
        pannel.$on("changed", ({ detail }) => { 
            // console.log("onSettingChanged", detail);
            dialog.destroy();
            this.data[STORAGE_NAME] = detail;
            this.saveData(STORAGE_NAME, this.data[STORAGE_NAME]);
            // console.log("DataConfig", this.data[STORAGE_NAME]);
        });

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
        this.WorkTimeRemains = this.data[STORAGE_NAME].workTime * 1000;
        setTimeout(() => {
            this.doMaskScreen();
        }, this.WorkTimeRemains);

        //2. 显示倒计时
        this.status.innerHTML = `${time2String(this.WorkTimeRemains / 1000)}`;
        this.WorkTimer = setInterval(() => {
            this.WorkTimeRemains -= 1000;
            if (this.WorkTimeRemains <= 0) {
                this.WorkTimeRemains = 0;
            }
            this.status.innerHTML = `${time2String(this.WorkTimeRemains / 1000)}`;
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
        if (this.WorkTimer) {
            clearInterval(this.WorkTimer);
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
