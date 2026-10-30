/* @ds-bundle: {"format":4,"namespace":"YouApp","components":[{"name":"Button"},{"name":"TextField"},{"name":"Toast"},{"name":"Tabs"},{"name":"SegmentedControl"},{"name":"BottomNav"},{"name":"ReviewCard"},{"name":"Dialog"},{"name":"Icon"}]} */
(function () {
  var React = window.React;
  var h = React.createElement;
  function cx() { return Array.prototype.filter.call(arguments, Boolean).join(" "); }

  function Icon(props) {
    if (!props.src) return null;
    return h("span", { className: cx("ya-icon", props.size === "sm" && "ya-icon-sm", props.className), "aria-hidden": "true",
      style: Object.assign({ "--ya-icon": "url(" + props.src + ")" }, props.style) });
  }

  function Button(props) {
    var variant = props.variant || "primary", size = props.size || "lg";
    var loading = !!props.loading;
    var rest = Object.assign({}, props);
    ["variant", "size", "loading", "iconStart", "iconEnd", "block", "pressed", "children", "className"].forEach(function (k) { delete rest[k]; });
    var startIcon = loading ? h("span", { className: "ya-spinner", "aria-hidden": "true" })
      : (props.iconStart ? h(Icon, { src: props.iconStart }) : null);
    return h("button", Object.assign({ type: "button" }, rest, {
      className: cx("ya-root ya-btn", "ya-btn-" + variant, size === "sm" && "ya-btn-sm", props.block && "ya-btn-block",
        loading && "is-loading", props.pressed && "is-pressed", props.className),
      disabled: props.disabled || loading, "aria-busy": loading || undefined
    }), startIcon, h("span", { className: "ya-btn-label" }, props.children),
      !loading && props.iconEnd ? h(Icon, { src: props.iconEnd }) : null);
  }

  function Helper(props) {
    if (!props.text) return h("span");
    var tone = props.tone || "info";
    return h("span", { className: cx("ya-help", "ya-help-" + tone), role: tone === "error" ? "alert" : undefined },
      props.icon ? h(Icon, { src: props.icon, size: "sm" }) : null, props.text);
  }

  function TextField(props) {
    var id = props.id || ("ya-f-" + Math.random().toString(36).slice(2, 8));
    var inside = props.labelPosition === "inside";
    var invalid = props.helperTone === "error";
    var label = props.label ? h(inside ? "label" : "label", { htmlFor: id, className: inside ? "ya-field-label" : "ya-field-title" },
      props.label, props.required ? h("span", { className: "ya-req", "aria-hidden": "true" }, "*") : null) : null;
    var input = h("input", { id: id, className: "ya-field-input", value: props.value, defaultValue: props.defaultValue,
      placeholder: props.placeholder, disabled: props.disabled, readOnly: props.select || props.readOnly, required: props.required,
      "aria-invalid": invalid || undefined, onChange: props.onChange, type: props.type || "text" });
    var trail = (props.trailingText || props.trailingIcon) ? h("span", { className: "ya-field-trail" }, props.trailingText || null,
      props.trailingIcon ? h(Icon, { src: props.trailingIcon }) : null) : null;
    var box = h("div", { className: cx("ya-field-box", props.disabled && "is-disabled", invalid && "is-invalid") },
      h("div", { className: "ya-field-main" }, inside ? label : null, input,
        props.subtitle ? h("span", { className: "ya-review-handle" }, props.subtitle) : null), trail);
    var help = (props.helper || props.meta) ? h("div", { className: "ya-field-help" },
      h(Helper, { text: props.helper, tone: props.helperTone, icon: props.helperIcon }), props.meta ? h("span", null, props.meta) : null) : null;
    return h("div", { className: "ya-root ya-field" }, inside ? null : label, box, help);
  }

  function Toast(props) {
    var tone = props.tone || "success";
    if (tone === "neutral") return h("div", { className: "ya-root ya-toast ya-toast-neutral", role: "status" }, h("span", { className: "ya-toast-msg" }, props.children));
    return h("div", { className: cx("ya-root ya-toast", "ya-toast-" + tone), role: tone === "failed" ? "alert" : "status" },
      h("span", { className: "ya-toast-bar", "aria-hidden": "true" }),
      props.icon ? h("span", { className: "ya-toast-icon" }, h(Icon, { src: props.icon })) : null,
      h("span", { className: "ya-toast-msg" }, props.children),
      props.actionLabel ? h("button", { type: "button", className: "ya-toast-action", onClick: props.onAction }, props.actionLabel) : null,
      props.onClose && props.closeIcon ? h("button", { type: "button", className: "ya-toast-close", "aria-label": "Dismiss", onClick: props.onClose }, h(Icon, { src: props.closeIcon })) : null);
  }

  function useControlled(value, initial, onChange) {
    var st = React.useState(initial), inner = st[0], set = st[1];
    var cur = value !== undefined ? value : inner;
    return [cur, function (v) { if (value === undefined) set(v); if (onChange) onChange(v); }];
  }

  function Tabs(props) {
    var items = props.items || [];
    var s = useControlled(props.value, props.defaultValue !== undefined ? props.defaultValue : (items[0] && items[0].value), props.onChange);
    return h("div", { className: "ya-root ya-tabs", role: "tablist" }, items.map(function (it) {
      var on = it.value === s[0];
      return h("button", { key: it.value, type: "button", role: "tab", "aria-selected": on, className: cx("ya-tab", on && "is-active"),
        onClick: function () { s[1](it.value); } }, h("span", { className: "ya-tab-label" }, it.label));
    }));
  }

  function SegmentedControl(props) {
    var items = props.items || [];
    var s = useControlled(props.value, props.defaultValue !== undefined ? props.defaultValue : (items[0] && items[0].value), props.onChange);
    return h("div", { className: "ya-root ya-seg", role: "radiogroup", "aria-label": props.ariaLabel }, items.map(function (it) {
      var on = it.value === s[0];
      return h("button", { key: it.value, type: "button", role: "radio", "aria-checked": on, className: cx("ya-seg-item", on && "is-active"),
        onClick: function () { s[1](it.value); } }, it.icon ? h(Icon, { src: it.icon }) : null, it.label);
    }));
  }

  function BottomNav(props) {
    var items = props.items || [];
    var s = useControlled(props.value, props.defaultValue !== undefined ? props.defaultValue : (items[0] && items[0].value), props.onChange);
    return h("nav", { className: "ya-root ya-nav", "aria-label": props.ariaLabel || "Main" }, items.map(function (it) {
      var on = it.value === s[0];
      return h("button", { key: it.value, type: "button", "aria-current": on ? "page" : undefined,
        className: cx("ya-nav-item", it.center && "ya-nav-center", on && "is-active"), onClick: function () { s[1](it.value); } },
        h("span", { className: "ya-nav-glyph" }, h(Icon, { src: on && it.activeIcon ? it.activeIcon : it.icon })), it.label);
    }));
  }

  function ReviewCard(props) {
    return h("article", { className: "ya-root ya-review" },
      h("div", { className: "ya-review-head" },
        props.avatar ? h("img", { className: "ya-avatar", src: props.avatar, alt: "" }) : h("span", { className: "ya-avatar" }),
        h("div", { className: "ya-review-who" }, h("div", { className: "ya-review-name" }, props.name),
          props.handle ? h("div", { className: "ya-review-handle" }, props.handle) : null),
        props.rating != null ? h("span", { className: "ya-rating", "aria-label": "Rating " + props.rating },
          props.starIcon ? h(Icon, { src: props.starIcon }) : null, Number(props.rating).toFixed(1)) : null),
      props.tag ? h("div", { className: "ya-review-tag" }, props.tag) : null,
      h("p", { className: "ya-review-body" }, props.children),
      props.date ? h("div", { className: "ya-review-date" }, props.date) : null);
  }

  function Dialog(props) {
    return h("div", { className: "ya-root ya-dialog", role: "dialog", "aria-modal": "true", "aria-labelledby": "ya-dlg-t" },
      h("div", { className: "ya-dialog-body" }, h("h2", { id: "ya-dlg-t", className: "ya-dialog-title" }, props.title),
        props.children ? h("p", { className: "ya-dialog-text" }, props.children) : null),
      h("div", { className: "ya-dialog-actions" },
        props.cancelLabel ? h(Button, { variant: props.cancelTone === "danger" ? "destructive-ghost" : "ghost", onClick: props.onCancel }, props.cancelLabel) : null,
        props.confirmLabel ? h(Button, { variant: "ghost", onClick: props.onConfirm }, props.confirmLabel) : null));
  }

  window.YouApp = Object.assign(window.YouApp || {}, {
    Button: Button, TextField: TextField, Toast: Toast, Tabs: Tabs, SegmentedControl: SegmentedControl,
    BottomNav: BottomNav, ReviewCard: ReviewCard, Dialog: Dialog, Icon: Icon
  });
})();
