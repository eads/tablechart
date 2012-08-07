var Tablechart;

(function($) {

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
    var charts = $(this).data('tablechart') || {},
        opts_clone = $.extend(true, {}, options);
    if (charts[options.chartName] == undefined) {
      charts[options.chartName] = new Tablechart(this, opts_clone);
    } 
    charts[options.chartName].plot();
    $(this).data('tablechart', charts);
  });
  return this;
};

Tablechart = function(el, options) {
  this.options = options;
  this.el = el;
  this.chart_id = 'chart-' + getUID();
  this.data = [];
  this.chart = this.create();
}
 

Tablechart.prototype.create = function() {
  // Create container
  var chartContainer = $('<div class="tablechart">').attr('id', this.chart_id).insertBefore($(this.el));
  if (this.options.height) { chartContainer.height(this.options.height); }
  if (this.options.width)  { chartContainer.width(this.options.width); }
}

Tablechart.prototype.plot = function() {
  this.offset = 0;
  tablechart = this;
  if (!$.nodeName(this.el, 'table')) {
    $('table', this.el).each(function() {
      tablechart.scrape(this);
    });
  } else {
    tablechart.scrape(this.el);
  }
  if (this.chart) {
    this.chart.destroy();
  }
  this.chart = $.jqplot(this.chart_id, this.data, this.options.plotOptions);
}

/**
 * Utility function: Scrape single table for values
 */
Tablechart.prototype.scrape = function(table) {
  var tablechart = this,
      options = this.options,
      offset = this.offset,
      data = this.data;

  $(table).find('thead th:gt(0)').each(function(i) {
    var idx = offset + i, dataOptions = {};
    if (options.parseOptions) {
      dataOptions = Tablechart.replaceOptions($(this).data('seriesoptions'));
    }
    options.plotOptions.series[idx] = $.extend({label: $(this).text()}, options.plotOptions.series[idx], dataOptions);
  });

  $(table).find('tbody tr').each(function(i) {
    var x = 0, y = 0;
    $(this).find('th').each(function() {
      x = options.parseX.call(tablechart, this);
    });
    $(this).find('td').each(function(j) {
      var idx = offset + j;
      if (i == 0) {
        data[idx] = [];
      }
      y = options.parseY.call(tablechart, this);
      data[idx].push([x, y]);
    });
  });

  this.offset = data.length; 
}

/**
 * Utility function: Parse text
 */
Tablechart.parseText = function(el) {
  return el.innerText;
}

/**
 * Utility function: Parse text to floating point
 */
Tablechart.parseFloat = function(el) {
  return parseFloat(el.innerText);
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
