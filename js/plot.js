/**
 * Created by 오주영 on 2017-02-05.
 */
var ScatterPlot = function(filepath) {

    var colorList = d3.scaleOrdinal(d3.schemeCategory10);

    var w = parseInt($("#plotGraph").css("width"));
    var h = parseInt($("#plotGraph").css("height"));

    var padding = 10;
    var margin = {top: 10, right: 20, bottom: 10, left: 20};
    var width = w - margin.left - margin.right;
    var height = h - margin.top - margin.bottom;

    var svg = d3.select("#plotGraph")
        .append("svg")
        .attr("width", w - margin.left*2)
        .attr("height", h - margin.top*2)
        .attr("transform", "translate(" + margin.left/2 + "," + margin.top/2 + ")");

    var outer = svg.append("rect")
        .attr("class", "outer")
        .attr("width", width)
        .attr("height", height)
        //.attr("transform", "translate(" + margin.left/2 + "," + margin.top/2 + ")");


    var group = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"];
    var classNum = ["1", "2"];

    d3.csv(filepath, function (error, data) {
            data.forEach(function (d) {
                d.x = +d.x;
                d.y = +d.y;
            });

        d3.csv("../data/normalized_big5_class.csv", function (error, classData) {
            classData.forEach(function (d) {
                d.classNum = +d.classNum;
                d.group = +d.group;
                d.Team = +d.Team;
                d.PT = +d.PT;
                d.Final = +d.Final;
                d.Attendance = +d.Attendance;
                d.Participation = +d.Participation;
                d.Extraversion= +d.Extraversion;
                d.Agreeableness = +d.Agreeableness;
                d.Conscientiousness = +d.Conscientiousness;
                d.Neuroticism= +d.Neuroticism;
                d.Openness = +d.Openness;
            });

            var first = [];
            var second = [];
            var firstClass = [];
            var secondClass = [];
            for(var i=0; i<data.length; i++){
                if(classData[i].classNum == 2) {
                    data[i].ind = i;
                    first.push(data[i]);
                    firstClass.push(classData[i]);
                } else {
                    data[i].ind = i;
                    second.push(data[i]);
                    secondClass.push(classData[i]);
                }
            }

            var maxX = d3.max(data, function (d) {
                return d.x;
            });
            var maxY = d3.max(data, function (d) {
                return d.y;
            });
            var minX = d3.min(data, function (d) {
                return d.x;
            });
            var minY = d3.min(data, function (d) {
                return d.y;
            });

            var xScale = d3.scaleLinear()
                .domain([minX, maxX])
                .range([0, width]);

            var yScale = d3.scaleLinear()
                .domain([minY, maxY])
                .range([height, 0]);


            /* Zoom handelr */
            var zoom = d3.zoom()
                .scaleExtent([1, 40])
                .translateExtent([[-100, -100], [width + 90, height + 100]])
                .on("zoom", zoomed);

            var circles = svg
                .append("g")
                .attr("id", "circles")
                .attr("width", width)
                .attr("height", height)
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            drawPlot("firstClass");
            drawPlot("secondClass");

            /* class legend */
            var class1Legend = svg.append("g")
                .attr("class", "legend")
                .attr("transform", "translate(" + 80 + "," +10 +")")
                .style("font", "10px sans-serif");

            class1Legend.append("path")
                .attr("d", d3.symbol().type(d3.symbolCircle))
                .attr("fill", "black")
                .attr("stroke", "black")
                .attr("transform", "translate(" + 30 + "," +  10 + ")");

            class1Legend.append("text")
                .attr("x", 40)
                .attr("y", 10)
                .attr("dy", ".35em")
                .attr("text-anchor", "font")
                .text("Class 1");

          class1Legend
                .on("mouseenter", function () {
                        d3.selectAll(".circle").style("opacity", 1);
                        d3.selectAll(".triangle").style("opacity", 0);
                })
                .on("mouseout", function () {
                    d3.selectAll(".circle").style("opacity", 1);
                    d3.selectAll(".triangle").style("opacity", 1);
                });

            var class2Legend = svg.append("g")
                .attr("class", "legend")
                .attr("transform", "translate(" + 80 + "," +20 +")")
                .style("font", "10px sans-serif");

            class2Legend.append("path")
                .attr("d", d3.symbol().type(d3.symbolTriangle))
                .attr("fill", "black")
                .attr("stroke", "black")
                .attr("transform", "translate(" + 30 + "," +  20 + ")");

            class2Legend.append("text")
                .attr("x", 40)
                .attr("y", 20)
                .attr("dy", ".35em")
                .attr("text-anchor", "font")
                .text("Class 1");

            class2Legend
                .on("mouseenter", function () {
                    d3.selectAll(".circle").style("opacity", 0);
                    d3.selectAll(".triangle").style("opacity", 1);
                })
                .on("mouseout", function () {
                    d3.selectAll(".circle").style("opacity", 1);
                    d3.selectAll(".triangle").style("opacity", 1);
                });


            /* group legend */
            var groupLegend = svg.selectAll("legend")
                .data(group)
                .enter().append("g")
                .attr("class", "legend")
                .attr("transform", function (d, i) {
                    return "translate(0," + (i * 20) + ")";
                })
                .style("font", "10px sans-serif");

            groupLegend.append("rect")
                .attr("x", margin.left + 5)
                .attr("y", margin.top + 5)
                .attr("width", 12)
                .attr("height", 12)
                .attr("fill", function (d, i) {
                    return colorList(i)
                })
                .on("mouseenter", function (d, i) {
                    d3.selectAll(".circle").style("opacity", 0);
                    d3.selectAll(".circle_" + i).style("opacity", 1);
                    d3.selectAll(".triangle").style("opacity", 0);
                    d3.selectAll(".triangle_" + i).style("opacity", 1);
                })
                .on("mouseout", function (d, i) {
                    d3.selectAll(".circle").style("opacity", 1);
                    d3.selectAll(".triangle").style("opacity", 1);
                });

            groupLegend.append("text")
                .attr("x", 40)
                .attr("y", margin.top + 10)
                .attr("dy", ".35em")
                // .attr("text-anchor", "font")
                .text(function (d, i) {
                    return "Group" + d;
                });


            function drawPlot(className) {
                var dataset = [];
                var classDataset = [];
                var shape;
                if(className == "firstClass"){
                    dataset = first;
                    classDataset = firstClass;
                    shape = d3.symbol().type(d3.symbolCircle);
                }else{
                    dataset = second;
                    classDataset = secondClass;
                    shape = d3.symbol().type(d3.symbolTriangle);
                }

                var tip = d3.tip()
                    .attr("class", "d3-tip")
                    .offset([-10,0])
                    .html(function(d){
                        return "<strong>Class : </strong>" + d.classNum + "<br><strong>Group : </strong>" + d.group +
                            "<br><strong>Team Project : </strong>" + d.Team + "<br><strong>PT : </strong>" + d.PT +
                            "<br><strong>Final : </strong>" + d.Final + "<br><strong>Attendance : </strong>" + d.Attendance +
                            "<br><strong>Participation : </strong>" + d.Participation + "<br><strong>Extraversion : </strong>" + d.Extraversion +
                            "<br><strong>Agreeableness : </strong>" + d.Agreeableness + "<br><strong>Conscientiousness : </strong>" + d.Conscientiousness+
                            "<br><strong>Neuroticism : </strong>" + d.Neuroticism + "<br><strong>Openness : </strong>" + d.Openness;

                    });

                svg.call(tip);

                circles.selectAll(".point")
                    .data(dataset)
                    .enter()
                    .append("path")
                    .attr("d", shape)
                    .attr("fill", function (d, i) {
                        return colorList(classDataset[i].group - 1);
                    })
                    .attr("stroke", "black")
                    .style("stroke-opacity", 0.6)
                    .attr("class", function(d, i){
                        if(className == "firstClass")
                            return "circle circle_" + (classDataset[i].group - 1) + " index_" + (dataset[i].ind);
                        else
                            return "triangle triangle_" + (classDataset[i].group - 1) + " index_" + (dataset[i].ind);
                    })
                    .attr("transform", function(d) {
                        return "translate(" + xScale(d.x) + "," + yScale(d.y) + ")";
                    })
                    .on("mouseover", function (d, i) {
                        d3.select(this).attr("fill", "cyan");
                        tip.show(classDataset[i]);
                        pc.pcHighlight(dataset[i].ind);
                    })
                    .on("mouseout", function (d, i) {
                        d3.select(this)
                            .attr("fill", colorList(classDataset[i].group - 1));
                        tip.hide();
                        pc.pcDeHighlight(dataset[i].ind);
                    });
            }

            /* Funtion for interaction */
            this.plotHighlight = function (indexList) {
                d3.selectAll(".circle").style("opacity", 0.2);
                d3.selectAll(".triangle").style("opacity", 0.2);

                indexList.forEach(function(d,i){
                    d3.selectAll(".index_" + indexList[i]).style("opacity", 1);
                })
            }

            this.plotDeHighlight = function () {
                d3.selectAll(".circle").style("opacity", 1);
                d3.selectAll(".triangle").style("opacity", 1);
            }

            svg.call(zoom);

            function zoomed() {
                circles.attr("transform", d3.event.transform);
            }
        });

    });

    var pc = new ParallelCoord();
    var spm = new ScatterPlotMatrix(pc, filepath);
}



