import { Component, OnInit,Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as d3 from 'd3';

@Component({
  selector: 'app-paper-setup-chart-display',
  templateUrl: './paper-setup-chart-display.component.html',
  styleUrls: ['./paper-setup-chart-display.component.scss']
})


export class PaperSetupChartDisplayComponent implements OnInit {
    
    chartData:any;
    chartType:any;
    svg;
    radius;
    colors;
    borderColors;
    multiLevelData = [];
    pieWidth;


    constructor(@Inject(MAT_DIALOG_DATA) public data:any) {
            this.chartData=data.data;
            this.chartType=data.chartType;
    }

    ngOnInit() {
        switch(this.chartType)
        {
            case "Question Type Chart":
            this.createSvg();
            this.createColors();
            this.createborderColors()
            this.drawQTChart(this.colors);
            break;
            case "Chapter Topic Weightage Chart":
            this.createSvg();
            this.setMultilevelData(this.chartData);
            this.pieWidth=Number(this.radius / this.multiLevelData.length) - this.multiLevelData.length;
            for (var i = 0; i < this.multiLevelData.length; i++) {
            var _cData = this.multiLevelData[i];
            this.drawCTWChart(_cData, i);
            }   
            break;
        }
    }

    createSvg() {
        let margin =0;
        let width = document.querySelector<HTMLElement>(".mat-dialog").offsetWidth-20;
        let height = 420;
        this.radius = Math.min(width, height ) / 2 - margin;
        this.svg = d3.select("figure#pie")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr(
          "transform",
          "translate(" + width / 2 + "," + height / 2 + ")"
        );

    }


    createColors() {
        this.colors = d3.scaleOrdinal()
        .range([
                'rgba(255, 99, 132, 0.5)',
                'rgba(54, 162, 235, 0.5)',
                'rgba(255, 206, 86, 0.5)',
                'rgba(75, 192, 192, 0.5)',
                'rgba(153, 102, 255, 0.5)',
                'rgba(255, 159, 64, 0.5)'
          ]);
    }

    createborderColors() {
        this.borderColors = d3.scaleOrdinal()
        .range([
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
              ]);
    }


    drawQTChart(colors:any) {
        const pie = d3.pie<any>().value((d: any) => Number(d.Number));

        //donutTip Styling
        let donutTip = d3.select(".mat-dialog").append("div")
        .style("opacity","0")
        .style("background","#FFF")
        .style("text-align","center")
        .style("padding","5px")
        .style("color","#313639")
        .style("border","1px solid #313639")
        .style("border-radius","8px")
        .style("pointer-events","none")
        .style("font-size","15px");

        // Build the pie chart
        this.svg
        .selectAll('pieces')
        .data(pie(this.chartData))
        .enter()
        .append('path')
        .attr('d', d3.arc()
          .innerRadius(105)
          .outerRadius(this.radius)
        )
        .attr('fill', (d, i) => (this.colors(i)))
        .attr("stroke", (d, i) => (this.borderColors(i)))
        .style("stroke-width", "1px")
        .on('mouseover', function (event,d, i) {
            d3.select(this).transition()
                .duration(100)
                .attr('opacity', '0.85');
            donutTip.transition()
                .duration(100)
                .style("opacity", 1);
            let num = d.data.Question_type+"<br>"+d.data.Number;
            donutTip.html(num)
            .style("position","absolute")
            .style("left",+event.pageX+"px")
            .style("top",+event.pageY+"px");

        })
        .on('mouseout', function (d, i) {
            d3.select(this).transition()
                .duration(100)
                .attr('opacity', 1);
            donutTip.transition()
                .duration(100)
                .style("opacity", 0);
        })
        .on('click', function (event,d, i) {
            alert("Question Type: "+d.data.Question_type+"\n"+"Number of Questions: "+d.data.Number);
        });


        //Legend design and position
        var legendRectSize = 13;
        var legendSpacing = 7;   
        var legend = this.svg.selectAll('.legend')
        .data(colors.domain())
        .enter()
        .append('g')
        .attr('class', 'circle-legend')
        .attr('transform', function (d, i) {
            var height = legendRectSize + legendSpacing;
            var offset = height * colors.domain().length / 2;
            var horz = -4.5 * legendRectSize - 13;
            var vert = i * height - offset;
            return 'translate(' + horz + ',' + (vert+14) + ')';
        });

        legend.append('circle')
        .style('fill', colors)
        .style('stroke', colors)
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', '.5rem');

        legend.append('text')
        .data(pie(this.chartData))
        .attr('x', legendRectSize + legendSpacing)
        .attr('y', legendRectSize - legendSpacing)
        .text(d=>d.data.Question_type);


        // Add labels
        const labelLocation = d3.arc()
        .innerRadius(115)
        .outerRadius(this.radius);

        this.svg
        .selectAll('pieces')
        .data(pie(this.chartData))
        .enter()
        .append('text')
        .text(d => (d.data.Number>0)?d.data.Question_type+" ("+d.data.Number+")":"" )
        .attr("transform", d => "translate(" + labelLocation.centroid(d) + ")")
        .style("text-anchor", "middle")
        .style("font-size", 13);
    }

    setMultilevelData(data){
    if (data == null)
        return;
    var level = data.length,
        counter = 0,
        index = 0,
        currentLevelData = [],
        queue = [];
    for (var i = 0; i < data.length; i++) {
        queue.push(data[i]);
    };

    while (queue.length != 0) {
        var node = queue.shift();
        currentLevelData.push(node);
        level--;

        if (node.topic) {
            for (var i = 0; i < node.topic.length; i++) {
                queue.push(node.topic[i]);
                counter++;
            };
        }
        if (level == 0) {
            level = counter;
            counter = 0;            
            this.multiLevelData.push(currentLevelData);
            currentLevelData = [];
        }
    }

  }

   drawCTWChart(_data,index)
  {
    var color = d3.scaleOrdinal()
    .range([
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)',
            'rgba(34, 139, 34, 0.5)',
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)',
            'rgba(255, 159, 64, 0.5)'
          ]);

    var borderColors = d3.scaleOrdinal()
    .range([
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(34, 139, 34, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ]);

    //donutTip Styling
        let donutTip = d3.select(".mat-dialog").append("div")
        .style("opacity","0")
        .style("background","#FFF")
        .style("text-align","center")
        .style("padding","5px")
        .style("color","#313639")
        .style("border","1px solid #313639")
        .style("border-radius","8px")
        .style("pointer-events","none")
        .style("font-size","15px");
      // var color=d3.scaleOrdinal(d3.schemeCategory10);
    var pie = d3.pie()
        .sort(null)
        .value(function(d:any) {
            return Number(d.chapter.percentage);
        });
    var arc = d3.arc()
        .outerRadius(((index + 1) * 70 )+60)
        .innerRadius(((index) * 70)+60);

    var g = this.svg.selectAll(".arc" + index).data(pie(_data)).enter().append("g")
        .attr("class", "arc" + index);

    g.append("path").attr('d', arc)
        .style("fill", function(d) {
            return color(d.data.chapter.name);
        })
        .attr("stroke", function(d) {
            return borderColors(d.data.chapter.name);
        })
        .style("stroke-width", "1px")
        .on('mouseover', function (event,d, i) {
        d3.select(this).transition()
            .duration(100)
            .attr('opacity', '0.85');
            donutTip.transition()
                .duration(100)
                .style("opacity", 1);
            let num = d.data.chapter.name+"<br>"+d.data.chapter.percentage;
            donutTip.html(num)
            .style("position","absolute")
            .style("left",+event.pageX+"px")
            .style("top",+event.pageY+"px");

        })
        .on('mouseout', function (d, i) {
        d3.select(this).transition()
            .duration(100)
            .attr('opacity', 1);
            donutTip.transition()
                .duration(100)
                .style("opacity", 0);
        });

    g.append("text").attr("transform", function(d) {
            return "translate(" + arc.centroid(d) + ")";
        })
        .attr("dy", ".35em").style("text-anchor", "middle")
        .text(function(d) {
            let name=d.data.chapter.name;
            name=name.slice(0,5)+"...";
            return name;
        });
  }

}
