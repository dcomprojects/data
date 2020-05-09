r = require("random");
reg = require("regression");

let data = [];

const n = r.normal(0, 10);
const fJitter = (x, jitter) => {

    const a = 20.1; 
    const b = 0; 
    const c = 0; 
    const d = 30;

    return f(x, [a, b, c, d]) + jitter();
};

const f = (x, coeff) => {

    const c = coeff.slice(-4);

    return (x * x * x * c[0])
        + (x * x * c[1])
        + (x * c[2])
        + (c[3]);

};

const df = (x, coeff) => {

    const c = coeff.slice(-4);

    return 3 * x * x * c[0] 
    + 2 * x * c[1]  
    + c[2];

};

const df2 = (x, coeff) => {

    const c = coeff.slice(-4);
    return 6 * x * c[0] 
    + 2 * c[1];

};

let actual = [];
let calculated = [];

let x = -10.0;
for (let i = 0; i < 200; i++) {

    const datum = [x, fJitter(x, n)];
    x += 20.0/200.0;
    data.push(datum);
}

const result = reg.polynomial(data, { order: 4 });

data.forEach(e => {

    const datum3 = [e[0], fJitter(
        e[0], () => 0)
    ];

    const datum4 = [e[0], f(
        e[0], 
        result.equation)
    ];

    actual.push(datum3);
    calculated.push(datum4);
});

console.log(`${result.string}`);
console.log(`${result.equation}`);

exports.someData = data;

exports.df = (x) => {
    return df(x, 
        result.equation);
}; 

exports.df2 = (x) => {
    return df2(x, 
        result.equation);
};

exports.actual = actual;
exports.calculated = calculated;
