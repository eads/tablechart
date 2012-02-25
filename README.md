# Tablechart jQuery plugin

Tablechart is a jQuery plugin that scrapes HTML tables and generates charts with jqPlot.

Requires jqPlot (http://www.jqplot.com)

Developed by David Eads (davideads@gmail.com). Originally created for the US Department of 
Energy [E-Center Project](https://github.com/ecenter/ecenter). Released under the 
Fermitools license (modified BSD). See LICENSE.txt for more information.

## Setup

jQuery 1.4+, jqPlot, and jqPlot's categoryAxisRenderer plugin are required
in the default configuration. Any additional jqPlot plugins (such as the 
dateAxisRenderer plugin for timeseries) must also be included. Your HTML should
include a stanza similar to this:

```
<script src="path-to-jquery/jquery.min.js" type="text/javascript"></script>

<script src="path-to-jqplot/jquery.jqplot.min.js" type="text/javascript"></script>
<script src="path-to-jqplot/plugins/jqplot.categoryAxisRenderer.js" type="text/javascript"></script>
<script src="path-to-jqplot/plugins/jqplot.dateAxisRenderer.js" type="text/javascript"></script>

<script src="path-to-tablechart/jquery.tablechart.js" type="text/javascript"></script>

<link type="style/css" rel="stylesheet" href="path-to-jqplot/jquery.jqplot.min.css" type="text/javascript" />
```

## Basic usage

Invoke with:

```
$('table-selector').tablechart(options);
``` 

Options are not required.

## Formatting your table(s)

If the matched element returned by the selector is a table, a chart will
be generated from the table. If the matched element returned by the selector
contains one or more tables, all table data will be added to the chart.

Using the default callbacks, data to be plotted should be wrapped in a proper 
`<tbody>` tag, and each row should provide a `<th>` tag that includes the x 
value for the row. Each column will be added as a new chart series.

```
<table>
  <thead>
    <tr>
     <th>x-axis label</th>
     <th>Series 1 label</th>
     <th>Series 2 label</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>X value</th>
      <td>Series 1 (y) value</td>
      <td>Series 2 (y) value</td>
    </tr>
    ...
  </tbody>
</table>
```

## Series labels

If a `<thead>` is provided and the `headerSeriesLabels` option is `true`, the
`<thead>` row will be used to generate series labels unless specified in
plotOptions.

## Custom series options

Series options may be overridden using a custom data attribute. If scraping
a single table with columns as series, set the data-jqplotSeriesOptions
attribute on the column's table header (thead th tag). If scraping multiple 
tablea as series, set the attribute on the table element. The attribute should 
contain a JSON representation of any allowed jqPlot series options. Examples
of single table, multiple table custom series options:

```
<table>
  <thead>
    <tr>
     <th>x-axis label</th>
     <th data-jqplotSeriesOptions="{'linePattern':'dashed'}">Series 1 label</th>
     <th data-jqplotSeriesOptions="{'color':'#ff0000'}">Series 2 label</th>
    </tr>
  </thead>
  <tbody>...</tbody>
</table>

<table data-jqplotSeriesOptions="{'lineWidth':'3.0'}"> ... </table>
```

## Multiple charts from the same table(s)

To create multiple charts from the same table(s) (e.g. a bar chart and a
line chart), include the `chartName` option when invoking tablechart:

```
$('.table-class').tablechart( {'chartName': 'bar-chart'} );
$('.table-class').tablechart( {'chartName': 'line-chart'} );
```

## Configurable callbacks

Most parts of Tablechart's processing and rendering system can be overriden
via callbacks provided in the options. To override the default scraping and
data parsing, override these options with your own functions.

Configurable callbacks are called with a `$.tablechart` instance 
provided as the calling context.

## Options

 * `hideTables`: Hide source tables. Boolean or callback to hide values
   (default: `false`)
 * `height`: Height of chart container (default: `null`)
 * `width`: Width of chart container (default: `null`)
 * `chartName`: Optional chart name. Override the chart name to create multiple
   charts from the same source tables (default: `'default'`)
 * `headerSeriesLabels`: Use headers in `thead` section to name series 
   (default: `true`)
 * `parseX`: Callback to parse X values (default: `$.tablechart.parseText`)
 * `parseY`: Callback to parse Y values (default: `$.tablechart.parseFloat`)
 * `scrapeSingle`: Callback for scraping a single table 
   (default: `$.tablechart.scrapeSingle`)
 * `scrapeMultiple`: Callback for scraping multiple tables
   (default: `$.tablechart.scrapeMultiple`)
 * `attachMethod`: Callback for attaching chart
   (default: `function(container) { $(this.el).before(container); }`)
 * `plotOptions`: jqPlot options. See [jqPlot options documentation](http://www.jqplot.com/docs/files/jqPlotOptions-txt.html) for more information and source for full list of defaults.

