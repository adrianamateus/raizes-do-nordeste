// Dados e armazenamento locais usados apenas nesta demonstração.
window.RaizesDados = Object.freeze({ clientesExemplo: [], regrasClube: { pontosPorReal: 1, pontosParaResgate: 100, descontoResgate: 10 } });

window.RaizesEstado = {
  ler(chave, padrao) { try { return JSON.parse(localStorage.getItem("raizes_demo_" + chave)) ?? padrao; } catch { return padrao; } },
  salvar(chave, valor) { localStorage.setItem("raizes_demo_" + chave, JSON.stringify(valor)); },
  remover(chave) { localStorage.removeItem("raizes_demo_" + chave); }
};

(() => {
  const E = window.RaizesEstado;
  const nomes = {
    recife: "Recife", caruaru: "Caruaru", salvador: "Salvador",
    "feira-de-santana": "Feira de Santana", fortaleza: "Fortaleza",
    "juazeiro-do-norte": "Juazeiro do Norte"
  };
  const reais = valor => valor.toLocaleString("pt-BR", {style:"currency",currency:"BRL"});
  let itens = E.ler("carrinho", []);
  let unidadeAtual = E.ler("unidade-carrinho", "recife");
  const avisoUnidade = document.getElementById("aviso-unidade");
  let temporizadorAviso;
  function ocultarAviso() {
    clearTimeout(temporizadorAviso);
    avisoUnidade.hidden = true;
    avisoUnidade.textContent = "";
  }
  window.addEventListener("hashchange", ocultarAviso);
  function unidadePedido() { return itens.length ? unidadeAtual : null; }
  function podeAcessar(unidade) {
    if (itens.length && unidade !== unidadeAtual) {
      avisoUnidade.textContent = `Seu pedido está vinculado à unidade ${nomes[unidadeAtual]}. Para escolher outra unidade, finalize o pedido ou esvazie o carrinho.`;
      avisoUnidade.hidden = false;
      clearTimeout(temporizadorAviso);
      temporizadorAviso = setTimeout(ocultarAviso, 4000);
      return false;
    }
    ocultarAviso();
    return true;
  }

  const regras = window.RaizesDados.regrasClube;
  let resgatar = false;
  const clienteLogado = () => {
    const email = E.ler("sessao", null);
    return E.ler("clientes", []).find(c => c.email === email) || null;
  };
  const subtotalPedido = () => Math.round(itens.reduce((s, item) => s + Math.round(item.preco * 100) * item.quantidade, 0)) / 100;
  const descontoAtual = () => {
    const cliente = clienteLogado();
    return resgatar && cliente && (cliente.pontos || 0) >= regras.pontosParaResgate && subtotalPedido() >= regras.descontoResgate ? regras.descontoResgate : 0;
  };
  function atualizarClube() {
    const cliente = clienteLogado();
    const area = document.getElementById("clube-saldo-area");
    const check = document.getElementById("clube-resgatar");
    const linha = document.getElementById("clube-resgate-linha");
    area.hidden = !cliente;
    document.getElementById("clube-instrucao").hidden = !!cliente;
    if (!cliente) resgatar = false;
    if (cliente) {
      const pontos = cliente.pontos || 0;
      document.getElementById("clube-saldo").textContent = `Seus pontos disponíveis: ${pontos}`;
      const disponivel = pontos >= regras.pontosParaResgate && subtotalPedido() >= regras.descontoResgate;
      linha.hidden = !disponivel;
      if (!disponivel) resgatar = false;
      document.getElementById("clube-resgate-aviso").textContent = disponivel ? "O desconto e os pontos serão confirmados ao registrar o pedido demonstrativo." : `Acumule ${regras.pontosParaResgate} pontos para trocar por R$ ${regras.descontoResgate},00 de desconto.`;
    }
    check.checked = resgatar;
    const subtotal = subtotalPedido(), desconto = descontoAtual();
    document.getElementById("carrinho-subtotal").textContent = `Subtotal: ${reais(subtotal)}`;
    const descontoLinha = document.getElementById("carrinho-desconto");
    descontoLinha.hidden = !desconto;
    descontoLinha.textContent = `Desconto Clube Raízes: − ${reais(desconto)}`;
    document.getElementById("carrinho-total").textContent = `Total: ${reais(subtotal - desconto)}`;
  }
  document.getElementById("clube-resgatar").addEventListener("change", e => {
    resgatar = e.target.checked;
    atualizarClube();
  });
  window.addEventListener("raizes-sessao-alterada", () => { resgatar = false; atualizarClube(); });

  function guardar() {
    E.salvar("carrinho", itens);
    E.salvar("unidade-carrinho", unidadeAtual);
    document.getElementById("quantidade-carrinho").textContent = itens.reduce((s, item) => s + item.quantidade, 0);
  }
  function adicionar(nome, preco, unidade, quantidade = 1, arquivo = "") {
    if (!podeAcessar(unidade)) return false;
    if (itens.length === 0) unidadeAtual = unidade;
    const existente = itens.find(item => item.nome === nome);
    if (existente) { existente.quantidade += quantidade; if (!existente.arquivo) existente.arquivo = arquivo; }
    else itens.push({nome, preco, quantidade, arquivo});
    guardar();
    return true;
  }
  function mostrar() {
    const lista = document.getElementById("carrinho-itens");
    lista.replaceChildren();
    document.getElementById("carrinho-unidade").textContent = itens.length ? `Unidade: ${nomes[unidadeAtual]}` : "";
    document.getElementById("continuar-comprando").href = itens.length ? `#cardapio-${unidadeAtual}` : "#inicio";
    document.getElementById("carrinho-aviso").textContent = "";
    if (!itens.length) {
      const vazio = document.createElement("p");
      vazio.textContent = "Seu carrinho está vazio.";
      lista.append(vazio);
    }
    itens.forEach((item, indice) => {
      const linha = document.createElement("div");
      linha.className = "carrinho-item";
      const foto = document.createElement("img");
      foto.className = "carrinho-foto";
      const arquivo = item.arquivo || (window.RaizesImagensProdutos || {})[item.nome] || "";
      if (arquivo && !item.arquivo) { item.arquivo = arquivo; guardar(); }
      foto.src = `assets/${arquivo}.webp`;
      foto.alt = item.nome;
      foto.loading = "lazy";
      foto.onerror = () => { foto.classList.add("carrinho-foto-indisponivel"); foto.removeAttribute("src"); foto.alt = "Imagem indisponível"; };
      const descricao = document.createElement("div");
      descricao.className = "carrinho-descricao";
      const nome = document.createElement("strong"); nome.textContent = item.nome;
      const preco = document.createElement("p"); preco.textContent = `${reais(item.preco)} cada`;
      descricao.append(nome, preco);
      const controles = document.createElement("div"); controles.className = "carrinho-controles";
      const menos = document.createElement("button"); menos.textContent = "−"; menos.setAttribute("aria-label", `Diminuir ${item.nome}`);
      const quantidade = document.createElement("span"); quantidade.textContent = item.quantidade;
      const mais = document.createElement("button"); mais.textContent = "+"; mais.setAttribute("aria-label", `Aumentar ${item.nome}`);
      const remover = document.createElement("button"); remover.textContent = "Remover"; remover.className = "carrinho-remover";
      menos.addEventListener("click", () => { if (item.quantidade > 1) item.quantidade--; else itens.splice(indice, 1); guardar(); mostrar(); });
      mais.addEventListener("click", () => { item.quantidade++; guardar(); mostrar(); });
      remover.addEventListener("click", () => { itens.splice(indice, 1); guardar(); mostrar(); });
      controles.append(menos, quantidade, mais);
      const subtotal = document.createElement("strong"); subtotal.className = "carrinho-subtotal"; subtotal.textContent = reais(item.preco * item.quantidade);
      descricao.append(subtotal);
      const ajustes = document.createElement("div");
      ajustes.className = "carrinho-ajustes";
      ajustes.append(controles, remover);
      linha.append(foto, descricao, ajustes);
      lista.append(linha);
    });
    const total = itens.reduce((s, item) => s + item.preco * item.quantidade, 0);
    atualizarClube();
    document.getElementById("finalizar-pedido").disabled = itens.length === 0;
  }
  const formularioPedido = document.getElementById("form-identificar-pedido");
  document.getElementById("finalizar-pedido").addEventListener("click", () => {
    if (!itens.length) return;
    const email = E.ler("sessao", null);
    const cliente = E.ler("clientes", []).find(c => c.email === email);
    document.getElementById("pedido-nome").value = cliente ? cliente.nome.trim().split(/\s+/)[0] : "";
    atualizarClube();
    document.getElementById("pedido-resumo").textContent = `Total do pedido: ${reais(subtotalPedido() - descontoAtual())}`;
    document.getElementById("pedido-erro").textContent = "";
    window.location.hash = "#identificar-pedido";
  });
  let nomePendente = "";
  formularioPedido.addEventListener("submit", evento => {
    evento.preventDefault();
    if (!itens.length) {
      document.getElementById("pedido-erro").textContent = "Seu carrinho está vazio.";
      return;
    }
    const nome = document.getElementById("pedido-nome").value.trim().split(/\s+/)[0];
    if (!nome || nome.length < 2) {
      document.getElementById("pedido-erro").textContent = "Informe um nome com pelo menos duas letras.";
      return;
    }
    nomePendente = nome;
    document.getElementById("pagamento-forma").value = "";
    document.getElementById("pagamento-retorno").textContent = "";
    window.location.hash = "#pagamento";
  });

  let processando = false;
  const botaoAprovar = document.getElementById("pagamento-enviar");
  const botaoRecusar = document.getElementById("pagamento-recusar");
  function bloquearPagamento(valor) {
    processando = valor;
    botaoAprovar.disabled = valor;
    botaoRecusar.disabled = valor;
  }
  function simularPagamento(aprovado) {
    if (processando || !itens.length || !nomePendente) return;
    const forma = document.getElementById("pagamento-forma").value;
    const retorno = document.getElementById("pagamento-retorno");
    if (!forma) { retorno.textContent = "Escolha a forma de pagamento."; return; }
    bloquearPagamento(true);
    retorno.textContent = "Enviando solicitação ao serviço externo (simulação)...";
    setTimeout(() => {
      bloquearPagamento(false);
      if (!aprovado) {
        retorno.textContent = "Pagamento recusado (simulação). Nenhum pedido foi confirmado e nenhum ponto foi movimentado. Você pode tentar novamente.";
        return;
      }
      registrarPedido(forma);
    }, 700);
  }
  document.getElementById("form-pagamento").addEventListener("submit", evento => evento.preventDefault());
  botaoAprovar.type = "button";
  botaoAprovar.addEventListener("click", () => simularPagamento(true));
  botaoRecusar.addEventListener("click", () => simularPagamento(false));

  function registrarPedido(forma) {
    if (!itens.length) return;
    const chave = `sequencia-pedido-${unidadeAtual}`;
    const numero = E.ler(chave, 0) + 1;
    const subtotal = subtotalPedido();
    const cliente = clienteLogado();
    const desconto = descontoAtual();
    const total = Math.round((subtotal - desconto) * 100) / 100;
    const pontosGanhos = cliente ? Math.floor(total) * regras.pontosPorReal : 0;
    if (cliente) {
      const clientes = E.ler("clientes", []);
      const indice = clientes.findIndex(c => c.email === cliente.email);
      if (indice !== -1) {
        clientes[indice].pontos = (clientes[indice].pontos || 0) - (desconto ? regras.pontosParaResgate : 0) + pontosGanhos;
        E.salvar("clientes", clientes);
        window.dispatchEvent(new Event("raizes-pontos-atualizados"));
      }
    }
    const pedido = {
      numero, unidade: unidadeAtual, nome: nomePendente, total,
      itens: itens.map(item => ({...item})), data: new Date().toISOString(),
      situacao: "Recebido", inicioAcompanhamento: null, pagamento: `Aprovado (${forma}, simulação)`,
      subtotal, desconto, pontosGanhos,
      pontosResgatados: desconto ? regras.pontosParaResgate : 0
    };
    E.salvar(chave, numero);
    E.salvar("ultimo-pedido", pedido);
    document.getElementById("pedido-confirmado-unidade").textContent = `Unidade: ${nomes[unidadeAtual]}`;
    document.getElementById("pedido-confirmado-numero").textContent = `🌵 ${String(numero).padStart(4, "0")}`;
    document.getElementById("pedido-confirmado-nome").textContent = `Cliente: ${nomePendente}`;
    document.getElementById("pedido-confirmado-total").textContent = `Total: ${reais(total)}${desconto ? ` (desconto de ${reais(desconto)} aplicado)` : ""}`;
    document.getElementById("pedido-confirmado-pagamento").textContent = "Aprovado";
    document.getElementById("pedido-confirmado-situacao").textContent = pedido.situacao;
    itens = [];
    resgatar = false;
    nomePendente = "";
    guardar();
    window.location.hash = "#pedido-confirmado";
  }

  const etapas = ["Pedido recebido", "Em preparação", "Pronto para retirada", "Entregue"];
  const intervaloEtapa = 3000;
  let temporizadorEtapas;
  let pedidoEmExibicao = null;

  function acompanhar() {
    clearTimeout(temporizadorEtapas);
    const pedido = E.ler("ultimo-pedido", null);
    const identificacao = document.getElementById("acompanhamento-identificacao");
    const situacao = document.getElementById("acompanhamento-situacao");
    const lista = document.getElementById("acompanhamento-etapas");
    lista.replaceChildren();
    if (!pedido) {
      identificacao.textContent = "Nenhum pedido registrado neste navegador.";
      situacao.textContent = "";
      return;
    }

    identificacao.textContent = `Senha de retirada 🌵 ${String(pedido.numero).padStart(4, "0")} • ${nomes[pedido.unidade]} • ${pedido.nome}`;
    const chavePedido = `${pedido.unidade}:${pedido.numero}`;
    if (pedidoEmExibicao !== chavePedido) {
      pedidoEmExibicao = chavePedido;
      if (!Number.isInteger(pedido.etapaAcompanhamento)) {
        pedido.etapaAcompanhamento = 0;
        pedido.situacao = etapas[0];
        E.salvar("ultimo-pedido", pedido);
      }
    }

    const indice = Math.min(Math.max(pedido.etapaAcompanhamento || 0, 0), etapas.length - 1);
    situacao.textContent = `Situação atual: ${etapas[indice]}`;
    etapas.forEach((etapa, posicao) => {
      const item = document.createElement("li");
      const concluida = posicao <= indice;
      item.className = concluida ? "etapa-concluida" : "etapa-pendente";
      item.textContent = `${concluida ? "✓ " : "○ "}${etapa}`;
      if (posicao === indice) item.setAttribute("aria-current", "step");
      lista.appendChild(item);
    });

    if (indice < etapas.length - 1 && window.location.hash === "#acompanhar-pedido") {
      temporizadorEtapas = setTimeout(() => {
        if (window.location.hash !== "#acompanhar-pedido") return;
        const atual = E.ler("ultimo-pedido", null);
        if (!atual || `${atual.unidade}:${atual.numero}` !== chavePedido) return;
        atual.etapaAcompanhamento = indice + 1;
        atual.situacao = etapas[indice + 1];
        E.salvar("ultimo-pedido", atual);
        acompanhar();
      }, intervaloEtapa);
    }
  }

  window.addEventListener("hashchange", () => {
    if (window.location.hash !== "#acompanhar-pedido") clearTimeout(temporizadorEtapas);
  });
  window.RaizesCarrinho = {adicionar, mostrar, podeAcessar, unidadePedido, acompanhar};
  guardar();
})();
