/**
 * Created by 오주영 on 2017-02-05.
 */
var ScatterPlotMatrix = function(pc) {
    var w = parseInt($("#scatterPlot").css("width"));
    var h = parseInt($("#scatterPlot").css("height"));

    var padding = 10;
    var margin = {top: 0, right: 0, bottom:0, left: 0};
    var width = w - margin.left - margin.right;
    var height = h - margin.top - margin.bottom;

    var color = d3.scaleOrdinal(d3.schemeCategory10);
    var dataSet = [];
    var colName = ["Team", "Pt", "Final", "Attendance", "Participation", "Extraversion","Agreeableness","Conscientiousness","Neuroticism","Openness"];


    d3.csv("../data/normalized_big5_class.csv", function (error, data) {
        if (error) throw error;
        data.forEach(function (d) {
            dataSet.push([d.Team, d.PT, d.Final, d.Attendance, d.Participation, d.Extraversion,d.Agreeableness, d.Conscientiousness, d.Neuroticism, d.Openness]);
        });

        var domainByTrait = {},
            traits = d3.keys(dataSet[0]).filter(function (d) {
                return d !== "species";
            }),
            n = traits.length;

        traits.forEach(function (trait) {
            domainByTrait[trait] = d3.extent(dataSet, function (d) {
                return d[trait];
            });
        });

        var size = (height) / n;

        var x = d3.scaleLinear()
            .range([padding / 2, size - padding / 2]);

        var y = d3.scaleLinear()
            .range([size - padding / 2, padding / 2]);


        var brush = d3.brush()
            .on("start", brushstart)
            .on("brush", brushmove)
            .on("end", brushend)
            .extent([[0,0],[width,height]]);

        var svg = d3.select("#scatterPlot").append("svg")
            .attr("width", w)
            .attr("height", h)
            .append("g")
            .attr("transform", "translate(" + (margin.left) + "," + margin.top + ")");

        var cell = svg.selectAll(".cell")
            .data(cross(traits, traits))
            .enter().append("g")
            .attr("width", size)
            .attr("height", size)
            .attr("class", "cell")
            .attr("transform", function (d) {
                return "translate(" + (n - d.i - 1) * size + "," + d.j * size + ")";
            })
            .each(plot);

        // Titles for the diagonal.
        cell.filter(function (d) {
            return d.i === d.j;
        }).append("text")
            .attr("x", 0)
            .attr("y", 0)
            .attr("dy", ".71em")
            .text(function (d) {
                return colName[d.x];
            });

        function plot(p) {
            var cell = d3.select(this);

            x.domain(domainByTrait[p.x]);
            y.domain(domainByTrait[p.y]);

            cell.append("rect")
                .attr("x", padding / 2)
                .attr("y", padding / 2)
                .attr("width", size - padding)
                .attr("height", size - padding)
                .style("fill", "white")
                .on("click", function (d, i) {
                plotBigger(d);
                d3.selectAll(".frame").style("fill", "none");
                d3.select(this).select("#frameRect")
                    .style("fill", "yellow");
            });

            cell.append("rect")
                .attr("id", "frameRect")
                .attr("class", "frame")
                .attr("x", padding / 2)
                .attr("y", padding / 2)
                .attr("width", size - padding)
                .attr("height", size - padding);

            cell.selectAll("circle")
                .data(dataSet)
                .enter().append("circle")
                .attr("id", "dots")
                .attr("cx", function (d) {
                    return x(d[p.x]);
                })
                .attr("cy", function (d) {
                    return y(d[p.y]);
                })
                .attr("r", 1)
                .style("fill", function(d, i) { return color(data[i].classNum - 1); });
        }


        var bigx = d3.scaleLinear()
            .range([padding/2, size*n-padding/2]);

        var bigy = d3.scaleLinear()
            .range([size*n-padding/2, padding/2]);

        var xAxis = d3.axisBottom()
            .scale(bigx)
            .ticks(6);

        var yAxis = d3.axisLeft()
            .scale(bigy)
            .ticks(6);

        xAxis.tickSize(size * n);
        yAxis.tickSize(-size * n);


        var brushCell;
        // Clear the previously-active brush, if any.
        function brushstart(p) {
            if (brushCell !== this) {
                d3.select(brushCell).call(brush.move, null);
                brushCell = this;
                bigx.domain(domainByTrait[p.x]);
                bigy.domain(domainByTrait[p.y]);
            }
        }

        // Highlight the selected circles.
        function brushmove(p) {
            var e = d3.brushSelection(this);
            svg.selectAll("circle").classed("hidden", function(d) {
                // console.log(bigx(+d[p.x]));
                // console.log(bigy(+d[p.y]));
                return !e
                    ? false
                    : (
                    e[0][0] > bigx(+d[p.x]) || bigx(+d[p.x]) > e[1][0]
                    || e[0][1] > bigy(+d[p.y]) || bigy(+d[p.y]) > e[1][1]
                );
            });
        }

        // If the brush is empty, select all circles.
        function brushend() {
            var e = d3.brushSelection(this);
            if (e === null) svg.selectAll(".hidden").classed("hidden", false);
        }

        function plotBigger(p){
            bigx.domain(domainByTrait[p.x]);
            bigy.domain(domainByTrait[p.y]);

            d3.select("#bigCell").remove();

            var bigCell = svg.append("g")
                .attr("class", "cell")
                .attr("id", "bigCell")
                .attr("transform", "translate(" + width/2 + ",0)");

            bigCell.selectAll(".x.axis")
                .data(p.x)
                .enter().append("g")
                .attr("class", "x axisM")
                .attr("id", "xaxis")
                .attr("transform", function (d, i) {
                    return "translate(" +  i * size * 10  + "," + (0-padding) +")";
                })
                .call(xAxis);

            bigCell.selectAll(".y.axis")
                .data(p.y)
                .enter().append("g")
                .attr("class", "y axisM")
                .attr("id", "yaxis")
                .attr("transform", function (d, i) {
                    return "translate(" + padding +"," + i * size * 10 + ")";
                })
                .call(yAxis);

            bigCell.append("rect")
                .attr("id", "frameRect")
                .attr("class", "frame")
                .attr("x", padding)
                .attr("y", padding / 2)
                .attr("width", size * n - padding )
                .attr("height", size * n - padding );

            bigCell.call(brush);

            bigCell.append("g")
                .attr("id", "bigDots")
                .selectAll(".circle")
                .data(dataSet)
                .enter().append("circle")
                .attr("cx", function (d) {
                    return bigx(d[p.x]);
                })
                .attr("cy", function (d) {
                    return bigy(d[p.y]);
                })
                .attr("class", function(d, i) {
                    return "bigcircle bigindex_" + i;
                })
                .attr("r", 5)
                .style("fill", function(d, i) { return color(data[i].classNum - 1); })
                .on("mouseover", function (d, i) {
                    d3.select(this).style("fill", "cyan");
                    pc.pcHighlight(i);
                })
                .on("mouseout", function (d, i) {
                    d3.select(this)
                        .style("fill", function(d, i) { return color(data[i].classNum - 1); });
                    pc.pcDeHighlight(i);
                });
        }

        /* Funtion for interaction */
        this.plotmatrixHighlight = function (indexList) {
            d3.selectAll(".bigcircle").style("opacity", 0.2);
            indexList.forEach(function(d,i){
                d3.selectAll(".bigindex_" + indexList[i]).style("opacity", 1);
            })
        }

        this.plotmatrixDeHighlight = function () {
            d3.selectAll(".bigcircle").style("opacity", 1);
        }
    });

    function cross(a, b) {
        var c = [], n = a.length, m = b.length, i, j;
        for (i = -1; ++i < n;) for (j = -1; ++j < m;) c.push({x: a[i], i: i, y: b[j], j: j});
        return c;
    }
}


