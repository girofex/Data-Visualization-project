import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const antic = getComputedStyle(document.documentElement).getPropertyValue("--antic").trim();
const prata = getComputedStyle(document.documentElement).getPropertyValue("--prata").trim();
const black = getComputedStyle(document.documentElement).getPropertyValue("--black").trim();
const beige = getComputedStyle(document.documentElement).getPropertyValue("--beige").trim();
const white = getComputedStyle(document.documentElement).getPropertyValue("--white").trim();
const orange = getComputedStyle(document.documentElement).getPropertyValue("--orange").trim();
const green = getComputedStyle(document.documentElement).getPropertyValue("--green").trim();

var margin = { top: 10, right: 0, bottom: 0, left: 0 },
    width = 1000 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

const eventColors = {
    "war": orange,
    "civilwar": green,
    "none": black
};

const rootSvg = d3.select("#connection")
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
    .attr("stroke-width", 1);

const svg = rootSvg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const projection = d3.geoMercator()
    .rotate([-10, 0])
    .scale(130)
    .translate([width / 1.8, height / 1.8]);

const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "fixed")
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

d3.select('.connection-zoom-in').on('click', () =>
    rootSvg.transition().call(myZoom.scaleBy, 2)
);

d3.select('.connection-zoom-out').on('click', () => {
    const t = d3.zoomTransform(rootSvg.node());
    if (t.k <= 1.001)
        rootSvg.transition().duration(750).call(myZoom.transform, d3.zoomIdentity);
    else
        rootSvg.transition().call(myZoom.scaleBy, 0.5);
});

d3.select('.connection-zoom-restore').on('click', () => {
    rootSvg.transition()
        .duration(750)
        .call(myZoom.transform, d3.zoomIdentity);
});

Promise.all([
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
    d3.csv("data/csv/cleaned/conflicts_cleaned.csv")
]).then(function ([world, conflicts]) {
    projection.fitSize([width, height], world);
    const path = d3.geoPath().projection(projection);

    //Centroid map
    const countryCentroids = new Map();
    world.features.forEach(d => {
        countryCentroids.set(d.properties.name, d3.geoCentroid(d));
    });

    //Coordinates
    const links = conflicts.map(d => {
        const source = countryCentroids.get(d.side_a);
        const target = countryCentroids.get(d.side_b);

        if (!source || !target)
            return null;

        return { type: "LineString", coordinates: [source, target], conflictType: d.type_of_conflict };
    }).filter(d => d !== null);

    //Conflicts
    const countryEventMap = new Map();
    conflicts.forEach(d => {
        if (!countryEventMap.has(d.side_a))
            countryEventMap.set(d.side_a, []);
        if (!countryEventMap.has(d.side_b))
            countryEventMap.set(d.side_b, []);

        countryEventMap.get(d.side_a).push(d.type_of_conflict);
        countryEventMap.get(d.side_b).push(d.type_of_conflict);
    });

    //Countries
    svg.append("g")
        .selectAll("path")
        .data(world.features)
        .enter().append("path")
        .attr("fill", d => {
            const events = countryEventMap.get(d.properties.name);
            if (!events || events.length === 0)
                return eventColors["none"];

            const maxType = Math.max(...events.map(Number));

            if (maxType === 2) return eventColors["war"];
            if (maxType === 3 || maxType === 4) return eventColors["civilwar"];
            return eventColors["none"];
        })
        .attr("d", path)
        .style("stroke", beige)
        .style("stroke-width", 0.3)
        .on("mouseover", function (event, d) {
            tooltip.style("opacity", 1)
                .html(`<strong>${d.properties.name}</strong>`)
                .style("opacity", 1);

            d3.select(this).attr("fill-opacity", 0.6);
        })
        .on("mousemove", function (event, d) {
            tooltip
                .style("left", (event.clientX + 10) + "px")
                .style("top", (event.clientY) + "px");
        })
        .on("mouseout", function () {
            tooltip.style("opacity", 0);
            d3.select(this).attr("fill-opacity", 1);
        });

    //Lines
    svg.selectAll("myPath")
        .data(links)
        .enter()
        .append("path")
        .attr("d", d => path(d))
        .style("fill", "none")
        .style("stroke", white)
        .style("stroke-width", 1.5);

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
        .text("Type of conflict");

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
            .text(eventType
                .replace(/([a-z])([A-Z])/g, "$1 $2")
                .replace(/^./, str => str.toUpperCase())
            );
    });
});