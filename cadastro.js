(() => {
  const E = window.RaizesEstado;
  const cadastro = document.getElementById("form-cadastro");
  const login = document.getElementById("form-login");
  let voltarAoCarrinho = false;
  document.getElementById("carrinho-entrar")?.addEventListener("click", () => {
    voltarAoCarrinho = true;
  });
  document.getElementById("clube-acesso-conta")?.addEventListener("click", () => {
    voltarAoCarrinho = false;
  });
  const concluirAcesso = () => {
    if (voltarAoCarrinho) {
      voltarAoCarrinho = false;
      window.location.hash = "#carrinho";
    }
  };
  const digitos = s => String(s).replace(/\D/g, "");
  const msg = (id, texto) => document.getElementById(id).textContent = texto;
  const cpfValido = cpf => {
    const n = digitos(cpf);
    if (n.length !== 11 || /^(\d)\1{10}$/.test(n)) return false;
    for (let t = 9; t < 11; t++) {
      let soma = 0;
      for (let i = 0; i < t; i++) soma += Number(n[i]) * (t + 1 - i);
      const d = (soma * 10) % 11;
      if (Number(n[t]) !== (d === 10 ? 0 : d)) return false;
    }
    return true;
  };
  const hashSenha = async senha => {
    if (!window.crypto?.subtle) throw new Error("Abra o protótipo por localhost ou HTTPS para usar o cadastro demonstrativo.");
    const bytes = new TextEncoder().encode(senha);
    return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))).map(b => b.toString(16).padStart(2,"0")).join("");
  };
  const idade = data => {
    const n = new Date(data + "T12:00:00"), hoje = new Date();
    if (isNaN(n.getTime()) || n > hoje) return -1;
    let anos = hoje.getFullYear() - n.getFullYear();
    if (hoje.getMonth() < n.getMonth() || (hoje.getMonth() === n.getMonth() && hoje.getDate() < n.getDate())) anos--;
    return anos;
  };
  const atualizar = () => {
    const email = E.ler("sessao", null);
    const usuario = E.ler("clientes", []).find(c => c.email === email);
    document.getElementById("conta-logada").hidden = !usuario;
    document.getElementById("conta-formularios").hidden = !!usuario;
    if (usuario) {
      const mostrar = (id, valor) => { document.getElementById(id).textContent = valor; };
      const cpf = usuario.cpf || "";
      const telefone = usuario.telefone || "";
      const nascimento = usuario.nascimento || "";
      mostrar("conta-nome", usuario.nome);
      mostrar("conta-nome-completo", usuario.nome);
      mostrar("conta-cpf", cpf.length === 11 ? `***.***.***-${cpf.slice(9)}` : cpf);
      mostrar("conta-nascimento", nascimento ? nascimento.split("-").reverse().join("/") : "Não informado");
      mostrar("conta-email", usuario.email);
      mostrar("conta-telefone", telefone.length === 11 ? `(${telefone.slice(0,2)}) ${telefone.slice(2,7)}-${telefone.slice(7)}` : telefone.length === 10 ? `(${telefone.slice(0,2)}) ${telefone.slice(2,6)}-${telefone.slice(6)}` : telefone);
      mostrar("conta-pontos", `${usuario.pontos || 0} pontos`);
    }
    const acesso = document.getElementById("clube-acesso-conta");
    if (acesso) acesso.textContent = usuario ? "Acessar minha conta" : "Entrar / Cadastrar";
    const textoAcesso = document.getElementById("clube-acesso-texto");
    if (textoAcesso) textoAcesso.textContent = usuario ? "Você já participa do Clube Raízes!" : "Ainda não participa? Entre ou faça seu cadastro gratuito.";
    const saudacao = document.getElementById("carrinho-saudacao");
    if (saudacao) {
      saudacao.hidden = !usuario;
      saudacao.textContent = usuario ? `Olá, ${usuario.nome.trim().split(/\s+/)[0]}! 🌵` : "";
    }
    window.dispatchEvent(new Event("raizes-sessao-alterada"));
  };
  cadastro.cpf.addEventListener("input", e => { const n = digitos(e.target.value).slice(0,11); e.target.value = n.replace(/^(\d{3})(\d)/,"$1.$2").replace(/^(\d{3})\.(\d{3})(\d)/,"$1.$2.$3").replace(/\.(\d{3})(\d)/,".$1-$2"); });
  cadastro.telefone.addEventListener("input", e => { const n = digitos(e.target.value).slice(0,11); e.target.value = n.length <= 2 ? n : `(${n.slice(0,2)}) ${n.slice(2, n.length === 11 ? 7 : 6)}${n.length > (n.length === 11 ? 7 : 6) ? "-" + n.slice(n.length === 11 ? 7 : 6) : ""}`; });
  cadastro.addEventListener("submit", async evento => {
    evento.preventDefault();
    const f = new FormData(cadastro), email = f.get("email").trim().toLowerCase(), cpf = digitos(f.get("cpf"));
    if (!cpfValido(cpf)) return msg("cadastro-mensagem", "CPF inválido. Confira os números.");
    if (idade(f.get("nascimento")) < 12) return msg("cadastro-mensagem", "Cadastro permitido a partir de 12 anos completos.");
    if (digitos(f.get("telefone")).length < 10 || digitos(f.get("telefone")).length > 11) return msg("cadastro-mensagem", "Informe telefone com DDD.");
    if (f.get("senha") !== f.get("confirmar")) return msg("cadastro-mensagem", "As senhas não coincidem.");
    if (!f.get("consentimento")) return msg("cadastro-mensagem", "É necessário consentir para participar do Clube.");
    const clientes = E.ler("clientes", []);
    if (clientes.some(c => c.cpf === cpf || c.email === email)) return msg("cadastro-mensagem", "CPF ou e-mail já cadastrado neste navegador.");
    try {
      const senhaHash = await hashSenha(f.get("senha"));
      clientes.push({nome:f.get("nome").trim(), cpf, nascimento:f.get("nascimento"), email, telefone:digitos(f.get("telefone")), senhaHash, consentimentoEm:new Date().toISOString()});
      E.salvar("clientes", clientes); E.salvar("sessao", email); cadastro.reset(); atualizar(); concluirAcesso();
    } catch(e) { msg("cadastro-mensagem", e.message); }
  });
  login.addEventListener("submit", async evento => {
    evento.preventDefault();
    const f = new FormData(login), email = f.get("email").trim().toLowerCase();
    try {
      const senhaHash = await hashSenha(f.get("senha"));
      const cliente = E.ler("clientes", []).find(c => c.email === email && c.senhaHash === senhaHash);
      if (!cliente) return msg("login-mensagem", "E-mail ou senha incorretos.");
      E.salvar("sessao", email); login.reset(); atualizar(); concluirAcesso();
    } catch(e) { msg("login-mensagem", e.message); }
  });
  window.addEventListener("hashchange", () => {
    if (window.location.hash === "#conta") atualizar();
    else if (window.location.hash !== "#privacidade") voltarAoCarrinho = false;
  });
  window.addEventListener("raizes-pontos-atualizados", atualizar);
  document.getElementById("sair-conta").addEventListener("click", () => { E.remover("sessao"); atualizar(); });
  document.getElementById("excluir-conta").addEventListener("click", () => {
    const email = E.ler("sessao", null);
    if (!email) return;
    const clientes = E.ler("clientes", []);
    const cliente = clientes.find(c => c.email === email);
    if (!cliente) return;
    const confirmou = window.confirm("Excluir sua conta do Clube Raízes neste navegador? Seus dados cadastrais e pontos serão apagados. Esta ação não pode ser desfeita.");
    if (!confirmou) return;
    E.salvar("clientes", clientes.filter(c => c.email !== email));
    E.remover("sessao");
    atualizar();
    window.alert("Sua conta demonstrativa foi excluída deste navegador.");
  });
  atualizar();
})();
