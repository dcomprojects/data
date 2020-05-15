blah = require("./app/analysis/stats");
rn = require("d3").randomNormal(10, 2);

const data = [
];

for (let i = 0; i < 100; i++) {

    data.push([0, rn()]);

}

let result = blah.getRollingAvg(data, 14);

console.log(result);
