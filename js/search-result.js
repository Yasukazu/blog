export {SearchResult};
class SearchResult {
  /**
   * @param { {entry: Element, url: string, title: string, content: string, ii: Array<number>, length: string} }
   */
   // @returns {DocumentFragment}
    constructor({entry, url, title, content, ii, length = '' }={}) {
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
    this.url = url;
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
      this.title = title;
      // const length = dst.getAttribute('data-length');
      let len = 300;
      if (length) {
        const _len = parseInt(length, 10);
        if (_len) {
          len = _len;
          console.debug(`data-length(${len}) is used.`);
        }
      }
      this.length = len;
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
      this.content = content;
      const { output: limitedStr, on_break: onBreak } = getFirstNChars(content, len);
      let markedText = '';
      if (ii.length > 0) {
        this.markedText = mark_text(limitedStr, ii) + (onBreak ? '...' : '');
      }
      else {
        this.markedText = limitedStr + (onBreak ? '...' : '');
      }
        const img_in = entry.querySelector('img');
        if (img_in) {
          const img_src = img_in.getAttribute('src');
          if (img_src) {
            img_out.setAttribute('src', img_src);
            console.debug(`img src is set`);
            this.img = {img_in, img_src};
          }
        }
        else
          this.img = null;
  }
}
