import {
    Dialog,
    Plugin, TEventBus, showMessage,
} from "siyuan";
import "./index.scss";

import Mask from "./mask.svelte";
import SettingPanel from "./libs/setting-panel.svelte";
import { debounce, time2String } from "./utils";

import { changelog } from "sy-plugin-changelog";

type seconds = number;

const STORAGE_NAME = "eye-config.json";
const ENABLED = true;
const WORK_TIME: seconds = 30 * 60; // seconds
const LOCK_TIME: seconds = 3 * 60; // seconds
const CHECK_REST_INTERVAL: seconds = 5 * 60; // 5 minutes, 检查如果电脑休眠了，就暂停

let UnMaskScreenEvent: EventListener;
let AnyOpEvent: EventListener;


export default class EyePlugin extends Plugin {

    maskDiv: HTMLDivElement;
    mask: Mask;
    status: HTMLDivElement

    WorkTimeRemains: number = 0;
    WorkIntervalTimer: any;
    RestTimer: any; //休息时间段
    IsResting = false; //是否正在休息

    EventToTrack: TEventBus[] = ['ws-main', 'click-editorcontent'];

    async onload() {
        UnMaskScreenEvent = () => this.doUnmaskScreen();
        AnyOpEvent = (args: any) => this.onAnyOperation(args);

        this.data[STORAGE_NAME] = {
            enabled: ENABLED,
            workTime: WORK_TIME,
            lockTime: LOCK_TIME,
            pauseOnRest: false,
            checkRestInterval: CHECK_REST_INTERVAL,
        }
        let defaultConfig = this.data[STORAGE_NAME];

        this.initStatusBar();

        await this.loadData(STORAGE_NAME);
        for (let key in defaultConfig) {
            if (this.data[STORAGE_NAME][key] === undefined) {
                this.data[STORAGE_NAME][key] = defaultConfig[key];
            }
        }

        console.log("DataConfig", this.data[STORAGE_NAME]);
        this.status.innerHTML = `${time2String(this.data[STORAGE_NAME].workTime)}`;

        this.startLockCountdown();

        this.saveData(STORAGE_NAME, this.data[STORAGE_NAME]);


        for (let event of this.EventToTrack) {
            this.eventBus.on(event, AnyOpEvent);
        }

        // changelog(this, 'i18n/CHANGELOG.md');
    }

    onunload(): void {
        if (this.maskDiv) {
            this.mask.$destroy();
            this.maskDiv.remove();
        }
        for (let event of this.EventToTrack) {
            this.eventBus.off(event, AnyOpEvent);
        }
        this.resetTimer();
        this.saveData(STORAGE_NAME, this.data[STORAGE_NAME]);
    }

    onAnyOperation(args) {
        //如果不启用, 就不管了
        if (!this.data[STORAGE_NAME].enabled) {
            return;
        }

        if (args?.detail.cmd === 'backgroundtask' || args?.detail.cmd === "statusbar") {
            return;
        }

        if (this.IsResting) {
            console.log("恢复操作");
            this.IsResting = false;
            this.startLockCountdown();
        } else {
            this.waitToDoRest();
        }
    }

    openSetting(): void {
        let dialog = new Dialog({
            title: this.i18n.name,
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
                storage: this.data[STORAGE_NAME],
                i18n: this.i18n.setting
            }
        });
        pannel.$on("changed", ({ detail }) => {
            // console.log("onSettingChanged", detail);
            dialog.destroy();
            this.data[STORAGE_NAME] = detail;
            this.saveData(STORAGE_NAME, this.data[STORAGE_NAME]);
            this.resetTimer();
            this.startLockCountdown();
        });

    }

    private initStatusBar() {
        this.status = document.createElement("div");
        this.status.innerHTML = `${time2String(0)}`;

        let statusBar = this.addStatusBar({
            element: this.status,
            position: "right",
        });
        statusBar.addEventListener("click", () => {
            this.openSetting();
        });
    }

    /**
     * 停止所有计时器
     */
    private resetTimer() {
        if (this.WorkIntervalTimer) {
            clearInterval(this.WorkIntervalTimer);
        }
        this.status.innerHTML = `${time2String(this.data[STORAGE_NAME].workTime)}`;
    }

    private startLockCountdown() {
        if (!this.data[STORAGE_NAME].enabled) {
            return;
        }

        //1. X 秒后锁屏
        if (this.WorkTimeRemains <= 0) {
            this.WorkTimeRemains = this.data[STORAGE_NAME].workTime * 1000;
        }

        //2. 显示倒计时
        const deadline = (new Date()).getTime() + this.WorkTimeRemains;
        this.status.innerHTML = `${time2String(this.WorkTimeRemains / 1000)}`;
        this.WorkIntervalTimer = setInterval(() => {
            this.WorkTimeRemains = deadline - (new Date()).getTime()
            if (this.WorkTimeRemains <= 0) {
                this.WorkTimeRemains = 0;
                this.doMaskScreen();
            }
            this.status.innerHTML = `${time2String(this.WorkTimeRemains / 1000)}`;
        }, 1000);
    }

    private waitToDoRest() {
        debounce(() => {console.log("长时间无操作, 进入休息模式"); this.doRest()}, 20 * 1000)();
    }

    private doRest() {
        console.log("开始休眠");
        this.IsResting = true;
        if (this.WorkIntervalTimer) {
            clearInterval(this.WorkIntervalTimer);
        }
    }

    private doMaskScreen() {
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
        if (this.WorkIntervalTimer) {
            clearInterval(this.WorkIntervalTimer);
        }
    }

    private doUnmaskScreen() {
        showMessage(this.i18n.msgUnlock, 5000);
        if (this.maskDiv) {
            this.mask.$destroy();
            document.body.removeChild(this.maskDiv);
            //继续开始新的计时
            this.startLockCountdown();
        }
    }
}
