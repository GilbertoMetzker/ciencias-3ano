/* Correção do Estudo Dirigido.
 *
 * Tipos de bloco que valem acerto (cada "item" é conferido separadamente):
 *   marcar  { itens:[{t, ok:true|false}] }                      → marcou (X) exatamente o que devia
 *   escolha { itens:[{t, op:[...], ok:índice}] }                → escolheu a opção certa
 *   campos  { itens:[{t, ok:[respostas aceitas]}] }             → texto digitado confere (sem acento/maiúscula)
 *   pintar  { regioes:[{id, ok:'cor'|'circ'}] }                 → só as regiões com "ok" valem
 * Tipos que só aparecem na tela (não valem acerto automático):
 *   texto, figura, lado, aberta, e as regiões de "pintar" sem "ok".
 */
(function (root) {
  'use strict';

  function norm(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function regioesValendo(b) { return b.regioes.filter(function (r) { return r.ok; }); }

  function valendo(b) {
    if (b.tipo === 'pintar') return regioesValendo(b).length > 0;
    return b.tipo === 'marcar' || b.tipo === 'escolha' || b.tipo === 'campos' || b.tipo === 'arrastar';
  }

  function nItens(b) {
    if (b.tipo === 'pintar') return regioesValendo(b).length;
    return valendo(b) ? b.itens.length : 0;
  }

  function respostaVazia(b) {
    if (b.tipo === 'pintar') return {};
    if (b.tipo === 'marcar') return b.itens.map(function () { return false; });
    if (b.tipo === 'campos') return b.itens.map(function () { return ''; });
    return b.itens.map(function () { return null; });
  }

  function respondido(b, r) {
    if (!r) return false;
    if (b.tipo === 'pintar') return Object.keys(r).some(function (k) { return !!r[k]; });
    return r.some(function (x) { return x === true || (x !== false && x !== null && x !== undefined && x !== ''); });
  }

  /** Array de true/false: acertou cada item? */
  function corrigir(b, r) {
    r = r || respostaVazia(b);
    if (b.tipo === 'marcar') return b.itens.map(function (it, i) { return !!r[i] === it.ok; });
    if (b.tipo === 'escolha') return b.itens.map(function (it, i) { return r[i] !== null && r[i] !== undefined && r[i] === it.ok; });
    if (b.tipo === 'campos') {
      return b.itens.map(function (it, i) {
        var x = norm(r[i]);
        return !!x && it.ok.some(function (a) { return norm(a) === x; });
      });
    }
    if (b.tipo === 'arrastar') {
      return b.itens.map(function (it, i) { return r[i] !== null && r[i] !== undefined && b.banco[r[i]] === it.ok; });
    }
    if (b.tipo === 'pintar') return regioesValendo(b).map(function (g) { return r[g.id] === g.ok; });
    return [];
  }

  function respostaPerfeita(b) {
    if (b.tipo === 'pintar') { var o = {}; regioesValendo(b).forEach(function (g) { o[g.id] = g.ok; }); return o; }
    if (b.tipo === 'marcar') return b.itens.map(function (it) { return it.ok; });
    if (b.tipo === 'campos') return b.itens.map(function (it) { return it.ok[0]; });
    if (b.tipo === 'arrastar') return b.itens.map(function (it) { return b.banco.indexOf(it.ok); });
    return b.itens.map(function (it) { return it.ok; });
  }

  root.Corretor = {
    norm: norm, valendo: valendo, nItens: nItens, respostaVazia: respostaVazia,
    respondido: respondido, corrigir: corrigir, respostaPerfeita: respostaPerfeita
  };
})(typeof window !== 'undefined' ? window : this);
