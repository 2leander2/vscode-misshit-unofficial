export function showHiddenChars(str: string): string {
    return str
        .replace(/ /g, '␣')
        .replace(/\t/g, '␉')
        .replace(/\n/g, '␊')
        .replace(/\r/g, '␍')
        .replace(/\f/g, '␌')
        .replace(/\v/g, '␋')
        .replace(/\u00A0/g, '⍽')
        .replace(/\u200B/g, '[ZWSP]')
        .replace(/\u2028/g, '[LS]')
        .replace(/\u2029/g, '[PS]');
}
