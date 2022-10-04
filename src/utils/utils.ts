import names from './names.json' assert {type: "json"}

export function isValidationError(e: any) {
    return e.path && e.expose && e.status
}

export function getRandomPlantName() {
    return names[Math.floor(Math.random() * names.length)];
}