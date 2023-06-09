import {
    Dialog,
    Plugin, TEventBus, showMessage,
} from "siyuan";
import "./index.scss";

import Mask from "./mask.svelte";
import SettingPanel from "./libs/setting-panel.svelte";
import { debounce, time2String } from "./utils";
import { StatesContext } from "./state-machine";

import { changelog } from "sy-plugin-changelog";

type seconds = number;

const STORAGE_NAME = "eye-config.json";
const ENABLED = true;
const WORK_TIME: seconds = 30 * 60; // seconds
const LOCK_TIME: seconds = 3 * 60; // seconds
const CHECK_REST_INTERVAL: seconds = 5 * 60; // 5 minutes, 检查如果电脑休眠了，就暂停

// let UnMaskScreenEvent: EventListener;
let AnyOpEvent: EventListener;


export default class EyePlugin extends Plugin {

    maskDiv: HTMLDivElement;
    mask: Mask;
    status: HTMLDivElement

    WorkTimeRemains: number = 0;
    WorkIntervalTimer: any;
    RestTimer: any; //休息时间段
    IsResting = false; //是否正在休息

    states: StatesContext;

    EventToTrack: TEventBus[] = ['ws-main', 'click-editorcontent'];

    async onload() {
        // UnMaskScreenEvent = () => this.doUnmaskScreen();
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

        // this.startLockCountdown();

        this.saveData(STORAGE_NAME, this.data[STORAGE_NAME]);

        this.states = new StatesContext(this);
        this.states.init();


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
        // this.resetTimer();
        this.states.close();
        this.saveData(STORAGE_NAME, this.data[STORAGE_NAME]);
    }

    onAnyOperation(args) {

        if (args?.detail.cmd === 'backgroundtask' || args?.detail.cmd === "statusbar") {
            return;
        }

        this.states.onAnyOperation();
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
            this.states.init();
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
}
