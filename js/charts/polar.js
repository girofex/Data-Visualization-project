import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const antic = getComputedStyle(document.documentElement).getPropertyValue("--antic").trim();
const prata = getComputedStyle(document.documentElement).getPropertyValue("--prata").trim();
const black = getComputedStyle(document.documentElement).getPropertyValue("--black").trim();
const orange = getComputedStyle(document.documentElement).getPropertyValue("--orange").trim();
const beige = getComputedStyle(document.documentElement).getPropertyValue("--beige").trim();

let angleScale;
let radiusScale;

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

function render() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !container.dataset.animated) {
                container.dataset.animated = "true";

                chart.selectAll(".bar")
                    .transition()
                    .duration(1200)
                    .delay((d, i) => i * 15)
                    .attrTween("d", d => {
                        const interpolateRadius = d3.interpolate(innerRadius, radiusScale(d.value));
                        return t => d3.arc()
                            .innerRadius(innerRadius)
                            .outerRadius(interpolateRadius(t))
                            .startAngle(angleScale(d.year))
                            .endAngle(angleScale(d.year) + angleScale.bandwidth())
                            .padAngle(0.03)
                            .padRadius(innerRadius)();
                    });

                observer.unobserve(container);
            }
        });
    }, { threshold: 1 });

    d3.select("#polar svg").remove();

    const screenWidth = window.innerWidth;
    const margin = { top: 0, right: 0, bottom: 0, left: 0 };
    const width = (screenWidth <= 768 ? 300 : 500) - margin.left - margin.right;
    const height = (screenWidth <= 768 ? 300 : 500) - margin.top - margin.bottom;

    const innerRadius = screenWidth <= 768 ? 40 : 90;
    const outerRadius = Math.min(width, height) / 2 - 40;

    const container = document.querySelector("#polar");

    const svg = d3.select(container)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const chart = svg.append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

    d3.csv("data/csv/cleaned/polar.csv").then(data => {
        data.forEach(d => {
            d.year = +d.TIME_PERIOD;
            d.value = +d.OBS_VALUE;
        });

        angleScale = d3.scaleBand()
            .domain(data.map(d => d.year))
            .range([0, Math.PI * 2])
            .align(0);

        radiusScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.value)])
            .range([innerRadius, outerRadius]);


        chart.append("g")
            .selectAll("circle")
            .data(radiusScale.ticks(4).slice(1))
            .join("circle")
            .attr("r", d => radiusScale(d))
            .attr("fill", "none")
            .attr("stroke", black)
            .attr("stroke-opacity", 0.15);

        const arc = d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(innerRadius)
            .startAngle(d => angleScale(d.year))
            .endAngle(d => angleScale(d.year) + angleScale.bandwidth())
            .padAngle(0.03)
            .padRadius(innerRadius);

        chart.append("g")
            .selectAll("path")
            .data(data)
            .join("path")
            .attr("class", "bar")
            .attr("fill", d => d.year < 2022 ? black : orange)
            .attr("d", arc)
            .on("mouseover", function (event, d) {
                const formatEuropean = d3.format(",.2f");

                tooltip
                    .html(`<strong>Import in ${d.year}</strong>: ${formatEuropean(d.value).replace(".", ",")} million cubic metres`)
                    .style("opacity", 1);

                d3.select(this).attr("fill-opacity", 0.6);
            })
            .on("mousemove", event => {
                tooltip
                    .style("left", event.clientX + 10 + "px")
                    .style("top", event.clientY + "px");
            })
            .on("mouseout", function () {
                tooltip.style("opacity", 0);
                d3.select(this).attr("fill-opacity", 1);
            });

        chart.append("g")
            .selectAll("text")
            .data(data)
            .join("text")
            .attr("text-anchor", "middle")
            .attr("transform", d => {
                const angle = angleScale(d.year) + angleScale.bandwidth() / 2;
                const r = outerRadius + 18;
                return `
                rotate(${angle * 180 / Math.PI - 90})
                translate(${r},0)
                rotate(${angle > Math.PI ? 180 : 0})
            `;
            })
            .text(d => d.year)
            .style("font-family", antic)
            .style("font-size", "14px")
            .style("font-weight", "bold")
            .style("fill", black);

        observer.observe(container);
    })
};

render();

window.addEventListener("resize", () => {
    render();
});