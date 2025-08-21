// registrar.js
let loading = false;

function setLoading(isLoading) {
  loading = isLoading;
  const loader = document.getElementById('loader');
  if (loader) loader.style.display = isLoading ? 'block' : 'none';
}

async function carregarServicos() {
  setLoading(true);
  try {
    const SERVICOS_URL = 'http://127.0.0.1:1010/barber/servicos/preencherComboServicos?status=A';
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
    const valorSelecionado = document.getElementById('comboLojas')?.value;
    const codigoLoja = parseInt(valorSelecionado?.split('-')[0], 10);
    if (!codigoLoja || isNaN(codigoLoja)) {
      document.getElementById('comboFuncionarios').innerHTML = '<option value="">Selecione um funcionário</option>';
      return;
    }
    const FUNCIONARIOS_URL = 'http://127.0.0.1:1010/barber/funcionarios/preencherComboFuncionarios?status=A&codigoLoja=' + codigoLoja;
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
    const comboFuncionarios = document.getElementById('comboFuncionarios');
    const valorSelecionadoFuncionario = comboFuncionarios.value;
    const codigoFuncionario = parseInt(valorSelecionadoFuncionario.split('-')[0], 10);
    const valorSelecionadoData = document.getElementById('data').value;
    const valorSelecionadoLoja = document.getElementById('comboLojas')?.value;
    const codigoLoja = parseInt(valorSelecionadoLoja?.split('-')[0], 10);
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
    const HORARIOS_URL = 'http://127.0.0.1:1010/barber/horarios/listarHorariosDisponiveis?codigoFuncionario=' + codigoFuncionario + '&codigoLoja=' + codigoLoja + '&data=' + dataAgendamento;
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

async function carregarLojas() {
  setLoading(true);
  try {
    const LOJAS_URL = 'http://127.0.0.1:1010/barber/lojas/preencherComboLojas?status=A';
    const res = await fetch(LOJAS_URL);
    const lojas = await res.json();
    const combo = document.createElement('select');
    combo.innerHTML = '<option value="">Selecione uma loja</option>';
    lojas.forEach(loja => {
      const opt = document.createElement('option');
      opt.value = loja.id || loja.codigo || loja.nome || loja;
      opt.textContent = loja.nome || loja.descricao || loja;
      combo.appendChild(opt);
    });
    // Adiciona o combo de lojas acima do formulário
    let comboLojas = document.getElementById('comboLojas');
    if (!comboLojas) {
      comboLojas = document.createElement('select');
      comboLojas.id = 'comboLojas';
      comboLojas.className = 'p-2 border rounded w-full mb-4';
      comboLojas.innerHTML = combo.innerHTML;
      document.body.insertBefore(comboLojas, document.getElementById('formAgendamento'));
    } else {
      comboLojas.innerHTML = combo.innerHTML;
    }
  } catch (err) {
    alert('Erro ao carregar lojas.');
  } finally {
    setLoading(false);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  carregarLojas();
  carregarServicos();
  document.getElementById('comboLojas').addEventListener('change', carregarFuncionarios);
  document.getElementById('comboFuncionarios').addEventListener('change', function () {});
  const btnHorarios = document.getElementById('btnVisualizarHorarios');
  if (btnHorarios) {
    btnHorarios.addEventListener('click', carregarHorarios);
  }

  const formAgendamento = document.getElementById('formAgendamento');
  if (formAgendamento) {
    formAgendamento.addEventListener('submit', async e => {
      e.preventDefault();
      setLoading(true);
      try {
        const form = e.target;
        const funcionarioSelecionado = document.getElementById('comboFuncionarios').value;
        const codigoFuncionario = parseInt(funcionarioSelecionado.split('-')[0], 10);
        const dataInput = document.getElementById('data').value;
        let dataAgendamento = '';
        if (dataInput) {
          const [ano, mes, dia] = dataInput.split('-');
          dataAgendamento = `${mes}-${dia}-${ano}`;
        }
        const horaAgendamento = document.getElementById('comboHorario').value;
        const lojaSelecionada = document.getElementById('comboLojas').value;
        const codigoloja = parseInt(lojaSelecionada.split('-')[0], 10);
        const comboServicos = document.getElementById('comboServicos');
        const nomeCliente = document.getElementById('cliente').value;
        const servicoSelecionado = comboServicos.options[comboServicos.selectedIndex].text + ' - ' + nomeCliente;
        if (!codigoFuncionario || !dataAgendamento || !horaAgendamento || !codigoloja || !servicoSelecionado || !nomeCliente || comboServicos.selectedIndex === 0 || comboServicos.selectedIndex === 1 || !nomeCliente.trim()) {
          alert('Por favor, preencha todos os campos obrigatórios.');
          return;
        }
        const body = {
          "codigoAgendamento": 0,
          "codigoFuncionario": codigoFuncionario,
          "codigoCliente": 0,
          "data": dataAgendamento,
          "hora": horaAgendamento,
          "isAtivo": "S",
          "codigoLoja": codigoloja,
          "colunaDia": 100,
          "colunaHora": 100,
          "descricao": servicoSelecionado
        };
        const API_URL = 'http://127.0.0.1:1010/barber/agendamentos/realizarAgendamento';
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        if (res.ok) {
          alert('Agendamento salvo com sucesso!');
          form.reset();
        } else {
          alert('Erro ao salvar agendamento!');
        }
      } catch (err) {
        alert('Erro ao salvar agendamento!');
      } finally {
        setLoading(false);
      }
    });
  }
});
