"use strict";

const { createSonarRule } = require("../utils/rule-helpers");

/**
 * JSX / ARIA accessibility rules (Sonar way, TypeScript).
 */

const VALID_ROLES = new Set([
  "alert",
  "alertdialog",
  "application",
  "article",
  "banner",
  "button",
  "cell",
  "checkbox",
  "columnheader",
  "combobox",
  "complementary",
  "contentinfo",
  "definition",
  "dialog",
  "directory",
  "document",
  "feed",
  "figure",
  "form",
  "grid",
  "gridcell",
  "group",
  "heading",
  "img",
  "link",
  "list",
  "listbox",
  "listitem",
  "log",
  "main",
  "marquee",
  "math",
  "menu",
  "menubar",
  "menuitem",
  "menuitemcheckbox",
  "menuitemradio",
  "navigation",
  "none",
  "note",
  "option",
  "presentation",
  "progressbar",
  "radio",
  "radiogroup",
  "region",
  "row",
  "rowgroup",
  "rowheader",
  "scrollbar",
  "search",
  "searchbox",
  "separator",
  "slider",
  "spinbutton",
  "status",
  "switch",
  "tab",
  "table",
  "tablist",
  "tabpanel",
  "term",
  "textbox",
  "timer",
  "toolbar",
  "tooltip",
  "tree",
  "treegrid",
  "treeitem",
]);

const ABSTRACT_ROLES = new Set([
  "command",
  "composite",
  "input",
  "landmark",
  "range",
  "roletype",
  "section",
  "sectionhead",
  "select",
  "structure",
  "widget",
  "window",
]);

const IMPLICIT_ROLES = {
  button: "button",
  a: "link",
  nav: "navigation",
  ul: "list",
  ol: "list",
  li: "listitem",
  h1: "heading",
  h2: "heading",
  h3: "heading",
  h4: "heading",
  h5: "heading",
  h6: "heading",
  img: "img",
  table: "table",
  form: "form",
  main: "main",
  header: "banner",
  footer: "contentinfo",
  aside: "complementary",
  article: "article",
  select: "listbox",
  textarea: "textbox",
  input: "textbox",
};

const INTERACTIVE_ELEMENTS = new Set([
  "button",
  "a",
  "input",
  "select",
  "textarea",
  "option",
  "details",
  "summary",
  "audio",
  "video",
]);

const INTERACTIVE_ROLES = new Set([
  "button",
  "checkbox",
  "link",
  "menuitem",
  "option",
  "radio",
  "searchbox",
  "slider",
  "spinbutton",
  "switch",
  "tab",
  "textbox",
]);

const NON_INTERACTIVE_ELEMENTS = new Set([
  "div",
  "span",
  "p",
  "section",
  "article",
  "header",
  "footer",
  "main",
  "aside",
  "nav",
  "ul",
  "ol",
  "li",
  "table",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
]);

const REQUIRED_ROLE_PROPERTIES = {
  checkbox: ["aria-checked"],
  radio: ["aria-checked"],
  switch: ["aria-checked"],
  slider: ["aria-valuenow"],
  spinbutton: ["aria-valuenow"],
  scrollbar: ["aria-valuenow", "aria-controls"],
  combobox: ["aria-expanded"],
  heading: ["aria-level"],
  option: ["aria-selected"],
};

const ELEMENTS_WITHOUT_ARIA = new Set([
  "meta",
  "html",
  "script",
  "style",
  "title",
  "base",
  "head",
]);

const MOUSE_HANDLERS = new Set([
  "onClick",
  "onMouseDown",
  "onMouseUp",
  "onMouseOver",
  "onMouseOut",
  "onDblClick",
]);

const KEYBOARD_HANDLERS = new Set([
  "onKeyDown",
  "onKeyUp",
  "onKeyPress",
  "onFocus",
  "onBlur",
]);

