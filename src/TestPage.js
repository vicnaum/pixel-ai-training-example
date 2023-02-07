import React, { useState, useEffect, useCallback } from 'react';
import Sketch from 'react-p5';
import predict from './trained.js';

const TestPage = () => {
  const [grid, setGrid] = useState([]);
  const [p5, setP5] = useState(null);
  const [prediction, setPrediction] = useState([0,0,0,0,0,0,0,0,0,0]);

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

  const loadData = async () => {
    resetGrid();
  };

  useEffect(() => {
    if (!p5) return;
    if (!grid.length) return;
    setPrediction(predict(grid.flat()));
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
  }, [grid, p5]);

  const drawPixel = (p5, isBlack) => {
    let spotX = Math.floor(p5.mouseX / (p5.width / cols));
    let spotY = Math.floor(p5.mouseY / (p5.height / rows));
    if (spotX < cols && spotY < rows && spotX >= 0 && spotY >= 0) {
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

  const OuterContainerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    width: '800px',
  };

  return (
    <div style={OuterContainerStyle}>
    <div>
      <Sketch setup={setup} draw={draw} style={{marginBottom: '20px'}} />
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        width: '400px',
        marginTop: '20px',
      }}> 
        <button onClick={resetGrid}>Reset</button>
      </div>
    </div>
      <div style={{ width: '380px' }}>
        {
          Array.from(Array(10).keys()).map((number) => (
            PredictionBar(number, prediction[number])
          ))
        }
      </div>
    </div>
  );
};

const PredictionBar = (number, prediction) => {
  // Color of the bar depending on prediction (0->1 is red->green)
  const color = `rgb(${Math.round(255 * (1 - prediction))}, ${Math.round(255 * prediction)}, 0)`;
  return (
    <div key={number} style={{ lineHeight: '40px', display: 'flex', alignContent: 'center' }} >
      <span>{number}</span><div style={{ margin: '15px 0 0 15px', height: '10px', width: `${Math.round(prediction * 300)}px`, backgroundColor: color }}></div>
    </div>
  )
}


export default TestPage;
