reg = require("regression");

function calculateStats(samples, order) {

    console.log(`Here: ${samples.length}`);
    console.log(samples);
    const result = reg.polynomial(samples, {
        order: order 
    });

    const obj = {};

    const coeff = result.equation;

    console.log(`${result.string}`);

    const f = function (x) {

        let ret = 0;
        for (let i = 0; i < coeff.length; i++) {
            let exp = order -i;
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
        node.stats['avg'] = calculateStats(avg.slice(-inc), 2);
        node.stats['actual'] = calculateStats(samples.slice(0, i+1).slice(-inc), 2);
    }

    const n = avg[avg.length - 1].stats;
    console.log(n);

        console.log(`
                F: 0: ${n.actual.f(0)}
                Avg F: 0: ${n.avg.f(0)}
                DF: 0: ${n.actual.df(0)}
                Avg DF: 0: ${n.avg.df(0)}
                D2F: 0: ${n.actual.d2f(0)}
                Avg D2F: 0: ${n.avg.d2f(0)}

            `);
    /*
    for (let i = 0; i < samples.length; i++) {
        console.log(`
                Actual: ${samples[i][0]}: ${samples[i][1]}
                Rolling Avg: ${samples[i][0]}: ${avg[i][1]}

                F: ${samples[i][0]}: ${n.actual.f(samples[i][0])}
                Avg F: ${samples[i][0]}: ${n.avg.f(samples[i][0])}
                DF: ${samples[i][0]}: ${n.actual.df(samples[i][0])}
                Avg DF: ${samples[i][0]}: ${n.avg.df(samples[i][0])}
                D2F: ${samples[i][0]}: ${n.actual.d2f(samples[i][0])}
                Avg D2F: ${samples[i][0]}: ${n.avg.d2f(samples[i][0])}

            `);
    }
    */

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