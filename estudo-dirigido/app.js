/* Tela do Estudo Dirigido: monta a folha, guarda as respostas e mostra a correção. */
(function () {
  'use strict';

  var CHAVE = 'estudo-dirigido-ciencias-3ano-v2';
  var Q = window.QUESTOES, C = window.Corretor;
  var SVGNS = 'http://www.w3.org/2000/svg';

  // dá um id único a cada bloco (inclusive os aninhados em "lado" e "coluna")
  var contador = 0;
  function numerar(b) {
    b.id = 'b' + (contador++);
    if (b.itens && (b.tipo === 'lado' || b.tipo === 'coluna')) b.itens.forEach(numerar);
  }
  Q.forEach(function (q) { q.blocos.forEach(numerar); });

  function todos(lista, fn) {
    lista.forEach(function (b) {
      fn(b);
      if (b.itens && (b.tipo === 'lado' || b.tipo === 'coluna')) todos(b.itens, fn);
    });
  }

  var estado = carregar();
  function carregar() {
    try {
      var s = JSON.parse(localStorage.getItem(CHAVE));
      if (s && s.resp) return s;
    } catch (e) { /* sem armazenamento: segue sem salvar */ }
    return { nome: '', resp: {}, entregue: false };
  }
  function salvar() { try { localStorage.setItem(CHAVE, JSON.stringify(estado)); } catch (e) { /* ignora */ } }

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  function resposta(b) {
    if (!(b.id in estado.resp)) estado.resp[b.id] = C.respostaVazia(b);
    return estado.resp[b.id];
  }

  // ------------------------------------------------------------ blocos
  function blocoMarcar(b, r, travado, res, mudou) {
    var cont = el('div', 'marcar');
    var ok = res ? C.corrigir(b, r) : null;
    b.itens.forEach(function (it, i) {
      var linha = el('button', 'linha-marca');
      linha.type = 'button';
      var cx = el('span', 'par', '(<span class="x">' + (r[i] ? 'X' : '&nbsp;') + '</span>)');
      linha.appendChild(cx);
      linha.appendChild(el('span', 'txt', it.t));
      if (res) {
        linha.disabled = true;
        linha.classList.add(ok[i] ? 'certa' : 'errada');
        if (!ok[i]) linha.appendChild(el('span', 'dica', it.ok ? '✔ devia estar marcada' : '✔ não devia ser marcada'));
      } else if (!travado) {
        linha.onclick = function () { r[i] = !r[i]; cx.querySelector('.x').innerHTML = r[i] ? 'X' : '&nbsp;'; mudou(); };
      }
      cont.appendChild(linha);
    });
    return cont;
  }

  function blocoEscolha(b, r, travado, res, mudou) {
    var cont = el('div', 'escolha ' + (b.cls || ''));
    var ok = res ? C.corrigir(b, r) : null;
    b.itens.forEach(function (it, i) {
      var linha = el('div', 'linha-esc');
      var ops = el('div', 'ops');
      var botoes = [];
      it.op.forEach(function (o, k) {
        var btn = b.cls === 'vf'
          ? el('button', 'op pilula' + (r[i] === k ? ' sel' : ''), esc(o))
          : el('button', 'op', '<span class="par">(<span class="x">' + (r[i] === k ? 'X' : '&nbsp;') + '</span>)</span><span class="txt">' + esc(o) + '</span>');
        btn.type = 'button';
        if (res) {
          btn.disabled = true;
          if (r[i] === k) btn.classList.add(ok[i] ? 'certa' : 'errada');
          else if (it.ok === k && !ok[i]) btn.classList.add('faltou');
        } else if (!travado) {
          btn.onclick = function () {
            r[i] = (r[i] === k) ? null : k;
            botoes.forEach(function (x, kk) {
              if (b.cls === 'vf') x.classList.toggle('sel', r[i] === kk);
              else x.querySelector('.x').innerHTML = r[i] === kk ? 'X' : '&nbsp;';
            });
            mudou();
          };
        }
        botoes.push(btn);
        ops.appendChild(btn);
      });
      linha.appendChild(ops);
      if (it.t) linha.appendChild(el('div', 'txt', it.t));
      cont.appendChild(linha);
    });
    return cont;
  }

  function blocoCampos(b, r, travado, res, mudou) {
    var cont = el('div', 'campos');
    var ok = res ? C.corrigir(b, r) : null;
    b.itens.forEach(function (it, i) {
      var linha = el('div', 'linha-campo');
      linha.appendChild(el('span', 'seta', '➢'));
      linha.appendChild(el('span', 'txt', it.t));
      var inp = el('input');
      inp.type = 'text'; inp.value = r[i] || ''; inp.setAttribute('aria-label', it.t);
      inp.autocomplete = 'off';
      inp.disabled = travado || res;
      inp.oninput = function () { r[i] = inp.value; mudou(); };
      if (res) inp.classList.add(ok[i] ? 'certa' : 'errada');
      linha.appendChild(inp);
      if (res && !ok[i]) linha.appendChild(el('span', 'dica', '✔ ' + it.ok[0]));
      cont.appendChild(linha);
    });
    return cont;
  }

  function blocoAberta(b, r, travado, res, mudou) {
    var cont = el('div', 'aberta');
    cont.appendChild(el('div', 'aviso-folha',
      '<b>RESPONDER NA FOLHA DE TREINO DE CALIGRAFIA COM UMA LETRA BEM BONITA.</b> ' +
      'Não é necessário recortar e colar a questão. Só responder indicando o número da questão.'));
    if (res) cont.appendChild(el('div', 'modelo', '<b>Resposta sugerida:</b> ' + esc(b.modelo)));
    return cont;
  }

  // Q3: arrastar a palavra do banco até a frase (ou tocar na palavra e depois no espaço)
  function blocoArrastar(b, r, travado, res, mudou) {
    var cont = el('div', 'arrastar');
    var sel = null;   // palavra "pega" com um toque: { wi, de }

    function mover(wi, de, para) {
      if (para === de) { sel = null; desenhar(); return; }
      if (para === 'banco') {
        if (de !== 'banco') r[de] = null;
      } else {
        var ocupante = r[para];
        if (de !== 'banco') r[de] = (ocupante === undefined ? null : ocupante);   // troca de lugar
        r[para] = wi;
      }
      sel = null;
      desenhar();
      mudou();
    }
    function soltar(wi, de, alvo) {
      var s = alvo && alvo.closest ? alvo.closest('.slot') : null;
      if (s && cont.contains(s)) return mover(wi, de, +s.dataset.i);
      var bk = alvo && alvo.closest ? alvo.closest('.banco') : null;
      if (bk && cont.contains(bk)) return mover(wi, de, 'banco');
      desenhar();
    }
    function tocou(wi, de) {
      if (sel && !(sel.wi === wi && sel.de === de) && de !== 'banco') return mover(sel.wi, sel.de, de);
      sel = (sel && sel.wi === wi && sel.de === de) ? null : { wi: wi, de: de };
      desenhar();
    }
    function palavra(wi, de) {
      var p = el('div', 'palavra', esc(b.banco[wi]));
      if (sel && sel.wi === wi && sel.de === de) p.classList.add('sel');
      if (travado || res) return p;
      p.addEventListener('click', function (e) { e.stopPropagation(); });
      p.addEventListener('pointerdown', function (e) {
        if (e.button !== undefined && e.button !== 0) return;
        e.preventDefault();
        var x0 = e.clientX, y0 = e.clientY, fantasma = null;
        function mexer(ev) {
          if (!fantasma && Math.hypot(ev.clientX - x0, ev.clientY - y0) > 6) {
            fantasma = p.cloneNode(true);
            fantasma.className = 'palavra fantasma';
            document.body.appendChild(fantasma);
            p.classList.add('arrastando');
          }
          if (fantasma) { fantasma.style.left = ev.clientX + 'px'; fantasma.style.top = ev.clientY + 'px'; }
        }
        function fim(ev) {
          window.removeEventListener('pointermove', mexer);
          window.removeEventListener('pointerup', fim);
          window.removeEventListener('pointercancel', fim);
          if (fantasma) {
            fantasma.remove();
            soltar(wi, de, document.elementFromPoint(ev.clientX, ev.clientY));
          } else if (ev.type === 'pointerup') {
            tocou(wi, de);
          }
        }
        window.addEventListener('pointermove', mexer);
        window.addEventListener('pointerup', fim);
        window.addEventListener('pointercancel', fim);
      });
      return p;
    }

    function desenhar() {
      cont.innerHTML = '';
      var usados = {};
      r.forEach(function (wi) { if (wi !== null && wi !== undefined) usados[wi] = true; });
      var certos = res ? C.corrigir(b, r) : null;

      if (!res) {
        var banco = el('div', 'banco');
        b.banco.forEach(function (w, wi) { if (!usados[wi]) banco.appendChild(palavra(wi, 'banco')); });
        if (!travado) banco.addEventListener('click', function () { if (sel && sel.de !== 'banco') mover(sel.wi, sel.de, 'banco'); });
        cont.appendChild(banco);
      }
      b.itens.forEach(function (it, i) {
        var linha = el('div', 'linha-arrastar');
        linha.appendChild(el('span', 'seta', '➢'));
        linha.appendChild(el('span', 'txt', it.t));
        var s = el('span', 'slot');
        s.dataset.i = i;
        if (r[i] !== null && r[i] !== undefined) s.appendChild(palavra(r[i], i));
        if (sel && !travado && !res) s.classList.add('pronto');
        if (!travado && !res) s.addEventListener('click', function () { if (sel) mover(sel.wi, sel.de, i); });
        if (res) s.classList.add(certos[i] ? 'ok' : 'erro');
        linha.appendChild(s);
        if (res && !certos[i]) linha.appendChild(el('span', 'dica', '✔ ' + it.ok));
        cont.appendChild(linha);
      });
    }
    desenhar();
    return cont;
  }

  function forma(r) {
    var p = r.p, e;
    if (r.forma === 'elipse') {
      e = document.createElementNS(SVGNS, 'ellipse');
      e.setAttribute('cx', p[0]); e.setAttribute('cy', p[1]); e.setAttribute('rx', p[2]); e.setAttribute('ry', p[3]);
    } else if (r.forma === 'rect') {
      e = document.createElementNS(SVGNS, 'rect');
      e.setAttribute('x', p[0]); e.setAttribute('y', p[1]); e.setAttribute('width', p[2]); e.setAttribute('height', p[3]);
      e.setAttribute('rx', p[4] || 0);
    } else {
      e = document.createElementNS(SVGNS, 'polygon');
      e.setAttribute('points', p.join(' '));
    }
    return e;
  }

  function blocoPintar(b, r, travado, res, mudou) {
    var cont = el('div', 'pintar');
    var ferr = b.paleta[0][0];
    var paleta = el('div', 'paleta');
    var botoes = {};

    function ferramenta(nome, rotulo, cor) {
      var btn = el('button', 'cor', (cor ? '<span class="amostra" style="background:' + cor + '"></span>' : '') + rotulo);
      btn.type = 'button';
      btn.title = rotulo;
      btn.onclick = function () {
        ferr = nome;
        Object.keys(botoes).forEach(function (k) { botoes[k].classList.toggle('ativa', k === ferr); });
      };
      botoes[nome] = btn;
      paleta.appendChild(btn);
    }
    var cores = {};
    b.paleta.forEach(function (c) { cores[c[0]] = c[1]; ferramenta(c[0], c[0], c[1]); });
    if (b.circular) ferramenta('circ', '⭕ circular', null);
    ferramenta('borracha', '🧽 apagar', null);
    botoes[ferr].classList.add('ativa');
    if (!travado && !res) cont.appendChild(paleta);

    var svg = document.createElementNS(SVGNS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + b.w + ' ' + b.h);
    svg.setAttribute('class', 'fig-pintar');
    var im = document.createElementNS(SVGNS, 'image');
    im.setAttribute('href', b.src); im.setAttribute('width', b.w); im.setAttribute('height', b.h);
    svg.appendChild(im);
    var certos = res ? C.corrigir(b, r) : null;
    var valendo = b.regioes.filter(function (g) { return g.ok; });

    var elems = {};
    function aplicar(g) {
      var e = elems[g.id], v = r[g.id];
      e.setAttribute('class', 'regiao');
      e.style.fill = 'transparent'; e.style.fillOpacity = '1'; e.style.stroke = 'none';
      e.style.mixBlendMode = 'normal';
      if (v === 'circ') {
        e.style.stroke = '#E53935'; e.style.strokeWidth = Math.max(5, b.w / 260);
      } else if (v && cores[v]) {
        e.style.fill = cores[v]; e.style.fillOpacity = '.62'; e.style.mixBlendMode = 'multiply';
      }
      if (res && g.ok) {
        var i = valendo.indexOf(g);
        if (v === 'circ' && certos[i]) e.style.stroke = '#1E8E3E';
        else if (!certos[i]) { e.style.stroke = '#1E8E3E'; e.style.strokeDasharray = '14 8'; e.style.strokeWidth = Math.max(5, b.w / 260); }
        if (certos[i]) e.classList.add('r-certa'); else e.classList.add('r-errada');
      }
    }
    if (b.extra) {
      var g0 = document.createElementNS(SVGNS, 'g');
      g0.innerHTML = b.extra;
      svg.appendChild(g0);
    }
    b.regioes.forEach(function (g) {
      var e = forma(g);
      var t = document.createElementNS(SVGNS, 'title'); t.textContent = g.nome; e.appendChild(t);
      elems[g.id] = e;
      aplicar(g);
      if (!travado && !res) {
        e.style.cursor = 'pointer';
        e.addEventListener('click', function () {
          if (ferr === 'borracha') delete r[g.id];
          else if (ferr === 'circ') { if (!g.circular) return; r[g.id] = r[g.id] === 'circ' ? undefined : 'circ'; }
          else { if (g.circular) return; r[g.id] = r[g.id] === ferr ? undefined : ferr; }
          if (r[g.id] === undefined) delete r[g.id];
          aplicar(g);
          mudou();
        });
      }
      svg.appendChild(e);
    });
    var tela = el('div', 'tela-pintar' + (b.w / b.h > 2 ? ' larga' : ''));
    tela.appendChild(svg);
    cont.appendChild(tela);
    if (res && valendo.length) {
      var faltas = valendo.filter(function (g, i) { return !certos[i]; });
      if (faltas.length) {
        var dica = faltas.map(function (g) { return g.nome + (g.ok === 'circ' ? ' (circular)' : ' (' + g.ok + ')'); });
        cont.appendChild(el('div', 'dica-pintar', '✔ Faltou ou ficou diferente: ' + dica.join(', ') + '. Contorno verde tracejado = devia estar assim.'));
      }
    }
    return cont;
  }

  function montar(b, travado, res, mudou) {
    if (b.tipo === 'texto') return el('div', 'texto ' + b.cls, b.html);
    if (b.tipo === 'sugestao') return res ? el('div', 'modelo', '<b>Resposta sugerida:</b> ' + b.html) : document.createDocumentFragment();
    if (b.tipo === 'figura') {
      var im = el('img', 'figura'); im.src = b.src; im.alt = b.alt;
      return im;
    }
    if (b.tipo === 'noticia') {
      var box = el('div', 'noticia');
      box.appendChild(el('div', 'titulo', b.titulo));
      b.paragrafos.forEach(function (p) { box.appendChild(el('p', '', p)); });
      box.appendChild(el('div', 'url', b.url));
      return box;
    }
    if (b.tipo === 'lado') {
      var lado = el('div', 'lado');
      b.itens.forEach(function (x, i) {
        var col = el('div', 'col');
        col.style.flex = b.pesos[i] + ' 1 0';
        col.appendChild(montar(x, travado, res, mudou));
        lado.appendChild(col);
      });
      return lado;
    }
    if (b.tipo === 'coluna') {
      var c = el('div', 'coluna');
      b.itens.forEach(function (x) { c.appendChild(montar(x, travado, res, mudou)); });
      return c;
    }
    if (b.tipo === 'aberta') return blocoAberta(b, null, travado, res, null);
    var r = resposta(b);
    var m = function () { salvar(); atualizarProgresso(); mudou(); };
    if (b.tipo === 'marcar') return blocoMarcar(b, r, travado, res, m);
    if (b.tipo === 'escolha') return blocoEscolha(b, r, travado, res, m);
    if (b.tipo === 'arrastar') return blocoArrastar(b, r, travado, res, m);
    if (b.tipo === 'campos') return blocoCampos(b, r, travado, res, m);
    if (b.tipo === 'pintar') return blocoPintar(b, r, travado, res, m);
    if (b.tipo === 'aberta') return blocoAberta(b, r, travado, res, m);
    return el('div');
  }

  // ------------------------------------------------------------ totais
  function totais() {
    var certos = 0, total = 0, respondidos = 0, nBlocos = 0;
    var porQ = Q.map(function (q) {
      var c = 0, t = 0;
      todos(q.blocos, function (b) {
        if (!C.valendo(b)) return;
        var r = resposta(b), ok = C.corrigir(b, r);
        t += ok.length; ok.forEach(function (x) { if (x) c++; });
        nBlocos++; if (C.respondido(b, r)) respondidos++;
      });
      certos += c; total += t;
      return { certos: c, total: t };
    });
    return { certos: certos, total: total, porQ: porQ, respondidos: respondidos, nBlocos: nBlocos };
  }

  // ------------------------------------------------------------ tela
  var app = document.getElementById('app');

  function desenhar() {
    var t = totais(), res = estado.entregue;
    app.innerHTML = '';

    var barra = el('div', 'barra');
    var nome = el('label', 'nome', '<b>Nome:</b> ');
    var inp = el('input'); inp.placeholder = 'Escreva seu nome'; inp.value = estado.nome || ''; inp.disabled = res;
    inp.oninput = function () { estado.nome = inp.value; salvar(); };
    nome.appendChild(inp);
    barra.appendChild(nome);
    barra.appendChild(el('span', 'progresso-txt', ''));
    app.appendChild(barra);

    if (res) {
      var nf = el('div', 'nota-final');
      nf.innerHTML = (estado.nome ? '<b>' + esc(estado.nome) + '</b>, nas' : 'Nas') + ' questões com gabarito (pintar, marcar, V/F e escrever o sentido) você acertou ' +
        '<span class="grande">' + t.certos + ' de ' + t.total + '</span> itens.<br>' +
        '<small>As perguntas "responda em seu caderno" não têm correção automática: compare com a <b>resposta sugerida</b> ou mostre ao professor.</small>';
      app.appendChild(nf);
    }

    var folha = el('div', 'folha');
    // cabeçalho (igual ao do papel)
    var cab = el('div', 'cabecalho');
    cab.innerHTML = '<img src="img/logo.png" alt="Rouxinol Neusa Rocha">' +
      '<div class="escola"><div class="nome-escola">Rouxinol Neusa Rocha</div>' +
      '<div class="nivel">ENSINO INFANTIL E FUNDAMENTAL</div>' +
      '<div class="site">www.rouxinolneusarocha.com.br &nbsp;–&nbsp; Telefone: (31) 3441-0212</div></div>';
    folha.appendChild(cab);
    folha.appendChild(el('div', 'serie', '3º ANO DO ENSINO FUNDAMENTAL – CIÊNCIAS – <span class="data">19</span> / <span class="data">11</span> /2026'));
    folha.appendChild(el('h1', '', 'ESTUDO DIRIGIDO DE CIÊNCIAS'));
    folha.appendChild(el('div', 'recado',
      'Chegamos ao nosso último Estudo Dirigido de Ciências do 3° ano!<br>Continue fazendo seu melhor!<br>' +
      'Você já é um sucesso, e tem potencial para ir ainda mais longe!<br>Acredito em você!'));

    Q.forEach(function (q, qi) {
      var card = el('section', 'questao');
      q.blocos.forEach(function (b) { card.appendChild(montar(b, res, res, function () {})); });
      if (res && t.porQ[qi].total) {
        var cheio = t.porQ[qi].certos === t.porQ[qi].total;
        var sel = el('div', 'selo ' + (cheio ? 'cheio' : 'parcial'), (cheio ? '✔ ' : '') + t.porQ[qi].certos + ' de ' + t.porQ[qi].total);
        card.insertBefore(sel, card.firstChild);
      }
      folha.appendChild(card);
      if (q.depois === 'linha') folha.appendChild(el('hr', 'linha'));
      if (q.depois === 'tesoura') folha.appendChild(el('div', 'tesoura'));
    });

    folha.appendChild(el('div', 'recado final',
      'Revise seu Estudo Dirigido! Confira se fez traços coloridos com régua entre todas as questões. Você mora no meu coração!'));
    app.appendChild(folha);

    var rod = el('div', 'rodape');
    if (!res) {
      var ent = el('button', 'btn entregar', '✔ Finalizar e ver correção'); ent.type = 'button'; ent.onclick = entregar;
      rod.appendChild(ent);
    } else {
      var again = el('button', 'btn sec', '↻ Refazer'); again.type = 'button'; again.onclick = refazer;
      var imp = el('button', 'btn sec', '🖨 Imprimir'); imp.type = 'button'; imp.onclick = function () { window.print(); };
      rod.appendChild(imp); rod.appendChild(again);
    }
    app.appendChild(rod);
    atualizarProgresso();
  }

  function atualizarProgresso() {
    var tx = document.querySelector('.progresso-txt');
    if (!tx) return;
    var respondidas = 0, total = 0;
    todos(Q.reduce(function (a, q) { return a.concat(q.blocos); }, []), function (b) {
      if (C.valendo(b)) { total++; if (C.respondido(b, estado.resp[b.id])) respondidas++; }
    });
    tx.textContent = 'Atividades respondidas: ' + respondidas + ' de ' + total;
  }

  function entregar() {
    if (!window.confirm('Finalizar e ver a correção? Depois disso as respostas ficam travadas (dá para refazer).')) return;
    estado.entregue = true; salvar(); desenhar(); window.scrollTo(0, 0);
  }
  function refazer() {
    if (!window.confirm('Apagar as respostas e começar de novo?')) return;
    estado = { nome: estado.nome, resp: {}, entregue: false };
    salvar(); desenhar(); window.scrollTo(0, 0);
  }

  // ------------------------------------------------------------ autoteste (abrir index.html?teste)
  function autoteste() {
    var out = [], erros = 0, nv = 0;
    todos(Q.reduce(function (a, q) { return a.concat(q.blocos); }, []), function (b) {
      if (!C.valendo(b)) return;
      nv++;
      var p = C.corrigir(b, C.respostaPerfeita(b)), v = C.corrigir(b, C.respostaVazia(b));
      if (!p.length || p.some(function (x) { return !x; }) || v.every(function (x) { return x; })) {
        erros++; out.push('ERRO bloco ' + b.id + ' (' + b.tipo + ')');
      }
    });
    out.push('questões: ' + Q.length + ' | blocos com gabarito: ' + nv + ' | erros: ' + erros);
    var pre = document.createElement('pre'); pre.id = 'teste'; pre.textContent = out.join('\n');
    document.body.appendChild(pre);
  }

  window.addEventListener('error', function (e) {
    var pre = document.createElement('pre'); pre.id = 'jserro'; pre.textContent = 'JSERRO: ' + e.message + ' @' + e.lineno;
    document.body.appendChild(pre);
  });

  // abrir index.html?demo → preenche tudo com as respostas certas (para conferir o desenho); ?demo&entregue → já corrigido
  if (/[?&]demo/.test(location.search)) {
    todos(Q.reduce(function (a, q) { return a.concat(q.blocos); }, []), function (b) {
      if (C.valendo(b)) estado.resp[b.id] = C.respostaPerfeita(b);
      if (b.tipo === 'pintar' && b.circular) {
        var o = estado.resp[b.id];
        o.bola = 'azul'; o.carro = 'vermelho'; o.boneco = 'verde'; o.porta = 'marrom';
      }
    });
    if (/entregue/.test(location.search)) estado.entregue = true;
    salvar = function () {};
  }
  desenhar();
  if (/[?&]teste/.test(location.search)) autoteste();
})();
