let d3 = require("d3");
let data = require("./data");
let z = require("./zoomable");

data.load().then(d => {

    const context = {
        onclick: () => {

            let sorter = data.sortFn().byCount;

            return (c) => {

                if (d.hasRegionalBreakdown(c.name)) {
                    let countryData = sorter(d.getRegionCounts(c.name)).reverse();
                    d3.select("#country").select("svg").remove();
                    d3.select("#country").append(() => z.zoomable(countryData, {
                            onclick: () => {}
                        }))
                        .node()
                        .scrollIntoView();
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
    d3.select("#all").append(() => z.zoomable(allCountries, context));
});