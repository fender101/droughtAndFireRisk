var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 60,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper
var svg = d3.select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Import Data
d3.csv("fireDr.csv")
  .then(function(fireDr) {

    // Parse Data/Cast as numbers
   
    fireDr.forEach(function(data) {
      data.Acres = +data.Acres;
      data.Drought = +data.Drought;
      });

     // Create scale functions
    
    var xLinearScale = d3.scaleLinear()
      .domain([20, d3.max(fireDr, d => d.Acres)])
      .range([0, width]);

    var yLinearScale = d3.scaleLinear()
      .domain([0, d3.max(fireDr, d => d.Drought)])
      .range([height, 0]);

    // Create axis functions, append Axes to the chart
    
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
   
    chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    chartGroup.append("g")
      .call(leftAxis);

    // Create Circles
    
    var circlesGroup = chartGroup.selectAll("circle")
    .data(fireDr)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d.Acres))
    .attr("cy", d => yLinearScale(d.Drought))
    .attr("r", "11")
    .attr("fill", "red")
    .attr("opacity", ".6");

    // Initialize tool tip
    
    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.County}<br>Burned Area: ${d.Acres}<br>Drought Level: ${d.Drought}`);
      });

    // Create tooltip in the chart, create event listeners
    
    chartGroup.call(toolTip);

     circlesGroup.on("click", function(data) {
      toolTip.show(data, this);
    })
    // onmouseout event
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });

    // Create axes labels
    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 40)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("class", "axisText")
      .text("Drought Level");

    chartGroup.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
      .attr("class", "axisText")
      .text("Burned Area in Acres");
  });
