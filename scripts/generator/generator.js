import _ from 'lodash';
import {toSassVariable} from './resolver.js';
import fs from 'fs';

const srcDirectory = 'scss/variables';

const preamble = `// ******************************************************
// DO NOT MODIFY THIS FILE. THIS FILE WAS GENERATED.
// Inspired by Tailwind CSS: https://tailwindcss.com/
// ******************************************************
`;

const colorFunction = `@function color($color, $weight: 500) {
  @if not variable-exists(#{color}) {
    @error "#{color} does not exist";
  }
  @else if type-of($color) != 'map' {
    @return $color;
  }
  @else if index($color, $weight) != null {
    @error "#{weight} does not exist in #{color}";
  }
  @else {
    @return map-get($color, $weight);
  }
}
`;

function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

function generateFunction(name, data) {
  const defaultVal = () => {
    if(Object.keys(data).includes('default')) {
      return ': default';
    }
    else if(Object.keys(data).includes('normal')) {
      return ': normal';
    }
    return '';
  };

  return `@function ${name}($value${defaultVal()}) {
    @if index($${name}, $value) != null {
      @error "${data} already exists in $${name}";
    }
    @return map-get($${name}, $value);
  }`;
}

function generateColors(data) {
  let result = colorFunction;

  Object.entries(data).forEach(([k, v]) => {
    result += `${toSassVariable(k, v)}\n\n`;
  });

  return result;
}

function generateCategory(category, data) {
  if(category === 'colors') {
    return generateColors(data);
  }

  let result = '';
  Object.entries(data).forEach(([name, value]) => {
    // TODO: should we handle colors?
    if(!name.toLowerCase().includes('color')) {
      const fmtName = toKebabCase(name);
      result += generateFunction(fmtName, value);
      result += toSassVariable(fmtName, value);
      result += '\n\n';
    }
  });

  return result;
}

export function generateIndexFile(categories) {
  let indexFileData = '';
  Object.keys(categories).forEach(category => {
    indexFileData += `@import '${category}';\n`;
  });
  generateFile('index', indexFileData);
}

export function generateFile(category, data) {
  const fileName = `${srcDirectory}/_${category}.scss`;
  let writeData = preamble;
  writeData += _.isObject(data) ? generateCategory(category, data) : data;
  fs.writeFile(fileName, writeData, (err) => {
    if(err) {
      throw err;
    }
    console.log(`* ${fileName}`);
  });
}
