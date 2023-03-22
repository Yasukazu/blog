/**
 * @param {Promise} fetch_data
 * @param {{ignore_case: boolean, ignore_accents: boolean}}
 * @param {{id: string, heading: string, entries: string}}search_result_container_map
 * @param {{id: string, title: string, date: string, content: string}} search_result_entry_map
 * @param {{id: string, text: string, ignore_case: string, ignore_accents: string, regex: string, button: string}} search_input
 */
export function exec_search(fetch_data: Promise<any>, search_result_container_map: {
    id: string;
    heading: string;
    entries: string;
}, search_result_entry_map: {
    id: string;
    title: string;
    date: string;
    content: string;
}, search_input: {
    id: string;
    text: string;
    ignore_case: string;
    ignore_accents: string;
    regex: string;
    button: string;
}): void;
/**
 * Picks up query-matching entries
 * @param {Document} document // XML
 * @param {string} query_str // Regex expression
 * @param {{ignore_case: boolean, ignore_accents: boolean, regex: boolean}}
 * @yields {ItemMap}
 */
export function analyzeData(document: Document, query_str: string, { ignore_case, ignore_accents, regex }: {
    ignore_case: boolean;
    ignore_accents: boolean;
    regex: boolean;
}): {};
/**
 *
 * @param {string} fetchUrl
 * @returns {Promise}
 */
export function fetchData(fetchUrl?: string): Promise<any>;
