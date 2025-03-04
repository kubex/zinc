import {removeViteLogging, vitePlugin} from '@remcovaes/web-test-runner-vite-plugin';
import {playwrightLauncher} from '@web/test-runner-playwright';
import {globbySync} from 'globby';

export default {
  rootDir: '.',
  files: 'src/**/*.test.ts',
  concurrentBrowsers: 3,
  plugins: [
    vitePlugin()
  ],
  filterBrowserLogs: removeViteLogging,
  browsers: [
    playwrightLauncher({product: 'chromium'}),
    playwrightLauncher({product: 'webkit'})
  ],
  testRunnerHtml: testFramework => `
    <!doctype html>
    <html lang="en">
      <head>
        <script type="module" src="${testFramework}"></script>
        <script type="module">
          window.process = {env: {NODE_ENV: 'production'}}
         
          /* Hack to disable Lit dev mode warnings */
          const systemWarn = window.console.warn;
          window.console.warn = (...args) => {
              if (args[0].indexOf('Lit is in dev mode.') === 0) {
                  return;
              }
              if (args[0].indexOf('Multiple versions of Lit loaded.') === 0) {
                  return;
              }
              systemWarn(...args);
          };  
        </script>
      </head>
      <body>
      </body>
    </html>
  `,
  groups: globbySync('src/**/*.test.ts').map(path =>
  {
    const groupName = path.match(/^.*\/(?<fileName>.*)\.test\.ts/).groups.fileName;
    return {
      name: groupName,
      files: path
    };
  })
};
