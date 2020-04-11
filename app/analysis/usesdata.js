let d3 = require("d3");
let data = require("./data");
let z = require("./zoomable");

data.load().then(d => {

    const context = {
        onclick: () => {
            return (c) => {

                if (d.hasRegionalBreakdown(c.name)) {
                    let countryData = d.getRegionCounts(c.name);
                    d3.select("#country").select("svg").remove();
                    d3.select("#country").append(() => z.zoomable(countryData, {onclick: () => {}}))
                    .node()
                    .scrollIntoView();
                } else {
                    let countryData = d.getCountrySeries(c.name);
                    d3.select("#country").select("svg").remove();
                    d3.select("#country")
                    .append(() => z.zoomable(countryData, {onclick: () => {}}))
                    .scrollIntoView();
                }

            };
        },
    };

    let allCountries = d.getCountryCounts();
    d3.select("#all").append(() => z.zoomable(allCountries, context));
});