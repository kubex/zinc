// for each icon get the names and print a file
import fs from 'fs';
import path from 'path';
import icons from './icons.json' assert {type: 'json'};

const __dirname = import.meta.dirname;

const outputDir = path.join(__dirname, 'php');

if(!fs.existsSync(outputDir))
{
  fs.mkdirSync(outputDir);
}

function convertNumberCaseToUnderscore(text)
{
  const numberWords = {
    '1': 'ONE',
    '2': 'TWO',
    '3': 'THREE',
    '4': 'FOUR',
    '5': 'FIVE',
    '6': 'SIX',
    '7': 'SEVEN',
    '8': 'EIGHT',
    '9': 'NINE',
    '0': 'ZERO'
  };

  let result = '';
  for(let i = 0; i < text.length; i++)
  {
    const char = text[i];
    if(/[0-9]/.test(char))
    { // Check if the character is a digit
      result += (numberWords[char] || char) + '_'; // Use the number word if available, otherwise keep the original character
    }
    else
    {
      result += char;
    }
  }
  // remove trailing underscore
  result = result.replace(/_+$/, '');
  // remove double underscores
  result = result.replace(/__+/g, '_');
  return result;
}

const i = [];
icons.icons.forEach(icon =>
{
  const iconName = icon.name;
  let iconCaseName = iconName.replace(/-/g, '_').toUpperCase();

  // change 10K to TEN_K for example
  iconCaseName = convertNumberCaseToUnderscore(iconCaseName);

  i.push('case ' + iconCaseName + ' = "' + iconName + '";');
});

const output = `<?php
enum Icon: string {
  ${i.join('\n  ')}
}
`;

fs.writeFile(path.join(outputDir, 'Icon.php'), output, err =>
{
  if(err)
  {
    console.error('Error writing file:', err);
  }
  else
  {
    console.log('File written successfully');
  }
});
