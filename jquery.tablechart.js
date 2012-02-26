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

  // Create container
  this.chartId = 'chart-' + $.getUID();
  var test = $.data(this);
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
    data = this.options.scrapeMultiple.call(this, tables);
  } else {
    tables = $(this.el);
    data = this.options.scrapeSingle.call(this, tables);
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
  if (data.series.length > 0) {
    $.extend(true, this.options.plotOptions.series, data.options); 
    this.chart = $.jqplot(this.chartId, data.series, this.options.plotOptions);
  }
}

/**
 * Utility function: Scrape single table for values
 */
$.tablechart.scrapeSingle = function(table) {
  var series = [],
      options = this.options,
      tablechart = this,
      seriesOptions = [];

  if (options.headerSeriesLabels) {
    $(table).find('thead th:gt(0)').each(function(i) {
      options.plotOptions.series[i] = $.extend(
        {label: $(this).text()}, 
        options.plotOptions.series[i]
      );

      // Extend options with custom data attribute     
      var seriesData = $(this).data('jqplotSeriesOptions');
      if (typeof seriesData != 'undefined') {
        seriesOptions[i] = seriesData;
      }
    });
  }

  $(table).find('tbody tr').each(function() {
    var x = 0, y = 0;
    $(this).find('th').each(function() {
      x = options.parseX.call(tablechart, this);
    });
    $(this).find('td').each(function(i) {
      if (!series[i]) {
        series[i] = [];
      }
      y = options.parseY.call(tablechart, this);
      series[i].push([x, y]);
    });
  });

  return { 'series' : series, 'options' : seriesOptions };
}

/**
 * Utility function: Scrape multiple tables for values
 */
$.tablechart.scrapeMultiple = function(tables) {
  var series = [],
      options = this.options,
      tablechart = this,
      seriesOptions = [];

  // Flip on magical "internal" option if scraping multiple
  if (options.headerSeriesLabels) {
    options.headerSeriesLabels = false;
    options.multitablesHeaderSeriesLabels = true;
  }

  var series_idx = 0;
  $(tables)
  .not('.jqplot-target table') // Filter out jqplot-added tables
  .each(function(i) {
    var table = this;
    seriesOptions[i] = {};

    // Extend options with custom data attribute     
    var inlineOptions = $(this).data('jqplotSeriesOptions');
    if (typeof inlineOptions != 'undefined') {
      seriesOptions[i] = $.extend(seriesOptions[i], inlineOptions);
    }

    // Scrape each matched table
    data = $.tablechart.scrapeSingle.call(tablechart, this);
    series = series.concat(data.series);

    // Options passed in constructor override others
    seriesOptions[i] =  $.extend(seriesOptions[i], data.options, options.plotOptions.series[i]); 
  });

  return { 'series' : series, 'options' : seriesOptions };
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
      location: 'se'
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
