const CHAVE = 'portal-beneficios-v1';

const ETAPAS = [
    'Documentos enviados para análise',
    'Documentação em análise',
    'Correções necessárias',
    'Entrevista socioeconômica',
    'Plano de pagamento atualizado (bolsa concedida)'
];

// Cada campo: [nome, rótulo, tipo]. Os dois primeiros aparecem no resumo do card.
const SECOES = [
    { id: 'beneficiario', titulo: 'Dados do beneficiário', campos: [['nome', 'Nome'], ['cpf', 'CPF'], ['nascimento', 'Data de nascimento', 'date'], ['email', 'E-mail', 'email']] },
    { id: 'familia', titulo: 'Composição do grupo familiar e renda', campos: [['integrantes', 'Número de integrantes', 'number'], ['renda', 'Renda bruta familiar (R$)', 'number']] },
    { id: 'moradia', titulo: 'Situação habitacional', campos: [['logradouro', 'Logradouro'], ['cidade', 'Cidade'], ['tipo', 'Tipo de moradia']] },
    { id: 'despesas', titulo: 'Despesas', campos: [['alimentacao', 'Alimentação (R$)', 'number'], ['aguaLuz', 'Água e luz (R$)', 'number']] },
    { id: 'bens', titulo: 'Propriedade de veículos e imóveis', campos: [['marca', 'Marca'], ['valor', 'Valor de mercado (R$)', 'number']] },
    { id: 'declaracao', titulo: 'Declaração', campos: [['data', 'Data', 'date'], ['responsavel', 'Responsável']] },
    { id: 'observacoes', titulo: 'Observações', campos: [['texto', 'Observações', 'textarea']] }
];

const DOCS = [
    { id: 'matricula', nome: 'Declaração de matrícula', arquivo: 'declaracao-de-matricula.pdf', obrigatorio: true },
    { id: 'rg', nome: 'RG', arquivo: 'rg.pdf', obrigatorio: true },
    { id: 'cpf', nome: 'CPF', arquivo: 'cpf.pdf', obrigatorio: true },
    { id: 'certidao', nome: 'Certidão de nascimento', arquivo: 'certidao-de-nascimento.pdf', obrigatorio: true },
    { id: 'guarda', nome: 'Cópia do termo de guarda ou curatela', arquivo: 'guarda.pdf', obrigatorio: false }
];

const ROTULOS = { verificado: 'Verificado', correcao: 'Correção necessária', enviado: 'Enviado', pendente: 'Pendente' };

const PADRAO = {
    logado: false,
    dados: {
        beneficiario: { nome: 'Maria Exemplo', cpf: '000.000.000-00', nascimento: '2014-12-04', email: 'maria@exemplo.com' },
        familia: { integrantes: 3, renda: 3450 },
        moradia: { logradouro: 'Rua das Flores, 100', cidade: 'Lavras', tipo: 'Casa' },
        despesas: { alimentacao: 800, aguaLuz: 200 },
        bens: { marca: 'Volkswagen', valor: 18000 },
        declaracao: { data: '2023-08-07', responsavel: 'Responsável Exemplo' },
        observacoes: { texto: '' }
    },
    correcoes: ['moradia', 'bens'],
    docs: { matricula: 'verificado', rg: 'correcao', cpf: 'pendente', certidao: 'pendente', guarda: 'pendente' }
};

const $ = (seletor) => document.querySelector(seletor);

