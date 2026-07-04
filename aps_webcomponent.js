// KPI Flip Donut - Styling Panel (Additional Properties Sheet)
(function () {
  var template = document.createElement("template");
  template.innerHTML = [
    "<style>",
    "  :host { display:block; font-family: '72', Arial, sans-serif; font-size:12px; color:#333; padding:8px; }",
    "  .credit { background:#f2f2f2; border:1px solid #ddd; border-radius:4px; padding:8px 10px; margin-bottom:12px; }",
    "  .credit-title { font-weight:600; color:#111; margin:0 0 2px; }",
    "  .credit-sub { color:#777; margin:0; font-size:11px; }",
    "  .section-title { font-weight:600; color:#111; margin:16px 0 6px; border-top:1px solid #eee; padding-top:10px; }",
    "  .section-title:first-of-type { border-top:none; padding-top:0; }",
    "  label { display:block; margin:8px 0 3px; color:#555; }",
    "  input, select { width:100%; box-sizing:border-box; padding:4px 6px; border:1px solid #ccc; border-radius:3px; font-size:12px; }",
    "  .row2 { display:flex; gap:8px; }",
    "  .row2 > div { flex:1; }",
    "  input[type=color] { padding:2px; height:28px; }",
    "</style>",
    "<div class=\"credit\">",
    "  <p class=\"credit-title\">Developed by Varun Malhotra</p>",
    "  <p class=\"credit-sub\">KPI Flip Donut - Custom Widget</p>",
    "</div>",

    "<div class=\"section-title\">Title &amp; trend</div>",
    "<label for=\"kpiLabel\">Title</label>",
    "<input id=\"kpiLabel\" type=\"text\" />",
    "<label for=\"kpiDelta\">Trend text (used if no comparison measure is bound)</label>",
    "<input id=\"kpiDelta\" type=\"text\" />",

    "<div class=\"section-title\">Value format</div>",
    "<div class=\"row2\">",
    "  <div>",
    "    <label for=\"valueScale\">Scale</label>",
    "    <select id=\"valueScale\">",
    "      <option value=\"auto\">Auto</option>",
    "      <option value=\"none\">None</option>",
    "      <option value=\"k\">Thousands (K)</option>",
    "      <option value=\"m\">Millions (M)</option>",
    "      <option value=\"b\">Billions (B)</option>",
    "    </select>",
    "  </div>",
    "  <div>",
    "    <label for=\"decimalPlaces\">Decimals</label>",
    "    <input id=\"decimalPlaces\" type=\"number\" min=\"0\" max=\"4\" />",
    "  </div>",
    "</div>",

    "<div class=\"section-title\">Font</div>",
    "<div class=\"row2\">",
    "  <div>",
    "    <label for=\"fontSize\">Value size (px)</label>",
    "    <input id=\"fontSize\" type=\"number\" min=\"10\" max=\"72\" />",
    "  </div>",
    "  <div>",
    "    <label for=\"fontColor\">Value color</label>",
    "    <input id=\"fontColor\" type=\"color\" />",
    "  </div>",
    "</div>",
    "<label for=\"titleColor\">Title color</label>",
    "<input id=\"titleColor\" type=\"color\" />",

    "<div class=\"section-title\">Style preset</div>",
    "<label for=\"tilePreset\">Preset (overrides colors above when not \\\"None\\\")</label>",
    "<select id=\"tilePreset\">",
    "  <option value=\"none\">None (use manual colors)</option>",
    "  <option value=\"kpiTile\">KPI Tile</option>",
    "  <option value=\"kpiTileAccent\">KPI Tile - Accent</option>",
    "</select>",

    "<div class=\"section-title\">Margin (px)</div>",
    "<div class=\"row2\">",
    "  <div>",
    "    <label for=\"marginTop\">Top</label>",
    "    <input id=\"marginTop\" type=\"number\" min=\"0\" max=\"60\" />",
    "  </div>",
    "  <div>",
    "    <label for=\"marginRight\">Right</label>",
    "    <input id=\"marginRight\" type=\"number\" min=\"0\" max=\"60\" />",
    "  </div>",
    "</div>",
    "<div class=\"row2\">",
    "  <div>",
    "    <label for=\"marginBottom\">Bottom</label>",
    "    <input id=\"marginBottom\" type=\"number\" min=\"0\" max=\"60\" />",
    "  </div>",
    "  <div>",
    "    <label for=\"marginLeft\">Left</label>",
    "    <input id=\"marginLeft\" type=\"number\" min=\"0\" max=\"60\" />",
    "  </div>",
    "</div>",

    "<div class=\"section-title\">Donut color palette</div>",
    "<select id=\"colorPalette\">",
    "  <option value=\"sac\">SAC standard</option>",
    "  <option value=\"warm\">Warm</option>",
    "  <option value=\"cool\">Cool</option>",
    "  <option value=\"mono\">Monochrome</option>",
    "</select>",

    "<div class=\"section-title\">Variance display</div>",
    "<label for=\"varianceLabel\">Label suffix</label>",
    "<input id=\"varianceLabel\" type=\"text\" />",
    "<div class=\"row2\">",
    "  <div>",
    "    <label for=\"varianceShowAs\">Show as</label>",
    "    <select id=\"varianceShowAs\">",
    "      <option value=\"percentage\">Percentage</option>",
    "      <option value=\"number\">Number</option>",
    "      <option value=\"both\">Both</option>",
    "    </select>",
    "  </div>",
    "  <div>",
    "    <label for=\"varianceDecimalPlaces\">Decimals</label>",
    "    <input id=\"varianceDecimalPlaces\" type=\"number\" min=\"0\" max=\"4\" />",
    "  </div>",
    "</div>",
    "<label for=\"varianceArrowStyle\">Arrow style</label>",
    "<select id=\"varianceArrowStyle\">",
    "  <option value=\"arrow\">Arrow (up/down)</option>",
    "  <option value=\"triangle\">Triangle</option>",
    "  <option value=\"sign\">Plus / minus sign</option>",
    "</select>",
    "<div class=\"row2\">",
    "  <div>",
    "    <label for=\"variancePositiveColor\">Positive</label>",
    "    <input id=\"variancePositiveColor\" type=\"color\" />",
    "  </div>",
    "  <div>",
    "    <label for=\"varianceNegativeColor\">Negative</label>",
    "    <input id=\"varianceNegativeColor\" type=\"color\" />",
    "  </div>",
    "</div>",
    "<label for=\"varianceNullColor\">Flat / null</label>",
    "<input id=\"varianceNullColor\" type=\"color\" />"
  ].join("\n");

  var FIELDS = ["kpiLabel", "kpiDelta", "valueScale", "decimalPlaces", "fontSize", "fontColor", "titleColor", "tilePreset", "marginTop", "marginRight", "marginBottom", "marginLeft", "colorPalette", "varianceLabel", "varianceShowAs", "varianceDecimalPlaces", "varianceArrowStyle", "variancePositiveColor", "varianceNegativeColor", "varianceNullColor"];

  var DEFAULTS = {
    kpiLabel: "Total revenue",
    kpiDelta: "up 8.3% vs last period",
    valueScale: "auto",
    decimalPlaces: 1,
    fontSize: 28,
    fontColor: "#111111",
    titleColor: "#666666",
    tilePreset: "none",
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

  class KpiFlipDonutAps extends HTMLElement {
    constructor() {
      super();
      this._shadowRoot = this.attachShadow({ mode: "open" });
      this._shadowRoot.appendChild(template.content.cloneNode(true));
      this._props = Object.assign({}, DEFAULTS);
    }

    connectedCallback() {
      var self = this;
      FIELDS.forEach(function (key) {
        var input = self._shadowRoot.getElementById(key);
        if (!input) return;
        input.value = self._props[key];
        var evt = (input.tagName === "SELECT" || input.type === "color") ? "change" : "change";
        input.addEventListener(evt, function () {
          self._props[key] = input.value;
          self._fireChange();
        });
      });
    }

    onCustomWidgetBeforeUpdate(changedProperties) {
      this._props = Object.assign({}, this._props, changedProperties);
    }

    onCustomWidgetAfterUpdate() {
      var self = this;
      FIELDS.forEach(function (key) {
        var input = self._shadowRoot.getElementById(key);
        if (input) input.value = self._props[key];
      });
    }

    _fireChange() {
      var props = {};
      var self = this;
      FIELDS.forEach(function (key) { props[key] = self._props[key]; });
      this.dispatchEvent(new CustomEvent("propertiesChanged", { detail: { properties: props } }));
    }
  }

  customElements.define("com-raja-kpiflipdonut-aps", KpiFlipDonutAps);
})();
