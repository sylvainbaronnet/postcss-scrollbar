'use strict';

var postcss = require('postcss');
var selectorParser = require('postcss-selector-parser');
var valueParser = require('postcss-value-parser');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var postcss__default = /*#__PURE__*/_interopDefaultLegacy(postcss);
var selectorParser__default = /*#__PURE__*/_interopDefaultLegacy(selectorParser);
var valueParser__default = /*#__PURE__*/_interopDefaultLegacy(valueParser);

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);

    if (enumerableOnly) {
      symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
    }

    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

const defaults = {
  edgeAutohide: false
};
const widthMap = {
  auto: 'initial',
  thin: '7px',
  none: '0'
};
const colorMap = {
  auto: 'initial',
  dark: 'initial',
  light: 'initial'
};
var index = ((options = defaults) => (css, result) => {
  css.walkDecls(/^scrollbar/, decl => {
    if (decl.prop === 'scrollbar-width') {
      return processWidth(decl);
    }

    if (decl.prop === 'scrollbar-color') {
      return processColor(decl);
    }
  });

  function processWidth(decl) {
    let {
      parent,
      value: keyword
    } = decl;
    let root = parent.parent;

    if (!isValidWidth(keyword)) {
      return decl.warn(result, 'Invalid value for property `scrollbar-width`. ' + 'Must be one of `auto | thin | none`.', {
        word: keyword
      });
    }

    let processor = selectorParser__default["default"](selectors => {
      selectors.each(selector => {
        selector.append(selectorParser__default["default"].pseudo({
          value: '::-webkit-scrollbar'
        }));
      });
    });
    let newRule = postcss__default["default"].rule({
      selector: processor.processSync(parent.selector)
    });
    newRule.append(postcss__default["default"].decl({
      prop: 'width',
      value: widthMap[keyword]
    }), postcss__default["default"].decl({
      prop: 'height',
      value: widthMap[keyword]
    }));
    root.insertBefore(parent, newRule);
    let value = options.edgeAutohide ? '-ms-autohiding-scrollbar' : keyword === 'none' ? 'none' : 'auto';
    parent.insertBefore(decl, {
      prop: '-ms-overflow-style',
      value
    });
  }

  function processColor(decl) {
    let {
      nodes
    } = valueParser__default["default"](decl.value);

    if (isInvalidColor(nodes)) {
      return decl.warn(result, 'Invalid value for property `scrollbar-color`. ' + 'Must be one of `auto | dark | light | <color> <color>`.', {
        word: nodes[0].value
      });
    }

    let values = nodes.filter(value => value.type === 'word').reduce((acc, curr, idx) => {
      if (idx >= 1) {
        return _objectSpread2(_objectSpread2({}, acc), {}, {
          track: colorMap[curr.value] || curr.value,
          corner: colorMap[curr.value] || curr.value
        });
      }

      return {
        thumb: colorMap[curr.value] || curr.value,
        track: colorMap[curr.value] || curr.value,
        corner: colorMap[curr.value] || curr.value
      };
    }, {});
    let {
      parent
    } = decl;
    let root = parent.parent;
    Object.keys(values).forEach(pseudo => {
      let processor = selectorParser__default["default"](selectors => {
        selectors.each(selector => {
          selector.append(selectorParser__default["default"].pseudo({
            value: `::-webkit-scrollbar-${pseudo}`
          }));
        });
      });
      let newRule = postcss__default["default"].rule({
        selector: processor.processSync(parent.selector)
      }).append(postcss__default["default"].decl({
        prop: 'background-color',
        value: values[pseudo]
      }));
      root.insertBefore(parent, newRule);
    });
  }
});

function isValidWidth(keyword) {
  return /auto|thin|none/.test(keyword);
}

function isInvalidColor(nodes) {
  return Array.isArray(nodes) && nodes.length === 1 && !/auto|dark|light/.test(nodes[0].value);
}

module.exports.postcss = true;

module.exports = index;
