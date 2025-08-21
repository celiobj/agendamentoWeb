// listar.js
let agendamentos = [];
let loading = false;

function setLoading(isLoading) {
  loading = isLoading;
  const loader = document.getElementById('loader');
  if (loader) loader.style.display = isLoading ? 'block' : 'none';
}

async function carregarLojas() {
  setLoading(true);
  try {
    const LOJAS_URL = 'http://127.0.0.1:1010/lojas/preencherComboLojas?status=A';
    const res = await fetch(LOJAS_URL);
    const lojas = await res.json();
    const combo = document.getElementById('comboLojas');
    combo.innerHTML = '<option value="">Selecione uma loja</option>';
    lojas.forEach(loja => {
      const opt = document.createElement('option');
      opt.value = loja.id || loja.codigo || loja.nome || loja;
      opt.textContent = loja.nome || loja.descricao || loja;
      combo.appendChild(opt);
    });
  } catch (err) {
    alert('Erro ao carregar lojas.');
  } finally {
    setLoading(false);
  }
}

async function carregarAgendamentos(codigoloja) {
  if (!codigoloja || isNaN(codigoloja)) return;
  setLoading(true);
  try {
    const hoje = new Date();
    const diaSemana = hoje.getDay();
    const dataInicioSemanaObj = new Date(hoje);
    dataInicioSemanaObj.setDate(hoje.getDate() - diaSemana);
    const dataInicioSemana = [
      String(dataInicioSemanaObj.getMonth() + 1).padStart(2, '0'),
      String(dataInicioSemanaObj.getDate()).padStart(2, '0'),
      dataInicioSemanaObj.getFullYear()
    ].join('/');
    const dataFinalSemanaObj = new Date(hoje);
    dataFinalSemanaObj.setDate(hoje.getDate() + (6 - diaSemana));
    const dataFinalSemana = [
      String(dataFinalSemanaObj.getMonth() + 1).padStart(2, '0'),
      String(dataFinalSemanaObj.getDate()).padStart(2, '0'),
      dataFinalSemanaObj.getFullYear()
    ].join('/');
    const API_URL = 'http://127.0.0.1:1010/agendamentos?codigoLoja=' + codigoloja + '&codigoFuncionario=000&dataInicial=' + dataInicioSemana + '&dataFinal=' + dataFinalSemana;
    const res = await fetch(API_URL);
    agendamentos = await res.json();
    renderizarTabela();
  } catch (err) {
    alert('Erro ao carregar agendamentos.');
  } finally {
    setLoading(false);
  }
}

function renderizarTabela() {
  const tbody = document.getElementById('agenda-body');
  const filtroData = document.getElementById('filtroData').value;
  const filtroServico = document.getElementById('filtroServico').value.toLowerCase();
  let filtroDataFormatada = '';
  if (filtroData) {
    const [ano, mes, dia] = filtroData.split('-');
    filtroDataFormatada = `${dia}/${mes}/${ano}`;
  }
  tbody.innerHTML = '';
  agendamentos
    .filter(ag =>
      (!filtroDataFormatada || ag.data === filtroDataFormatada) &&
      (!filtroServico || ag.servico.toLowerCase().includes(filtroServico))
    )
    .forEach(ag => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="px-4 py-2">${ag.nomeCliente}</td>
        <td class="px-4 py-2">${ag.nomeFuncionario}</td>
        <td class="px-4 py-2">${ag.data}</td>
        <td class="px-4 py-2">${ag.hora}</td>
        <td class="px-4 py-2">${ag.descricao}</td>
      `;
      tbody.appendChild(tr);
    });
}

document.addEventListener('DOMContentLoaded', () => {
  carregarLojas();
  document.getElementById('comboLojas').addEventListener('change', function (e) {
    const valorSelecionado = e.target.value;
    const codigoLoja = parseInt(valorSelecionado.split('-')[0], 10);
    carregarAgendamentos(codigoLoja);
  });
  document.getElementById('filtroData').addEventListener('input', renderizarTabela);
  document.getElementById('filtroServico').addEventListener('input', renderizarTabela);
});
