//@ts-check
import { mark_text } from "./analyze-data.js";
export { SearchOutput };

class SearchOutput {
  /**
   * check container element of #search
   * @param {{id: string, heading: string, entries: string}}search_result_container_map
   * @param {{id: string, title: string, date: string, content: string}} search_result_entry_map
   */
  constructor(search_result_container_map, search_result_entry_map) {
    this.search_result_container_map = search_result_container_map;
    this.search_result_entry_map = search_result_entry_map;
    this.search_result_entry = document.querySelector(`#${search_result_entry_map.id}`)?.content;
    if (!this.search_result_entry) {
      throw Error(`Unable to get content from a template`);
    }
    this.search_result_container = document.querySelector(search_result_container_map.id);
    if (!(this.search_result_container instanceof HTMLElement))
      throw Error(`${search_result_container_map.id} is unavailable`);
    // get heading slot 
    let _query = `[slot=${search_result_container_map.heading}]`;
    let old_element = this.search_result_container.querySelector(_query);
    if(old_element instanceof Element) {
      // remove old heading
      const removed = this.search_result_container.removeChild(old_element);
      console.assert(removed instanceof Element, `old_heading removed : ${removed}`);
    }
    // try to add new heading
    let new_element = document.createElement('span');
    if (new_element instanceof Element) {
      new_element.setAttribute('slot', this.search_result_container_map.heading);
      new_element.innerText = 'newly set text by SearchOutput';
      const result = this.search_result_container.appendChild(new_element);
      console.assert(result instanceof Element, `${new_element}`)
    }
    // remove old entries li
    _query = `[slot=${search_result_container_map.entries}]`;
    old_element = this.search_result_container.querySelector(_query);
    if (old_element instanceof Element) {
      const removed = this.search_result_container.removeChild(old_element);
      console.assert(removed instanceof Element, `${removed}`);
    }
    /*
    let new_li = document.createElement('li');
    console.assert(new_li instanceof HTMLElement, "create li failed!");
    new_li.setAttribute('slot', '#{search_entries_name}');
    new_li.setAttribute('class', '#{search_entries_name}');
    const template = document.querySelector("##{search_result_entry_map.id}");
    console.assert(template instanceof HTMLElement, `template`);
    const node = document.importNode(template.content, true)?.children[0];
    console.assert(node, `node`);
    for(const [key, value] of Object.entries({id: "#{search_result_entry_map.id}",
       title: "#{search_result_entry_map.title}",
       date: "#{search_result_entry_map.date}",
       content: "#{search_result_entry_map.content}"})) {
        if (key != 'id') {
          const sel = `[class='${value}']`;
          const elem = node.querySelector(sel);
          console.assert(elem, `element`);
          elem.innerText = value;
        }
       }
    const items = node.querySelectorAll("[class|='entry']");
    node.setAttribute('slot', '#{search_result_container_map.entries}');
    node.setAttribute('class', '#{search_result_container_map.entries}');
    let child = search_result_container.appendChild(node);
    console.assert(child instanceof HTMLElement, "appended child 1");

    const _search_result_output = document.querySelector(search_result_output);
    if (!this._search_result_output)
      Error(`No element selector: ${search_result_output} !`);
    const _search_result_container_template = document.querySelector(search_result_container_template);
    if (!_search_result_container_template)
      throw Error(`!No template selector: ${search_result_container_template}!`);
    this._search_result_container = document.importNode(_search_result_container_template.content, true);
    if (!this._search_result_container)
      throw Error(`Failed to build a search_result_container from its template: ${search_result_container_template}!`);
    this.search_result_entries = this._search_result_container.querySelector(search_result_entries);
    if (!this.search_result_entries)
      throw Error(`No ${search_result_entries}!`);
    this.search_result_entry_template = document.querySelector(search_result_entry_template);
    if (!this.search_result_entry_template)
      throw Error(`!No template selector: ${search_result_entry_template}!`);
    */
  }

  close() {
    /** @type {ChildNode|null|undefined} */
    if (this._search_result_output) {
      let child = null;
      while (child = this._search_result_output.firstChild) {
        this._search_result_output.removeChild(child);
      }
      if (this._search_result_container && this.search_result_entries?.firstChild)
        this._search_result_output.appendChild(this._search_result_container);
      else
        console.info(`Nothing to append to ${this._search_result_output}`);
    }
    else {
      console.error(`Close failed!: No _search_result_output`);
    }
  }

