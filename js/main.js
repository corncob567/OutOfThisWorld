// https://en.wikipedia.org/wiki/List_of_Solar_System_objects_by_size
let ourSolarSystem = [
	{pl_name: "Mercury", pl_rade: 0.3829, pl_bmasse: 0.0553, color: "#ff0000", labelYOffset: 0, labelXOffset: 0},
	{pl_name: "Venus", pl_rade: 0.9499, pl_bmasse: 0.815, color: "#ff0000", labelYOffset: 0, labelXOffset: -50},
	{pl_name: "Earth", pl_rade: 1, pl_bmasse: 1, color: "#ff0000", labelYOffset: -10, labelXOffset: 0},
	{pl_name: "Mars", pl_rade: 0.5320, pl_bmasse: 0.107, color: "#ff0000", labelYOffset: 0, labelXOffset: 0},
	{pl_name: "Jupiter", pl_rade: 10.97, pl_bmasse: 317.83, color: "#ff0000", labelYOffset: 0, labelXOffset: 0},
	{pl_name: "Saturn", pl_rade: 9.140, pl_bmasse: 95.162, color: "#ff0000", labelYOffset: 0, labelXOffset: 0},
	{pl_name: "Uranus", pl_rade: 3.981, pl_bmasse: 14.536, color: "#ff0000", labelYOffset: 0, labelXOffset: 0},
	{pl_name: "Neptune", pl_rade: 3.865, pl_bmasse: 17.147, color: "#ff0000", labelYOffset: -10, labelXOffset: -70},
]

d3.csv('data/exoplanets.csv')
  .then(data => {
  	console.log('Data loading complete. Work with dataset.');
    data.forEach(d => {
		// Attributes with BLANK where there would normally be numerical values will return NaN
      	d.sy_snum = +d.sy_snum;
		d.sy_pnum = +d.sy_pnum;
		d.disc_year = +d.disc_year;
		d.pl_orbsmax = +d.pl_orbsmax;
		d.pl_rade = +d.pl_rade;
		d.pl_bmasse = +d.pl_bmasse;
		d.pl_orbeccen = +d.pl_orbeccen;
		d.st_rad = +d.st_rad;
		d.st_mass = +d.st_mass;
		d.sy_dist = +d.sy_dist;

		if(d.st_spectype !== "BLANK"){
			d.st_spectype = d.st_spectype.charAt(0).toUpperCase() // only get type letter (A, F, G, K, N)
		}else{
			d.st_spectype = "Unknown"
		}

      	d.within_habitable_zone = isInHabitableZone(d.st_spectype, d.pl_orbsmax);
  	});

	let counts = getCounts(data);
	console.log(counts)
	// console.log(planetsByStarCount)

  	//drawBarChart(counts[0], "barchart1", "Bar Chart 1", "Number of Stars", "# of Exoplanets");
	//drawBarChart(counts[1], "barchart2", "Bar Chart 2", "Number of Planets", "# of Exoplanets");
	//drawBarChart(counts[2], "barchart3", "Bar Chart 3", "Star Type", "# of Exoplanets");
	//drawBarChart(counts[3], "barchart4", "Bar Chart 4", "Discovery Method", "# of Exoplanets", 110);

	barchart1 = new Barchart({
		parentElement: '#barchart1',
		}, data, "sy_snum", "Bar Chart 1", "Number of Stars", "# of Exoplanets");
	barchart1.updateVis();

	barchart2 = new Barchart({
		parentElement: '#barchart2',
		}, data, "sy_pnum", "Bar Chart 2", "Number of Planets", "# of Exoplanets");
	barchart2.updateVis();

	barchart3 = new Barchart({
		parentElement: '#barchart3',
		}, data, "st_spectype", "Bar Chart 3", "Star Type", "# of Exoplanets");
	barchart3.updateVis();

	barchart4 = new Barchart({
		parentElement: '#barchart4',
		}, data, "discoverymethod", "Bar Chart 4", "Discovery Method", "# of Exoplanets", 110);
	barchart4.updateVis();

	drawGroupedBarChart(counts[5], "dualbarchart", "Dual Bar Chart", "Star Type", "# of Exoplanets");
	// https://d3-graph-gallery.com/graph/histogram_binSize.html
	drawHistogram(data.filter(d => d.sy_dist !== "BLANK"), "histogram", "Histogram", "Distance from Earth (pc)", "# of Exoplanets", 30)
	// https://d3-graph-gallery.com/graph/line_basic.html
	//drawLineChart(counts[4], "linechart", "Line Chart", "Year", "# of Exoplanets Discovered", 30)

	focusContextVis = new LineChart({ parentElement: '#linechart'}, counts[4], "Line Chart", "Year", "# of Exoplanets Discovered");
    focusContextVis.updateVis();

	// https://d3-graph-gallery.com/graph/scatter_basic.html
	drawScatterPlot(data.map(d => ({...d, color: "#69b3a2"})).filter(d => !isNaN(d.pl_bmasse) && !isNaN(d.pl_rade)).concat(ourSolarSystem), "scatterplot", "Scatter Plot", "Planet Radius (Earth Radius)", "Planet Mass (Earth Mass)", 30)
	drawTable(data, ["pl_name", "st_spectype", "discoverymethod", "sy_dist", "sy_snum", "sy_pnum", "disc_year", "st_rad", "st_mass", "pl_rade", "pl_bmasse"])
})
.catch(error => {
    console.error('Error loading the data: ' + error);
});