const KNOWN_PROPERTIES = new Set([
  "className",
  "style",
  "id",
  "children",
  "role",
  "tabIndex",
  "accessKey",
  "title",
  "lang",
  "dir",
  "hidden",
  "key",
  "ref",
  "dangerouslySetInnerHTML",
  "href",
  "target",
  "rel",
  "src",
  "alt",
  "width",
  "height",
  "type",
  "value",
  "placeholder",
  "disabled",
  "readOnly",
  "checked",
  "name",
  "htmlFor",
  "onChange",
  "onClick",
  "onSubmit",
  "onFocus",
  "onBlur",
  "onKeyDown",
  "onKeyUp",
  "onKeyPress",
  "onMouseDown",
  "onMouseUp",
  "onMouseOver",
  "onMouseOut",
  "onLoad",
  "onError",
  "onScroll",
  "onInput",
  "onPress",
  "onPressIn",
  "onPressOut",
  "onLongPress",
  "source",
  "resizeMode",
  "testID",
  "accessible",
  "accessibilityLabel",
  "accessibilityRole",
  "accessibilityState",
  "accessibilityHint",
  "accessibilityValue",
  "accessibilityLiveRegion",
  "accessibilityElementsHidden",
  "importantForAccessibility",
  "nativeID",
  "pointerEvents",
  "numberOfLines",
  "ellipsizeMode",
  "allowFontScaling",
  "adjustsFontSizeToFit",
  "selectable",
  "suppressHighlighting",
  "hitSlop",
  "activeOpacity",
  "underlayColor",
  "autoComplete",
  "autoCapitalize",
  "autoCorrect",
  "keyboardType",
  "returnKeyType",
  "secureTextEntry",
  "multiline",
  "maxLength",
  "editable",
  "contentContainerStyle",
  "showsVerticalScrollIndicator",
  "showsHorizontalScrollIndicator",
  "horizontal",
  "pagingEnabled",
  "scrollEnabled",
  "bounces",
  "onRefresh",
  "refreshing",
  "data",
  "renderItem",
  "keyExtractor",
  "ListHeaderComponent",
  "ListFooterComponent",
  "ListEmptyComponent",
  "ItemSeparatorComponent",
  "initialNumToRender",
  "getItemLayout",
  "viewabilityConfig",
  "onViewableItemsChanged",
  "removeClippedSubviews",
  "nestedScrollEnabled",
  "scrollEventThrottle",
  "onEndReached",
  "onEndReachedThreshold",
  "contentInset",
  "behavior",
  "colSpan",
  "rowSpan",
  "scope",
  "headers",
  "cellPadding",
  "cellSpacing",
  "htmlFor",
  "form",
  "method",
  "action",
  "accept",
  "acceptCharset",
  "encType",
  "noValidate",
  "autoFocus",
  "multiple",
  "size",
  "step",
  "min",
  "max",
  "pattern",
  "required",
  "spellCheck",
  "translate",
  "draggable",
  "onDrag",
  "onDrop",
  "onDragStart",
  "onDragEnd",
  "onTouchStart",
  "onTouchEnd",
  "onTouchMove",
  "onContextMenu",
  "onWheel",
  "onAnimationEnd",
  "fill",
  "stroke",
  "strokeWidth",
  "viewBox",
  "d",
  "x",
  "y",
  "cx",
  "cy",
  "r",
  "rx",
  "ry",
  "points",
  "transform",
  "opacity",
  "clipPath",
  "strokeLinecap",
  "strokeLinejoin",
  "strokeDasharray",
  "fillRule",
  "clipRule",
  "preserveAspectRatio",
  "xmlns",
]);

function getAttributeName(attribute) {
  if (!attribute || attribute.type !== "JSXAttribute" || !attribute.name) {
    return null;
  }
  if (attribute.name.type === "JSXIdentifier") {
    return attribute.name.name;
  }
  if (attribute.name.type === "JSXNamespacedName") {
    return `${attribute.name.namespace.name}:${attribute.name.name.name}`;
  }
  return null;
}

function getAttribute(node, name) {
  return (node.attributes || []).find(
    (attribute) => getAttributeName(attribute) === name,
  );
}

function getLiteralAttributeValue(attribute) {
  if (!attribute || !attribute.value) {
    return null;
  }
  if (attribute.value.type === "Literal") {
    return String(attribute.value.value);
  }
  if (
    attribute.value.type === "JSXExpressionContainer" &&
    attribute.value.expression.type === "Literal"
  ) {
    return String(attribute.value.expression.value);
  }
  return null;
}

