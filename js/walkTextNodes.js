export {walkTextNodes, SearchFilter, IndexText, IndicesText};
//@ts-check

class IndexText {
  /**
   * 
   * @param {number} index 
   * @param {string} str 
   */
  constructor(index, str) {
    if (index >= str.length) {
      throw Error(`index must be less than str.length)index: ${index} , str.length: ${str.length}  !`);
    }
    this._index = index;
    this.str = str;
  }

  /**
   * @returns {boolean}
   */
  get isValid() {
    return this._index >= 0;
  }

  /**
   * 
   * @returns {number}
   */
  get index() {
    return this._index;
  }

  /**
   * 
   * @returns {string}
   */
  get text() {
    return this.str;
  }
}

class IndicesText {
  constructor() {
    /** @type {Array<IndexString>} */
    this.buffer = [];
  }

  /**
   * @param {IndexString} indexString
   */
  push(indexString) {
    this.buffer.push(indexString);
  }

  /**
   * @returns {boolean}
   */
  get isValid() {
    for (let buff of this.buffer) {
      if (buff.isValid) {
        return true;
      }
    } 
    return false;
  }

  /**
   * @returns {{indices: Array<number>, text: string}}
   */
  get indices() {
    /** @type {Array<number>} */
    const _indices = [];
    const text = '';
    for (let buff of this.buffer) {
      if (buff.index >= 0) {
        _indices.push(text.length + buff.index);
      }
      text += buff.text + ' ';
    }
    return _indices;
  }

  /**
   * returns empty indices if no found text.
   * @returns {{indices: Array<number>, text: string}}
   */
  get join() {
    /** @type {Array<number>} */
    const indices = [];
    let text = '';
    for (let buff of this.buffer) {
      if (buff.index >= 0) {
        indices.push(text.length + buff.index);
      }
      text += buff.text + ' ';
    }
    text.trim();
    return {indices, text};
  }
}

/**
 * dirask: JavaScript - iterate text nodes only in DOM tree
 * @param {Node} node 
 * @typedef {function(string): IndexText} Filter 
 * @param {Filter} filter 
 * @returns {{pushedSet: Set, indicesText: IndicesText}}
 */
function walkTextNodes(node, filter) {
    const buffer = new IndicesText();
    const pushedSet = new Set();
    /**
     * @param {Node} nod 
     */
    const execute = nod => {
        let pushed = 0;
        let child = nod.firstChild;
        while (child) {
            switch (child.nodeType) {
                case Node.TEXT_NODE:
                    const data = child.data;
                    if (!data) {
                      console.error("child.data is empty!");
                      break;
                    }
                    const indexText = filter(data);
                    buffer.push(indexText);
                    if (indexText.isValid)
                      pushedSet.add(pushed);
                    ++pushed;
                    break;
                case Node.ELEMENT_NODE:
                    execute(child);
                    break;
            }
            child = child.nextSibling;
        }
    }
    if (node) {
        execute(node);
    }
    else {
        throw Error("No node!");
    }
    return {pushedSet: pushedSet, indicesText: buffer};
}

class SearchFilter {
  static combining_chars_regex = /\p{Mark}/gu;

  /**
   * @param {string} query 
   * @param {{ignore_case: boolean, ignore_accents: boolean, regex: boolean}} 
   */
  constructor(query, { ignore_case = true, ignore_accents = true, regex = false}) {
    this.ignore_case = ignore_case;
    this.ignore_accents = ignore_accents;
    this.regex = regex;
    this._re = regex ? RegExp(query, ignore_case ? 'uid' : 'ud') : null;
    this._si = regex ? null : query;

    /**
    * @param {string} text 
    * @returns { {ii: Array<number>, nfkcText: string}} // {IndexText}
    */
    this.filter = (text) => {
      const org_text = text.slice().trim();
      if (org_text.length == 0) {
        console.warn("text consists of only spaces!");
        return {ii: [], nfkcText: ''};
      }
      const nfkd_text = org_text.normalize('NFKD');
      if (nfkd_text.length != org_text.length) {
        console.warn(`text length changed by NFKD normalize.`);
      }
      text = nfkd_text.replace(/[\s\n]+/gu, ' '); // compress spaces
      const nfkcText = org_text.normalize('NFKC').replace(/[\s\n]+/gu, ' ');
      if (!text) {
        console.warn("text became empty after trimming, normalizing and replacing spaces.");
        return {ii: [], nfkcText: ''};
      }
      if (this.ignore_accents) {
        text = text.replace(SearchFilter.combining_chars_regex, '');
        console.assert(text.length, "text became empty after replacing accents!");
        console.assert(text.length == nfkcText.length, "Search text length changed by normalize and replacing accents.")
      }
      if (regex) {
        const _ii = text.match(this._re);
        if (!_ii) {
          return { ii: [], nfkcText };
        }
        else {
          return { ii: _ii.indices[0], nfkcText };
        }
      }
      else {
        const _i = text.toLowerCase().indexOf(this._si.toLowerCase());
        if (_i < 0) {
          return { ii: [], nfkcText };
        }
        else {
          return { ii: [_i, _i + query.length], nfkcText };
        }
      }
    }
  }

  /**
   * @returns {RegExp}
   */
  get regExp() {return this._re;}
}