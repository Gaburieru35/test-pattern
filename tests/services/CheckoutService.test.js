import { CarrinhoBuilder } from '../builders/CarrinhoBuilder.js';
import { UserMother } from '../builders/UserMother.js';
import { CheckoutService } from '../../src/services/CheckoutService.js';


describe('quando o pagamento falha', () => {
    test('deve retornar null e não chamar outras dependências', async () => {
        // --- Arrange ---
        const carrinho = new CarrinhoBuilder()
            .comUser(UserMother.umUsuarioPadrao())
            .comItens([{ nome: 'Produto A', preco: 100 }])
            .build();

        // Stub para o GatewayPagamento (simula falha no pagamento)
        const gatewayStub = {
            cobrar: jest.fn().mockResolvedValue({ success: false })
        };

        // dummies para Repository e EmailService
        const repositoryDummy = { salvarPedido: jest.fn() };
        const emailServiceDummy = { enviarConfirmacao: jest.fn() };

        // Instancia o service com as dependências falsas
        const checkoutService = new CheckoutService(
            gatewayStub,
            repositoryDummy,
            emailServiceDummy
        );

        // --- Act ---
        const pedido = await checkoutService.processarPedido(carrinho, { numero: '4111111111111111'});

        // --- Assert ---
        expect(pedido).toBeNull(); // pagamento falhou, pedido não deve existir
        expect(gatewayStub.cobrar).toHaveBeenCalledTimes(1);
        expect(repositoryDummy.salvarPedido).not.toHaveBeenCalled();
        expect(emailServiceDummy.enviarConfirmacao).not.toHaveBeenCalled();
    });
});

describe('quando um cliente Premium finaliza a compra', () => {
    test('deve aplicar desconto de 10% e enviar e-mail de confirmação', async () => {
        // --- Arrange ---
        const usuarioPremium = UserMother.umUsuarioPremium();

        const carrinho = new CarrinhoBuilder()
            .comUser(usuarioPremium)
            .comItens([
                { nome: 'Produto A', preco: 100 },
                { nome: 'Produto B', preco: 100 }
            ])
            .build();

        // Stub: GatewayPagamento (simula sucesso no pagamento)
        const gatewayStub = {
            cobrar: jest.fn().mockResolvedValue({ success: true })
        };

        // Stub: PedidoRepository (simula pedido salvo)
        const repositoryStub = {
            salvar: jest.fn().mockResolvedValue({
                id: 1,
                total: 180,
                user: usuarioPremium
            })
        };

        // Mock: EmailService (iremos verificar comportamento)
        const emailMock = {
            enviarEmail: jest.fn()
        };

        // Service real com dependências falsas
        const checkoutService = new CheckoutService(
            gatewayStub,
            repositoryStub,
            emailMock
        );

        // --- Act ---
        const pedido = await checkoutService.processarPedido(carrinho, { numero: '4111111111111111'});

        // --- Assert ---
        // (1) O desconto de 10% deve ter sido aplicado
        expect(gatewayStub.cobrar).toHaveBeenCalledWith(180, expect.anything());

        // (2) O e-mail deve ter sido enviado corretamente
        expect(emailMock.enviarEmail).toHaveBeenCalledTimes(1);
        expect(emailMock.enviarEmail).toHaveBeenCalledWith(
            'premium@teste.com', // e-mail do usuário premium
            'Seu Pedido foi Aprovado!',
            expect.anything() // corpo ou detalhes do pedido
        );

        // (3) O pedido deve ter sido retornado corretamente
        expect(pedido.total).toBe(180);
    });
});
