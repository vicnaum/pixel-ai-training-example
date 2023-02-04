import React, { useState, useEffect, useCallback } from 'react';
import Sketch from 'react-p5';
import { createRoot } from 'react-dom/client';
import axios from 'axios';

const App = () => {
  const [selectedNumber, setSelectedNumber] = useState(0);
  const [grid, setGrid] = useState([]);
  const [p5, setP5] = useState(null);
  const [saved, setSaved] = useState([]);
  const [chosenPic, setChosenPic] = useState(0);
  const [init, setInit] = useState(false);

  const rows = 20;
  const cols = 20;
  
  
  const setup = (p5, canvasParentRef) => {
    loadData();
    setP5(p5);
    const canvas = p5.createCanvas(400, 400).parent(canvasParentRef)
    canvas.elt.addEventListener("contextmenu", (e) => e.preventDefault())
    p5.background(220);
  };

  const resetGrid = () => {
    // Create a 2D array of [rows][cols]
    const newGrid = [];
    for (let i = 0; i < rows; i++) {
      newGrid[i] = (new Array(cols)).fill(0);
    }
    setGrid(newGrid);
  };

  const saveData = async (saved) => {
    await axios.put('http://localhost:3001/data', { saved });
  };

  const loadData = async () => {
    resetGrid();
    try {
      const { data } = await axios.get('http://localhost:3001/data');
      if (data.saved) {
        setSaved(data.saved);
        console.log("selectedNumber:", selectedNumber)
        console.log("setting Chosenpic to", data.saved[selectedNumber]?.length ?? 0)
        setChosenPic(data.saved[selectedNumber]?.length ?? 0);
        setInit(true);
      } else {
        setInit(true);
      }
    } catch (err) {
      console.error("NO DATA FOUND")
      console.error(err);
      setInit(true);
    }
  };

  useEffect(() => {
    if (!init) return;
    saveData(saved);
  }, [init, saved])

  useEffect(() => {
    if (!init) return;
    loadPic(selectedNumber, chosenPic);
  }, [init, selectedNumber, chosenPic])

  useEffect(() => {
    if (!p5) return;
    if (!grid.length) return;
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        if (grid[x][y]) {
          p5.fill(10);
        } else {
          p5.fill(255);
        }
        p5.rect(x * (p5.width / cols), y * (p5.width / rows), p5.width / cols, p5.height / rows)
      }
    }
  }, [grid, p5, selectedNumber, chosenPic]);

  const drawPixel = (p5, isBlack) => {
    let spotX = Math.floor(p5.mouseX / (p5.width / cols));
    let spotY = Math.floor(p5.mouseY / (p5.height / rows));
    if (spotX < cols && spotY < rows) {
      const newGrid = grid.slice(); // Slice to copy the array
      newGrid[spotX][spotY] = isBlack ? 1 : 0;
      setGrid(newGrid);
    }
  };
  
  const draw = () => {
    if (p5.mouseIsPressed === true) {
      // check();
      if (p5.mouseButton === p5.LEFT) {
        drawPixel(p5, true);
      }
      if (p5.mouseButton === p5.RIGHT) {
        drawPixel(p5, false);
      }
    }
  };

  const selectNumber = (number) => {
    if (!init) return;
    resetGrid();
    setSelectedNumber(number);
    if (!saved[number]) {
      setChosenPic(0);
      return;
    } else {
      setChosenPic(saved[number].length);
      loadPic(number, saved[number].length);
    }
  };

  const savePic = (event, picToSave) => {
    console.log(picToSave)
    if (picToSave === undefined) {
      console.log("saving new")
      const newSaved = saved.slice();
      if (!newSaved[selectedNumber]) {
        newSaved[selectedNumber] = [];
      }
      newSaved[selectedNumber].push(grid.slice());
      setSaved(newSaved);
      setChosenPic(newSaved[selectedNumber].length)
      resetGrid();
    } else {
      if (((saved[selectedNumber] && saved[selectedNumber][picToSave])) || picToSave === saved[selectedNumber]?.length) {
        const newSaved = saved.slice();
        if (!newSaved[selectedNumber]) {
          newSaved[selectedNumber] = [];
        }
        newSaved[selectedNumber][picToSave] = grid.slice();
        setSaved(newSaved);
      }
    }
  };

  const loadPic = useCallback(
    (selectedNumber, chosenPic) => {
      if (!saved[selectedNumber]) {
        resetGrid();
        return;
      } 
      if (!saved[selectedNumber][chosenPic]) {
        resetGrid();
        return;
      }
      const newGrid = saved[selectedNumber][chosenPic].slice();
      if (!newGrid) {
        resetGrid();
      }
      setGrid(newGrid);
    },
    [saved, setGrid]
  );

  const deletePic = () => {
    const newSaved = saved.slice();
    if (!newSaved[selectedNumber]) {
      return;
    }
    newSaved[selectedNumber].splice(chosenPic, 1);
    setSaved(newSaved);
    setChosenPic(chosenPic-1 < 0 ? 0 : chosenPic-1);
    resetGrid();
  };


  const left = () => {
    savePic(null, chosenPic)
    // Decrease chosenPic by 1 using react state:
    loadPic(selectedNumber, chosenPic-1);
    setChosenPic((prev) => { return prev - 1 });
  };

  const right = () => {
    savePic(null, chosenPic)
    if (chosenPic === saved[selectedNumber]?.length) {
      console.log("resetting");
      resetGrid();
      return;
    }

    // Increase chosenPic by 1 using react state:
    loadPic(selectedNumber, chosenPic+1);
    setChosenPic((prev) => { return prev + 1 });
  };

  return (
      
    <div>
      <Sketch setup={setup} draw={draw} style={{marginBottom: '20px'}} />
      <NumberSelector onClick={selectNumber} selectedNumber={selectedNumber} />
      <div style={{
        display: 'flex',
        justifyContent: 'space-evenly',
        width: '400px',
        marginTop: '20px',
      }}> 
        <button onClick={resetGrid}>Reset</button>
        <button onClick={savePic}>Save</button>
        <button onClick={deletePic}>Delete</button>
          <button onClick={left} disabled={!(chosenPic > 0)}>&lt;</button>
          <span>{chosenPic} / {saved[selectedNumber]?.length ?? 0}</span>
          <button onClick={right} disabled={!(chosenPic < saved[selectedNumber]?.length)}>&gt;</button>
      </div>
    </div>
  );
};

createRoot(document.getElementById('root')).render(<App />);

const NumberSelector = ({ onClick, selectedNumber }) => {
  const numberSelectorStyle = {
    display: 'inline-block',
    width: '38px',
    height: '38px',
    border: '1px solid black',
    lineHeight: '38px',
    textAlign: 'center',
    cursor: 'pointer',
  };

  return (<div>
    {Array.from(Array(10).keys()).map((number) => (
      <div
        key={number}
        onClick={() => onClick(number)}
        style={{
          ...numberSelectorStyle,
          backgroundColor: number === selectedNumber ? 'red' : 'white',
        }}
      >
        {number}
      </div>
    ))}
  </div>
  )
};