// Shared rendering logic for cookbook recipe pages.
// See cookbook/_template.html for the expected config shape.

// Name of the Apple Shortcut that adds its text input to the Reminders
// grocery list. Must match the shortcut's name in the Shortcuts app exactly.
const GROCERY_SHORTCUT_NAME = 'Add to Grocery List';

// Plus button shown on hover that sends an ingredient to Apple Reminders
// by running the grocery shortcut through the shortcuts:// URL scheme.
function createGroceryButton(text) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'grocery-add';
  button.textContent = '+';
  button.title = 'Add to grocery list';
  button.setAttribute('aria-label', `Add ${text} to grocery list`);
  button.addEventListener('click', function () {
    window.location.href = 'shortcuts://run-shortcut?name='
      + encodeURIComponent(GROCERY_SHORTCUT_NAME)
      + '&input=text&text=' + encodeURIComponent(text);
    button.textContent = '✓';
    button.classList.add('added');
  });
  return button;
}

function renderRecipe(config) {
  const { servings, sections } = config;

  const servingsLabel = document.getElementById('servingsLabel');
  const slider = document.getElementById('servingSlider');
  const servingCount = document.getElementById('servingCount');

  const unitsWithPeriods = ['oz', 'Tbsp', 'tsp'];

  function formatQuantity(qty) {
    if (qty == null) return '';
    const fixed = Number(qty).toFixed(2);
    return fixed.replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
  }

  function renderItem(item, currentServings) {
    if (item.text !== undefined) {
      return item.text;
    }
    const scaledQty = item.quantity != null
      ? formatQuantity(item.quantity * currentServings / servings.base)
      : '';
    const unitDisplay = item.unit
      ? `${scaledQty} ${item.unit}${unitsWithPeriods.includes(item.unit) ? '.' : ''} `
      : scaledQty ? `${scaledQty} ` : '';
    return `${scaledQty ? unitDisplay : ''}${item.name}`;
  }

  function renderAll(currentServings) {
    sections.forEach(section => {
      const list = document.getElementById(section.listId);
      if (!list) return;
      list.innerHTML = '';
      section.items.forEach(item => {
        const li = document.createElement('li');
        const text = renderItem(item, currentServings);
        li.textContent = text;
        li.appendChild(createGroceryButton(text));
        list.appendChild(li);
      });
    });
  }

  if (servings) {
    if (servingsLabel) servingsLabel.hidden = false;
    slider.min = servings.min ?? 1;
    slider.max = servings.max ?? 20;
    slider.value = servings.base;
    servingCount.textContent = servings.base;
    renderAll(servings.base);

    slider.addEventListener('input', function () {
      const current = parseInt(this.value, 10);
      servingCount.textContent = current;
      renderAll(current);
    });
  } else {
    renderAll(null);
  }
}

// Click an instruction step to cross it off as you cook.
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.instructions li').forEach(function (li) {
    li.classList.add('step-toggle');
    li.addEventListener('click', function () {
      li.classList.toggle('step-done');
    });
  });
});
