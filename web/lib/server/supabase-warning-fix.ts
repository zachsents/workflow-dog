/*
 * Fixes the fucking annoying warning from Supabase getSession.
 * See: https://github.com/supabase/auth-js/issues/873#issuecomment-2045825828
 * 
 * `Using supabase.auth.getSession() is potentially insecure as it loads data 
 * directly from the storage medium (typically cookies) which may not be 
 * authentic. Prefer using supabase.auth.getUser() instead. To suppress this 
 * warning call supabase.auth.getUser() before you call supabase.auth.getSession().`
 */

const conWarn = console.warn
const conLog = console.log

const IGNORE_WARNINGS = [
    'Using supabase.auth.getSession() is potentially insecure',
    'Using the user object as returned from supabase.auth.getSession()',
]

console.warn = function (...args) {
    const match = args.find((arg) =>
        typeof arg === 'string' ? IGNORE_WARNINGS.find((warning) => arg.includes(warning)) : false,
    )
    if (!match) {
        conWarn(...args)
    }
}

console.log = function (...args) {
    const match = args.find((arg) =>
        typeof arg === 'string' ? IGNORE_WARNINGS.find((warning) => arg.includes(warning)) : false,
    )
    if (!match) {
        conLog(...args)
    }
}