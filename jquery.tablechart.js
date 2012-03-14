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

  // Is matched element a table?
  if (!$.nodeName(this.el, 'table')) {
    tables = $('table', this.el);
    this.options.scrapeMultiple.call(this, tables);
  } else {
    tables = $(this.el);
    this.options.scrapeSingle.call(this, tables);
  }

  // Hide tables
  if (this.options.hideTables && $.isFunction(this.options.hideTables)) {
    this.options.hideTables.call(this, tables);
  }
  else if (this.options.hideTables) {
    tables.hide();
  }

  // Add class
  if (this.options.tableClass) {
    $(this.el).addClass(this.options.tableClass);
  }
  
  // @TODO Because I don't understand replotting in jqPlot (and/or it is buggy),
  // we simply clear the container and redraw.  This is possibly not ideal, but 
  // it works reliably.
  $('#' + this.chartId).html('');
  if (this.series.length > 0) {
    this.chart = $.jqplot(this.chartId, this.series, this.options.plotOptions);
  }
}

/**
 * Utility function: Scrape single table for values
 */
$.tablechart.scrapeSingle = function(table) {
  var series = [],
      options = this.options,
      tablechart = this,
      seriesOptions = [],
      offset = this.offset;

  if (options.headerSeriesLabels) {
    $(table).find('thead th:gt(0)').each(function(i) {
      idx = offset + i;
      options.plotOptions.series[idx] = $.extend(
        {label: $(this).text()}, 
        options.plotOptions.series[idx]
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
  hideTables: false,
  tableClass: 'jqplot-data',
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