function getElementName(node) {
  if (!node.name) {
    return null;
  }
  if (node.name.type === "JSXIdentifier") {
    return node.name.name;
  }
  return null;
}

function report(context, node, ruleKey, message) {
  context.report({ node, message: `${message} [typescript:${ruleKey}]` });
}

// S6821: ARIA roles should be valid non-abstract roles
const S6821 = createSonarRule(
  "S6821",
  "DOM elements with ARIA roles should have a valid non-abstract role",
  (context, ruleKey) => ({
    JSXOpeningElement(node) {
      const roleAttribute = getAttribute(node, "role");
      if (!roleAttribute) {
        return;
      }
      const role = getLiteralAttributeValue(roleAttribute);
      if (role === null) {
        return;
      }
      const normalized = role.trim().split(/\s+/)[0];
      if (ABSTRACT_ROLES.has(normalized)) {
        report(
          context,
          roleAttribute,
          ruleKey,
          `"${normalized}" is an abstract ARIA role and must not be used.`,
        );
      } else if (!VALID_ROLES.has(normalized)) {
        report(
          context,
          roleAttribute,
          ruleKey,
          `"${normalized}" is not a valid ARIA role.`,
        );
      }
    },
  }),
);

// S6822: No redundant ARIA role
const S6822 = createSonarRule(
  "S6822",
  "No redundant ARIA role",
  (context, ruleKey) => ({
    JSXOpeningElement(node) {
      const roleAttribute = getAttribute(node, "role");
      const elementName = getElementName(node);
      if (!roleAttribute || !elementName) {
        return;
      }
      const role = getLiteralAttributeValue(roleAttribute);
      if (role && IMPLICIT_ROLES[elementName] === role.trim()) {
        report(
          context,
          roleAttribute,
          ruleKey,
          `The role "${role}" is redundant on <${elementName}>.`,
        );
      }
    },
  }),
);

// S6823: aria-activedescendant elements should be focusable
const S6823 = createSonarRule(
  "S6823",
  "DOM elements with the `aria-activedescendant` property should be accessible via the tab key",
  (context, ruleKey) => ({
    JSXOpeningElement(node) {
      if (!getAttribute(node, "aria-activedescendant")) {
        return;
      }
      if (!getAttribute(node, "tabIndex")) {
        report(
          context,
          node,
          ruleKey,
          "Elements with aria-activedescendant must be focusable (add tabIndex).",
        );
      }
    },
  }),
);

// S6824: No ARIA role or property for unsupported elements
const S6824 = createSonarRule(
  "S6824",
  "No ARIA role or property for unsupported DOM elements",
  (context, ruleKey) => ({
    JSXOpeningElement(node) {
      const elementName = getElementName(node);
      if (!elementName || !ELEMENTS_WITHOUT_ARIA.has(elementName)) {
        return;
      }
      for (const attribute of node.attributes || []) {
        const name = getAttributeName(attribute);
        if (name && (name === "role" || name.startsWith("aria-"))) {
          report(
            context,
            attribute,
            ruleKey,
            `<${elementName}> does not support ARIA attributes.`,
          );
        }
      }
    },
  }),
);

// S6825: Focusable elements should not have aria-hidden
const S6825 = createSonarRule(
  "S6825",
  'Focusable elements should not have "aria-hidden" attribute',
  (context, ruleKey) => ({
    JSXOpeningElement(node) {
      const hidden = getAttribute(node, "aria-hidden");
      if (!hidden || getLiteralAttributeValue(hidden) !== "true") {
        return;
      }
      const tabIndex = getAttribute(node, "tabIndex");
      if (tabIndex) {
        report(
          context,
          hidden,
          ruleKey,
          'A focusable element must not be hidden from assistive technologies (aria-hidden="true").',
        );
      }
    },
  }),
);

