/* Estudo Dirigido de Ciências – 3º ano (Rouxinol Neusa Rocha, 19/11/2026).
 * Textos copiados do documento original, na mesma numeração (inclusive os dois "11" e os dois "12")
 * e com os mesmos erros de digitação do papel.
 * "modelo" = resposta sugerida (NÃO faz parte do documento; aparece só depois de finalizar).
 */
(function (root) {
  'use strict';

  var T = function (html, cls) { return { tipo: 'texto', html: html, cls: cls || '' }; };
  var IMG = function (src, alt, w) { return { tipo: 'figura', src: src, alt: alt || '', w: w }; };
  var LADO = function (esq, dir, pesos) { return { tipo: 'lado', itens: [esq, dir], pesos: pesos || [3, 2] }; };
  var COL = function (blocos) { return { tipo: 'coluna', itens: blocos }; };
  var ABERTA = function (modelo, linhas) { return { tipo: 'aberta', modelo: modelo, linhas: linhas || 3 }; };

  var AMARELO = ['amarelo', '#FFD400'];
  var VERMELHO = ['vermelho', '#E53935'];

  // ---- Q1: vitrine (imagem 1294 x 970) --------------------------------------------------------
  var vitrine = {
    tipo: 'pintar', src: 'img/q1_vitrine.png', w: 1294, h: 970,
    paleta: [AMARELO, VERMELHO],
    regioes: [
      { id: 'microscopio', nome: 'microscópio', ok: 'amarelo', forma: 'elipse', p: [190, 295, 78, 122] },
      { id: 'fone', nome: 'fone de ouvido', ok: 'vermelho', forma: 'poly',
        p: [420, 285, 470, 262, 540, 265, 568, 330, 548, 400, 585, 400, 604, 520, 565, 562, 510, 525, 500, 445, 450, 410, 425, 350] },
      { id: 'lupa', nome: 'lupa', ok: 'amarelo', forma: 'elipse', p: [392, 492, 108, 66] },
      { id: 'binoculo', nome: 'binóculo', ok: 'amarelo', forma: 'elipse', p: [720, 378, 86, 68] },
      { id: 'estetoscopio', nome: 'estetoscópio', ok: 'vermelho', forma: 'poly',
        p: [715, 255, 750, 225, 800, 238, 845, 290, 880, 330, 930, 335, 940, 290, 905, 262, 915, 248, 945, 268, 940, 345, 890, 378, 840, 350, 790, 315, 735, 285] },
      { id: 'oculos', nome: 'óculos', ok: 'amarelo', forma: 'elipse', p: [1035, 372, 92, 42] },
      { id: 'luneta', nome: 'luneta', ok: 'amarelo', forma: 'poly',
        p: [725, 458, 790, 438, 1090, 398, 1115, 412, 1112, 438, 835, 497, 775, 512, 730, 492] }
    ]
  };

  // ---- Q6: quarto (imagem 2005 x 730); a lâmpada foi redesenhada em SVG ------------------------
  var lampada =
    '<g stroke="#000" stroke-linecap="round" fill="none">' +
    '<line x1="853" y1="0" x2="853" y2="160" stroke-width="8"/>' +
    '<circle cx="853" cy="172" r="14" stroke-width="5"/>' +
    '<polygon points="853,186 733,348 973,348" fill="#fff" stroke-width="5" stroke-linejoin="round"/>' +
    '<circle cx="853" cy="372" r="40" fill="#fff" stroke-width="5"/>' +
    '<path d="M833 340 Q853 362 873 340" stroke-width="4"/>' +
    '<line x1="793" y1="420" x2="778" y2="438" stroke-width="5"/>' +
    '<line x1="853" y1="432" x2="853" y2="452" stroke-width="5"/>' +
    '<line x1="913" y1="420" x2="928" y2="438" stroke-width="5"/>' +
    '</g>';
  var quarto = {
    tipo: 'pintar', src: 'img/q6_quarto.png', w: 2005, h: 730, extra: lampada, circular: true,
    paleta: [['amarelo', '#FFD400'], ['laranja', '#FB8C00'], ['vermelho', '#E53935'], ['rosa', '#EC6FA6'],
             ['roxo', '#8E44AD'], ['azul', '#1E88E5'], ['verde', '#43A047'], ['marrom', '#8D5A2B'], ['branco', '#FFFFFF']],
    regioes: [
      { id: 'lampada', nome: 'lâmpada', ok: 'circ', circular: true, forma: 'elipse', p: [853, 265, 150, 232] },
      { id: 'bola', nome: 'bola', forma: 'elipse', p: [295, 505, 135, 135] },
      { id: 'boneco', nome: 'boneco', forma: 'rect', p: [600, 485, 160, 195, 14] },
      { id: 'carro', nome: 'carro', forma: 'rect', p: [1100, 445, 310, 255, 30] },
      { id: 'porta', nome: 'porta', forma: 'rect', p: [1555, 20, 335, 585, 4] }
    ]
  };

  // ---- Q9: banda (imagem 868 x 761) ------------------------------------------------------------
  var banda = {
    tipo: 'pintar', src: 'img/q9_banda.png', w: 868, h: 761,
    paleta: [AMARELO],
    regioes: [
      { id: 'viola', nome: 'viola', ok: 'amarelo', forma: 'poly',
        p: [300, 175, 322, 192, 262, 292, 226, 342, 216, 402, 150, 412, 105, 362, 140, 336, 200, 340, 250, 262] },
      { id: 'teclado', nome: 'teclado', ok: 'amarelo', forma: 'poly',
        p: [268, 345, 557, 345, 557, 388, 490, 400, 515, 650, 470, 662, 430, 540, 355, 662, 305, 656, 400, 522, 375, 400, 268, 388] },
      { id: 'tambor', nome: 'tambor', ok: 'amarelo', forma: 'elipse', p: [262, 506, 78, 96] },
      { id: 'violao', nome: 'violão', ok: 'amarelo', forma: 'poly',
        p: [560, 440, 620, 415, 720, 345, 790, 260, 830, 225, 852, 246, 800, 312, 752, 392, 746, 470, 712, 532, 630, 548, 570, 520, 550, 470] },
      { id: 'chocalho', nome: 'chocalho', ok: 'amarelo', forma: 'elipse', p: [558, 226, 27, 34] }
    ]
  };

  root.QUESTOES = [
    { n: '1', blocos: [
      T('1. Chamamos de <b>sentidos</b> a capacidade de perceber e descobrir o ambiente que nos cerca. Além dos sentidos, ' +
        'para perceber e viver no ambiente, os animais, incluindo o ser humano, também precisam de alguns elementos, ' +
        'como a luz e os sons. Observe a imagem a seguir e faça o que se pede.'),
      LADO(vitrine, COL([
        T('<span class="seta">•</span> Pinte de amarelo os objetos que precisam da luz para auxiliar as pessoas a perceberem o ambiente.'),
        T('<span class="seta">•</span> Pinte de vermelho os objetos que permitem ou auxiliam a percepção dos sons.')
      ]), [3, 1.2])
    ], depois: 'linha' },

    { n: '2', blocos: [
      T('2. A imagem abaixo é a representação de uma pintura que mostra um experimento de Isaac Newton. ' +
        'Nesse experimento, o cientista direcionou a luz solar para um prisma e fez uma importante descoberta quando ' +
        'observou o que acontecia com a luz ao passar pelo prisma.'),
      LADO(IMG('img/q2_newton.png', 'Pintura de Isaac Newton fazendo a luz do Sol passar por um prisma'),
        COL([T('<span class="seta">→</span> Responda em seu caderno: O que Newton percebeu com esse experimento?'),
             ABERTA('Newton percebeu que a luz branca do Sol, ao passar pelo prisma, se separa em várias cores (as cores do arco-íris). ' +
                    'Isso mostra que a luz branca é formada pela união de todas as cores.', 5)]), [3, 1.3])
    ], depois: 'linha' },

    { n: '3', blocos: [
      T('3. Observe as situações e escreva qual sentido é mais diretamente utilizado em cada uma delas.'),
      { tipo: 'arrastar', banco: ['tato', 'visão', 'olfato', 'paladar', 'audição'], itens: [
        { t: 'Perceber que o leite está com cheiro estranho.', ok: 'olfato' },
        { t: 'Identificar o som da campainha.', ok: 'audição' },
        { t: 'Sentir a textura áspera de uma pedra.', ok: 'tato' },
        { t: 'Descobrir se uma fruta é azeda.', ok: 'paladar' },
        { t: 'Observar as cores de um arco-íris.', ok: 'visão' }
      ] }
    ], depois: 'linha' },

    { n: '4', blocos: [
      T('4. Leia as alternativas a seguir e marque com um X apenas as verdadeiras.'),
      { tipo: 'marcar', itens: [
        { t: 'A luz é indispensável para podermos enxergar, ou seja, sem nenhuma luz não podemos visualizar os ambientes e objetos.', ok: true },
        { t: 'Alguns corpos e objetos são fontes luminosas, como o Sol, lâmpadas e lanternas.', ok: true },
        { t: 'Não é possível enxergar objetos que não emitem luz.', ok: false },
        { t: 'Os objetos refletem parte da luz que incide sobre eles.', ok: true },
        { t: 'A luz se propaga em linha reta e em alta velocidade, então quando se depara com um corpo ou objeto, parte dela é absorvida e parte dela é refletida.', ok: true }
      ] }
    ], depois: 'linha' },

    { n: '5', blocos: [
      T('5. Em nossos estudos, vimos que a luz branca é formada pela união entre todas as cores. Pensando nisso, responda em seu caderno:'),
      T('<span class="seta">➢</span> Como enxergarmos a cor dos objetos?', 'recuo'),
      ABERTA('Enxergamos a cor dos objetos porque eles absorvem parte das cores da luz branca e refletem as outras. ' +
             'A cor que o objeto reflete chega aos nossos olhos e é a cor que vemos. Ex.: uma maçã vermelha reflete o vermelho e absorve as demais cores.', 3)
    ], depois: 'tesoura' },

    { n: '6', blocos: [
      T('6. Observe o desenho abaixo que mostra alguns brinquedos deixados em um quarto iluminado. O desenho não mostra as cores ' +
        'dos brinquedos, mas mostra as cores que foram refletidas por cada um dos objetos. Observe com atenção.'),
      quarto,
      T('Usando seus conhecimentos, circule a fonte de luz que ilumina esse ambiente e pinte os brinquedos corretamente.'),
      { tipo: 'sugestao', html: 'A fonte de luz é a <b>lâmpada</b>: é ela que produz a luz que ilumina o quarto. Os brinquedos não produzem luz, ' +
        'só refletem parte da luz que recebem, e a cor que cada um reflete é a cor que enxergamos. (Os brinquedos podem ser pintados com cores diferentes.)' }
    ], depois: 'linha' },

    { n: '7', blocos: [
      T('7. De acordo com nossos estudos, assinale V para as alternativas verdadeiras e F para as falsas.'),
      { tipo: 'escolha', cls: 'vf', itens: [
        { t: 'Os objetos podem ser classificados em opacos, translúcidos ou transparente, de acordo com o comportamento da luz quando incide sobre eles.', op: ['V', 'F'], ok: 0 },
        { t: 'Objetos transparentes são aqueles que não permitem a passagem da luz, por isso não é possível enxergar através deles.', op: ['V', 'F'], ok: 1 },
        { t: 'Corpos e objetos opacos produzem sombras quando a luz incide sobre eles.', op: ['V', 'F'], ok: 0 },
        { t: 'Espelhos são superfícies capazes de refletir a maior parte da luz que incide sobre elas. Por isso, vemos nosso reflexo em um espelho.', op: ['V', 'F'], ok: 0 },
        { t: 'A Lua e a Terra são corpos opacos, por isso produzem sombras quando a luz do Sol incide sobre eles. Essas sombras são chamadas de eclipses.', op: ['V', 'F'], ok: 0 }
      ] }
    ], depois: 'linha' },

    { n: '8', blocos: [
      T('8. Em seu caderno, responda de forma completa:'),
      T('a) Como são formadas as sombras?'),
      ABERTA('As sombras se formam quando a luz encontra um corpo ou objeto opaco, que não deixa a luz passar. A região atrás do objeto fica sem luz: é a sombra.', 3),
      T('b) Qual é a diferença entre o eclipse solar e o eclipse lunar?'),
      ABERTA('No eclipse solar, a Lua fica entre o Sol e a Terra e sua sombra cai sobre a Terra, escondendo o Sol. ' +
             'No eclipse lunar, a Terra fica entre o Sol e a Lua e a sombra da Terra cobre a Lua.', 3)
    ], depois: 'tesoura' },

    { n: '9', blocos: [
      T('9. Observe a imagem abaixo e depois, faça o que se pede.'),
      LADO(banda, COL([
        T('a) Pinte de amarelo os instrumentos que estão produzindo sons.'),
        T('b) Em seu caderno, explique: Como os sons são produzidos?'),
        ABERTA('Os sons são produzidos por vibrações: quando algo vibra (uma corda, a pele do tambor, o ar), faz o ar em volta vibrar, e essa vibração chega aos nossos ouvidos como som.', 4),
        T('c) Imagine que as crianças representadas na imagem estão tocando a mesma música. Os instrumentos estão produzindo o mesmo som? Por quê?'),
        ABERTA('Não. Cada instrumento vibra de um jeito (cordas, pele do tambor, teclas...), por isso cada um produz um som diferente, mesmo tocando a mesma música.', 4),
        T('d) As crianças podem tocar música em qualquer intensidade e em qualquer horário? Por quê?'),
        ABERTA('Não. Sons muito fortes podem machucar os ouvidos e incomodar as outras pessoas, e à noite atrapalham o descanso e o sono de quem mora por perto. É preciso respeitar o silêncio e usar um volume adequado.', 4)
      ]), [1.15, 1])
    ], depois: 'tesoura' },

    { n: '10', blocos: [
      T('10. Dentre os sons abaixo, qual produz uma vibração do ar com maior intensidade? Marque a alternativa <b>correta</b>.'),
      { tipo: 'escolha', cls: 'vertical', itens: [
        { t: '', op: ['O som de uma biblioteca.', 'Um show de rock.', 'Uma conversa entre duas pessoas.', 'O barulho de um carro.'], ok: 1 }
      ] }
    ], depois: 'linha' },

    { n: '11', blocos: [
      T('11. Durante uma tempestade, a luz de um raio chega aos nossos olhos antes do som do trovão chegar aos nossos ouvidos. ' +
        'Em seu caderno, explique por que isso acontece.'),
      ABERTA('Porque a luz viaja muito mais rápido que o som. A luz do raio chega aos nossos olhos quase na mesma hora, e o som do trovão, mais lento, demora mais para chegar aos ouvidos.', 4)
    ], depois: null },

    { n: '12', blocos: [
      T('12. Leia com atenção a notícia abaixo e, depois, responda em seu caderno.'),
      { tipo: 'noticia', titulo: 'Batuqueiros do Silêncio chamam atenção ao tocar em maracatu, no Recife',
        paragrafos: [
          'Quem passa pela Rua da Moeda, endereço movimentado no Bairro do Recife, ouve de longe a batucada das alfaias. ' +
          'Mas esse não é um grupo comum de batuqueiros: eles são alunos de um curso de percussão para surdos. É o projeto O Som da Pele, que existe há quatro anos.',
          '"Eu já havia realizado alguns trabalhos de inclusão, sempre utilizando a música. Com cegos, com crianças com síndrome de Down, com várias pessoas. ' +
          'Percebi que eu também devia explorar essa curiosidade que alguns surdos têm em relação às sensações da música para nós ouvintes", comenta o mestre Batman.'
        ],
        url: 'https://g1.globo.com/pernambuco/carnaval/2013/noticia/2013/02/batuqueiros-surdos-chamam-atencao-ao-tocar-em-maracatu-no-recife.html' },
      T('<span class="seta">➢</span> A notícia que você leu conta sobre um grupo musical formado por pessoas surdas. Como é possível que essas pessoas toquem instrumentos e aprendam música ?', 'recuo'),
      ABERTA('Porque as pessoas surdas sentem as vibrações dos instrumentos (principalmente dos tambores) pelo corpo, pela pele. Assim percebem o ritmo e aprendem música mesmo sem ouvir os sons.', 4)
    ], depois: 'tesoura' },

    { n: '11', blocos: [
      T('13. Observe a imagens abaixo e responda em seu caderno.'),
      LADO(IMG('img/q11_criancas.png', 'Um menino cheirando uma flor e outro menino tapando o nariz e segurando uma meia'),
        COL([
          T('a) Como o ambiente está sendo percebido pelos sentidos das crianças?'),
          ABERTA('As duas crianças percebem o ambiente pelo olfato: o menino da esquerda sente o cheiro bom da flor e o da direita sente o cheiro ruim da meia e tapa o nariz. ' +
                 '(Elas também usam a visão e o tato para ver e segurar a flor e a meia.)', 4),
          T('b) Cite uma situação em que o olfato pode ser usado para nos alertar de um perigo.'),
          ABERTA('Sentir cheiro de gás de cozinha vazando, de fumaça (algo queimando) ou de comida estragada.', 3)
        ]), [1.5, 1])
    ], depois: 'tesoura' },

    { n: '12', blocos: [
      T('14. Em nossos estudos, aprendemos que nossa língua é capaz de perceber diferentes sabores.'),
      T('a) Quais são os 5 sabores que podem ser perebidos pelas nossas papilas gustativas?'),
      ABERTA('Doce, salgado, azedo, amargo e umami.', 3),
      T('b) Cite dois exemplos de alimentos em que cada sabor que você citou na questão anterior estão presentes.'),
      ABERTA('Doce: bolo e sorvete. Salgado: batata frita e queijo. Azedo: limão e laranja. Amargo: café sem açúcar e jiló. Umami: carne e tomate (ou queijo parmesão).', 4)
    ], depois: 'tesoura' },

    { n: '13', blocos: [
      T('15. Observe a imagem e leia o parágrafo abaixo.'),
      LADO(IMG('img/q13_julia.png', 'Menina espirrando, com o nariz entupido'),
        COL([
          T('Júlia acordou espirrando e tossindo e percebeu que seu nariz estava muito entupido. Na hora do almoço, percebeu que estava ' +
            'tendo muita dificuldade para sentir o sabor dos alimentos.'),
          T('<span class="seta">➢</span> Explique: Porque Júlia está tendo dificuldade em sentir o sabor dos alimentos?'),
          ABERTA('Porque o nariz entupido atrapalha o olfato, e o olfato e a língua trabalham juntos para perceber o sabor. ' +
                 'Sem sentir o cheiro dos alimentos, fica mais difícil perceber o seu sabor.', 4)
        ]), [1, 3.2])
    ], depois: null }
  ];
})(window);
