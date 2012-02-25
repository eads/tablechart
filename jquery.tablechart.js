/**
 * @file jquery.tablechart.js
 *
 * A jQuery plugin that scrapes HTML tables and generates charts with jqPlot
 *
 * Created by David Eads (davideads__at__gmail_com), 2010 for the US 
 * Department of Energy E-Center Project (see the project page at 
 * https://ecenter.fnal.gov and the Google code project at 
 * http://code.google.com/p/ecenter)
 *
 * Released under the Fermitools license (modified BSD). See LICENSE.txt for 
 * more information.
 *
 * Requires jqPlot (http://www.jqplot.com)
 * Requires the jQuery UUID plugin (http://plugins.jquery.com/project/uuid)
 *
 * Usage and behavior notes:
 *
 * Invoke with $(selector).tablechart({options}), or simply 
 * $(selector).tablechart()
 *
 * If the matched element returned by the selector is a table, a chart will
 * be generated from the table. If the matched element returned by the selector
 * contains one or more tables, all table data will be added to the chart.
 *
 * Using the default callbacks, data to be plotted should be wrapped in a proper 
 * <tbody> tag, and each row should provide a <th> tag that includes the x 
 * value for the row. Each column will be added as a new chart series.
 *
 * <table>
 *   <thead>
 *     <tr>
 *      <th>x-axis label</th>
 *      <th>Series 1 label</th>
 *      <th>Series 2 label</th>
 *     </tr>
 *   </thead>
 *   <tbody>
 *     <tr>
 *       <th>X value</th>
 *       <td>Series 1 (y) value</td>
 *       <td>Series 2 (y) value</td>
 *     </tr>
 *     ...
 *   </tbody>
 * </table>
 *
 * If a <thead> is provided and the headerSeriesLabels option is true, the
 * <thead> row will be used to generate series labels unless specified in
 * plotOptions.
 *
 * Series options may be overridden using a custom data attribute. If scraping
 * a single table with columns as series, set the data-jqplotSeriesOptions
 * attribute on the column's table header (thead th tag). If scraping multiple 
 * tablea as series, set the attribute on the table element. The attribute should 
 * contain a JSON representation of any allowed jqPlot series options. Examples
 * of single table, multiple table custom series options:
 *
 * <table>
 *   <thead>
 *     <tr>
 *      <th>x-axis label</th>
 *      <th data-jqplotSeriesOptions="{'linePattern':'dashed'}">Series 1 label</th>
 *      <th data-jqplotSeriesOptions="{'color':'#ff0000'}">Series 2 label</th>
 *     </tr>
 *   </thead>
 *   <tbody>...</tbody>
 * </table>
 *
 * <table data-jqplotSeriesOptions="{'lineWidth':'3.0'}"> ... </table>
 *
 * A note about parsing X and Y values: The tablechart plugin provides two 
 * trivial parsing callbacks for your parsing pleasure: $.tablechart.parseFloat
 * and $.tablechart.parseText.
 *
 * By default, all table data is assumed to be expressed as floats. You may
 * need to use the parseText helper function to account for dates, or define 
 * your own parsing callback to strip out non-numeric characters or apply 
 * special number formatting.
 *
 * All configurable callbacks are call()'d with a $.tablechart instance 
 * provided as the calling context.
 *
 * Configuration options (no options are required):
 *
 *  hideTables: Hide source tables. Boolean or callback to hide values
 *    (default: false)
 *  height: Height of chart container (default: null)
 *  width: Width of chart container (default: null)
 *  chartName: Optional chart name. Override the chart name to create multiple
 *    charts from the same source tables (default: 'default')
 *  headerSeriesLabels: Use headers in thead section to name series 
 *    (default: true)
 *  parseX: Callback to parse X values (default: $.tablechart.parseFloat)
 *  parseY: Callback to parse Y values (default: $.tablechart.parseFloat)
 *  scrapeSingle: Callback for scraping a single table 
 *    (default: $.tablechart.scrapeSingle)
 *  scrapeMultiple: Callback for scraping multiple tables
 *    (default: $.tablechart.scrapeMultiple)
 *  attachMethod: Callback for attaching chart
 *    (default: function(container) { $(this.el).before(container); })
 *  plotOptions: jqPlot options. See jqPlot options documentation for details:
 *    http://www.jqplot.com/docs/files/jqPlotOptions-txt.html
 * 
 */

(function($) {

/**
 * Table chart plugin
 */

// Simple UID from http://forum.jquery.com/topic/return-unique-id-with-jquery-data-elem
var uid = 0;
$.getUID = function() {
  uid++;
  return 'jQ-uid-'+uid;
};


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
  parseX: $.tablechart.parseFloat,
  parseY: $.tablechart.parseFloat,
  scrapeSingle: $.tablechart.scrapeSingle,
  scrapeMultiple: $.tablechart.scrapeMultiple,
  attachMethod: function(container) { $(this.el).before(container); },
  hideTables: false,
  tableClass: 'jqplot-data',
  plotOptions: {series: []}
};

})(jQuery);