// S6747: JSX elements should not use unknown properties and attributes
const S6747 = createSonarRule(
  "S6747",
  "JSX elements should not use unknown properties and attributes",
  (context, ruleKey) => ({
    JSXOpeningElement(node) {
      const elementName = getElementName(node);
      // Custom components (uppercase) accept arbitrary props; only DOM tags
      // are checked against the known attribute list.
      if (!elementName || !/^[a-z]/.test(elementName)) {
        return;
      }
      for (const attribute of node.attributes || []) {
        if (attribute.type !== "JSXAttribute") {
          continue;
        }
        const name = getAttributeName(attribute);
        if (!name) {
          continue;
        }
        const isKnown =
          KNOWN_PROPERTIES.has(name) ||
          name.startsWith("data-") ||
          name.startsWith("aria-") ||
          /^on[A-Z]/.test(name) ||
          name.includes("-");
        if (!isKnown) {
          report(
            context,
            attribute,
            ruleKey,
            `"${name}" is not a known JSX property.`,
          );
        }
      }
    },
  }),
);

// S6807: ARIA roles should have required properties
const S6807 = createSonarRule(
  "S6807",
  "DOM elements with ARIA roles should have the required properties",
  (context, ruleKey) => ({
    JSXOpeningElement(node) {
      const roleAttribute = getAttribute(node, "role");
      if (!roleAttribute) {
        return;
      }
      const role = getLiteralAttributeValue(roleAttribute);
      if (!role) {
        return;
      }
      const required = REQUIRED_ROLE_PROPERTIES[role.trim()];
      if (!required) {
        return;
      }
      for (const property of required) {
        if (!getAttribute(node, property)) {
          report(
            context,
            roleAttribute,
            ruleKey,
            `The role "${role}" requires the "${property}" property.`,
          );
        }
      }
    },
  }),
);

// S6811: ARIA roles should only have supported properties
const ROLE_UNSUPPORTED_PROPERTIES = {
  button: ["aria-checked", "aria-selected", "aria-expanded"],
  link: ["aria-checked", "aria-selected"],
  heading: ["aria-checked"],
  img: ["aria-checked", "aria-expanded"],
};

const S6811 = createSonarRule(
  "S6811",
  "DOM elements with ARIA role should only have supported properties",
  (context, ruleKey) => ({
    JSXOpeningElement(node) {
      const roleAttribute = getAttribute(node, "role");
      if (!roleAttribute) {
        return;
      }
      const role = getLiteralAttributeValue(roleAttribute);
      const unsupported = role && ROLE_UNSUPPORTED_PROPERTIES[role.trim()];
      if (!unsupported) {
        return;
      }
      for (const property of unsupported) {
        const attribute = getAttribute(node, property);
        if (attribute) {
          report(
            context,
            attribute,
            ruleKey,
            `The role "${role}" does not support "${property}".`,
          );
        }
      }
    },
  }),
);

// S6819: Prefer tag over ARIA role
const S6819 = createSonarRule(
  "S6819",
  "Prefer tag over ARIA role",
  (context, ruleKey) => ({
    JSXOpeningElement(node) {
      const roleAttribute = getAttribute(node, "role");
      const elementName = getElementName(node);
      if (!roleAttribute || !elementName) {
        return;
      }
      const role = getLiteralAttributeValue(roleAttribute);
      if (!role) {
        return;
      }
      const preferredTag = Object.keys(IMPLICIT_ROLES).find(
        (tag) => IMPLICIT_ROLES[tag] === role.trim() && tag !== elementName,
      );
      if (preferredTag && IMPLICIT_ROLES[preferredTag] === role.trim()) {
        report(
          context,
          roleAttribute,
          ruleKey,
          `Prefer the native <${preferredTag}> element over role="${role}".`,
        );
      }
    },
  }),
);

// S6843: Interactive elements should not have non-interactive ARIA roles
const S6843 = createSonarRule(
  "S6843",
  "Interactive DOM elements should not have non-interactive ARIA roles",
  (context, ruleKey) => ({
    JSXOpeningElement(node) {
      const elementName = getElementName(node);
      const roleAttribute = getAttribute(node, "role");
      if (!elementName || !roleAttribute) {
        return;
      }
      const role = getLiteralAttributeValue(roleAttribute);
      if (
        INTERACTIVE_ELEMENTS.has(elementName) &&
        role &&
        !INTERACTIVE_ROLES.has(role.trim()) &&
        role.trim() !== "none" &&
        role.trim() !== "presentation"
      ) {
        report(
          context,
          roleAttribute,
          ruleKey,
          `The interactive <${elementName}> must not have the non-interactive role "${role}".`,
        );
      }
    },
  }),
);

