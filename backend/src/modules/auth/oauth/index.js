import googleProvider from "./providers/google.js";
import naverProvider from "./providers/naver.js";

const providers = { google : googleProvider, naver : naverProvider };

export function getProvider(name) {
    const provider = providers[name];
    if (!provider) throw new Error(`Unknown provider: ${name}`);
    return provider;
}