const synaptic = require('synaptic');
const db = require('./db');
const { Layer, Network } = synaptic;
const fs = require('fs');

// const predict = require('./trained');
// console.log(predict(db.data.saved[2][0].flat()));
// process.exit();

console.log(db.data.saved.length)

var inputLayer = new Layer(400);
var hiddenLayer1 = new Layer(20);
var hiddenLayer2 = new Layer(15);
var outputLayer = new Layer(10);

inputLayer.project(hiddenLayer1);
hiddenLayer1.project(hiddenLayer2);
hiddenLayer2.project(outputLayer);

var myNetwork = new Network({
	input: inputLayer,
	hidden: [hiddenLayer1, hiddenLayer2],
	output: outputLayer
});

// for (let n = 0; n < 10; n++) {
//   const pic = db.data.saved[n][1].flat()
//   // Print 20x20 grid from da.data.saved array:
//   for (let j = 0; j < 20; j++) {
//     let row = '';
//     for (let i = 0; i < 20; i++) {
//       row += pic[i * 20 + j] ? 'X' : ' ';
//     }
//     console.log(row);
//   }
// }

// process.exit()

// train the network - learn XOR
var learningRate = 0.1;

for (let i = 0; i < 5000 * 1000; i++) {
  const chosenNum = Math.round(Math.random() * 9);
  const chosenPic = Math.round(Math.random() * (db.data.saved[chosenNum].length - 1));
  const result = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  result[chosenNum] = 1;
  if (i % 1000 === 0) {
    console.log(`Training iteration ${i/1000}: ${chosenNum} ${chosenPic}: ${result}`);
  }
  myNetwork.activate(db.data.saved[chosenNum][chosenPic].flat());
  myNetwork.propagate(learningRate, result);
}
 
console.log(myNetwork.activate(db.data.saved[2][0].flat()));


fs.writeFileSync('trained.js', 'module.exports = function predict' + myNetwork.standalone().toString().slice(9));

//  console.log(myNetwork.activate([1,1,1,1,0,1,1,1,1,1,0,1,1,1,1]));
//  console.log(myNetwork.activate([1,1,1,1,0,1,1,1,1,1,0,1,1,1,1]));

//  for (const connectionKey of Object.keys(inputLayer.connectedTo[0].connections)) {
//    const connection = inputLayer.connectedTo[0].connections[connectionKey]
//    const id = connection.ID
//    const from = connection.from.ID
//    const to = connection.to.ID
//    const weight = connection.weight
//    const bias = connection.to.bias
//    console.log(`[${id}]: ${from}->${to}  weight: ${weight}  bias: ${bias}`)
//  }
 
//  for (const connectionKey of Object.keys(hiddenLayer.connectedTo[0].connections)) {
//    const connection = hiddenLayer.connectedTo[0].connections[connectionKey]
//    const id = connection.ID
//    const from = connection.from.ID
//    const to = connection.to.ID
//    const weight = connection.weight
//    const bias = connection.to.bias
//    console.log(`[${id}]: ${from}->${to}  weight: ${weight}  bias: ${bias}`)
//  }