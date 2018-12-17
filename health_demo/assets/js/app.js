// @TODO: YOUR CODE HERE!
//SVG size and margins
var svgWidth = 800;
var svgHeight = 600;
var margin = {
    top: 20,
    right: 20,
    bottom: 100,
    left: 80
};
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

//Declare chart and group for the markers
var chart = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);
var chartGroup = chart.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

//declare starting axes to graph
var chosenX = 'age'
var chosenY = 'smokes'
//all possible axes, for later controls
var xLabelList = {
    'poverty': 'In Poverty (%)',
    'age': 'Age (median)',
    'income': 'Household Income (median)'
}
var yLabelList = {
    'healthcare': 'Lacks Healthcare (%)',
    'obesity': 'Obesity (%)',
    'smokes': 'Smokes (%)'
}


//function Scale to scale either axis, pass width or height for third argument to change axis
//data - data array to scale
//chosenAxis - chosen X or Y axis
//widthHeight - width if calculating X axis, height if calculating Y axis
function scale(data, chosenAxis, dir) {
    let r = [0, width]
    if (dir === height) {
        r = [height, 0]
    }
    var linearScale = d3.scaleLinear()
        .domain([d3.min(data, sd => sd[chosenAxis]) * 0.9,  //0.8 and 1.2 gives us a buffer from the edges of the chart
        d3.max(data, sd => sd[chosenAxis]) * 1.1
        ])
        .range(r);
    return linearScale
}


d3.csv('assets/data/data.csv').then(d => {
    d.forEach(obj => {
        Object.keys(obj).forEach(key => {
            if (!isNaN(obj[key])) {    //Converts values to numbers
                obj[key] = +obj[key]
            }
        })
    })
    let xScale = scale(d, chosenX, width)
    let yScale = scale(d, chosenY, height)

    //Create all circles
    var pointGroup = chartGroup.selectAll("circle")
        .data(d)
        .enter()
        .append("circle")
        .attr("r", "1%")
        .attr("fill", "blue")
        .attr("opacity", ".9")
        .classed("stateCircle", true)
        .attr("cx", x => xScale(x[chosenX]))
        .attr("cy", y => yScale(y[chosenY]))

    //add state abbreviation labels
    var stateAbbrev = chartGroup.selectAll("text")
        .data(d)
        .enter()
        .append("text")
        .text(t => t.abbr)
        .attr("x", x => xScale(x[chosenX]))
        .attr("y", y => yScale(y[chosenY]))
        .classed('stateText', true)
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .attr("transform", 'translate(0, 1)')
        .attr('font-size', svgWidth*0.01)

    var xLabelGroup = chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .attr("id", "xLabelGroup")
        .attr("width", width);
    var yLabelGroup = chartGroup.append("g")
        .attr("id", "yLabelGroup")

    //    Populate X axis labels
    let xLabelOffset = 30
    Object.entries(xLabelList).forEach(([key, value]) => {
        xLabelGroup
            .append("text")
            .text(value)
            .attr("value", key)
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .classed("inactive x-axis axis-text", true)
            .attr('transform', `translate(${width / 2}, ${xLabelOffset})`);
        xLabelOffset += 15
    });
    xAxisLabels = xLabelGroup.selectAll(".x-axis");

    //Populate Y axis labels
    let yLabelOffset = -120;
    Object.entries(yLabelList).forEach(([key, value]) => {
        yLabelGroup
            .append("text")
            .text(value)
            .attr("value", key)
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .classed("inactive y-axis", true)
            .attr('x', 0-(height / 2))
            .attr('y', margin.left + yLabelOffset)
            .attr('transform', `rotate(-90)`);
        yLabelOffset -= 15
    });
    yAxisLabels = yLabelGroup.selectAll(".y-axis");

    //Highlights active axes, unhighlights inactive axes
    function setAxes(xAxis, yAxis) {
        let xScale = scale(d, xAxis, width)
        let yScale = scale(d, yAxis, height)
        var bottomAxis = d3.axisBottom(xScale)
        var leftAxis = d3.axisLeft(yScale)

        xAxisLabels
            .classed("inactive", true)
            .classed("active", false)

        yAxisLabels
            .classed("inactive", true)
            .classed("active", false)

        xLabelGroup.selectAll(`[value=${xAxis}]`)
            .classed("inactive", false)
            .classed("active", true);

        yLabelGroup.selectAll(`[value=${yAxis}]`)
            .classed("inactive", false)
            .classed("active", true);

        xLabelGroup.transition()
            .duration(1000)
            .call(bottomAxis)

        yLabelGroup.transition()
            .duration(1000)
            .call(leftAxis)

        updateToolTip(xAxis, yAxis)
    }
    //Adds or updates Tool Tip
    function updateToolTip(X, Y) {
        var toolTip = d3.tip()
            .attr('class', 'tooltip')
            .offset([-10, 60])
            .html(dat => {
                return `${dat.state}<br>${xLabelList[X]}: ${dat[X]} <br> ${yLabelList[Y]}: ${dat[Y]}`;
            });

        pointGroup.call(toolTip);
        stateAbbrev.call(toolTip);
        
        pointGroup.on("mouseover", function(data) {
            toolTip.show(data, this);
        });
        stateAbbrev.on("mouseover", function(data) {
            toolTip.show(data, this);
        });
        pointGroup.on("mouseout", function(data) {
            toolTip.hide(data, this);
        });
        stateAbbrev.on("mouseout", function(data) {
            toolTip.hide(data, this);
        });
    }

    function axisTransition(newX, newY) {
        let newXScale = scale(d, newX, width)
        let newYScale = scale(d, newY, height)
        if (newX !== chosenX) {
            //Transitions X axis 
            pointGroup.transition()
                .duration(1000)
                .attr('cx', d => newXScale(d[newX]));

            stateAbbrev.transition()
                .duration(1000)
                .attr('x', d => newXScale(d[newX]));
        }
        //Transitions Y axis
        if (newY !== chosenY) {
            pointGroup.transition()
                .duration(1000)
                .attr('cy', d => newYScale(d[newY]))

            stateAbbrev.transition()
                .duration(1000)
                .attr('y', d => newYScale(d[newY]));
        }
        setAxes(newX, newY)
        updateToolTip(newX, newY)
    }

    setAxes(chosenX, chosenY);


    xAxisLabels
        .on("click", function () {
            let value = d3.select(this).attr("value");
            if (value !== chosenX) {
                axisTransition(value, chosenY);
                chosenX = value
            }
        })

    yAxisLabels
        .on("click", function () {
            let value = d3.select(this).attr("value");
            if (value !== chosenY) {
                axisTransition(chosenX, value);
                chosenY = value
            }
        })
})

