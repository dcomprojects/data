reg = require("regression");

function getRollingAvg(samples, inc) {

    let sum = 0;
    let buffer = [];
    let ret = [];

    let d = [];
    samples.forEach((e, i, a) => {
        d.push(e[1]);
    });

    console.log(`Input: ${d}`);

    for (let i = 0; i < samples.length; i++) {

        let current = +samples[i][1];
        sum += current;

        let size = buffer.push(current);

        if (size > inc) {
            let discard = buffer.shift();
            sum -= discard;
        }

        ret.push([samples[i][0], sum / buffer.length]);
    }

    return ret;
}

exports.getDataApproximation = (samples) => {

    const avg14 = getRollingAvg(samples, 14);

    const result = reg.polynomial(avg14, {
        order: 4
    });

    const obj = {};

    const coeff = result.equation;

    console.log(`${result.string}`);

    const f = function (x) {

        const deg = 4;
        const c = coeff.slice(-4);

        return Math.pow(x, deg - 1) * c[0] +
            Math.pow(x, deg - 2) * c[1] +
            Math.pow(x, deg - 3) * c[2] +
            Math.pow(x, deg - 4) * c[3];
    };

    f.bind(obj);

    const df = function (x) {

        const deg = 4;
        const c = coeff.slice(-4);

        return (deg - 1) * Math.pow(x, deg - 2) * c[0] +
            (deg - 2) * Math.pow(x, deg - 3) * c[1] +
            (deg - 3) * Math.pow(x, deg - 4) * c[2] +
            (deg - 4) * Math.pow(x, deg - 5) * c[3];
    };

    df.bind(obj);

    const d2f = function (x) {
        const c = coeff.slice(-4);
        return 6 * x * c[0] +
            2 * c[1];
    };
    d2f.bind(obj);

    const avgOverRange = function (end, duration) {
        return (f(end) - f(end - duration)) / 2.0;
    };
    avgOverRange.bind(obj);

    obj.samples = avg14;
    obj.f = f;
    obj.df = df;
    obj.d2f = d2f;
    obj.avg = avgOverRange;

    return obj;
};