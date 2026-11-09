/* Content is built by build.py. No framework, account, or database required. */
const main = document.querySelector('main');
const sections = {
  math: { label: 'Mathematics', description: 'Notes, questions & ideas' },
  blog: { label: 'Writing', description: 'Occasional writing' },
  conversations: { label: 'Conversations', description: 'Thinking together' },
};
let content;

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function fileHref(section, path) {
  return `#/${section}/read/${encodeURIComponent(path)}`;
}

function safeLink(raw, section, currentPath) {
  if (/^(https?:|mailto:)/i.test(raw)) return raw;
  if (/^#\//.test(raw)) return raw;
  if (/^[a-z][a-z0-9+.-]*:/i.test(raw) || raw.startsWith('//')) return null;
  if (section) {
    const base = new URL(currentPath || `content/${section}/index.txt`, location.href);
    const target = new URL(raw, base);
    const match = content.sections[section].files.find(file => new URL(file.path, location.href).pathname === target.pathname);
    if (match) return fileHref(section, match.path);
  }
  return null;
}

// A deliberately small, safe text format: paragraphs, headings, lists, and links.
// User text is inserted as text nodes, never interpreted as HTML.
function inline(parent, text, section, currentPath) {
  const pattern = /\[([^\]]+)\]\(([^\s)]+)\)|\*\*([^*]+)\*\*|`([^`]+)`/g;
  let start = 0;
  for (const match of text.matchAll(pattern)) {
    parent.append(document.createTextNode(text.slice(start, match.index)));
    if (match[1]) {
      const href = safeLink(match[2], section, currentPath);
      const link = element(href ? 'a' : 'span', '', match[1]);
      if (href) link.href = href;
      parent.append(link);
    } else parent.append(element(match[3] ? 'strong' : 'code', '', match[3] || match[4]));
    start = match.index + match[0].length;
  }
  parent.append(document.createTextNode(text.slice(start)));
}

function prose(text, section, currentPath) {
  const root = element('div', 'prose');
  for (const block of text.trim().split(/\n\s*\n/)) {
    if (!block) continue;
    const heading = block.match(/^(#{1,3})\s+([^\n]+)$/);
    if (heading) {
      const node = element(`h${Math.min(heading[1].length + 1, 3)}`);
      inline(node, heading[2], section, currentPath);
      root.append(node);
    } else if (block.split('\n').every(line => /^[-*]\s+/.test(line))) {
      const list = element('ul');
      block.split('\n').forEach(line => {
        const item = element('li');
        inline(item, line.replace(/^[-*]\s+/, ''), section, currentPath);
        list.append(item);
      });
      root.append(list);
    } else {
      const paragraph = element('p');
      inline(paragraph, block.replace(/\n/g, ' '), section, currentPath);
      root.append(paragraph);
    }
  }
  return root;
}

function footer() {
  const node = element('footer', 'page-footer');
  node.append(element('span', '', 'Maya (Esty) Gusak'), element('span', '', 'Mathematics & other things.'));
  return node;
}

function home() {
  const grid = element('div', 'intro-grid');
  const copy = element('div', 'intro-copy');
  copy.append(element('h1', '', 'Hello, I’m Esty.'));
  const intro = prose(content.intro);
  intro.classList.add('lead');
  copy.append(intro);
  const email = element('a', 'intro-contact', 'mgusak@stanford.edu ↗');
  email.href = 'mailto:mgusak@stanford.edu';
  copy.append(email);
  const figure = element('figure', 'portrait-wrap');
  if (content.portrait) {
    const photo = element('img', 'portrait');
    photo.src = content.portrait;
    photo.alt = 'Maya (Esty) Gusak';
    photo.width = 430;
    photo.height = 538;
    figure.append(photo);
  } else {
    const placeholder = element('div', 'portrait portrait-placeholder');
    placeholder.setAttribute('aria-label', 'Profile photo coming soon');
    placeholder.setAttribute('role', 'img');
    placeholder.append(element('span', '', 'm'));
    figure.append(placeholder);
  }
  grid.append(copy, figure);
  main.append(grid, element('h2', 'section-label', 'Elsewhere on this site'));
  const links = element('div', 'explore-links');
  Object.entries(sections).forEach(([key, value], index) => {
    const link = element('a', 'explore-link');
    link.href = `#/${key}`;
    link.append(element('span', 'number', `0${index + 1}`), element('span', 'title', value.label.toLowerCase()), element('span', 'description', value.description), element('span', 'arrow', '↗'));
    links.append(link);
  });
  main.append(links);
}

