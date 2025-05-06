# Makefile – versão sem espaços após as barras

CC       = emcc
SRC      = src/c/dueto_logic.c src/c/ranking.c
OUT_DIR  = src/wasm
OUT_JS   = $(OUT_DIR)/engine.js

CFLAGS = \
  -s WASM=1 \
  -s MODULARIZE=1 \
  -s EXPORT_ES6=1 \
  -s ALLOW_MEMORY_GROWTH=1 \
  -s EXPORTED_FUNCTIONS='["_add_player","_get_ranking","_clear_ranking","_isValidGuess","_checkWordMatch","_getLetterState","_checkSolvedInPrevious","_malloc","_free"]' \
  -s EXPORTED_RUNTIME_METHODS='["cwrap","UTF8ToString","wasmMemory"]'

.PHONY: all clean

all: $(OUT_JS)

$(OUT_JS): $(SRC)
	@mkdir -p $(OUT_DIR)
	$(CC) $(SRC) $(CFLAGS) -o $(OUT_JS)
	@echo "✅  engine.js + engine.wasm gerados em $(OUT_DIR)/"

clean:
	rm -f $(OUT_DIR)/engine.js $(OUT_DIR)/engine.wasm
	@echo "🗑️  artefatos removidos"
