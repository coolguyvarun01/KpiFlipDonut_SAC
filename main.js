// KPI Flip Donut - Custom Widget for SAP Analytics Cloud
// Developed by: Varun Malhotra
(function () {
  var template = document.createElement("template");
  template.innerHTML = [
    "<style>",
    "  :host { display:block; width:100%; height:100%; font-family: '72', Arial, sans-serif; }",
    "  .scene { width:100%; height:100%; perspective: 1000px; cursor:pointer; position:relative; }",
    "  .flipper { position:relative; width:100%; height:100%; transition: transform 0.6s; transform-style: preserve-3d; }",
    "  .flipper.flipped { transform: rotateY(180deg); }",
    "  .face { position:absolute; top:0; left:0; width:100%; height:100%; backface-visibility: hidden; box-sizing:border-box;",
    "    border:1px solid #ddd; border-radius:8px; background: var(--kfd-bg, #fff); display:flex; flex-direction:column;",
    "    align-items:center; justify-content:center;",
    "    padding: var(--kfd-mt, 12px) var(--kfd-mr, 12px) var(--kfd-mb, 12px) var(--kfd-ml, 12px); }",
    "  .back { transform: rotateY(180deg); }",
    "  .kpi-label { font-size:13px; color:#666; margin:0 0 6px; text-align:center; }",
    "  .kpi-value { font-size: var(--kfd-fs, 28px); font-weight:600; margin:0 0 4px; color: var(--kfd-fc, #111); }",
    "  .kpi-delta { font-size:12px; margin:0; }",
    "  .kpi-delta.up { color:#CBE894; }",
    "  .kpi-delta.down { color:#C4644C; }",
    "  .kpi-delta.flat { color:#777; }",
    "  .kpi-hint { font-size:11px; color:#999; margin-top:10px; text-align:center; }",
    "  .donut-title { font-size:13px; color:#666; margin:0 0 8px; text-align:center; }",
    "  .legend { display:flex; flex-wrap:wrap; gap:8px; justify-content:center; font-size:11px; color:#555; margin-top:8px; }",
    "  .legend span { display:flex; align-items:center; gap:4px; }",
    "  .swatch { width:8px; height:8px; border-radius:2px; display:inline-block; }",
    "  .tooltip { position:absolute; background:#222; color:#fff; font-size:11px; padding:4px 8px; border-radius:4px;",
    "    pointer-events:none; display:none; white-space:nowrap; z-index:10; }",
    "</style>",
    "<div class=\"scene\">",
    "  <div class=\"flipper\" id=\"flipper\">",
    "    <div class=\"face front\">",
    "      <p class=\"kpi-label\" id=\"kpiLabel\">Total revenue</p>",
    "      <p class=\"kpi-value\" id=\"kpiValue\">--</p>",
    "      <p class=\"kpi-delta\" id=\"kpiDelta\">up 8.3% vs last period</p>",
    "      <p class=\"kpi-hint\" id=\"kpiHint\">Click for breakdown</p>",
    "    </div>",
    "    <div class=\"face back\">",
    "      <p class=\"donut-title\" id=\"donutTitle\">Breakdown</p>",
    "      <svg id=\"donutSvg\" viewBox=\"0 0 100 100\" width=\"120\" height=\"120\"></svg>",
    "      <div class=\"legend\" id=\"legend\"></div>",
    "    </div>",
    "  </div>",
    "  <div class=\"tooltip\" id=\"tooltip\"></div>",
    "</div>"
  ].join("\n");

  var PALETTES = {
    sac:  ["#2a78d6", "#CBE894", "#eda100", "#4a3aa7", "#C4644C", "#0f9bb0", "#7a5c1e", "#5c6ac4"],
    warm: ["#e8543e", "#f2994a", "#f6c744", "#c0392b", "#e07a5f", "#f4a261", "#d35400", "#e76f51"],
    cool: ["#264653", "#2a9d8f", "#457b9d", "#1d3557", "#6c9bd1", "#8ecae6", "#0b7285", "#2b6777"],
    mono: ["#1b1b1b", "#3d3d3d", "#5f5f5f", "#818181", "#a3a3a3", "#c5c5c5", "#2e2e2e", "#707070"]
  };

  class KpiFlipDonutElement extends HTMLElement {
    constructor() {
      super();
      this._shadowRoot = this.attachShadow({ mode: "open" });
      this._shadowRoot.appendChild(template.content.cloneNode(true));
      this._props = {
        kpiLabel: "Total revenue",
        kpiDelta: "up 8.3% vs last period",
        valueScale: "auto",
        decimalPlaces: 1,
        fontSize: 28,
        fontColor: "#111111",
        marginTop: 12,
        marginRight: 12,
        marginBottom: 12,
        marginLeft: 12,
        colorPalette: "sac",
        varianceLabel: "vs comparison",
        varianceShowAs: "percentage",
        varianceDecimalPlaces: 1,
        varianceArrowStyle: "arrow",
        variancePositiveColor: "#CBE894",
        varianceNegativeColor: "#C4644C",
        varianceNullColor: "#CBE894"
      };
      // Demo data shown until real data is bound in the Builder panel
      this._segments = [
        { name: "North America", value: 41 },
        { name: "EMEA", value: 28 },
        { name: "APAC", value: 19 },
        { name: "LATAM", value: 12 }
      ];
      this._kpiTotal = 4820000;
      this._variance = null; // { pct: number, direction: 'up'|'down'|'flat' } once a comparison measure is bound
      this._hasRealData = false;
      this._flipped = false;
    }

    connectedCallback() {
      this._flipper = this._shadowRoot.getElementById("flipper");
      this._flipper.addEventListener("click", () => this._toggle());
      this._applyStyleVars();
      this._redrawDonut();
      this._render();
    }

    disconnectedCallback() {}

    onCustomWidgetBeforeUpdate(changedProperties) {
      this._props = Object.assign({}, this._props, changedProperties);
    }

    onCustomWidgetAfterUpdate(changedProperties) {
      if (changedProperties && "backgroundColor" in changedProperties) {
        this._bgColor = changedProperties.backgroundColor;
        if (this._bgColor) this.style.setProperty("--kfd-bg", this._bgColor);
      }
      if (changedProperties && "myDataBinding" in changedProperties) {
        this._handleDataBinding(changedProperties.myDataBinding);
      }
      this._applyStyleVars();
      this._redrawDonut();
      this._render();
    }

    onCustomWidgetResize() {}

    onCustomWidgetDestroy() {}

    // ---- Properties (settable from Styling panel or scripting) ----
    set kpiLabel(v) { this._props.kpiLabel = v; this._render(); }
    get kpiLabel() { return this._props.kpiLabel; }

    set kpiDelta(v) { this._props.kpiDelta = v; this._render(); }
    get kpiDelta() { return this._props.kpiDelta; }

    set valueScale(v) { this._props.valueScale = v; this._render(); }
    get valueScale() { return this._props.valueScale; }

    set decimalPlaces(v) { this._props.decimalPlaces = v; this._render(); }
    get decimalPlaces() { return this._props.decimalPlaces; }

    set fontSize(v) { this._props.fontSize = v; this._applyStyleVars(); }
    get fontSize() { return this._props.fontSize; }

    set fontColor(v) { this._props.fontColor = v; this._applyStyleVars(); }
    get fontColor() { return this._props.fontColor; }

    set marginTop(v) { this._props.marginTop = v; this._applyStyleVars(); }
    get marginTop() { return this._props.marginTop; }

    set marginRight(v) { this._props.marginRight = v; this._applyStyleVars(); }
    get marginRight() { return this._props.marginRight; }

    set marginBottom(v) { this._props.marginBottom = v; this._applyStyleVars(); }
    get marginBottom() { return this._props.marginBottom; }

    set marginLeft(v) { this._props.marginLeft = v; this._applyStyleVars(); }
    get marginLeft() { return this._props.marginLeft; }

    set colorPalette(v) { this._props.colorPalette = v; this._redrawDonut(); }
    get colorPalette() { return this._props.colorPalette; }

    set varianceLabel(v) { this._props.varianceLabel = v; this._render(); }
    get varianceLabel() { return this._props.varianceLabel; }

    set varianceShowAs(v) { this._props.varianceShowAs = v; this._render(); }
    get varianceShowAs() { return this._props.varianceShowAs; }

    set varianceDecimalPlaces(v) { this._props.varianceDecimalPlaces = v; this._render(); }
    get varianceDecimalPlaces() { return this._props.varianceDecimalPlaces; }

    set varianceArrowStyle(v) { this._props.varianceArrowStyle = v; this._render(); }
    get varianceArrowStyle() { return this._props.varianceArrowStyle; }

    set variancePositiveColor(v) { this._props.variancePositiveColor = v; this._render(); }
    get variancePositiveColor() { return this._props.variancePositiveColor; }

    set varianceNegativeColor(v) { this._props.varianceNegativeColor = v; this._render(); }
    get varianceNegativeColor() { return this._props.varianceNegativeColor; }

    set varianceNullColor(v) { this._props.varianceNullColor = v; this._render(); }
    get varianceNullColor() { return this._props.varianceNullColor; }

    set backgroundColor(v) {
      this._bgColor = v;
      if (v) this.style.setProperty("--kfd-bg", v);
    }
    get backgroundColor() { return this._bgColor; }

    // ---- Methods (callable from scripting) ----
    flipToChart() {
      if (!this._flipped) this._toggle();
    }

    flipToKpi() {
      if (this._flipped) this._toggle();
    }

    // ---- Internal: data binding ----
    _handleDataBinding(dataBinding) {
      if (!dataBinding || dataBinding.state !== "success" || !Array.isArray(dataBinding.data)) {
        return;
      }
      var rows = dataBinding.data;
      if (!rows.length) {
        this._hasRealData = false;
        return;
      }

      // Detect whether a comparison dimension is bound on any row
      var hasComparisonDim = rows.some(function (row) { return !!row.comparisonDimension_0; });

      if (!hasComparisonDim) {
        this._handleSimpleData(rows);
        return;
      }

      // Group rows by the comparison dimension member (e.g. Fiscal Year)
      var buckets = {}; // { memberLabel: { total: number, byCategory: { name: value } } }
      var order = [];

      rows.forEach(function (row) {
        if (!row.measures_0 || !row.comparisonDimension_0) return;
        var member = row.comparisonDimension_0.label;
        var memberId = row.comparisonDimension_0.id != null ? row.comparisonDimension_0.id : member;
        var categoryName = row.dimensions_0 ? row.dimensions_0.label : "Item";
        var value = Number(row.measures_0.raw) || 0;

        if (!buckets[member]) {
          buckets[member] = { total: 0, byCategory: {}, sortKey: memberId };
          order.push(member);
        }
        buckets[member].total += value;
        buckets[member].byCategory[categoryName] = (buckets[member].byCategory[categoryName] || 0) + value;
      });

      var members = Object.keys(buckets);
      if (!members.length) {
        this._handleSimpleData(rows);
        return;
      }

      // Sort members to find the latest (current) vs the rest (previous).
      // Try numeric/date-like sort first (e.g. "2026" > "2025"); fall back to string sort.
      members.sort(function (a, b) {
        var na = parseFloat(String(a).replace(/[^0-9.\-]/g, ""));
        var nb = parseFloat(String(b).replace(/[^0-9.\-]/g, ""));
        if (!isNaN(na) && !isNaN(nb) && na !== nb) return nb - na;
        return String(b).localeCompare(String(a));
      });

      var currentMember = members[0];
      var previousMember = members.length > 1 ? members[1] : null;

      var currentBucket = buckets[currentMember];
      var segments = Object.keys(currentBucket.byCategory).map(function (name) {
        return { name: name, value: currentBucket.byCategory[name] };
      });

      if (!segments.length) {
        this._handleSimpleData(rows);
        return;
      }

      this._segments = segments;
      this._kpiTotal = currentBucket.total;
      this._hasRealData = true;

      if (previousMember && buckets[previousMember].total !== 0) {
        var diff = currentBucket.total - buckets[previousMember].total;
        var pct = (diff / Math.abs(buckets[previousMember].total)) * 100;
        this._variance = {
          pct: pct,
          diff: diff,
          direction: pct > 0.05 ? "up" : (pct < -0.05 ? "down" : "flat")
        };
      } else {
        this._variance = null;
      }
    }

    // Fallback used when no comparison dimension is bound: plain breakdown, no variance.
    _handleSimpleData(rows) {
      var segments = [];
      var total = 0;

      rows.forEach(function (row, i) {
        if (!row.measures_0) return;
        var name = row.dimensions_0 ? row.dimensions_0.label : "Item " + (i + 1);
        var value = Number(row.measures_0.raw) || 0;
        total += value;
        segments.push({ name: name, value: value });
      });

      if (!segments.length) {
        this._hasRealData = false;
        return;
      }

      this._segments = segments;
      this._kpiTotal = total;
      this._hasRealData = true;
      this._variance = null;
    }

    // ---- Internal: value formatting ----
    _formatValue(num) {
      var scale = this._props.valueScale || "auto";
      var decimals = this._props.decimalPlaces != null ? Number(this._props.decimalPlaces) : 1;
      var abs = Math.abs(num);
      var suffix = "";
      var divisor = 1;

      if (scale === "k") { divisor = 1e3; suffix = "K"; }
      else if (scale === "m") { divisor = 1e6; suffix = "M"; }
      else if (scale === "b") { divisor = 1e9; suffix = "B"; }
      else if (scale === "none") { divisor = 1; suffix = ""; }
      else {
        // auto
        if (abs >= 1e9) { divisor = 1e9; suffix = "B"; }
        else if (abs >= 1e6) { divisor = 1e6; suffix = "M"; }
        else if (abs >= 1e3) { divisor = 1e3; suffix = "K"; }
        else { divisor = 1; suffix = ""; }
      }

      var scaled = num / divisor;
      var formatted;
      try {
        formatted = new Intl.NumberFormat(undefined, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals
        }).format(scaled);
      } catch (e) {
        formatted = scaled.toFixed(decimals);
      }
      return formatted + suffix;
    }

    // ---- Internal: styling ----
    _applyStyleVars() {
      this.style.setProperty("--kfd-fs", (this._props.fontSize || 28) + "px");
      this.style.setProperty("--kfd-fc", this._props.fontColor || "#111111");
      this.style.setProperty("--kfd-mt", (this._props.marginTop != null ? this._props.marginTop : 12) + "px");
      this.style.setProperty("--kfd-mr", (this._props.marginRight != null ? this._props.marginRight : 12) + "px");
      this.style.setProperty("--kfd-mb", (this._props.marginBottom != null ? this._props.marginBottom : 12) + "px");
      this.style.setProperty("--kfd-ml", (this._props.marginLeft != null ? this._props.marginLeft : 12) + "px");
    }

    // ---- Internal: rendering ----
    _toggle() {
      this._flipped = !this._flipped;
      this._flipper.classList.toggle("flipped", this._flipped);
      this.dispatchEvent(new CustomEvent("onFlip", { detail: { side: this._flipped ? "chart" : "kpi" } }));
    }

    _render() {
      var deltaEl = this._shadowRoot.getElementById("kpiDelta");
      this._shadowRoot.getElementById("kpiLabel").textContent = this._props.kpiLabel;
      this._shadowRoot.getElementById("kpiValue").textContent = this._formatValue(this._kpiTotal);

      if (this._variance) {
        var arrowStyle = this._props.varianceArrowStyle || "arrow";
        var arrow;
        if (this._variance.direction === "up") {
          arrow = arrowStyle === "triangle" ? "\u25B2" : (arrowStyle === "sign" ? "+" : "\u2191");
        } else if (this._variance.direction === "down") {
          arrow = arrowStyle === "triangle" ? "\u25BC" : (arrowStyle === "sign" ? "-" : "\u2193");
        } else {
          arrow = arrowStyle === "sign" ? "\u00B1" : "\u2192";
        }

        var showAs = this._props.varianceShowAs || "percentage";
        var vDecimals = this._props.varianceDecimalPlaces != null ? Number(this._props.varianceDecimalPlaces) : 1;
        var pctText = Math.abs(this._variance.pct).toFixed(vDecimals) + "%";
        var numText = this._formatValue(Math.abs(this._variance.diff));
        var valueText;
        if (showAs === "number") valueText = numText;
        else if (showAs === "both") valueText = numText + " (" + pctText + ")";
        else valueText = pctText;

        var label = this._props.varianceLabel || "vs comparison";
        deltaEl.textContent = arrow + " " + valueText + " " + label;

        var color = this._variance.direction === "up" ? (this._props.variancePositiveColor || "#CBE894")
          : this._variance.direction === "down" ? (this._props.varianceNegativeColor || "#C4644C")
          : (this._props.varianceNullColor || "#CBE894");
        deltaEl.style.color = color;
        deltaEl.className = "kpi-delta";
      } else {
        deltaEl.textContent = this._props.kpiDelta;
        deltaEl.style.color = "";
        deltaEl.className = "kpi-delta";
      }

      this._shadowRoot.getElementById("kpiHint").textContent =
        this._hasRealData ? "Click for breakdown" : "Click for breakdown (demo data - connect a dimension and measure in the Builder panel)";
      this._shadowRoot.getElementById("donutTitle").textContent = this._props.kpiLabel + " by category";
    }

    _redrawDonut() {
      var svg = this._shadowRoot.getElementById("donutSvg");
      var legend = this._shadowRoot.getElementById("legend");
      if (!svg || !legend) return;
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      while (legend.firstChild) legend.removeChild(legend.firstChild);
      this._drawDonut();
    }

    _drawDonut() {
      var svg = this._shadowRoot.getElementById("donutSvg");
      var legend = this._shadowRoot.getElementById("legend");
      var tooltip = this._shadowRoot.getElementById("tooltip");
      var palette = PALETTES[this._props.colorPalette] || PALETTES.sac;
      var total = this._segments.reduce(function (s, seg) { return s + seg.value; }, 0);
      var cx = 50, cy = 50, r = 40;
      var startAngle = -90;
      var ns = "http://www.w3.org/2000/svg";
      var self = this;

      this._segments.forEach(function (seg, i) {
        var color = palette[i % palette.length];
        var angle = total ? (seg.value / total) * 360 : 0;
        var endAngle = startAngle + angle;
        var path = document.createElementNS(ns, "path");
        path.setAttribute("d", self._arcPath(cx, cy, r, startAngle, endAngle));
        path.setAttribute("fill", color);
        path.setAttribute("stroke", "#fff");
        path.setAttribute("stroke-width", "1");
        path.style.cursor = "pointer";
        path.addEventListener("mousemove", function (e) {
          tooltip.style.display = "block";
          var pct = total ? ((seg.value / total) * 100).toFixed(0) : 0;
          tooltip.textContent = seg.name + ": " + pct + "% (" + self._formatValue(seg.value) + ")";
          var rect = self._shadowRoot.host.getBoundingClientRect();
          tooltip.style.left = (e.clientX - rect.left + 8) + "px";
          tooltip.style.top = (e.clientY - rect.top + 8) + "px";
        });
        path.addEventListener("mouseleave", function () { tooltip.style.display = "none"; });
        svg.appendChild(path);
        startAngle = endAngle;
      });

      var hole = document.createElementNS(ns, "circle");
      hole.setAttribute("cx", cx); hole.setAttribute("cy", cy); hole.setAttribute("r", 22);
      hole.setAttribute("fill", "var(--kfd-bg, #fff)");
      svg.appendChild(hole);

      this._segments.forEach(function (seg, i) {
        var color = palette[i % palette.length];
        var pct = total ? Math.round((seg.value / total) * 100) : 0;
        var item = document.createElement("span");
        var sw = document.createElement("span");
        sw.className = "swatch";
        sw.style.background = color;
        item.appendChild(sw);
        item.appendChild(document.createTextNode(seg.name + " " + pct + "%"));
        legend.appendChild(item);
      });
    }

    _arcPath(cx, cy, r, startAngle, endAngle) {
      function toRad(a) { return (a * Math.PI) / 180; }
      var x1 = cx + r * Math.cos(toRad(startAngle));
      var y1 = cy + r * Math.sin(toRad(startAngle));
      var x2 = cx + r * Math.cos(toRad(endAngle));
      var y2 = cy + r * Math.sin(toRad(endAngle));
      var largeArc = endAngle - startAngle > 180 ? 1 : 0;
      return "M " + cx + " " + cy + " L " + x1 + " " + y1 + " A " + r + " " + r + " 0 " + largeArc + " 1 " + x2 + " " + y2 + " Z";
    }
  }

  customElements.define("com-raja-kpiflipdonut", KpiFlipDonutElement);
})();
