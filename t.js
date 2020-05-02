d3 = require('d3');

const a25 = Array.from(Array(25), (e, i) => i);
const newDomain = Array.from(Array(50), (e, i) => i);

let padInner = 0.1;
let padOuter = 0.1;
let x2 = d3.scaleBand()
    .domain(a25)
    .range([50, 1000])
    .paddingOuter(padOuter)
    .paddingInner(padInner);


let barWidth = x2.step() * 25;

 let newLength =  x2.step() *  Math.max(1, newDomain.length - padInner + padOuter * 2);

let newX = d3.scaleBand()
    .domain(newDomain)
    .range([0, newLength])
    .paddingOuter(padOuter)
    .paddingInner(padInner);

console.log(`
    Step Size: ${x2.step()}
    Bandwidth: ${x2.bandwidth()}
    New Length: ${newLength}
    New Step Size: ${newX.step()}
    New Bandwidth: ${newX.bandwidth()}
`);