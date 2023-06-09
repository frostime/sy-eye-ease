import { time2String, debounce } from "./utils";
import Mask from "./mask.svelte";
import EyePlugin from ".";
import { showMessage } from "siyuan";

class State {
    context: Context;
    constructor(context: Context) {
        this.context = context;
    }

    start() {}

    onAnyOperation() {}

    close() {}

}

class DisabledState extends State {
    //什么都不做
}

const STORAGE_NAME = "eye-config.json";

class LockCoutingState extends State {

    WorkTimeRemains: number = 0;
    WorkIntervalTimer: any;
    statusBar: HTMLDivElement;
    pauseOnRest: boolean = false;

    constructor(context: Context) {
        super(context);
    }

    init() {
        this.statusBar = this.context.plugin.status;
        this.WorkTimeRemains = this.context.plugin.data[STORAGE_NAME].workTime * 1000;
        this.pauseOnRest = this.context.plugin.data[STORAGE_NAME].pauseOnRest;
    }

    /**
     * 开始计时, 时间到了以后自动切换到锁屏状态
     */
    start() {
        const deadline = (new Date()).getTime() + this.WorkTimeRemains;
        this.WorkIntervalTimer = setInterval(() => {
            this.WorkTimeRemains = deadline - (new Date()).getTime()
            if (this.WorkTimeRemains <= 0) {
                this.WorkTimeRemains = 0;
                this.doTransition('Masking'); //自动切换到锁屏状态
            }
            this.statusBar.innerHTML = `${time2String(this.WorkTimeRemains / 1000)}`;
        }, 1000);
    }

    close() {
        if (this.WorkIntervalTimer) {
            clearInterval(this.WorkIntervalTimer);
        }
    }

    doTransition(to: 'Masking' | 'Pausing') {
        if (to === 'Masking') {
            if (this.WorkIntervalTimer) {
                clearInterval(this.WorkIntervalTimer);
            }
            this.context.transitionTo('Masking');
        } else if (to === 'Pausing') {
            this.context.transitionTo('Pausing');
        }
    }

    /**
     * 如果长期没有操作, 切换到 Pausing 状态
     */
    onAnyOperation() {
        if (!this.pauseOnRest) {
            return;
        }
        debounce(
            () => {
                console.log("长时间无操作, 进入休息模式");
                this.doTransition('Pausing');
            }, 20 * 1000
        )();
    }
}

class PausingState extends State {
    /**
     * 一旦有操作, 切换到 LockCouting 状态
     */
    onAnyOperation() {
        //do nothing
        this.context.transitionTo('LockCouting');
    }
}

class MaskingState extends State {
    lockTime: number;
    maskDiv: HTMLDivElement;
    mask: Mask;

    init() {
        this.lockTime = this.context.plugin.data[STORAGE_NAME].lockTime;
    }

    /**
     * 显示 svelte 的遮罩, 并在结束后自动切换到 LockCouting 状态
     */
    start() {
        this.maskDiv = document.createElement("div");
        this.mask = new Mask({
            target: this.maskDiv,
            props: {
                timeRemains: this.lockTime,
            },
        });
        this.mask.$on("unmask", () => this.doTransition());
        document.body.appendChild(this.maskDiv);
    }

    close() {
        if (this.maskDiv) {
            this.mask.$destroy();
        }
        this.maskDiv.remove();
    }

    doTransition(): void {
        showMessage(this.context.plugin.i18n.msgUnlock, 5000);
        if (this.maskDiv) {
            this.mask.$destroy();
            document.body.removeChild(this.maskDiv);
            this.context.transitionTo('LockCouting'); //自动切换到工作状态
        }
    }
}

type ConcreteState = 'Disabled' | 'LockCouting' | 'Pausing' | 'Masking';

class Context {
    state: State;
    allStates: Map<ConcreteState, State> = new Map();
    plugin: EyePlugin;
    setting: any;

    constructor(plugin: EyePlugin) {
        this.plugin = plugin;
        this.setting = plugin.data['eye-config.json'];

        this.allStates.set('Disabled', new DisabledState(this));
        this.allStates.set('LockCouting', new LockCoutingState(this));
        this.allStates.set('Pausing', new PausingState(this));
        this.allStates.set('Masking', new MaskingState(this));
    }

    /**
     * 根据设置信息初始化状态
     */
    initState() {
        let lockCoutingState = <LockCoutingState>this.allStates.get('LockCouting');
        lockCoutingState.init();
        let maskingState = <MaskingState>this.allStates.get('Masking');
        maskingState.init();

        if (!this.setting.enabled) {
            this.transitionTo('Disabled');
        } else {
            this.transitionTo('LockCouting');
        }
    }

    transitionTo(state: ConcreteState) {
        this.state = this.allStates.get(state);
        this.state.start();
    }

    onAnyOperation() {
        this.state.onAnyOperation();
    }

    close() {
        for (let state of this.allStates.values()) {
            state.close();
        }
    }
}