// S6844: Anchor tags should not be used as buttons
const S6844 = createSonarRule(
  "S6844",
  "Anchor tags should not be used as buttons",
  (context, ruleKey) => ({
    JSXOpeningElement(node) {
      if (getElementName(node) !== "a") {
        return;
      }
      const href = getLiteralAttributeValue(getAttribute(node, "href"));
      const hasHandler = (node.attributes || []).some((attribute) =>
        MOUSE_HANDLERS.has(getAttributeName(attribute)),
      );
      if (hasHandler && (!href || href === "#")) {
        report(
          context,
          node,
          ruleKey,
          "Do not use an anchor without a real href as a button; use <button>.",
        );
      }
    },
  }),
);

// S6845: Non-interactive elements should not have tabIndex
const S6845 = createSonarRule(
  "S6845",
  "Non-interactive DOM elements should not have the `tabIndex` property",
  (context, ruleKey) => ({
    JSXOpeningElement(node) {
      const elementName = getElementName(node);
      const tabIndex = getAttribute(node, "tabIndex");
      if (
        !elementName ||
        !tabIndex ||
        !NON_INTERACTIVE_ELEMENTS.has(elementName)
      ) {
        return;
      }
      if (!getAttribute(node, "role")) {
        report(
          context,
          tabIndex,
          ruleKey,
          `The non-interactive <${elementName}> should not have tabIndex without an interactive role.`,
        );
      }
    },
  }),
);

// S6840: DOM elements should use the autocomplete attribute correctly
const S6840 = createSonarRule(
  "S6840",
  'DOM elements should use the "autocomplete" attribute correctly',
  (context, ruleKey) => ({
    JSXOpeningElement(node) {
      const elementName = getElementName(node);
      const autoComplete = getAttribute(node, "autoComplete");
      if (!elementName || !autoComplete) {
        return;
      }
      if (!new Set(["input", "form", "select", "textarea"]).has(elementName)) {
        report(
          context,
          autoComplete,
          ruleKey,
          `The "autoComplete" attribute is not supported on <${elementName}>.`,
        );
      }
    },
  }),
);

// S6841: tabIndex values should be 0 or -1
const S6841 = createSonarRule(
  "S6841",
  '"tabIndex" values should be 0 or -1',
  (context, ruleKey) => ({
    JSXOpeningElement(node) {
      const tabIndex = getAttribute(node, "tabIndex");
      if (!tabIndex) {
        return;
      }
      const value = getLiteralAttributeValue(tabIndex);
      if (value === null || value === "0" || value === "-1") {
        return;
      }
      report(
        context,
        tabIndex,
        ruleKey,
        `tabIndex must be 0 or -1, not "${value}".`,
      );
    },
  }),
);

// S6842: Non-interactive elements should not have interactive ARIA roles
const S6842 = createSonarRule(
  "S6842",
  "Non-interactive DOM elements should not have interactive ARIA roles",
  (context, ruleKey) => ({
    JSXOpeningElement(node) {
      const elementName = getElementName(node);
      const roleAttribute = getAttribute(node, "role");
      if (!elementName || !roleAttribute) {
        return;
      }
      const role = getLiteralAttributeValue(roleAttribute);
      if (
        NON_INTERACTIVE_ELEMENTS.has(elementName) &&
        role &&
        INTERACTIVE_ROLES.has(role.trim())
      ) {
        report(
          context,
          roleAttribute,
          ruleKey,
          `The non-interactive <${elementName}> should not have the interactive role "${role}".`,
        );
      }
    },
  }),
);

