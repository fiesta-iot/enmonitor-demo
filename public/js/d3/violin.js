 var chart1;

 function ViolinPlot(input) {

     // Flush the chart every time the function is called
     // d3.select("svg").remove();
     $("#violin-chart").html("");


     chart1 = makeDistroChart({
         data: input,
         xName: 't',
         yName: 'v',
         axisLabels: {
             xAxis: 'Time',
             yAxis: phenomenon_uom[$('#history_option').html().split('&')[0]]
         },
         selector: "#violin-chart",
         yTicks: 0.4,
         chartSize: { width: $("#violin-chart").width(), height: $("#violin-chart").height() },
         margin: { top: 15, right: 5, bottom: 60, left: 50 },
         constrainExtremes: false
     });
     chart1.renderBoxPlot();
     chart1.renderDataPlots();
     chart1.renderNotchBoxes({
         showNotchBox: false
     });
     chart1.renderViolinPlot({
         showViolinPlot: false
     });
     chart1.dataPlots.change({ showLines: ['median'] });
 }