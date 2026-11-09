
const botaoMenu = document.getElementById("botao-menu");
const menuNavegacao = document.getElementById("menu-navegacao");

botaoMenu.addEventListener("click", function () {
  const aberto = menuNavegacao.classList.toggle("aberto");

  botaoMenu.setAttribute("aria-expanded", String(aberto));
  botaoMenu.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
  botaoMenu.textContent = aberto ? "✕" : "☰";
});

const idsSecoes = ["inicio", "contato", "institucional", "lojas", "promocoes", "cardapio-recife", "cardapio-caruaru", "cardapio-salvador", "cardapio-feira-de-santana", "cardapio-fortaleza", "cardapio-juazeiro-do-norte", "conta", "privacidade", "carrinho", "identificar-pedido", "pagamento", "pedido-confirmado", "acompanhar-pedido"];

function mostrarSecao() {
  const idSolicitado = window.location.hash.slice(1);
  let idAtivo = idsSecoes.includes(idSolicitado) ? idSolicitado : "inicio";
  if (idAtivo.startsWith("cardapio-") && !window.RaizesCarrinho.podeAcessar(idAtivo.slice(9))) {
    const unidade = window.RaizesCarrinho.unidadePedido();
    idAtivo = unidade ? `cardapio-${unidade}` : "inicio";
    if (window.location.hash !== `#${idAtivo}`) history.replaceState(null, "", `#${idAtivo}`);
  }
  idsSecoes.forEach(id => {
    const secao = document.getElementById(id);
    if (secao) secao.hidden = id !== idAtivo;
  });

  if (typeof fecharListaUnidades === "function") fecharListaUnidades();
  menuNavegacao.classList.remove("aberto");
  botaoMenu.setAttribute("aria-expanded", "false");
  botaoMenu.setAttribute("aria-label", "Abrir menu");
  botaoMenu.textContent = "☰";

  if (idAtivo === "carrinho") window.RaizesCarrinho.mostrar();
  if (idAtivo === "acompanhar-pedido") window.RaizesCarrinho.acompanhar();
  window.scrollTo(0, 0);
}

window.addEventListener("hashchange", mostrarSecao);

const formularioContato = document.getElementById("form-contato");
const retornoContato = document.getElementById("contato-retorno");

if (formularioContato && retornoContato) {
  formularioContato.addEventListener("submit", function (evento) {
    evento.preventDefault();

    retornoContato.textContent =
      "Mensagem registrada com sucesso!\nAgradecemos seu contato com o Raízes do Nordeste!";

    formularioContato.reset();
  });
}

const botaoCardapio = document.getElementById("botao-cardapio");
const listaUnidades = document.getElementById("lista-unidades");

function fecharListaUnidades() {
  listaUnidades.hidden = true;
  botaoCardapio.setAttribute("aria-expanded", "false");
}

botaoCardapio.addEventListener("click", function () {
  const abrir = listaUnidades.hidden;
  listaUnidades.hidden = !abrir;
  botaoCardapio.setAttribute("aria-expanded", String(abrir));
});

document.addEventListener("click", function (evento) {
  if (!evento.target.closest(".menu-cardapio")) fecharListaUnidades();
});

document.addEventListener("keydown", function (evento) {
  if (evento.key === "Escape") fecharListaUnidades();
});

listaUnidades.querySelectorAll("[data-unidade]").forEach(botao => {
  botao.addEventListener("click", () => {
    const unidade = botao.dataset.unidade;
    fecharListaUnidades();
    if (!window.RaizesCarrinho.podeAcessar(unidade)) return;
    const destino = `#cardapio-${unidade}`;
    if (window.location.hash === destino) mostrarSecao();
    else window.location.hash = destino;
  });
});

// Produtos juninos ficam disponíveis somente em junho.
function estaNoPeriodoJunino(data = new Date()) {
  return data.getMonth() === 5; // Janeiro = 0; junho = 5.
}

