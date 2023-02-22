let data;
let globalDataFilter = [];
let filterableVisualizations = [];

d3.csv('data/exoplanets.csv')
  .then(_data => {
	data = _data;
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
		d.filtered = false;
  	});

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

	dualBarchart = new DualBarchart({
		parentElement: '#dualbarchart',
		}, data, "st_spectype", "within_habitable_zone", "Dual Bar Chart", "Star Type", "# of Exoplanets");
	dualBarchart.updateVis(oninit=true);

	// https://d3-graph-gallery.com/graph/histogram_binSize.html
	drawHistogram(data.filter(d => d.sy_dist !== "BLANK"), "histogram", "Histogram", "Distance from Earth (pc)", "# of Exoplanets", 30)

	linechart = new LineChart({ parentElement: '#linechart'},
		data, "disc_year", "Line Chart", "Year", "# of Exoplanets Discovered");
    linechart.updateVis();
	
	scatterplot = new Scatterplot({ parentElement: '#scatterplot'},
		data, "pl_rade", "pl_bmasse","Scatter Plot", "Planet Radius (Earth Radius)", "Planet Mass (Earth Mass)");
	scatterplot.updateVis();

	table = new DataTable('#planetDataTable', data, ["pl_name", "st_spectype", "discoverymethod", "sy_dist", "sy_snum", "sy_pnum", "disc_year", "st_rad", "st_mass", "pl_rade", "pl_bmasse"]);
	

	filterableVisualizations = [barchart1, barchart2, barchart3, barchart4, dualBarchart, linechart, scatterplot, table]
})
.catch(error => {
    console.error('Error loading the data: ' + error);
});

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

function filterData() {
	if (globalDataFilter.length == 0) {
		filterableVisualizations.forEach(v => {
			v.data = data;
		})
	} else {
		filterableVisualizations.forEach(v => {
			v.data = data.map(d => {
				for (i in globalDataFilter){
					let attrFilter = globalDataFilter[i]
					if(!attrFilter[1].includes(d[attrFilter[0]])){
						return {...d, filtered: true}
					}
				}
				return {...d, filtered: false}
			})
		})
	}
	filterableVisualizations.forEach(v => {
		v.updateVis();
	})
}