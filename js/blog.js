// Shared behavior for the blog landing page (blog.html) and post pages
// (blog/*.html). Every feature checks for its markup first, so pages only
// get what they include.
document.addEventListener('DOMContentLoaded', function () {
  setUpTagFilter();
  setUpPostPage();
});

// LANDING PAGE: filter the post list by tag.
// Each post <li> lists its tags in data-tags="tag-one tag-two".
function setUpTagFilter() {
  const filter = document.querySelector('.blog-filter');
  if (!filter) return;

  const buttons = filter.querySelectorAll('button.tag');
  const posts = document.querySelectorAll('.post-list > li');
  const groups = document.querySelectorAll('.year-group');
  const noResults = document.querySelector('.no-results');

  function apply(tag) {
    buttons.forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.tag === tag));
    });
    posts.forEach(function (post) {
      const tags = (post.dataset.tags || '').split(/\s+/);
      post.hidden = tag !== 'all' && !tags.includes(tag);
    });
    // Hide year headings with no visible posts
    let anyVisible = false;
    groups.forEach(function (group) {
      const visible = group.querySelector('.post-list > li:not([hidden])');
      group.hidden = !visible;
      if (visible) anyVisible = true;
    });
    if (noResults) noResults.hidden = anyVisible;
  }

  buttons.forEach(function (b) {
    b.addEventListener('click', function () { apply(b.dataset.tag); });
  });

  apply('all');
}

// POST PAGE: reading time, table of contents, heading anchors,
// code copy buttons, and the reading progress bar.
function setUpPostPage() {
  const body = document.querySelector('.post-body');
  if (!body) return;

  // Reading time (~220 words per minute)
  const readingTime = document.getElementById('readingTime');
  if (readingTime) {
    const words = body.innerText.trim().split(/\s+/).length;
    readingTime.textContent = Math.max(1, Math.round(words / 220)) + ' min read';
  }

  // Give every h2/h3 an id and a hover "#" link
  const headings = body.querySelectorAll('h2, h3');
  headings.forEach(function (h) {
    h.dataset.title = h.textContent.trim();
    if (!h.id) h.id = slugify(h.dataset.title);
    const anchor = document.createElement('a');
    anchor.href = '#' + h.id;
    anchor.className = 'heading-anchor';
    anchor.textContent = '#';
    anchor.setAttribute('aria-label', 'Link to this section');
    h.appendChild(anchor);
  });

  // Table of contents from the h2s (only if the page has a .toc container)
  const toc = document.querySelector('.toc ol');
  if (toc) {
    body.querySelectorAll('h2').forEach(function (h) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = h.dataset.title;
      li.appendChild(a);
      toc.appendChild(li);
    });
  }

  // Copy buttons on code blocks
  document.querySelectorAll('.code-block').forEach(function (block) {
    const button = block.querySelector('.code-copy');
    const code = block.querySelector('pre code');
    if (!button || !code) return;
    button.addEventListener('click', function () {
      navigator.clipboard.writeText(code.innerText).then(function () {
        button.textContent = 'Copied';
        setTimeout(function () { button.textContent = 'Copy'; }, 1500);
      });
    });
  });

  // Reading progress bar
  const progress = document.querySelector('.reading-progress');
  if (progress) {
    const update = function () {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 100;
      progress.style.width = Math.min(100, pct) + '%';
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }
}

function slugify(text) {
  return text.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}
