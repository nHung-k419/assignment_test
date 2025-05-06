import React, { useState, useEffect, useRef } from 'react'
import { debounce } from 'lodash';

const Game_assignment_test = () => {
    const [count, setCount] = useState(0);
    const [valuePoints, setValuePoints] = useState('')
    const [randomNumbers, setRandomNumbers] = useState([]);
    const [positionedElements, setPositionedElements] = useState([]);
    const [flagPoints, setFlagPoints] = useState(1)
    const [isSatusPoint, setIsStatusPoint] = useState(false)
    const [checkAfterClick, setCheckAfterClick] = useState([]);
    const [valueButton, setValueButton] = useState('Play')
    const [isAuto, setIsAuto] = useState(false);
    const [remainingAutoPoints, setRemainingAutoPoints] = useState([]);
    const containerRef = useRef(null);
    const intervalRef = useRef(null);
    const flagRef = useRef(null)
    const intervalCurRef = useRef(null);
    const checkAfterClickRef = useRef([]);
    const [pendingDeletions, setPendingDeletions] = useState([]);

    const handleGetPoints = (e) => {
        setValuePoints(e)
    }

    const handleClickRestart = () => {
        generateRandomNumber(valuePoints)
        setCheckAfterClick([])
        setFlagPoints(1)
        // setCount(0)
        setValueButton('Restart')
        setIsStatusPoint(true)
        setIsAuto(false)
        setPendingDeletions([])
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        const startTime = Date.now();
        intervalRef.current = setInterval(() => {
            const currentTime = Date.now();
            const elapsedMilliseconds = currentTime - startTime;
            setCount(elapsedMilliseconds / 1000);
        }, 10);
    }

    if (!isSatusPoint) {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    }
    useEffect(() => {
        if (positionedElements.length === 0) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }

        }
    }, [count, positionedElements])
    const generateRandomNumber = (valuePoints) => {
        const Numbers = []
        for (let i = 1; i <= parseInt(valuePoints); i++) {
            Numbers.push(i);
        }
        setRandomNumbers(Numbers)
    }

    const assignRandomPositions = () => {
        if (!containerRef.current) return;

        const containerWidth = containerRef.current.offsetWidth;
        const containerHeight = containerRef.current.offsetHeight;

        const positioned = randomNumbers.map(element => ({
            value: randomNumbers[element - 1],
            x: Math.random() * (containerWidth - 40),
            y: Math.random() * (containerHeight - 40),
        }));

        setPositionedElements(positioned);
    };

    useEffect(() => {
        assignRandomPositions();
    }, [randomNumbers]);
    const handleCheck = (keyItem, x, e) => {
        setFlagPoints(prevFlagPoints => prevFlagPoints + 1);
        setCheckAfterClick(prevAfterClick => [...prevAfterClick, keyItem]);
        const ripple = document.createElement('div');
        ripple.className = 'ripple';

        const targetDiv = document.getElementById(`point-${keyItem}`);
        if (targetDiv && remainingAutoPoints.length === 0) {
            const rect = targetDiv.getBoundingClientRect();
            const offsetX = e?.clientX - rect?.left;
            const offsetY = e?.clientY - rect?.top;

            ripple.style.left = `${offsetX}px`;
            ripple.style.top = `${offsetY}px`;

            targetDiv.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        }
        if (flagPoints === keyItem) {
            flagRef.current = flagPoints;

            setPendingDeletions(prev => [...prev, {
                value: keyItem,
                time: Date.now(),
                createdAt: Date.now(),
                stoppedAt: Date.now(),
                stopped: false,
                opacity: 1
            }]);
        } else {
            setPendingDeletions(prev =>
                prev.map(item =>
                    (Date.now() - item.time < 3000)
                        ? { ...item, stopped: true }
                        : item
                )
            );
            setIsStatusPoint(false);
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setPendingDeletions(prev =>
                prev.map(item => {
                    if (item.stopped) {
                        if (item.stoppedRemainingTime == null) {
                            const remaining = Math.max(0, (3000 - (Date.now() - item.createdAt)) / 1000).toFixed(1);
                            return { ...item, stoppedRemainingTime: remaining };
                        }
                        return item;
                    }
                    const newOpacity = item.opacity - 1 / (3000 / 200);;
                    return { ...item, opacity: Math.max(0, newOpacity) };
                }).filter(item => {
                    if (item.opacity <= 0 && !item.stopped && isSatusPoint) {
                        setPositionedElements(prevPoints =>
                            prevPoints.filter(point => point.value !== item.value)
                        );
                        return false;
                    }
                    return true;
                })
            );
        }, 180);

        return () => clearInterval(interval);
    }, [isSatusPoint]);

    const getOpacityForPoint = (value) => {
        const item = pendingDeletions.find(d => d.value === value);
        return item ? item.opacity : 1;
    };

    // auto click
    useEffect(() => {
        checkAfterClickRef.current = checkAfterClick;
    }, [checkAfterClick]);

    const handleClickAuto = () => {
        setIsAuto(true)
    }
    const handleClickUnClickAuto = () => {
        setIsAuto(false)
        setRemainingAutoPoints([])
    }
    useEffect(() => {
        if (isAuto && isSatusPoint) {
            const unclicked = positionedElements.filter(
                item => !checkAfterClick.includes(item.value)
            );
            setRemainingAutoPoints(unclicked);
        }
    }, [isAuto, positionedElements, checkAfterClick, isSatusPoint]);
    useEffect(() => {
        if (!isAuto || remainingAutoPoints.length === 0) return;

        const point = remainingAutoPoints[0];

        const timer = setTimeout(() => {
            if (!checkAfterClick.includes(point.value) && isSatusPoint) {
                handleCheck(point.value, point.x);
            }
            setRemainingAutoPoints(prev => prev.slice(1));

        }, 1000);

        return () => clearTimeout(timer);
    }, [isAuto, remainingAutoPoints, isSatusPoint]);

    const debouncedHandleClick = debounce(handleCheck, 100)

    return (
        <div style={{ marginLeft: '40px' }}>
            <div>
                <h1 style={positionedElements.length === 0 && valueButton === 'Play' ? { color: 'black' } : (positionedElements.length === 0 && valueButton === 'Restart' ? { color: 'green' } : (isSatusPoint === true ? { color: 'black' } : { color: 'red' }))}>{positionedElements.length === 0 && valueButton === 'Play' ? 'LET PLAYS' : (positionedElements.length === 0 && valueButton === 'Restart' ? 'ALL CLEARED' : (isSatusPoint === true ? 'LET PLAYS' : 'GAME OVER'))}</h1>
                <div>
                    <p>Points : <span><input value={valuePoints} onChange={(e) => handleGetPoints(e.target.value)} type="text" /></span></p>
                </div>
                <p>Time : <span>{positionedElements.length !== 0 ? count.toFixed(1) : count.toFixed(1)}s</span></p>
                <button style={{ marginRight: '10px' }} onClick={handleClickRestart}>{valueButton}</button>
                {valueButton === 'Restart' ? <button onClick={!isAuto ? handleClickAuto : handleClickUnClickAuto}>{!isAuto ? 'Auto Play On' : 'Auto Play Off'}</button> : ''}
            </div>
            <div ref={containerRef} style={{ width: '500px', height: '400px', border: '3px solid black', marginTop: '20px', position: 'relative' }}>
                {positionedElements.map((item, index) => {
                    const pendingItem = pendingDeletions.find(p => p.value === item.value);
                    const remainingTime = pendingItem
                        ? pendingItem.stopped && pendingItem.stoppedRemainingTime != null
                            ? pendingItem.stoppedRemainingTime
                            : Math.max(0, (3000 - (Date.now() - pendingItem.createdAt)) / 1000).toFixed(1)
                        : null;
                    return (
                        <div id={`point-${item.value}`}>

                            <div ref={intervalCurRef} key={item.value} onClick={(e) => { debouncedHandleClick(item.value, item.x, e) }} style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '50%',
                                // textAlign: 'center',
                                lineHeight: '30px',
                                border: checkAfterClick.includes(item.value) ? '' : '1px solid black',
                                position: 'absolute',
                                left: `${item.x}px`,
                                top: `${item.y}px`,
                                cursor: 'pointer',
                                backgroundColor: checkAfterClick.includes(item.value) ? 'red' : 'white',
                                overflow: 'hidden',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                fontSize: '0.8em',
                                zIndex: 1000 - parseInt(item.value),
                                transition: 'opacity 0.2s linear',
                                opacity: getOpacityForPoint(item.value),
                                marginBottom: '10px'
                            }} ><p style={{ fontSize: '13px', position: 'absolute', top: checkAfterClick.includes(item.value) ? '-12px' : '', fontWeight: checkAfterClick.includes(item.value) ? '400' : '0' }}>{item.value}</p>
                                <p style={{ position: 'absolute', bottom: '-15px', color: 'white', fontSize: '12px', textAlign: 'center' }}>{remainingTime ? remainingTime + 's' : ''}</p>
                            </div>
                        </div>
                    )
                })}
            </div>
            {positionedElements.length > 0 ? <p>Next : {flagPoints}</p> : ''}
        </div >
    )
}

export default Game_assignment_test