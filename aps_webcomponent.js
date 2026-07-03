// KPI Flip Donut - Styling Panel (Additional Properties Sheet)
// Developed by: Varun Malhotra
(function () {
  var template = document.createElement("template");
  template.innerHTML = [
    "<style>",
    "  :host { display:block; font-family: '72', Arial, sans-serif; font-size:12px; color:#333; padding:8px; }",
    "  .credit { background:#f2f2f2; border:1px solid #ddd; border-radius:4px; padding:8px 10px; margin-bottom:12px; }",
    "  .credit-title { font-weight:600; color:#111; margin:0 0 2px; }",
    "  .credit-sub { color:#777; margin:0; font-size:11px; }",
    "  label { display:block; margin:10px 0 4px; color:#555; }",
    "  input { width:100%; box-sizing:border-box; padding:4px 6px; border:1px solid #ccc; border-radius:3px; font-size:12px; }",
    "</style>",
    "<div class=\"credit\">",
    "  <p class=\"credit-title\">Developed by Varun Malhotra</p>",
    "  <p class=\"credit-sub\">KPI Flip Donut - Custom Widget</p>",
    "</div>",
    "<label for=\"kpiLabel\">KPI label</label>",
    "<input id=\"kpiLabel\" type=\"text\" />",
    "<label for=\"kpiDelta\">KPI delta / trend text</label>",
    "<input id=\"kpiDelta\" type=\"text\" />"
  ].join("\n");

  class KpiFlipDonutAps extends HTMLElement {
    constructor() {
      super();
      this._shadowRoot = this.attachShadow({ mode: "open" });
      this._shadowRoot.appendChild(template.content.cloneNode(true));
      this._props = {
        kpiLabel: "Total revenue",
        kpiDelta: "up 8.3% vs last period"
      };
    }

    connectedCallback() {
      var self = this;
      ["kpiLabel", "kpiDelta"].forEach(function (key) {
        var input = self._shadowRoot.getElementById(key);
        input.value = self._props[key];
        input.addEventListener("change", function () {
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
      ["kpiLabel", "kpiDelta"].forEach(function (key) {
        var input = self._shadowRoot.getElementById(key);
        if (input) input.value = self._props[key];
      });
    }

    _fireChange() {
      this.dispatchEvent(new CustomEvent("propertiesChanged", {
        detail: {
          properties: {
            kpiLabel: this._props.kpiLabel,
            kpiDelta: this._props.kpiDelta
          }
        }
      }));
    }
  }

  customElements.define("com-raja-kpiflipdonut-aps", KpiFlipDonutAps);
})();
