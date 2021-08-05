/**
 * Acts like get member but returns a parsed string of the member
 * @param {string} uid The Member's ID/@
 * @returns {string} A string of the member's ID
 **/
export function formatMember(uid: string): string | null {
    let uidParsed = uid;
    // Check if a member was tagged or not. If the member was tagged remove the
    // Tag from uid.
    if (uid.startsWith("<@") && uid.endsWith(">")) {
        const re = new RegExp("[<@!>]", "g");
        uidParsed = uid.replace(re, "");
    }

    if (uidParsed.length !== 18) {
        return null;
    }
    return uidParsed;

}