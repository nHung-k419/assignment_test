import React, { useState, useEffect, useRef } from 'react'

const Game_assignment_test = () => {
    const [count, setCount] = useState(0);
    const [valuePoints, setValuePoints] = useState('')
    const [randomNumbers, setRandomNumbers] = useState([]);
    const [positionedElements, setPositionedElements] = useState([]);
    const [points, setPoints] = useState();
    const [flagPoints, setFlagPoints] = useState(1)
    const [isStart, setIsStart] = useState(1)
    const [isSatusPoint, setIsStatusPoint] = useState(true)
    const containerRef = useRef(null);
    const intervalRef = useRef(null);
    const handleGetPoints = (e) => {
        setValuePoints(e)

    }
    console.log(isSatusPoint)

    const handleClickRestart = () => {
        generateRandomNumber(valuePoints)
        // setValuePoints('')
        setFlagPoints(1)
        setCount(0)
        setIsStatusPoint(true)
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
            x: Math.random() * containerWidth,
            y: Math.random() * containerHeight,
        }));

        setPositionedElements(positioned);
    };
    useEffect(() => {
        assignRandomPositions();

    }, [randomNumbers]);


    const handleCheck = (keyItem, x) => {
        setFlagPoints(prev => prev + 1)
        setPoints(x)
        if (flagPoints === keyItem) {
            let result = positionedElements.filter(item => {
                if (item.value === keyItem) {
                    return keyItem = item.value
                }
            })
            const resultOver = positionedElements.filter(itemPoints => itemPoints.value !== result[0].value)
            if (resultOver.length === 0) {
                setFlagPoints(1)
                keyItem = 1
            }
            const timeOutValid = setTimeout(() => {
                setPositionedElements(resultOver)
            }, 700)

        } else {
            setIsStatusPoint(false)
        }
    }
    return (
        <div style={{ marginLeft: '40px' }}>
            <div>
                <h1 style={positionedElements.length === 0 ? { color: "green" } : (isSatusPoint === true ? { color: 'black' } : { color: 'red' })}>{positionedElements.length === 0 ? (
                    'ALL CLEARED'
                ) : (
                    isSatusPoint === true ? 'LET PLAYS' : 'GAME OVER'
                )}</h1>
                <div>
                    <p>Points : <span><input value={valuePoints} onChange={(e) => handleGetPoints(e.target.value)} type="text" /></span></p>
                </div>
                <p>Time : <span>{positionedElements.length !== 0 ? count.toFixed(1) : 0}s</span></p>
                <button onClick={handleClickRestart}>Restart</button>
            </div>
            <div ref={containerRef} style={{ width: '500px', height: '400px', border: '1px solid gray', marginTop: '20px', position: 'relative' }}>
                {positionedElements.map((item, index) => (
                    <div key={item.value} onClick={() => { handleCheck(item.value, item.x) }} style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        textAlign: 'center',
                        lineHeight: '30px',
                        border: '2px solid black',
                        position: 'absolute',
                        left: `${item.x}px`,
                        top: `${item.y}px`,
                        cursor: 'pointer',
                        backgroundColor: points === item.x && item.value !== flagPoints ? 'red' : 'white',
                        overflow: 'hidden',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        fontSize: '0.8em',
                        zIndex: 1000 - parseInt(item.value),
                        transition: 'background-color 0.4s ease-in-out',
                    }} >{item.value}</div>
                ))}
            </div>
        </div >
    )
}

export default Game_assignment_test