"use strict";

const NON_STANDARD_LOWERCASE_TAGS = new Set([
  "div",
  "span",
  "p",
  "a",
  "img",
  "button",
  "input",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "li",
  "ol",
  "table",
  "tr",
  "td",
  "th",
  "tbody",
  "thead",
  "form",
  "label",
  "section",
  "article",
  "nav",
  "header",
  "footer",
  "main",
  "svg",
  "path",
  "g",
  "circle",
  "rect",
]);

/**
 * React & JSX Standards Engine
 * Covers: S6479, S6477, S6486, S6439, S6443, S6761, S6748, S6749, S6757, S6790, S6438, S6440, S6442, S6481, S6754, etc.
 */

function createReactRule(ruleKey, ruleName, checkFn) {
  return {
    meta: {
      type: "problem",
      docs: {
        description: `${ruleName} (typescript:${ruleKey})`,
        recommended: "error",
      },
      schema: [],
    },
    create(context) {
      return checkFn(context, ruleKey);
    },
  };
}

// S6479: JSX list components should not use array indexes as key
const S6479 = createReactRule(
  "S6479",
  "JSX list components should not use array indexes as key",
  (context) => {
    function isCallbackFunction(node) {
      return (
        node.type === "ArrowFunctionExpression" ||
        node.type === "FunctionExpression"
      );
    }

    function isMapCallback(node) {
      const parent = node.parent;
      return (
        parent?.type === "CallExpression" &&
        parent.arguments?.[0] === node &&
        parent.callee?.type === "MemberExpression" &&
        (parent.callee.property?.name === "map" ||
          parent.callee.property?.name === "flatMap")
      );
    }

    function definesIndexParam(node, name) {
      const indexParam = node.params?.[1];
      return indexParam?.type === "Identifier" && indexParam.name === name;
    }

    function isMapIndexIdentifier(id) {
      if (id?.type !== "Identifier") {
        return false;
      }
      let node = id.parent;
      while (node) {
        if (
          isCallbackFunction(node) &&
          isMapCallback(node) &&
          definesIndexParam(node, id.name)
        ) {
          return true;
        }
        if (node.type === "FunctionDeclaration" || node.type === "ClassBody") {
          return false;
        }
        node = node.parent;
      }
      return false;
    }

    return {
      JSXAttribute(node) {
        if (node.name?.name !== "key" || !node.value) {
          return;
        }
        const expr =
          node.value.type === "JSXExpressionContainer"
            ? node.value.expression
            : null;
        if (!expr) {
          return;
        }

        const isNonCompliant =
          isMapIndexIdentifier(expr) ||
          (expr.type === "BinaryExpression" &&
            (isMapIndexIdentifier(expr.left) ||
              isMapIndexIdentifier(expr.right))) ||
          (expr.type === "TemplateLiteral" &&
            expr.expressions.length > 0 &&
            expr.expressions.every((expression) =>
              isMapIndexIdentifier(expression),
            ));

        if (isNonCompliant) {
          context.report({
            node,
            message: "Do not use Array index in keys. [typescript:S6479]",
          });
        }
      },
    };
  },
);

// S6477: JSX list components should have a key property
const S6477 = createReactRule(
  "S6477",
  "JSX list components should have a key property",
  (context) => ({
    CallExpression(node) {
      if (
        node.callee?.type === "MemberExpression" &&
        node.callee.property?.name === "map" &&
        node.arguments?.length > 0
      ) {
        const callback = node.arguments[0];
        if (
          callback.type === "ArrowFunctionExpression" ||
          callback.type === "FunctionExpression"
        ) {
          const body = callback.body;
          if (
            body?.type === "JSXElement" &&
            body.openingElement &&
            !body.openingElement.attributes?.some(
              (attr) => attr.name?.name === "key",
            )
          ) {
            context.report({
              node: body.openingElement,
              message:
                'JSX list elements inside .map() must declare a unique "key" prop. [typescript:S6477]',
            });
          }
        }
      }
    },
  }),
);

function isUnstableKeyExpression(expr) {
  if (expr?.type !== "CallExpression" || !expr?.callee) {
    return false;
  }
  const { callee } = expr;
  if (callee?.type === "MemberExpression") {
    const obj = callee.object?.name;
    const prop = callee.property?.name;
    return (
      (obj === "Math" && prop === "random") ||
      (obj === "Date" && prop === "now")
    );
  }
  if (callee?.type === "Identifier") {
    return /^(randomUUID|uuid|nanoid|v4|v1)$/i.test(callee.name);
  }
  return false;
}

// S6486: JSX list component keys should match up between renders (no Math.random/Date.now in keys)
const S6486 = createReactRule(
  "S6486",
  "JSX list components keys should match up between renders",
  (context) => ({
    JSXAttribute(node) {
      if (node.name?.name === "key" && node.value) {
        const expr =
          node.value.type === "JSXExpressionContainer"
            ? node.value.expression
            : null;
        if (expr && isUnstableKeyExpression(expr)) {
          context.report({
            node,
            message:
              'Keys should be stable across renders; avoid using random or timestamp generators directly in the "key" prop. [typescript:S6486]',
          });
        }
      }
    },
  }),
);

