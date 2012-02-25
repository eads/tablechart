# Tablechart jQuery plugin

Tablechart is a jQuery plugin that scrapes HTML tables and generates charts with jqPlot.

Requires jqPlot (http://www.jqplot.com)

Created by David Eads (davideads@gmail.com) for the US Department of Energy [E-Center Project](https://github.com/ecenter/ecenter). Released under the Fermitools license (modified BSD). See LICENSE.txt for 
more information.

## Basic usage

Invoke with `$('selector').tablechart({options})`, or simply 
`$('selector').tablechart()`.

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

## Number parsing

The tablechart plugin provides two trivial parsing callbacks to turn HTML strings into data for jqPlot: `$.tablechart.parseFloat` to convert strings to floating point numbers and `$.tablechart.parseText` to preserve strings.

By default, all table data is assumed to be expressed as floats. You may wish to use the `parseText` helper function to account for dates, or define  your own parsing callback to strip out non-numeric characters or apply special number formatting and preprocessing.

## Multiple charts from the same table

To create multiple charts from the same table(s) (e.g. a bar chart and a line chart), include the `chartName` option when invoking tablechart:

```
$('.table-class').tablechart( {'chartName': 'bar-chart'} );
$('.table-class').tablechart( {'chartName': 'line-chart'} );
```

## Settings

All settings are optional.

 * `hideTables`: Hide source tables. Boolean or callback to hide values
   (default: `false`)
 * `height`: Height of chart container (default: `null`)
 * `width`: Width of chart container (default: `null`)
 * `chartName`: Optional chart name. Override the chart name to create multiple
   charts from the same source tables (default: `'default'`)
 * `headerSeriesLabels`: Use headers in `thead` section to name series 
   (default: `true`)
 * `parseX`: Callback to parse X values (default: `$.tablechart.parseFloat`)
 * `parseY`: Callback to parse Y values (default: `$.tablechart.parseFloat`)
 * `scrapeSingle`: Callback for scraping a single table 
   (default: `$.tablechart.scrapeSingle`)
 * `scrapeMultiple`: Callback for scraping multiple tables
   (default: `$.tablechart.scrapeMultiple`)
 * `attachMethod`: Callback for attaching chart
   (default: `function(container) { $(this.el).before(container); }`)
 * `plotOptions`: jqPlot options. See [jqPlot options documentation](http://www.jqplot.com/docs/files/jqPlotOptions-txt.html) for more information.

All configurable callbacks are `call`ed with a `$.tablechart` instance 
provided as the calling context.

