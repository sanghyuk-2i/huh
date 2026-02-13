#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function findMdFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules') {
        findMdFiles(filePath, fileList);
      }
    } else if (file.endsWith('.md') && !file.includes('README')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

function fixMarkdown(content) {
  let fixed = content;

  // Remove <CardGroup> and </CardGroup>
  fixed = fixed.replace(/<CardGroup[^>]*>/g, '');
  fixed = fixed.replace(/<\/CardGroup>/g, '');

  // Convert <Card> to markdown links - handle multiline
  fixed = fixed.replace(/<Card\s+title=["']([^"']+)["']\s+icon=["'][^"']*["']\s+href=["']([^"']+)["']>\s*([\s\S]*?)\s*<\/Card>/g, (match, title, href, desc) => {
    const cleanDesc = desc.trim();
    return cleanDesc ? `- **[${title}](${href})** - ${cleanDesc}` : `- **[${title}](${href})**`;
  });

  // Simpler Card format without icon
  fixed = fixed.replace(/<Card\s+title=["']([^"']+)["']\s+href=["']([^"']+)["']>\s*([\s\S]*?)\s*<\/Card>/g, (match, title, href, desc) => {
    const cleanDesc = desc.trim();
    return cleanDesc ? `- **[${title}](${href})** - ${cleanDesc}` : `- **[${title}](${href})**`;
  });

  // Remove <Accordion> and related tags
  fixed = fixed.replace(/<Accordion[^>]*>/g, '');
  fixed = fixed.replace(/<\/Accordion>/g, '');
  fixed = fixed.replace(/<AccordionGroup[^>]*>/g, '');
  fixed = fixed.replace(/<\/AccordionGroup>/g, '');

  // Fix template literal backticks in table cells
  fixed = fixed.replace(/\{`\{\{/g, '{{');
  fixed = fixed.replace(/\}\}`\}/g, '}}');

  // Fix invalid code block language specifiers like [import], [const], [type], [interface]
  // Pattern 1: ```tsx [import] content -> ```tsx\nimport content
  fixed = fixed.replace(/```(\w+) \[(import|const|type|interface|export|let|var)\] /g, '```$1\n$2 ');

  // Pattern 2: ```tsx [import]\nimport -> ```tsx\nimport
  fixed = fixed.replace(/```(\w+) \[(import|const|type|interface|export|let|var)\]\n/g, '```$1\n');

  // Pattern 3: ```[import] -> ```typescript\nimport
  fixed = fixed.replace(/```\[(import|const|type|interface|export|let|var)\] /g, '```typescript\n$1 ');

  // Pattern 4: ```[import]\nimport -> ```typescript\nimport
  fixed = fixed.replace(/```\[(import|const|type|interface|export|let|var)\]\n/g, '```typescript\n');

  // Fix code blocks where keywords got merged with the language specifier
  // Pattern: ```tsx errorContent from -> ```tsx\nimport errorContent from
  fixed = fixed.replace(/```tsx ([a-zA-Z{])/g, '```tsx\nimport $1');

  // Pattern: ```ts { something -> ```ts\nconst { something
  fixed = fixed.replace(/```ts \{/g, '```ts\nconst {');

  // Pattern: ```js { something -> ```js\nconst { something
  fixed = fixed.replace(/```js \{/g, '```js\nconst {');

  // Pattern: ```ts SOMETHING = -> ```ts\nconst SOMETHING =
  fixed = fixed.replace(/```ts ([A-Z_][A-Z_0-9]*) =/g, '```ts\nconst $1 =');

  // Pattern: ```ts SomethingType = -> ```ts\ntype SomethingType =
  fixed = fixed.replace(/```ts ([A-Z][a-zA-Z]*) =/g, '```ts\ntype $1 =');

  // Pattern: ```ts SomethingInterface { -> ```ts\ninterface SomethingInterface {
  fixed = fixed.replace(/```ts ([A-Z][a-zA-Z]*) \{/g, '```ts\ninterface $1 {');

  // Pattern: ```typescript type { -> ```typescript\nimport type {
  fixed = fixed.replace(/```typescript type \{/g, '```typescript\nimport type {');

  // Pattern: ```vue something setup -> ```vue\n<script setup
  fixed = fixed.replace(/```vue ([a-zA-Z<])/g, '```vue\n$1');

  // Fix HTML tags with markdown content inside - add blank lines before and after code blocks
  // Pattern: <div...>```  ->  <div...>\n\n```
  fixed = fixed.replace(/(<div[^>]*>)\s*(```)/g, '$1\n\n$2');
  // Pattern: ```</div>  ->  ```\n\n</div>
  fixed = fixed.replace(/(```)\s*(<\/div>)/g, '$1\n\n$2');

  // Fix code blocks inside HTML that don't have blank lines after opening tag
  fixed = fixed.replace(/(<div[^>]*>)(\s*)(::: code-group)/g, '$1\n\n$3');
  // Fix closing as well
  fixed = fixed.replace(/(:::)(\s*)(<\/div>)/g, '$1\n\n$3');

  // Clean up multiple empty lines (but allow up to 2 for readability)
  fixed = fixed.replace(/\n{4,}/g, '\n\n\n');

  return fixed;
}

const docsDir = path.join(__dirname, '..', 'docs');
const mdFiles = findMdFiles(docsDir);

console.log(`Found ${mdFiles.length} .md files to fix`);

let fixed = 0;

mdFiles.forEach((filePath) => {
  const content = fs.readFileSync(filePath, 'utf-8');
  const fixedContent = fixMarkdown(content);

  if (content !== fixedContent) {
    fs.writeFileSync(filePath, fixedContent, 'utf-8');
    console.log(`Fixed: ${filePath}`);
    fixed++;
  }
});

console.log(`\nFixed ${fixed} files`);
