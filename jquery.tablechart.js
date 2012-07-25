(function($) {

// Simple UID from http://forum.jquery.com/topic/return-unique-id-with-jquery-data-elem
var uid = 0;
$.getUID = function() {
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
      charts[options.chartName] = new $.tablechart(this, options);
      $(this).data('tablechart', charts);
    }
    charts[options.chartName].draw();
  });
  return this;
};

/**
 * Tablechart object constructor
 */
$.tablechart = function(el, options) {
  // Properties
  this.options = options;
  this.el = el;
  this.series = [];
  this.offset = 0;

  // Create container
  this.chartId = 'chart-' + $.getUID();
  this.chartContainer = $('<div class="tablechart">').attr('id', this.chartId);

  if (options.height) { this.chartContainer.height(options.height); }
  if (options.width)  { this.chartContainer.width(options.width); }

  // Attach container
  options.attachMethod.call(this, this.chartContainer);
}

/** 
 * Tablechart draw method
 */
$.tablechart.prototype.draw = function() {
  var tables, data;

  if (this.chart) {
    this.offset = 0;
    this.series = [];
  }
    // Is matched element a table?
  if (!$.nodeName(this.el, 'table')) {
    tables = $('table', this.el);
    this.options.scrapeMultiple.call(this, tables);
  } else {
    tables = $(this.el);
    this.options.scrapeSingle.call(this, tables);
  }

  if (!this.chart) {
    this.chart = $.jqplot(this.chartId, this.series, this.options.plotOptions);
  }
  else {
    for (i=0; i < this.series.length; i++) {
      if (this.chart.series[i] != undefined) {
        this.chart.series[i].data = this.series[i];
        this.chart.replot();  // replot options {resetAxes: true});
      }
    }
  }
}

/**
 * Utility function: Scrape single table for values
 */
$.tablechart.scrapeSingle = function(table) {
  var series = [],
      options = this.options,
      tablechart = this,
      offset = this.offset;

  if (options.headerSeriesLabels) {
    $(table).find('thead th:gt(0)').each(function(i) {
      var idx = offset + i,
          dataOptions = $.tablechart.replaceOptions($(this).data('seriesoptions'));
      options.plotOptions.series[idx] = $.extend(
        {label: $(this).text()}, 
        options.plotOptions.series[idx],
        dataOptions
      );
    });
  }

  $(table).find('tbody tr').each(function(i) {
    var x = 0, y = 0;
    $(this).find('th').each(function() {
      x = options.parseX.call(tablechart, this);
    });
    $(this).find('td').each(function(j) {
      idx = offset + j;
      if (!tablechart.series[idx]) {
        tablechart.series[idx] = [];
      }
      y = options.parseY.call(tablechart, this);
      tablechart.series[idx].push([x, y]);
      if (i == 0) {
        tablechart.offset++;
      }
    });
  });
}

/**
 * Utility function: Scrape multiple tables for values
 */
$.tablechart.scrapeMultiple = function(tables) {
  var series = [],
      options = this.options,
      tablechart = this,
      seriesOptions = [];

  $(tables)
    .not('.jqplot-target table') // Filter out jqplot-added tables
    .each(function(i) {
      var table = this;
      // Scrape each matched table
      $.tablechart.scrapeSingle.call(tablechart, this);
    });
}

/**
 * Utility function: Parse text
 */
$.tablechart.parseText = function(el) {
  return $(el).text();
}

/**
 * Utility function: Parse text to floating point
 */
$.tablechart.parseFloat = function(el) {
  return parseFloat($(el).text());
}

/**
 * Constant for replacement
 */
$.tablechart.REPLACE = ['renderer', 'markerRenderer', 'labelRenderer', 'parseX',
    'parseY', 'scrapeSingle', 'scrapeMultiple', 'tickRenderer',
    'processSeries', 'formatter', 'tooltipContentEditor'];

/**
 * Utility function: Replace whitelisted string options with their 
 * function callback.
 */
$.tablechart.replaceOptions = function(obj) {
  if (!obj) {
    return obj;
  }
  $.each(obj, function(key, val) {
    if (typeof val == 'object') {
      obj[key] = $.tablechart.replaceOptions(val);
    }
    else if (typeof val == 'string' && $.inArray(key, $.tablechart.REPLACE) > -1) {
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
  headerSeriesLabels: true,
  parseX: $.tablechart.parseText,
  parseY: $.tablechart.parseFloat,
  scrapeSingle: $.tablechart.scrapeSingle,
  scrapeMultiple: $.tablechart.scrapeMultiple,
  attachMethod: function(container) { $(this.el).before(container); },
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
    },
  }
};

})(jQuery);
