let d3 = require("d3");
let data = require("./data");
let z = require("./zoomable");

const blah = () => {
    return new Promise(function (resolve, reject) {
        window.onload = resolve;
    });
    /*
     */
};

blah().then(() => {

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

                if (d.hasRegionalBreakdown(c.name)) {
                    let countryData = sorter(d.getRegionCounts(c.name)).reverse();
                    d3.select("#country").select("svg").remove();

                    let node = d3.select("#country");

                    z.appendChart(node, countryData, {
                        onclick: () => {}
                    });

                    node.scrollIntoView();


                } else {
                    let countryData = d.getCountrySeries(c.name);
                    d3.select("#country").select("svg").remove();
                    d3.select("#country")
                        .append(() => z.zoomable(countryData, {
                            onclick: () => {}
                        }))
                        .scrollIntoView();
                }

            };
        },
    };

    let allCountries = d.getCountryCounts();

    let sorter = data.sortFn().byCount;

    allCountries = sorter(allCountries).reverse();

    z.appendChart(d3.select("#all"), allCountries, context);

    //d3.select("#all").append(() => z.zoomable(allCountries, context));
});

exports.myFunc = () => {
    console.log("Hello!");
};