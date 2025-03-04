export default function (plop)
{
  plop.setHelper('tagWithoutPrefix', tag => tag.replace(/^zn-/, ''));

  plop.setHelper('tagToTitle', tag =>
  {
    const withoutPrefix = plop.getHelper('tagWithoutPrefix');
    const titleCase = plop.getHelper('titleCase');
    return titleCase(withoutPrefix(tag).replace(/-/g, ' '));
  });

  plop.setGenerator('component', {
    description: 'Generate a new Component',
    prompts: [{
        type: 'input',
        name: 'tag',
        message: 'Tag Name (e.g. zn-button)',
        validate: value => {
          // start with zn- and only contain lowercase letters, dashes and pluses
          if(!/^zn-[a-z-+]+/.test(value))
          {
           return false;
          }

          // No double dashes or trailing dash
          return !(value.includes('--') || value.endsWith('-'));
        }
      }],
    actions: [
      {
        type: 'add',
        path: '../../src/components/{{tagWithoutPrefix tag}}/index.ts',
        templateFile: 'templates/define.hbs'
      },
      {
        type: 'add',
        path: '../../src/components/{{tagWithoutPrefix tag}}/{{tagWithoutPrefix tag}}.scss',
        templateFile: 'templates/style.hbs'
      },
      {
        type: 'add',
        path: '../../src/components/{{tagWithoutPrefix tag}}/{{tagWithoutPrefix tag}}.component.ts',
        templateFile: 'templates/component.hbs'
      },
      {
        type: 'add',
        path: '../../src/components/{{tagWithoutPrefix tag}}/{{tagWithoutPrefix tag}}.test.ts',
        templateFile: 'templates/test.hbs'
      },
      {
        type: 'add',
        path: '../../docs/pages/components/{{tagWithoutPrefix tag}}.md',
        templateFile: 'templates/docs.hbs'
      },
      {
        type: 'modify',
        path: '../../src/zinc.ts',
        pattern: /\/\* plop:component \*\//,
        template: `export { default as {{tagToTitle tag}} } from './components/{{tagWithoutPrefix tag}}';\n/* plop:component */`
      }
    ]
  });
}
