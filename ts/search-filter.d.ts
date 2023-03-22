export class SearchFilter {
    /**
     * @param {string} query
     * @param {{ignore_case: boolean, ignore_accents: boolean, regex: boolean}}
     */
    constructor(query: string, { ignore_case, ignore_accents, regex }: {
        ignore_case: boolean;
        ignore_accents: boolean;
        regex: boolean;
    });
    ignore_case: boolean;
    ignore_accents: boolean;
    regex: boolean;
    /**
    * @param {string} text
    * @returns { {ii: Array<number>, nfkcText: string}} // {IndexText}
    */
    filter: (text: any) => {
        ii: any[];
        nfkcText: any;
    };
}
export namespace SearchFilter {
    const combining_chars_regex: RegExp;
}
