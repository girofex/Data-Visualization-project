import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const antic = getComputedStyle(document.documentElement).getPropertyValue("--antic").trim();
const prata = getComputedStyle(document.documentElement).getPropertyValue("--prata").trim();
const orange = getComputedStyle(document.documentElement).getPropertyValue("--orange").trim();
const black = getComputedStyle(document.documentElement).getPropertyValue("--black").trim();
const beige = getComputedStyle(document.documentElement).getPropertyValue("--beige").trim();
const green = getComputedStyle(document.documentElement).getPropertyValue("--green").trim();
const blue = getComputedStyle(document.documentElement).getPropertyValue("--blue").trim();

var margin = { top: 70, right: 100, bottom: 0, left: 100 },
    width = 500 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

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

const unitSize = 12;
const unitSpacing = 15;
const maxPerRow = 15;

export function renderPictorial() {
    return d3.csv("data/csv/cleaned/top3_cleaned.csv").then(data => {
        data.forEach(d => {
            d.Entity = d.Entity;
            d.DeathRate = +d.DeathRate;
        });

        const colorScale = d3.scaleOrdinal()
            .domain(data.map(d => d.Entity))
            .range([orange, green, blue]);

        var svg = d3.select("#pictorial")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        svg.append('text')
            .attr('x', width / 2)
            .attr('y', -30)
            .attr("text-anchor", "middle")
            .text("Countries with highest death rate in 2021")
            .style("font-family", antic)
            .style("font-size", "1rem")
            .style("font-weight", "bold");

        const scaleValueToUnits = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.DeathRate)])
            .range([0, 31]);

        //Groups
        let y = 20;
        const marginBottom = 15;

        const groups = svg.selectAll(".group")
            .data(data)
            .enter()
            .append("g")
            .attr("class", "group")
            .attr("transform", d => {
                const count = Math.round(scaleValueToUnits(d.DeathRate));
                const rows = Math.ceil(count / maxPerRow);

                const groupHeight = rows * (unitSize + unitSpacing);

                const pos = y;
                y += groupHeight + marginBottom;

                return `translate(0, ${pos})`;
            })
            .attr("opacity", 1)
            .attr("cursor", "default")
            .on("mouseover", function (event, d) {
                tooltip
                    .html(`<strong>${d.Entity}</strong>: ${d.DeathRate} deaths every 100k people`)
                    .style("opacity", 1);

                d3.select(this).selectAll("text.icon")
                    .style("opacity", 0.6);
            })
            .on("mousemove", function (event) {
                tooltip
                    .style("left", (event.clientX + 10) + "px")
                    .style("top", (event.clientY + 10) + "px");
            })
            .on("mouseout", function () {
                tooltip.style("opacity", 0);
                d3.select(this).selectAll("text.icon")
                    .style("opacity", 1);
            });

        //Labels
        groups.append("text")
            .attr("class", "label")
            .attr("x", -10)
            .attr("y", unitSize - 14)
            .attr("text-anchor", "end")
            .style("font-family", antic)
            .style("font-weight", "bold")
            .style("font-size", "12px")
            .text(d => d.Entity);

        //Units
        const allIcons = [];

        groups.each(function (d) {
            const group = d3.select(this);
            const count = Math.round(scaleValueToUnits(d.DeathRate));
            const unitsData = d3.range(count);

            const icons = group.selectAll("text.icon")
                .data(unitsData)
                .enter()
                .append("text")
                .attr("class", "icon")
                .attr("x", (u, i) => (i % maxPerRow) * (unitSize + unitSpacing))
                .attr("y", (u, i) => Math.floor(i / maxPerRow) * (unitSize + unitSpacing) + unitSize * 0.75)
                .text("man_2")
                .style("font-family", '"Material Symbols Outlined"')
                .style("font-size", "30px")
                .style("fill", colorScale(d.Entity))
                .style("opacity", 0)
                .attr("transform", "scale(0)");

            allIcons.push(icons);
        });

        svg.node()._allIcons = allIcons;
        return allIcons;
    });
}