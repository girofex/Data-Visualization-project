import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const antic = getComputedStyle(document.documentElement).getPropertyValue("--antic").trim();
const prata = getComputedStyle(document.documentElement).getPropertyValue("--prata").trim();
const black = getComputedStyle(document.documentElement).getPropertyValue("--black").trim();
const orange = getComputedStyle(document.documentElement).getPropertyValue("--orange").trim();
const beige = getComputedStyle(document.documentElement).getPropertyValue("--beige").trim();

const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "fixed")
    .style("opacity", 0)
    .style("background-color", beige)
    .style("border", `1px solid ${black}`)
    .style("padding", "10px")
    .style("z-index", "999")
    .style("pointer-events", "none")
    .style("font-family", prata)
    .style("font-size", "14px")
    .style("line-height", "1.5")
    .style("max-width", "200px");

//Nodes
const nodes = [
    { id: "Pablo Escobar", level: "Direct", organization: "Medellín Cartel", role: "Founder & Leader" },
    { id: "Gustavo Gaviria", level: "Direct", organization: "Medellín Cartel", role: "Cousin & Chief Financier" },
    { id: "Carlos Lehder", level: "High", organization: "Medellín Cartel", role: "Co-founder & Trafficker" },
    { id: "José Rodríguez Gacha", level: "High", organization: "Medellín Cartel", role: "Co-founder & Capo" },
    { id: "Jorge Luis Ochoa Vásquez", level: "High", organization: "Medellín Cartel", role: "Founder & Capo" },
    { id: "Fabio Ochoa Vásquez", level: "High", organization: "Medellín Cartel", role: "Founder & Capo" },
    { id: "Juan David Ochoa Vásquez", level: "High", organization: "Medellín Cartel", role: "Founder & Capo" },
    { id: "Armando Alberto Prisco", level: "Medium", organization: "Los Priscos", role: "Affiliate & Group Leader" },
    { id: "Eneas Prisco", level: "Medium", organization: "Los Priscos", role: "Affiliate" },
    { id: "José Rodolfo Prisco", level: "Medium", organization: "Los Priscos", role: "Affiliate" },
    { id: "David Ricardo Prisco", level: "Medium", organization: "Los Priscos", role: "Affiliate" },
    { id: "Mario Alberto Castaño Molina", level: "Direct", organization: "Medellín Cartel", role: "Lieutenant & Chief of Security" },
    { id: "Leonidas Vargas", level: "Medium", organization: "Medellín Cartel", role: "Associate & Trafficker" }
];

//Links
const links = [
    { source: "Pablo Escobar", target: "Gustavo Gaviria" },
    { source: "Pablo Escobar", target: "Carlos Lehder" },
    { source: "Pablo Escobar", target: "José Rodríguez Gacha" },
    { source: "Pablo Escobar", target: "Jorge Luis Ochoa Vásquez" },
    { source: "Pablo Escobar", target: "Fabio Ochoa Vásquez" },
    { source: "Pablo Escobar", target: "Juan David Ochoa Vásquez" },
    { source: "Pablo Escobar", target: "Mario Alberto Castaño Molina" },
    { source: "Pablo Escobar", target: "Armando Alberto Prisco" },
    { source: "Pablo Escobar", target: "Leonidas Vargas" },
    { source: "Armando Alberto Prisco", target: "José Rodolfo Prisco" },
    { source: "Armando Alberto Prisco", target: "David Ricardo Prisco" },
    { source: "Armando Alberto Prisco", target: "Eneas Prisco" }
];

//Icons
const roleIcons = {
    "Founder & Leader": "workspace_premium",
    "Cousin & Chief Financier": "paid",
    "Co-founder & Trafficker": "local_shipping",
    "Founder & Capo": "star",
    "Co-founder & Capo": "star",
    "Lieutenant & Chief of Security": "security",
    "Affiliate & Group Leader": "star",
    "Affiliate": "link",
    "Associate & Trafficker": "local_shipping"
};

const color = d3.scaleOrdinal()
    .domain(["Medellín Cartel", "Los Priscos"])
    .range([orange, black]);

let chartCreated = false;

