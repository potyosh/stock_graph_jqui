//ファイルを一気に呼んでプロット
//jenkinsでテストばんとしてチェックアウト実行
//軸の合ったところでハイライト
var stock_data = [
    []
];

var plot = "";
var plot2 = "";
var maxprice = 0;
var dict = {};
var stock_codes = [];
var test = "9945T";
var fileStr = ""

var formatDate = function(date, format) {
    if (!format) format = 'YYYY-MM-DD hh:mm:ss.SSS';
    format = format.replace(/YYYY/g, date.getFullYear());
    format = format.replace(/MM/g, ('0' + (date.getMonth() + 1)).slice(-2));
    format = format.replace(/DD/g, ('0' + date.getDate()).slice(-2));
    format = format.replace(/hh/g, ('0' + date.getHours()).slice(-2));
    format = format.replace(/mm/g, ('0' + date.getMinutes()).slice(-2));
    format = format.replace(/ss/g, ('0' + date.getSeconds()).slice(-2));
    if (format.match(/S/g)) {
        var milliSeconds = ('00' + date.getMilliseconds()).slice(-3);
        var length = format.match(/S/g).length;
        for (var i = 0; i < length; i++) format = format.replace(/S/, milliSeconds.substring(i, i + 1));
    }
    return format;
};

jQuery(function() {
    $.when($.get("input_data.csv", function(file_data) {
        var input_data = Papa.parse(file_data);
        $(input_data.data).each(function() {
            stock_codes.push(this[1])
        })
    })).done(function() {
        $(stock_codes).each(function(iFileIndex) {
            $.get(this + ".csv", function(file_data) {
                var parsed_data = Papa.parse(file_data);
                $(parsed_data.data).each(function() {
                    if (this[0] && this[6]) {
                        this[0] = formatDate(new Date(this[0]), 'YYYY/MM/DD');
                        stock_data[0].push([this[0], this[6]]);
                        if (maxprice < this[6]) {
                            maxprice = this[6];
                        }
                    }
                });
            }).done(function() {
                //make dictionary
                for (var i = 0; i < stock_data[0].length; i++) {
                    dict[stock_data[0][i][0]] = stock_data[0][i][1]
                }
                maxprice = parseInt(maxprice * 1.1, 10);
                plot = jQuery.jqplot(
                    stock_codes[iFileIndex],
                    stock_data, {
                        axes: {
                            xaxis: {
                                renderer: jQuery.jqplot.DateAxisRenderer,
                                tickOptions: {
                                    formatString: '%D'
                                },
                            },
                            yaxis: {
                                max: String(maxprice)
                            }
                        },
                        highlighter: {
                            show: true,
                            showTooltip: true,
                            sizeAdjust: 7.5
                        },
                        cursor: {
                            show: true,
                            showVerticalLine: true,
                            showHorizontalLine: false,
                        }
                    }
                );

                //Initialize plot data
                stock_data = [[]];
                /* CLICK CODE START*/
                $('#' + stock_codes[iFileIndex]).bind('jqplotDataClick',
                    function(ev, seriesIndex, pointIndex, data) {
                        var a = 1;
                        alert(1);
                    }
                );
                /* CLICK CODE END*/
                $('#' + stock_codes[iFileIndex]).bind('jqplotMouseMove',
                    function(ev, gridpos, datapos, neighbor, data) {
                        var stock_price = 0;
                        $("#myTooltip").remove();
                        var date = new Date(datapos.xaxis);
                        var dateStr = formatDate(new Date(date), 'YYYY/MM/DD');
                        if (neighbor) {} else {
                            stock_price = dict[dateStr];
                            for (i = 0; i < stock_codes.length; i++) {
                                console.log(stock_codes[i]);
                            }
                            if (stock_price != 0) {
                                var toolTip = $('<div />').attr("id", "myTooltip")
                                    .addClass("jqplot-highlighter-tooltip")
                                    .css("position", "absolute")
                                    .css("left", (gridpos.x - 10) + "px")
                                    .css("top", (gridpos.y - 10) + "px")
                                    .css("background", "white")
                                    .css("padding", "3px")
                                    .css("z-index", "20")
                                    .text(stock_price);
                                $(plot.targetId).append(toolTip);
                            }
                        }
                    });

                $('#' + stock_codes[iFileIndex]).bind('jqplotMouseLeave',
                    function(ev, gridpos, datapos, neighbor, data) {
                        $("#myTooltip").remove();
                    });

            });

        });
    });


});
