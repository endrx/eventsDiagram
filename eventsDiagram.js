/*
eventsDiagram
Copyright (c) 2017 by endrx
MIT License Applies
*/

; (function ($) {
    "use strict";
	
    let EventsDiagram = function (element, options) {

        let control = this;
        control.options = $.extend({}, $.fn.eventsDiagram.Defaults, options);
        control.$element = $(element);

        init();

        function init() {

            //control.$element.css("box-sizing", "border-box").css("border", "1px solid magenta");

            control.$mainContainer = $("<div />").addClass("ed-container");
            control.$cornerHeader = $("<div />").addClass("ed-corner-header");
            control.$cornerHeaderInside = $("<div />");
            control.$cornerHeader.append(control.$cornerHeaderInside);
            control.$leftHeader = $("<div />").addClass("ed-left-header");
            control.$topHeader = $("<div />").addClass("ed-top-header");
            control.$grid = $("<div />").addClass("ed-grid");

            control.$mainContainer
                .append(control.$cornerHeader)
                .append(control.$leftHeader)
                .append(control.$topHeader)
                .append(control.$grid);

            control.$element
                .empty()
                .append(control.$mainContainer);

            control.$mainContainer.on("scroll", function (e) {
                let topOffset = e.currentTarget.scrollTop;
                let leftOffset = e.currentTarget.scrollLeft;
                control.$cornerHeader.css("left", leftOffset + "px");
                control.$cornerHeader.css("top", topOffset + "px");
                control.$topHeader.css("top", topOffset + "px");
                control.$leftHeader.css("left", leftOffset + "px");
            });

            setLeftHeaderWidth(control.options.leftHeadersWidth);
            control.$cornerHeaderInside.html(control.options.cornerHtml);
            buildLeftHeaders();
            buildTopHeaders();

            buildGrid();
            buildBarRows();

            processHeights();
        }

        function setLeftHeaderWidth(newWidth) {
            control.$cornerHeaderInside.css("width", newWidth);
            control.$leftHeader.css("width", newWidth);
            control.$topHeader.css("margin-left", newWidth);
            control.$grid.css("margin-left", newWidth);
        }

        function buildCalendar() {
            let timeRange = findTimeRanges(control.options.events);
            let timeRangeDates = { beginDate: getTimeDay(timeRange.beginTime), endDate: getTimeDay(timeRange.endTime) };

            control.gridBeginTime = new Date(timeRange.beginTime.getFullYear(), timeRange.beginTime.getMonth(), timeRange.beginTime.getDate());
            control.gridEndTime = new Date(timeRange.endTime.getFullYear(), timeRange.endTime.getMonth(), timeRange.endTime.getDate());

            control.months = {};
            control.days = [];

            enumerateDays(control.gridBeginTime, control.gridEndTime, function (day) {
                let month = day.getFullYear() + "/" + (day.getMonth() + 1);
                control.months[month] = 1 + (control.months[month] || 0);
                control.days.push(day.getDate());
            });
        }

        function buildTopHeaders() {

            control.$topHeader.empty();

            buildCalendar();

            let $monthsRow = $("<div />");
            let $daysRow = $("<div />")

            for (let monthName in control.months) {
                var month = control.months[monthName];
                let $month = $("<div />")
                    .addClass("ed-calend-month")
                    .css("width", control.options.columnWidth * month + "px")
                    .text(monthName);
                $monthsRow.append($month);
            }
            control.$topHeader.append($monthsRow);

            for (let dayIndex in control.days) {
                var day = control.days[dayIndex];
                let $day = $("<div />")
                    .addClass("ed-calend-day")
                    .css("width", control.options.columnWidth + "px")
                    .text(day);
                $daysRow.append($day);
            }
            control.$topHeader.append($daysRow);
        }

        function buildLeftHeaders() {

            control.rowHeights = [];

            function buildLeftHeadersRec(events, indent) {
                $.each(events, function (i, event) {

                    let $leftHeaderRow = $("<div />")
                                    .addClass("ed-left-header-item")
                                    .css("padding-left", indent + "px")
                                    .css("color", typeof event.nameColor === "undefined" ? "" : event.nameColor)
                                    .html(event.name);

                    control.$leftHeader.append($leftHeaderRow);

                    buildLeftHeadersRec(event.events, indent + options.leftHeaderIndentStep);

                });
            }
            buildLeftHeadersRec(control.options.events, 5);

        }

        function buildBarRows() {

            let $barRows = $("<div />").addClass("ed-bar-container");

            function buildBarRowsRec(events) {
                $.each(events, function (i, event) {

                    let $barRow = $("<div />")
                                .addClass("ed-bar-row")
                                .css("width", control.options.columnWidth * control.days);

                    let episodes = getEventEpisodes(event);
                    if (episodes != null) {
                        $.each(episodes, function (ii, episode) {
                            let $bar = $("<div />")
                                        .addClass("ed-bar")
                                        .css("left", getPixelSize({ beginTime: control.gridBeginTime, endTime: parseTime(episode.beginTime) }))
                                        .css("width", getPixelSize({ beginTime: parseTime(episode.beginTime), endTime: parseTime(episode.endTime) }))
                                        .css("background-color", episode.color);
                            $barRow.append($bar);
                        });

                        $barRows.append($barRow);
                    }

                    if (typeof event.events !== "undefined" && event.events != null) {
                        buildBarRowsRec(event.events);
                    }
                });
            }

            buildBarRowsRec(control.options.events);

            control.$grid.append($barRows);
        }

        function buildGrid() {

            let $gridCells = $("<div />");

            function buildGridRec(events) {

                $.each(events, function (i, event) {

                    let $cellsRow = $("<div />").addClass("ed-cell-row");

                    $.each(control.days, function (i, day) {

                        let $cell = $("<div />")
                            .addClass("ed-cell")
                            .css("width", control.options.columnWidth + "px");
                        $cellsRow.append($cell);
                });

                    $gridCells.append($cellsRow);

                    if (typeof event.events !== "undefined" && event.events != null) {
                        buildGridRec(event.events);
                }
            });

            }

            buildGridRec(control.options.events);

            control.$grid.append($gridCells);
        }

        function processHeights() {
            setTimeout(function () {

                //let heights = $.map(control.$leftHeader.find(".ed-left-header-item"), function (el) {
                //    return el.offsetheight;
                //});

                let heights = [];
                let totalHeight = 0;
                let lhs = control.$leftHeader.find(".ed-left-header-item");
                for (let i = 0; i < lhs.length; i++) {
                    let height = i < lhs.length - 1 ? lhs[i + 1].offsetTop - lhs[i].offsetTop : lhs[i].offsetHeight;
                    heights.push(height);  
                    totalHeight += height;
                }

                $.each(control.$grid.find(".ed-cell-row"), function (i, el) {
                    $(el).height(heights[i]);
                });
                //control.$grid.find(".ed-bar-container")
                //        .css("top", -totalHeight + "px");
                $.each(control.$grid.find(".ed-bar-row"), function (i, el) {
                    let height = heights[i];
                    $(el)
                        .height(height)
                        .find(".ed-bar").height(height > 20 ? 14 : height - 6);
                });

            }, 1);
        }

        function parseTime(object) {
            if (typeof object == "string")
                return new Date(object);
            return object;
        }

        function findTimeRanges(events) {

            let minTime = null
            let maxTime = null;

            function findTimeRangesInt(events) {

                $.each(events, function (i, event) {
                    let episodes = getEventEpisodes(event);
                    $.each(episodes, function (ii, episode) {
                        if (typeof episode.beginTime !== "undefined") {
                            if (minTime == null || minTime > parseTime(episode.beginTime)) minTime = parseTime(episode.beginTime);
                            if (maxTime == null || maxTime < parseTime(episode.beginTime)) maxTime = parseTime(episode.beginTime);
                        }
                        if (typeof episode.endTime !== "undefined") {
                            if (minTime == null || minTime > parseTime(episode.endTime)) minTime = parseTime(episode.endTime);
                            if (maxTime == null || maxTime < parseTime(episode.endTime)) maxTime = parseTime(episode.endTime);
                        }
                    });

                    if (event.events != null)
                        findTimeRangesInt(event.events);
                });
            }

            findTimeRangesInt(events);

            if (minTime === null && maxTime === null) {
                minTime = new Date();
            }
            if (minTime === null) {
                minTime = maxTime;
                minTime.setMonth(minTime.getMonth() - 1);
            }
            if (maxTime === null) {
                maxTime = minTime;
                maxTime.setMonth(maxTime.getMonth() + 1);
            }

            return {
                beginTime: minTime, endTime: maxTime
            };
        }
        function getTimeDay(time) {
            var day = new Date(time.getFullYear(), time.getMonth(), time.getDate());
            return day;
        }

        function getPixelSize(timeRange) {
            let oneDay = 24 * 60 * 60 * 1000;
            let res = Math.round(Math.abs((timeRange.endTime.getTime() - timeRange.beginTime.getTime()) * control.options.columnWidth / oneDay));
            return res;
        }

        function enumerateDays(beginTime, endTime, cb) {
            let beginDay = getTimeDay(beginTime);
            let endDay = getTimeDay(endTime);
            for (let day = beginDay; day <= endDay; day.setDate(day.getDate() + 1)) {
                cb(day);
            }
        }

        function getEventEpisodes(event) {
            if (typeof event.episodes !== "undefined") {
                return event.episodes.filter(function (episode) {
                    return typeof episode.beginTime !== "undefined" && episode.beginTime != null;
                });
            }
            else if (typeof event.beginTime !== "undefined" && event.beginTime != null) {
                let episodes = [{
                    beginTime: event.beginTime,
                    endTime: event.endTime,
                    color: event.color
                }];
                return episodes;
            }
            else {
                return null;
            }
        }

    }

    EventsDiagram.Version = "0.4.1";

    EventsDiagram.Defaults = {
        events: [],
        leftHeadersWidth: "200px",
        leftHeaderIndentStep: 20,
        columnWidth: 20,
        cornerHtml: ""
    };


    function Plugin(option) {
        return this.each(function () {
            var $this = $(this);
            var data = $this.data("eventsDiagram");

            var options = $.extend({}, EventsDiagram.Defaults, $this.data(), typeof option == 'object' && option);

            if (!data) $this.data('eventsDiagram', (data = new EventsDiagram(this, options)))
            if (typeof option == 'string') data[option]()
        })
    }

    $.fn.eventsDiagram = Plugin;
    $.fn.eventsDiagram.Defaults = EventsDiagram.Defaults;
    $.fn.eventsDiagram.Constructor = EventsDiagram;

})(jQuery);