require("../env");
require("../../d3");
require("../../d3.chart");

var vows = require("vows"),
    assert = require("assert");

var suite = vows.describe("d3.chart.axis");

suite.addBatch({
  "axis": {
    topic: function() {
      return d3.chart.axis;
    },

    "scale": {
      "defaults to a linear scale": function(axis) {
        var a = axis(), x = a.scale();
        assert.deepEqual(x.domain(), [0, 1]);
        assert.deepEqual(x.range(), [0, 1]);
        assert.equal(x(0.5), 0.5);
      },
      "can be defined as a scale object": function(axis) {
        var x = d3.scale.linear(), a = axis().scale(x);
        assert.equal(a.scale(), x);
      }
    },

    "tickSize": {
      "defaults to six pixels": function(axis) {
        var a = axis();
        assert.equal(a.tickSize(), 6);
      },
      "can be defined as a number": function(axis) {
        var a = axis().tickSize(3);
        assert.equal(a.tickSize(), 3);
      },
      "coerces input value to a number": function(axis) {
        var a = axis().tickSize("3");
        assert.strictEqual(a.tickSize(), 3);
      },
      "affects the generated domain path": function(axis) {
        var a = axis().tickSize(3),
            g = d3.select("body").html("").append("svg:g").call(a),
            path = g.select("path.domain");
        assert.equal(path.attr("d"), "M0,3V0H1V3");
      },
      "affects the generated tick lines": function(axis) {
        var a = axis().tickSize(3),
            g = d3.select("body").html("").append("svg:g").call(a),
            line = g.selectAll("g.tick line");
        line.each(function() {
          assert.equal(d3.select(this).attr("y2"), 3);
        });
      },
      "if negative, labels are placed on the opposite end": function(axis) {
        var a = axis().tickSize(-80),
            g = d3.select("body").html("").append("svg:g").call(a),
            line = g.selectAll("g.tick line"),
            text = g.selectAll("g.tick text");
        line.each(function() {
          assert.equal(d3.select(this).attr("y2"), -80);
        });
        text.each(function() {
          assert.equal(d3.select(this).attr("y"), 3);
        });
      }
    },

    "tickPadding": {
      "defaults to three pixels": function(axis) {
        var a = axis();
        assert.equal(a.tickPadding(), 3);
      },
      "can be defined as a number": function(axis) {
        var a = axis().tickPadding(6);
        assert.equal(a.tickPadding(), 6);
      },
      "coerces input value to a number": function(axis) {
        var a = axis().tickPadding("6");
        assert.strictEqual(a.tickPadding(), 6);
      },
      "affects the generated tick labels": function(axis) {
        var a = axis().tickSize(2).tickPadding(7),
            g = d3.select("body").html("").append("svg:g").call(a),
            text = g.selectAll("g.tick text");
        text.each(function() {
          assert.equal(d3.select(this).attr("y"), 9);
        });
      }
    },

    "ticks": {
      "defaults to 10": function(axis) {
        var a = axis();
        assert.deepEqual(a.ticks(), [10]);
      },
      "can be defined as any arguments": function(axis) {
        var b = {}, a = axis().ticks(b, 42), t = a.ticks();
        assert.equal(t[0], b);
        assert.equal(t[1], 42);
        assert.equal(t.length, 2);
      },
      "passes any arguments to the scale's ticks function": function(axis) {
        var x = d3.scale.linear(), b = {}, a = axis().ticks(b, 42).scale(x), aa = [],
            g = d3.select("body").html("").append("svg:g");
        x.ticks = function() { aa.push(arguments); return [42]; };
        g.call(a);
        assert.equal(aa.length, 1);
        assert.equal(aa[0].length, 2);
        assert.equal(aa[0][0], b);
        assert.equal(aa[0][1], 42);
      },
      "affects the generated ticks": function(axis) {
        var a = axis().ticks(20),
            g = d3.select("body").html("").append("svg:g").call(a),
            t = g.selectAll("g.tick");
        assert.equal(t[0].length, 21);
      }
    },

    "tickFormat": {
      "defaults to null": function(axis) {
        var a = axis();
        assert.isTrue(a.tickFormat() == null);
      },
      "when null, uses the scale's tick format": function(axis) {
        var x = d3.scale.linear(), a = axis().scale(x),
            g = d3.select("body").html("").append("svg:g");

        x.tickFormat = function() {
          return function(d) {
            return "foo-" + d;
          };
        };

        g.call(a);
        var t = g.selectAll("g.tick text");
        assert.equal(t.text(), "foo-0");
      },
      "passes any arguments to the scale's tick format function": function(axis) {
        var b = {},
            x = d3.scale.linear(),
            a = axis().scale(x).ticks(b, 42),
            g = d3.select("body").html("").append("svg:g"),
            aa = [];

        x.tickFormat = function() {
          aa.push(arguments);
          return String;
        };

        g.call(a);
        assert.equal(aa.length, 1);
        assert.equal(aa[0].length, 2);
        assert.equal(aa[0][0], b);
        assert.equal(aa[0][1], 42);
      },
      "affects the generated tick labels": function(axis) {
        var a = axis().tickFormat(d3.format("+.2%")),
            g = d3.select("body").html("").append("svg:g").call(a),
            t = g.selectAll("g.tick text");
        assert.equal(t.text(), "+0.00%");
      }
    },

    "enter": {
      "generates a new domain path": function(axis) {
        var a = axis(),
            g = d3.select("body").html("").append("svg:g").call(a),
            path = g.selectAll("path.domain");
        assert.equal(path[0].length, 1);
        assert.equal(path.attr("d"), "M0,6V0H1V6");
        assert.isNull(path.node().nextSibling);
      },
      "generates new tick marks with labels": function(axis) {
        var a = axis(),
            g = d3.select("body").html("").append("svg:g").call(a),
            x = d3.scale.linear(),
            tick = g.selectAll("g.tick"),
            ticks = x.ticks(10),
            tickFormat = x.tickFormat(10);
        assert.equal(tick[0].length, ticks.length);
        tick.each(function(d, i) {
          var t = d3.select(this);
          assert.isFalse(t.select("line").empty());
          assert.isFalse(t.select("text").empty());
          assert.equal(t.select("text").text(), tickFormat(ticks[i]));
        });
      }
    },

    "update": {
      "updates the domain path": function(axis) {
        var a = axis(),
            g = d3.select("body").html("").append("svg:g").call(a);
        a.scale().range([1, 2]);
        a.tickSize(3);
        g.call(a);
        var path = g.selectAll("path.domain");
        assert.equal(path[0].length, 1);
        assert.equal(path.attr("d"), "M1,3V0H2V3");
        assert.isNull(path.node().nextSibling);
      },
      "enters, exits and updates tick marks": function(axis) {
        var a = axis(),
            g = d3.select("body").html("").append("svg:g").call(a),
            x = d3.scale.linear().domain([1, 1.5]);
        a.scale().domain(x.domain());
        a.tickSize(3).tickPadding(9);
        g.call(a);
        var tick = g.selectAll("g.tick"),
            ticks = x.ticks(10),
            tickFormat = x.tickFormat(10);
        assert.equal(tick[0].length, ticks.length);
        tick.each(function(d, i) {
          var t = d3.select(this);
          assert.isFalse(t.select("line").empty());
          assert.isFalse(t.select("text").empty());
          assert.equal(t.select("text").text(), tickFormat(ticks[i]));
        });
      }
    },
  }
});

suite.export(module);