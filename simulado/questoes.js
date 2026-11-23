/* Banco de questões do simulado digital (45 questões, 1,0 ponto cada).
 * Para mudar uma questão, edite aqui e recarregue a página (F5).
 * Tipos de bloco: veja o comentário no topo de corretor.js.
 */
(function (root) {
  'use strict';

  // ------------------------------------------------------------ atalhos
  var T = function (html) { return { tipo: 'texto', html: html }; };
  var CURIO = function (html) { return { tipo: 'curio', html: html }; };
  var FIG = function (svg) { return { tipo: 'figura', svg: svg }; };
  var MARCAR = function (itens, cols) {
    return { tipo: 'marcar', cols: cols || 2, itens: itens.map(function (x) { return { t: x[0], ok: x[1] }; }) };
  };
  // escolha de uma única pergunta (opções em lista vertical)
  var ESC = function (pergunta, op, ok, opts) {
    var b = { tipo: 'escolha', vertical: true, itens: [{ t: pergunta || '', op: op, ok: ok }] };
    if (opts) for (var k in opts) b[k] = opts[k];
    return b;
  };
  // várias linhas, cada uma com suas opções lado a lado
  var ESCL = function (linhas, op, extra) {
    return Object.assign({
      tipo: 'escolha',
      itens: linhas.map(function (l) { return { t: l[0], op: l[2] || op, ok: l[1] }; })
    }, extra || {});
  };
  var VF = function (frases) {
    return ESCL(frases.map(function (f) { return [f[0], f[1] ? 0 : 1]; }), ['V', 'F'], { cls: 'vf' });
  };
  var CE = function (frases) {
    return ESCL(frases.map(function (f) { return [f[0], f[1] ? 0 : 1]; }), ['C (certa)', 'E (errada)'], { cls: 'vf' });
  };
  var ARR = function (banco, linhas) { return { tipo: 'arrastar', banco: banco, linhas: linhas }; };
  var AMOSTRA = function (cor) { return '<span class="amostra" style="background:' + cor + '"></span>'; };

  // ------------------------------------------------------------ desenhos (SVG)
  var svgSombra = function () {
    return '<svg viewBox="0 0 400 150" class="fig">' +
      '<line x1="0" y1="138" x2="400" y2="138" stroke="#999"/>' +
      '<rect x="330" y="3" width="55" height="135" fill="#EFE7DA" stroke="#8C7A63"/>' +
      '<text x="357" y="150" font-size="11" text-anchor="middle">parede</text>' +
      '<polygon points="62,78 62,62 330,128 330,10" fill="#FFF3B0"/>' +
      '<rect x="10" y="62" width="40" height="16" fill="#5A6B7B" stroke="#000"/>' +
      '<polygon points="50,80 62,86 62,54 50,60" fill="#8A9BAB" stroke="#000"/>' +
      '<text x="30" y="98" font-size="11" text-anchor="middle">lanterna</text>' +
      '<circle cx="185" cy="70" r="22" fill="#E8483C" stroke="#000"/>' +
      '<text x="185" y="104" font-size="11" text-anchor="middle">bola</text></svg>';
  };

  var miniParede = function (conteudo, fundo) {
    return '<svg viewBox="0 0 120 90" class="mini"><rect x="2" y="2" width="116" height="86" rx="4" fill="' +
      (fundo || '#EFE7DA') + '" stroke="#8C7A63"/>' + conteudo + '</svg>';
  };
  var opSombraBaixa = miniParede('<circle cx="60" cy="68" r="14" fill="#3a3a3a"/>');
  var opSombraCerta = miniParede('<circle cx="60" cy="45" r="16" fill="#3a3a3a"/>');
  var opManchaClara = miniParede('<circle cx="60" cy="45" r="16" fill="#FFF3B0" stroke="#F2B705"/>', '#555');

  var svgEclipse = function (ordem) {
    var s = '<svg viewBox="0 0 400 70" class="fig"><rect width="400" height="70" fill="#1F2A44" rx="6"/>' +
      '<circle cx="40" cy="35" r="30" fill="#FFC93C" stroke="#F29F05"/>' +
      '<text x="40" y="39" font-size="12" font-weight="bold" text-anchor="middle">Sol</text>';
    var pos = {}; pos[ordem[0]] = 210; pos[ordem[1]] = 330;
    Object.keys(pos).forEach(function (nome) {
      var x = pos[nome];
      if (nome === 'Terra') {
        s += '<circle cx="' + x + '" cy="35" r="18" fill="#3E8EDE" stroke="#2D6B3C" stroke-width="2"/>' +
          '<text x="' + x + '" y="64" font-size="11" fill="#fff" text-anchor="middle">Terra</text>';
      } else {
        s += '<circle cx="' + x + '" cy="35" r="8" fill="#C9C9C9"/>' +
          '<text x="' + x + '" y="58" font-size="11" fill="#fff" text-anchor="middle">Lua</text>';
      }
    });
    return s + '</svg>';
  };

  var svgTelefone = function () {
    return '<svg viewBox="0 0 400 70" class="fig">' +
      '<polygon points="60,20 60,50 30,56 30,14" fill="#F2D16B" stroke="#000"/>' +
      '<polygon points="340,20 340,50 370,56 370,14" fill="#F2D16B" stroke="#000"/>' +
      '<line x1="60" y1="35" x2="340" y2="35" stroke="#8C6A3C" stroke-width="2"/>' +
      '<text x="200" y="26" font-size="11" text-anchor="middle">fio esticado</text></svg>';
  };

  var svgCopos = function () {
    var s = '<svg viewBox="0 0 400 100" class="fig">';
    [10, 25, 40, 55].forEach(function (nv, i) {
      var x = 50 + i * 85;
      s += '<rect x="' + x + '" y="' + (75 - nv) + '" width="40" height="' + nv + '" fill="#9ED3F5"/>' +
        '<polyline points="' + x + ',15 ' + x + ',75 ' + (x + 40) + ',75 ' + (x + 40) + ',15" fill="none" stroke="#5B6B7B" stroke-width="2"/>' +
        '<text x="' + (x + 20) + '" y="92" font-size="11" text-anchor="middle">copo ' + (i + 1) + '</text>';
    });
    return s + '</svg>';
  };

  var SEC = {
    luz: { nome: 'Luz', icone: '💡', sub: 'Fontes luminosas, cores, sombras, eclipses e objetos opacos, translúcidos e transparentes' },
    som: { nome: 'Som', icone: '🎵', sub: 'Vibrações, a orelha, a intensidade dos sons e cuidados com a audição' },
    nariz: { nome: 'Nariz', icone: '👃', sub: 'O nariz é o órgão do olfato: sentimos cheiros bons, ruins e de perigo' },
    lingua: { nome: 'Língua', icone: '👅', sub: 'A língua é o órgão da gustação: doce, salgado, azedo, amargo e umami' }
  };

  var Q = [];
  var q = function (sec, blocos, expl) { Q.push({ sec: sec, blocos: blocos, expl: expl }); };

  // ================================================================= LUZ
  q('luz', [
    T('Os corpos que <b>emitem</b> (produzem) luz são chamados de <b>fontes luminosas</b>. Marque apenas as fontes luminosas.'),
    MARCAR([['Sol', true], ['Lua', false], ['lâmpada acesa', true], ['espelho', false], ['vaga-lume', true],
            ['fogueira', true], ['livro', false], ['lanterna acesa', true], ['vela acesa', true], ['cadeira', false]], 3)
  ], 'Sol, lâmpada acesa, vaga-lume, fogueira, lanterna acesa e vela acesa. Atenção: a <b>Lua</b>, o <b>espelho</b>, o <b>livro</b> e a <b>cadeira</b> NÃO são fontes luminosas — eles apenas refletem a luz.');

  q('luz', [
    T('Complete as frases arrastando as palavras do banco.'),
    ARR(['absorvida', 'refletida', 'olhos', 'luz'], [
      ['a) Para enxergar um objeto, é preciso que exista ', { ok: 'luz' }, ' no ambiente.'],
      ['b) Quando a luz atinge um objeto, uma parte dela é ', { aceita: ['absorvida', 'refletida'], grupo: 'b' },
       ' e outra parte é ', { aceita: ['absorvida', 'refletida'], grupo: 'b' }, '.'],
      ['c) Quando a luz refletida chega aos nossos ', { ok: 'olhos' }, ', conseguimos enxergar o objeto.']
    ])
  ], 'a) luz; b) absorvida / refletida (a ordem pode ser trocada); c) olhos.');

  q('luz', [
    T('O cientista <b>Isaac Newton</b> fez a luz do Sol atravessar um pedaço de vidro triangular chamado <b>prisma</b>. O que ele descobriu?'),
    ESC('', ['A luz do Sol desaparece dentro do prisma.', 'A luz branca do Sol é formada por várias cores.',
             'O prisma produz luz sozinho, mesmo no escuro.', 'A luz do Sol é formada só pela cor amarela.'], 1)
  ], 'A luz branca do Sol é formada por várias cores (ela se <b>decompõe</b>, ou seja, se separa, ao passar pelo prisma).');

  q('luz', [
    T('Depois de uma chuva, quando o Sol aparece, às vezes vemos um <b>arco-íris</b>. As gotinhas de água no ar funcionam como pequenos prismas. Complete a explicação de por que o arco-íris tem tantas cores.'),
    ARR(['decompõe', 'cores', 'apaga', 'sombras'], [
      ['A luz branca do Sol atravessa as gotinhas de água e se ', { ok: 'decompõe' }, ' (se separa) nas várias ', { ok: 'cores' }, ' que a formam.']
    ])
  ], 'A luz branca do Sol atravessa as gotinhas de água e se decompõe (se separa) nas várias cores que a formam, assim como no prisma de Newton.');

  q('luz', [
    T('Ligue cada objeto ao que acontece com a luz que chega nele (arraste a frase até o objeto).'),
    ARR(['Reflete principalmente a luz verde.', 'Reflete todas as cores da luz.', 'Absorve a maior parte da luz.', 'Reflete principalmente a luz vermelha.'], [
      ['<b>Camiseta branca</b> →', { ok: 'Reflete todas as cores da luz.' }],
      ['<b>Camiseta preta</b> →', { ok: 'Absorve a maior parte da luz.' }],
      ['<b>Maçã vermelha</b> →', { ok: 'Reflete principalmente a luz vermelha.' }],
      ['<b>Folha verde</b> →', { ok: 'Reflete principalmente a luz verde.' }]
    ])
  ], 'Camiseta branca → reflete todas as cores; camiseta preta → absorve a maior parte da luz; maçã vermelha → reflete principalmente a luz vermelha; folha verde → reflete principalmente a luz verde.');

  q('luz', [
    T('Num dia de muito sol, Samuel vai brincar no parque. Ele pode escolher uma camiseta <b>branca</b> ou uma camiseta <b>preta</b>.'),
    ESCL([['Qual camiseta vai esquentar <b>menos</b>?', 0]], ['Camiseta branca', 'Camiseta preta']),
    ESC('Por quê?', ['Porque a branca reflete quase toda a luz.', 'Porque a branca absorve quase toda a luz.',
                     'Porque a preta reflete quase toda a luz.'], 0)
  ], 'A camiseta <b>branca</b>, porque ela reflete quase toda a luz. A preta absorve a maior parte da luz, e a luz absorvida esquenta a roupa.');

  var OTT = ['OP — opaco', 'TL — translúcido', 'TR — transparente'];
  q('luz', [
    T('Classifique cada objeto: <b>opaco</b> (OP), <b>translúcido</b> (TL) ou <b>transparente</b> (TR).'),
    ESCL([['vidro da janela', 2], ['porta de madeira', 0], ['papel manteiga', 1], ['parede de tijolo', 0],
          ['copo de vidro liso', 2], ['lustre de vidro leitoso', 1], ['livro', 0], ['água limpa no copo', 2],
          ['box de banheiro fosco', 1]], OTT, { cls: 'tabela' })
  ], 'Vidro da janela – TR; porta de madeira – OP; papel manteiga – TL; parede de tijolo – OP; copo de vidro liso – TR; lustre de vidro leitoso – TL; livro – OP; água limpa – TR; box fosco – TL. Lembrete: opaco não deixa a luz passar; translúcido deixa passar só uma parte; transparente deixa passar a luz e dá para ver através dele.');

  q('luz', [
    T('Samuel apontou uma lanterna acesa para uma bola, perto de uma parede.'),
    FIG(svgSombra()),
    T('<b>a)</b> Qual desenho mostra a sombra da bola na parede?'),
    ESCL([['', 1]], [opSombraBaixa, opSombraCerta, opManchaClara], { cls: 'figuras' }),
    ESC('<b>b)</b> Por que a sombra se formou?',
        ['A luz anda em linha reta e a bola, que é opaca, não deixa a luz passar.',
         'A bola produz escuridão sozinha.', 'A parede apaga a luz.'], 0),
    ESCL([['<b>c)</b> Se Samuel <b>aproximar</b> a lanterna da bola, a sombra na parede vai ficar:', 0]],
         ['maior', 'menor', 'do mesmo tamanho'])
  ], 'a) Um círculo escuro na parede, na mesma altura da bola. b) A luz se propaga em linha reta; a bola é um objeto opaco e não deixa a luz passar, então atrás dela fica uma região sem luz: a sombra. c) <b>Maior</b> (quanto mais perto a fonte de luz está do objeto, maior a sombra).');

  q('luz', [
    T('Verdadeiro (V) ou falso (F)?'),
    VF([['A luz se propaga em linha reta.', true],
        ['Objetos transparentes, como o vidro da janela, formam sombras bem escuras.', false],
        ['Os espelhos refletem a maior parte da luz que chega neles. Por isso vemos nosso reflexo.', true],
        ['Num quarto totalmente escuro, sem nenhuma luz, conseguimos ver as cores dos brinquedos.', false],
        ['A Lua não produz luz própria: ela reflete a luz do Sol.', true]])
  ], 'V – F – V – F – V.');

  var ECL = ['Eclipse do Sol', 'Eclipse da Lua'];
  q('luz', [
    T('Observe os desenhos. Em cada um, é um <b>eclipse do Sol</b> ou um <b>eclipse da Lua</b>?'),
    T('<b>Desenho A</b>'), FIG(svgEclipse(['Lua', 'Terra'])), ESCL([['Desenho A é um...', 0]], ECL),
    T('<b>Desenho B</b>'), FIG(svgEclipse(['Terra', 'Lua'])), ESCL([['Desenho B é um...', 1]], ECL),
    ESCL([['No eclipse da Lua, quem fica entre o Sol e a Lua?', 0]], ['Terra', 'Lua', 'Estrela'])
  ], 'Desenho A: eclipse do Sol (a Lua passa entre o Sol e a Terra). Desenho B: eclipse da Lua (a Terra passa entre o Sol e a Lua). Quem fica no meio no eclipse da Lua é a <b>Terra</b>.');

  q('luz', [
    ARR(['azul', 'amarela', 'vermelha', 'verde', 'laranja', 'roxo', 'rosa', 'marrom'], [
      ['As cores <b>primárias</b> das tintas são: ', { aceita: ['azul', 'amarela', 'vermelha'], grupo: 'p' }, ', ',
       { aceita: ['azul', 'amarela', 'vermelha'], grupo: 'p' }, ' e ', { aceita: ['azul', 'amarela', 'vermelha'], grupo: 'p' }, '.'],
      ['Agora arraste a cor que aparece quando misturamos as tintas:'],
      [AMOSTRA('#FFD500') + ' amarela + ' + AMOSTRA('#2F6FD6') + ' azul =', { ok: 'verde' }],
      [AMOSTRA('#FFD500') + ' amarela + ' + AMOSTRA('#E0302A') + ' vermelha =', { ok: 'laranja' }],
      [AMOSTRA('#2F6FD6') + ' azul + ' + AMOSTRA('#E0302A') + ' vermelha =', { ok: 'roxo' }]
    ])
  ], 'Azul, amarela e vermelha. Amarela + azul = <b>verde</b>; amarela + vermelha = <b>laranja</b>; azul + vermelha = <b>roxo</b>.');

  q('luz', [
    T('À noite, ciclistas e garis usam roupas com <b>faixas refletivas</b>. Quando a luz do farol de um carro chega nessas faixas, elas brilham muito. Por que essas faixas ajudam a evitar acidentes?'),
    ESC('', ['Porque elas produzem luz própria, como uma lâmpada.',
             'Porque elas refletem a luz do farol de volta para os olhos do motorista, que enxerga a pessoa de longe.',
             'Porque elas absorvem toda a luz do farol.',
             'Porque elas fazem barulho quando o carro chega.'], 1)
  ], 'Porque elas refletem a luz do farol de volta para os olhos do motorista. Assim ele enxerga a pessoa de longe, mesmo no escuro. (As faixas não produzem luz: elas refletem.)');

  // ================================================================= SOM
  q('som', [
    ESCL([['<b>a)</b> O som é produzido por:', 1]], ['luz', 'vibrações', 'cheiros', 'cores']),
    T('<b>b)</b> Se colocarmos um balão esticado em cima de uma caixa de som, quando ligamos o som, os grãos de açúcar começam a pular. Por quê?'),
    ESC('', ['O açúcar ficou com medo do barulho.', 'O som fez o ar e o balão vibrarem.',
             'A luz da caixa de som empurrou o açúcar.', 'Entrou vento pela janela.'], 1)
  ], 'a) vibrações. b) O som fez o ar e o balão vibrarem — e a vibração fez o açúcar pular.');

  q('som', [
    T('Experimente em casa: segure uma régua na beira da mesa, com uma parte para fora, e dê um "peteleco" na ponta.'),
    ESC('<b>a)</b> O que acontece com a régua?', ['Ela fica paradinha.', 'Ela vibra (balança bem rápido) e faz som.'], 1),
    ESCL([['<b>b)</b> Quando a régua para de vibrar, o que acontece com o som?', 1]], ['Fica mais alto.', 'O som acaba.'])
  ], 'a) Ela vibra e faz som. b) O som acaba — sem vibração, não há som.');

  q('som', [
    T('Os objetos que produzem som são chamados de <b>fontes sonoras</b>. Marque as fontes sonoras.'),
    MARCAR([['violão tocando', true], ['sino batendo', true], ['travesseiro', false], ['voz de uma pessoa', true],
            ['pedra parada', false], ['rádio ligado', true], ['apito', true], ['cadeira parada', false]], 3)
  ], 'Violão tocando, sino batendo, voz de uma pessoa, rádio ligado e apito.');

  q('som', [
    T('Complete as frases sobre a audição arrastando as palavras do banco.'),
    ARR(['orelha', 'canal auditivo', 'vibrar', 'membrana timpânica'], [
      ['a) A ', { ok: 'orelha' }, ' é o órgão que capta o som.'],
      ['b) O som entra pelo ', { ok: 'canal auditivo' }, '.'],
      ['c) O som faz ', { ok: 'vibrar' }, ' a ', { ok: 'membrana timpânica' }, ', que leva as vibrações para dentro da orelha.']
    ])
  ], 'orelha – canal auditivo – vibrar – membrana timpânica.');

  q('som', [
    T('Coloque os sons em ordem, do <b>mais fraco</b> ao <b>mais forte</b> (arraste cada som até o número).'),
    ARR(['conversa normal', 'show de rock', 'murmúrio (cochicho)', 'veículo pesado (caminhão, trator)', 'biblioteca', 'pressão do ar', 'decibéis', 'metros', 'graus'], [
      ['<b>1º</b> (mais fraco)', { ok: 'murmúrio (cochicho)' }],
      ['<b>2º</b>', { ok: 'biblioteca' }],
      ['<b>3º</b>', { ok: 'conversa normal' }],
      ['<b>4º</b>', { ok: 'veículo pesado (caminhão, trator)' }],
      ['<b>5º</b> (mais forte)', { ok: 'show de rock' }],
      ['A intensidade dos sons é medida em:', { ok: 'decibéis' }]
    ])
  ], 'Murmúrio = 1; biblioteca = 2; conversa normal = 3; veículo pesado = 4; show de rock = 5. A intensidade é medida em <b>decibéis</b>.');

  q('som', [
    T('Pensando na saúde dos ouvidos e na <b>poluição sonora</b>, as atitudes abaixo são certas (C) ou erradas (E)?'),
    CE([['Ouvir música no fone, no volume máximo, por várias horas.', false],
        ['Usar protetor de ouvido em lugares muito barulhentos.', true],
        ['Respeitar o horário de silêncio à noite.', true],
        ['Gritar dentro da sala de aula.', false],
        ['Diminuir o volume da TV quando alguém está dormindo.', true]]),
    T('O que pode acontecer com quem fica muito tempo perto de sons muito altos? Marque o que pode acontecer.'),
    MARCAR([['dor de cabeça', true], ['irritação', true], ['perda da audição (surdez)', true],
            ['ouvir cada vez melhor', false], ['ficar mais forte', false]], 2)
  ], 'E – C – C – E – C. Sons muito altos por muito tempo podem causar dor de cabeça, irritação e até surdez (perda da audição) parcial ou total.');

  q('som', [
    T('Durante uma tempestade, vemos o clarão do <b>raio</b> antes de ouvir o barulho do <b>trovão</b>. Por quê?'),
    ESC('', ['O trovão acontece muito tempo depois do raio.', 'A luz é muito mais rápida que o som.',
             'Nossos olhos funcionam melhor que nossas orelhas.', 'O som anda em zigue-zague.'], 1),
    CURIO('Se você contar os segundos entre o clarão e o trovão, descobre se a tempestade está perto ou longe: quanto <b>mais</b> segundos, <b>mais longe</b> ela está!'),
    T('Bia contou 2 segundos. Léo, em outro dia, contou 10 segundos.'),
    ESCL([['Qual tempestade estava <b>mais longe</b>?', 1]], ['A da Bia (2 segundos)', 'A do Léo (10 segundos)'])
  ], 'A luz é muito mais rápida que o som. A tempestade do <b>Léo</b> (10 segundos) estava mais longe.');

  q('som', [
    T('Lucas tem <b>deficiência auditiva</b> (não ouve bem), mas toca na banda da escola.'),
    ESC('<b>a)</b> Como ele consegue perceber a música?',
        ['Ele sente a vibração do som no corpo e imita os movimentos do professor.',
         'Ele escuta tudo igual a todo mundo.', 'Ele não percebe nada da música.'], 0),
    ESCL([['<b>b)</b> Qual instrumento é melhor para ele, porque vibra mais forte?', 0]], ['tambor', 'flauta doce'])
  ], 'a) Ele sente a vibração do som no corpo e também imita os movimentos do professor. b) Tambor.');

  q('som', [
    T('Observe o <b>telefone com fio</b>, feito com dois copos e um barbante.'),
    FIG(svgTelefone()),
    ESCL([['<b>a)</b> O que leva a voz de um copo até o outro?', 1]], ['a luz', 'a vibração que passa pelo fio', 'o cheiro']),
    ESCL([['<b>b)</b> Se o fio ficar frouxo (mole), o amigo do outro lado vai ouvir:', 1]], ['melhor', 'pior'])
  ], 'a) A vibração que passa pelo fio. b) Pior — o fio precisa ficar esticado para a vibração passar bem.');

  q('som', [
    T('Samuel bateu com uma colher em 4 copos iguais, cada um com uma quantidade diferente de água.'),
    FIG(svgCopos()),
    ESCL([['Os 4 copos fizeram o mesmo som?', 1]], ['Sim', 'Não']),
    ESC('Por quê?', ['A quantidade de água muda o jeito como cada copo vibra.',
                     'Porque os copos têm cores diferentes.', 'Porque a colher mudou de tamanho.'], 0)
  ], 'Não. A quantidade de água muda o jeito como cada copo vibra, por isso cada um faz um som diferente. (Foi assim que fizemos o instrumento musical com água e copos.)');

  q('som', [
    CURIO('Quando gritamos perto de uma montanha ou dentro de um salão vazio, às vezes ouvimos nossa voz de novo: é o <b>eco</b>. O eco acontece quando o som bate em um obstáculo e volta. O <b>morcego</b> voa no escuro fazendo sons e escutando o eco que volta das coisas — assim ele não bate em nada!'),
    ESC('<b>a)</b> O que é o eco?', ['Um som que bate em um obstáculo e volta.', 'Uma luz muito forte.', 'Um cheiro que viaja pelo ar.'], 0),
    ESCL([['<b>b)</b> No escuro, de olhos fechados, conseguimos saber de onde vem um som?', 0]], ['Sim', 'Não']),
    T('Marque os sons que conseguimos reconhecer sem ver:'),
    MARCAR([['buzina', true], ['sirene', true], ['canto de passarinho', true], ['campainha', true],
            ['latido do cachorro', true], ['a cor do carro', false], ['uma pedra parada', false], ['o cheiro do bolo', false]], 2)
  ], 'a) Um som que bate em um obstáculo e volta. b) Sim. Sons como buzina, sirene, canto de passarinho, campainha e latido do cachorro a gente reconhece sem ver. Cor, pedra parada e cheiro não são sons.');

  // ================================================================= NARIZ
  q('nariz', [
    T('Ligue cada parte do corpo ao sentido correspondente (arraste o sentido até a parte do corpo).'),
    ARR(['tato', 'audição', 'olfato', 'visão', 'gustação (paladar)'], [
      ['<b>nariz</b> →', { ok: 'olfato' }], ['<b>língua</b> →', { ok: 'gustação (paladar)' }],
      ['<b>olhos</b> →', { ok: 'visão' }], ['<b>orelhas</b> →', { ok: 'audição' }], ['<b>pele</b> →', { ok: 'tato' }]
    ])
  ], 'Nariz → olfato; língua → gustação (paladar); olhos → visão; orelhas → audição; pele → tato.');

  q('nariz', [
    T('Complete arrastando as palavras do banco.'),
    ARR(['olfato', 'gustação', 'paladar'], [
      ['O nariz é o órgão do ', { ok: 'olfato' }, '. A língua é o órgão da ', { ok: 'gustação' },
       ', que também é chamada de ', { ok: 'paladar' }, '.']
    ])
  ], 'olfato – gustação – paladar.');

  var SENT = ['olfato', 'audição', 'gustação', 'tato', 'visão'];
  q('nariz', [
    T('Qual sentido é mais usado em cada situação?'),
    ESCL([['a) Sentir o cheirinho de pipoca vindo da cozinha.', 0], ['b) Perceber que o lixo está fedendo.', 0],
          ['c) Ouvir o latido do cachorro.', 1], ['d) Perceber que o suco está doce.', 2],
          ['e) Sentir que o chão está gelado.', 3], ['f) Ver a cor do semáforo.', 4]], SENT, { cls: 'tabela' })
  ], 'a) olfato; b) olfato; c) audição; d) gustação/paladar; e) tato; f) visão.');

  q('nariz', [
    T('O olfato também nos <b>protege</b>. Marque as situações em que o nariz nos avisa de um perigo.'),
    MARCAR([['cheiro de fumaça ou de queimado', true], ['cheiro de bolo assando', false],
            ['leite com cheiro azedo', true], ['cheiro de gás de cozinha', true],
            ['perfume de uma flor', false], ['comida estragada na geladeira', true]], 2)
  ], 'Fumaça/queimado, leite com cheiro azedo, cheiro de gás de cozinha e comida estragada.');

  q('nariz', [
    CURIO('O gás de cozinha, na verdade, <b>não tem cheiro</b>! As empresas colocam nele um cheiro forte e ruim de propósito.'),
    ESC('<b>a)</b> Por que colocam esse cheiro no gás?',
        ['Para as pessoas perceberem o vazamento pelo olfato e se protegerem.', 'Para o gás ficar mais barato.',
         'Para o gás ter uma cor mais bonita.'], 0),
    T('<b>b)</b> Se você sentir cheiro de gás em casa, o que deve fazer? Marque as atitudes certas.'),
    MARCAR([['Avisar um adulto imediatamente.', true], ['Acender um fósforo para ver melhor.', false],
            ['Abrir portas e janelas.', true], ['Ligar o interruptor da luz.', false]], 2)
  ], 'a) Para que as pessoas percebam o vazamento pelo olfato e possam se proteger. b) Avisar um adulto e abrir portas e janelas. (Nunca acender fogo nem mexer em interruptores.)');

  q('nariz', [
    T('O cachorro tem o olfato muito mais forte que o nosso. Por isso, alguns cães trabalham junto com os bombeiros e a polícia. Marque as tarefas em que o cão usa o nariz para ajudar as pessoas.'),
    MARCAR([['encontrar pessoas perdidas ou presas em escombros', true], ['achar objetos escondidos', true],
            ['farejar e seguir pistas', true], ['ler o jornal para os bombeiros', false],
            ['ver a cor dos semáforos', false]], 1)
  ], 'Encontrar pessoas perdidas ou presas em escombros, achar objetos escondidos e farejar/seguir pistas.');

  q('nariz', [
    T('Igor estava resfriado, com o nariz entupido. No aniversário da vovó, ele quase não sentiu o sabor do bolo de cenoura. Por que isso aconteceu?'),
    ESC('', ['Porque o olfato e o paladar trabalham juntos: sem sentir o cheiro, o sabor ficou fraco.',
             'Porque o bolo estava sem açúcar.', 'Porque a língua do Igor parou de funcionar.',
             'Porque o resfriado tira a visão.'], 0)
  ], 'Porque o olfato e o paladar trabalham juntos. Com o nariz entupido, Igor não sentia o cheiro do bolo, então o sabor ficou fraco.');

  q('nariz', [
    T('Na atividade do <b>degustador</b>, um colega de olhos vendados provou uma maçã enquanto outro colega segurava uma <b>cebola</b> bem perto do nariz dele. O que provavelmente aconteceu?'),
    ESC('', ['Ele sentiu o gosto da maçã bem forte.', 'Ele se confundiu e achou que estava comendo cebola.',
             'Ele não sentiu nada, nem cheiro nem gosto.'], 1)
  ], 'Ele se confundiu e achou que estava comendo cebola — o cheiro forte da cebola "misturou" com o sabor da maçã.');

  q('nariz', [
    T('Verdadeiro (V) ou falso (F)?'),
    VF([['O nariz serve para respirar e para sentir cheiros.', true], ['O olfato só sente cheiros bons.', false],
        ['Quando estamos resfriados, sentimos melhor os cheiros.', false],
        ['O cheiro gostoso de uma comida pode nos dar vontade de comer.', true],
        ['Os pelinhos e o muco (catarro) do nariz ajudam a segurar a poeira do ar.', true]])
  ], 'V – F – F – V – V.');

  q('nariz', [
    T('Cuidados com o nariz: marque as atitudes corretas.'),
    MARCAR([['Assoar o nariz com um lenço e lavar as mãos depois.', true], ['Colocar objetos pequenos dentro do nariz.', false],
            ['Cobrir o nariz e a boca com o braço ao espirrar.', true], ['Limpar o nariz com a mão e depois pegar nos colegas.', false]], 1)
  ], 'Assoar com lenço e lavar as mãos; cobrir nariz e boca com o braço ao espirrar.');

  q('nariz', [
    T('Cada cheiro abaixo é, para a maioria das pessoas, <b>gostoso</b> ou <b>ruim</b>?'),
    ESCL([['pão quentinho', 0], ['lixo', 1], ['flor', 0], ['ovo podre', 1], ['bolo assando', 0], ['chulé', 1],
          ['perfume', 0], ['fumaça', 1]], ['gostoso', 'ruim'], { cls: 'tabela' })
  ], 'Gostosos: pão quentinho, flor, bolo assando, perfume. Ruins: lixo, ovo podre, chulé, fumaça.');

  // ================================================================= LÍNGUA
  var SABORES = ['doce', 'salgado', 'azedo', 'amargo', 'umami'];
  q('lingua', [
    T('Quais são os <b>5 sabores</b> que a nossa língua consegue perceber? Arraste cada sabor para um espaço.'),
    ARR(['doce', 'salgado', 'azedo', 'amargo', 'umami', 'quente', 'gelado', 'duro'],
        [1, 2, 3, 4, 5].map(function (n) { return [n + '.', { aceita: SABORES, grupo: 's' }]; }))
  ], 'Doce, salgado, azedo, amargo e umami (em qualquer ordem).');

  q('lingua', [
    T('Ligue cada alimento ao sabor que ele tem (arraste o sabor até o alimento).'),
    ARR(['doce', 'umami', 'azedo', 'salgado', 'amargo'], [
      ['<b>limão</b> →', { ok: 'azedo' }], ['<b>café sem açúcar</b> →', { ok: 'amargo' }],
      ['<b>bolo de chocolate</b> →', { ok: 'doce' }], ['<b>pipoca com sal</b> →', { ok: 'salgado' }],
      ['<b>queijo parmesão</b> →', { ok: 'umami' }]
    ])
  ], 'Limão → azedo; café sem açúcar → amargo; bolo de chocolate → doce; pipoca com sal → salgado; queijo parmesão → umami.');

  q('lingua', [
    T('Qual é o sabor de cada alimento?'),
    ESCL([['mel', 0], ['jiló', 3], ['maracujá', 2], ['batata frita', 1], ['molho de soja (shoyu)', [4, 1]], ['sorvete', 0]],
         SABORES, { cls: 'tabela' })
  ], 'Mel – doce; jiló – amargo; maracujá – azedo; batata frita – salgado; molho de soja – umami (aceita também salgado); sorvete – doce.');

  q('lingua', [
    T('Olhe sua língua no espelho! Ela tem um montão de pontinhos. Neles ficam estruturas que percebem os sabores. Como elas se chamam?'),
    ESC('', ['papilas gustativas', 'membrana timpânica', 'fontes luminosas', 'canal auditivo'], 0)
  ], 'Papilas gustativas.');

  q('lingua', [
    CURIO('Antigamente, muitos livros diziam que cada pedaço da língua sentia só um sabor (o doce só na ponta, o amargo só no fundo...). Hoje os cientistas sabem que isso <b>não</b> é verdade.'),
    ESC('Marque a frase correta:', ['Sentimos o doce só na ponta da língua.',
                                    'Conseguimos perceber os sabores em toda a língua.', 'A língua só sente o sabor salgado.'], 1)
  ], 'Conseguimos perceber os sabores em toda a língua.');

  q('lingua', [
    ESCL([['O <b>umami</b> é conhecido como:', 1]], ['o gosto do açúcar', 'o gosto do glutamato', 'o gosto do limão', 'o gosto do café']),
    ESCL([['Qual alimento tem o sabor umami?', 0]], ['queijo parmesão', 'limão', 'mel', 'café sem açúcar'])
  ], 'O gosto do glutamato. Exemplos: queijo parmesão, molho de soja (shoyu), tempero do macarrão instantâneo.');

  q('lingua', [
    T('Dois amigos de olhos vendados vão provar suco de laranja. <b>Rafael</b> está com um pregador fechando o nariz. <b>Davi</b> está com o nariz livre.'),
    ESCL([['Quem vai sentir melhor o sabor do suco?', 1]], ['Rafael', 'Davi']),
    ESC('Por quê?', ['Porque o olfato e o paladar trabalham juntos, e o Davi está com o nariz livre.',
                     'Porque o Davi tem a língua maior.', 'Porque o pregador deixa o suco mais doce.'], 0)
  ], 'Davi, porque está com o nariz livre. O olfato e o paladar trabalham juntos.');

  q('lingua', [
    T('Carla mordeu um pedaço de pão, sentiu um gosto estranho e azedo e cuspiu. Depois viu que o pão estava mofado. Como o paladar ajudou a Carla?'),
    ESC('', ['Avisou que o alimento estava estragado, e ela cuspiu antes de engolir, protegendo a saúde dela.',
             'Deixou o pão mais gostoso.', 'Fez o pão voltar a ficar fresquinho.'], 0)
  ], 'O paladar avisou que o alimento estava estragado, e ela cuspiu antes de engolir — protegendo a saúde dela.');

  q('lingua', [
    CURIO('No espaço, os astronautas ficam com o nariz meio entupido. Por isso, muitos dizem que a comida parece "sem graça" e preferem comidas bem temperadas.'),
    ESC('Por que a comida parece sem graça para os astronautas?',
        ['Porque a comida do espaço não tem cor.', 'Porque, com o nariz entupido, o olfato não ajuda o paladar.',
         'Porque no espaço a língua para de funcionar.', 'Porque no espaço não tem luz.'], 1)
  ], 'Porque, com o nariz entupido, o olfato não ajuda o paladar (o mesmo que acontece quando estamos resfriados).');

  q('lingua', [
    T('Além de sentir os sabores, a língua também nos ajuda a... (marque as <b>duas</b> respostas certas)'),
    MARCAR([['falar', true], ['enxergar', false], ['mastigar e engolir os alimentos', true], ['ouvir', false]], 2)
  ], 'Falar; mastigar e engolir os alimentos.');

  q('lingua', [
    T('No cuidado com a língua, as atitudes abaixo são certas (C) ou erradas (E)?'),
    CE([['Escovar a língua junto com os dentes.', true], ['Comer comida pelando de quente, sem esperar esfriar.', false],
        ['Colocar na boca objetos sujos.', false], ['Esperar a comida amornar antes de comer.', true]])
  ], 'C – E – E – C. (Queimar a língua atrapalha a sentir os sabores por alguns dias.)');

  root.SECOES = SEC;
  root.QUESTOES = Q;
})(typeof window !== 'undefined' ? window : this);
