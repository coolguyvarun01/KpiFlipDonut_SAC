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
    "    border:1px solid #ddd; border-radius:8px; background:#fff; display:flex; flex-direction:column;",
    "    align-items:center; justify-content:center; padding:12px; }",
    "  .back { transform: rotateY(180deg); }",
    "  .kpi-label { font-size:13px; color:#666; margin:0 0 6px; }",
    "  .kpi-value { font-size:28px; font-weight:600; margin:0 0 4px; color:#111; }",
    "  .kpi-delta { font-size:12px; color:#0f6e56; }",
    "  .kpi-hint { font-size:11px; color:#999; margin-top:10px; }",
    "  .donut-title { font-size:13px; color:#666; margin:0 0 8px; }",
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
    "      <p class=\"kpi-value\" id=\"kpiValue\">$4.82M</p>",
    "      <p class=\"kpi-delta\" id=\"kpiDelta\">up 8.3% vs last period</p>",
    "      <p class=\"kpi-hint\">Click for breakdown</p>",
    "    </div>",
    "    <div class=\"face back\">",
    "      <p class=\"donut-title\">Revenue by region</p>",
    "      <svg id=\"donutSvg\" viewBox=\"0 0 100 100\" width=\"120\" height=\"120\"></svg>",
    "      <div class=\"legend\" id=\"legend\"></div>",
    "    </div>",
    "  </div>",
    "  <div class=\"tooltip\" id=\"tooltip\"></div>",
    "</div>"
  ].join("\n");

  var KpiFlipDonut = /** @class */ (function () {
    function KpiFlipDonut() {}
    return KpiFlipDonut;
  })();

  class KpiFlipDonutElement extends HTMLElement {
    constructor() {
      super();
      this._shadowRoot = this.attachShadow({ mode: "open" });
      this._shadowRoot.appendChild(template.content.cloneNode(true));
      this._props = {
        kpiLabel: "Total revenue",
        kpiValue: "$4.82M",
        kpiDelta: "up 8.3% vs last period"
      };
      this._segments = [
        { name: "North America", value: 41, color: "#2a78d6" },
        { name: "EMEA", value: 28, color: "#1baf7a" },
        { name: "APAC", value: 19, color: "#eda100" },
        { name: "LATAM", value: 12, color: "#4a3aa7" }
      ];
      this._flipped = false;
    }

    connectedCallback() {
      this._flipper = this._shadowRoot.getElementById("flipper");
      this._flipper.addEventListener("click", () => this._toggle());
      this._drawDonut();
      this._render();
    }

    disconnectedCallback() {}

    onCustomWidgetBeforeUpdate(changedProperties) {
      this._props = Object.assign({}, this._props, changedProperties);
    }

    onCustomWidgetAfterUpdate() {
      this._render();
    }

    onCustomWidgetDestroy() {}

    // ---- Properties (settable from Styling panel or scripting) ----
    set kpiLabel(v) { this._props.kpiLabel = v; this._render(); }
    get kpiLabel() { return this._props.kpiLabel; }

    set kpiValue(v) { this._props.kpiValue = v; this._render(); }
    get kpiValue() { return this._props.kpiValue; }

    set kpiDelta(v) { this._props.kpiDelta = v; this._render(); }
    get kpiDelta() { return this._props.kpiDelta; }

    // ---- Methods (callable from scripting) ----
    flipToChart() {
      if (!this._flipped) this._toggle();
    }

    flipToKpi() {
      if (this._flipped) this._toggle();
    }

    // ---- Internal ----
    _toggle() {
      this._flipped = !this._flipped;
      this._flipper.classList.toggle("flipped", this._flipped);
      this.dispatchEvent(new CustomEvent("onFlip", { detail: { side: this._flipped ? "chart" : "kpi" } }));
    }

    _render() {
      this._shadowRoot.getElementById("kpiLabel").textContent = this._props.kpiLabel;
      this._shadowRoot.getElementById("kpiValue").textContent = this._props.kpiValue;
      this._shadowRoot.getElementById("kpiDelta").textContent = this._props.kpiDelta;
    }

    _drawDonut() {
      var svg = this._shadowRoot.getElementById("donutSvg");
      var legend = this._shadowRoot.getElementById("legend");
      var tooltip = this._shadowRoot.getElementById("tooltip");
      var total = this._segments.reduce(function (s, seg) { return s + seg.value; }, 0);
      var cx = 50, cy = 50, r = 40;
      var startAngle = -90;
      var ns = "http://www.w3.org/2000/svg";
      var self = this;

      this._segments.forEach(function (seg) {
        var angle = (seg.value / total) * 360;
        var endAngle = startAngle + angle;
        var path = document.createElementNS(ns, "path");
        path.setAttribute("d", self._arcPath(cx, cy, r, startAngle, endAngle));
        path.setAttribute("fill", seg.color);
        path.setAttribute("stroke", "#fff");
        path.setAttribute("stroke-width", "1");
        path.style.cursor = "pointer";
        path.addEventListener("mousemove", function (e) {
          tooltip.style.display = "block";
          var pct = total ? ((seg.value / total) * 100).toFixed(0) : 0;
          var amt = total ? ((seg.value / total) * 4.82).toFixed(2) : "0.00";
          tooltip.textContent = seg.name + ": " + pct + "% ($" + amt + "M)";
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
      hole.setAttribute("fill", "#fff");
      svg.appendChild(hole);

      this._segments.forEach(function (seg) {
        var item = document.createElement("span");
        var sw = document.createElement("span");
        sw.className = "swatch";
        sw.style.background = seg.color;
        item.appendChild(sw);
        item.appendChild(document.createTextNode(seg.name + " " + seg.value + "%"));
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