const produtosRecife = [
  ["Cuscuz com queijo coalho",14.90,"salgados","cuscuz_com_queijo","Cuscuz de milho com queijo coalho grelhado."],
  ["Cuscuz com ovo e queijo",17.90,"salgados","cuscuz_com_ovo","Cuscuz, ovo e queijo coalho."],
  ["Tapioca com queijo coalho",13.90,"salgados","tapioca_com_queijo","Tapioca feita na hora com queijo coalho."],
  ["Tapioca de frango com queijo",18.90,"salgados","tapioca_de_frango_com_queijo","Frango desfiado e queijo derretido."],
  ["Tapioca de carne de sol",22.90,"salgados","tapioca_carne_de_sol","Carne de sol desfiada e queijo coalho."],
  ["Carne de sol com macaxeira",39.90,"salgados","carne_de_sol","Carne de sol acompanhada de macaxeira."],
  ["Baião de dois",29.90,"salgados","baião_de_2","Arroz, feijão e queijo coalho."],
  ["Feijoada nordestina",34.90,"salgados","feijoada_nordestina","Feijão-de-corda, carnes e temperos regionais."],
  ["Milho assado",8.90,"salgados","milho_assado","Espiga de milho assada.",true],
  ["Amendoim assado",7.90,"salgados","amendoins_assado","Porção de amendoim torrado.",true],
  ["Bolo de macaxeira",9.90,"doces","bolo_de_macaxeira","Fatia de bolo de macaxeira macio."],
  ["Bolo de milho",9.90,"doces","bolo_de_milho","Fatia de bolo de milho caseiro.",true],
  ["Bolo de rolo",12.90,"doces","bolo_de_rolo","Doce pernambucano de massa fina e goiabada."],
  ["Cartola nordestina",17.90,"doces","cartola_nordestina","Banana, queijo e canela."],
  ["Pudim de tapioca",12.90,"doces","pudim_tapioca","Pudim cremoso de tapioca."],
  ["Cocada",7.90,"doces","cocada","Doce tradicional de coco."],
  ["Bolo Souza Leão",13.90,"doces","bolo_souza_leao","Bolo pernambucano de mandioca, leite de coco e gemas."],
  ["Pamonha",11.90,"doces","pamonha","Pamonha doce de milho verde.",true],
  ["Canjica",10.90,"doces","canjica","Canjica cremosa com canela.",true],
  ["Café passado na hora",5.90,"bebidas","café","Café fresquinho, passado na hora."],
  ["Água de coco",9.90,"bebidas","agua_de_coco","Água de coco natural."],
  ["Suco de cajá",10.90,"bebidas","suco_caja","Suco refrescante de cajá."],
  ["Suco de caju",9.90,"bebidas","suco_caju","Suco de caju gelado."],
  ["Suco de graviola",12.90,"bebidas","suco_de_graviola","Suco cremoso de graviola."],
  ["Suco de mangaba",11.90,"bebidas","suco_de_mangaba","Suco cremoso preparado com polpa de mangaba."],
];

