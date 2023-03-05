//@ts-check
import {SearchFilter} from "./walkTextNodes.js";
import { SearchOutput } from "./search-output.js";
export {exec_search, analyzeData, fetchData, mark_text};


class ItemMap {
  static test_items = ['title:text', 'content:html'];

  /**
   * Picks up query-matching entries
   * @param {string} query_str // Regex expression
   * @param {{ignore_case: boolean, ignore_accents: boolean}}
   */
  constructor(query_str, {ignore_case = true, ignore_accents = true}) {
    /** @type {Map<string, {ii: number[], nfkcText: string}>} */
    this.map = new Map();
    let query = query_str.normalize('NFKD');
    const combining_chars_regex = ignore_accents ? /\p{Mark}/gu : '';
    if (ignore_accents) {
      query = query.replace(combining_chars_regex, '');
    }
    this.query = query;
    const searchFilter = new SearchFilter(query, {ignore_case, ignore_accents});
    this.filter = searchFilter.filter;// IndexText
  }

  /**
   * 
   * @param {Element} entry 
   */
  test(entry) {
    for (const item_type of ItemMap.test_items) { 
      const [item, type] = item_type.split(':');
      const content = entry.querySelector(item)?.textContent;
      if (content) { 
        if (type == 'html') { // content
          const content_tree = new DOMParser().parseFromString(content, "text/html");
          if (!content_tree) {
            throw Error(`Failed to parse from string text/html at entry:${entry.TEXT_NODE}`);
          }
          const bodyText = content_tree.body.textContent;
          if (bodyText) {
            const filter_result = this.filter(bodyText);
            this.map.set(item, filter_result);
          }
          else
            console.error(`content_tree.body.textContent not found!`);
        }
        else { // title
          const filter_result = this.filter(content); 
          this.map.set(item, filter_result);
        }
      }
      else {
        console.info(`No content in ${item} of ${entry} !`);
      }
    }
  }

  /**
   * @returns {string|undefined}
   */
  get title() {
      return this.map.get('title')?.nfkcText;
  }

  /**
   * @returns {string|undefined}
   */
  get content() {
      return this.map.get('content')?.nfkcText;
  }

  /**
   * @returns {boolean}
   */
  get isValid() {
    for (const item of ['title', 'content']) {
      const content = this.map.get(item);
      if (content && content.ii.length > 0) {
        return true;
      }
    }
    return false;
  }

  /**
   * @returns {number[]|undefined}
   */
  get ii() {
    return this.map.get('content')?.ii;
  }

}

class FullMap {
  /**
   * 
   * @param {Element} entry 
   * @param {ItemMap} itemMap 
   */
  constructor(entry, itemMap) {
    this.entry = entry;
    this.itemMap = itemMap;
  }

  /**
   * @returns {string|undefined|null}
   */
  get title() {
    const t = this.itemMap.title;
    if (!t) {
      return this.entry.querySelector('title')?.textContent;
    }
  }

  /**
   * @returns {string|undefined|null}
   */
  get content() {
    const c = this.itemMap.content;
    if (!c) {
      return this.entry.querySelector('content')?.textContent;
    }
  }

  /**
   * @returns {number[]|undefined}
   */
  get ii() {
    return this.itemMap.ii;
  }

  /**
   * @returns {string|null}
   */
  get markedContent() {
    if (this.content && this.ii)
      return mark_text(this.content, this.ii);
    else
      return null;
  }

  /**
   * @returns {string|undefined|null}
   */
  get url() {
    return this.entry.querySelector('url')?.textContent;
  }

}

/**
 * Picks up query-matching entries
 * @param {Document} document // XML
 * @param {string} query_str // Regex expression
 * @param {{ignore_case: boolean, ignore_accents: boolean}}
 * @yields {entry: Element, itemMap: ItemMap} >} 
 */
function* analyzeData(document, query_str, {ignore_case = true, ignore_accents = true}) {
  const entries = document.querySelectorAll('entry');
  if (!entries)
    throw Error(`No entries!`);
  for (const entry of entries) {
    const itemMap = new ItemMap(query_str, {ignore_case, ignore_accents});
    itemMap.test(entry);
    if (itemMap.isValid) {
      yield {entry, itemMap};
    }
  }
}

/**
 * @param {Promise} fetch_data
 * @param {string} query
 * @param {{ignore_case: boolean, ignore_accents: boolean}}
 * @param {{id: string, heading: string, entries: string}}search_result_container_map
 * @param {{id: string, title: string, date: string, content: string}} search_result_entry_map
 */
function exec_search(fetch_data = fetchData(), query, { ignore_case = true, ignore_accents = true }, search_result_container_map, search_result_entry_map) {
  fetch_data.then(xml => {
    const search_output = new SearchOutput(search_result_container_map, search_result_entry_map);
    /** @type {{entry: Element, itemMap: ItemMap}} */
    for (const {entry, itemMap} of analyzeData(xml, query, { ignore_case, ignore_accents })) {
      const output = {url: '', title: '', content: ''};
      const url = entry.querySelector('url')?.textContent; // 2
      if (url)
        output.url = url;
      else
        throw Error("No 'url' in entry!");
      let title = '';
      const titleMap = itemMap.title;
      if (titleMap) {
        output.title = titleMap;
      }
      else {
        console.warn(`No title key in itemMap.`);
        const _title = entry.querySelector('title')?.textContent;
        if (_title) {
          output.title = _title;
        }
        else
          console.error(`Failed to get title from entry!`);
      }
      let content = '';
      const _content = itemMap.content;
      if (typeof(_content) === 'undefined' ) {
          throw Error(`itemMap.content is undefined!`);
      }
      else {
        const ii = itemMap.ii;
        if (ii && ii?.length > 0) {
          output.content = mark_text(_content, ii);
        }
        else
          output.content = content;
      }
      search_output.addSearchResult(output);
    }
    const count = search_output.count;
    search_output.addHeading(`${count} post(s) found:`);
  }, reason => {
    throw Error(`exec_search failed. reason:${reason}`);
  })
}

/**
 * 
 * @param {string} text 
 * @param {Array<number>} start_end 
 * @returns {string}
 */
function mark_text(text, start_end, mark_start = "<mark>", mark_end = "</mark>") {
  const before_mark = text.slice(0, start_end[0]);
  const inside_mark = text.slice(start_end[0], start_end[1]);
  const after_mark = text.slice(start_end[1]);
  return before_mark + mark_start + inside_mark + mark_end + after_mark;
}

const fetch_path = '/search.xml';
/**
 * 
 * @param {string} fetchUrl 
 * @returns {Promise}
 */
function fetchData(fetchUrl = fetch_path) {
  return new Promise(resolve => {
    const xhr = new XMLHttpRequest()
    xhr.open('GET', fetchUrl, true)
    xhr.responseType = 'document'
    xhr.overrideMimeType('text/xml')
    xhr.onreadystatechange = () => {
      if (xhr.readyState === xhr.DONE) {
        if (xhr.status === 200 || xhr.status === 304) {
          resolve(xhr.response)
        }
      }
    }
    xhr.send(null)
  })
}