// https://d3-graph-gallery.com/graph/barplot_basic.html
function drawBarChart(counts, svgId, title, xLabel, yLabel, XAxisLabelHeight = 20){
	const margin = {top: 30, right: 30, bottom: 20, left: 50};

	const width = 300 - margin.left - margin.right;
	const height = 412 - margin.top - margin.bottom;
	const titleheight = 30
	const YAxisLabelWidth = 20

	const svg = d3.select('#' + svgId).append('svg')
	    .attr('width', width + margin.left + margin.right)
	    .attr('height', height + margin.top + margin.bottom)
	    .append('g')
	    .attr('transform', `translate(${margin.left}, ${margin.top})`)

	// X axis
	let x = d3.scaleBand()
	.range([ YAxisLabelWidth, width ])
	.domain(counts.map(c => c.k))
	.padding(0.2);
	svg.append("g")
	.attr("transform", "translate(0," + (height - XAxisLabelHeight) + ")")
	.call(d3.axisBottom(x))
	.selectAll("text")
	.attr("transform", "translate(-10,0)rotate(-45)")
	.style("text-anchor", "end");

	let maxFreq = Math.max(...counts.map(c => c.frequency))

	// Add Y axis
	let y = d3.scaleLinear()
	.domain([0, maxFreq])
	.range([ height - XAxisLabelHeight, titleheight]);
	svg.append("g")
	.call(d3.axisLeft(y))
	.attr("transform", "translate(" + YAxisLabelWidth + ", 0)");

	// Bars
	bars = svg.selectAll("rect")
    .data(counts)
	.enter()
    .append("rect")
	.attr('class', 'bar')
    .attr("x", function(d) { return x(d.k);})
    .attr("width", x.bandwidth())
    .attr("y", function(d) { return y(d.frequency);})
    .attr("height", function(d) {
		return height- XAxisLabelHeight - y(d.frequency);
    })
	.attr("fill", "#69b3a2");

	bars.on('mouseover', (event, d) => {
		d3.select('#tooltip')
		.style('display', 'block')
		.style('left', (event.pageX + 15) + 'px')   
		.style('top', (event.pageY + 15) + 'px')
		.html(`
			<div class="tooltip-title">${xLabel}: ${d.k}</div>
			<div class="tooltip-title">${yLabel}: ${d.frequency}</div>
		`);
	})
	.on('mouseleave', () => {
		d3.select('#tooltip').style('display', 'none');
	});

	// Title
	svg.append("text")
   .attr("x", width / 2)
   .attr("y", 10)
   .attr("text-anchor", "middle")
   .style("font-size", "24px")
   .text(title);

   // Y-Axis Label
   svg.append("text")
   .attr("transform", "rotate(-90)")
   .attr("x", -(height / 2))
   .attr("y", -30)
   .style("text-anchor", "middle")
   .text(yLabel);

   // X-Axis Label
   svg.append("text")
   .attr("transform", "translate(" + (width / 2) + " ," + (height + 15) + ")")
   .style("text-anchor", "middle")
   .text(xLabel);
}

