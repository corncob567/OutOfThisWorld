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

		d.st_spectype = d.st_spectype.charAt(0).toUpperCase() // only get type letter (A, F, G, K, N)

      	d.within_habitable_zone = isInHabitableZone(d.st_spectype, d.pl_orbsmax);
  	});

	//data.filter(d => d.within_habitable_zone === true) // Returns the exoplanets that are habitable
	//console.log(data);

	let counts = getCounts(data);
	console.log(counts);
  	drawBarChart(counts[0], "barchart1", "Bar Chart 1", "Number of Stars", "# of Exoplanets");
	drawBarChart(counts[1], "barchart2", "Bar Chart 2", "Number of Planets", "# of Exoplanets");
	drawBarChart(counts[2], "barchart3", "Bar Chart 3", "Type", "# of Exoplanets");
	drawBarChart(counts[3], "barchart4", "Bar Chart 4", "Discovery Method", "# of Exoplanets", 110);
	drawGroupedBarChart(counts[4], "barchart5", "Bar Chart 5", "Type", "# of Exoplanets");
	// https://d3-graph-gallery.com/graph/histogram_basic.html - Use this for histogram eventually

})
.catch(error => {
    console.error('Error loading the data: ' + error);
});

// https://d3-graph-gallery.com/graph/barplot_basic.html
function drawBarChart(counts, svgId, title, xLabel, yLabel, XAxisLabelHeight = 20){
	// Margin object with properties for the four directions
	const margin = {top: 30, right: 30, bottom: 20, left: 50};

	// Width and height as the inner dimensions of the chart area
	const width = 375 - margin.left - margin.right;
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
	svg.selectAll("rect")
    .data(counts)
	.enter()
    .append("rect")
    .attr("x", function(d) { return x(d.k);})
    .attr("width", x.bandwidth())
    .attr("y", function(d) { return y(d.frequency);})
    .attr("height", function(d) {
		return height- XAxisLabelHeight - y(d.frequency);
    })
	.attr("fill", "#69b3a2");

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
	// Margin object with properties for the four directions
	const margin = {top: 30, right: 30, bottom: 20, left: 50};

	// Width and height as the inner dimensions of the chart area
	const width = 375 - margin.left - margin.right;
	const height = 412 - margin.top - margin.bottom;
	const titleheight = 30
	const YAxisLabelWidth = 20

	const svg = d3.select('#' + svgId).append('svg')
	    .attr('width', width + margin.left + margin.right)
	    .attr('height', height + margin.top + margin.bottom)
	    .append('g')
	    .attr('transform', `translate(${margin.left}, ${margin.top})`);
	
	let subgroups = ["Habitable", "Inhabitable"]

	// List of groups = value of the first column called group -> show them on the X axis
	//let groups = d3.map(data, function(d){return(d.group)}).keys()
	let groups = data.map(d => d.specType);
  
	// Add X axis
	let x = d3.scaleBand()
	  .domain(groups) //.domain(counts.map(c => c.k))
	  .range([0, width])
	  .padding(0.2)
	  svg.append("g")
	  .attr("transform", "translate(0," + (height - XAxisLabelHeight) + ")")
	  .call(d3.axisBottom(x).tickSize(0))
	  .selectAll("text")
	  .attr("transform", "translate(-10,0)rotate(-45)")
	  .style("text-anchor", "end");

	let maxFreq = Math.max(...data.map(d => d.inhabitable))

	// Add Y axis
	let y = d3.scaleLinear()
	  .domain([0, maxFreq])
	  .range([ height - XAxisLabelHeight, titleheight]);
	  svg.append("g")
	  .call(d3.axisLeft(y))
	  .attr("transform", "translate(" + YAxisLabelWidth + ", 0)");
  
	// Another scale for subgroup position
	let xSubgroup = d3.scaleBand()
	  .domain(subgroups)
	  .range([0, x.bandwidth()])
	  .padding([0.05])
  
	// color palette = one color per subgroup
	let color = d3.scaleOrdinal()
	  .domain(subgroups)
	  .range(['#e41a1c','#377eb8'])
  
	// Show the bars
	svg.append("g")
	  .selectAll("g")
	  // Enter in data = loop group per group
	  .data(data)
	  .enter()
	  .append("g")
		.attr("transform", function(d) { return "translate(" + x(d.specType) + ", 0)"; })
	  .selectAll("rect")
	  .data(function(d) { return subgroups.map(function(d) { return {specType: d.specType, value: d.habitable}; }); })
	  .enter().append("rect")
		.attr("x", function(d) { return xSubgroup(d.specType); })
		.attr("y", function(d) { return y(d.value); })
		.attr("width", xSubgroup.bandwidth())
		.attr("height", function(d) { return height - y(d.value); })
		.attr("fill", function(d) { return color(d.specType); });

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
		case 'N':
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

	let relevantSpecTypes = ['A', 'F', 'G', 'K', 'M']

	data.forEach(d => {
		starCounts[d.sy_snum] = (starCounts[d.sy_snum] || 0) + 1;
		planetCounts[d.sy_pnum] = (planetCounts[d.sy_pnum] || 0) + 1;
		if (d.st_spectype === "A" || d.st_spectype === "F"|| d.st_spectype === "G" || d.st_spectype === "K" || d.st_spectype === "M") {
			typeCounts[d.st_spectype] = (typeCounts[d.st_spectype] || 0) + 1;
			if (d.within_habitable_zone === true){
				typeHabitableCounts[d.st_spectype] = (typeHabitableCounts[d.st_spectype] || 0) + 1;
			}else{
				typeInHabitableCounts[d.st_spectype] = (typeInHabitableCounts[d.st_spectype] || 0) + 1;
			}
		}
		discMethod[d.discoverymethod] = (discMethod[d.discoverymethod] || 0) + 1;
	});

	
	let counts = [starCounts, planetCounts, typeCounts, discMethod];
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