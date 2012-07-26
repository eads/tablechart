(function($, Tablechart) {

var uid = 0;
function getUID() {
  uid++;
  return 'jQ-uid-'+uid;
};


/**
 * Table chart plugin
 */
$.fn.tablechart = function(options) {
  var options = $.extend(true, {}, $.fn.tablechart.defaults, options);
  this.each(function(i) {
    var charts = $(this).data('tablechart') || {};
    if (charts[options.chartName] == undefined) {
      charts[options.chartName] = new Tablechart(this, options);
      $(this).data('tablechart', charts);
    } 
    else {
      charts[options.chartName].plot();
    }
  });
  return this;
};

Tablechart = function(el, options) {
  this.options = options;
  this.el = el;
  this.$el = $(el);
  this.chart_id = 'chart-' + getUID();
  this.offset = 0;
  
  this.chart = this.create();
  this.plot();
}
 

Tablechart.prototype.create = function() {
  // Create container
  var chartContainer = $('<div class="tablechart">').attr('id', this.chart_id).insertBefore(this.$el);

  if (this.options.height) { chartContainer.height(options.height); }
  if (this.options.width)  { chartContainer.width(options.width); }
  
  return $.jqplot(this.chart_id, [[[]]], this.options.plotOptions);
   
}

Tablechart.prototype.plot = function() {
  // Consolidate plotting here 
  if (!$.nodeName(this.el, 'table')) {
    //table = $('table', this.el);
  } else {
    //this.offset = 0;
    //this.scrape(this.el);
  }
  //console.log(this.chart);
  //var chart = this.chart;
  this.chart.series[0].data = [[2,3],[3,4],[4,5]];
  console.log(this.chart.data);
  //this.chart.init(this.chart_id, this.chart.data); // this.options.plotOptions);
  
  this.chart.reInitialize();
  this.chart.replot(this.options.replotOptions);
  this.chart.redraw(); //this.options.replotOptions);

}

/**
 * Utility function: Scrape single table for values
 */
Tablechart.prototype.scrape = function(table) {
  var chart = this.chart,
      options = this.options,
      offset = this.offset,
      series = this.series;

  if (options.parseOptions) {
    $(table).find('thead th:gt(0)').each(function(i) {
      var idx = offset + i, dataOptions = {};
        dataOptions = Tablechart.replaceOptions($(this).data('seriesoptions'));
      options.plotOptions.series[idx] = $.extend({
        label: $(this).text()}, 
        options.plotOptions.series[idx],
        dataOptions
      );
    });
  }

  $(table).find('tbody tr').each(function(i) {
    var x = 0, y = 0;
    $(this).find('th').each(function() {
      x = options.parseX.call(chart, this);
    });
    $(this).find('td').each(function(j) {
      idx = offset + j; // + j;
      //if (chart.series[idx] == undefined) {
      //  chart.series[idx] = $.extend({}, chart.series[0]);
      //}
      //if (i == 0) {
      //  offset = offset + 1;
      //  chart.series[idx].data = [];
      //}
      //if chart.series[0].data = [];
      y = options.parseY.call(chart, this);
      //if (y == NaN) 
      //console.log(y);
      //console.log(this);
      //}
      //console.log(x);
      //console.log(y);
      if (i == 0 && chart.data[idx] == undefined) {
          chart.data[idx] = [];
      } 
      chart.data[idx].push([x, y]);
    });
  });
}



  
  //if (this.chart) {
    //this.offset = 0;
    //this.series = [];
  //}
    //// Is matched element a table?
  //if (!$.nodeName(this.el, 'tabldraw {
    //tables = $('table', this.el);
    //this.scrapeMultiple.call(this, tables);
  //} else {
    //tables = $(this.el);
    //this.scrapeSingle.call(this, tables);
  //}

//}



/** 
 * Tablechart draw method
 */
/*$.tablechart.prototype.draw = function() {
  var tables, data;

  if (!this.chart) {
    this.chart = $.jqplot(this.chartId, this.series, this.options.plotOptions);
  }
  else {
    for (i=0; i < this.series.length; i++) {
      if (this.chart.series[i] != undefined) {
        this.chart.series[i].data = this.series[i];
        this.chart.replot(this.options.replotOptions);  
      }
    }
  }
}*/

/**
 * Utility function: Scrape single table for values
 */
//$.tablechart.scrapeSingle = function(table) {
  //var series = [],
      //options = this.options,
      //tablechart = this,
      //offset = this.offset;

  //if (options.headerSeriesLabels) {
    //$(table).find('thead th:gt(0)').each(function(i) {
      //var idx = offset + i,
          //dataOptions = $.tablechart.replaceOptions($(this).data('seriesoptions'));
      //options.plotOptions.series[idx] = $.extend(
        //{label: $(this).text()}, 
        //options.plotOptions.series[idx],
        //dataOptions
      //);
    //});
  //}

  //$(table).find('tbody tr').each(function(i) {
    //var x = 0, y = 0;
    //$(this).find('th').each(function() {
      //x = options.parseX.call(tablechart, this);
    //});
    //$(this).find('td').each(function(j) {
      //idx = offset + j;
      //if (!tablechart.series[idx]) {
        //tablechart.series[idx] = [];
      //}
      //y = options.parseY.call(tablechart, this);
      //tablechart.series[idx].push([x, y]);
      //if (i == 0) {
        //tablechart.offset++;
      //}
    //});
  //});
//}

/**
 * Utility function: Scrape multiple tables for values
 */
//$.tablechart.scrapeMultiple = function(tables) {
  //var series = [],
      //options = this.options,
      //tablechart = this,
      //seriesOptions = [];

  //$(tables)
    //.not('.jqplot-target table') // Filter out jqplot-added tables
    //.each(function(i) {
      //var table = this;
      //// Scrape each matched table
      //$.tablechart.scrapeSingle.call(tablechart, this);
    //});
//}

/**
 * Utility function: Parse text
 */
Tablechart.parseText = function(el) {
  return $(el).text();
}

/**
 * Utility function: Parse text to floating point
 */
Tablechart.parseFloat = function(el) {
  return parseFloat($(el).text());
}

Tablechart.REPLACE = ['renderer', 'markerRenderer', 'labelRenderer', 'parseX',
    'parseY', 'scrapeSingle', 'scrapeMultiple', 'tickRenderer',
    'processSeries', 'formatter', 'tooltipContentEditor'];


/**
 * Utility function: Replace whitelisted string options with their 
 * function callback.
 */
Tablechart.replaceOptions = function(obj) {
  if (!obj) {
    return obj;
  }
  $.each(obj, function(key, val) {
    if (typeof val == 'object') {
      obj[key] = Tablechart.replaceOptions(val);
    }
    else if (typeof val == 'string' && $.inArray(key, Tablechart.REPLACE) > -1) {
      namespaces = val.split(".");
      func = namespaces.pop();
      context = window;
      for (var i = 0; i < namespaces.length; i++) {
        context = context[namespaces[i]];
      }
      obj[key] = context[func];
    }
  });
  return obj;
}


/**
 * Defaults
 */
$.fn.tablechart.defaults = {
  height: null,
  width: null,
  chartName: 'default',
  parseX: Tablechart.parseText,
  parseY: Tablechart.parseFloat,
  parseOptions: false,
  plotOptions: {
    series: [],
    seriesColors: [ '#b2182b', '#2166ac', '#542788', '#b35806', '#8073ac', '#fdb863' ],
    axes:{
      xaxis: {
        renderer: $.jqplot.CategoryAxisRenderer
      }
    },
    legend: {
      show: true,
      location: 'nw'
    },
    grid: {
      background: '#ffffff',
      gridLineColor: '#dddddd',
      shadow: false
    },
    seriesDefaults: {
      lineWidth: 1.5,
      shadow: false,
      markerOptions: {
        size: 7,
        shadow: false
      },
      rendererOptions: {
        barPadding: 4 
      }
    }
  },
  replotOptions: { resetAxes: true }
};

})(jQuery);
