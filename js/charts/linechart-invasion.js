import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const antic = getComputedStyle(document.documentElement).getPropertyValue("--antic").trim();
const prata = getComputedStyle(document.documentElement).getPropertyValue("--prata").trim();
const black = getComputedStyle(document.documentElement).getPropertyValue("--black").trim();
const orange = getComputedStyle(document.documentElement).getPropertyValue("--orange").trim();
const green = getComputedStyle(document.documentElement).getPropertyValue("--green").trim();

const margin = { top: 80, right: 130, bottom: 60, left: 130 },
    width = 900 - margin.left - margin.right,
    height = 550 - margin.top - margin.bottom;

d3.csv("data/csv/cleaned/russian_possession.csv").then(data => {

    data.forEach(d => {
        d.Date = d3.timeParse("%Y-%m-%d")(d.Date);
        d.Percentage = +d.Percentage.replace("%", "");
    });

    const svgRoot = d3.select("#linechart-invasion")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    const svg = svgRoot.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // X axis
    const x = d3.scaleTime()
        .domain(d3.extent(data, d => d.Date))
        .range([25, width]);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(3))
        .selectAll("text")
        .style("font-family", prata)
        .style("font-size", "12px");

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .attr("text-anchor", "middle")
        .style("font-family", antic)
        .style("font-weight", "bold")
        .text("Timeline");

    // Y axis
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.Percentage)])
        .nice()
        .range([height, 0]);

    svg.append("g")
        .call(d3.axisLeft(y))
        .selectAll("text")
        .style("font-family", prata)
        .style("font-size", "12px");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -60)
        .attr("x", -height / 2)
        .attr("text-anchor", "middle")
        .style("font-family", antic)
        .style("font-weight", "bold")
        .text("Russian possession (%)");

    // Line
    const lineGen = d3.line()
        .x(d => x(d.Date))
        .y(d => y(d.Percentage));

    svg.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", black)
        .attr("stroke-width", 2.5)
        .attr("d", lineGen);
});