Susan
---

My personal therapist, which I host locally with <a href="https://ollama.com/">Ollama</a>.

System prompt can be found in `susan.model`

Run `make` to geneate new model based on `susan.model`

Chat with model with `ollama run susan`

Serve model with `export OLLAMA_HOST=0.0.0.0:11434 && ollama serve`
