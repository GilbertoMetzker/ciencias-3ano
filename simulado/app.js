/* Tela do simulado: monta as questões, guarda as respostas e mostra o resultado. */
(function () {
  'use strict';

  var CHAVE = 'simulado-ciencias-v1';
  var ORDEM = ['luz', 'som', 'nariz', 'lingua'];
  var CORES = {
    luz: ['#E89B00', '#FFF4D6'], som: ['#2F7BC0', '#E3F0FB'],
    nariz: ['#2E9E6A', '#E2F5EA'], lingua: ['#D2427A', '#FCE6EF']
  };
  var Q = window.QUESTOES, SEC = window.SECOES, C = window.Corretor;

  // numeração global de cada questão
  Q.forEach(function (q, i) { q.n = i + 1; q.i = i; });

  var estado = carregar();

  function carregar() {
    try {
      var s = JSON.parse(localStorage.getItem(CHAVE));
      if (s && s.resp && s.total === Q.length) return s;
    } catch (e) { /* sem armazenamento: segue sem salvar */ }
    return { nome: '', resp: {}, entregue: false, secao: 0, total: Q.length };
  }
  function salvar() { try { localStorage.setItem(CHAVE, JSON.stringify(estado)); } catch (e) { /* ignora */ } }

  // ------------------------------------------------------------ utilidades
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }
  function pts(n) { return n.toFixed(1).replace('.', ','); }
  function pts2(n) { return (Math.round(n * 100) / 100).toString().replace('.', ','); }

  function resposta(qi, bi) {
    var k = qi + '_' + bi;
    if (!estado.resp[k]) estado.resp[k] = C.respostaVazia(Q[qi].blocos[bi]);
    return estado.resp[k];
  }
  function respsDaQuestao(qi) {
    var r = {};
    Q[qi].blocos.forEach(function (b, bi) { if (C.valendo(b)) r[bi] = estado.resp[qi + '_' + bi]; });
    return r;
  }
  function nota(qi) { return C.notaQuestao(Q[qi], respsDaQuestao(qi)); }

  function pintar(e, sec) {
    e.style.setProperty('--cor', CORES[sec][0]);
    e.style.setProperty('--claro', CORES[sec][1]);
  }

  // ------------------------------------------------------------ blocos
  function blocoMarcar(b, resp, travado, res, aoMudar) {
    var cont = el('div', 'marcar c' + (b.cols || 2));
    b.itens.forEach(function (it, i) {
      var btn = el('button', 'opcao', '<span class="caixa"></span><span>' + it.t + '</span>');
      btn.type = 'button';
      if (resp[i]) btn.classList.add('sel');
      if (res) {
        btn.disabled = true;
        if (resp[i] && it.ok) btn.classList.add('certa');
        else if (resp[i] && !it.ok) btn.classList.add('errada');
        else if (!resp[i] && it.ok) btn.classList.add('faltou');
      } else if (!travado) {
        btn.onclick = function () { resp[i] = !resp[i]; btn.classList.toggle('sel', resp[i]); aoMudar(); };
      }
      cont.appendChild(btn);
    });
    return cont;
  }

  function blocoEscolha(b, resp, travado, res, aoMudar) {
    var cont = el('div', 'bloco-escolha');
    b.itens.forEach(function (it, i) {
      var linhaTab = b.cls === 'tabela';
      var item = el('div', 'item' + (linhaTab ? ' linha-tab' : ''));
      if (it.t) item.appendChild(el('div', 'rotulo', it.t));
      var ops = el('div', 'opcoes' + (b.vertical ? ' vertical' : '') + (b.cls ? ' ' + b.cls : ''));
      if (b.cls === 'tabela') ops.classList.add('chips');
      var certas = Array.isArray(it.ok) ? it.ok : [it.ok];
      var botoes = [];
      it.op.forEach(function (o, k) {
        var marca = b.vertical ? '<span class="bolinha"></span>' : '';
        var btn = el('button', 'opcao', marca + '<span>' + o + '</span>');
        btn.type = 'button';
        if (resp[i] === k) btn.classList.add('sel');
        if (res) {
          btn.disabled = true;
          if (certas.indexOf(k) >= 0 && resp[i] === k) btn.classList.add('certa');
          else if (resp[i] === k) btn.classList.add('errada');
          else if (certas.indexOf(k) >= 0 && certas.length === 1) btn.classList.add('faltou');
        } else if (!travado) {
          btn.onclick = function () {
            resp[i] = (resp[i] === k) ? null : k;
            botoes.forEach(function (x, kk) { x.classList.toggle('sel', resp[i] === kk); });
            aoMudar();
          };
        }
        botoes.push(btn);
        ops.appendChild(btn);
      });
      item.appendChild(ops);
      cont.appendChild(item);
    });
    return cont;
  }

  function blocoArrastar(b, resp, travado, res, aoMudar) {
    var cont = el('div', 'arrastar');
    var espacos = C.espacos(b);
    var sel = null;   // palavra "pega" com um toque: { wi, de }

    function mover(wi, de, para) {
      if (para === de) { sel = null; desenhar(); return; }
      if (para === 'banco') {
        if (de !== 'banco') resp[de] = null;
      } else {
        var ocupante = resp[para];
        if (de !== 'banco') resp[de] = (ocupante === undefined ? null : ocupante); // troca de lugar
        resp[para] = wi;
      }
      sel = null;
      desenhar();
      aoMudar();
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
      var p = el('div', 'palavra', b.banco[wi]);
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
      resp.forEach(function (wi) { if (wi !== null && wi !== undefined) usados[wi] = true; });

      var banco = el('div', 'banco');
      b.banco.forEach(function (w, wi) { if (!usados[wi]) banco.appendChild(palavra(wi, 'banco')); });
      if (!travado && !res) {
        banco.addEventListener('click', function () { if (sel && sel.de !== 'banco') mover(sel.wi, sel.de, 'banco'); });
      }
      if (!res) cont.appendChild(banco);

      var certos = res ? C.corrigirBloco(b, resp) : null;
      var si = 0;
      b.linhas.forEach(function (linha) {
        var l = el('div', 'linha');
        linha.forEach(function (p) {
          if (typeof p === 'string') { l.appendChild(el('span', '', p)); return; }
          var i = si++;
          var s = el('span', 'slot');
          s.dataset.i = i;
          if (resp[i] !== null && resp[i] !== undefined) s.appendChild(palavra(resp[i], i));
          if (sel && !travado && !res) s.classList.add('pronto');
          if (!travado && !res) s.addEventListener('click', function () { if (sel) mover(sel.wi, sel.de, i); });
          if (res) {
            s.classList.add(certos[i] ? 'ok' : 'erro');
          }
          l.appendChild(s);
          if (res && !certos[i]) {
            var correta = (p.aceita && p.grupo) ? 'uma de: ' + p.aceita.join(', ') : (p.ok || p.aceita.join(' / '));
            l.appendChild(el('span', 'dica', '✔ ' + correta));
          }
        });
        cont.appendChild(l);
      });
    }
    desenhar();
    return cont;
  }

  function montarBloco(b, qi, bi, travado, res, aoMudar) {
    if (b.tipo === 'texto') return el('div', 'bloco texto', b.html);
    if (b.tipo === 'curio') return el('div', 'bloco curio', b.html);
    if (b.tipo === 'figura') return el('div', 'bloco', b.svg);
    var resp = resposta(qi, bi);
    var mudou = function () { salvar(); aoMudar(); };
    var n;
    if (b.tipo === 'marcar') n = blocoMarcar(b, resp, travado, res, mudou);
    else if (b.tipo === 'escolha') n = blocoEscolha(b, resp, travado, res, mudou);
    else n = blocoArrastar(b, resp, travado, res, mudou);
    var w = el('div', 'bloco');
    w.appendChild(n);
    return w;
  }

  // ------------------------------------------------------------ telas
  var app = document.getElementById('app');

  function totais() {
    var soma = 0, resp = 0, porSecao = {};
    ORDEM.forEach(function (s) { porSecao[s] = { pts: 0, n: 0, resp: 0 }; });
    Q.forEach(function (q, i) {
      var r = nota(i);
      soma += r.pts; if (r.respondida) resp++;
      var p = porSecao[q.sec]; p.pts += r.pts; p.n++; if (r.respondida) p.resp++;
    });
    return { soma: soma, resp: resp, porSecao: porSecao };
  }

  function desenhar() {
    var t = totais();
    app.innerHTML = '';

    // topo
    var topo = el('div', 'topo');
    topo.appendChild(el('h1', '', '🔬 Simulado de Ciências'));
    var nome = el('div', 'nome', '<label for="nome"><b>Nome:</b></label>');
    var inp = el('input'); inp.id = 'nome'; inp.placeholder = 'Escreva seu nome'; inp.value = estado.nome || '';
    inp.disabled = estado.entregue;
    inp.oninput = function () { estado.nome = inp.value; salvar(); };
    nome.appendChild(inp);
    topo.appendChild(nome);
    var barra = el('div', 'progresso'); var preench = el('div'); preench.style.width = (100 * t.resp / Q.length) + '%';
    barra.appendChild(preench); topo.appendChild(barra);
    topo.appendChild(el('div', 'progresso-txt', 'Questões respondidas: ' + t.resp + ' de ' + Q.length));
    app.appendChild(topo);

    // resultado geral
    if (estado.entregue) {
      var nf = el('div', 'nota-final');
      nf.appendChild(el('div', '', (estado.nome ? '<b>' + estado.nome.replace(/</g, '&lt;') + '</b>, sua nota:' : 'Sua nota:')));
      nf.appendChild(el('div', 'grande', pts2(t.soma) + ' <small style="font-size:22px;color:#555">de ' + Q.length + '</small>'));
      var linhas = '';
      ORDEM.forEach(function (s) {
        var p = t.porSecao[s];
        linhas += '<tr><td>' + SEC[s].icone + ' ' + SEC[s].nome + '</td><td>' + pts2(p.pts) + ' de ' + p.n + '</td></tr>';
      });
      nf.appendChild(el('table', '', linhas));
      nf.appendChild(el('p', '', 'Veja abaixo cada questão: <b>verde</b> = acertou, <b>vermelho</b> = errou, ' +
        'borda tracejada = devia ter marcado.'));
      app.appendChild(nf);
    }

    // navegação por parte
    var nav = el('div', 'nav');
    ORDEM.forEach(function (s, i) {
      var p = t.porSecao[s];
      var btn = el('button', i === estado.secao ? 'ativa' : '',
        SEC[s].icone + ' ' + SEC[s].nome + '<small>' + (estado.entregue ? pts2(p.pts) + ' / ' + p.n : p.resp + ' / ' + p.n) + '</small>');
      btn.type = 'button';
      if (i === estado.secao) btn.style.background = CORES[s][0];
      btn.style.borderColor = CORES[s][0];
      btn.onclick = function () { estado.secao = i; salvar(); desenhar(); window.scrollTo(0, 0); };
      nav.appendChild(btn);
    });
    app.appendChild(nav);

    // questões da parte atual
    var sec = ORDEM[estado.secao];
    var cab = el('div', 'secao', '<h2>' + SEC[sec].icone + ' Parte ' + (estado.secao + 1) + ' • ' + SEC[sec].nome.toUpperCase() +
      '</h2><p>' + SEC[sec].sub + '</p>');
    pintar(cab, sec);
    app.appendChild(cab);

    Q.forEach(function (q, qi) {
      if (q.sec !== sec) return;
      var card = el('div', 'questao');
      pintar(card, sec);
      var topoQ = el('div', 'q-topo', '<span class="badge">' + q.n + '</span>');
      card.appendChild(topoQ);
      if (estado.entregue) {
        var r = nota(qi);
        var cls = r.pts >= 0.9999 ? 'cheia' : (r.pts > 0 ? 'parcial' : 'zero');
        topoQ.appendChild(el('span', 'q-nota ' + cls, pts2(r.pts) + ' / 1'));
      }
      q.blocos.forEach(function (b, bi) {
        card.appendChild(montarBloco(b, qi, bi, estado.entregue, estado.entregue, function () { atualizarProgresso(); }));
      });
      if (estado.entregue) card.appendChild(el('div', 'expl', '<b>Resposta:</b> ' + q.expl));
      app.appendChild(card);
    });

    // rodapé
    var rod = el('div', 'rodape');
    var ant = el('button', 'btn sec', '← Parte anterior'); ant.type = 'button';
    ant.disabled = estado.secao === 0;
    ant.onclick = function () { estado.secao--; salvar(); desenhar(); window.scrollTo(0, 0); };
    var prox = el('button', 'btn', 'Próxima parte →'); prox.type = 'button';
    prox.disabled = estado.secao === ORDEM.length - 1;
    prox.onclick = function () { estado.secao++; salvar(); desenhar(); window.scrollTo(0, 0); };
    rod.appendChild(ant); rod.appendChild(prox);
    if (!estado.entregue) {
      var ent = el('button', 'btn entregar', '✔ Entregar'); ent.type = 'button';
      ent.onclick = entregar;
      rod.appendChild(ent);
    } else {
      var again = el('button', 'btn sec', '↻ Refazer'); again.type = 'button';
      again.onclick = refazer;
      var imp = el('button', 'btn sec', '🖨 Imprimir'); imp.type = 'button';
      imp.onclick = function () { window.print(); };
      rod.appendChild(imp); rod.appendChild(again);
    }
    app.appendChild(rod);
  }

  function atualizarProgresso() {
    var t = totais();
    var f = document.querySelector('.progresso > div');
    if (f) f.style.width = (100 * t.resp / Q.length) + '%';
    var tx = document.querySelector('.progresso-txt');
    if (tx) tx.textContent = 'Questões respondidas: ' + t.resp + ' de ' + Q.length;
    var bs = document.querySelectorAll('.nav button small');
    ORDEM.forEach(function (s, i) { if (bs[i] && !estado.entregue) bs[i].textContent = t.porSecao[s].resp + ' / ' + t.porSecao[s].n; });
  }

  function entregar() {
    var t = totais();
    var falta = Q.length - t.resp;
    var msg = falta > 0 ? 'Ainda há ' + falta + ' questão(ões) sem resposta. Entregar mesmo assim?' : 'Entregar o simulado agora?';
    if (!window.confirm(msg)) return;
    estado.entregue = true; estado.secao = 0; salvar(); desenhar(); window.scrollTo(0, 0);
  }

  function refazer() {
    if (!window.confirm('Apagar as respostas e começar de novo?')) return;
    estado = { nome: estado.nome, resp: {}, entregue: false, secao: 0, total: Q.length };
    salvar(); desenhar(); window.scrollTo(0, 0);
  }

  // ------------------------------------------------------------ autoteste (abrir index.html?teste)
  function autoteste() {
    var out = [], erros = 0;
    Q.forEach(function (q, i) {
      var perfeita = {}, vazia = {}, temValendo = false;
      q.blocos.forEach(function (b, bi) {
        if (!C.valendo(b)) return;
        temValendo = true;
        perfeita[bi] = C.respostaPerfeita(b);
        vazia[bi] = C.respostaVazia(b);
      });
      var a = C.notaQuestao(q, perfeita), z = C.notaQuestao(q, vazia);
      if (!temValendo || a.pts !== 1 || a.total === 0 || z.pts !== 0) {
        erros++; out.push('ERRO q' + q.n + ': perfeita=' + a.pts + ' (' + a.certos + '/' + a.total + ') vazia=' + z.pts);
      }
    });
    // exemplo do enunciado: 10 opções, esqueceu uma fonte e marcou um objeto que não é fonte → 0,8
    var q1 = Q[0], r1 = C.respostaPerfeita(q1.blocos[1]);
    var primeiraVerdadeira = q1.blocos[1].itens.findIndex(function (x) { return x.ok; });
    var primeiraFalsa = q1.blocos[1].itens.findIndex(function (x) { return !x.ok; });
    r1[primeiraVerdadeira] = false; r1[primeiraFalsa] = true;
    var n1 = C.notaQuestao(q1, { 1: r1 });
    if (Math.abs(n1.pts - 0.8) > 1e-9) { erros++; out.push('ERRO exemplo 0,8: ' + n1.pts); }
    out.push('questões: ' + Q.length + ' | erros: ' + erros + ' | exemplo q1 (esqueceu 1 + marcou 1 errada) = ' + n1.pts);
    var pre = document.createElement('pre'); pre.id = 'teste'; pre.textContent = out.join('\n');
    document.body.appendChild(pre);
  }

  window.addEventListener('error', function (e) {
    var pre = document.createElement('pre'); pre.id = 'jserro'; pre.textContent = 'JSERRO: ' + e.message + ' @' + e.lineno;
    document.body.appendChild(pre);
  });

  desenhar();
  if (/[?&]teste/.test(location.search)) autoteste();
})();
