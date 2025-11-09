import { Carrinho } from '../../src/domain/Carrinho.js';
import { UserMother } from '../builders/UserMother.js';


export class CarrinhoBuilder {
    constructor() {
        // valores padrão
        this.user = UserMother.umUsuarioPadrao();
        this.itens = [
            { nome: 'Produto Padrão', preco: 50 }
        ];
    }

    comUser(user) {
        this.user = user;
        return this; // método fluente
    }

    comItens(itens) {
        this.itens = itens;
        return this;
    }

    adicionarItem(item) {
        this.itens.push(item);
        return this;
    }

    vazio() {
        this.itens = [];
        return this;
    }

    build() {
        return new Carrinho(this.user, this.itens);
    }
}
