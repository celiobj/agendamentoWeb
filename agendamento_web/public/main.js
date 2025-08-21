// main.js
// JavaScript extraído de index.html com melhorias

let agendamentos = [];
let editandoId = null;
let loading = false;

function setLoading(isLoading) {
  loading = isLoading;
  const loader = document.getElementById('loader');
  if (loader) loader.style.display = isLoading ? 'block' : 'none';
}

async function carregarAgendamentos(codigoloja, codigoFuncionario, dataInicioSemanaParam, dataFinalSemanaParam) {
  if (!codigoloja || isNaN(codigoloja)) return;
  setLoading(true);
  try {
    let API_URL;
    if (dataFinalSemanaParam == null && dataInicioSemanaParam == null) {
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
      API_URL = 'http://127.0.0.1:1010/agendamentos?codigoLoja=' + codigoloja + '&codigoFuncionario=000&dataInicial=' + dataInicioSemana + '&dataFinal=' + dataFinalSemana;
    } else {
      API_URL = 'http://127.0.0.1:1010/agendamentos?codigoLoja=' + codigoloja + '&codigoFuncionario=7&dataInicial=' + dataInicioSemanaParam + '&dataFinal=' + dataFinalSemanaParam;
    }
    const res = await fetch(API_URL);
    try {
      agendamentos = await res.json();
    } catch (error) {
      agendamentos = [];
      alert('Erro ao processar dados dos agendamentos.');
    }
    renderizarTabela();
  } catch (err) {
    alert('Erro ao carregar agendamentos. Verifique sua conexão.');
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
  document.getElementById('formAgendamento').addEventListener('submit', async e => {
    e.preventDefault();
    const form = e.target;
    const novoAgendamento = {
      cliente: form.cliente.value,
      servico: form.servico.value,
      data: form.data.value,
      horario: form.horario.value
    };
    setLoading(true);
    try {
      if (editandoId) {
        await fetch(`${API_URL}/${editandoId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(novoAgendamento)
        });
        editandoId = null;
      } else {
        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(novoAgendamento)
        });
      }
      form.reset();
      carregarAgendamentos(null, null, null, null);
    } catch (err) {
      alert('Erro ao salvar agendamento.');
    } finally {
      setLoading(false);
    }
  });

  document.getElementById('filtroData').addEventListener('input', renderizarTabela);
  document.getElementById('filtroServico').addEventListener('input', renderizarTabela);

  // Outras funções de carregamento e eventos podem ser adicionadas aqui...

  carregarLojas();
  carregarServicos();
});


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

async function carregarServicos() {
  setLoading(true);
  try {
    const SERVICOS_URL = 'http://127.0.0.1:1010/servicos/preencherComboServicos?status=A';
    const res = await fetch(SERVICOS_URL);
    const servicos = await res.json();
    const combo = document.getElementById('comboServicos');
    combo.innerHTML = '<option value="">Selecione um serviço</option>';
    servicos.forEach(servico => {
      const opt = document.createElement('option');
      opt.value = servico.id || servico.codigo || servico.nome || servico;
      opt.textContent = servico.nome || servico.descricao || servico;
      combo.appendChild(opt);
    });
  } catch (err) {
    alert('Erro ao carregar serviços.');
  } finally {
    setLoading(false);
  }
}

async function carregarFuncionarios() {
  setLoading(true);
  try {
    const valorSelecionado = document.getElementById('comboLojas').value;
    const codigoLoja = parseInt(valorSelecionado.split('-')[0], 10);
    if (!codigoLoja || isNaN(codigoLoja)) {
      document.getElementById('comboFuncionarios').innerHTML = '<option value="">Selecione um funcionário</option>';
      return;
    }
    const FUNCIONARIOS_URL = 'http://127.0.0.1:1010/funcionarios/preencherComboFuncionarios?status=A&codigoLoja=' + codigoLoja;
    const res = await fetch(FUNCIONARIOS_URL);
    const funcionarios = await res.json();
    const combo = document.getElementById('comboFuncionarios');
    combo.innerHTML = '<option value="">Selecione um funcionário</option>';
    funcionarios.forEach(funcionario => {
      const opt = document.createElement('option');
      opt.value = funcionario.id || funcionario.codigo || funcionario.nome || funcionario;
      opt.textContent = funcionario.nome || funcionario.descricao || funcionario;
      combo.appendChild(opt);
    });
  } catch (err) {
    alert('Erro ao carregar funcionários.');
  } finally {
    setLoading(false);
  }
}

async function carregarHorarios() {
  setLoading(true);
  try {
    const comboLojas = document.getElementById('comboLojas');
    const comboFuncionarios = document.getElementById('comboFuncionarios');
    const valorSelecionadoLoja = comboLojas.value;
    const valorSelecionadoFuncionario = comboFuncionarios.value;
    const codigoLoja = parseInt(valorSelecionadoLoja.split('-')[0], 10);
    const codigoFuncionario = parseInt(valorSelecionadoFuncionario.split('-')[0], 10);
    const valorSelecionadoData = document.getElementById('data').value;
    if (!valorSelecionadoData) {
      alert('Por favor, selecione uma data válida.');
      return;
    }
    if (!codigoLoja || isNaN(codigoLoja)) {
      alert('Por favor, selecione uma loja válida.');
      return;
    }
    if (!codigoFuncionario || isNaN(codigoFuncionario)) {
      alert('Por favor, selecione um funcionário válido.');
      return;
    }
    let dataAgendamento = '';
    if (valorSelecionadoData) {
      const [ano, mes, dia] = valorSelecionadoData.split('-');
      dataAgendamento = `${dia}-${mes}-${ano}`;
    }
    const HORARIOS_URL = 'http://127.0.0.1:1010/horarios/listarHorariosDisponiveis?codigoFuncionario=' + codigoFuncionario + '&codigoLoja=' + codigoLoja + '&data=' + dataAgendamento;
    const res = await fetch(HORARIOS_URL);
    const horarios = await res.json();
    const combo = document.getElementById('comboHorario');
    combo.innerHTML = '<option value="">Selecione o horário</option>';
    horarios.forEach(horario => {
      const opt = document.createElement('option');
      opt.value = horario.id || horario.codigo || horario.nome || horario;
      opt.textContent = horario.nome || horario.descricao || horario;
      combo.appendChild(opt);
    });
  } catch (err) {
    alert('Erro ao carregar horários.');
  } finally {
    setLoading(false);
  }
}

// Eventos para combos e botões
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('comboLojas').addEventListener('change', function (e) {
    const valorSelecionado = e.target.value;
    const codigoLoja = parseInt(valorSelecionado.split('-')[0], 10);
    carregarAgendamentos(codigoLoja, null, null, null);
    carregarFuncionarios();
  });

  document.getElementById('comboFuncionarios').addEventListener('change', function (e) {
    // Opcional: carregar horários automaticamente ao trocar funcionário
    // carregarHorarios();
  });

  document.getElementById('comboHorario').addEventListener('change', function (e) {
    const combo = document.getElementById('comboHorario');
    const valorSelecionado = e.target.value;
    if (!valorSelecionado || valorSelecionado.includes("Reservado")) {
      alert('Por favor, selecione um horário válido.');
      combo.selectedIndex = 0;
      return;
    }
  });

  document.getElementById('btnVisualizarHorarios').addEventListener('click', function (e) {
    carregarHorarios();
  });
});
