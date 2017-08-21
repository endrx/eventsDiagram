# eventsDiagram

Lightweight timeline diagram jQuery plugin.

Example: http://output.jsbin.com/ceweteb


![Sample diagram](http://i.imgur.com/0WaIWup.png)


```javascript

                let events = [
                {
                    name: "Title 1",
                    episodes: [{
                        beginTime: new Date(2017, 7, 29, 14, 0, 0),
                        endTime: new Date(2017, 8, 16, 15, 0, 0),
                        color: "blue",
                        cuts: [{
                          cutTime: new Date(2017, 8, 1, 14, 0, 0),
                          nextColor: "lightblue"
                        }, {
                          cutTime: new Date(2017, 8, 8, 14, 0, 0),
                          nextColor: "gold"
                        }]
                    },
                    {
                        beginTime: new Date(2017, 8, 19, 16, 0, 0),
                        endTime: new Date(2018, 9, 26, 17, 0, 0),
                        color: "cyan"
                    }]
                },
                {
                    name: "Title 2",
                    beginTime: new Date(2017, 8, 15, 18, 0, 0),
                    endTime: new Date(2017, 8, 16, 19, 0, 0),
                    color: "blue",
                    events: [
                        {
                            name: "Title 2.1: long long long long long long long long title",
                            episodes: [{
                                beginTime: new Date(2017, 8, 15, 18, 30, 0),
                                endTime: new Date(2017, 8, 16, 19, 30, 0),
                                color: "red"
                            }],
                            events: [
                                {
                                    name: "Title 2.1.1",
                                    episodes: [{
                                        beginTime: new Date(2017, 8, 15, 18, 30, 0),
                                        endTime: new Date(2017, 8, 16, 19, 30, 0),
                                        color: "green"
                                    }],
                                }
                            ]
                        },
                        {
                            name: "Title 2.2",
                            episodes: [{
                                beginTime: new Date(2017, 8, 16, 18, 30, 0),
                                endTime: new Date(2017, 8, 17, 19, 30, 0),
                            }]
                        }
                    ]
                },
                {
                    name: "Title 3",
                    beginTime: new Date(2017, 7, 29, 14, 0, 0),
                    endTime: new Date(2017, 8, 26, 17, 0, 0),
                    color: "blue",
                    cutTime: new Date(2017, 8, 1, 14, 0, 0),
                    nextColor: "magenta",
                }];

  $(element).eventsDiagram({
      events: events
  });
```



Focused on:


IE11+

Chrome

Firefox


Distributed under an MIT license.
