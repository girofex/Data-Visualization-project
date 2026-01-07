import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const antic = getComputedStyle(document.documentElement).getPropertyValue("--antic").trim();
const prata = getComputedStyle(document.documentElement).getPropertyValue("--prata").trim();
const black = getComputedStyle(document.documentElement).getPropertyValue("--black").trim();
const orange = getComputedStyle(document.documentElement).getPropertyValue("--orange").trim();
const beige = getComputedStyle(document.documentElement).getPropertyValue("--beige").trim();

var margin = { top: 30, right: 150, bottom: 30, left: 150 },
    width = 1400 - margin.left - margin.right,
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
    .style("font-size", "14px")
    .style("line-height", "1.5")
    .style("max-width", "200px");

const data = [
    {
        label: 'UN partition plan', year: 1947, description: 'The General Assembly of the UN partitioned Palestine \
        into an Arab state, a Jewish state (old Israel) and the City of Jerusalem.<br/> \
        Zionists however were not satisfied and they started the Palestine War to expand their borders.<br/> \
        This led to the creation of the State of Israel.' },
    {
        label: 'Suez Crisis', year: 1956, description: 'Israel occupied the Gaza Strip and exiled the All-Palestine Government, \
        leading to the creation of the Palestine Liberation Organization (PLO).' },
    {
        label: 'Six-Day War', year: 1967, description: 'Israel occupied Palestinian areas, while the PLO \
        was unable to establish control.<br/> \
        The international community tried to resolve the conflict by establishing the independent Palestinian state \
        in the West Bank and Gaza.' },
    {
        label: 'Yom Kippur War', year: 1973, description: 'A coalition of Arab forces attacked Israel.<br/> \
        Following the end of the war and the victory of Israel, the UN initiated the Middle East \
        peace process: the accords, among the rest, proposed the creation of a Self-Governing Authority \
        for the Arab population in the West Bank and Gaza Strip under Israeli control.' },
    {
        label: 'Lebanon War', year: 1982, description: 'Palestinian militants continued to launch attacks against Israel \
        while also battling opponents within Lebanon.<br/> \
        Israel tried to resolve the Palestinian issue by dismantling the PLO in Lebanon.' },
    {
        label: 'First Intifada', year: 1987, description: 'The first Palestinian uprising, consisting of nonviolent acts \
        of civil disobedience and protest.<br/> \
        This led to a relocation of the PLO into the West Bank and Gaza Strip, establishing the Palestinian National Authority \
        and the initiation of a peace process.<br/> \
        Following hundreds of casualties and a wave of anti-government propaganda, Israeli Prime Minister Rabin was assassinated.' },
    {
        label: 'Second Intifada', year: 2000, description: 'After many years of unsuccessful negotiations, the Second Intifada erupted.<br/> \
        Israel and its Supreme Court declared the end of the occupation.<br/> \
        However, many international bodies continued to consider Israel to be the occupying power of the Gaza Strip \
        as it controlled its airspace, territorial waters and the movement of people or goods by air or sea.' },
    {
        label: 'Fatah–Hamas split', year: 2006, description: 'Hamas won a plurality in the Palestinian parliamentary election, and Israel \
        responded with economic sanctions to push for the recognition of Israel\'s right to exist.<br/> \
        Amidst Hamas refusal, internal political struggles led to the Battle of Gaza.<br/> \
        After Hamas victory, the tension with Israel increased.<br/> \
        The UN upgraded <i>Palestine (represented by PLO)</i> to the non-member observer <i>State of Palestine</i>.' },
    {
        label: 'October 7 attacks', year: 2023, description: 'Hamas planned a surprise attack against Israeli population: \
        this resulted into many fatalities and hostages.<br/> \
        Israel responded by declaring war.<br/> \
        A war that is continuing as of now.' }
];

const svg = d3.select('#timeline')
    .append('svg')
    .attr("data-animate", "false")
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

const xScale = d3.scaleLinear()
    .domain([1947, 2023])
    .range([0, width]);

//Line
svg.append('line')
    .attr("class", "arrow")
    .attr('x1', -40)
    .attr('y1', height / 2)
    .attr('x2', width + 4)
    .attr('y2', height / 2)
    .attr('stroke', black)
    .attr('stroke-width', 2)
    .each(function () {
        const totalLength = this.getTotalLength();

        d3.select(this)
            .attr("stroke-dasharray", totalLength)
            .attr("stroke-dashoffset", totalLength);
    });

//Arrow
svg.append('path')
    .attr('d', `M ${width + 40} ${height / 2} l -10 -6 l 0 12 Z`)
    .attr('fill', black);

data.forEach((d, i) => {
    const x = xScale(d.year);
    const isUp = i % 2 === 0;

    const lineEndY = isUp ? 0 : height;
    const boxY = isUp ? 0 : height;

    //Circle
    svg.append('circle')
        .attr('cx', x)
        .attr('cy', height / 2)
        .attr('r', 25)
        .attr('fill', beige)
        .attr('stroke', black)
        .attr('stroke-width', 1);

    //Year label
    svg.append('text')
        .attr('x', x)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-family', antic)
        .attr('font-weight', 'bold')
        .attr('font-size', '14px')
        .attr('fill', black)
        .text(d.year);

    //Dotted line
    svg.append('line')
        .attr('x1', x)
        .attr('y1', height / 2 + (isUp ? -25 : 25))
        .attr('x2', x)
        .attr('y2', lineEndY)
        .attr('stroke', black)
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '4,4');

    const boxGroup = svg.append('g')
        .attr('transform', `translate(${x}, ${boxY})`);

    //Box
    boxGroup.append('rect')
        .datum(d)
        .attr('x', -70)
        .attr('y', -20)
        .attr('width', 140)
        .attr('height', 40)
        .attr('fill', orange);

    boxGroup.append('text')
        .attr('x', 0)
        .attr('y', 5)
        .attr('text-anchor', 'middle')
        .attr('font-weight', 'bold')
        .attr('font-size', '14px')
        .attr('font-family', prata)
        .attr('fill', beige)
        .attr('pointer-events', 'none')
        .text(d.label);

    //Tooltip
    boxGroup
        .datum(d)
        .on("mouseover", function (event, d) {
            tooltip.html(`${d.description}`)
                .style("opacity", 1);
            d3.select(this).select('rect').attr("fill-opacity", 0.6);
        })
        .on("mousemove", function (event) {
            tooltip
                .style("left", (event.clientX + 10) + "px")
                .style("top", (event.clientY) + "px");
        })
        .on("mouseout", function () {
            tooltip.style("opacity", 0);
            d3.select(this).select('rect').attr("fill-opacity", 1);
        });
});

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.animated) {
            entry.target.dataset.animated = "true";

            svg.selectAll(".arrow")
                .transition()
                .duration(2500)
                .ease(d3.easeSin)
                .attr("stroke-dashoffset", 0);

            observer.unobserve(entry.target);
        }
    });
}, { threshold: 1 });

observer.observe(d3.select("#timeline svg").node());