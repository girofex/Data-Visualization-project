import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const antic = getComputedStyle(document.documentElement).getPropertyValue("--antic").trim();
const prata = getComputedStyle(document.documentElement).getPropertyValue("--prata").trim();
const orange = getComputedStyle(document.documentElement).getPropertyValue("--orange").trim();

var margin = { top: 70, right: 5, bottom: 70, left: 30 },
    width = 500 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

export function renderAreaChart() {
    d3.csv("data/csv/cleaned/drug_deaths_cleaned.csv").then(data => {
        data.forEach(d => {
            d.Year = +d.Year;
            d.DeathRate = +d.DeathRate;
        });

        var svg = d3.select("#area")
            .attr("data-animate", "false")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        svg.append('text')
            .attr('x', width / 2)
            .attr('y', -30)
            .attr("text-anchor", "middle")
            .text("Mean number of people every 100k that die for drug use")
            .style("font-family", antic)
            .style("font-size", "1rem")
            .style("font-weight", "bold");

        //X axis
        var x = d3.scaleLinear()
            .domain(d3.extent(data, d => d.Year))
            .range([0, width]);

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).tickFormat(d3.format("d")))
            .selectAll("text")
            .style("font-family", prata)
            .style("font-size", "12px");

        svg.append("text")
            .attr("x", width / 2 - 11)
            .attr("y", height + 50)
            .attr("text-anchor", "middle")
            .style("font-family", antic)
            .style("font-weight", "bold")
            .text("Timeline");

        //Y axis
        var y = d3.scaleLinear()
            .domain([0, 1.5])
            .range([height, 0]);

        svg.append("g")
            .call(d3.axisLeft(y))
            .selectAll("text")
            .style("font-family", prata)
            .style("font-size", "12px");

        //Area
        const clip = svg.append("defs")
            .append("clipPath")
            .attr("id", "clip-area");

        const clipRect = clip.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 0)
            .attr("height", height);

        svg.append("path")
            .datum(data)
            .attr("class", "area")
            .attr("fill", orange)
            .attr("clip-path", "url(#clip-area)")
            .attr("d", d3.area()
                .x(d => x(d.Year))
                .y0(y(0))
                .y1(d => y(d.DeathRate))
            );

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.dataset.animated) {
                    entry.target.dataset.animated = "true";

                    clipRect
                        .transition()
                        .duration(2500)
                        .ease(d3.easeSin)
                        .attr("width", width);

                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 1 });

        observer.observe(d3.select("#area svg").node());
    });
}