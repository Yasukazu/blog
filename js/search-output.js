//@ts-check
export { SearchOutput, getFirstNChars, startsFromDate };

class SearchOutput {
  /**
   * check container element of #search
   * @param {{id: string, heading: string, entries: string}}search_result_container_map
   * @param {{id: string, title: string, date: string, content: string}} search_result_entry_map
   */
  constructor(search_result_container_map, search_result_entry_map) {
    this.search_result_container_map = search_result_container_map;
    this.search_result_entry_map = search_result_entry_map;
    this.search_result_entry = document.querySelector(`#${search_result_entry_map.id}`);
    if (!(this.search_result_entry)) {
      throw Error(`search_result_entry is not available.`);
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
  }

  /**
   * @param { {url: string, title: string, content: string} }
   */
  addSearchResult({ url, title, content }) {
    const entry_output = document.importNode(this.search_result_entry.content, true);
    console.assert(entry_output);
    const entry_items = entry_output.querySelectorAll(`[class|='entry']`);
    console.assert(entry_items)
    for (const entry of entry_items) {
      console.assert(entry instanceof Element);
      const cls = entry.getAttribute('class');
      const split = cls.split('-');
      console.assert(split.length > 1);
      const item = split[1];
      switch (item) {
        case 'url':
          entry.setAttribute('href', url);
          break;
        case 'title':
          entry.innerHTML = title;
          break;
        case 'content':
          entry.innerHTML = content;
          break;
        case 'date':
          const url_date = getDate(url);
          if (url_date)
            entry.innerHTML = url_date;
          else
            console.error(`get date failed!`);
          break;
        default:
          console.warn(`Unexpected item key!`);
          break;
      }
    }
    const slot_element = entry_output.querySelector(`[class='${this.search_result_entry_map.id}']`);
    console.assert(slot_element instanceof Element);
    slot_element.setAttribute('slot', this.search_result_container_map.entries);
    const result = this.search_result_container.appendChild(entry_output);
    console.assert(result instanceof DocumentFragment, `${entry_output}`)
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

/**
 * 
 * @param {string} url 
 * @returns {string|undefined}
 */
function getDate(url) {
  const date_re = /(\d\d\d\d)\/(\d\d)\/(\d\d)/;
  const date = date_re.exec(url);
  if (date && date.length > 3) {
    const dt = [date[1], date[2], date[3]].join('-');
    const dateNum = Date.parse(dt);
    if (!isNaN(dateNum))
      return dt;
  }
}

