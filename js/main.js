d3.select("body").append("p").text("Hello World")

const iceCreamFlavors = ['vanilla', 'chocolate', 'strawberry', 'cookies and cream', 'cookie dough'];

 const p = d3.select('body').selectAll('p')
	.data(iceCreamFlavors)
	.enter()
	.append('p')
	.text(d => d)
    .attr('class', 'custom-paragraph') //a class label allows you to define styles in css, or select these elements later
    .style('font-weight', 'bold') 
    .style('color', d => {
      if(d == 'strawberry')
        return 'red';
      else
        return 'blue';
    });

const numericData = [1, 2, 4, 8, 16];

// Add <svg> element (drawing space)
const svg = d3.select('body').append('svg')
    .attr('width', 300)
    .attr('height', 50);

// Add rectangle
svg.selectAll('rect')
    .data(numericData)
    .enter()
    .append('rect')
    .attr('fill', 'red')
    .attr('width', 50)
    .attr('height', (d) => d*10)
    .attr('y', 0)
    .attr('x', (d, index) => index * 60);