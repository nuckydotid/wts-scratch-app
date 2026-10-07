"use strict";

const { createSonarRule } = require("../utils/rule-helpers");

/**
 * Angular-specific rules (Sonar way, TypeScript). These are dormant for React
 * Native code but are enforced whenever Angular-style code appears.
 */

const ANGULAR_DECORATORS = new Set(["Component", "Directive", "Pipe"]);
const OUTPUT_DECORATOR = "Output";
const INPUT_DECORATOR = "Input";

const DOM_EVENTS = new Set([
  "click",
  "dblclick",
  "change",
  "input",
  "focus",
  "blur",
  "submit",
  "reset",
  "keydown",
  "keyup",
  "keypress",
  "mousedown",
  "mouseup",
  "mouseover",
  "mouseout",
  "mousemove",
  "contextmenu",
  "scroll",
  "wheel",
  "drag",
  "drop",
  "touchstart",
  "touchend",
  "touchmove",
]);

const LIFECYCLE_INTERFACES = {
  ngOnChanges: "OnChanges",
  ngOnInit: "OnInit",
  ngDoCheck: "DoCheck",
  ngAfterContentInit: "AfterContentInit",
  ngAfterContentChecked: "AfterContentChecked",
  ngAfterViewInit: "AfterViewInit",
  ngAfterViewChecked: "AfterViewChecked",
  ngOnDestroy: "OnDestroy",
};

function getDecorators(node) {
  return node.decorators || [];
}

function getDecoratorName(decorator) {
  const expression = decorator.expression;
  const callee =
    expression.type === "CallExpression" ? expression.callee : expression;
  if (callee.type === "Identifier") {
    return callee.name;
  }
  if (
    callee.type === "MemberExpression" &&
    !callee.computed &&
    callee.property.type === "Identifier"
  ) {
    return callee.property.name;
  }
  return null;
}

function getDecoratorCall(decorator) {
  const expression = decorator.expression;
  return expression.type === "CallExpression" ? expression : null;
}

function findDecorator(node, names) {
  for (const decorator of getDecorators(node)) {
    const name = getDecoratorName(decorator);
    if (name && names.has(name)) {
      return { decorator, name };
    }
  }
  return null;
}

function getPropertyName(node) {
  if (!node || !node.key) {
    return null;
  }
  if (node.key.type === "Identifier") {
    return node.key.name;
  }
  if (node.key.type === "Literal") {
    return String(node.key.value);
  }
  return null;
}

function getDecoratorOptions(decorator) {
  const call = getDecoratorCall(decorator);
  if (!call) {
    return null;
  }
  const options = call.arguments.find(
    (argument) => argument.type === "ObjectExpression",
  );
  return options || null;
}

function getObjectProperty(objectExpression, name) {
  if (!objectExpression) {
    return null;
  }
  return (
    objectExpression.properties.find(
      (property) =>
        property.type === "Property" && getPropertyName(property) === name,
    ) || null
  );
}

function getLifecycleMethods(node) {
  if (!node.body || !node.body.body) {
    return [];
  }
  return node.body.body.filter(
    (member) =>
      member.type === "MethodDefinition" &&
      member.key &&
      member.key.type === "Identifier" &&
      Object.prototype.hasOwnProperty.call(
        LIFECYCLE_INTERFACES,
        member.key.name,
      ),
  );
}

function isEmptyBody(context, body) {
  if (!body || body.type !== "BlockStatement" || body.body.length > 0) {
    return false;
  }
  return context.sourceCode.getCommentsInside(body).length === 0;
}

