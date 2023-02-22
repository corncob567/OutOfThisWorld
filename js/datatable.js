class DataTable {
    /**
     * @param {Object}
     * @param {Array}
     */
    constructor(_parentElement, _data, _columns) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.columns = _columns;
        this.initVis();
    }

    initVis() {
        let vis = this;
        let table = d3.select(vis.parentElement).append('table');
        let thead = table.append('thead');
        let	tbody = table.append('tbody');

        // append the header row
        thead.append('tr')
            .selectAll('th')
            .data(vis.columns).enter()
            .append('th')
            .text(function (column) { return column; });

        // create a row for each object in the data
        let rows = tbody.selectAll('tr')
            .data(vis.data)
            .enter()
            .append('tr');

        // create a cell in each row for each column
        let cells = rows.selectAll('td')
            .data(function (row) {
            return vis.columns.map(function (column) {
                return {column: column, value: row[column]};
            });
            })
            .enter()
            .append('td')
            .text(function (d) { return d.value; });
    }

    updateVis(){
        let vis = this;
        vis.data = vis.data.filter(d => d.filtered === false);

        vis.renderVis();
    }

    renderVis() {
        let vis = this;

        let table = d3.select(vis.parentElement).join('table').selectAll("table");
        let thead = table.join('thead');
        let	tbody = table.join('tbody');

        // append the header row
        thead.join('tr')
            .selectAll('th')
            .data(vis.columns)
            .join('th')
            .text(function (column) { return column; });

        // create a row for each object in the data
        let rows = table.selectAll('tbody').selectAll('tr')
            .attr("class", "datarow")
            .data(vis.data)
            .join('tr');

        // create a cell in each row for each column
        let cells = rows.selectAll('td')
            .data(function (row) {
                return vis.columns.map(function (column) {
                    return {column: column, value: row[column]};
                });
            })
            .join('td')
            .text(function (d) { return d.value; });
    }
}