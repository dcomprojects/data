blah = require("./app/analysis/stats");
rn = require("d3").randomNormal(10, 2);
r = require("regression");

pr = require("ml-regression-polynomial");

console.log(pr);

const data = [
];

for (let i = -14; i <= 14; i++) {

    data.push([i, Math.pow(i, 2)]);

}

//let result = blah.getRollingStats(data, 14);

const data2 = [
    [106, 1635.857142857143],
    [107, 1625.357142857143],
    [108, 1610.5],
    [109, 1575.5714285714287],
    [110, 1546.2857142857142],
    [111, 1519.2142857142858],
   [112, 1478.7857142857142],
  [113, 1451.7142857142858],
 [114, 1401.142857142857],
[115, 1377.142857142857],
[116, 1273.4285714285713],
[117, 1246.7142857142858],
[118, 1234.142857142857],
[119, 1205.7857142857142]

];

const data3x = [];
const data3y = [];

data2.forEach(e => {
    data3x.push(e[0]);
    data3y.push(e[1]);
});

const regression = new pr(data3x, data3y, 4);
let r2 = r.polynomial(data2, {order: 4});

console.log(regression.predict(116)); // Apply the model to some x value. Prints 2.6.
console.log(regression.coefficients); // Prints the coefficients in increasing order of power (from 0 to degree).
console.log(regression.toString(3)); // Prints a human-readable version of the function.
console.log(r2.string);
console.log(regression.toLaTeX());
console.log(regression.score(data3x, data3y));

data3x.forEach(x => {
    console.log(regression.predict(x));
    console.log(r2.predict(x));
});

