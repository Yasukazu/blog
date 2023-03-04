export {defineCustomElementFromTemplateId};
/**
 * 
 * @param {string} id 
 */
function defineCustomElementFromTemplateId(id) {
customElements.define(id, 
  class extends HTMLElement {
    constructor() {
      super();
      const template = document.getElementById(id);
      console.assert(template, `no template!`);
      let templateContent = template.content;
      console.assert(`no template content`);
      const _shadowRoot = this.attachShadow({mode: 'open'});
      console.assert(_shadowRoot, `No _shadowRoot `);
      const clonedNode = templateContent.cloneNode(true);
      console.assert(clonedNode, `clonedNode!`);
          const  shadowRoot = _shadowRoot.appendChild(clonedNode);
      console.assert(shadowroot, `shadowRoot`);
    }
  }
);
}