function drawGroupedBarChart(data, svgId, title, xLabel, yLabel, XAxisLabelHeight = 20){
	const margin = {top: 30, right: 30, bottom: 20, left: 50};

	const width = 300 - margin.left - margin.right;
	const height = 412 - margin.top - margin.bottom;
	const titleheight = 30
	const YAxisLabelWidth = 20

	const svg = d3.select('#' + svgId).append('svg')
	    .attr('width', width + margin.left + margin.right)
	    .attr('height', height + margin.top + margin.bottom)
	    .append('g')
	    .attr('transform', `translate(${margin.left}, ${margin.top})`);
	
	let legend = svg.append("g")
	.attr("class", "legend")
	.attr('transform', 'translate(0,-10)')

	let colors = [["Habitable", "#395943"],
				  ["Uninhabitable", "#c09c9f"]];

	let legendRect = legend.selectAll('circle').data(colors);
	legendRect.enter()
		.append("circle")
		.attr("cx", width - 55)
		.attr("r", 6)
		.attr("width", 10)
		.attr("height", 10)
		.attr("cy", function(d, i) {
			return i * 20 + 3;
		})
		.style("fill", function(d) {
			return d[1];
		});
	
	let legendText = legend.selectAll('text').data(colors);
	legendText.enter()
		.append("text")
		.attr("font-size", 12)
		.attr("x", width - 45)
		.attr("y", function(d, i) {
			return i * 20 + 7;
		})
		.text(function(d) {
			return d[0];
		});

	let groups = data.map(d => d.specType);
  
	// Add X axis
	let x = d3.scaleBand()
	  .domain(groups)
	  .range([0, width])
	  .padding(0.2)
	  svg.append("g")
	  .attr("transform", "translate(20," + (height - XAxisLabelHeight) + ")")
	  .call(d3.axisBottom(x).tickSize(0))
	  .selectAll("text")
	  .attr("transform", "translate(0,0)rotate(-45)")
	  .style("text-anchor", "end");

	let maxFreq = Math.max(...data.map(d => d.inhabitable))

	// Add Y axis
	let y = d3.scaleLinear()
	  .domain([0, maxFreq])
	  .range([ height - XAxisLabelHeight, titleheight]);
	  svg.append("g")
	  .call(d3.axisLeft(y))
	  .attr("transform", "translate(" + YAxisLabelWidth + ", 0)");
  
	let multigraph = svg.selectAll("rect")
    					.data(data).enter() 

	// Bars
    multigraph.append("rect")
	.attr('class', 'bar')
	.attr('class', 'uninhabitableBar')
    .attr("x", function(d) { return x(d.specType);})
    .attr("width", x.bandwidth() / 2)
    .attr("y", function(d) { return y(d.inhabitable);})
    .attr("height", function(d) {
		return height- XAxisLabelHeight - y(d.inhabitable);
    })
	.attr("transform", "translate(" + 20 + "," + 0 + ")")
	.attr("fill", "#c09c9f");

	multigraph.append("rect")
	.attr('class', 'bar')
	.attr('class', 'habitableBar')
    .attr("x", function(d) { return x(d.specType);})
    .attr("width", x.bandwidth() / 2)
    .attr("y", function(d) { return y(d.habitable);})
    .attr("height", function(d) {
		return height- XAxisLabelHeight - y(d.habitable);
    })
	.attr("transform", "translate(" + 37 + "," + 0 + ")")
	.attr("fill", "#395943");

	svg.selectAll(".habitableBar").on('mouseover', (event, d) => {
		d3.select('#tooltip')
		.style('display', 'block')
		.style('left', (event.pageX + 15) + 'px')   
		.style('top', (event.pageY + 15) + 'px')
		.html(`
			<div class="tooltip-title">Habitable</div>
			<ul>
			<li>Star Type: ${d.specType}</li>
			<li># of Exoplanets: ${d.habitable}</li>
			</ul>
		`);
	})
	.on('mouseleave', () => {
		d3.select('#tooltip').style('display', 'none');
	});

	svg.selectAll(".uninhabitableBar").on('mouseover', (event, d) => {
		d3.select('#tooltip')
		.style('display', 'block')
		.style('left', (event.pageX + 15) + 'px')   
		.style('top', (event.pageY + 15) + 'px')
		.html(`
			<div class="tooltip-title">Uninhabitable</div>
			<ul>
			<li>Star Type: ${d.specType}</li>
			<li># of Exoplanets: ${d.inhabitable}</li>
			</ul>
		`);
	})
	.on('mouseleave', () => {
		d3.select('#tooltip').style('display', 'none');
	});

	// Title
	svg.append("text")
   .attr("x", width / 2 - 40)
   .attr("y", 10)
   .attr("text-anchor", "middle")
   .style("font-size", "24px")
   .text(title);

   // Y-Axis Label
   svg.append("text")
   .attr("transform", "rotate(-90)")
   .attr("x", -(height / 2))
   .attr("y", -30)
   .style("text-anchor", "middle")
   .text(yLabel);

   // X-Axis Label
   svg.append("text")
   .attr("transform", "translate(" + (width / 2) + " ," + (height + 15) + ")")
   .style("text-anchor", "middle")
   .text(xLabel);
}

