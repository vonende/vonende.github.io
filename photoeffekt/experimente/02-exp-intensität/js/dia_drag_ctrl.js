var tettool_dia_drag_ctrl = {
	init: function initTETtool(h, c) {
		console.log(c.attr("itemtitle"));
		var l = $(web_mode ? "body" : "#mainPaneScrollWrapper")[0];
		var d = get_tettool_param(c, "diashow_name");
		var o = Number(get_tettool_param(c, "x-Richtung", 300));
		var k = Number(get_tettool_param(c, "y-Richtung", 0));
		var i = Math.sqrt(o * o + k * k);
		var p = false;
		var f, j, basePosition;
		var a, dragStart, dragStartIndex;

		if (!d.length) {
			$(".dia_controller", c).html("<span class='tetError'>Kein Diashowname angegeben</span>");
			return;
		}

		d = d.split(",");
		var b = [];
		var e;
		$.each(d, function(q, s) {
			s = s.trim();
			if (s.substring(0, 8) === "trigger:") {
				s = s.substring(8).trim();
				s = s.split(/ +/);
				b.push("trigger:" + s[0]);
				if (!e) {
					a = parseInt(s[1]) || 0;
				}
			} else {
				var r = $tet(s.trim(), c.parent().closest(".tetitem"), true);
				if (!r.length) {
					r = $tet(s.trim());
				}
				r.each(function() {
					if (!this.hasAttribute("tetbox_dia")) {
						console.error("Diashow Controller - " + this.getAttribute("itemtitle") + ": not a diashow tetbox");
						return true;
					}
					if (!e) {
						e = this;
					}
					b.push(this.id);
				});
			}
		});

		if (!b.length) {
			$(".tetitem_inner div", c).html("Diashow Controller - " + d + ": no diashow tetboxes found");
			console.error("Diashow Controller - " + d + ": no diashow tetboxes found");
			return;
		}

		c.on("tet:beforedynvar", function() {
			callWhenVisible(c, m);
		});
		$(e).on("diashow_change", function(q, r) {
			if (p || j === undefined || window.layouting_modexxx) {
				return;
			}
			n(r.i);
		});

		function n(q) {
			if (q !== undefined) {
				f = q;
			}
			if (!basePosition) {
				return;
			}
			c.css({
				left: basePosition.left + o * f / (a - 1),
				top: basePosition.top + k * f / (a - 1)
			});
		}

		function getPointerPosition(event) {
			var originalEvent = event.originalEvent || event;
			var point = originalEvent.touches && originalEvent.touches[0] ||
				originalEvent.changedTouches && originalEvent.changedTouches[0] ||
				originalEvent;
			return { x: point.clientX, y: point.clientY };
		}

		function getScaledDirection() {
			var parent = c[0].offsetParent;
			if (!parent) {
				return { x: o, y: k };
			}
			var rect = parent.getBoundingClientRect();
			var scaleX = parent.offsetWidth ? rect.width / parent.offsetWidth : 1;
			var scaleY = parent.offsetHeight ? rect.height / parent.offsetHeight : 1;
			return { x: o * scaleX, y: k * scaleY };
		}

		function g(event) {
			if (!dragStart || dragStartIndex === undefined) {
				return f;
			}
			var point = getPointerPosition(event);
			var direction = getScaledDirection();
			var lengthSquared = direction.x * direction.x + direction.y * direction.y;
			if (!lengthSquared) {
				return f;
			}
			var dx = point.x - dragStart.x;
			var dy = point.y - dragStart.y;
			var step = Math.round((dx * direction.x + dy * direction.y) / lengthSquared * (a - 1));
			return Math.max(0, Math.min(a - 1, dragStartIndex + step));
		}

		function m() {
			f = e && diashow[e.id].i;
			a = a || (e ? diashow[e.id].subs.length : 100);
			c.attr("notetdata", "1");
			j = c.offset();
			j.top += l.scrollTop;
			j.left += l.scrollLeft;
			if (!basePosition) {
				basePosition = {
					left: parseFloat(c[0].style.left) || c.position().left,
					top: parseFloat(c[0].style.top) || c.position().top
				};
			}
			n();

			c.on("dragstart.schiebectrl", function(s) {
				if (window.layouting_mode) {
					return;
				}
				dragStart = getPointerPosition(s);
				dragStartIndex = f;
			});
			c.on("drag.schiebectrl", function(s, t) {
				if (window.layouting_mode) {
					return;
				}
				if (t.helper[0].plainSideDrag_cancel) {
					delete t.helper[0].plainSideDrag_cancel;
					return false;
				}
				var u = g(s);
				if (u === f) {
					return;
				}
				f = u;
				p = true;
				for (var r in b) {
					if (b[r].substring(0, 8) === "trigger:") {
						tettrigger(b[r].substring(8), 0, c, { i: f, n: a });
					} else {
						diashow_show(b[r], f);
					}
				}
				p = false;
			});

			var q = c.draggable("option", "stop");
			c.draggable("option", "stop", function(u, v) {
				if (window.layouting_mode) {
					if (f === 0) {
						j = v.offset;
						j.top += l.scrollTop;
						j.left += l.scrollLeft;
						return q.call(this, u, v);
					}
					var s = v.offset.left - j.left + l.scrollLeft;
					var r = v.offset.top - j.top + l.scrollTop;
					o = Number(Int(s / (f / (a - 1)), 1));
					k = Number(Int(r / (f / (a - 1)), 1));
					i = Math.sqrt(o * o + k * k);
					c.attr("tettool_param_x-Richtung", o);
					c.attr("tettool_param_y-Richtung", k);
					setTETitem_template_params(c, "x-Richtung", o, function() {
						setTETitem_template_params(c, "y-Richtung", k, reloadMainPane_afterChange_onlyOthers);
					});
					return;
				}
				var w = g(u);
				f = w;
				for (var t in b) {
					if (b[t].substring(0, 8) === "trigger:") {
						tettrigger(b[t].substring(8), 0, c, { i: f, stop: true });
					}
				}
				n();
				dragStart = undefined;
				dragStartIndex = undefined;
				return q.call(this, u, v);
			});
		}

		c.data("tettool", { updatePos: n });
	}
};
