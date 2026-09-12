// Shared rendering logic for cookbook recipe pages.
// See cookbook/_template.html for the expected config shape.
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
        li.textContent = renderItem(item, currentServings);
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