const esc = (texto) => String(texto ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function carregar() {
    try {
        return JSON.parse(localStorage.getItem(CHAVE)) || structuredClone(PADRAO);
    } catch {
        return structuredClone(PADRAO);
    }
}

let estado = carregar();

function salvar() {
    try {
        localStorage.setItem(CHAVE, JSON.stringify(estado));
    } catch { /* sem armazenamento: o estado vale só nesta sessão */ }
    render();
}

const pendencias = () =>
    estado.correcoes.length + Object.values(estado.docs).filter((s) => s === 'correcao').length;

function formatar(valor, tipo, rotulo = '') {
    if (valor === '' || valor == null) return '—';
    if (tipo === 'date') return new Date(valor).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    if (tipo === 'number' && rotulo.includes('R$')) {
        return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
    return valor;
}

function telaLogin() {
    return `
        <section class="login">
            <h1>Acesse o portal de bolsas</h1>
            <form id="form-login">
                <label>Usuário
                    <input name="usuario" required autocomplete="username">
                </label>
                <label>Código de acesso
                    <input name="codigo" type="password" minlength="4" required autocomplete="one-time-code">
                </label>
                <button class="btn">Acessar</button>
                <p class="dica">Protótipo: use qualquer usuário e um código com 4 ou mais caracteres.</p>
            </form>
        </section>`;
}

function telaFicha() {
    const total = pendencias();
    const etapas = total ? ETAPAS : ETAPAS.filter((_, i) => i !== 2);
    const atual = total ? 2 : etapas.length;

    const passos = etapas.map((nome, i) => {
        const classe = i < atual ? 'feito' : i === atual ? 'atual' : '';
        return `<li class="${classe}"${i === atual ? ' aria-current="step"' : ''}>${nome}</li>`;
    }).join('');

    const aviso = total
        ? `<h2>Correções necessárias</h2>
           <p>Foram identificadas ${total} pendência${total > 1 ? 's' : ''} na sua solicitação. Corrija os itens marcados em vermelho.</p>`
        : `<h2>Bolsa validada</h2>
           <p>Sua solicitação foi validada. Imprima a ficha e compareça ao setor para assinar o termo de compromisso.</p>
           <button class="btn" data-acao="imprimir">Imprimir ficha</button>`;

    const cards = SECOES.map((secao) => {
        const dados = estado.dados[secao.id];
        const resumo = secao.campos.slice(0, 2).map(([chave, rotulo, tipo]) =>
            `<dt>${rotulo}</dt><dd>${esc(formatar(dados[chave], tipo, rotulo))}</dd>`).join('');
        const erro = estado.correcoes.includes(secao.id) ? ' card--erro' : '';
        return `
            <article class="card${erro}">
                <h3>${secao.titulo}</h3>
                <dl>${resumo}</dl>
                <button class="btn btn--leve" data-editar="${secao.id}">Editar</button>
            </article>`;
    }).join('');

    const enviados = Object.values(estado.docs).filter((s) => s === 'verificado' || s === 'enviado').length;
    const cardDocs = `
        <article class="card${Object.values(estado.docs).includes('correcao') ? ' card--erro' : ''}">
            <h3>Documentos do candidato</h3>
            <dl><dt>Enviados ou verificados</dt><dd>${enviados} de ${DOCS.length}</dd></dl>
            <button class="btn btn--leve" data-acao="docs">Enviar documentos</button>
        </article>`;

    return `
        <h1>Bolsa de estudos 2023</h1>
        <ol class="etapas">${passos}</ol>
        <section class="aviso">${aviso}</section>
        <div class="cards">${cards}${cardDocs}</div>`;
}

function render() {
    $('#sair').hidden = !estado.logado;
    $('#app').innerHTML = estado.logado ? telaFicha() : telaLogin();
}

function abrirModal(html) {
    const modal = $('#modal');
    modal.innerHTML = html;
    if (!modal.open) modal.showModal();
}

const cabecalhoModal = (titulo) => `
    <header>
        <h2>${titulo}</h2>
        <button type="button" class="fechar" data-acao="fechar" aria-label="Fechar">×</button>
    </header>`;

function modalSecao(id) {
    const secao = SECOES.find((s) => s.id === id);
    const dados = estado.dados[id];
    const campos = secao.campos.map(([chave, rotulo, tipo = 'text']) => tipo === 'textarea'
        ? `<label>${rotulo}<textarea name="${chave}" rows="4">${esc(dados[chave])}</textarea></label>`
        : `<label>${rotulo}<input name="${chave}" type="${tipo}" value="${esc(dados[chave])}" ${tipo === 'number' ? 'min="0" step="any"' : ''} required></label>`
    ).join('');

    abrirModal(`<form id="form-secao" data-id="${id}">${cabecalhoModal(secao.titulo)}${campos}<button class="btn">Salvar alterações</button></form>`);
}

function modalDocs() {
    const itens = DOCS.map((doc) => {
        const status = estado.docs[doc.id];
        const envio = status === 'verificado' ? '' : `
            <label class="btn btn--leve">Enviar PDF
                <input type="file" accept="application/pdf" data-doc="${doc.id}" hidden>
            </label>`;
        return `
            <li class="doc doc--${status}">
                <div><strong>${doc.nome}</strong><small>${doc.arquivo} · ${doc.obrigatorio ? 'Obrigatório' : 'Opcional'}</small></div>
                <span class="selo">${ROTULOS[status]}</span>
                ${envio}
            </li>`;
    }).join('');

    abrirModal(`<div>${cabecalhoModal('Documentos do candidato')}
        <p class="dica">Respeite o padrão dos nomes e tipos de arquivo. Neste protótipo, o arquivo não é enviado a nenhum servidor.</p>
        <ul class="docs">${itens}</ul></div>`);
}

document.addEventListener('click', (evento) => {
    const alvo = evento.target.closest('[data-editar], [data-acao]');
    if (!alvo) return;

    if (alvo.dataset.editar) modalSecao(alvo.dataset.editar);

    switch (alvo.dataset.acao) {
        case 'docs': modalDocs(); break;
        case 'fechar': $('#modal').close(); break;
        case 'imprimir': window.print(); break;
        case 'sair': estado.logado = false; salvar(); break;
        case 'resetar':
            try { localStorage.removeItem(CHAVE); } catch { /* ignora */ }
            estado = structuredClone(PADRAO);
            render();
            break;
    }
});

document.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const formulario = evento.target;

    if (formulario.id === 'form-login') {
        estado.logado = true;
        salvar();
    }

    if (formulario.id === 'form-secao') {
        const id = formulario.dataset.id;
        estado.dados[id] = Object.fromEntries(new FormData(formulario));
        estado.correcoes = estado.correcoes.filter((c) => c !== id);
        $('#modal').close();
        salvar();
    }
});

document.addEventListener('change', (evento) => {
    const id = evento.target.dataset?.doc;
    if (!id || !evento.target.files.length) return;
    estado.docs[id] = 'enviado';
    salvar();
    modalDocs();
});

render();