  /**
   * @param { Element} entry
   * @param { {url: string, title: string, content: string} }
   * @returns {DocumentFragment}
   */
  getSearchResult(entry, {url, title, content}) {
    if (!(this.search_result_entry instanceof DocumentFragment)) {
      throw Error(`search_result_entry is not a DocumentFragment`);
    }
    const entry_output = document.importNode(this.search_result_entry, true);
    if (!entry_output)
      throw Error(`Failed to import entry_output from template`);
    const entry_items = entry_output.querySelectorAll(`[class|='entry']`);
    if (entry_items.length > 0) {
      for (const entry of entry_items) {
        if (entry instanceof Element) {
          const cls = entry.getAttribute('class');
          if (cls) {
            const split = cls.split('-');
            if (split.length > 1) {
              const item = split[1];
              switch(item) {
                case 'url':
                  entry.setAttribute('href', url);
                  break;
                case 'title':
                  entry.innerHTML = title;
                  break;
                case 'content':
                  entry.innerHTML = content;
                  break;
                default:
                  break;
              }
            }
          }
        }
      }
    }
    const slot_element = entry_output.querySelector(`[class='${this.search_result_entry_map.id}']`);
    if (slot_element instanceof Element)
      slot_element.setAttribute('slot', this.search_result_container_map.entries);
    else
      throw Error(`unable to set slot: ${this.search_result_container_map.entries}`)
    return entry_output;
    /*
    for (const [key, value] of Object.entries(this.search_result_entry_map)) {
      if (key != 'id') {
        const element = entry_output.querySelector(value);
        if (element instanceof Element) {

        }
      }

    }
    const ar = entry_output.querySelector('a.title');
    if (!ar)
      throw Error("No 'a' in template!");
    ar.href = url;
    if (title.length == 0) {
      // try to get title from entry
      const _title = entry.querySelector('title')?.textContent;
      if (_title) {
        title = _title;
        console.info(`title is got from entry:${title}`)
      }
    }
    ar.innerText = title.length > 0 ? title : url;
    const date_str = startsFromDate(url);
    if (date_str) {
      const dt = entry_output.querySelector('.date');
      if (dt) {
        dt.innerText = date_str;
        console.debug(`Output date_str: ${date_str}`);
      }
    }
    const dst = entry_output.querySelector('.content');
    if (dst) {
      const length = dst.getAttribute('data-length');
      let len = 300;
      if (length) {
        const _len = parseInt(length, 10);
        if (_len) {
          len = _len;
          console.debug(`data-length(${len}) is used.`);
        }
      }
      if (content.length == 0) {
        const _content = entry.querySelector('content')?.textContent;
        if (_content) {
          const content_tree = new DOMParser().parseFromString(_content, "text/html");
          if (content_tree) {
            const content_text = content_tree.body.textContent;
            if (content_text) {
              content = content_text;
              console.info(`content is got from entry.`)
            }
            else 
              throw Error(`Failed to get textContent.`);
          }
          else
            throw Error(`Failed to get content_tree.`);
        }
        else
          throw Error(`Unable to get content from entry!`);
      }
      const { output: limitedStr, on_break: onBreak } = getFirstNChars(content, len);
      if (ii.length > 0) {
        const markedText = mark_text(limitedStr, ii) + (onBreak ? '...' : '');
        dst.innerHTML = markedText;
      }
      else {
        dst.innerHTML = limitedStr + (onBreak ? '...' : '');
      }
      const img_out = entry_output.querySelector('img');
      if (img_out) {
        const img_in = entry.querySelector('img');
        if (img_in) {
          const img_src = img_in.getAttribute('src');
          if (img_src) {
            img_out.setAttribute('src', img_src);
            console.debug(`img src is set`);
          }
        }
      }
      this.search_result_entries.appendChild(entry_output);
      console.debug(`Output entry_output: ${entry_output}`);
    }
    else
      console.error(`No entry output '.content'`);
    */
  }

  /**
   * @param { {entry: Element, url: string, title: string, content: string, ii: Array<number>, length: string} }
   * @returns {DocumentFragment}
   */
  makeSearchResult({ entry, url, title, content, ii, length = '' }) {
    if (!url)
      throw Error(`No url!`);
    // check function
    /** @type {key: string} => {string} */
    const check = (key) => {
        const from_entry = entry.querySelector(key)?.textContent;
        if (from_entry != key)
          throw Error(`${from_entry} : entry must be same as ${key}.`);
    };
    check(url);
    if (title) {
      check(title);
    }
      else {
        const _title = entry.querySelector('title')?.textContent;
        if (_title) {
          title = _title;
          console.info(`title is got from entry:${title}`)
        }
      }

      // const length = dst.getAttribute('data-length');
      let len = 300;
      if (length) {
        const _len = parseInt(length, 10);
        if (_len) {
          len = _len;
          console.debug(`data-length(${len}) is used.`);
        }
      }
      if (content.length == 0) {
        const _content = entry.querySelector('content')?.textContent;
        if (_content) {
          const content_tree = new DOMParser().parseFromString(_content, "text/html");
          if (content_tree) {
            const content_text = content_tree.body.textContent;
            if (content_text) {
              content = content_text;
              console.info(`content is got from entry.`)
            }
            else 
              throw Error(`Failed to get textContent.`);
          }
          else
            throw Error(`Failed to get content_tree.`);
        }
        else
          throw Error(`Unable to get content from entry!`);
      }
      const { output: limitedStr, on_break: onBreak } = getFirstNChars(content, len);
      let markedText = '';
      if (ii.length > 0) {
        markedText = mark_text(limitedStr, ii) + (onBreak ? '...' : '');
      }
      else {
        markedText = limitedStr + (onBreak ? '...' : '');
      }
        const img_in = entry.querySelector('img');
        if (img_in) {
          const img_src = img_in.getAttribute('src');
          if (img_src) {
            img_out.setAttribute('src', img_src);
            console.debug(`img src is set`);
          }
        }
      console.debug(`Output entry_output: ${entry_output}`);
      return entry_output;
  }
}

/**
 * 
 * @param {string} src 
 * @param {Number} n 
 * @returns {Object}
 */
function getFirstNChars(src, n) {
  const array = Array.from(src); // every code point
  let lc = '';
  let i = 0;
  let out = '';
  let on_break = false;
  for (let c of array) {
    if (lc === ' ' && lc === c) {
      continue;
    }
    else {
      lc = c;
    }
    out += c;
    if (++i >= n) {
      on_break = true;
      break;
    }
  }
  return { output: out, on_break: on_break };
}

/**
 * Check url string represents a valid date
 * @param {string} url 
 * @returns {string}
 */
function startsFromDate(url) {
  const re = /(\d\d\d\d)\/(\d\d)\/(\d\d)/;
  const date = re.exec(url);
  if (date && date.length > 3) {
    const dt = [date[1], date[2], date[3]].join('-');
    const dateNum = Date.parse(dt);
    if (!isNaN(dateNum))
      return dt;
  }
  return '';
}