function drawHistogram(data, svgId, title, xLabel, yLabel, XAxisLabelHeight = 20){
	const margin = {top: 30, right: 30, bottom: 20, left: 50};

	const width = 300 - margin.left - margin.right;
	const height = 412 - margin.top - margin.bottom;
	const titleheight = 30
	const YAxisLabelWidth = 20

	const svg = d3.select('#' + svgId).append('svg')
	    .attr('width', width + margin.left + margin.right)
	    .attr('height', height + margin.top + margin.bottom)
	    .append('g')
	    .attr('transform', `translate(${margin.left}, ${margin.top})`);

	let x = d3.scaleLinear()
		.domain([0, d3.max(data, function(d) { return +d.sy_dist })])
		.range([ YAxisLabelWidth, width ])
	svg.append("g")
		.attr("transform", "translate(0," + (height - XAxisLabelHeight) + ")")
		.call(d3.axisBottom(x))
		.selectAll("text")
		.attr("transform", "translate(-10,0)rotate(-45)")
		.style("text-anchor", "end");

	let y = d3.scaleLinear()
		.range([ height - XAxisLabelHeight, titleheight]);
	let yAxis = svg.append("g")
					.attr("transform", "translate(" + YAxisLabelWidth + ", 0)");

	// Builds the graph for a specific value of bin
	function update(nBin) {
		let histogram = d3.histogram()
			.value(function(d) { return d.sy_dist; })
			.domain(x.domain())
			.thresholds(x.ticks(nBin)); // # of bins

		let bins = histogram(data);

		// Y axis: update now that we know the domain
		y.domain([0, d3.max(bins, function(d) { return d.length; })]);
		yAxis
			.transition()
			.duration(1000)
			.call(d3.axisLeft(y));

		let u = svg.selectAll("rect")
			.data(bins)

		// Manage the existing bars and newly added ones
		u.join("rect")
			.attr('class', 'bar')
			.merge(u) // merge existing elements
			.transition() // apply changes to all of them
			.duration(1000)
				.attr("x", 1)
				.attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
				.attr("width", function(d) { return x(d.x1) - x(d.x0); })
				.attr("height", function(d) { return height - y(d.length) - XAxisLabelHeight })
				.style("fill", "#69b3a2")

			// If less bars exist in the new histogram, delete bars no longer in use
			u.exit().remove()
	
		svg.selectAll("rect").on('mouseover', (event, d) => {
			d3.select('#tooltip')
			.style('display', 'block')
			.style('left', (event.pageX + 15) + 'px')   
			.style('top', (event.pageY + 15) + 'px')
			.html(`
				<div class="tooltip-title">${xLabel}: ${d.x0}-${d.x1}</div>
                <div class="tooltip-title">${yLabel}: ${d.length}</div>
			`);
		})
		.on('mouseleave', () => {
			d3.select('#tooltip').style('display', 'none');
		});
	}

	// Initialize the histogram with 20 bins
	update(20)

	d3.select("#nBin").on("input", function() {
		update(+this.value);
	});

	// Title
	svg.append("text")
   .attr("x", width / 2 - 80)
   .attr("y", 10)
   .attr("text-anchor", "middle")
   .style("font-size", "24px")
   .text(title);

   // Y-Axis Label
   svg.append("text")
   .attr("transform", "rotate(-90)")
   .attr("x", -(height / 2))
   .attr("y", -30)
   .style("text-anchor", "middle")
   .text(yLabel);

   // X-Axis Label
   svg.append("text")
   .attr("transform", "translate(" + (width / 2) + " ," + (height + 15) + ")")
   .style("text-anchor", "middle")
   .text(xLabel);
}