// S7648: Components, Directives, and Pipes should use standalone architecture
const S7648 = createSonarRule(
  "S7648",
  "Components, Directives, and Pipes should use standalone architecture",
  (context, ruleKey) => ({
    ClassDeclaration(node) {
      const angular = findDecorator(node, ANGULAR_DECORATORS);
      if (!angular) {
        return;
      }
      const options = getDecoratorOptions(angular.decorator);
      const standalone = options
        ? getObjectProperty(options, "standalone")
        : null;
      const isStandalone =
        standalone &&
        standalone.value.type === "Literal" &&
        standalone.value.value === true;
      if (!isStandalone) {
        context.report({
          node: angular.decorator,
          message:
            'Set "standalone: true" to use the standalone architecture. [typescript:' +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S7649: Input bindings should not be aliased
const S7649 = createSonarRule(
  "S7649",
  "Input bindings should not be aliased",
  (context, ruleKey) => ({
    Decorator(node) {
      if (getDecoratorName(node) !== INPUT_DECORATOR) {
        return;
      }
      const call = getDecoratorCall(node);
      if (call && call.arguments.length > 0) {
        context.report({
          node: call,
          message:
            "Do not alias an Input binding; use the property name directly. [typescript:" +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S7653: Output bindings should not be aliased
const S7653 = createSonarRule(
  "S7653",
  "Output bindings should not be aliased",
  (context, ruleKey) => ({
    Decorator(node) {
      if (getDecoratorName(node) !== OUTPUT_DECORATOR) {
        return;
      }
      const call = getDecoratorCall(node);
      if (call && call.arguments.length > 0) {
        context.report({
          node: call,
          message:
            "Do not alias an Output binding; use the property name directly. [typescript:" +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S7650: Components and directives should not use the "inputs" metadata property
const S7650 = createSonarRule(
  "S7650",
  'Components and directives should not use the "inputs" metadata property',
  (context, ruleKey) => ({
    ClassDeclaration(node) {
      const angular = findDecorator(node, new Set(["Component", "Directive"]));
      if (!angular) {
        return;
      }
      const inputs = getObjectProperty(
        getDecoratorOptions(angular.decorator),
        "inputs",
      );
      if (inputs) {
        context.report({
          node: inputs,
          message:
            'Use the @Input() decorator instead of the "inputs" metadata property. [typescript:' +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S7654: The "outputs" metadata property should not be used
const S7654 = createSonarRule(
  "S7654",
  'The "outputs" metadata property should not be used in Angular components and directives',
  (context, ruleKey) => ({
    ClassDeclaration(node) {
      const angular = findDecorator(node, new Set(["Component", "Directive"]));
      if (!angular) {
        return;
      }
      const outputs = getObjectProperty(
        getDecoratorOptions(angular.decorator),
        "outputs",
      );
      if (outputs) {
        context.report({
          node: outputs,
          message:
            'Use the @Output() decorator instead of the "outputs" metadata property. [typescript:' +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S7651: Output bindings should not be named as standard DOM events
const S7651 = createSonarRule(
  "S7651",
  "Output bindings should not be named as standard DOM events",
  (context, ruleKey) => ({
    PropertyDefinition(node) {
      const outputDecorator = getDecorators(node).find(
        (decorator) => getDecoratorName(decorator) === OUTPUT_DECORATOR,
      );
      if (!outputDecorator) {
        return;
      }
      const name = getPropertyName(node);
      if (name && DOM_EVENTS.has(name)) {
        context.report({
          node: node.key,
          message: `Do not name an @Output() after the DOM event "${name}". [typescript:${ruleKey}]`,
        });
      }
    },
  }),
);

// S7652: Output bindings should not be named "on" or prefixed with "on"
const S7652 = createSonarRule(
  "S7652",
  'Output bindings should not be named "on" or prefixed with "on"',
  (context, ruleKey) => ({
    PropertyDefinition(node) {
      const outputDecorator = getDecorators(node).find(
        (decorator) => getDecoratorName(decorator) === OUTPUT_DECORATOR,
      );
      if (!outputDecorator) {
        return;
      }
      const name = getPropertyName(node);
      if (name && (name === "on" || /^on[A-Z]/.test(name))) {
        context.report({
          node: node.key,
          message: `Rename the @Output() "${name}" without the "on" prefix. [typescript:${ruleKey}]`,
        });
      }
    },
  }),
);

// S7655: Angular classes should implement lifecycle interfaces for their lifecycle methods
const S7655 = createSonarRule(
  "S7655",
  "Angular classes should implement lifecycle interfaces for their lifecycle methods",
  (context, ruleKey) => ({
    ClassDeclaration(node) {
      const angular = findDecorator(node, ANGULAR_DECORATORS);
      if (!angular) {
        return;
      }
      const implemented = new Set(
        (node.implements || [])
          .map((entry) =>
            entry.expression && entry.expression.type === "Identifier"
              ? entry.expression.name
              : null,
          )
          .filter(Boolean),
      );
      for (const method of getLifecycleMethods(node)) {
        const interfaceName = LIFECYCLE_INTERFACES[method.key.name];
        if (!implemented.has(interfaceName)) {
          context.report({
            node: method.key,
            message: `Implement the "${interfaceName}" interface for "${method.key.name}". [typescript:${ruleKey}]`,
          });
        }
      }
    },
  }),
);

// S7656: Angular Pipes should implement PipeTransform interface
const S7656 = createSonarRule(
  "S7656",
  "Angular Pipes should implement PipeTransform interface",
  (context, ruleKey) => ({
    ClassDeclaration(node) {
      if (!findDecorator(node, new Set(["Pipe"]))) {
        return;
      }
      const implementsTransform =
        (node.implements || []).some(
          (entry) =>
            entry.expression &&
            entry.expression.type === "Identifier" &&
            entry.expression.name === "PipeTransform",
        ) ||
        (node.body.body || []).some(
          (member) =>
            member.type === "MethodDefinition" &&
            member.key &&
            member.key.type === "Identifier" &&
            member.key.name === "transform",
        );
      if (!implementsTransform) {
        context.report({
          node,
          message: `Angular Pipes should implement "PipeTransform". [typescript:${ruleKey}]`,
        });
      }
    },
  }),
);

// S7641: Angular lifecycle methods should be used in the correct context
const COMPONENT_ONLY_LIFECYCLE = [
  "ngOnChanges",
  "ngOnInit",
  "ngDoCheck",
  "ngAfterContentInit",
  "ngAfterContentChecked",
  "ngAfterViewInit",
  "ngAfterViewChecked",
];

const S7641 = createSonarRule(
  "S7641",
  "Angular lifecycle methods should be used in the correct context",
  (context, ruleKey) => ({
    ClassDeclaration(node) {
      if (findDecorator(node, ANGULAR_DECORATORS)) {
        return;
      }
      for (const member of node.body.body || []) {
        const name = getPropertyName(member);
        if (
          member.type === "MethodDefinition" &&
          name &&
          COMPONENT_ONLY_LIFECYCLE.includes(name)
        ) {
          context.report({
            node: member.key,
            message: `"${name}" is only invoked on Angular components, directives or pipes. [typescript:${ruleKey}]`,
          });
        }
      }
    },
  }),
);

// S7647: Empty Angular lifecycle methods should be removed
const S7647 = createSonarRule(
  "S7647",
  "Empty Angular lifecycle methods should be removed",
  (context, ruleKey) => ({
    ClassDeclaration(node) {
      if (!findDecorator(node, ANGULAR_DECORATORS)) {
        return;
      }
      for (const method of getLifecycleMethods(node)) {
        if (isEmptyBody(context, method.value && method.value.body)) {
          context.report({
            node: method.key,
            message: `Remove the empty lifecycle method "${method.key.name}". [typescript:${ruleKey}]`,
          });
        }
      }
    },
  }),
);

module.exports = {
  S7648,
  S7649,
  S7653,
  S7650,
  S7654,
  S7651,
  S7652,
  S7655,
  S7656,
  S7641,
  S7647,
};
