(function (z) {
  "object" === typeof exports && "undefined" !== typeof module
    ? (module.exports = z())
    : "function" === typeof define && define.pa
    ? define([], z)
    : (("undefined" !== typeof window
        ? window
        : "undefined" !== typeof global
        ? global
        : "undefined" !== typeof self
        ? self
        : this
      ).Offset = z());
})(function () {
  return (function e(h, d, f) {
    function a(b, p) {
      if (!d[b]) {
        if (!h[b]) {
          var g = "function" == typeof require && require;
          if (!p && g) return g(b, !0);
          if (c) return c(b, !0);
          g = Error("Cannot find module '" + b + "'");
          throw ((g.code = "MODULE_NOT_FOUND"), g);
        }
        g = d[b] = { exports: {} };
        h[b][0].call(
          g.exports,
          function (c) {
            var g = h[b][1][c];
            return a(g ? g : c);
          },
          g,
          g.exports,
          e,
          h,
          d,
          f
        );
      }
      return d[b].exports;
    }
    for (
      var c = "function" == typeof require && require, b = 0;
      b < f.length;
      b++
    )
      a(f[b]);
    return a;
  })(
    {
      1: [
        function (e, h) {
          h.exports = { ca: e("./lib/rbtree"), ka: e("./lib/bintree") };
        },
        { "./lib/bintree": 2, "./lib/rbtree": 3 },
      ],
      2: [
        function (e, h) {
          function d(a) {
            this.data = a;
            this.right = this.left = null;
          }
          function f(a) {
            this.c = null;
            this.s = a;
            this.size = 0;
          }
          var a = e("./treebase");
          d.prototype.g = function (a) {
            return a ? this.right : this.left;
          };
          d.prototype.l = function (a, b) {
            a ? (this.right = b) : (this.left = b);
          };
          f.prototype = new a();
          f.prototype.W = function (a) {
            if (null === this.c) return (this.c = new d(a)), this.size++, !0;
            for (var b = 0, f = null, p = this.c; ; ) {
              if (null === p)
                return (p = new d(a)), f.l(b, p), (ret = !0), this.size++, !0;
              if (0 === this.s(p.data, a)) return !1;
              b = 0 > this.s(p.data, a);
              f = p;
              p = p.g(b);
            }
          };
          f.prototype.remove = function (a) {
            if (null === this.c) return !1;
            var b = new d(void 0),
              f = b;
            f.right = this.c;
            for (var p = null, g = null, k = 1; null !== f.g(k); ) {
              var p = f,
                f = f.g(k),
                m = this.s(a, f.data),
                k = 0 < m;
              0 === m && (g = f);
            }
            return null !== g
              ? ((g.data = f.data),
                p.l(p.right === f, f.g(null === f.left)),
                (this.c = b.right),
                this.size--,
                !0)
              : !1;
          };
          h.exports = f;
        },
        { "./treebase": 4 },
      ],
      3: [
        function (e, h) {
          function d(a) {
            this.data = a;
            this.right = this.left = null;
            this.red = !0;
          }
          function f(a) {
            this.c = null;
            this.s = a;
            this.size = 0;
          }
          function a(a) {
            return null !== a && a.red;
          }
          function c(a, g) {
            var c = a.g(!g);
            a.l(!g, c.g(g));
            c.l(g, a);
            a.red = !0;
            c.red = !1;
            return c;
          }
          function b(a, g) {
            a.l(!g, c(a.g(!g), !g));
            return c(a, g);
          }
          var n = e("./treebase");
          d.prototype.g = function (a) {
            return a ? this.right : this.left;
          };
          d.prototype.l = function (a, g) {
            a ? (this.right = g) : (this.left = g);
          };
          f.prototype = new n();
          f.prototype.W = function (f) {
            var g = !1;
            if (null === this.c) (this.c = new d(f)), (g = !0), this.size++;
            else {
              var k = new d(void 0),
                m = 0,
                l = 0,
                n = null,
                h = k,
                e = null,
                q = this.c;
              for (h.right = this.c; ; ) {
                null === q
                  ? ((q = new d(f)), e.l(m, q), (g = !0), this.size++)
                  : a(q.left) &&
                    a(q.right) &&
                    ((q.red = !0), (q.left.red = !1), (q.right.red = !1));
                if (a(q) && a(e)) {
                  var u = h.right === n;
                  q === e.g(l) ? h.l(u, c(n, !l)) : h.l(u, b(n, !l));
                }
                u = this.s(q.data, f);
                if (0 === u) break;
                l = m;
                m = 0 > u;
                null !== n && (h = n);
                n = e;
                e = q;
                q = q.g(m);
              }
              this.c = k.right;
            }
            this.c.red = !1;
            return g;
          };
          f.prototype.remove = function (f) {
            if (null === this.c) return !1;
            var g = new d(void 0),
              k = g;
            k.right = this.c;
            for (var m = null, l, n = null, h = 1; null !== k.g(h); ) {
              var e = h;
              l = m;
              var m = k,
                k = k.g(h),
                q = this.s(f, k.data),
                h = 0 < q;
              0 === q && (n = k);
              if (!a(k) && !a(k.g(h)))
                if (a(k.g(!h))) (l = c(k, h)), m.l(e, l), (m = l);
                else if (!a(k.g(!h)) && ((q = m.g(!e)), null !== q))
                  if (a(q.g(!e)) || a(q.g(e))) {
                    var u = l.right === m;
                    a(q.g(e)) ? l.l(u, b(m, e)) : a(q.g(!e)) && l.l(u, c(m, e));
                    e = l.g(u);
                    e.red = !0;
                    k.red = !0;
                    e.left.red = !1;
                    e.right.red = !1;
                  } else (m.red = !1), (q.red = !0), (k.red = !0);
            }
            null !== n &&
              ((n.data = k.data),
              m.l(m.right === k, k.g(null === k.left)),
              this.size--);
            this.c = g.right;
            null !== this.c && (this.c.red = !1);
            return null !== n;
          };
          h.exports = f;
        },
        { "./treebase": 4 },
      ],
      4: [
        function (e, h) {
          function d() {}
          function f(a) {
            this.V = a;
            this.i = [];
            this.f = null;
          }
          d.prototype.clear = function () {
            this.c = null;
            this.size = 0;
          };
          d.prototype.find = function (a) {
            for (var c = this.c; null !== c; ) {
              var b = this.s(a, c.data);
              if (0 === b) return c.data;
              c = c.g(0 < b);
            }
            return null;
          };
          d.prototype.w = function (a) {
            for (var c = this.c, b = this.iterator(); null !== c; ) {
              var f = this.s(a, c.data);
              if (0 === f) return (b.f = c), b;
              b.i.push(c);
              c = c.g(0 < f);
            }
            return null;
          };
          d.prototype.lowerBound = function (a) {
            for (
              var c = this.c, b = this.iterator(), f = this.s;
              null !== c;

            ) {
              var d = f(a, c.data);
              if (0 === d) return (b.f = c), b;
              b.i.push(c);
              c = c.g(0 < d);
            }
            for (d = b.i.length - 1; 0 <= d; --d)
              if (((c = b.i[d]), 0 > f(a, c.data)))
                return (b.f = c), (b.i.length = d), b;
            b.i.length = 0;
            return b;
          };
          d.prototype.upperBound = function (a) {
            for (
              var c = this.lowerBound(a), b = this.s;
              null !== c.data() && 0 === b(c.data(), a);

            )
              c.next();
            return c;
          };
          d.prototype.min = function () {
            var a = this.c;
            if (null === a) return null;
            for (; null !== a.left; ) a = a.left;
            return a.data;
          };
          d.prototype.max = function () {
            var a = this.c;
            if (null === a) return null;
            for (; null !== a.right; ) a = a.right;
            return a.data;
          };
          d.prototype.iterator = function () {
            return new f(this);
          };
          f.prototype.data = function () {
            return null !== this.f ? this.f.data : null;
          };
          f.prototype.next = function () {
            if (null === this.f) {
              var a = this.V.c;
              null !== a && this.S(a);
            } else if (null === this.f.right) {
              do
                if (((a = this.f), this.i.length)) this.f = this.i.pop();
                else {
                  this.f = null;
                  break;
                }
              while (this.f.right === a);
            } else this.i.push(this.f), this.S(this.f.right);
            return null !== this.f ? this.f.data : null;
          };
          f.prototype.F = function () {
            if (null === this.f) {
              var a = this.V.c;
              null !== a && this.R(a);
            } else if (null === this.f.left) {
              do
                if (((a = this.f), this.i.length)) this.f = this.i.pop();
                else {
                  this.f = null;
                  break;
                }
              while (this.f.left === a);
            } else this.i.push(this.f), this.R(this.f.left);
          };
          f.prototype.S = function (a) {
            for (; null !== a.left; ) this.i.push(a), (a = a.left);
            this.f = a;
          };
          f.prototype.R = function (a) {
            for (; null !== a.right; ) this.i.push(a), (a = a.right);
            this.f = a;
          };
          h.exports = d;
        },
        {},
      ],
      5: [
        function (e, h) {
          h.exports = e("./src/index");
        },
        { "./src/index": 10 },
      ],
      6: [
        function (e, h) {
          var d = e("./signed_area");
          e("./equals");
          h.exports = function (f, a) {
            var c = f.a,
              b = a.a;
            return c[0] > b[0]
              ? 1
              : c[0] < b[0]
              ? -1
              : c[1] !== b[1]
              ? c[1] > b[1]
                ? 1
                : -1
              : f.left !== a.left
              ? f.left
                ? 1
                : -1
              : 0 !== d(c, f.b.a, a.b.a)
              ? f.H(a.b.a)
                ? -1
                : 1
              : !f.j && a.j
              ? 1
              : -1;
          };
        },
        { "./equals": 9, "./signed_area": 12 },
      ],
      7: [
        function (e, h) {
          var d = e("./signed_area"),
            f = e("./compare_events"),
            a = e("./equals");
          h.exports = function (c, b) {
            if (c === b) return 0;
            if (0 !== d(c.a, c.b.a, b.a) || 0 !== d(c.a, c.b.a, b.b.a))
              return a(c.a, b.a)
                ? c.H(b.b.a)
                  ? -1
                  : 1
                : c.a[0] === b.a[0]
                ? c.a[1] < b.a[1]
                  ? -1
                  : 1
                : 1 === f(c, b)
                ? b.ia(c.a)
                  ? -1
                  : 1
                : c.H(b.a)
                ? -1
                : 1;
            if (c.j === b.j) {
              if (a(c.a, b.a)) return a(c.b.a, b.b.a) ? 0 : c.m > b.m ? 1 : -1;
            } else return c.j ? -1 : 1;
            return 1 === f(c, b) ? 1 : -1;
          };
        },
        { "./compare_events": 6, "./equals": 9, "./signed_area": 12 },
      ],
      8: [
        function (e, h) {
          h.exports = { M: 0, ba: 1, N: 2, L: 3 };
        },
        {},
      ],
      9: [
        function (e, h) {
          h.exports = function (d, f) {
            return d[0] === f[0] && d[1] === f[1];
          };
        },
        {},
      ],
      10: [
        function (e, h) {
          function d(a, g, c, b, f) {
            var k, m;
            if ("number" === typeof a[0][0])
              for (k = 0, m = a.length - 1; k < m; k++) {
                var h = a[k],
                  l = a[k + 1],
                  e = g,
                  n = c + 1,
                  p = b,
                  t = f,
                  u = new v(h, !1, void 0, e),
                  l = new v(l, !1, u, e);
                u.b = l;
                u.m = l.m = n;
                0 < q(u, l) ? (l.left = !0) : (u.left = !0);
                t[0] = x(t[0], h[0]);
                t[1] = x(t[1], h[1]);
                t[2] = B(t[2], h[0]);
                t[3] = B(t[3], h[1]);
                p.push(u);
                p.push(l);
              }
            else for (k = 0, m = a.length; k < m; k++) A++, d(a[k], g, A, b, f);
          }
          function f(a, g, c, b) {
            var f = new y(null, q);
            A = 0;
            d(a, !0, 0, f, c);
            d(g, !1, 0, f, b);
            return f;
          }
          function a(a, g, b, f) {
            null === g
              ? ((a.v = !1), (a.u = !0))
              : a.j === g.j
              ? ((a.v = !g.v), (a.u = g.u))
              : ((a.v = !g.u), (a.u = g.Y() ? !g.v : g.v));
            g && (a.G = !c(g, f) || g.Y() ? g.G : g);
            a.K = c(a, f);
          }
          function c(a, g) {
            switch (a.type) {
              case l.M:
                switch (g) {
                  case 0:
                    return !a.u;
                  case 1:
                    return a.u;
                  case 2:
                    return (a.j && a.u) || (!a.j && !a.u);
                  case 3:
                    return !0;
                }
              case l.N:
                return 0 === g || 1 === g;
              case l.L:
                return 2 === g;
            }
            return !1;
          }
          function b(a, g, c) {
            var b = C(a.a, a.b.a, g.a, g.b.a),
              f = b ? b.length : 0;
            if (0 === f || (1 === f && (w(a.a, g.a) || w(a.b.a, g.b.a))))
              return 0;
            if (2 === f && a.j === g.j)
              return (
                a.m === g.m //&&
                  // console.warn(
                  //   "Edges of the same polygon overlap",
                  //   a.a,
                  //   a.b.a,
                  //   g.a,
                  //   g.b.a
                  // )
                ,0
              );
            if (1 === f)
              return (
                w(a.a, b[0]) || w(a.b.a, b[0]) || n(a, b[0], c),
                w(g.a, b[0]) || w(g.b.a, b[0]) || n(g, b[0], c),
                1
              );
            var b = [],
              k = (f = !1);
            w(a.a, g.a)
              ? (f = !0)
              : 1 === q(a, g)
              ? b.push(g, a)
              : b.push(a, g);
            w(a.b.a, g.b.a)
              ? (k = !0)
              : 1 === q(a.b, g.b)
              ? b.push(g.b, a.b)
              : b.push(a.b, g.b);
            if ((f && k) || f)
              return (
                (a.type = l.ba),
                (g.type = a.v === g.v ? l.N : l.L),
                f && !k && n(b[0].b, b[1].a, c),
                2
              );
            if (k) return n(b[0], b[1].a, c), 3;
            if (b[0] !== b[3].b)
              return n(b[0], b[1].a, c), n(b[1], b[2].a, c), 3;
            n(b[0], b[1].a, c);
            n(b[3].b, b[2].a, c);
            return 3;
          }
          function n(a, g, b) {
            var c = new v(g, !1, a, a.j);
            g = new v(g, !0, a.b, a.j);
            w(a.a, a.b.a) && console.warn("what is that?", a);
            c.m = g.m = a.m;
            0 < q(g, a.b) && ((a.b.left = !0), (g.left = !1));
            a.b.b = g;
            a.b = c;
            b.push(g);
            b.push(c);
            return b;
          }
          function p(g, c, f, k, d, h) {
            var m, l;
            f = new t(u);
            c = [];
            for (d = x(k[2], d[2]); g.length; ) {
              var e = g.pop();
              c.push(e);
              if ((0 === h && e.a[0] > d) || (2 === h && e.a[0] > k[2])) break;
              if (e.left) {
                f.W(e);
                l = f.w(e);
                m = f.w(e);
                e.iterator = f.w(e);
                if (!m || !l) {
                  var n = f;
                  m = n.iterator();
                  l = n.iterator();
                  for (
                    var n = n.iterator(), p;
                    null !== (p = n.next()) &&
                    (m.next(), l.next(), p !== event);

                  );
                  l = [m, l];
                  m = l[0];
                  l = l[1];
                }
                m.data() !== f.min()
                  ? m.F()
                  : ((m = f.iterator()), m.F(), m.next());
                l.next();
                a(e, m.data(), 0, h);
                l.data() &&
                  2 === b(e, l.data(), g) &&
                  (a(e, m.data(), 0, h), a(e, l.data(), 0, h));
                m.data() &&
                  2 === b(m.data(), e, g) &&
                  ((l = f.w(m.data())),
                  l.data() !== f.min() ? l.F() : ((l = f.w(f.max())), l.next()),
                  a(m.data(), l.data(), 0, h),
                  a(e, m.data(), 0, h));
              } else
                (e = e.b),
                  (l = f.w(e)),
                  (m = f.w(e)) &&
                    l &&
                    (m.data() !== f.min()
                      ? m.F()
                      : ((m = f.iterator()), m.F(), m.next()),
                    l.next(),
                    f.remove(e),
                    l.data() && m.data() && b(m.data(), l.data(), g));
            }
            return c;
          }
          function g(a, g) {
            "[object Array]" === Object.prototype.toString.call(a[0][0]) ||
              (a = [a]);
            a[g] = [];
          }
          function k(a, b, c) {
            var k,
              d = null;
            if (0 === a.length * b.length)
              if (0 === c) d = m;
              else if (2 === c) d = a;
              else if (1 === c || 3 === c) d = 0 === a.length ? b : a;
            if ((k = d)) return k === m ? null : k;
            var d = [Infinity, Infinity, -Infinity, -Infinity],
              l = [Infinity, Infinity, -Infinity, -Infinity],
              e = f(a, b, d, l);
            k = null;
            if (d[0] > l[2] || l[0] > d[2] || d[1] > l[3] || l[1] > d[3])
              if (0 === c) k = m;
              else if (2 === c) k = a;
              else if (1 === c || 3 === c) k = a.concat(b);
            if (k) return k === m ? null : k;
            d = p(e, 0, 0, d, l, c);
            a = [];
            b = 0;
            for (c = d.length; b < c; b++)
              (event = d[b]),
                ((event.left && event.K) || (!event.left && event.b.K)) &&
                  a.push(event);
            for (d = !1; !d; )
              for (d = !0, b = 0, c = a.length; b < c; b++)
                b + 1 < c &&
                  1 === q(a[b], a[b + 1]) &&
                  ((d = a),
                  (l = b + 1),
                  (e = d[b]),
                  (d[b] = d[l]),
                  (d[l] = e),
                  (d = !1));
            b = 0;
            for (c = a.length; b < c; b++) a[b].A = b;
            b = 0;
            for (c = a.length; b < c; b++)
              a[b].left || ((d = a[b].A), (a[b].A = a[b].b.A), (a[b].b.A = d));
            d = Array(a.length);
            l = [];
            e = [];
            k = [];
            var h = {};
            b = 0;
            for (c = a.length; b < c; b++)
              if (!d[b]) {
                var n = [];
                l.push(n);
                var t = l.length - 1;
                e.push(0);
                k.push(-1);
                if (a[b].G) {
                  var r = a[b].G.m;
                  a[b].G.I
                    ? h[r] &&
                      (g(l[k[r]], t), (k[t] = k[r]), (e[t] = e[r]), (h[t] = !0))
                    : (g(l[r], t), (k[t] = r), (e[t] = e[r] + 1), (h[t] = !0));
                }
                r = b;
                for (n.push(a[b].a); r >= b; ) {
                  d[r] = !0;
                  a[r].left
                    ? ((a[r].I = !1), (a[r].m = t))
                    : ((a[r].b.I = !0), (a[r].b.m = t));
                  r = a[r].A;
                  d[r] = !0;
                  n.push(a[r].a);
                  a: {
                    for (
                      var u = a, y = d, v = r + 1, x = u.length;
                      v < x && w(u[v].a, u[r].a);

                    )
                      if (y[v]) v += 1;
                      else {
                        r = v;
                        break a;
                      }
                    for (v = r - 1; y[v]; ) --v;
                    r = v;
                  }
                }
                r = -1 === r ? b : r;
                d[r] = d[a[r].A] = !0;
                a[r].b.I = !0;
                a[r].b.m = t;
                e[t] & 1 && n.reverse();
              }
            return l;
          }
          var m = [],
            l = e("./edge_type"),
            y = e("tinyqueue"),
            t = e("bintrees").ca,
            v = e("./sweep_event"),
            q = e("./compare_events"),
            u = e("./compare_segments"),
            C = e("./segment_intersection"),
            w = e("./equals"),
            B = Math.max,
            x = Math.min,
            A = 0;
          h.exports = k;
          h.exports.union = function (a, g) {
            return k(a, g, 1);
          };
          h.exports.diff = function (a, g) {
            return k(a, g, 2);
          };
          h.exports.wa = function (a, g) {
            return k(a, g, 3);
          };
          h.exports.intersection = function (a, g) {
            return k(a, g, 0);
          };
          h.exports.ta = { ma: 0, la: 2, na: 1, oa: 3 };
          h.exports.sa = f;
          h.exports.qa = a;
          h.exports.va = p;
          h.exports.ra = n;
          h.exports.ua = b;
        },
        {
          "./compare_events": 6,
          "./compare_segments": 7,
          "./edge_type": 8,
          "./equals": 9,
          "./segment_intersection": 11,
          "./sweep_event": 13,
          bintrees: 1,
          tinyqueue: 14,
        },
      ],
      11: [
        function (e, h) {
          function d(a, c) {
            return a[0] * c[1] - a[1] * c[0];
          }
          function f(a, c) {
            return a[0] * c[0] + a[1] * c[1];
          }
          h.exports = function (a, c, b, e, h) {
            function g(a, g, b) {
              return [a[0] + g * b[0], a[1] + g * b[1]];
            }
            c = [c[0] - a[0], c[1] - a[1]];
            e = [e[0] - b[0], e[1] - b[1]];
            b = [b[0] - a[0], b[1] - a[1]];
            var k = d(c, e),
              m = f(c, c);
            if (k * k > 1e-9 * m * f(e, e)) {
              e = d(b, e) / k;
              if (0 > e || 1 < e) return null;
              b = d(b, c) / k;
              return 0 > b || 1 < b ? null : h ? null : [g(a, e, c)];
            }
            var l = f(b, b),
              k = d(b, c);
            if (k * k > 1e-9 * m * l) return null;
            b = f(c, b) / m;
            k = b + f(c, e) / m;
            e = Math.min(b, k);
            b = Math.max(b, k);
            return 1 >= e && 0 <= b
              ? 1 === e
                ? h
                  ? null
                  : [g(a, 0 < e ? e : 0, c)]
                : 0 === b
                ? h
                  ? null
                  : [g(a, 1 > b ? b : 1, c)]
                : h && 0 === e && 1 === b
                ? null
                : [g(a, 0 < e ? e : 0, c), g(a, 1 > b ? b : 1, c)]
              : null;
          };
        },
        {},
      ],
      12: [
        function (e, h) {
          h.exports = function (d, f, a) {
            return (
              (d[0] - a[0]) * (f[1] - a[1]) - (f[0] - a[0]) * (d[1] - a[1])
            );
          };
        },
        {},
      ],
      13: [
        function (e, h) {
          function d(c, b, f, d, g) {
            this.left = b;
            this.a = c;
            this.b = f;
            this.j = d;
            this.type = g || a.M;
            this.u = this.v = !1;
            this.G = null;
            this.I = this.K = !1;
          }
          var f = e("./signed_area"),
            a = e("./edge_type");
          d.prototype = {
            H: function (a) {
              return this.left
                ? 0 < f(this.a, this.b.a, a)
                : 0 < f(this.b.a, this.a, a);
            },
            ia: function (a) {
              return !this.H(a);
            },
            Y: function () {
              return this.a[0] === this.b.a[0];
            },
          };
          h.exports = d;
        },
        { "./edge_type": 8, "./signed_area": 12 },
      ],
      14: [
        function (e, h) {
          function d(a, c) {
            if (!(this instanceof d)) return new d(a, c);
            this.data = a || [];
            this.length = this.data.length;
            this.compare = c || f;
            if (a)
              for (var b = Math.floor(this.length / 2); 0 <= b; b--) this.O(b);
          }
          function f(a, c) {
            return a < c ? -1 : a > c ? 1 : 0;
          }
          h.exports = d;
          d.prototype = {
            push: function (a) {
              this.data.push(a);
              this.length++;
              this.ea(this.length - 1);
            },
            pop: function () {
              var a = this.data[0];
              this.data[0] = this.data[this.length - 1];
              this.length--;
              this.data.pop();
              this.O(0);
              return a;
            },
            ea: function (a) {
              for (var c = this.data, b = this.compare; 0 < a; ) {
                var f = Math.floor((a - 1) / 2);
                if (0 > b(c[a], c[f])) {
                  var d = c,
                    g = d[f];
                  d[f] = d[a];
                  d[a] = g;
                  a = f;
                } else break;
              }
            },
            O: function (a) {
              for (var c = this.data, b = this.compare, f = this.length; ; ) {
                var d = 2 * a + 1,
                  g = d + 1,
                  k = a;
                d < f && 0 > b(c[d], c[k]) && (k = d);
                g < f && 0 > b(c[g], c[k]) && (k = g);
                if (k === a) break;
                d = c;
                g = d[k];
                d[k] = d[a];
                d[a] = g;
                a = k;
              }
            },
          };
        },
        {},
      ],
      15: [
        function (e, h) {
          function d(d, a) {
            this.current = d;
            this.next = a;
            this.P = this.X();
            this.T = this.ja();
          }
          d.prototype.ja = function () {
            var d = this.X();
            return [-d[0], -d[1]];
          };
          d.prototype.X = function () {
            var d = this.next[0] - this.current[0],
              a = this.next[1] - this.current[1],
              c = Math.sqrt(d * d + a * a);
            if (0 === c) throw Error("Vertices overlap");
            return [-a / c, d / c];
          };
          d.prototype.offset = function (f, a) {
            return d.Z(this.current, this.next, f, a);
          };
          d.prototype.ha = function (f, a) {
            return d.Z(this.next, this.current, f, a);
          };
          d.Z = function (f, a, c, b) {
            return new d([f[0] + c, f[1] + b], [a[0] + c, a[1] + b]);
          };
          d.prototype.inverse = function () {
            return new d(this.next, this.current);
          };
          h.exports = d;
        },
        {},
      ],
      16: [
        function (e, h) {
          function d(a, b) {
            this.h = null;
            this.o = 0;
            a && this.data(a);
            this.J = void 0 !== b ? b : 5;
          }
          var f = e("./edge"),
            a = e("martinez-polygon-clipping"),
            c = e("./utils"),
            b = c.isArray,
            n = c.ga,
            p = c.aa;
          d.prototype.data = function (a) {
            this.B = [];
            if (!b(a))
              throw Error(
                "Offset requires at least one coodinate to work with"
              );
            b(a) && "number" === typeof a[0]
              ? (this.h = a)
              : ((this.h = p(a)), this.U(this.h, this.B));
            return this;
          };
          d.prototype.U = function (a, c) {
            var d, e;
            if (b(a[0]) && "number" === typeof a[0][0])
              for (e = a.length, n(a[0], a[e - 1]) && --e, d = 0; d < e; d++)
                c.push(new f(a[d], a[(d + 1) % e]));
            else
              for (d = 0, e = a.length; d < e; d++)
                c.push([]), this.U(a[d], c[c.length - 1]);
          };
          d.prototype.arcSegments = function (a) {
            this.J = a;
            return this;
          };
          d.prototype.fa = function (a, b, c, d, f, e) {
            var h = 2 * Math.PI,
              n = Math.atan2(d[1] - b[1], d[0] - b[0]),
              p = Math.atan2(f[1] - b[1], f[0] - b[0]);
            0 === e % 2 && --e;
            0 > n && (n += h);
            0 > p && (p += h);
            h = -(n > p ? n - p : n + h - p) / e;
            a.push(d);
            for (p = 1; p < e; ++p)
              (d = n + h * p),
                a.push([b[0] + Math.cos(d) * c, b[1] + Math.sin(d) * c]);
            a.push(f);
          };
          d.prototype.distance = function (a) {
            this.o = a || 0;
            return this;
          };
          d.degreesToUnits = function (a, b) {
            switch (b) {
              case "miles":
                a /= 69.047;
                break;
              case "feet":
                a /= 364568;
                break;
              case "kilometers":
                a /= 111.12;
                break;
              case "meters":
              case "metres":
                a /= 111120;
            }
            return a;
          };
          d.prototype.C = function (a) {
            n(a[0], a[a.length - 1]) || a.push([a[0][0], a[0][1]]);
            return a;
          };
          d.prototype.offset = function (a) {
            this.distance(a);
            return 0 === this.o
              ? this.h
              : 0 < this.o
              ? this.margin(this.o)
              : this.padding(-this.o);
          };
          d.prototype.da = function (a, b, c, d) {
            var f = [];
            c = [
              c.offset(c.P[0] * d, c.P[1] * d),
              c.ha(c.T[0] * d, c.T[1] * d),
            ];
            for (var e = 0; 2 > e; e++)
              this.fa(
                f,
                0 === e ? a : b,
                d,
                c[(e + 2 - 1) % 2].next,
                c[e].current,
                this.J
              );
            return f;
          };
          d.prototype.margin = function (b) {
            this.distance(b);
            if ("number" === typeof this.h[0]) return this.$(this.o);
            if (0 === b) return this.h;
            b = this.offsetLines(this.o);
            b = a.union(this.h, b);
            return p(b);
          };
          d.prototype.padding = function (b) {
            this.distance(b);
            if (0 === this.o) return this.C(this.h);
            if (2 === this.h.length && "number" === typeof this.h[0])
              return this.h;
            b = this.offsetLines(this.o);
            b = a.diff(this.h, b);
            return p(b);
          };
          d.prototype.offsetLines = function (c) {
            if (0 > c) throw Error("Cannot apply negative margin to the line");
            var d;
            this.distance(c);
            if (b(this.h[0]) && "number" !== typeof this.h[0][0]) {
              c = 0;
              for (var f = this.B.length; c < f; c++)
                d =
                  0 === c
                    ? this.D(this.h[c], this.B[c])
                    : a.union(d, this.D(this.h[c], this.B[c]));
            } else d = 1 === this.h.length ? this.$() : this.D(this.h, this.B);
            return d;
          };
          d.prototype.D = function (c, d) {
            var f, e, h;
            if (b(c[0]) && "number" === typeof c[0][0])
              for (e = 0, h = c.length - 1; e < h; e++) {
                var p = this.C(this.da(c[e], c[e + 1], d[e], this.o));
                f = 0 === e ? [this.C(p)] : a.union(f, this.C(p));
              }
            else
              for (e = 0, h = d.length; e < h; e++)
                f =
                  0 === e ? this.D(c[e], d[e]) : a.union(f, this.D(c[e], d[e]));
            return f;
          };
          d.prototype.$ = function (a) {
            this.distance(a);
            a = 2 * this.J;
            var b = [],
              c = this.h,
              d = this.o,
              f = 0;
            0 === a % 2 && a++;
            for (var e = 0; e < a; e++)
              (f += (2 * Math.PI) / a),
                b.push([c[0] + d * Math.cos(f), c[1] + d * Math.sin(f)]);
            return p([this.C(b)]);
          };
          d.aa = p;
          h.exports = d;
        },
        { "./edge": 15, "./utils": 17, "martinez-polygon-clipping": 5 },
      ],
      17: [
        function (e, h) {
          var d = (h.exports.isArray =
            Array.isArray ||
            function (d) {
              return "[object Array]" === Object.prototype.toString.call(d);
            });
          h.exports.ga = function (d, a) {
            return d[0] === a[0] && d[1] === a[1];
          };
          h.exports.aa = function a(c, b, e) {
            b = b || 0;
            var h, g;
            if (d(c) && "number" === typeof c[0][0]) {
              h = b = 0;
              for (g = c.length; h < g; h++) {
                var k = c[h],
                  m = c[(h + 1) % g];
                b += k[0] * m[1];
                b -= m[0] * k[1];
              }
              ((!e && 0 < b) || (e && 0 > b)) && c.reverse();
            } else for (h = 0, g = c.length; h < g; h++) a(c[h], b + 1, 0 < h);
            return c;
          };
        },
        {},
      ],
    },
    {},
    [16]
  )(16);
});
