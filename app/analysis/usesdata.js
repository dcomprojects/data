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

    const all = d3.select("#all");

    const context = {
        onclick: () => {

            let sorter = data.sortFn().byCount;

            return (c) => {

                let countryTimeSeries = d3.select("#cts");

                countryTimeSeries.select("svg").remove();

                let regionsNode = d3.select("#regions");

                regionsNode.select("svg").remove();

                let regionTimeSeries = d3.select("#rts");
                regionTimeSeries.select("svg").remove();

                let context = {
                    onclick: () => {}
                };

                if (d.hasRegionalBreakdown(c.name)) {
                    let regionData = sorter(d.getRegionCounts(c.name)).reverse();
                    z.appendChart(regionsNode, regionData, context);
                    d3.select("#regions_label").text(`${c.name} Regions`);
                }

                let countrySeriesContext = {
                    onclick: () => {},
                    xAxisFormat: d3.timeFormat("%Y/%m/%d")
                };

                cts = d.getCountrySeries(c.name); //.slice(-25);
                const chart = z.appendChartWithStats(countryTimeSeries, cts, countrySeriesContext);
                chart.slideRight();
                d3.select("#cts_label").text(`${c.name} Time Series`);

                countryTimeSeries.node().scrollIntoView();
            };
        },
    };

    let allCountries = d.getCountryCounts();

    let sorter = data.sortFn().byCount;

    allCountries = sorter(allCountries).reverse();

    z.appendChart(all,
        allCountries, context);
});