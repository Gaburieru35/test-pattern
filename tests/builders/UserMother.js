import { User } from '../../src/domain/User.js';


export class UserMother {
    static umUsuarioPadrao() {
        return new User(
            1,
            'Usuário Padrão',
            'usuario@teste.com',
            'PADRAO'
        );
    }

    static umUsuarioPremium() {
        return new User(
            2,
            'Usuário Premium',
            'premium@teste.com',
            'PREMIUM'
        );
    }

    // Opcional — cria usuários personalizados com facilidade
    static comDados({ id = 3, nome = 'Usuário Custom', email = 'custom@teste.com', tipo = 'PADRAO' } = {}) {
        return new User(id, nome, email, tipo);
    }
}