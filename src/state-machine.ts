import { time2String } from "./utils";
import Mask from "./mask.svelte";
import EyePlugin from ".";
import { showMessage } from "siyuan";

class State {
    context: StatesContext;
    constructor(context: StatesContext) {
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


let DebounceTimer: any = null;

function debounce<T extends Function>(cb: T, wait = 20) {
    let callable = (...args: any) => {
        clearTimeout(DebounceTimer);
        DebounceTimer = setTimeout(() => cb(...args), wait);
    };
    return <T>(<any>callable);
}

class LockCoutingState extends State {

    WorkTimeRemains: number = 0;
    WorkIntervalTimer: any;
    statusBar: HTMLDivElement;
    pauseOnRest: boolean = false;
    checkRestInterval: number;

    constructor(context: StatesContext) {
        super(context);
    }

    init() {
        this.statusBar = this.context.plugin.status;
        this.WorkTimeRemains = this.context.plugin.data[STORAGE_NAME].workTime * 1000;
        this.pauseOnRest = this.context.plugin.data[STORAGE_NAME].pauseOnRest;
        this.statusBar.innerHTML = `${time2String(this.WorkTimeRemains / 1000)}`;
        this.checkRestInterval = this.context.plugin.data[STORAGE_NAME].checkRestInterval * 1000;
        this.close();
    }

    resetTime() {
        this.WorkTimeRemains = this.context.plugin.data[STORAGE_NAME].workTime * 1000;
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
                clearInterval(this.WorkIntervalTimer);
                this.doTransition('Masking'); //自动切换到锁屏状态
            }
            this.statusBar.innerHTML = `${time2String(this.WorkTimeRemains / 1000)}`;
        }, 1000);
        console.log('Timer', this.WorkIntervalTimer);
        this.onAnyOperation();
    }

    close() {
        if (this.WorkIntervalTimer) {
            clearInterval(this.WorkIntervalTimer);
        }
        if (DebounceTimer) {
            clearTimeout(DebounceTimer);
        }
    }

    doTransition(to: 'Masking' | 'Pausing') {
        this.close();
        if (to === 'Masking') {
            this.resetTime();
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
            }, this.checkRestInterval
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

    constructor(context: StatesContext) {
        super(context);
        this.maskDiv = document.createElement("div");
        this.mask = new Mask({
            target: this.maskDiv,
            props: {
                timeRemains: this.lockTime * 1000,
            },
        });
        document.body.appendChild(this.maskDiv);
        this.toggle(false);
    }

    init() {
        this.lockTime = this.context.plugin.data[STORAGE_NAME].lockTime;
        this.toggle(false);
    }

    /**
     * 显示 svelte 的遮罩, 并在结束后自动切换到 LockCouting 状态
     */
    start() {
        this.toggle(true);
        this.mask.restart(this.lockTime * 1000);
        this.mask.$on("unmask", () => this.doTransition());
        document.body.appendChild(this.maskDiv);
    }

    close() {
        if (this.maskDiv) {
            this.mask.$destroy();
        }
        if (this.maskDiv && this.maskDiv.parentNode) {
            this.maskDiv.remove();
        }
    }

    toggle(show=true) {
        if (show) {
            this.maskDiv.style.display = "block";
        } else {
            this.maskDiv.style.display = "none";
        }
    }

    doTransition(): void {
        showMessage(this.context.plugin.i18n.msgUnlock, 5000);
        if (this.maskDiv) {
            this.toggle(false);
            this.context.transitionTo('LockCouting'); //自动切换到工作状态
        }
    }
}

type ConcreteState = 'Disabled' | 'LockCouting' | 'Pausing' | 'Masking';

export class StatesContext {
    state: State;
    allStates: Map<ConcreteState, State> = new Map();
    plugin: EyePlugin;

    constructor(plugin: EyePlugin) {
        this.plugin = plugin;

        this.allStates.set('Disabled', new DisabledState(this));
        this.allStates.set('LockCouting', new LockCoutingState(this));
        this.allStates.set('Pausing', new PausingState(this));
        this.allStates.set('Masking', new MaskingState(this));
    }

    getSetting(key) {
        return this.plugin.data['eye-config.json'][key];
    }

    /**
     * 根据设置信息初始化状态
     */
    init() {
        let lockCoutingState = <LockCoutingState>this.allStates.get('LockCouting');
        lockCoutingState.init();
        let maskingState = <MaskingState>this.allStates.get('Masking');
        maskingState.init();
        
        let enabled = this.getSetting('enabled');
        this.state = null;
        if (!enabled) {
            this.transitionTo('Disabled');
        } else {
            this.transitionTo('LockCouting');
        }
    }

    /**
     * 为例避免重复切换状态, 故而检查
     */
    transitionTo(state: ConcreteState) {
        let nextState = this.allStates.get(state);
        if (nextState !== this.state) {
            console.log(`切换状态: ${this.state} -> ${state}`);
            this.state = nextState;
            this.state.start();
        }
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

