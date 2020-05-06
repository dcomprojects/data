r = require("random");
reg = require("regression");

let data = [];

const fJitter = (x, jitter) => {

    const a = 0.5; 
    const b = 0; 
    const c = 0; 
    const d = 0;

    return f(x, a, b, c, d, jitter);
};

const f = (x, a, b, c, d, jitter) => {

    return (x * x * x * a)
        + (x * x * b)
        + (x * c)
        + (d) + jitter();

};

const df = (x, a, b, c) => {

    return 3 * x * x * a 
    + 2 * x * b  
    + c;

};

const df2 = (x, a, b) => {

    return 6 * x * a 
    + 2 * b;

};

let dataDf = [];
let dataDf2 = [];
let actual = [];
let calculated = []

let x = -10.0;
const n = r.normal(0, 10);
for (let i = 0; i < 200; i++) {

    const datum = [x, fJitter(x, n)];
    x += 20.0/200.0;
    data.push(datum);
}

const result = reg.polynomial(data, { order: 4 });

data.forEach(e => {

    const datum = [e[0], df(
        e[0], 
        result.equation[1], 
        result.equation[2], 
        result.equation[3], 
        result.equation[4] 
        )
    ];

    const datum2 = [e[0], df2(
        e[0], 
        result.equation[1], 
        result.equation[2], 
        result.equation[3], 
        result.equation[4] 
        )
    ];

    const datum3 = [e[0], fJitter(
        e[0], () => 0)
    ];

    const datum4 = [e[0], f(
        e[0], 
        result.equation[1], 
        result.equation[2], 
        result.equation[3], 
        result.equation[4], 
        () => 0
        )
    ];

    dataDf.push(datum);
    dataDf2.push(datum2);
    actual.push(datum3);
    calculated.push(datum4);
});

console.log(`${result.string}`);
console.log(`${result.equation}`);

exports.someData = data;
exports.df = dataDf;
exports.df2 = dataDf2;
exports.actual = actual;
exports.calculated = calculated;
