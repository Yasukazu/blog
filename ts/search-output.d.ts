export class SearchOutput {
    /**
     * check container element of #search
     * @param {{id: string, heading: string, entries: string}}search_result_container_map
     * @param {{id: string, title: string, date: string, content: string}} search_result_entry_map
     */
    constructor(search_result_container_map: {
        id: string;
        heading: string;
        entries: string;
    }, search_result_entry_map: {
        id: string;
        title: string;
        date: string;
        content: string;
    });
    search_result_container_map: {
        id: string;
        heading: string;
        entries: string;
    };
    search_result_entry_map: {
        id: string;
        title: string;
        date: string;
        content: string;
    };
    search_result_entry: Element;
    search_result_container: HTMLElement;
    added_count: number;
    /**
     * @param { {url: string, title: string, content: string, ii: Array<number>} }
     */
    addSearchResult({ url, title, content, ii }: {
        url: string;
        title: string;
        content: string;
        ii: Array<number>;
    }): void;
    /**
     * @returns {number}
     *  */
    get count(): number;
    /**
     * Add new heading
     * @param {string} msg
     */
    addHeading(msg: string): void;
}
/**
 *
 * @param {string} src
 * @param {Number} n
 * @returns {string}
 */
export function getFirstNChars(src: string, n: number, trailing?: string): string;
/**
 * Check url string represents a valid date
 * @param {string} url
 * @returns {string}
 */
export function startsFromDate(url: string): string;
