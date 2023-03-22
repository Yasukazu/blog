//@ts-check
export { SearchOutput, getFirstNChars, startsFromDate };

class SearchOutput {
		public search_result_container_map: any;
		public search_result_entry_map: any;
		public search_result_entry: any;
		public search_result_container: any;
		public added_count: any;

  /**
   * check container element of #search
   */
  constructor(search_result_container_map: {id: string, heading: string, entries: string}, search_result_entry_map: {id: string, title: string, date: string, content: string}) {
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

    // remove old entries li
    _query = `[slot=${search_result_container_map.entries}]`;
    old_element = this.search_result_container.querySelector(_query);
    if (old_element instanceof Element) {
      const removed = this.search_result_container.removeChild(old_element);
      console.assert(removed instanceof Element, `${removed}`);
    }
    this.added_count = 0;
  }

  /**
   * 
   */
  addSearchResult(info: {url: string, title: string, content: string, ii: Array<number>}) {
    /** @type {DocumentFragment} */
    const entry_output = document.importNode(this.search_result_entry.content, true);
    console.assert(entry_output instanceof DocumentFragment);
    const entry_items = entry_output.querySelectorAll(`[class|='entry']`);
    console.assert(entry_items.length > 0)
    for (const entry of entry_items) {
      console.assert(entry instanceof Element);
      const cls = entry.getAttribute('class');
      console.assert(typeof(cls) === 'string')
      const split = cls.split('-');
      console.assert(split.length > 1);
      const item = split[1];
      switch (item) {
        case 'url':
          entry.setAttribute('href', info.url);
          break;
        case 'title':
          entry.innerHTML = info.title;
          break;
        case 'content':
          let length = 300;
          const data_length = entry.getAttribute('data-length');
          if (data_length) {
            const _length = parseInt(data_length);
            if (!isNaN(_length))
              length = _length;
            else
              console.warn('data-length is invalid.');
          }
          info.content = getFirstNChars(info.content, length);
          entry.innerHTML = mark_text(info.content, info.ii);
          break;
        case 'date':
          const url_date = getDate(info.url);
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
    const slot_element = entry_output.children[0];
    console.assert(slot_element instanceof HTMLElement);
    const slot_attribute = slot_element.getAttribute('slot');
    console.assert(slot_attribute === this.search_result_container_map.entries);
    let appended = this.search_result_container.appendChild(entry_output);
    console.assert(appended instanceof DocumentFragment, `${entry_output}`)
    this.added_count += 1;
  }

  /**
   * @returns {number}
   *  */ 
  get count() {return this.added_count;}

  /**
   * Add new heading
   */
  addHeading(msg: string) {
    let new_span = document.createElement('span');
    console.assert(new_span instanceof Element)
    new_span.setAttribute('slot', this.search_result_container_map.heading);
    new_span.innerText = msg;
    const result = this.search_result_container.appendChild(new_span);
    console.assert(result instanceof Element, `${new_span}`)
  }

}

/**
 * 
 */
function getFirstNChars(src: string, n: number, trailing = '...'): string {
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
    if ((++i) >= n) {
      on_break = true;
      break;
    }
  }
  return out + (on_break ? trailing : '');
}

/**
 * Check url string represents a valid date
 * Returns empty string if not valid
 * @returns {string}
 */
function startsFromDate(url: string) {
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
function getDate(url: string) {
  const date_re = /(\d\d\d\d)\/(\d\d)\/(\d\d)/;
  const date = date_re.exec(url);
  if (date && date.length > 3) {
    const dt = [date[1], date[2], date[3]].join('-');
    const dateNum = Date.parse(dt);
    if (!isNaN(dateNum))
      return dt;
  }
}

/**
 * 
 * @returns {string}
 */
function mark_text(text: string, start_end: Array<number>, mark_start = "<mark>", mark_end = "</mark>") {
  console.assert(start_end.length >= 2, `${start_end.length} must be 2 or larger!`);
  if (start_end[1] - start_end[0] <= 1)
    return text;
  const before_mark = text.slice(0, start_end[0]);
  const inside_mark = text.slice(start_end[0], start_end[1]);
  const after_mark = text.slice(start_end[1]);
  return before_mark + mark_start + inside_mark + mark_end + after_mark;
}