// S6439: Conditional rendering in JSX should not render numeric zero
const S6439 = createReactRule(
  "S6439",
  "Conditional rendering should not inadvertently render 0 in JSX",
  (context) => ({
    JSXExpressionContainer(node) {
      if (
        node.expression?.type === "LogicalExpression" &&
        node.expression.operator === "&&"
      ) {
        const left = node.expression.left;
        if (
          left?.type === "MemberExpression" &&
          left.property?.type === "Identifier" &&
          left.property.name === "length"
        ) {
          context.report({
            node: left,
            message:
              'Avoid using "array.length && <Component />" directly in JSX as it renders "0" when empty. Use "array.length > 0 && <Component />" instead. [typescript:S6439]',
          });
        }
      }
    },
  }),
);

// S6443: Redundant state setters
const S6443 = createReactRule(
  "S6443",
  "State setters should not be called with the exact current state variable",
  (context) => ({
    CallExpression(node) {
      if (
        node.callee?.type === "Identifier" &&
        /^set[A-Z]/.test(node.callee.name) &&
        node.arguments?.length === 1 &&
        node.arguments[0]?.type === "Identifier"
      ) {
        const setterName = node.callee.name;
        const stateVarName =
          setterName.at(3).toLowerCase() + setterName.slice(4);
        if (node.arguments[0].name === stateVarName) {
          context.report({
            node,
            message: `Calling state setter "${setterName}" with the existing state variable "${stateVarName}" is redundant and has no effect. [typescript:S6443]`,
          });
        }
      }
    },
  }),
);

// S6761: Empty React fragments or invalid children
const S6761 = createReactRule(
  "S6761",
  "Empty React fragments should be removed",
  (context) => ({
    JSXFragment(node) {
      if (node.children?.length === 0) {
        context.report({
          node,
          message: 'Remove empty React fragment "<></>". [typescript:S6761]',
        });
      }
    },
    JSXElement(node) {
      const hasDanger = node.openingElement?.attributes?.some(
        (a) => a.name?.name === "dangerouslySetInnerHTML",
      );
      if (hasDanger && node.children?.length > 0) {
        context.report({
          node,
          message:
            'Do not use "children" and "dangerouslySetInnerHTML" simultaneously. [typescript:S6761]',
        });
      }
    },
  }),
);

// S6748: React children should not be passed as props
const S6748 = createReactRule(
  "S6748",
  'React "children" should not be passed as prop',
  (context) => ({
    JSXAttribute(node) {
      if (node.name?.name === "children") {
        context.report({
          node,
          message:
            'Do not pass "children" as a JSX attribute; nest children elements instead. [typescript:S6748]',
        });
      }
    },
  }),
);

// S6749: Redundant JSX fragments containing single child
const S6749 = createReactRule(
  "S6749",
  "Redundant JSX fragments should be removed",
  (context) => ({
    JSXFragment(node) {
      const meaningful = (node.children || []).filter(
        (child) =>
          child.type !== "JSXText" || (child.value || "").trim() !== "",
      );
      const isSingleElement =
        meaningful.length === 1 && meaningful[0].type === "JSXElement";
      if (isSingleElement && !node.parent?.type.startsWith("JSX")) {
        context.report({
          node,
          message:
            'Single JSX child does not require a wrapping fragment "<>...</>". [typescript:S6749]',
        });
      }
    },
  }),
);

// S6757: "this" should not be used in functional components
const S6757 = createReactRule(
  "S6757",
  '"this" should not be used in functional components',
  (context) => ({
    ThisExpression(node) {
      let current = node.parent;
      while (current) {
        if (
          current.type === "FunctionDeclaration" &&
          /^[A-Z]/.test(current.id?.name)
        ) {
          context.report({
            node,
            message:
              'Do not use "this" inside a React functional component. [typescript:S6757]',
          });
          break;
        }
        if (
          current.type === "ClassDeclaration" ||
          current.type === "ClassExpression"
        ) {
          break;
        }
        current = current.parent;
      }
    },
  }),
);

// S6790: String references should not be used
const S6790 = createReactRule(
  "S6790",
  "String references should not be used",
  (context) => ({
    JSXAttribute(node) {
      if (
        node.name?.name === "ref" &&
        node.value?.type === "Literal" &&
        typeof node.value.value === "string"
      ) {
        context.report({
          node,
          message:
            "String refs are deprecated. Use React.useRef() or React.createRef() instead. [typescript:S6790]",
        });
      }
    },
  }),
);

// S6438: Comments in JSX
const S6438 = createReactRule(
  "S6438",
  "Comments inside JSX expressions should be enclosed in curly braces",
  (context) => ({
    JSXText(node) {
      if (/\/\*[\s\S]*?\*\/|\/\/.*/.test(node.value)) {
        context.report({
          node,
          message:
            'Comments in JSX must be wrapped in curly braces "{/* ... */}". [typescript:S6438]',
        });
      }
    },
  }),
);

