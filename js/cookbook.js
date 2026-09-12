// Recipe search/autocomplete for cookbook.html. Reads its index straight from
// the category tables already on the page, so adding a new <tr> to a
// .recipe-list table is all that's needed to make a recipe searchable too.
document.addEventListener('DOMContentLoaded', function () {
  const searchInput = document.getElementById('recipeSearch');
  const resultsList = document.getElementById('searchResults');
  if (!searchInput || !resultsList) return;

  const MAX_RESULTS = 8;

  const recipes = Array.from(document.querySelectorAll('.recipe-list a')).map(link => {
    const heading = link.closest('table').previousElementSibling;
    return {
      name: link.textContent.trim(),
      url: link.getAttribute('href'),
      category: heading && heading.tagName === 'H1' ? heading.textContent.trim() : ''
    };
  });

  let activeIndex = -1;

  function closeResults() {
    resultsList.hidden = true;
    resultsList.innerHTML = '';
    searchInput.setAttribute('aria-expanded', 'false');
    searchInput.removeAttribute('aria-activedescendant');
    activeIndex = -1;
  }

  function setActive(options) {
    options.forEach((option, i) => option.classList.toggle('active', i === activeIndex));
    if (activeIndex >= 0) {
      searchInput.setAttribute('aria-activedescendant', options[activeIndex].id);
      options[activeIndex].scrollIntoView({ block: 'nearest' });
    } else {
      searchInput.removeAttribute('aria-activedescendant');
    }
  }

  function renderResults(matches) {
    resultsList.innerHTML = '';
    activeIndex = -1;

    matches.forEach((recipe, i) => {
      const li = document.createElement('li');
      li.id = `search-option-${i}`;
      li.setAttribute('role', 'option');

      const link = document.createElement('a');
      link.href = recipe.url;

      const name = document.createElement('span');
      name.textContent = recipe.name;
      link.appendChild(name);

      if (recipe.category) {
        const category = document.createElement('span');
        category.className = 'search-category';
        category.textContent = recipe.category;
        link.appendChild(category);
      }

      li.appendChild(link);
      resultsList.appendChild(li);
    });

    const hasMatches = matches.length > 0;
    resultsList.hidden = !hasMatches;
    searchInput.setAttribute('aria-expanded', String(hasMatches));
  }

  function search(query) {
    const q = query.trim().toLowerCase();
    if (!q) {
      closeResults();
      return;
    }

    const startsWith = [];
    const otherMatches = [];

    recipes.forEach(recipe => {
      const name = recipe.name.toLowerCase();
      if (name.startsWith(q)) {
        startsWith.push(recipe);
      } else if (name.includes(q) || recipe.category.toLowerCase().includes(q)) {
        otherMatches.push(recipe);
      }
    });

    renderResults([...startsWith, ...otherMatches].slice(0, MAX_RESULTS));
  }

  searchInput.addEventListener('input', function () {
    search(this.value);
  });

  searchInput.addEventListener('keydown', function (e) {
    const options = resultsList.querySelectorAll('li');
    if (resultsList.hidden || options.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex = (activeIndex + 1) % options.length;
      setActive(options);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = (activeIndex - 1 + options.length) % options.length;
      setActive(options);
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0) {
        e.preventDefault();
        options[activeIndex].querySelector('a').click();
      }
    } else if (e.key === 'Escape') {
      closeResults();
    }
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.search-wrap')) closeResults();
  });
});
