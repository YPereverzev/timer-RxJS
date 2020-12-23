import React, { useEffect, useState } from 'react';
import { fromEvent, interval, merge } from 'rxjs';
import { takeUntil, scan, startWith, mapTo } from 'rxjs/operators';
import styles from './timer.module.css';

let timerValue = 0;
let startTimer = {count: 0};

const Timer = () => {
    useEffect(() => {
        console.log('RERENDER');
        renderTimer(startTimer);
    }, []);//eslint-disable-line
    
    const [timer, setTimer] = useState(3);
    const [count, setCount] = useState(0);
    const [isStarted, setIsStarted] = useState(false);

    const renderTimer = (countObj) => {
        if (!countObj) {
            console.log('!sec');
            return;
        };
        timerValue = countObj.count;
        setTimer(timerValue);
        const timeDiv = document.getElementById('timerId')
        const seconds = (parseInt(timerValue%60) < 10) ?  '0' + timerValue%60 : timerValue%60;
        const allMinutes = parseInt(timerValue/60);
        const minutes = (parseInt(allMinutes%60) < 10) ?  '0' + allMinutes%60 : allMinutes%60;
        const allHours = parseInt(timerValue/3600);
        const hours = (parseInt(allHours%60) < 10) ?  '0' + allHours%60 : allHours%60;
        timeDiv.innerHTML = hours + ':' + minutes + ':' + seconds;
        const secondArrow = document.querySelector('.secondsArrow');
        if (!secondArrow) return;
        secondArrow.style.transform = `rotateZ(${timerValue*6 + 180}deg)`
    }

    return (
        <div>
            <span>
                TIMER 
            </span>
            <div className={styles.timeZone} id="timerId">
                00:00:{(parseInt(timer) < 10) ?  '0' + timer : timer%60}
            </div>
            
            <button 
                className={styles.handleBtn}
                id="«Start»"
                onClick={() => {
                    startHandler({ setCount, timer, setTimer, renderTimer, isStarted, setIsStarted })
                }}
            >
                «Start» &#8260; «Stop»
            </button>

            <button 
                className={styles.handleBtn}
                id="«Wait»"
            >
                «Wait»
            </button>
            
            <button 
                className={styles.handleBtn}
                id="«Reset»"
                onClick={() => {
                    renderTimer ({count: 0});
                }}
            >
                «Reset»
            </button>

            <div className={styles.clock_wrapper}>
                <div className={styles.seconds_wrapper}>
                    <div className={`${styles.secondsArrow} secondsArrow`}>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Timer;

const startHandler = ({ renderTimer, isStarted, setIsStarted }) => {
    if (isStarted) {
        console.log('Timer already started');
        return ;
    } else {
        console.log('Starting the timer');
        setIsStarted(true);
        startTimer = {count: 0};
    }

    const startBtn = document.getElementById('«Start»');
    const startBtn$ = fromEvent(startBtn, 'click');

    const resetBtn = document.getElementById('«Reset»');
    const resetBtn$ = fromEvent(resetBtn, 'click');

    const waitBtn = document.getElementById('«Wait»');
    const waitBtn$ = fromEvent(waitBtn, 'click');
    
    let pause = false;
    const timerFlow = merge(
        interval(500).pipe(
            mapTo((countPrev) => {
                if (pause) return countPrev;
                return  {count: countPrev.count + 1}
            })
        ),
        resetBtn$.pipe(
                mapTo(
                    (acc) => {
                    console.log('RESET!!!!', acc);
                    return {count: 0};
                })
            ),
        waitBtn$.pipe(
            mapTo((acc) => {
                if (isDoubleclick()) {
                    pause = !pause
                } else {
                    return acc;
                }
            })
        )
    )
    .pipe(
        startWith(startTimer),
        takeUntil(startBtn$),
        scan((countPrev, nextValCalc) => {
            return nextValCalc(countPrev)
        })
    )
    .subscribe(
        (countObj, ITEM) => {
            timerValue++;
            console.log('countObj: ', countObj);
            renderTimer(countObj)
        },
        (err) => console.log('ошибка', err),
        (countObj) => {
            timerValue = 0;
            setTimeout(() => setIsStarted(false), 0);
            console.log('complete: stop the timer');
            return countObj
        }
    )
}

let doubleclick = 0;
const isDoubleclick = () => {
    doubleclick++;
    let timer = setTimeout(() => {
        doubleclick = 0;
    }, 1000)

    if (doubleclick > 1) {
        console.log('сработал даблклик');
        clearTimeout(timer);
        doubleclick = 0;
        return true;
    }

}
