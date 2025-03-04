import {deleteAsync} from 'del';
import {exec, spawn} from 'child_process';
import commandLineArgs from 'command-line-args';
import ora from 'ora';
import browserSync from 'browser-sync';
import esbuild from 'esbuild';
import util from 'util';
import * as path from 'path';
import chalk from 'chalk';
import fs from 'fs/promises';
import {readFileSync} from 'fs';
import {replace} from 'esbuild-plugin-replace';
import {sassPlugin} from 'esbuild-sass-plugin';
import getPort, {portNumbers} from 'get-port';
import postCSS from 'postcss';
import autoprefixer from 'autoprefixer';
import minify from 'postcss-minify';

const postCss = postCSS([
  autoprefixer(),
  minify()
]);

const {serve} = commandLineArgs([{name: 'serve', type: Boolean}]);
const outDir = 'dist';
const siteDir = '_site';
const spinner = ora({hideCursor: false}).start();
const execPromise = util.promisify(exec);

let childProcess;
let buildResults;

const bundleDirectories = [outDir];
let packageData = JSON.parse(readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8'));
const zincVersion = JSON.stringify(packageData.version.toString());

// Runs 11ty and builds the docs. The returned promise resolves after the initial publish has completed. The child
// process and an array of strings containing any output are included in the resolved promise
async function buildTheDocs(watch = false)
{
  return new Promise(async (resolve, reject) =>
  {
    const afterSignal = '[eleventy.after]';

    // Totally non-scientific way to handle errors. Perhaps it's just better to resolve on stderr? :shrug:
    const errorSignal = 'Original error stack trace:';
    const args = ['@11ty/eleventy', '--quiet'];
    const output = [];

    if(watch)
    {
      args.push('--watch');
      //      args.push('--incremental');
    }

    const child = spawn('npx', args, {
      stdio: 'pipe',
      cwd:   'docs',
      shell: true // for Windows
    });

    child.stdout.on('data', data =>
    {
      if(data.includes(afterSignal))
      {
        return;
      } // don't log the signal
      output.push(data.toString());
    });

    child.stderr.on('data', data =>
    {
      output.push(data.toString());
    });

    if(watch)
    {
      // The process doesn't terminate in watch mode so, before resolving, we listen for a known signal in stdout that
      // tells us when the first build completes.
      child.stdout.on('data', data =>
      {
        if(data.includes(afterSignal))
        {
          resolve({child, output});
        }
      });

      child.stderr.on('data', data =>
      {
        if(data.includes(errorSignal))
        {
          // This closes the dev server, not sure if thats what we want?
          reject(output);
        }
      });
    }
    else
    {
      child.on('close', () =>
      {
        resolve({child, output});
      });
    }
  });
}

// Build the Source with esbuild
async function buildTheSource()
{
  let entryPoints = [
    //
    // NOTE: Entry points must be mapped in package.json > exports, otherwise users won't be able to import them!
    //
    // The whole shebang
    './src/zinc.ts'
    // The autoloader
    //    './src/zinc-autoloader.ts',
    // Components
    // All components except styles and tests
    //    ...(await globby('./src/components/**/!(*.test.ts)|!(*.scss)')),
    // Internal
    //    ...(await globby('./src/internal/**/!(*.test).ts')),
    // Translations
    //    ...(await globby('./src/translations/**/*.ts')),
    // Public utilities
    //    ...(await globby('./src/utilities/**/!(*.(style|test)).ts')),
    // Theme stylesheets
    //    ...(await globby('./src/themes/**/!(*.test).ts'))
  ];
  const config = {
    format:        'iife', // IIFE when not splitting
    target:        'es2017',
    legalComments: 'none',
    outfile:       `${outDir}/zn.min.js`, // While single entry point
    //    outdir:    outDir, // While multiple entry points
    entryPoints,
    define:    {
      // Floating UI requires this to be set
      'process.env.NODE_ENV': '"production"'
    },
    bundle:    true,
    splitting: false,
    minify:    true,
    plugins:   [
      sassPlugin({
        filter: /\.scss$/,
        type:   'lit-css',
        async transform(source)
        {
          try
          {
            const {css} = await postCss.process(source, {from: undefined});
            return css;
          }
          catch(err)
          {
            console.error(err);
          }
        }
      }),
      replace({
        __ZINC_VERSION__: zincVersion
      })
    ]
  };

  if(serve)
  {
    // Use the context API to allow incremental dev builds
    const contexts = await Promise.all([esbuild.context(config)]);
    await Promise.all(contexts.map(context => context.rebuild()));
    return contexts;
  }

  // Use the standard API for production builds
  return Promise.all([esbuild.build(config)]);
}

// Helper function to draw a spinner while running tasks
async function nextTask(label, action)
{
  spinner.text = label;
  spinner.start();

  try
  {
    await action();
    spinner.stop();
    console.log(`${chalk.green('✔')} ${label}`);
  }
  catch(err)
  {
    spinner.stop();
    console.error(`${chalk.red('✘')} ${err}`);
    if(err.stdout)
    {
      console.error(chalk.red(err.stdout));
    }
    if(err.stderr)
    {
      console.error(chalk.red(err.stderr));
    }
    process.exit(1);
  }
}

// Handle Cleanup
function handleCleanup()
{
  buildResults.forEach(result => result.dispose());
  if(childProcess)
  {
    childProcess.kill('SIGINT');
  }
  process.exit();
}

// Cleanup the previous build
await nextTask('Cleaning up previous build', async () =>
{
  await Promise.all([deleteAsync(siteDir), ...bundleDirectories.map(dir => deleteAsync(dir))]);
  await fs.mkdir(outDir, {recursive: true});
});

// Generate the component metadata
await nextTask('Generating component metadata', () =>
{
  return Promise.all(
    bundleDirectories.map(dir =>
    {
      return execPromise(`node scripts/make-metadata.js --outdir "${dir}"`, {stdio: 'inherit'});
    })
  );
});

// Generate the themes
await nextTask('Generating themes', () =>
{
  return execPromise(`node scripts/make-themes.js --outdir "${outDir}"`, {stdio: 'inherit'});
});

// Run typescript compiler
await nextTask('Running the TypeScript compiler', async () =>
{
  return execPromise(`tsc --project ./tsconfig.prod.json --outFile ${outDir}/zn.d.ts`, {stdio: 'inherit'});
});

// Build the source files
await nextTask('Building source files', async () =>
{
  buildResults = await buildTheSource();
});

// launch the dev server
if(serve)
{
  let result;

  // Spin up Eleventy and Wait for the search index to appear before proceeding. The search index is generated during
  // eleventy.after, so it appears after the docs are fully published. This is kinda hacky, but here we are.
  // Kick off the Eleventy dev server with --watch and --incremental
  await nextTask('Building the docs', async () =>
  {
    result = await buildTheDocs(true);
  });

  const bs = browserSync.create();
  const port = await getPort({port: portNumbers(4000, 4999)});
  const bsConfig = {
    startPath:      '/',
    port,
    logLevel:       'silent',
    logPrefix:      '[zinc]',
    logFileChanges: true,
    notify:         false,
    single:         false,
    ghostMode:      false,
    server:         {
      baseDir: siteDir,
      routes:  {
        '/dist': outDir
      }
    }
  };

  // Launch BrowserSync
  bs.init(bsConfig, () =>
  {
    const url = `http://localhost:${port}`;
    console.log(chalk.cyan(`\n🚀 Server running at ${url}`));

    // log deferred output
    if(result.output.length > 0)
    {
      console.log('\n' + result.output.join('\n'));
    }

    // Log output that comes later on
    result.child.stdout.on('data', data =>
    {
      console.log(data.toString());
    });
  });

  // Rebuild and reload then source files change
  bs.watch('src/**/!(*.test).*').on('change', async filename =>
  {
    console.log('[build] File Changed: ', filename);

    try
    {
      // Rebuild the source
      const rebuildResults = buildResults.map(result => result.rebuild());
      await Promise.all(rebuildResults);

      // rebuild the metadata (but not when styles are changed)
      const isStylesheet = /(\.css|\.styles\.ts)$/.test(filename);
      if(!isStylesheet)
      {
        await Promise.all(
          bundleDirectories.map(dir =>
          {
            return execPromise(`node scripts/make-metadata.js --outdir "${dir}"`, {stdio: 'inherit'});
          })
        );
      }

      bs.reload();
    }
    catch(err)
    {
      console.log(chalk.red(err));
    }
  });

  // Rebuild theme files when they change
  bs.watch('scss/**/*.scss').on('change', async filename =>
  {
    console.log('[build] File Changed: ', filename);

    try
    {
      // Rebuild the themes
      await execPromise(`node scripts/make-themes.js --outdir "${outDir}"`, {stdio: 'inherit'});
      bs.reload();
    }
    catch(err)
    {
      console.log(chalk.red(err));
    }
  });

  // Reload without rebuilding when docs change
  bs.watch([`${siteDir}/**/*.*`]).on('change', () =>
  {
    bs.reload();
  });

}

// Build for production
if(!serve)
{
  let result;

  await nextTask('Building the docs', async () =>
  {
    result = await buildTheDocs();
  });

  // Log deferred output
  if(result.output.length > 0)
  {
    console.log('\n' + result.output.join('\n'));
  }
}

process.on('SIGINT', handleCleanup);
process.on('SIGTERM', handleCleanup);


