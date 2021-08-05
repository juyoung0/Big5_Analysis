/**
 * Created by 오주영 on 2017-02-05.
 */
var ParallelCoord = function () {

    var dimensions;
    var w = parseInt($("#parallel").css("width"));
    var h = parseInt($("#parallel").css("height"));

    var padding = 10;
    var margin = {top: 30, right: 50, bottom: 10, left: 30};
    var width = w - margin.left - margin.right;
    var height = h - margin.top - margin.bottom;
    var brushes = [];
    var x = d3.scalePoint().range([0, width]),
        y = {},
        dragging = {};

    var line = d3.line(),
        axis = d3.axisLeft(x),
        background,
        foreground;

    var dataSet = [];
    var indexList = [];
    var prevList = [];
    var brushNum = 0;

    var svg = d3.select("#parallel").append("svg")
        .attr("width", w)
        .attr("height", h)
        .append("g");

    d3.csv("../data/normalized_big5_class.csv", function (error, data) {
        var colName = ["Team", "Pt", "Final", "Attendance", "Participation", "Extraversion","Agreeableness","Conscientiousness","Neuroticism","Openness"];
        data.forEach(function (d, i) {
            dataSet.push([+d.Team, +d.PT, +d.Final, +d.Attendance, +d.Participation, +d.Extraversion, +d.Agreeableness, +d.Conscientiousness, +d.Neuroticism, +d.Openness]);
        });

        // Extract the list of dimensions and create a scale for each.
        x.domain(dimensions = d3.keys(dataSet[0]).filter(function (d) {
            return d != "name" && (y[d] = d3.scaleLinear()
                    .domain(d3.extent(dataSet, function (p) {
                        return +p[d];
                    }))
                    .range([height, 0]));
        }));

        // Add grey background lines for context.
        background = svg.append("g")
            .attr("class", "background")
            .selectAll("path")
            .data(dataSet)
            .enter().append("path")
            .attr("d", path)
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Add blue foreground lines for focus.
        foreground = svg.append("g")
            .selectAll("path")
            .data(dataSet)
            .enter().append("path")
            .attr("class", function (d, i) {
                return "foreground ind_" + i
            })
            .attr("d", path)
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        //Add red hightline
        var highlightLine = svg.append("g")
            .selectAll("path")
            .data(dataSet)
            .enter().append("path")
            .attr("class", function (d, i) {
                return "highlight selected_" + i
            })
            .attr("d", path)
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        d3.selectAll(".highlight").style("opacity", 0);


        // Add a group element for each dimension.
        var g = svg.selectAll(".dimension")
            .data(dimensions)
            .enter().append("g")
            .attr("class", "dimension")
            .attr("transform", function (d) {
                return "translate(" + x(d) + ")";
            })
            .call(d3.drag()
                .on("start", function (d) {
                    dragging[d] = x(d);
                    background.attr("visibility", "hidden");
                })
                .on("drag", function (d) {
                    dragging[d] = Math.min(width, Math.max(0, d3.event.x));
                    foreground.attr("d", path);
                    dimensions.sort(function (a, b) {
                        return position(a) - position(b);
                    });
                    x.domain(dimensions);
                    g.attr("transform", function (d) {
                        return "translate(" + position(d) + ")";
                    })
                })
                .on("end", function (d) {
                    delete dragging[d];
                    transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
                    transition(foreground).attr("d", path);
                    background
                        .attr("d", path)
                        .transition()
                        .delay(500)
                        .duration(0)
                        .attr("visibility", null);
                })
            );

        // Add an axis and title.
        g.append("g")
            .attr("class", "axis")
            .each(function (d) {
                d3.select(this).call(d3.axisRight(y[d]));
            })
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");;

        g.append("text")
            .style("text-anchor", "middle")
            .attr("y", -6)
            .text(function (d) {
                console.log(colName[d]);
                return colName[d];
            })
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");;

        // Add and store a brush for each axis.
        g.append("g")
            .attr("class", "brush")
            .each(function (d) {
                y[d].brushed = false;

                brushes[d] = d3.brushY(y[d])
                    .extent([[-10, 0], [10, height]]).on("start", brushstart)
                    .on("brush", brush)
                    .on("end", brushend);

                d3.select(this).call(brushes[d]);
            })
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");;

    });

    function position(d) {
        var v = dragging[d];
        return v == null ? x(d) : v;
    }

    function transition(g) {
        return g.transition().duration(500);
    }

    function brushstart(d) {
        y[d].brushed = false;
        d3.event.sourceEvent.stopPropagation();
    }

    function brushend(d) {
        updatebrush();

        if(brushNum == 0) {
            plotDeHighlight();
            d3.selectAll(".foreground").style("display", "true");
        }
    }

// Handles a brush event, toggling the display of foreground lines.
    function brush(a) {
        y[a].brushed = true;
        var s = d3.event.selection || y[a].range();
        y[a].selection = s;

        updatebrush();

        d3.selectAll(".foreground").each(function(d,i){
            if(d3.select(this).attr("display") == true)
                console.log(i);
        })
    }

    function updatebrush() {

        var actives = dimensions.filter(function (p, i) {
                return y[p].brushed;
            }),
            extents = actives.map(function (p) {

                return y[p].selection.map(y[p].invert, y[p]);
            });

        foreground.style("display", function (d) {
            return actives.every(function (p, i) {
                return d[+p] <= extents[i][0] && d[+p] >= extents[i][1];
            }) ? null : "none";
        });

        /* interaction with scatter plot */
        for (var j = 0; j < actives.length; j++){
            indexList = [];
            dataSet.forEach(function(d,i){
                if( dataSet[i][actives[j]] <= extents[j][0] && dataSet[i][actives[j]] >= extents[j][1]){

                    if(j==0) {
                        prevList.push(i);
                        indexList.push(i);
                    }
                    else{
                        if(prevList.includes(i))
                            indexList.push(i);
                    }
                }
            });
            prevList = indexList;
        }
        brushNum = actives.length;
        if(brushNum != 0)
            plotHighlight(indexList);
            plotmatrixHighlight(indexList);
    }

    /* Funtion for interaction */
    this.pcHighlight = function (index) {
        d3.selectAll(".selected_" + index).style("opacity", 1);
    }

    this.pcDeHighlight = function (index) {
        d3.selectAll(".selected_" + index).style("opacity", 0);

    }

    // Returns the path for a given data point.
    function path(d) {
        return line(dimensions.map(function (p) {
            return [position(p), y[p](d[p])];
        }));
    }
}