function drawScatterPlot(data, svgId, title, xLabel, yLabel, XAxisLabelHeight = 20){
	const margin = {top: 30, right: 30, bottom: 20, left: 50};

	const width = 600 - margin.left - margin.right;
	const height = 412 - margin.top - margin.bottom;
	const titleheight = 30
	const YAxisLabelWidth = 20

	const svg = d3.select('#' + svgId).append('svg')
	    .attr('width', width + margin.left + margin.right)
	    .attr('height', height + margin.top + margin.bottom)
	    .append('g')
	    .attr('transform', `translate(${margin.left}, ${margin.top})`);

	// X axis
	let x = d3.scaleLog()
	.range([ YAxisLabelWidth, width ])
	.domain(d3.extent(data, function(d) { return d.pl_rade; }));
	svg.append("g")
	.attr("transform", "translate(0," + (height - XAxisLabelHeight) + ")")
	.call(d3.axisBottom(x))
	.selectAll("text")
	.attr("transform", "translate(-10,0)rotate(-45)")
	.style("text-anchor", "end");

	// Add Y axis
	let y = d3.scaleLog()
	.domain(d3.extent(data, function(d) { return d.pl_bmasse; }))
	.range([ height - XAxisLabelHeight, titleheight]);
	svg.append("g")
	.call(d3.axisLeft(y))
	.attr("transform", "translate(" + YAxisLabelWidth + ", 0)");

	// Add dots
	let scatterplotcircles = svg.append('g')
	.selectAll("dot")
	.data(data)
	.join("circle")
	.attr("cx", function (d) { return x(d.pl_rade); } )
	.attr("cy", function (d) { return y(d.pl_bmasse); } )
	.attr("r", 4)
	.style("fill", function (d) { return d.color; })

	// Title
	svg.append("text")
	.attr("x", width / 2)
	.attr("y", 10)
	.attr("text-anchor", "middle")
	.style("font-size", "24px")
	.text(title);

	// Y-Axis Label
	svg.append("text")
	.attr("transform", "rotate(-90)")
	.attr("x", -(height / 2))
	.attr("y", -30)
	.style("text-anchor", "middle")
	.text(yLabel);

	// X-Axis Label
	svg.append("text")
	.attr("transform", "translate(" + (width / 2) + " ," + (height + 15) + ")")
	.style("text-anchor", "middle")
	.text(xLabel);

	// Labels for planets in our solar system
	svg.append('g')
	.selectAll("text")
	.data(data.filter(d => d.color === "#ff0000"))
	.enter()
	.append("text")
	.attr("class", "solarSystemLabel")
	.attr("x", function (d) { return x(d.pl_rade) + 5 + d.labelXOffset; } )
	.attr("y", function (d) { return y(d.pl_bmasse) + 10 + d.labelYOffset; } )
	.attr("font-weight", 600)
	.text(function (d) { return d.pl_name; });

	// Tooltip event listeners
    scatterplotcircles
        .on('mouseover', (event, d) => {
			d3.select('#tooltip')
			.style('display', 'block')
			.style('left', (event.pageX + 15) + 'px')   
			.style('top', (event.pageY + 15) + 'px')
			.html(`
				<div class="tooltip-title">${d.pl_name}</div>
				<ul>
				<li>Earth Radius: ${d.pl_rade}</li>
				<li>Earth Mass: ${d.pl_bmasse}</li>
				</ul>
			`);
        })
        .on('mouseleave', () => {
			d3.select('#tooltip').style('display', 'none');
        });
}

