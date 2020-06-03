let d3 = require("d3");
let stats = require("./stats");

function load() {

    const url =  "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv";
    //const url = "data/time_series_covid19_confirmed_global.csv";

    return d3.csv(url)
        .then((dataFrame) => {

            const provinceIdx = 0; //Province/State	
            const countryIdx = 1; //Country/Region	
            const lat = 2; // Lat	
            const lon = 3; // Long	

            let countries = {};

            let data = {};
            let parseTime = d3.timeParse("%m/%d/%y");
            let startDate = parseTime("1/1/19");

            const countryKey = dataFrame.columns[countryIdx];
            const provinceKey = dataFrame.columns[provinceIdx];

            dataFrame.forEach(row => {

                let prev = 0;

                let country = row[countryKey];
                let province = row[provinceKey];

                if (province === "Recovered") {
                    return;
                }

                if (!(country in countries)) {
                    countries[country] = {
                        regions: {},
                        count: 0
                    };
                }
                let item = countries[country];

                if (!(province in item.regions)) {
                    item.regions[province] = {
                        samples: [],
                        count: 0
                    };
                }

                let region = item.regions[province];

                dataFrame.columns.slice(4).forEach(e => {

                    let sample = +row[e];
                    let delta = sample - prev;
                    prev = sample;

                    item.count += delta;

                    let date = parseTime(e);
                    if (date > startDate) {
                        region.samples.push({
                            name: date,
                            value: delta
                        });
                    }
                    region.count = sample;
                });

                Object.assign(region.samples, {
                    format: "%",
                    y: "Y label"
                });
            });

            let _data = {
                countries: []
            };

            Object.keys(countries).forEach(c => {
                let country = countries[c];
                country.count = 0;
                country.samples = [];

                Object.keys(country.regions).forEach(r => {
                    let region = country.regions[r];
                    country.count += region.count;

                    region.samples.forEach((s, i) => {

                        if (country.samples.length <= i) {
                            country.samples.push({
                                name: s.name,
                                value: 0
                            });
                        }
                        country.samples[i].value += s.value;
                    });

                });

                Object.assign(country.samples, {
                    format: "%",
                    y: "Y label"
                });

                _data.countries.push({
                    name: c,
                    value: country.count
                });
            });

            Object.assign(_data.countries, {
                format: "%",
                y: "Count"
            });

            const getCountryCounts = () => {
                return _data.countries;
            };

            const getRegionCounts = (country) => {

                console.log(`Looking for regions for ${country}`);

                Object.keys(countries).forEach(c => {
                    console.log(`Country Key ${c}`);
                });

                ret = [];
                c = countries[country];
                Object.keys(c.regions).forEach(region => {
                    ret.push({
                        name: region,
                        value: c.regions[region].count
                    });
                });

                return Object.assign(ret, {
                    format: "%",
                    y: "Count"
                });

            };

            const getRegionSeries = () => {

            };

            const getCountrySeries = (c) => {
                return countries[c].samples; 
            };

            const getDf = (x) => {
                return stats.calculateDf(x.samples);
            };

            _data.countries.forEach(c => {
                c.dfx = getDf(countries[c.name]);
            });

            Object.keys(countries).forEach(c => {

            });


            return {
                getCountryCounts: getCountryCounts,
                getRegionCounts: getRegionCounts,
                getRegionSeries: getRegionSeries,
                getCountrySeries: getCountrySeries,
                hasRegionalBreakdown: (country) => {
                    c = countries[country];

                    console.log(`Country ${country} has ${Object.keys(c.regions).length} regions`);

                    return Object.keys(c.regions).length > 1;
                }
            };
        });
}

exports.load = load;

exports.sortFn = function() {
    return {
        byCount: (data) => {
            return data.sort((a, b) => {
                return a.value - b.value;
            });
        },
        alphabetically: (data) => {
            return data.sort((a, b) => {
                return a.name.localeCompare(b.name);
            });
        }
    };
};