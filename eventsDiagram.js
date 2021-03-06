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

        redraw();

        function redraw() {

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

            function scrollReaction(target) {
                let topOffset = target.scrollTop;
                let leftOffset = target.scrollLeft;
                control.$cornerHeader.css("left", leftOffset + "px");
                control.$cornerHeader.css("top", topOffset + "px");
                control.$topHeader.css("top", topOffset + "px");
                control.$leftHeader.css("left", leftOffset + "px");
            }
            let scrollTimeout = null;
            control.$mainContainer.on("scroll", function (e) {
                //if (isMobile()) {
                //    if (scrollTimeout !== null) {
                //        clearTimeout(scrollTimeout);
                //    }
                //    control.$cornerHeader.hide();
                //    control.$leftHeader.hide();
                //    scrollTimeout = setTimeout(function () {
                //        control.$cornerHeader.show();
                //        control.$leftHeader.show();
                //        scrollTimeout = null;
                //        scrollReaction();
                //    }, 250);
                //}
                //else
                    scrollReaction(e.currentTarget);
            });

            setLeftHeaderWidth(control.options.leftHeadersWidth);
            control.$cornerHeaderInside.html(control.options.cornerHtml);
            buildLeftHeaders();
            buildTopHeaders();

            buildGrid();
            buildEventRows();

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
            control.dates = [];

            enumerateDays(control.gridBeginTime, control.gridEndTime, function (date) {
                let month = date.getFullYear() + "." + ("0" + (date.getMonth() + 1)).substr(-2);
                control.months[month] = 1 + (control.months[month] || 0);
                control.days.push(date.getDate());
                control.dates.push(new Date(date));
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
                let color = null;
                if (options.cellColorSetter != null) {
                    color = options.cellColorSetter({
                        date: control.dates[dayIndex],
                        event: null
                    });
                }
                let $day = $("<div />")
                    .addClass("ed-calend-day")
                    .css("width", control.options.columnWidth + "px")
                    .css("background-color", color)
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

        function buildEventRows() {

            let $eventRows = $("<div />").addClass("ed-events-container");
            let isEpisodeClick = options.episodeClick != null;

            function buildEventRowsRec(events) {
                $.each(events, function (iEvent, event) {

                    let $eventRow = $("<div />")
                                .addClass("ed-event")
                                .css("width", control.options.columnWidth * control.days);

                    let episodes = getEventEpisodes(event);
                    if (episodes != null) {
                        $.each(episodes, function (iEpisode, episode) {
                            let episodePixelOffset = getPixelSize({ beginTime: control.gridBeginTime, endTime: parseTime(episode.beginTime) });
                            let episodePixelWidth = getPixelSize({ beginTime: parseTime(episode.beginTime), endTime: parseTime(episode.endTime) });
                            let $episode = $("<div />")
                                        .addClass("ed-episode")
                                        .css("left", episodePixelOffset)
                                        .css("width", episodePixelWidth)
                                        .css("background-color", episode.color)
                                        .css("cursor", isEpisodeClick ? "pointer" : "default")
                                        .on("click", function () {
                                            if (isEpisodeClick) {
                                                options.episodeClick({
                                                    episode: episode,
                                                    event: event
                                                });
                                            }
                                        });

                            let cuts = getEpisodeCuts(episode);
                            if (cuts != null) {
                                $.each(cuts, function (iCut, cut) {
                                    let endTime = episode.endTime;
                                    let widthDelta = -1;
                                    if(iCut < cuts.length - 1) {
                                        endTime = cuts[iCut + 1].cutTime;
                                        widthDelta++;
                                    }
                                    let pixelOffset = getPixelSize({ beginTime: parseTime(episode.beginTime), endTime: parseTime(cut.cutTime) });
                                    let pixelWidth = getPixelSize({ beginTime: parseTime(cut.cutTime), endTime: parseTime(endTime) });
                                    if (pixelOffset > 0) {
                                        pixelOffset--;
                                    }
                                    else {
                                        widthDelta--;
                                    }
                                    pixelWidth += widthDelta;
                                    let $cutNext = $("<div />")
                                            .addClass("ed-cut")
                                            .css("left", pixelOffset)
                                            .css("width", pixelWidth)
                                            .css("background-color", cut.nextColor);
                                    $episode.append($cutNext);
                                });
                            }

                            $eventRow.append($episode);
                        });

                        $eventRows.append($eventRow);
                    }

                    if (typeof event.events !== "undefined" && event.events != null) {
                        buildEventRowsRec(event.events);
                    }
                });
            }

            buildEventRowsRec(control.options.events);

            control.$grid.append($eventRows);
        }

        function buildGrid() {

            let $gridCells = $("<div />");

            function buildGridRec(events) {

                $.each(events, function (i, event) {

                    let $cellsRow = $("<div />").addClass("ed-cell-row");

                    $.each(control.days, function (iDay, day) {

                        let color = null;
                        if (options.cellColorSetter != null) {
                            color = options.cellColorSetter({
                                date: control.dates[iDay],
                                event: event
                            });
                        }

                        let $cell = $("<div />")
                            .addClass("ed-cell")
                            .css("width", control.options.columnWidth + "px")
                            .css("background-color", color);
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
                $.each(control.$grid.find(".ed-event"), function (i, el) {
                    let height = heights[i];
                    $(el)
                        .height(height)
                        .find(".ed-event").height(height > 20 ? 14 : height - 6);
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
            if (typeof event.episodes !== "undefined" && event.episodes !== null) {
                return event.episodes.filter(function (episode) {
                    return typeof episode.beginTime !== "undefined" && episode.beginTime != null;
                });
            }
            else if (typeof event.beginTime !== "undefined" && event.beginTime != null) {
                let episodes = [{
                    beginTime: event.beginTime,
                    endTime: event.endTime,
                    color: event.color,
                    cuts: event.cuts
                }];
                if (typeof event.cutTime !== "undefined") {
                    episodes[0].cuts = [{
                        cutTime: event.cutTime,
                        nextColor: event.nextColor
                    }];
                }
                return episodes;
            }
            else {
                return null;
            }
        }
        function getEpisodeCuts(episode) {
            if (typeof episode.cutTime !== "undefined") {
                return [{
                    cutTime: episode.cutTime,
                    nextColor: episode.nextColor
                }];
            }
            return episode.cuts;
        }

        function isMobile() {
            return typeof window.orientation !== "undefined";
        };

    }

    EventsDiagram.Version = "0.4.8";

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