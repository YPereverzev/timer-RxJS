import { interval, Observable, merge, pipe } from 'rxjs';
import { debounceTime, map, switchMap, repeat, scan, startWith, mapTo } from 'rxjs/operators';
import { takeUntil } from 'rxjs/operators';
import { fromEvent } from 'rxjs';


import React, { useEffect, useState } from 'react';
import styles from './timer.module.css';

let timerValue = 0;
let startTimer = {count: 0};


const Timer = () => {
    const startBtn = document.getElementById('«Start»');
    const resetBtn = document.getElementById('«Reset»');
    const waitBtn = document.getElementById('«Wait»');
    const stopBtn = document.getElementById('«Stop»');
    
    useEffect(() => {
        console.log('RERENDER');
    }, []);//eslint-disable-line
    
    let buffSS = 0;

    const [timer, setTimer] = useState(3);
    const [count, setCount] = useState(0);

    const [isStarted, setIsStarted] = useState(false);

    // const start$ = fromEvent(startBtn, 'click');
    // const resetBtn$ = fromEvent(resetBtn, 'click');
    // resetBtn$.subscribe(x => buffSS = 0);        
    const waitBtn$ = fromEvent(waitBtn, 'click');

    const render = (timerValue) => {
        setTimer(timerValue);
        // console.log( 'TIMER:',  timer);
        const timeZone = document.getElementById('timeZone')
        const timeDiv = document.getElementById('timerId')
        const finalValue = (parseInt(timerValue) < 10) ?  '0' + timerValue : timerValue%60;
        // m = (parseInt(m) < 10) ? '0' + m : m;
        // let sec = (parseInt(timer) < 10) ? '0' + timer : timer;
        // if (!timeZone) return;
        // timeZone.innerHTML = h + ':' + m + ':' + s;
        timeZone.innerHTML = `00:00:timer: ${timer} ----- count: ${count} ///// buffSS: ${timerValue}`;
        timeDiv.innerHTML = '00:00:' + finalValue;
    }


    return (
        <div>
            {/* {function () {console.log('перерендер');}()} */}
            <span>
                timer 
            </span>
            
            <div className={styles.timeZone} id="timeZone">
                00:00:00
            </div>
            <div className={styles.timeZone} id="timerId">
                00:00:00
            </div>
            
            <button 
                className={styles.handleBtn}
                id="«Start»"
                onClick={() => {
                    startHandler({ setCount, timer, setTimer, render, isStarted, setIsStarted, buffSS })
                    // setCount(15);
                }

                }
            >
                «Start» &#8260; «Stop»
            </button>

            <button 
                className={styles.handleBtn}
                id="«Wait»"
                onClick={() => waitHandler()}
            >
                «Wait»
            </button>
            
            <button 
                className={styles.handleBtn}
                id="«Reset»"
                onClick={() => {
                    resetHandler({ setCount, timer, setTimer, render, isStarted, setIsStarted })}
                }
            >
                «Reset»
            </button>

        </div>
    );
};

export default Timer;

const startHandler = ({ timer, setCount, setTimer, render, isStarted, setIsStarted, buffSS }) => {
    if (isStarted) {
        console.log('Timer already started');
        return ;
    } else {
        console.log('Starting the timer');
        setIsStarted(true);
    }

    const startBtn = document.getElementById('«Start»');
    const startBtn$ = fromEvent(startBtn, 'click');

    const resetBtn = document.getElementById('«Reset»');
    const resetBtn$ = fromEvent(resetBtn, 'click');

    const waitBtn = document.getElementById('«Wait»');
    const waitBtn$ = fromEvent(waitBtn, 'click');
    // debugger;
    
    merge(
        interval(300).pipe(
            mapTo((countPrev) => ({
                count: countPrev.count + 1
            }))
        ),
        resetBtn$.pipe(
                mapTo(
                    (acc) => {
                    console.log('REset~!!!!', acc);
                    return {count: 0};
                })
            ),
        waitBtn$.pipe(
            mapTo((acc) => {return})
        )
    )
    .pipe(
        startWith(startTimer),
        takeUntil(startBtn$),
        scan((countPrev, nextValCalc) => {
            console.log('TEST', countPrev);
            return nextValCalc(countPrev)
            // {
            //     count: countPrev.count + 1
            // }
        })
    )
    .subscribe(
        (countObj, ITEM) => {
            timerValue++;
            console.log('countObj: ', countObj, ' ', ITEM);

        },
        (err) => console.log('ошибка', err),
        () => {
            timerValue = 0;
            render(buffSS);
            setTimer(buffSS);
            setTimeout(() => setIsStarted(false), 0);
            console.log('complete: stop the timer');
            // debugger;   
            // startTimer = {count : countObj.count};
        }
    )
}

const stopHandler = (acc) => {
}
    
let doubleclick = 0;
const waitHandler = () => {
    doubleclick++;
    let timerOut = false;
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

const resetHandler = (stopBtn$, ss, setS) => {
    timerValue = 0;
}