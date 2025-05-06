#include <stdlib.h>
#include <string.h>
#include <stdio.h>
#include <emscripten/emscripten.h>

typedef struct Player {
    char name[32];
    int score;
    struct Player* next;
} Player;

static Player* ranking = NULL;
static char ranking_output[1024];  // buffer para exportar como string

// Função 1: adicionar jogador
EMSCRIPTEN_KEEPALIVE
void add_player(const char* name, int score) {
    Player* novo = (Player*)malloc(sizeof(Player));
    strncpy(novo->name, name, sizeof(novo->name) - 1);
    novo->name[sizeof(novo->name) - 1] = '\0';
    novo->score = score;
    novo->next = ranking;
    ranking = novo;
}

// Função auxiliar: divide a lista para merge sort
void split(Player* source, Player** front, Player** back) {
    Player* fast = source->next;
    Player* slow = source;

    while (fast) {
        fast = fast->next;
        if (fast) {
            slow = slow->next;
            fast = fast->next;
        }
    }

    *front = source;
    *back = slow->next;
    slow->next = NULL;
}

// Função auxiliar: merge de duas listas ordenadas
Player* merge(Player* a, Player* b) {
    if (!a) return b;
    if (!b) return a;

    Player* result;
    if (a->score > b->score) {
        result = a;
        result->next = merge(a->next, b);
    } else {
        result = b;
        result->next = merge(a, b->next);
    }
    return result;
}

// Função 2: ordenar ranking com MergeSort
void merge_sort(Player** headRef) {
    Player* head = *headRef;
    if (!head || !head->next) return;

    Player *a, *b;
    split(head, &a, &b);
    merge_sort(&a);
    merge_sort(&b);
    *headRef = merge(a, b);
}

EMSCRIPTEN_KEEPALIVE
void sort_ranking() {
    merge_sort(&ranking);
}

// Função 3: obter ranking como string
EMSCRIPTEN_KEEPALIVE
const char* get_ranking() {
    sort_ranking();  // garante que está ordenado
    Player* curr = ranking;
    char* ptr = ranking_output;
    size_t remaining = sizeof(ranking_output);
    int count = 1;

    ptr[0] = '\0';

    while (curr && remaining > 0) {
        int written = snprintf(ptr, remaining, "%d. %s — %d\n", count++, curr->name, curr->score);
        ptr += written;
        remaining -= written;
        curr = curr->next;
    }

    return ranking_output;
}

// Função 4: liberar memória
EMSCRIPTEN_KEEPALIVE
void clear_ranking() {
    Player* curr = ranking;
    while (curr) {
        Player* temp = curr;
        curr = curr->next;
        free(temp);
    }
    ranking = NULL;
}
