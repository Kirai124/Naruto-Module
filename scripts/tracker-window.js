/** A persistent sheet-like window, without DialogV2's submit/close button handling. */
let WindowClass;
export function createTrackerWindow(options, markup, bind) {
  WindowClass ??= class ClassModTrackerWindow extends foundry.applications.api.ApplicationV2 {
    static DEFAULT_OPTIONS = {tag: 'div', classes: ['n5eb-tracker-window'], window: {resizable: true}};
    async _renderHTML() {
      const template = document.createElement('template');
      template.innerHTML = this.markup();
      return template.content;
    }
    _replaceHTML(result, content) { content.replaceChildren(result); }
    _onRender(context, options) {
      super._onRender(context, options);
      this.bind(this);
    }
  };
  const app = new WindowClass(options);
  app.markup = markup;
  app.bind = bind;
  return app;
}

/** Keep one sidebar and one scrollable body, including at small window heights. */
export function trackerTabs(root, tab) {
  root.dataset.tab = tab;
  for (const button of root.querySelectorAll('[data-tab-button]')) {
    const active = button.dataset.tabButton === tab;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', String(active));
  }
  for (const panel of root.querySelectorAll('[data-panel]')) panel.hidden = panel.dataset.panel !== tab;
  root.querySelector('.n5eb-tracker-body').scrollTop = 0;
}