function render() {
    if (chartCreated)
        return;

    chartCreated = true;

    d3.select("#network svg").remove();

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    let isLandscape = false;
    if(screenWidth <= "2400px" && screenHeight <= "978px" && window.matchMedia('(orientation: landscape)').matches)
        isLandscape = true;

    const margin = { top: 0, right: 0, bottom: 0, left: 0 };
    const width = (isLandscape ? 450 : 550) - margin.left - margin.right;
    const height = (isLandscape ? 450 : 550) - margin.top - margin.bottom;

    const svg = d3.select("#network")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    svg.append('text')
        .attr('y', (isLandscape ? -200 : -240))
        .attr("text-anchor", "middle")
        .text("Hierarchy in the Medellín Cartel")
        .style("font-family", antic)
        .style("font-size", "1.5rem")
        .style("font-weight", "bold")
        .style("fill", black);

    const radius = d => ({ Direct: 40, High: 30, Medium: 20 }[d.level]);

    //Force simulation
    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance((isLandscape ? 150 : 170)))
        .force("charge", d3.forceManyBody().strength(100))
        .force("center", d3.forceCenter(0, 0))
        .force("collision", d3.forceCollide().radius(d => radius(d) + 5))
        .force("radial", radialForce)
        .force("cluster", clusterForce)
        .alpha(0)
        .stop();

    //Links
    const link = svg.selectAll(".link")
        .data(links)
        .join("line")
        .attr("class", "link")
        .attr("stroke", black)
        .attr("stroke-width", 1.5);

    //Nodes
    const node = svg.selectAll(".node")
        .data(nodes)
        .join("g")
        .attr("class", "node")
        .call(drag(simulation));

    node.append("circle")
        .attr("r", d => (isLandscape ? radius(d)-10 : radius(d)))
        .attr("fill", d => color(d.organization))
        .attr("opacity", 1)
        .attr("stroke", d => d.id === "Pablo Escobar" ? black : "none")
        .on("mouseover", function (event, d) {
            tooltip.html(`<strong>${d.id}</strong><br>${d.role} of ${d.organization}`)
                .style("opacity", 1);

            d3.select(this).attr("fill-opacity", 0.6);
        })
        .on("mousemove", function (event) {
            tooltip
                .style("left", (event.clientX + 10) + "px")
                .style("top", (event.clientY) + "px");
        })
        .on("mouseout", function () {
            tooltip.style("opacity", 0);
            d3.select(this).attr("fill-opacity", 1);
        });

    node.append("text")
        .text(d => roleIcons[d.role])
        .attr("class", "material-icons")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("dy", "0.25em")
        .style("font-size", d => (isLandscape ? radius(d) * 0.8 : radius(d) * 1.4))
        .style("fill", beige)
        .style("pointer-events", "none");

    simulation.on("tick", () => {
        link.attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node.attr("transform", d => `translate(${d.x}, ${d.y})`);
    });

    //Animation
    function startSimulation() {
        simulation.alpha(0.9).restart();
    }

    function radialForce(alpha) {
        const maxDistance = Math.min(width, height) / 2 - 50;
        nodes.forEach(d => {
            if (d.id === "Pablo Escobar") {
                d.fx = 0;
                d.fy = 0;
            }

            else {
                const levelDistance = { Direct: maxDistance * 0.2, High: maxDistance * 0.5, Medium: maxDistance * 0.8 };
                const dx = d.x, dy = d.y;

                const angle = Math.atan2(dy, dx);
                const targetX = levelDistance[d.level] * Math.cos(angle);
                const targetY = levelDistance[d.level] * Math.sin(angle);

                d.vx += (targetX - d.x) * 0.005 * alpha;
                d.vy += (targetY - d.y) * 0.005 * alpha;
            }
        });
    }

    function clusterForce(alpha) {
        const clusters = d3.groups(nodes, d => d.organization);
        clusters.forEach(([org, group]) => {
            const centroid = {
                x: d3.mean(group, d => d.x),
                y: d3.mean(group, d => d.y)
            };

            group.forEach(d => {
                d.vx += (centroid.x - d.x) * 0.05 * alpha;
                d.vy += (centroid.y - d.y) * 0.05 * alpha;
            });
        });
    }

    //Dragging
    function drag(simulation) {
        function dragstarted(event, d) {
            if (!event.active)
                simulation.alphaTarget(0.3).restart();
            d.fx = d.x; d.fy = d.y;
        }

        function dragged(event, d) {
            d.fx = event.x; d.fy = event.y;
        }

        function dragended(event, d) {
            if (!event.active)
                simulation.alphaTarget(0);
            d.fx = null; d.fy = null;
        }

        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    }


    const observer = new IntersectionObserver(
        ([entry], observer) => {
            if (entry.isIntersecting) {
                startSimulation();
                observer.unobserve(entry.target);
            }
        },
        {
            root: null,
            threshold: 0.8
        }
    );

    return observer
}

const networkSection = document.querySelector("#network");

if (networkSection) {
    render().observe(networkSection);
}

window.addEventListener("resize", () => {
    render();
});