const produtosCaruaru = [
  ["Cuscuz com ovo e queijo",17.90,"salgados","cuscuz_com_ovo","Cuscuz, ovo e queijo coalho."],
  ["Cuscuz com queijo coalho",14.90,"salgados","cuscuz_com_queijo","Cuscuz de milho com queijo coalho grelhado."],
  ["Tapioca com queijo coalho",13.90,"salgados","tapioca_com_queijo","Tapioca feita na hora com queijo coalho."],
  ["Tapioca de frango com queijo",18.90,"salgados","tapioca_de_frango_com_queijo","Frango desfiado e queijo derretido."],
  ["Bolo de macaxeira",9.90,"doces","bolo_de_macaxeira","Fatia de bolo de macaxeira macio."],
  ["Bolo de rolo",12.90,"doces","bolo_de_rolo","Doce pernambucano de massa fina e goiabada."],
  ["Cocada",7.90,"doces","cocada","Doce tradicional de coco."],
  ["Café passado na hora",5.90,"bebidas","café","Café fresquinho, passado na hora."],
  ["Água de coco",9.90,"bebidas","agua_de_coco","Água de coco natural."],
  ["Suco de cajá",10.90,"bebidas","suco_caja","Suco refrescante de cajá."],
  ["Pamonha",11.90,"doces","pamonha","Pamonha doce de milho verde.",true],
  ["Canjica",10.90,"doces","canjica","Canjica cremosa com canela.",true],
  ["Bolo de milho",9.90,"doces","bolo_de_milho","Fatia de bolo de milho caseiro.",true],
  ["Milho assado",8.90,"salgados","milho_assado","Espiga de milho assada.",true],
  ["Amendoim assado",7.90,"salgados","amendoins_assado","Porção de amendoim torrado.",true],
];

const produtosSalvador = [
  ["Acarajé",19.90,"salgados","acarajé","Bolinho de feijão-fradinho com recheio típico."],
  ["Vatapá",24.90,"salgados","vatapa","Creme tradicional com camarão e especiarias."],
  ["Caruru",24.90,"salgados","caruru","Quiabo com camarão seco e temperos."],
  ["Moqueca de peixe",42.90,"salgados","moqueca_peixe","Peixe com leite de coco e temperos."],
  ["Tapioca com queijo coalho",13.90,"salgados","tapioca_com_queijo","Tapioca feita na hora com queijo coalho."],
  ["Tapioca de frango com queijo",18.90,"salgados","tapioca_de_frango_com_queijo","Frango desfiado e queijo derretido."],
  ["Cuscuz com ovo e queijo",17.90,"salgados","cuscuz_com_ovo","Cuscuz, ovo e queijo coalho."],
  ["Cocada",7.90,"doces","cocada","Doce tradicional de coco."],
  ["Bolo de macaxeira",9.90,"doces","bolo_de_macaxeira","Fatia de bolo de macaxeira macio."],
  ["Pudim de tapioca",12.90,"doces","pudim_tapioca","Pudim cremoso de tapioca."],
  ["Café passado na hora",5.90,"bebidas","café","Café fresquinho, passado na hora."],
  ["Água de coco",9.90,"bebidas","agua_de_coco","Água de coco natural."],
  ["Suco de caju",9.90,"bebidas","suco_caju","Suco de caju gelado."],
  ["Suco de graviola",12.90,"bebidas","suco_de_graviola","Suco cremoso de graviola."],
  ["Canjica",10.90,"doces","canjica","Canjica cremosa com canela.",true],
  ["Pamonha",11.90,"doces","pamonha","Pamonha doce de milho verde.",true],
  ["Bolo de milho",9.90,"doces","bolo_de_milho","Fatia de bolo de milho caseiro.",true],
];

const produtosFeira = [
  ["Cuscuz com ovo e queijo",17.90,"salgados","cuscuz_com_ovo","Cuscuz, ovo e queijo coalho."],
  ["Cuscuz com queijo coalho",14.90,"salgados","cuscuz_com_queijo","Cuscuz de milho com queijo coalho grelhado."],
  ["Tapioca com queijo coalho",13.90,"salgados","tapioca_com_queijo","Tapioca feita na hora com queijo coalho."],
  ["Tapioca de frango com queijo",18.90,"salgados","tapioca_de_frango_com_queijo","Frango desfiado e queijo derretido."],
  ["Cocada",7.90,"doces","cocada","Doce tradicional de coco."],
  ["Bolo de macaxeira",9.90,"doces","bolo_de_macaxeira","Fatia de bolo de macaxeira macio."],
  ["Pudim de tapioca",12.90,"doces","pudim_tapioca","Pudim cremoso de tapioca."],
  ["Café passado na hora",5.90,"bebidas","café","Café fresquinho, passado na hora."],
  ["Água de coco",9.90,"bebidas","agua_de_coco","Água de coco natural."],
  ["Suco de caju",9.90,"bebidas","suco_caju","Suco de caju gelado."],
  ["Pamonha",11.90,"doces","pamonha","Pamonha doce de milho verde.",true],
  ["Canjica",10.90,"doces","canjica","Canjica cremosa com canela.",true],
  ["Amendoim assado",7.90,"salgados","amendoins_assado","Porção de amendoim torrado.",true],
];

