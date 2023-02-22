class DualBarchart {
    /**
     * @param {Object}
     * @param {Array}
     */
    constructor(_config, _data, _aggregateAttr, _separationAttr, _title, _xLabel, _yLabel, _XAxisLabelHeight = 20) {
        this.config = {
        parentElement: _config.parentElement,
        containerWidth: _config.containerWidth || 300,
        containerHeight: _config.containerHeight || 416,
        margin: _config.margin || {top: 60, right: 10, bottom: 20, left: 70},
        title: _title,
        xLabel: _xLabel,
        yLabel: _yLabel,
        XAxisLabelHeight: _XAxisLabelHeight
        }
        this.data = _data;
        this.aggregateAttr = _aggregateAttr;
        this.separationAttr = _separationAttr;
        this.initVis();
    }

    initVis() {
        let vis = this;
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
            .attr("x", vis.config.containerWidth / 2 - 50)
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

        vis.legend = vis.svg.append("g")
            .attr("class", "legend")
            .attr('transform', 'translate(0,-10)')
    
        vis.colors = [["Habitable", "#395943"],
                        ["Uninhabitable", "#c09c9f"]];
        
        let legendText = vis.legend.selectAll('text').data(vis.colors);
        legendText.enter()
            .append("text")
            .attr("font-size", 12)
            .attr("x", vis.config.containerWidth - 75)
            .attr("y", function(d, i) {
                return i * 20 + 34;
            })
            .text(function(d) {
                return d[0];
            });
    }

    /**
     * Prepare data and scales before we render it
     */

    // Used to sort by a property value. Currently sorts in descending order by frequency.
    compare(a, b) {
        if (a.uninhabitable < b.uninhabitable){
            return 1;
        }
        if (a.uninhabitable > b.uninhabitable){
            return -1;
        }
        return 0;
    }

    updateVis(oninit = false){
        let vis = this;
        const aggregatedDataMap = d3.group(vis.data.filter(d => d.filtered === false), d => d[vis.aggregateAttr], d => d[vis.separationAttr])
        vis.aggregatedData = Array.from(aggregatedDataMap, ([key, groupsBySeparator]) => ({ key, groupsBySeparator }));

        if(this.aggregateAttr === "st_spectype"){
            vis.aggregatedData = vis.aggregatedData.filter(obj => ["A", "F", "G", "K", "M"].includes(obj.key))
        }
        
        vis.groupedData = []
        vis.aggregatedData.forEach(d => {
            let uninhabitableCount, habitableCount = 0;
            if(d.groupsBySeparator.has(false)){
                uninhabitableCount = d.groupsBySeparator.get(false).length;
            }
            if(d.groupsBySeparator.has(true)){
                habitableCount = d.groupsBySeparator.get(true).length;
            }
            if(uninhabitableCount === undefined){
                uninhabitableCount = 0
            }
            vis.groupedData.push({key: d.key, uninhabitable: uninhabitableCount, habitable: habitableCount});
        });

        if(oninit){
            vis.groupedData.sort(this.compare);
        }

        vis.xValue = d => d.key;
        vis.yValue1 = d => d.uninhabitable;
        vis.yValue2 = d => d.habitable;

        if(oninit){
            vis.xScale.domain(vis.groupedData.map(vis.xValue));
            vis.yScale.domain([0, 650]);
        }

        vis.renderVis(oninit);
    }

    renderVis(oninit) {
        let vis = this;

        let graph1 = vis.svg.selectAll(".habitableBar")
    					.data(vis.groupedData);
        let graph2 = vis.svg.selectAll(".uninhabitableBar")
    					.data(vis.groupedData);

        let firstBarGroup = graph2.join("rect")
            .attr('class', 'bar')
            .attr('class', 'uninhabitableBar')
            .attr("x", d => vis.xScale(vis.xValue(d)))
            .attr("width", 15)
            .attr('y', vis.yScale(0))
            .attr('height', 0)
            .attr("transform", "translate(" + 72 + "," + vis.config.margin.top + ")")
            .attr("fill", "#c09c9f");

        let secondBarGroup = graph1.join("rect")
            .attr('class', 'bar')
            .attr('class', 'habitableBar')
            .attr("x", d => vis.xScale(vis.xValue(d)))
            .attr("width", 15)
            .attr('y', vis.yScale(0))
            .attr('height', 0)
            .attr("transform", "translate(" + 87 + "," + vis.config.margin.top + ")")
            .attr("fill", "#395943");

        firstBarGroup.transition().duration(1000)
            .attr('height', d => vis.height - vis.yScale(vis.yValue1(d)))
            .attr('y', d => vis.yScale(vis.yValue1(d)));
        secondBarGroup.transition().duration(1000)
            .attr('height', d => vis.height - vis.yScale(vis.yValue2(d)))
            .attr('y', d => vis.yScale(vis.yValue2(d)));

        vis.svg.selectAll(".habitableBar").on('mouseover', (event, d) => {
            d3.select('#tooltip')
            .style('display', 'block')
            .style('left', (event.pageX + 15) + 'px')   
            .style('top', (event.pageY + 15) + 'px')
            .html(`
                <div class="tooltip-title">Habitable</div>
                <ul>
                <li>Star Type: ${d.key}</li>
                <li># of Exoplanets: ${d.habitable}</li>
                </ul>
            `);
        })
        .on('mouseleave', () => {
            d3.select('#tooltip').style('display', 'none');
        });

        vis.svg.selectAll(".uninhabitableBar").on('mouseover', (event, d) => {
            d3.select('#tooltip')
            .style('display', 'block')
            .style('left', (event.pageX + 15) + 'px')   
            .style('top', (event.pageY + 15) + 'px')
            .html(`
                <div class="tooltip-title">Uninhabitable</div>
                <ul>
                <li>Star Type: ${d.key}</li>
                <li># of Exoplanets: ${d.uninhabitable}</li>
                </ul>
            `);
        })
        .on('mouseleave', () => {
            d3.select('#tooltip').style('display', 'none');
        });

        vis.legend.selectAll('circle').data(vis.colors)
            .join("circle")
            .attr("cx", vis.config.containerWidth - 85)
            .attr("r", 6)
            .attr("width", 10)
            .attr("height", 10)
            .classed("active", function(d) {
                let filterStr
                if(d[0] === "Habitable"){
                    filterStr = true;
                }else{
                    filterStr = false;
                }
                if(globalDataFilter.find(f => (f[0] === vis.separationAttr && f[1].includes(filterStr)))){
                    return true
                }else{
                    return false
                }
            })
            .attr("cy", function(d, i) {
                return i * 20 + 30;
            })
            .style("fill", function(d) {
                return d[1];
            })
            .on('click', function(event, d) {
                if(d[0] === "Habitable"){
                    vis.toggleFilter(true);
                }else{
                    vis.toggleFilter(false)
                }
            });

        // Update axes
        if(oninit){
            vis.xAxisG.call(vis.xAxis)
                .selectAll("text")
                .attr("transform", "translate(-10,0)rotate(-45)")
                .style("text-anchor", "end");
        }
        vis.yAxisG.call(vis.yAxis);
    }

    toggleFilter(filterProperty){
        let attrFilter = globalDataFilter.find(f => (f[0] === this.separationAttr))
        const attrIndex = globalDataFilter.indexOf(attrFilter);
        if (attrIndex === -1){ // Attribute has never been filtered on
            globalDataFilter.push([this.separationAttr, [filterProperty]]); // Append new filter
        }else{ // Attribute is either being removed entirely or needs to be OR'd
            let specificFilter = globalDataFilter[attrIndex]
            let specificFilterProperty = specificFilter[1].find(s => (s === filterProperty))
            const specificFilterIndex = specificFilter[1].indexOf(specificFilterProperty);
            // Specific filter property was found, so we remove it
            if (specificFilterIndex > -1) {
                if (specificFilter[1].length === 1){
                    globalDataFilter.splice(attrIndex, 1); // remove entire attribute filter since no specific attributes are selected for it
                }else{
                    specificFilter[1].splice(specificFilterIndex, 1); // only removes specific filter from that attribute
                }
            }else{ // Attribute already has at least 1 filter on it, so we add the new filter to that attribute's array
                specificFilter[1].push(filterProperty); // Append new filter
            }
        }
        filterData(); // Call global function to update visuals
    }
}