function sectionPage(section) {
  const data = content.sections[section];
  main.append(element('p', 'eyebrow', 'Mathematics & other things'), element('h1', '', sections[section].label.toLowerCase()));
  const intro = prose(data.intro, section);
  intro.classList.add('section-intro', 'lead');
  main.append(intro);
  if (!data.files.length) {
    main.append(element('p', 'empty-state', 'More to come.'));
    return;
  }
  main.append(element('h2', 'section-label', 'Collected here'));
  const list = element('ul', 'document-list');
  data.files.forEach(file => {
    const item = element('li');
    const link = element('a');
    const viewable = ['txt', 'md', 'pdf', 'collection'].includes(file.type);
    link.href = viewable ? fileHref(section, file.path) : file.path;
    if (!viewable) link.setAttribute('download', '');
    const label = file.type === 'collection' ? `${file.items.length} conversations` : file.type;
    link.append(element('span', 'document-title', file.title), element('span', 'file-type', `${label} ${viewable ? '↗' : '↓'}`));
    item.append(link);
    list.append(item);
  });
  main.append(list);
}

function conversationText(text) {
  const body = element('div', 'document-text conversation-text');
  text.split('\n').forEach((line, index) => {
    if (index) body.append(document.createTextNode('\n'));
    if (line.trimEnd().endsWith('?')) {
      const question = element('strong', 'conversation-question');
      question.append(element('em', '', line));
      body.append(question);
    } else body.append(document.createTextNode(line));
  });
  return body;
}

function reader(section, path) {
  const file = content.sections[section].files.find(file => file.path === path);
  const back = element('a', 'back-link', `← Back to ${sections[section].label.toLowerCase()}`);
  back.href = `#/${section}`;
  main.append(back);
  if (!file) { main.append(element('h1', '', 'File not found'), element('p', '', 'This file may have been moved or removed.')); return; }
  document.title = `${file.title} — Maya (Esty) Gusak`;
  const header = element('header', 'document-header');
  header.append(element('p', 'eyebrow', sections[section].label.toLowerCase()), element('h1', '', file.title));
  main.append(header);
  if (file.type === 'collection') {
    const intro = file.text.replace(/^#\s+[^\n]+\n?/, '').trim();
    if (intro) main.append(prose(intro, section, file.path));
    const collection = element('div', 'conversation-list');
    file.items.forEach(item => {
      const dropdown = element('details', 'conversation');
      const summary = element('summary', '', item.title);
      const text = item.text.replace(/^#\s+[^\n]+\n?/, '').trim();
      dropdown.append(summary, conversationText(text));
      collection.append(dropdown);
    });
    main.append(collection);
    return;
  }
  const download = element('a', 'download-link', 'Download original file ↓');
  download.href = file.path;
  download.setAttribute('download', '');
  main.append(download);
  if (file.type === 'pdf') {
    const frame = element('iframe', 'pdf-viewer');
    frame.title = file.title;
    frame.src = file.path;
    main.append(frame);
  } else if (file.type === 'md') main.append(prose(file.text.replace(/^#\s+[^\n]+\n?/, '').trim(), section, file.path));
  else if (file.type === 'txt') main.append(element('div', 'document-text', file.text.replace(/^#\s+[^\n]+\n?/, '').trim()));
  else main.append(element('p', '', 'Use the download link above to open this file.'));
}

function render(focus = false) {
  main.replaceChildren();
  let parts;
  try { parts = decodeURIComponent(location.hash.slice(1)).split('/').filter(Boolean); }
  catch { parts = ['invalid']; }
  const section = parts[0];
  document.querySelectorAll('nav a').forEach(link => {
    if (link.dataset.page === (section || 'home')) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  document.title = `${sections[section] ? sections[section].label + ' — ' : ''}Maya (Esty) Gusak`;
  if (!section) home();
  else if (!sections[section]) main.append(element('h1', '', 'Page not found'), element('p', '', 'Choose a page in the sidebar to keep exploring.'));
  else if (parts[1] === 'read') reader(section, parts.slice(2).join('/'));
  else sectionPage(section);
  main.append(footer());
  if (focus) { main.focus({ preventScroll: true }); window.scrollTo(0, 0); }
}

async function start() {
  try {
    const response = await fetch('content.json');
    if (!response.ok) throw new Error('Unable to load content');
    content = await response.json();
    render();
    window.addEventListener('hashchange', () => render(true));
  } catch {
    main.replaceChildren(element('h1', '', 'A little interruption.'), element('p', '', 'The content could not be loaded. Please refresh the page, or try again shortly.'));
  }
}
start();
