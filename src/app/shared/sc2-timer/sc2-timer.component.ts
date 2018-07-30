import {
    Component, OnInit, Attribute, Output, EventEmitter,
    Input, OnDestroy, HostListener
} from '@angular/core';
import { TIMER_MILLIS } from '../var-setting';

@Component({
    selector: 'sc2-timer',
    styleUrls: ['./sc2-timer.component.scss'],
    templateUrl: './sc2-timer.component.html',
})

export class TimerComponent implements OnInit, OnDestroy {
    numSeconds: number;
    displayTime: string;
    sumSeconds: number;
    timer: any;
    // timer idle
    idler: any;
    lastAction: any;
    checkInterval: number;
    minsToIdle: number;
    showTimer: boolean;
    // timer idle
    @Output()
    timerExpired = new EventEmitter();

    // @Input('initTime')
    // initTime: number

    constructor() {
        this.displayString();
        this.numSeconds =  TIMER_MILLIS;
        this.displayTime = this.numSeconds + '';
        this.lastAction = Date.now();
        this.sumSeconds = 60;
        this.checkInterval = 1000;
        this.minsToIdle = 1;
        this.showTimer = false;
    }

    // timer idle
    initListener() {
        console.log('RESET INIT LISTEN');
    }

    @HostListener('document:click', ['$event'])
    reset(evt?) {
        console.log('RESET TIMER', evt);
        this.lastAction = Date.now();
    }

    initInterval() {
        console.log('RESET INIT INTERVAL');
        // console.log(this.lastAction + ' ?');
        // console.log(this.checkInterval + ' ?');
        // console.log(this.minsToIdle);
        // console.log(this.showTimer + ' ?');
        // console.log(this.initTime + ' ?');
        this.idler = setInterval(() => this.check(), this.checkInterval);
    }

    check() {
        console.log('RESET CHECK TRIGGER');
        const now = Date.now();
        const timeleft = this.lastAction + this.minsToIdle * this.sumSeconds * 1000;
        const diff = timeleft - now;
        const isIdle = diff < 0;

        // console.log(this.lastAction);
        // console.log(this.checkInterval);
        // console.log(this.minsToIdle);
        // console.log(this.showTimer);

        if (isIdle) {
            console.log('COUNTDOWN INIT');
            if (!this.showTimer) {
                this.showTimer = true;
                this.timer = setInterval(() => this.countdownTimer(), 1000);
            }
        } else if (this.showTimer) {
            console.log('COUNTDOWN UNINIT');
            this.showTimer = false;
            clearInterval(this.timer);
        }
    }
    // timer idle
    ngOnInit() {
        // this.timer = setInterval(() => { this.countdownTimer() }, 1000);
        // this.check();
        // this.initListener();
        this.initInterval();
    }

    ngOnDestroy() {
        clearInterval(this.timer);
        clearInterval(this.idler);
    }

    private displayString(): void {
        let numToString = '' + this.numSeconds;

        if (numToString.length < 2) {
            numToString = '0' + numToString;
        }

        this.displayTime = numToString;
    }

    private countdownTimer() {
        if (this.numSeconds > 0) {
            this.numSeconds--;

            this.displayTime = '' + this.numSeconds;
            if (this.displayTime.length < 2) {
                this.displayString();
            }
        } else {
            clearInterval(this.timer);
            clearInterval(this.idler);
            this.timerExpired.emit();
        }
    }

}