// S6846: DOM elements should not use the accesskey property
const S6846 = createSonarRule(
  "S6846",
  'DOM elements should not use the "accesskey" property',
  (context, ruleKey) => ({
    JSXOpeningElement(node) {
      const attribute =
        getAttribute(node, "accessKey") || getAttribute(node, "accesskey");
      if (attribute) {
        report(
          context,
          attribute,
          ruleKey,
          "The accessKey attribute is inconsistent across platforms and should not be used.",
        );
      }
    },
  }),
);

// S6847: Non-interactive elements should not have event handlers
const S6847 = createSonarRule(
  "S6847",
  "Non-interactive elements shouldn't have event handlers",
  (context, ruleKey) => ({
    JSXOpeningElement(node) {
      const elementName = getElementName(node);
      if (
        !elementName ||
        !NON_INTERACTIVE_ELEMENTS.has(elementName) ||
        getAttribute(node, "role")
      ) {
        return;
      }
      for (const attribute of node.attributes || []) {
        if (MOUSE_HANDLERS.has(getAttributeName(attribute))) {
          report(
            context,
            attribute,
            ruleKey,
            `The non-interactive <${elementName}> should not have mouse handlers.`,
          );
        }
      }
    },
  }),
);

// S6848: Non-interactive elements should not have an interactive handler
const S6848 = createSonarRule(
  "S6848",
  "Non-interactive DOM elements should not have an interactive handler",
  (context, ruleKey) => ({
    JSXOpeningElement(node) {
      const elementName = getElementName(node);
      if (
        !elementName ||
        !NON_INTERACTIVE_ELEMENTS.has(elementName) ||
        getAttribute(node, "role")
      ) {
        return;
      }
      for (const attribute of node.attributes || []) {
        if (KEYBOARD_HANDLERS.has(getAttributeName(attribute))) {
          report(
            context,
            attribute,
            ruleKey,
            `The non-interactive <${elementName}> should not have keyboard handlers.`,
          );
        }
      }
    },
  }),
);

// S6850: Heading elements should have accessible content
const S6850 = createSonarRule(
  "S6850",
  "Heading elements should have accessible content",
  (context, ruleKey) => ({
    JSXElement(node) {
      const elementName = getElementName(node.openingElement);
      if (!elementName || !/^h[1-6]$/.test(elementName)) {
        return;
      }
      const hasContent = (node.children || []).some(
        (child) =>
          (child.type === "JSXText" && child.value.trim().length > 0) ||
          child.type === "JSXExpressionContainer" ||
          child.type === "JSXElement",
      );
      if (!hasContent) {
        report(
          context,
          node.openingElement,
          ruleKey,
          `The <${elementName}> element must have accessible content.`,
        );
      }
    },
  }),
);

// S6851: Images should have a non-redundant alternate description
const S6851 = createSonarRule(
  "S6851",
  "Images should have a non-redundant alternate description",
  (context, ruleKey) => ({
    JSXOpeningElement(node) {
      if (getElementName(node) !== "img") {
        return;
      }
      const alt = getLiteralAttributeValue(getAttribute(node, "alt"));
      if (alt && /\.(png|jpe?g|gif|svg|webp|bmp)$/i.test(alt.trim())) {
        report(
          context,
          getAttribute(node, "alt"),
          ruleKey,
          "The alt text should describe the image, not repeat the file name.",
        );
      }
    },
  }),
);

// S6852: Interactive roles should support focus
const S6852 = createSonarRule(
  "S6852",
  "Elements with an interactive role should support focus",
  (context, ruleKey) => ({
    JSXOpeningElement(node) {
      const roleAttribute = getAttribute(node, "role");
      if (!roleAttribute) {
        return;
      }
      const role = getLiteralAttributeValue(roleAttribute);
      if (
        role &&
        INTERACTIVE_ROLES.has(role.trim()) &&
        !getAttribute(node, "tabIndex")
      ) {
        report(
          context,
          roleAttribute,
          ruleKey,
          `Elements with the interactive role "${role}" must be focusable (add tabIndex).`,
        );
      }
    },
  }),
);

