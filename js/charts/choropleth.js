import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const antic = getComputedStyle(document.documentElement).getPropertyValue("--antic").trim();
const prata = getComputedStyle(document.documentElement).getPropertyValue("--prata").trim();
const black = getComputedStyle(document.documentElement).getPropertyValue("--black").trim();
const beige = getComputedStyle(document.documentElement).getPropertyValue("--beige").trim();
const white = getComputedStyle(document.documentElement).getPropertyValue("--white").trim();
const orange = getComputedStyle(document.documentElement).getPropertyValue("--orange").trim();
const blue = getComputedStyle(document.documentElement).getPropertyValue("--blue").trim();

var margin = { top: 10, right: 0, bottom: 0, left: 0 },
    width = 1000 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

const eventColors = {
    "RussianUkranianWar": black,
    "IsraeliPalestinianWar": orange,
    "DrugWar": blue
};

const rootSvg = d3.select("#choropleth")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

rootSvg.insert("rect")
    .attr("class", "rectangle")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("fill", "none")
    .attr("stroke", black)
    .attr("stroke-width", 1)
    .attr("rx", 10)
    .attr("ry", 10);

const svg = rootSvg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const projection = d3.geoMercator()
    .rotate([-10, 0])
    .scale(130)
    .translate([width / 1.8, height / 1.8]);

const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("opacity", 0)
    .style("background-color", `${beige}`)
    .style("border", `1px solid ${black}`)
    .style("padding", "10px")
    .style("z-index", "999")
    .style("pointer-events", "none")
    .style("font-family", prata)
    .style("font-size", "12px");

//Zoom
let myZoom = d3.zoom()
    .scaleExtent([1, 10])
    .on('zoom', (e) => svg.attr('transform', e.transform));

rootSvg.call(myZoom);

d3.select('#choropleth-zoom-in').on('click', () =>
    rootSvg.transition().call(myZoom.scaleBy, 2)
);

d3.select('#choropleth-zoom-out').on('click', () => {
    const t = d3.zoomTransform(rootSvg.node());
    if (t.k <= 1.001)
        rootSvg.transition().duration(750).call(myZoom.transform, d3.zoomIdentity);
    else
        rootSvg.transition().call(myZoom.scaleBy, 0.5);
});

d3.select('#choropleth-zoom-restore').on('click', () => {
    rootSvg.transition()
        .duration(750)
        .call(myZoom.transform, d3.zoomIdentity);
});

export function renderChoropleth() {
    Promise.all([
        d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
        d3.csv("data/csv/cleaned/map_trends_cleaned.csv")
    ]).then(function (loadData) {
        let topo = loadData[0];
        let eventData = loadData[1];

        projection.fitSize([width, height], topo);

        const pathGenerator = d3.geoPath().projection(projection);

        const countryEventMap = new Map();
        eventData.forEach(row => {
            countryEventMap.set(row.Country, {
                RussianUkranianWar: row.RussianUkranianWar,
                IsraeliPalestinianWar: row.IsraeliPalestinianWar,
                DrugWar: row.DrugWar
            });
        });

        svg.selectAll("path")
            .data(topo.features)
            .join("path")
            .attr("d", pathGenerator)
            .attr("fill", d => {
                const countryName = d.properties.name;
                const events = countryEventMap.get(countryName);

                if (!events)
                    return white;

                let maxEvent = Object.entries(events)
                    .reduce((a, b) => parseFloat(b[1]) > parseFloat(a[1]) ? b : a, ["None", 0]);

                return eventColors[maxEvent[0]] || white;
            })
            .attr("stroke", beige)
            .attr("stroke-width", 0.3)
            .on("mouseover", function (event, d) {
                const countryName = d.properties.name;
                const events = countryEventMap.get(countryName) || {};

                tooltip.html(`
                        <strong>${countryName} interest index</strong><br/>
                        Russian-Ukrainian War: ${events.RussianUkranianWar || "0%"}<br/>
                        Israeli-Palestinian War: ${events.IsraeliPalestinianWar || "0%"}<br/>
                        Drug War: ${events.DrugWar || "0%"}
                    `)
                    .style("opacity", 1);

                d3.select(this).attr("fill-opacity", 0.6);
            })
            .on("mousemove", function (event) {
                tooltip.style("top", (event.pageY) + "px")
                    .style("left", (event.pageX) + "px");
            })
            .on("mouseout", function () {
                tooltip.style("opacity", 0);
                d3.select(this).attr("fill-opacity", 1);
            });

        //Legend
        const legend = rootSvg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(20, ${height - 650})`);

        legend.append("text")
            .attr("x", 0)
            .attr("y", -10)
            .style("font-size", "14px")
            .style("font-family", antic)
            .style("font-weight", "bold")
            .attr("fill", black)
            .text("Topic of interest");

        Object.entries(eventColors).forEach(([eventType, color], i) => {
            const legendRow = legend.append("g")
                .attr("transform", `translate(0, ${i * 25})`);

            legendRow.append("rect")
                .attr("width", 20)
                .attr("height", 20)
                .attr("fill", color);

            legendRow.append("text")
                .attr("x", 30)
                .attr("y", 15)
                .style("font-size", "12px")
                .style("font-family", prata)
                .attr("fill", black)
                .text((eventType).replace(/([a-z])([A-Z])/g, "$1 $2"));
        });

        legend.append("rect")
            .attr("width", 20)
            .attr("height", 20)
            .attr("y", 75)
            .attr("fill", white);

        legend.append("text")
            .attr("x", 30)
            .attr("y", 90)
            .style("font-size", "12px")
            .style("font-family", prata)
            .attr("fill", black)
            .text("Low search index");
    });
};