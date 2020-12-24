import React, { useEffect, useState } from 'react';
import { fromEvent, interval, merge } from 'rxjs';
import { takeUntil, scan, startWith, mapTo } from 'rxjs/operators';
import styles from './timer.module.css';

const START_TIMER_VALUE = {count: 0};

const Timer = () => {
    const [startTimer, setStartTimer] = useState(START_TIMER_VALUE);
    const [isStarted, setIsStarted] = useState(false);

    useEffect(() => {
        // console.log('RERENDER');
        renderTimer(startTimer);

    }, []);//eslint-disable-line

    const renderTimer = (countObj) => {
        if (!countObj) {
            // console.log('!sec');
            return;
        };
        const timerValue = countObj.count;
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

        const minutesArrow = document.querySelector('.minutesArrow');
        if (!minutesArrow) return;
        minutesArrow.style.transform = `rotateZ(${minutes*6 + 180}deg)`

        const hoursArrow = document.querySelector('.hoursArrow');
        if (!hoursArrow) return;
        hoursArrow.style.transform = `rotateZ(${hours*6 + 180}deg)`
    }

    return (
    <div className={styles.outer_wrapper}>    
        <div className={styles.timer_wrapper}>
            <span className={styles.title}>
                STOPWATCH
            </span>
            <div className={styles.timeZone} id="timerId">
            </div>
            
            <button 
                className={`${styles.handleBtn} ${styles.start}`}
                id="«Start»"
                onClick={() => {
                    startHandler({ renderTimer, isStarted, setIsStarted, setStartTimer, startTimer })
                }}
            >
                Start &#8260; Stop
            </button>

            <button 
                className={styles.handleBtn}
                id="«Wait»"
            >
                Wait
            </button>
            
            <button 
                className={styles.handleBtn}
                id="«Reset»"
                onClick={() => {
                    renderTimer ({count: 0});
                }}
            >
                Reset
            </button>

            <div className={styles.clock_wrapper}>
                <div className={styles.hours_wrapper}>
                        <div className={`${styles.hoursArrow} hoursArrow`}>
                        </div>
                </div>
              
                <div className={styles.minutes_wrapper}>
                    <div className={`${styles.minutesArrow} minutesArrow`}>
                    </div>
                </div>
                <div className={styles.seconds_wrapper}>
                    <div className={`${styles.secondsArrow} secondsArrow`}>
                    </div>
                </div>
                
            </div>
        </div>
    </div>

    );
};

export default Timer;

const startHandler = ({ renderTimer, isStarted, setIsStarted, setStartTimer, startTimer }) => {
    if (isStarted) {
        // console.log('Timer already started');
        return ;
    } else {
        // console.log('Starting the timer');
        setIsStarted(true);
        setStartTimer({count: 0});
    }

    const startBtn = document.getElementById('«Start»');
    const startBtn$ = fromEvent(startBtn, 'click');

    const resetBtn = document.getElementById('«Reset»');
    const resetBtn$ = fromEvent(resetBtn, 'click');

    const waitBtn = document.getElementById('«Wait»');
    const waitBtn$ = fromEvent(waitBtn, 'click');
    
    let pause = false;
    merge(
        interval(1000).pipe(
            mapTo((countPrev) => {
                if (pause) return countPrev;
                return  {count: countPrev.count + 1}
            })
        ),
        resetBtn$.pipe(
                mapTo(
                    (acc) => {
                    // console.clear();
                    return {count: 0};
                })
            ),
        waitBtn$.pipe(
            mapTo((acc) => {
                if (isDoubleclick()) {
                    pause = !pause
                    return acc;
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
            // timerValue++;
            // console.log('Seconds: ', countObj.count);
            renderTimer(countObj)
        },
        (err) => console.log('Oшибка', err),
        (countObj) => {
            // timerValue = 0;
            setTimeout(() => setIsStarted(false), 0);
            // console.log('complete: stop the timer');
            return countObj
        }
    )
}

let doubleclick = 0;
const isDoubleclick = () => {
    doubleclick++;
    let timer = setTimeout(() => {
        doubleclick = 0;
    }, 500)

    if (doubleclick > 1) {
        // console.log('Doubleclick 500ms (longer then 500ms "is not a  doubleclick"');
        clearTimeout(timer);
        doubleclick = 0;
        return true;
    }

}
