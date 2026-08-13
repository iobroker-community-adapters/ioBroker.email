/**
 * The two buttons that add and remove an attachment row.
 *
 * They are inline SVG data URIs rather than files, because the editor loads `admin/blockly.js` as a
 * classic script from the adapter directory - there is no reliable base path to load an image from.
 */
function dataUri(svg: string): string {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/** Blue circle with a plus */
export const PLUS_IMAGE = dataUri(
    '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15">' +
        '<circle cx="7.5" cy="7.5" r="7.5" fill="#5ba3f5"/>' +
        '<path d="M4 7.5h7M7.5 4v7" stroke="#fff" stroke-width="2"/>' +
        '</svg>',
);

/** Red circle with a minus */
export const MINUS_IMAGE = dataUri(
    '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15">' +
        '<circle cx="7.5" cy="7.5" r="7.5" fill="#e57373"/>' +
        '<path d="M4 7.5h7" stroke="#fff" stroke-width="2"/>' +
        '</svg>',
);