const produtosFortaleza = [
  ["Doce de caju",10.90,"doces","doce_de_caju","Doce regional de caju; safra simulada de setembro a dezembro.",false,[9,10,11,12]],
  ["Baião de dois",29.90,"salgados","baião_de_2","Arroz, feijão e queijo coalho."],
  ["Carne de sol com macaxeira",39.90,"salgados","carne_de_sol","Carne de sol acompanhada de macaxeira."],
  ["Feijoada nordestina",34.90,"salgados","feijoada_nordestina","Feijão-de-corda, carnes e temperos regionais."],
  ["Cuscuz com ovo e queijo",17.90,"salgados","cuscuz_com_ovo","Cuscuz, ovo e queijo coalho."],
  ["Cuscuz com queijo coalho",14.90,"salgados","cuscuz_com_queijo","Cuscuz de milho com queijo coalho grelhado."],
  ["Tapioca de carne de sol",22.90,"salgados","tapioca_carne_de_sol","Carne de sol desfiada e queijo coalho."],
  ["Tapioca com queijo coalho",13.90,"salgados","tapioca_com_queijo","Tapioca feita na hora com queijo coalho."],
  ["Bolo de macaxeira",9.90,"doces","bolo_de_macaxeira","Fatia de bolo de macaxeira macio."],
  ["Cartola nordestina",17.90,"doces","cartola_nordestina","Banana, queijo e canela."],
  ["Cocada",7.90,"doces","cocada","Doce tradicional de coco."],
  ["Pudim de tapioca",12.90,"doces","pudim_tapioca","Pudim cremoso de tapioca."],
  ["Café passado na hora",5.90,"bebidas","café","Café fresquinho, passado na hora."],
  ["Água de coco",9.90,"bebidas","agua_de_coco","Água de coco natural."],
  ["Suco de cajá",10.90,"bebidas","suco_caja","Suco refrescante de cajá."],
  ["Suco de caju",9.90,"bebidas","suco_caju","Suco de caju gelado."],
  ["Cajuína",9.90,"bebidas","cajuína","Bebida regional de caju."],
  ["Pamonha",11.90,"doces","pamonha","Pamonha doce de milho verde.",true],
  ["Canjica",10.90,"doces","canjica","Canjica cremosa com canela.",true],
  ["Bolo de milho",9.90,"doces","bolo_de_milho","Fatia de bolo de milho caseiro.",true],
  ["Milho assado",8.90,"salgados","milho_assado","Espiga de milho assada.",true],
];

