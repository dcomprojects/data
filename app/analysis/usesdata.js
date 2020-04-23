let d3 = require("d3");
let data = require("./data");
let z = require("./zoomable");

const onload = () => {
    return new Promise(function (resolve, reject) {
        window.onload = resolve;
    });
};

onload().then(() => {

    let body = d3.select("body");

    window.setTimeout(function () {
        body.classed('is-preload', false);
    }, 100);

    return data.load();

}).then(d => {

    const context = {
        onclick: () => {

            let sorter = data.sortFn().byCount;

            return (c) => {

                let node = d3.select("#country");
                d3.select("#country").select("svg").remove();

                let countryData = [];
                let context = {
                    onclick: () => {}
                };

                if (d.hasRegionalBreakdown(c.name)) {
                    countryData = sorter(d.getRegionCounts(c.name)).reverse();
                } else {
                    countryData = d.getCountrySeries(c.name).slice(-25);
                }

                z.appendChart(node, countryData, context); 
                node.node().scrollIntoView();
            };
        },
    };

    let allCountries = d.getCountryCounts();

    let sorter = data.sortFn().byCount;

    allCountries = sorter(allCountries).reverse();

    z.appendChart(d3.select("#all"), allCountries, context);
});