function drawTable(data, columns) {
	let table = d3.select('#planetDataTable').append('table')
	let thead = table.append('thead')
	let	tbody = table.append('tbody');

	// append the header row
	thead.append('tr')
	  .selectAll('th')
	  .data(columns).enter()
	  .append('th')
	  .text(function (column) { return column; });

	// create a row for each object in the data
	let rows = tbody.selectAll('tr')
	  .data(data)
	  .enter()
	  .append('tr');

	// create a cell in each row for each column
	let cells = rows.selectAll('td')
	  .data(function (row) {
	    return columns.map(function (column) {
	      return {column: column, value: row[column]};
	    });
	  })
	  .enter()
	  .append('td')
	    .text(function (d) { return d.value; });

  return table;
}

function isInHabitableZone(specType, plOrbsMax){
	let isHabitable = false
	switch (specType) {
		case 'A':
			isHabitable = (plOrbsMax >= 8.5 && plOrbsMax <= 12.5) ? true : false;
			return isHabitable
		case 'F':
			isHabitable = (plOrbsMax >= 1.5 && plOrbsMax <= 2.2) ? true : false;
			return isHabitable
		case 'G':
			isHabitable = (plOrbsMax >= 0.95 && plOrbsMax <= 1.4) ? true : false;
			return isHabitable
		case 'K':
			isHabitable = (plOrbsMax >= 0.38 && plOrbsMax <= 0.56) ? true : false;
			return isHabitable
		case 'M':
			isHabitable = (plOrbsMax >= 0.08 && plOrbsMax <= 0.12) ? true : false;
			return isHabitable
		default:
		  return false
	  }
}

// Used to sort by a property value. Currently sorts in descending order by frequency.
function compare(a, b) {
	if (a.frequency < b.frequency){
		return 1;
	}
	if (a.frequency > b.frequency){
		return -1;
	}
	return 0;
}
  
function convertDictToArray(dict){
	let arr = [];
	for(const [key, value] of Object.entries(dict)) {
		const obj = {
			k: key,
			frequency: value
		  };
		  arr.push(obj);
	}
	arr.sort(compare);
	return arr;
}

function getCounts(data) {
	let starCounts = {};
	let planetCounts = {};
	let typeCounts = {};
	let discMethod = {};
	let typeHabitableCounts = {};
	let typeInHabitableCounts = {};
	let discoveriesByYearCounts = {};

	let relevantSpecTypes = ['A', 'F', 'G', 'K', 'M']

	data.forEach(d => {
		starCounts[d.sy_snum] = (starCounts[d.sy_snum] || 0) + 1;
		planetCounts[d.sy_pnum] = (planetCounts[d.sy_pnum] || 0) + 1;
		if (d.st_spectype === "A" || d.st_spectype === "F"|| d.st_spectype === "G" || d.st_spectype === "K" || d.st_spectype === "M" || d.st_spectype === "Unknown") {
			typeCounts[d.st_spectype] = (typeCounts[d.st_spectype] || 0) + 1;
			if(d.st_spectype !== "Unknown"){
				if (d.within_habitable_zone === true){
					typeHabitableCounts[d.st_spectype] = (typeHabitableCounts[d.st_spectype] || 0) + 1;
				}else{
					typeInHabitableCounts[d.st_spectype] = (typeInHabitableCounts[d.st_spectype] || 0) + 1;
				}
			}
		}
		discMethod[d.discoverymethod] = (discMethod[d.discoverymethod] || 0) + 1;
		discoveriesByYearCounts[d.disc_year] = (discoveriesByYearCounts[d.disc_year] || 0) + 1;
	});	
	
	let counts = [starCounts, planetCounts, typeCounts, discMethod, discoveriesByYearCounts];
	let countArrays = [];
	counts.forEach(c => {
		countArrays.push(convertDictToArray(c));
	});
	
	let combinedHabitableCounts = []
	relevantSpecTypes.forEach(type => {
		let object = {specType: type, habitable: typeHabitableCounts[type], inhabitable: typeInHabitableCounts[type]}
		combinedHabitableCounts.push(object);
	});
	countArrays.push(combinedHabitableCounts)

	return countArrays;
};