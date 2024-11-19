export function CreateRandom(length = 32) {
    const byteLength = Math.ceil(length / 2);
    const array = new Uint8Array(byteLength);
    
    window.crypto.getRandomValues(array);

    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('').slice(0, length);
}