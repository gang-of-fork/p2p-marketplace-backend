export function isValidationError(e: any) {
    return e.path && e.expose && e.status
}