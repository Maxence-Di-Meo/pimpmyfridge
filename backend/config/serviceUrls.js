const normalizeBaseUrl = (value, fallback) => (value || fallback).replace(/\/+$/, "");

module.exports = {
	backendBaseUrl: normalizeBaseUrl(process.env.BACKEND_BASE_URL, `http://localhost:${process.env.PORT || 5001}`),
	ollamaBaseUrl: normalizeBaseUrl(process.env.OLLAMA_BASE_URL, "http://ollama-ai:11434"),
};
