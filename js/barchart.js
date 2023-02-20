class Barchart {
    /**
     * @param {Object}
     * @param {Array}
     */
    constructor(_config, _data, _aggregateAttr, _title, _xLabel, _yLabel, _XAxisLabelHeight = 20) {
        this.config = {
        parentElement: _config.parentElement,
        containerWidth: _config.containerWidth || 300,
        containerHeight: _config.containerHeight || 416,
        margin: _config.margin || {top: 30, right: 10, bottom: 20, left: 70},
        title: _title,
        xLabel: _xLabel,
        yLabel: _yLabel,
        XAxisLabelHeight: _XAxisLabelHeight
        }
        this.data = _data;
        this.aggregateAttr = _aggregateAttr;
        this.initVis();
        this.updateVis = function(){
            let vis = this;
            const aggregatedDataMap = d3.rollups(vis.data, v => v.length, d => d[this.aggregateAttr]);
            vis.aggregatedData = Array.from(aggregatedDataMap, ([key, count]) => ({ key, count }));
    
            if(this.aggregateAttr === "st_spectype"){
                vis.aggregatedData = vis.aggregatedData.filter(obj => ["A", "F", "G", "K", "M", "Unknown"].includes(obj.key))
            }
    
            vis.aggregatedData.sort(this.compare);
    
            vis.xValue = d => d.key;
            vis.yValue = d => d.count;
    
            // Set the scale input domains
            vis.xScale.domain(vis.aggregatedData.map(vis.xValue));
            vis.yScale.domain([0, d3.max(vis.aggregatedData, vis.yValue)]);
    
            vis.renderVis();
        }
    }

    initVis() {
        let vis = this;

        // Calculate inner chart size. Margin specifies the space around the actual chart.
        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right - 20;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom - vis.config.XAxisLabelHeight;

        // Initialize scales and axes
        
        // Important: we flip array elements in the y output range to position the rectangles correctly
        vis.yScale = d3.scaleLinear()
            .range([vis.height, 0]) 

        vis.xScale = d3.scaleBand()
            .range([0, vis.width])
            .paddingInner(0.2);

        vis.xAxis = d3.axisBottom(vis.xScale)
            .tickSizeOuter(0);

        vis.yAxis = d3.axisLeft(vis.yScale)
            .ticks(6)
            .tickSizeOuter(0)

        // Define size of SVG drawing area
        vis.svg = d3.select(vis.config.parentElement)
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);

        // SVG Group containing the actual chart; D3 margin convention
        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        // Append empty x-axis group and move it to the bottom of the chart
        vis.xAxisG = vis.chart.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${vis.height})`);
        
        // Append y-axis group 
        vis.yAxisG = vis.chart.append('g')
            .attr('class', 'axis y-axis')
            .attr('transform', `translate(0,0)`);

        // Title
        vis.svg.append("text")
            .attr("x", vis.config.containerWidth / 2)
            .attr("y", 25)
            .attr("text-anchor", "middle")
            .style("font-size", "24px")
            .text(vis.config.title);

        // Y-Axis Label
        vis.svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", - (vis.config.containerHeight / 2))
            .attr("y", 20)
            .style("text-anchor", "middle")
            .text(vis.config.yLabel);

        // X-Axis Label
        vis.svg.append("text")
            .attr("transform", "translate(" + (vis.config.containerWidth / 2) + " ," + (vis.config.containerHeight - 5) + ")")
            .style("text-anchor", "middle")
            .text(vis.config.xLabel);
    }

    /**
     * Prepare data and scales before we render it
     */

    // Used to sort by a property value. Currently sorts in descending order by frequency.
    compare(a, b) {
        if (a.count < b.count){
            return 1;
        }
        if (a.count > b.count){
            return -1;
        }
        return 0;
    }

    /**
     * Bind data to visual elements
     */
    renderVis() {
        let vis = this;

        // Add rectangles
        const bars = vis.chart.selectAll('.bar')
            .data(vis.aggregatedData, vis.xValue)
            .join('rect')
            .attr('class', 'bar')
            .attr('x', d => vis.xScale(vis.xValue(d)))
            .attr('width', vis.xScale.bandwidth() * .9)
            .attr('transform', `translate(${vis.xScale.bandwidth() * .05}, 0)`)
            .attr('y', vis.yScale(0))
            .attr('height', 0)
            .attr('class', function(d) {
                if(globalDataFilter.find(f => (f[0] === vis.aggregateAttr && f[1] === d.key))){
                    return 'bar active' // adding active class to newly rendered bars that were already a filter
                }else{
                    return 'bar'
                }
            });

            bars.transition().duration(1000)
            .attr('height', d => vis.height - vis.yScale(vis.yValue(d)))
            .attr('y', d => vis.yScale(vis.yValue(d)));

            bars.on('click', function(event, d) {
                let isActive = globalDataFilter.find(f => (f[0] === vis.aggregateAttr && f[1] === d.key))
                console.log(isActive)
                if (globalDataFilter.includes(isActive)) {
                    const index = globalDataFilter.indexOf(isActive);
                    if (index > -1) {
                        globalDataFilter.splice(index, 1); // only removes specific filter at index
                    }
                } else {
                    globalDataFilter.push([vis.aggregateAttr, d.key]); // Append new filter
                }
                filterData(); // Call global function to update visuals
                d3.select(this).classed('active', !isActive);
            });

        bars.on('mouseover', (event, d) => {
            d3.select('#tooltip')
            .style('display', 'block')
            .style('left', (event.pageX + 5) + 'px')   
            .style('top', (event.pageY + 5) + 'px')
            .html(`
                <div class="tooltip-title">${vis.config.xLabel}: ${d.key}</div>
                <div class="tooltip-title">${vis.config.yLabel}: ${d.count}</div>
            `);
        })
        .on('mouseleave', () => {
            d3.select('#tooltip').style('display', 'none');
        });

        // Update axes
        vis.xAxisG.call(vis.xAxis)
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");
        vis.yAxisG.call(vis.yAxis);
    }
}