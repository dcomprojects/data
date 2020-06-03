//reg = require("regression");
mrp = require("ml-regression-polynomial");


function calculateStats(samples, order) {

    console.log(`Here: ${samples.length}`);
    console.log(samples);

    const x = [];
    const y = [];

    samples.forEach(e => {
        x.push(e[0]);
        y.push(e[1]);
    });

    console.log(x);
    console.log(y);
    const reg = new mrp(x, y, order);

    const obj = {};

    const coeff = reg.coefficients.reverse();

    console.log(`${reg.toString()}`);
    console.log(`${coeff}`);

    const f = function (x) {

        let ret = 0;
        for (let i = 0; i < coeff.length; i++) {
            let exp = order - i;
            ret += Math.pow(x, exp) * coeff[i];
        }

        return ret;
    };

    f.bind(obj);

    const df = function (x) {

        let ret = 0;
        for (let i = 0; i < coeff.length; i++) {

            let n = order-i;
            let exp = Math.max(0, n - 1);
            //x^n => n * x^n-1
            ret += n * Math.pow(x, exp) * coeff[i];
        }


        return ret;
    };

    df.bind(obj);

    const d2f = function (x) {

        let ret = 0;
        for (let i = 0; i < coeff.length; i++) {

            let n = order-i;
            let exp = Math.max(0, n-2);

            ret += n * (n-1) * Math.pow(x, exp) * coeff[i];
        }

        return ret;

    };
    d2f.bind(obj);

    obj.samples = samples;
    obj.f = f.bind(obj);
    obj.df = df.bind(obj);
    obj.d2f = d2f.bind(obj);

    return obj;
}

exports.getRollingStats = function(samples, inc) {

    let sum = 0;
    let buffer = [];
    let avg = [];

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

        let node =[samples[i][0], sum / buffer.length];
        Object.assign(node, {stats: {}});
        avg.push(node);

        if (i >= 5) {
            node.stats['avg'] = calculateStats(avg.slice(-inc), 3);
            node.stats['actual'] = calculateStats(samples.slice(0, i+1).slice(-inc), 3);
        }
    }

    const n = avg[avg.length - 1].stats;
    console.log(n);

    n.avg.samples.forEach(e => {
        console.log(`${e[0]}: ${e[1]} ${n.avg.f(e[0])}`);
    });

    console.log(`
                F: 0: ${n.actual.f(0)}
                Avg F: 0: ${n.avg.f(0)}
                DF: 0: ${n.actual.df(0)}
                Avg DF: 0: ${n.avg.df(0)}
                D2F: 0: ${n.actual.d2f(0)}
                Avg D2F: 0: ${n.avg.d2f(0)}
            `);

    return avg;
};

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

exports.calculateDf = function(samples) {
    console.log(samples);
    return 0.0;
};