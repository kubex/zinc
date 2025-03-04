import _ from 'lodash';

function resolveFunction(name, value) {
  // first convert the function to a string and et everything after the =>
  const fnString = value.toString();
  let objString = fnString.substring(fnString.indexOf('=>') + 3).trim();

  // filter out the trailing parens/curly braces
  if(objString[0] === '{' && objString[objString.length - 1] === '}') {
    objString = objString.substring(1, objString.length - 1);
    if(objString[0] === '{') {
      objString = objString.substring(1);
    }

    if(objString[objString.length - 1] === '}') {
      objString = objString.substring(0, objString.length - 1);
    }

    if(objString[objString.length - 1] === ',') {
      objString = objString.substring(0, objString.length - 1);
    }
  }

  // now we convert this string into an array of key,value pairs
  objString = objString
    .replace(/\s+/g, '')
    .replace(/\.\.\..*'\),?/gm, '')
    .split(/,(?=(?:(?:[^']*'){2})*[^']*$)/)
    .filter((s) => !_.isEmpty(s));

  let objectToProcess = {};

  // No go through the list of strings and convert them into and object one by one.
  objString.forEach(s => {
    let [k, v] = s.split(':');
    if(k && v) {
      const removeQuotes = /["']/g;
      k = k.replace(removeQuotes, '');
      v = v.replace(removeQuotes, '');
      objectToProcess = {
        ...objectToProcess,
        [k]: v
      };
    }
  });
}

function resolveObject(name, obj) {
  let res = `$${name}: (\n`;

  console.log(obj);

  Object.entries(obj).forEach(([k, v], idx) => {

    // handle nested objects
    if(_.isObject(v)) {
      res += `${resolveObject(k, v)}\n`;
      return;
    }

    const val = v.includes(', ') || _.isArray(v) ? `(${v})` : v;
    const key = k.includes('/') ? `"${k}"` : k;
    res += `  ${key}: ${val},\n\n`;
  });

  return res + ');';
}

function resolveArray(name, lst) {
  return `$${name}: (${lst.join(', ')});`;
}

export function toSassVariable(name, value) {
  if(_.isFunction(value)) {
    return resolveFunction(name, value);
  }
  else if(_.isObject(value)) {
    return resolveObject(name, value);
  }
  else if(_.isArray(value)) {
    return resolveArray(name, value);
  }
  else {
    return `$${name}: ${value};`;
  }
}