const produtosJuazeiro = [
  ["Umbuzada",12.90,"bebidas","umbuzada","Bebida cremosa de umbu; safra simulada de dezembro a março.",false,[12,1,2,3]],
  ["Cuscuz com ovo e queijo",17.90,"salgados","cuscuz_com_ovo","Cuscuz, ovo e queijo coalho."],
  ["Cuscuz com queijo coalho",14.90,"salgados","cuscuz_com_queijo","Cuscuz de milho com queijo coalho grelhado."],
  ["Tapioca com queijo coalho",13.90,"salgados","tapioca_com_queijo","Tapioca feita na hora com queijo coalho."],
  ["Tapioca de carne de sol",22.90,"salgados","tapioca_carne_de_sol","Carne de sol desfiada e queijo coalho."],
  ["Bolo de macaxeira",9.90,"doces","bolo_de_macaxeira","Fatia de bolo de macaxeira macio."],
  ["Cocada",7.90,"doces","cocada","Doce tradicional de coco."],
  ["Bolo de rolo",12.90,"doces","bolo_de_rolo","Doce pernambucano de massa fina e goiabada."],
  ["Café passado na hora",5.90,"bebidas","café","Café fresquinho, passado na hora."],
  ["Suco de cajá",10.90,"bebidas","suco_caja","Suco refrescante de cajá."],
  ["Cajuína",9.90,"bebidas","cajuína","Bebida regional de caju."],
  ["Pamonha",11.90,"doces","pamonha","Pamonha doce de milho verde.",true],
  ["Bolo de milho",9.90,"doces","bolo_de_milho","Fatia de bolo de milho caseiro.",true],
  ["Amendoim assado",7.90,"salgados","amendoins_assado","Porção de amendoim torrado.",true],
];

const formatoReais = new Intl.NumberFormat("pt-BR", {style:"currency", currency:"BRL"});

window.RaizesImagensProdutos = Object.fromEntries(
  [produtosRecife, produtosCaruaru, produtosSalvador, produtosFeira, produtosFortaleza, produtosJuazeiro]
    .flat().map(produto => [produto[0], produto[3]])
);

const comboCafeRaizes = [
  "Combo Café com Raízes", 14.90, "promocoes", "tapioca_com_queijo",
  "Tapioca com queijo coalho + café passado na hora"
];

