
/**
 * Estrutura de nó para a lista encadeada
 */
export class WordNode {
  value: string;
  next: WordNode | null;
  
  constructor(value: string) {
    this.value = value;
    this.next = null;
  }
}

/**
 * Lista encadeada para gerenciar a lista de palavras do jogo
 */
export class WordLinkedList {
  head: WordNode | null;
  tail: WordNode | null;
  size: number;
  
  constructor() {
    this.head = null;
    this.tail = null;
    this.size = 0;
  }
  
  /**
   * Adiciona uma palavra no final da lista
   */
  append(word: string): void {
    const newNode = new WordNode(word);
    
    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
    } else if (this.tail) {
      this.tail.next = newNode;
      this.tail = newNode;
    }
    
    this.size++;
  }
  
  /**
   * Adiciona uma palavra no início da lista
   */
  prepend(word: string): void {
    const newNode = new WordNode(word);
    newNode.next = this.head;
    this.head = newNode;
    
    if (!this.tail) {
      this.tail = newNode;
    }
    
    this.size++;
  }
  
  /**
   * Remove uma palavra da lista
   */
  remove(word: string): boolean {
    if (!this.head) return false;
    
    // Caso especial para remoção do head
    if (this.head.value === word) {
      this.head = this.head.next;
      this.size--;
      
      // Se a lista ficar vazia
      if (!this.head) {
        this.tail = null;
      }
      
      return true;
    }
    
    let current = this.head;
    while (current.next) {
      if (current.next.value === word) {
        // Se estamos removendo o tail
        if (current.next === this.tail) {
          this.tail = current;
        }
        
        current.next = current.next.next;
        this.size--;
        return true;
      }
      current = current.next;
    }
    
    return false;
  }
  
  /**
   * Verifica se uma palavra existe na lista
   */
  contains(word: string): boolean {
    let current = this.head;
    
    while (current) {
      if (current.value === word) {
        return true;
      }
      current = current.next;
    }
    
    return false;
  }
  
  /**
   * Retorna uma palavra aleatória da lista
   */
  getRandomWord(exclude?: string): string | null {
    if (!this.head) return null;
    
    // Se só temos uma palavra e ela é a excluída
    if (this.size === 1 && this.head.value === exclude) return null;
    
    let randomWord: string;
    do {
      // Selecionar um índice aleatório
      const randomIndex = Math.floor(Math.random() * this.size);
      
      // Percorrer até o índice escolhido
      let current = this.head;
      let index = 0;
      
      while (current && index < randomIndex) {
        current = current.next;
        index++;
      }
      
      randomWord = current?.value || '';
    } while (randomWord === exclude);
    
    return randomWord;
  }
  
  /**
   * Converter array em lista encadeada
   */
  static fromArray(words: string[]): WordLinkedList {
    const list = new WordLinkedList();
    
    for (const word of words) {
      list.append(word);
    }
    
    return list;
  }
  
  /**
   * Converter lista em array
   */
  toArray(): string[] {
    const result: string[] = [];
    let current = this.head;
    
    while (current) {
      result.push(current.value);
      current = current.next;
    }
    
    return result;
  }
}
