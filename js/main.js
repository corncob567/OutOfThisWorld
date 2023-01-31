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

		d.st_spectype = d.st_spectype.charAt(0) // only get type letter (A, F, G, K, N)

      	d.within_habitable_zone = isInHabitableZone(d.st_spectype, d.pl_orbsmax);
  	});

	//data.filter(d => d.within_habitable_zone === true) // Returns the exoplanets that are habitable
	console.log(data);

  	//drawChart(data); 

})
.catch(error => {
    console.error('Error loading the data: ' + error);
});


function drawChart(data){

	console.log("Let's draw a chart!!");
	

	// Margin object with properties for the four directions
	const margin = {top: 40, right: 50, bottom: 10, left: 50};

	// Width and height as the inner dimensions of the chart area
	const width = 1000 - margin.left - margin.right;
	const height = 1100 - margin.top - margin.bottom;

	// Define 'svg' as a child-element (g) from the drawing area and include spaces
	// Add <svg> element (drawing space)
	const svg = d3.select('body').append('svg')
	    .attr('width', width + margin.left + margin.right)
	    .attr('height', height + margin.top + margin.bottom)
	    .append('g')
	    .attr('transform', `translate(${margin.left}, ${margin.top})`);

	// Initialize linear and ordinal scales (input domain and output range)
	//TO DO
	// CREATE an xScale using d3.scaleLinear , with domain 0-365 and range 0-width
	const xScale = d3.scaleLinear().domain([0, 365]).range([0, width]);
	// CREATE a yScale using d3.scaleLinear, with domain [ max year, min year] and range [0, height]  Note- why did I reverse the domain going from max to min? 
	const yScale = d3.scaleLinear().domain([d3.max(data, d => d.year), d3.min(data, d => d.year)]).range([0, height]);
	// CREATE an rScale using d3.scaleLinear, with domain the extent of the cost field in data, and range 5, 100
	const rScale = d3.scaleLinear().domain([d3.min(data, d=> d.cost), d3.max(data, d=> d.cost)]).range([5, 100]);
	//    note- remember there are calls d3.min, d3.max and d3.extent.  Check the tutorial for today

	// Construct a new ordinal scale with a range of ten categorical colours
	const colorPalette = d3.scaleOrdinal(d3.schemeTableau10) //TRY OTHER COLOR SCHEMES.... https://github.com/d3/d3-scale-chromatic
	colorPalette.domain( "tropical-cyclone", "drought-wildfire", "severe-storm", "flooding" );

	// Initialize axes
	//TO DO 
	//  CREATE a top axis using your xScale)
	const xAxis = d3.axisTop(xScale);
	// Create a horizontal axis with labels placed below the axis
	//  CREATE a left axis using your yScale)
	const yAxis = d3.axisLeft(yScale);
	//CREATE an xAxisGroup and append it to the SVG
	const xAxisGroup = svg.append('g')
	.attr('class', 'axis x-axis')
	.attr('transform', `translate(0, ${height})`)
	.call(xAxis);
	//CREATE a yAxisGroup and append it to the SVG
	const yAxisGroup = svg.append('g')
	.attr('class', 'axis x-axis')
	.call(yAxis);

	//Add circles for each event in the data
	svg.selectAll('circle')
	.data(data)
	.enter()
	.append('circle')
	.attr('fill', (d) => colorPalette(d.category) ) //TO DO: use the color palette.  //(d) => colorPalette(d.category) )
	.attr('opacity', .8)
	.attr('stroke', "gray")
	.attr('stroke-width', 2)
	.attr('r', d => rScale(d.cost)) //TO DO: use the rScale 
	.attr('cy', d => yScale(d.year)) // TO DO:  use the yScale 
	.attr('cx', d => xScale(d.daysFromYrStart)) //TO DO: use the xScale


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