// S6853: Label elements should have a text label and an associated control
const S6853 = createSonarRule(
  "S6853",
  "Label elements should have a text label and an associated control",
  (context, ruleKey) => ({
    JSXElement(node) {
      if (getElementName(node.openingElement) !== "label") {
        return;
      }
      const hasHtmlFor = getAttribute(node.openingElement, "htmlFor");
      const hasText = (node.children || []).some(
        (child) =>
          (child.type === "JSXText" && child.value.trim().length > 0) ||
          child.type === "JSXExpressionContainer",
      );
      const hasControl = (node.children || []).some(
        (child) =>
          child.type === "JSXElement" &&
          new Set(["input", "select", "textarea", "button"]).has(
            getElementName(child.openingElement),
          ),
      );
      if (!hasHtmlFor && !hasText && !hasControl) {
        report(
          context,
          node.openingElement,
          ruleKey,
          "A <label> must have text and be associated with a control.",
        );
      }
    },
  }),
);

// S6793: ARIA properties in DOM elements should have valid values
const ARIA_BOOLEAN_PROPERTIES = new Set([
  "aria-hidden",
  "aria-expanded",
  "aria-selected",
  "aria-checked",
  "aria-disabled",
  "aria-required",
  "aria-invalid",
  "aria-busy",
  "aria-live",
]);

const S6793 = createSonarRule(
  "S6793",
  "ARIA properties in DOM elements should have valid values",
  (context, ruleKey) => ({
    JSXOpeningElement(node) {
      for (const attribute of node.attributes || []) {
        const name = getAttributeName(attribute);
        if (!name || !ARIA_BOOLEAN_PROPERTIES.has(name)) {
          continue;
        }
        const value = getLiteralAttributeValue(attribute);
        if (value === null) {
          continue;
        }
        if (
          name === "aria-live" &&
          !new Set(["off", "polite", "assertive"]).has(value)
        ) {
          report(
            context,
            attribute,
            ruleKey,
            `Invalid value "${value}" for ${name}.`,
          );
          continue;
        }
        if (name !== "aria-live" && !["true", "false"].includes(value)) {
          report(
            context,
            attribute,
            ruleKey,
            `Invalid value "${value}" for ${name}.`,
          );
        }
      }
    },
  }),
);

// S5254: HTML elements should have a valid language attribute
const S5254 = createSonarRule(
  "S5254",
  "HTML elements should have a valid language attribute",
  (context, ruleKey) => ({
    JSXOpeningElement(node) {
      if (getElementName(node) !== "html") {
        return;
      }
      const lang = getAttribute(node, "lang");
      if (!lang) {
        report(
          context,
          node,
          ruleKey,
          "The <html> element must declare a lang attribute.",
        );
        return;
      }
      const value = getLiteralAttributeValue(lang);
      if (value && !/^[a-z]{2,3}(-[A-Za-z]{2,4})*$/.test(value)) {
        report(
          context,
          lang,
          ruleKey,
          `"${value}" is not a valid language code.`,
        );
      }
    },
  }),
);

// S5257: HTML "<table>" should not be used for layout purposes
const S5257 = createSonarRule(
  "S5257",
  'HTML "<table>" should not be used for layout purposes',
  (context, ruleKey) => ({
    JSXOpeningElement(node) {
      if (getElementName(node) !== "table") {
        return;
      }
      const role = getLiteralAttributeValue(getAttribute(node, "role"));
      if (role === "presentation" || role === "none") {
        return;
      }
      const element = node.parent;
      if (!element || element.type !== "JSXElement") {
        return;
      }
      const hasHeaderCell = (element.children || []).some(
        (child) =>
          child.type === "JSXElement" &&
          new Set(["th", "thead", "caption"]).has(
            getElementName(child.openingElement),
          ),
      );
      if (!hasHeaderCell) {
        report(
          context,
          node,
          ruleKey,
          "This table has no header cells and may be used for layout; use CSS layout instead.",
        );
      }
    },
  }),
);

module.exports = {
  S6821,
  S6822,
  S6823,
  S6824,
  S6825,
  S6747,
  S6807,
  S6811,
  S6819,
  S6843,
  S6844,
  S6845,
  S6840,
  S6841,
  S6842,
  S6846,
  S6847,
  S6848,
  S6850,
  S6851,
  S6852,
  S6853,
  S6793,
  S5254,
  S5257,
};
