import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const antic = getComputedStyle(document.documentElement).getPropertyValue("--antic").trim();
const prata = getComputedStyle(document.documentElement).getPropertyValue("--prata").trim();
const black = getComputedStyle(document.documentElement).getPropertyValue("--black").trim();
const orange = getComputedStyle(document.documentElement).getPropertyValue("--orange").trim();
const beige = getComputedStyle(document.documentElement).getPropertyValue("--beige").trim();

var margin = { top: 0, right: 0, bottom: 0, left: 0 },
    width = 500 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

const innerRadius = 90;
const outerRadius = Math.min(width, height) / 2 - 40;

const svg = d3.select("#radial")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

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
    .style("font-size", "14px");

d3.csv("data/csv/cleaned/gas_cleaned.csv").then(data => {
    data.forEach(d => {
        d.year = +d.TIME_PERIOD;
        d.value = +d.OBS_VALUE;
    });

    const angleScale = d3.scaleBand()
        .domain(data.map(d => d.year))
        .range([0, Math.PI * 2])
        .align(0);

    const radiusScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value)])
        .range([innerRadius, outerRadius]);

    const gridValues = radiusScale.ticks(4).slice(1);

    svg.append("g")
        .selectAll("circle")
        .data(gridValues)
        .join("circle")
        .attr("r", d => radiusScale(d))
        .attr("fill", "none")
        .attr("stroke", black)
        .attr("stroke-opacity", 0.15);

    const arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(d => radiusScale(d.value))
        .startAngle(d => angleScale(d.year))
        .endAngle(d => angleScale(d.year) + angleScale.bandwidth())
        .padAngle(0.03)
        .padRadius(innerRadius);

    svg.append("g")
        .selectAll("path")
        .data(data)
        .join("path")
        .attr("fill", d => d.year < 2022 ? black : orange)
        .attr("d", arc)
        .attr("opacity", 1)
        .on("mouseover", function (event, d) {
            const formatEuropean = (num) => {
                return d3.format(",.2f")(num)
                    .replace(/,/g, "TEMP")
                    .replace(/\./g, ",")
                    .replace(/TEMP/g, ".");
            };

            tooltip.html(`<strong>Import in ${d.year}</strong>: ${formatEuropean(d.value)} million cubic metres`)
                .style("opacity", 1);

            d3.select(this).attr("fill-opacity", 0.6);
        })
        .on("mousemove", function (event) {
            tooltip.style("top", (event.pageY - 40) + "px")
                .style("left", (event.pageX) + "px");
        })
        .on("mouseout", function () {
            tooltip.style("opacity", 0);
            d3.select(this).attr("fill-opacity", 1);
        });

    const labelGroup = svg.append("g");

    labelGroup.selectAll("text")
        .data(data)
        .join("text")
        .attr("text-anchor", "middle")
        .attr("transform", d => {
            const angle = angleScale(d.year) + angleScale.bandwidth() / 2;
            const r = outerRadius + 18;
            return `rotate(${(angle * 180 / Math.PI) - 90})
                    translate(${r},0)
                    rotate(${angle > Math.PI ? 180 : 0})`;
        })
        .text(d => d.year)
        .style("font-family", antic)
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("fill", black);
});