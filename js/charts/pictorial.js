import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const antic = getComputedStyle(document.documentElement).getPropertyValue("--antic").trim();
const prata = getComputedStyle(document.documentElement).getPropertyValue("--prata").trim();
const orange = getComputedStyle(document.documentElement).getPropertyValue("--orange").trim();
const black = getComputedStyle(document.documentElement).getPropertyValue("--black").trim();
const beige = getComputedStyle(document.documentElement).getPropertyValue("--beige").trim();
const green = getComputedStyle(document.documentElement).getPropertyValue("--green").trim();
const blue = getComputedStyle(document.documentElement).getPropertyValue("--blue").trim();

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
    .style("font-size", "14px")
    .style("line-height", "1.5")
    .style("max-width", "200px");

export function renderPictorial() {
    d3.select("#pictorial svg").remove();

    const screenWidth = window.innerWidth;
    const isPortrait = false;
    if(screenWidth <= "978px" && window.matchMedia('(orientation: portrait)'))
        isPortrait = true;

    const margin = { top: 70, right: 100, bottom: 0, left: (isPortrait ? 85 : 100) };
    const width = (isPortrait ? 300 : 500) - margin.left - margin.right;
    const height = (isPortrait ? 230 : 300) - margin.top - margin.bottom;

    const unitSize = (isPortrait ? 10 : 12);
    const unitSpacing = (isPortrait ? 10 : 15);
    const maxPerRow = 15;

    return d3.csv("data/csv/cleaned/pictorial.csv").then(data => {
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

        const title = svg.append('text')
            .attr('x', width / 2)
            .attr('y', -30)
            .attr("text-anchor", "middle")
            .style("font-family", antic)
            .style("font-size", "1rem")
            .style("font-weight", "bold");

        if (isPortrait) {
            title.append("tspan")
                .attr("x", width / 2)
                .attr("dy", 0)
                .text("Countries with highest death rate");

            title.append("tspan")
                .attr("x", width / 2)
                .attr("dy", "1.2em")
                .text("due to drugs in 2021");
        } else
            title.text("Countries with highest death rate due to drugs in 2021");

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
            .style("font-size", (isPortrait ? "10" : "30") + "px")
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
                .attr("x", (u, i) => (i % maxPerRow) * (unitSize + (isPortrait ? 5 : 15)))
                .attr("y", (u, i) => Math.floor(i / maxPerRow) * (unitSize + unitSpacing) + unitSize * 0.75)
                .text("man_2")
                .style("font-family", '"Material Symbols Outlined"')
                .style("font-size", (isPortrait ? "20" : "30") + "px")
                .style("fill", colorScale(d.Entity))
                .style("opacity", 0)
                .attr("transform", "scale(0)");

            allIcons.push(icons);
        });

        svg.node()._allIcons = allIcons;
        return allIcons;
    });
};

let resizeTimeout;

window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        renderPictorial();
    }, 200);
});