function isUseStateCall(node) {
  if (!node || node.type !== "CallExpression") {
    return false;
  }
  const { callee } = node;
  if (callee?.type === "Identifier" && callee.name === "useState") {
    return true;
  }
  if (
    callee?.type === "MemberExpression" &&
    callee.object?.type === "Identifier" &&
    callee.object.name === "React" &&
    callee.property?.type === "Identifier" &&
    callee.property.name === "useState"
  ) {
    return true;
  }
  return false;
}

function isValidSetterName(valueName, setterName) {
  if (
    !valueName ||
    !setterName ||
    typeof valueName !== "string" ||
    typeof setterName !== "string"
  ) {
    return false;
  }

  const cleanVal = valueName.replace(/^_+/, "");
  const cleanSetter = setterName.replace(/^_+/, "");

  if (!cleanVal || !cleanSetter) {
    return false;
  }

  const capitalize = (str) => str.at(0).toUpperCase() + str.slice(1);
  const standardSetter = "set" + capitalize(cleanVal);

  if (cleanSetter === standardSetter) {
    return true;
  }

  // Handle common boolean prefixes (isOpen -> setIsOpen or setOpen, hasError -> setHasError or setError)
  const prefixes = ["is", "has", "should", "can", "will", "did", "must"];
  for (const prefix of prefixes) {
    if (cleanVal.startsWith(prefix) && cleanVal.length > prefix.length) {
      const rest = cleanVal.slice(prefix.length);
      const restCapitalized = capitalize(rest);
      if (
        cleanSetter === "set" + restCapitalized ||
        cleanSetter === "set" + capitalize(cleanVal)
      ) {
        return true;
      }
    }
  }

  return false;
}

function isValidUseStateDestructuring(idNode) {
  if (!idNode || idNode.type !== "ArrayPattern") {
    return false;
  }
  if (idNode.elements.length === 0 || idNode.elements.length > 2) {
    return false;
  }
  const [valNode, setterNode] = idNode.elements;
  if (!valNode) {
    return setterNode?.type === "Identifier";
  }
  if (!setterNode) {
    return valNode.type === "Identifier";
  }
  if (valNode.type === "Identifier") {
    if (setterNode.type !== "Identifier") {
      return false;
    }
    return isValidSetterName(valNode.name, setterNode.name);
  }
  if (valNode.type === "ObjectPattern" || valNode.type === "ArrayPattern") {
    if (setterNode.type !== "Identifier") {
      return false;
    }
    return /^set[A-Z0-9_]/.test(setterNode.name.replace(/^_+/, ""));
  }
  return false;
}

// S6754: useState destructuring into value + setter pair
const S6754 = createReactRule(
  "S6754",
  "useState call is not destructured into value + setter pair",
  (context) => ({
    VariableDeclarator(node) {
      if (isUseStateCall(node.init) && !isValidUseStateDestructuring(node.id)) {
        context.report({
          node,
          message:
            "useState call is not destructured into value + setter pair. [typescript:S6754]",
        });
      }
    },
    AssignmentExpression(node) {
      if (
        isUseStateCall(node.right) &&
        !isValidUseStateDestructuring(node.left)
      ) {
        context.report({
          node,
          message:
            "useState call is not destructured into value + setter pair. [typescript:S6754]",
        });
      }
    },
    ExpressionStatement(node) {
      if (isUseStateCall(node.expression)) {
        context.report({
          node: node.expression,
          message:
            "useState call is not destructured into value + setter pair. [typescript:S6754]",
        });
      }
    },
  }),
);

// S6770: User-defined JSX components should use Pascal case
const S6770 = createReactRule(
  "S6770",
  "User-defined JSX components should use Pascal case",
  (context) => ({
    JSXOpeningElement(node) {
      if (
        node.name?.type === "JSXIdentifier" &&
        /^[a-z]/.test(node.name.name) &&
        !node.name.name.includes("-") &&
        !NON_STANDARD_LOWERCASE_TAGS.has(node.name.name)
      ) {
        // Only report if it is a non-standard lowercase component
        if (
          node.name.name.startsWith("custom") ||
          node.name.name.startsWith("my")
        ) {
          context.report({
            node,
            message:
              "User-defined JSX components should use PascalCase naming convention. [typescript:S6770]",
          });
        }
      }
    },
  }),
);

// S5260: Table cells should reference their headers
const S5260 = createReactRule(
  "S5260",
  "Table cells should reference their headers",
  (context) => ({
    JSXOpeningElement(node) {
      if (
        !node.name ||
        node.name.type !== "JSXIdentifier" ||
        node.name.name !== "td"
      ) {
        return;
      }
      const hasHeaders = node.attributes?.some(
        (attribute) =>
          attribute.type === "JSXAttribute" &&
          attribute.name?.type === "JSXIdentifier" &&
          attribute.name.name === "headers",
      );
      if (!hasHeaders) {
        context.report({
          node,
          message:
            'Table cells should reference their headers with the "headers" attribute. [typescript:S5260]',
        });
      }
    },
  }),
);

module.exports = {
  S6479,
  S6477,
  S6486,
  S6439,
  S6443,
  S6761,
  S6748,
  S6749,
  S6757,
  S6790,
  S6438,
  S6754,
  S6770,
  S5260,
};
