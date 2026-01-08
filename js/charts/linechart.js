import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { annotation, annotationLabel } from "https://cdn.jsdelivr.net/npm/d3-svg-annotation@2.5.1/+esm";

const antic = getComputedStyle(document.documentElement).getPropertyValue("--antic").trim();
const prata = getComputedStyle(document.documentElement).getPropertyValue("--prata").trim();
const black = getComputedStyle(document.documentElement).getPropertyValue("--black").trim();
const orange = getComputedStyle(document.documentElement).getPropertyValue("--orange").trim();
const green = getComputedStyle(document.documentElement).getPropertyValue("--green").trim();

const parseDate = d3.timeParse("%Y-%m-%d");

export function renderLineChart() {
    d3.select("#linechart svg").remove();

    const screenWidth = window.innerWidth;
    const margin = { top: 80, right: 130, bottom: 60, left: 130 };
    const width = (screenWidth <= 767 ? 700 : 1200) - margin.left - margin.right;
    const height = 550 - margin.top - margin.bottom;

    const svgRoot = d3.select("#linechart")
        .append("svg")
        .attr("data-animate", "false")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    const svg = svgRoot.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    d3.csv("data/csv/cleaned/linechart.csv").then(data => {
        data.forEach(d => {
            d.Week = parseDate(d.Week);
            d.RussianUkranianWar = +d.RussianUkranianWar;
            d.IsraeliPalestinianWar = +d.IsraeliPalestinianWar;
            d.DrugWar = +d.DrugWar;
        });

        const keys = ["RussianUkranianWar", "IsraeliPalestinianWar", "DrugWar"];

        const datasets = keys.map(k => ({
            name: k,
            data: data.map(d => ({
                Week: d.Week,
                value: d[k]
            }))
        }));

        const colorScale = d3.scaleOrdinal()
            .domain(keys)
            .range([black, orange, green]);

        //X axis
        const x = d3.scaleTime()
            .domain(d3.extent(data, d => d.Week))
            .range([0, width]);

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).ticks(7))
            .selectAll("text")
            .style("font-family", prata)
            .style("font-size", "12px");

        svg.append("text")
            .attr("x", width / 2 + 3)
            .attr("y", height + 55)
            .attr("text-anchor", "middle")
            .style("font-family", antic)
            .style("font-weight", "bold")
            .text("Timeline");

        //Y axis
        const y = d3.scaleLinear()
            .domain([
                0,
                d3.max(datasets, d => d3.max(d.data, p => p.value))
            ])
            .nice()
            .range([height, 0]);

        svg.append("g")
            .call(d3.axisLeft(y).tickFormat(d => d3.format(",")(d).replace(/,/g, ".")))
            .selectAll("text")
            .style("font-family", prata)
            .style("font-size", "12px");

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -80)
            .attr("x", -height / 2)
            .attr("text-anchor", "middle")
            .style("font-family", antic)
            .style("font-weight", "bold")
            .text("Interest Index");

        //Lines
        const lineGen = d3.line()
            .x(d => x(d.Week))
            .y(d => y(d.value));

        const groups = svg.selectAll(".area-line")
            .data(datasets)
            .join("g")
            .attr("class", "area-line");

        groups.append("path")
            .attr("class", "line")
            .attr("data-region", d => d.name)
            .attr("d", d => lineGen(d.data))
            .attr("fill", "none")
            .attr("stroke", d => colorScale(d.name))
            .attr("stroke-width", 2.5)
            .style("cursor", "pointer")
            .each(function () {
                const totalLength = this.getTotalLength();

                d3.select(this)
                    .attr("stroke-dasharray", totalLength)
                    .attr("stroke-dashoffset", totalLength);
            })
            .on("click", handleToggle);

        //Labels
        let labels = datasets.map(d => {
            const lastPoint = [...d.data].reverse().find(p => p.value != null);

            return {
                name: d.name,
                color: colorScale(d.name),
                x: x(lastPoint.Week),
                y: y(lastPoint.value),
                origY: y(lastPoint.value)
            };
        });

        const minSpacing = 20;
        const maxIter = 10;

        labels.sort((a, b) => a.y - b.y);

        for (let k = 0; k < maxIter; k++) {
            for (let i = 1; i < labels.length; i++) {
                const diff = labels[i].y - labels[i - 1].y;

                if (diff < minSpacing) {
                    const shift = (minSpacing - diff) / 2;
                    labels[i].y += shift;
                    labels[i - 1].y -= shift;
                }
            }

            labels.forEach(l => {
                l.y = Math.max(0, Math.min(height, l.y));
                l.x = width + 8;
            });
        }

        labels.forEach(l => {
            l.y += 15;
        });

        labels.forEach(l => {
            svg.append("text")
                .attr("data-region", l.name)
                .attr("x", l.x)
                .attr("y", l.y)
                .text((l.name).replace(/([a-z])([A-Z])/g, "$1 $2"))
                .style("font-family", antic)
                .style("font-size", "12px")
                .style("font-weight", "bold")
                .style("fill", l.color)
                .style("cursor", "pointer")
                .on("click", handleToggle);
        });

        //Opacity
        let activeRegion = null;

        function handleToggle() {
            const clicked = d3.select(this).attr("data-region");
            activeRegion = activeRegion === clicked ? null : clicked;

            svg.selectAll(".line, text[data-region]")
                .transition().duration(300)
                .style("opacity", function () {
                    const region = d3.select(this).attr("data-region");
                    return !activeRegion || region === activeRegion ? 1 : 0.2;
                });

            svg.selectAll(".annotation-group .annotation-connector, .annotation-group .annotation-connector-line, .annotation-group path")
                .transition().duration(300)
                .style("opacity", function () {
                    const region = d3.select(this).attr("data-region");

                    if (!activeRegion)
                        return 1;
                    if (activeRegion === "RussianUkranianWar")
                        return region === "IsraeliPalestinianWar" ? 0.2 : 1;
                    if (activeRegion === "IsraeliPalestinianWar")
                        return region === "RussianUkranianWar" ? 0.2 : 1;
                    if (activeRegion === "DrugWar")
                        return 0.2;

                    return 1;
                });
        }

        //Annotation
        const blackDataset = datasets[0];
        const redDataset = datasets[1];

        function findPeak(dataset) {
            return d3.max(dataset.data, d => d.value) === undefined
                ? null
                : dataset.data.reduce((a, b) => b.value > a.value ? b : a);
        }

        const blackPeak = findPeak(blackDataset);
        const redPeak = findPeak(redDataset);
        const notes = [];

        if (blackPeak) {
            notes.push({
                note: {
                    title: `Peak interest: ${blackPeak.value}`,
                    label: `After the Russian invasion in 2022`
                },
                x: x(blackPeak.Week),
                y: y(blackPeak.value),
                dx: 60,
                dy: -20,
                color: black,
                region: "RussianUkranianWar"
            });
        }

        if (redPeak) {
            notes.push({
                note: {
                    title: `Peak interest: ${redPeak.value}`,
                    label: `After the Gaza War started in 2023`
                },
                x: x(redPeak.Week),
                y: y(redPeak.value),
                dx: 60,
                dy: -20,
                color: orange,
                region: "IsraeliPalestinianWar"
            });
        }

        const makeAnnotations = annotation()
            .annotations(notes)
            .type(annotationLabel)
            .textWrap(150);

        const annotationGroup = svg.append("g")
            .attr("class", "annotation-group")
            .call(makeAnnotations)
            .style("font-family", prata)
            .style("font-size", "12px")
            .style("line-height", "1.5")
            .style("opacity", 0);

        annotationGroup.selectAll(".annotation")
            .each(function (d, i) {
                const region = notes[i].region;
                const group = d3.select(this);
                group.attr("data-region", region);
                group.selectAll(".annotation-connector, .annotation-connector-line, path")
                    .attr("data-region", region);
                group.selectAll(".annotation-note-label, .annotation-note-title")
                    .attr("data-region", region);
            });

        annotationGroup.selectAll(".annotation-note-label").each(function (d, i) {
            const title = d3.select(this);
            const color = title.style("fill");
            const bbox = this.getBBox();

            const x = bbox.x;
            const y = bbox.y + bbox.height + 11.5;
            const underlineLength = bbox.width + 10;

            const region = notes[i].region;

            d3.select(this.parentNode)
                .append("line")
                .attr("class", "annotation-connector")
                .attr("x1", x)
                .attr("x2", x + underlineLength)
                .attr("y1", y)
                .attr("y2", y)
                .attr("stroke", color)
                .attr("stroke-width", 1)
                .attr("data-region", region);
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.dataset.animated) {
                    entry.target.dataset.animated = "true";

                    svg.selectAll(".line")
                        .transition()
                        .duration(2500)
                        .ease(d3.easeSin)
                        .attr("stroke-dashoffset", 0);

                    annotationGroup
                        .transition()
                        .duration(800)
                        .delay(500)
                        .style("opacity", 1);

                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.9 });

        observer.observe(d3.select("#linechart svg").node());
    })
};

window.addEventListener("resize", () => {
    renderLineChart();
});