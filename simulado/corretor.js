/* Lógica de pontuação do simulado.
 *
 * Cada questão vale 1,0 ponto, dividido igualmente entre os "itens" dela.
 * Item = uma opção de "marcar", uma linha de "escolha" ou um espaço de "arrastar".
 * Ex.: 10 opções para marcar, 2 erradas → 8 itens certos → 0,8 ponto.
 *
 * Tipos de bloco:
 *   marcar   { itens:[{t, ok:true|false}] }                 → acerta se marcou exatamente o que devia
 *   escolha  { itens:[{t, op:[...], ok:índice | [índices]}] } → acerta se escolheu a opção certa
 *   arrastar { banco:[palavras], linhas:[[texto | {ok} | {aceita, grupo}, ...]] }
 *              → cada espaço {…} é um item; acerta se a palavra arrastada é a certa
 *   texto, curio, figura  → só aparecem na tela, não valem ponto
 */
(function (root) {
  'use strict';

  function ehEspaco(p) {
    return p !== null && typeof p === 'object' && ('ok' in p || 'aceita' in p);
  }

  /** Lista (em ordem) os espaços de um bloco "arrastar". */
  function espacos(b) {
    var s = [];
    b.linhas.forEach(function (linha) {
      linha.forEach(function (p) { if (ehEspaco(p)) s.push(p); });
    });
    return s;
  }

  function nItens(b) {
    if (b.tipo === 'marcar' || b.tipo === 'escolha') return b.itens.length;
    if (b.tipo === 'arrastar') return espacos(b).length;
    return 0;
  }

  function valendo(b) {
    return b.tipo === 'marcar' || b.tipo === 'escolha' || b.tipo === 'arrastar';
  }

  /** Resposta vazia de um bloco. */
  function respostaVazia(b) {
    var n = nItens(b), a = [], i;
    for (i = 0; i < n; i++) a.push(b.tipo === 'marcar' ? false : null);
    return a;
  }

  function respondido(b, resp) {
    if (!resp) return false;
    return resp.some(function (r) { return r === true || (r !== false && r !== null && r !== undefined); });
  }

  /** Devolve um array de true/false: acertou cada item? */
  function corrigirBloco(b, resp) {
    resp = resp || respostaVazia(b);
    if (b.tipo === 'marcar') {
      return b.itens.map(function (it, i) { return !!resp[i] === it.ok; });
    }
    if (b.tipo === 'escolha') {
      return b.itens.map(function (it, i) {
        var r = resp[i];
        if (r === null || r === undefined) return false;
        return Array.isArray(it.ok) ? it.ok.indexOf(r) >= 0 : r === it.ok;
      });
    }
    if (b.tipo === 'arrastar') {
      var usados = {};
      return espacos(b).map(function (s, i) {
        var wi = resp[i];
        if (wi === null || wi === undefined) return false;
        var w = b.banco[wi];
        var aceitas = s.aceita || [s.ok];
        if (aceitas.indexOf(w) < 0) return false;
        if (s.grupo) {               // espaços do mesmo grupo não podem repetir a palavra
          var k = s.grupo + '|' + w;
          if (usados[k]) return false;
          usados[k] = true;
        }
        return true;
      });
    }
    return [];
  }

  /** Nota de uma questão. resps = { índiceDoBloco: resposta }. */
  function notaQuestao(q, resps) {
    var certos = 0, total = 0, mexeu = false;
    q.blocos.forEach(function (b, bi) {
      if (!valendo(b)) return;
      var r = resps ? resps[bi] : null;
      var c = corrigirBloco(b, r);
      total += c.length;
      c.forEach(function (x) { if (x) certos++; });
      if (respondido(b, r)) mexeu = true;
    });
    // Questão em branco não ganha ponto (senão "não marcar nada" acertaria as opções falsas).
    var pts = (mexeu && total) ? certos / total : 0;
    return { pts: pts, certos: certos, total: total, respondida: mexeu };
  }

  /** Resposta 100% correta (usada para testar se os dados das questões estão coerentes). */
  function respostaPerfeita(b) {
    var r = respostaVazia(b);
    if (b.tipo === 'marcar') {
      b.itens.forEach(function (it, i) { r[i] = it.ok; });
    } else if (b.tipo === 'escolha') {
      b.itens.forEach(function (it, i) { r[i] = Array.isArray(it.ok) ? it.ok[0] : it.ok; });
    } else if (b.tipo === 'arrastar') {
      var usadas = {};
      espacos(b).forEach(function (s, i) {
        var aceitas = s.aceita || [s.ok];
        for (var wi = 0; wi < b.banco.length; wi++) {
          if (!usadas[wi] && aceitas.indexOf(b.banco[wi]) >= 0) { usadas[wi] = true; r[i] = wi; break; }
        }
      });
    }
    return r;
  }

  root.Corretor = {
    espacos: espacos, nItens: nItens, valendo: valendo, respostaVazia: respostaVazia,
    respondido: respondido, corrigirBloco: corrigirBloco, notaQuestao: notaQuestao,
    respostaPerfeita: respostaPerfeita
  };
})(typeof window !== 'undefined' ? window : this);
