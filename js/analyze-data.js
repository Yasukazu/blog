//@ts-check
import { SearchFilter } from "./search-filter.js";
import { SearchOutput } from "./search-output.js";
export { exec_search, analyzeData, fetchData };
class ItemMap {
    /**
     * Picks up query-matching entries
     */
    constructor(entry, query_str, { ignore_case = true, ignore_accents = true, regex = false }) {
        /** @type {Map<string, {ii: number[], nfkcText: string}>} */
        this.map = new Map();
        const query = query_str.normalize('NFKD');
        const combining_chars_regex = ignore_accents ? /\p{Mark}/gu : '';
        this.query = ignore_accents ? query.replace(combining_chars_regex, '') : query;
        const url = entry.querySelector('url')?.textContent;
        if (!url)
            throw Error('Failed to get url from entry!');
        this.url = url;
        const searchFilter = new SearchFilter(query, { ignore_case, ignore_accents, regex });
        this.filter = searchFilter.filter; // IndexText
        this.test(entry);
    }
    /**
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
                        throw Error(`content_tree.body.textContent not found!`);
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
        if (!this.map.has('title')) {
            this.map.set('title', { ii: [], nfkcText: '' });
        }
        if (!this.map.has('content')) {
            this.map.set('content', { ii: [], nfkcText: '' });
        }
    }
    /**
     */
    get title() {
        const title = this.map.get('title');
        if (title) {
            return title.nfkcText;
        }
        else {
            return '';
            // throw Error('No title in map!');
        }
    }
    /**
     * @returns {string}
     */
    get content() {
        const text = this.map.get('content')?.nfkcText;
        if (typeof (text) == 'undefined')
            throw Error('text is undefined in content of ItemMap!');
        return text;
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
     * @returns {number[]}
     */
    get ii() {
        const ii = this.map.get('content')?.ii;
        if (!ii)
            throw Error('No ii in map!');
        return ii;
    }
}
ItemMap.test_items = ['title:text', 'content:html'];
/**
 * Picks up query-matching entries
 * @param {Document} document // XML
 * @param {string} query_str // Regex expression
 * @param {{ignore_case: boolean, ignore_accents: boolean, regex: boolean}}
 * @yields {ItemMap}
 */
function* analyzeData(document, query_str, { ignore_case = true, ignore_accents = true, regex = false }) {
    const entries = document.querySelectorAll('entry');
    if (!entries)
        throw Error(`No entries!`);
    for (let i = 0; i < entries.length; ++i) {
        const entry = entries[i];
        const itemMap = new ItemMap(entry, query_str, { ignore_case, ignore_accents, regex });
        if (itemMap.isValid) {
            yield itemMap;
        }
    }
}
/**
 * @param {Promise} fetch_data
 * @param {{ignore_case: boolean, ignore_accents: boolean}}
 * @param {{id: string, heading: string, entries: string}}search_result_container_map
 * @param {{id: string, title: string, date: string, content: string}} search_result_entry_map
 * @param {{id: string, text: string, ignore_case: string, ignore_accents: string, regex: string, button: string}} search_input
 */
function exec_search(fetch_data = fetchData(), search_result_container_map, search_result_entry_map, search_input) {
    const input_element = document.querySelector(`#${search_input.text}`);
    if (!(input_element instanceof HTMLInputElement))
        throw Error(`No ${search_input.text}`);
    console.debug(`Input text is set as: "${input_element.value}"`);
    const query = input_element.value;
    const ignore_case_element = document.getElementById(search_input.ignore_case);
    if (!(ignore_case_element instanceof HTMLInputElement))
        throw Error(`No ${search_input.text}`);
    const ignore_case = ignore_case_element.checked ? true : false;
    console.debug(`Ignore case is set as: ${ignore_case}`);
    const ignore_accents_element = document.getElementById(search_input.ignore_accents);
    if (!(ignore_accents_element instanceof HTMLInputElement))
        throw Error(`No ${search_input.ignore_accents} !`);
    const ignore_accents = ignore_accents_element.checked ? true : false;
    console.debug(`Ignore accents is set as: ${ignore_accents}`);
    const regex_element = document.getElementById(search_input.regex);
    if (!(regex_element instanceof HTMLInputElement))
        throw Error(`No ${search_input.regex}`);
    const regex = regex_element.checked ? true : false;
    fetch_data.then(xml => {
        const search_output = new SearchOutput(search_result_container_map, search_result_entry_map);
        for (const itemMap of analyzeData(xml, query, { ignore_case, ignore_accents, regex })) {
            search_output.addSearchResult({ url: itemMap.url, title: itemMap.title, content: itemMap.content, ii: itemMap.ii });
        }
        const count = search_output.count;
        search_output.addHeading(`${count} post(s) found:`);
    }, reason => {
        throw Error(`exec_search failed. reason:${reason}`);
    });
}
const fetch_path = '/search.xml';
/**
 *
 */
function fetchData(fetchUrl = fetch_path) {
    return new Promise(resolve => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', fetchUrl, true);
        xhr.responseType = 'document';
        xhr.overrideMimeType('text/xml');
        xhr.onreadystatechange = () => {
            if (xhr.readyState === xhr.DONE) {
                if (xhr.status === 200 || xhr.status === 304) {
                    resolve(xhr.response);
                }
            }
        };
        xhr.send(null);
    });
}
//# sourceMappingURL=analyze-data.js.map