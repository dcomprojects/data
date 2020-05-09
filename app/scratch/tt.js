reg = require("regression");

exports.getDataApproximation = (samples) => {

    const result = reg.polynomial(samples, { order: 4 });

    const obj = {
    };

    const coeff = result.equation;

    const f = function(x) {
        const c = coeff.slice(-4);
        return x * x * x * c[0]
        + x * x * c[1]
        + x * c[2]
        + c[3];
    };

    f.bind(obj);

    const df = function(x) {
        const c = coeff.slice(-4);
        return 3 * x * x * c[0]
        + 2 * x * c[1]
        + c[2];
    };

    df.bind(obj);

    const d2f = function(x) {
        const c = coeff.slice(-4);
        return 6 * x * c[0]
        + 2 * c[1];
    };
    d2f.bind(obj);

    const avgOverRange = function(end, duration) {
        return (f(end) - f(end - duration)) / 2.0;
    };
    avgOverRange.bind(obj);

    obj.samples = samples;
    obj.f = f;
    obj.df = df;
    obj.d2f = d2f;
    obj.avg = avgOverRange;

    return obj; 
};