function renderizarProdutos(grade, botoesCategoria, produtos, categoria) {
  grade.replaceChildren();
  (categoria === "promocoes" ? [comboCafeRaizes] : produtos.filter(produto => categoria === "junino" ? produto[5] === true : produto[2] === categoria && produto[5] !== true)).forEach(produto => {
    const [nome,preco,,arquivo,descricao,junino,mesesDisponiveis] = produto;
    const cartao = document.createElement("article");
    cartao.className = "cartao-produto";
    const imagem = document.createElement("img");
    imagem.src = `assets/${arquivo}.webp`;
    imagem.alt = nome;
    imagem.loading = "lazy";
    imagem.onerror = function () { this.hidden = true; cartao.classList.add("sem-foto"); };
    const corpo = document.createElement("div");
    corpo.className = "dados-produto";
    const titulo = document.createElement("h2"); titulo.textContent = nome;
    const texto = document.createElement("p"); texto.textContent = descricao;
    const valor = document.createElement("strong"); valor.textContent = formatoReais.format(preco);
    corpo.append(titulo,texto);
    if (categoria === "promocoes") {
      const oferta = document.createElement("p");
      oferta.className = "promocao-preco";
      oferta.textContent = "De R$ 19,80 por R$ 14,90";
      corpo.append(oferta);
    }
    if (junino) {
      const disponivel = estaNoPeriodoJunino();
      cartao.classList.toggle("produto-indisponivel", !disponivel);
      const selo = document.createElement("span"); selo.className = "selo-junino";
      selo.textContent = disponivel
        ? "🌽 Especial de São João — disponível em junho"
        : "🌽 Fora de temporada — disponível de 1º a 30 de junho";
      corpo.append(selo);
      const status = document.createElement("p");
      status.className = "status-sazonal";
      status.textContent = disponivel
        ? "Produto em temporada."
        : "Indisponível para compra nesta data.";
      corpo.append(status);
    }
    if (mesesDisponiveis) {
      const mesAtual = new Date().getMonth() + 1;
      const disponivel = mesesDisponiveis.includes(mesAtual);
      const status = document.createElement("p");
      status.className = "status-sazonal";
      status.textContent = disponivel
        ? "Produto em temporada."
        : "Indisponível para compra nesta data.";
      corpo.append(status);
    }
    corpo.append(valor);
    const disponivelAgora = (!junino || estaNoPeriodoJunino()) &&
      (!mesesDisponiveis || mesesDisponiveis.includes(new Date().getMonth() + 1));
    const escolha = document.createElement("div");
    escolha.className = "produto-escolha";
    const quantidadeControle = document.createElement("div");
    quantidadeControle.className = "produto-quantidade";
    let quantidadeSelecionada = 1;
    const menos = document.createElement("button");
    menos.type = "button";
    menos.textContent = "−";
    menos.setAttribute("aria-label", `Diminuir quantidade de ${nome}`);
    const numero = document.createElement("span");
    numero.textContent = "1";
    numero.setAttribute("aria-live", "polite");
    const mais = document.createElement("button");
    mais.type = "button";
    mais.textContent = "+";
    mais.setAttribute("aria-label", `Aumentar quantidade de ${nome}`);
    const atualizarPrecoPromocional = () => {
      if (categoria === "promocoes") {
        valor.textContent = formatoReais.format(preco * quantidadeSelecionada);
      }
    };
    menos.disabled = true;
    menos.addEventListener("click", () => {
      quantidadeSelecionada = Math.max(1, quantidadeSelecionada - 1);
      numero.textContent = quantidadeSelecionada;
      atualizarPrecoPromocional();
      menos.disabled = quantidadeSelecionada === 1;
    });
    mais.addEventListener("click", () => {
      quantidadeSelecionada++;
      numero.textContent = quantidadeSelecionada;
      atualizarPrecoPromocional();
      menos.disabled = false;
    });
    quantidadeControle.append(menos, numero, mais);
    const adicionar = document.createElement("button");
    adicionar.type = "button";
    adicionar.className = "fluxo-adicionar";
    adicionar.textContent = disponivelAgora ? "Adicionar" : "Indisponível";
    adicionar.disabled = !disponivelAgora;
    menos.disabled = !disponivelAgora;
    mais.disabled = !disponivelAgora;
    adicionar.addEventListener("click", () => {
      const unidade = grade.id.replace("produtos-", "");
      if (!window.RaizesCarrinho.adicionar(nome, preco, unidade, quantidadeSelecionada, arquivo)) return;
      adicionar.textContent = "Adicionado!";
      quantidadeSelecionada = 1;
      numero.textContent = "1";
      atualizarPrecoPromocional();
      menos.disabled = true;
      setTimeout(() => { adicionar.textContent = "Adicionar"; }, 1000);
    });
    escolha.append(quantidadeControle, adicionar);
    corpo.append(escolha);
    cartao.append(imagem,corpo);
    grade.append(cartao);
  });
  botoesCategoria.forEach(botao => {
    const ativo = botao.dataset.categoria === categoria;
    botao.classList.toggle("categoria-ativa", ativo);
    botao.setAttribute("aria-pressed", String(ativo));
  });
}

function configurarCardapio(idSecao, idGrade, produtos) {
  const secao = document.getElementById(idSecao);
  const grade = document.getElementById(idGrade);
  const botoes = secao.querySelectorAll("[data-categoria]");
  botoes.forEach(botao => botao.addEventListener("click", () => {
    renderizarProdutos(grade, botoes, produtos, botao.dataset.categoria);
  }));
  renderizarProdutos(grade, botoes, produtos, "salgados");
}

configurarCardapio("cardapio-recife", "produtos-recife", produtosRecife);
configurarCardapio("cardapio-caruaru", "produtos-caruaru", produtosCaruaru);
configurarCardapio("cardapio-salvador", "produtos-salvador", produtosSalvador);
configurarCardapio("cardapio-feira-de-santana", "produtos-feira-de-santana", produtosFeira);
configurarCardapio("cardapio-fortaleza", "produtos-fortaleza", produtosFortaleza);
configurarCardapio("cardapio-juazeiro-do-norte", "produtos-juazeiro-do-norte", produtosJuazeiro);

mostrarSecao();
