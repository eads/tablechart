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
 *  hideTables: Hide source tables (default: false)
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
 *  processSeries: Callback for series post-processing (default: null)
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
  this.chartId = $.uuid('chart-');
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
  var tables;

  // Is matched element a table?
  if (!$.nodeName(this.el, 'table')) {
    tables = $('table', this.el);
    series = this.options.scrapeMultiple.call(this, tables);
  } else {
    tables = $(this.el);
    series = this.options.scrapeSingle.call(this, tables);
  }

  // Hide tables
  if (this.options.hideTables) {
    tables.hide();
  }

  // Apply any additional series processing
  if (this.options.processSeries) {
    series = this.options.processSeries.call(this, series);
  }

  // Draw chart

  // @TODO Because I don't understand replotting in jqPlot (and/or it is buggy),
  // we simply clear the container and redraw.  This is possibly not ideal, but 
  // it works reliably.
  $('#' + this.chartId).html('');
  if (series.length > 0) {
    this.chart = $.jqplot(this.chartId, series, this.options.plotOptions);
  }
}

/**
 * Utility function: Scrape single table for values
 */
$.tablechart.scrapeSingle = function(table) {
  var series = [];
  var options = this.options;
  var tablechart = this;

  if (options.headerSeriesLabels) {
    $(table).find('thead th:gt(0)').each(function(i) {
      options.plotOptions.series[i] = $.extend(
        {label: $(this).text()}, 
        options.plotOptions.series[i]
      );
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

  return series;
}

/**
 * Utility function: Scrape multiple tables for values
 */
$.tablechart.scrapeMultiple = function(tables) {
  var series = [];
  var options = this.options;
  var tablechart = this;

  // Flip on magical "internal" option if scraping multiple
  if (options.headerSeriesLabels) {
    options.headerSeriesLabels = false;
    options.multitablesHeaderSeriesLabels = true;
  }

  var series_idx = 0;
  $(tables).each(function() {
    // Generate series labels (requires "global" counter)
    if (tablechart.options.multitablesHeaderSeriesLabels) {
      $(this).find('thead th:gt(0)').each(function() {
        options.plotOptions.series[series_idx] = $.extend(
          {label: $(this).text()}, 
          options.plotOptions.series[series_idx]
        );
        series_idx += 1;
      });
    }
    // Now simply scrape each matched table
    series = series.concat($.tablechart.scrapeSingle.call(tablechart, this));
  });

  return series;
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
  hideTables: false,
  height: null,
  width: null,
  chartName: 'default',
  headerSeriesLabels: true,
  parseX: $.tablechart.parseFloat,
  parseY: $.tablechart.parseFloat,
  scrapeSingle: $.tablechart.scrapeSingle,
  scrapeMultiple: $.tablechart.scrapeMultiple,
  processSeries: null,
  attachMethod: function(container) { $(this.el).before(container); },
  plotOptions: {series: []}
};

})(jQuery);
