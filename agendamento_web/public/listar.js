// listar.js
let agendamentos = [];
let loading = false;

// --- INÍCIO: BLOCO DE LOGIN ---
function mostrarLogin() {
  const loginDiv = document.createElement('div');
  loginDiv.id = 'loginDiv';
  loginDiv.style.position = 'fixed';
  loginDiv.style.top = '0';
  loginDiv.style.left = '0';
  loginDiv.style.width = '100vw';
  loginDiv.style.height = '100vh';
  loginDiv.style.background = 'rgba(0,0,0,0.4)';
  loginDiv.style.display = 'flex';
  loginDiv.style.alignItems = 'center';
  loginDiv.style.justifyContent = 'center';
  loginDiv.innerHTML = `
    <form id="loginForm" style="background:#fff;padding:2rem;border-radius:8px;box-shadow:0 2px 8px #0002;min-width:320px">
      <h2 style="margin-bottom:1rem;text-align:center">Login</h2>
      <div style="margin-bottom:1rem">
        <label for="usuario" style="display:block;margin-bottom:0.25rem">Usuário</label>
        <input type="text" id="usuario" name="usuario" style="width:100%;padding:0.5rem;border:1px solid #ccc;border-radius:4px" autocomplete="username" />
      </div>
      <div style="margin-bottom:1rem">
        <label for="senha" style="display:block;margin-bottom:0.25rem">Senha</label>
        <input type="password" id="senha" name="senha" style="width:100%;padding:0.5rem;border:1px solid #ccc;border-radius:4px" autocomplete="current-password" />
      </div>
      <div id="loginErro" style="color:#b00;margin-bottom:1rem;display:none"></div>
      <button type="submit" style="width:100%;padding:0.5rem;background:#2563eb;color:#fff;border:none;border-radius:4px;font-weight:bold">OK</button>
    </form>
  `;
  document.body.appendChild(loginDiv);

  document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const usuario = document.getElementById('usuario').value.trim();
    const senha = document.getElementById('senha').value.trim();
    const erroDiv = document.getElementById('loginErro');
    erroDiv.style.display = 'none';

    if (!usuario || !senha) {
      erroDiv.textContent = 'Preencha usuário e senha.';
      erroDiv.style.display = 'block';
      return;
    }

    setLoading(true);
    try {
      // Corrigido para GET e parâmetros na URL
      const url = `http://127.0.0.1:1010/barber/usuarios/logar?user=${encodeURIComponent(usuario)}&pass=${encodeURIComponent(senha)}`;
      const res = await fetch(url, { method: 'GET' });
      const data = await res.json();
      if (data && Object.keys(data).length > 0) {
        // Login OK
        document.body.removeChild(loginDiv);
        // Você pode salvar o usuário logado em localStorage/sessionStorage se quiser
      } else {
        erroDiv.textContent = 'Usuário ou senha inválidos.';
        erroDiv.style.display = 'block';
      }
    } catch (err) {
      erroDiv.textContent = 'Erro ao tentar logar.';
      erroDiv.style.display = 'block';
    } finally {
      setLoading(false);
    }
  });
}
// --- FIM: BLOCO DE LOGIN ---

function setLoading(isLoading) {
  loading = isLoading;
  const loader = document.getElementById('loader');
  if (loader) loader.style.display = isLoading ? 'block' : 'none';
}

async function carregarLojas() {
  setLoading(true);
  try {
    const LOJAS_URL = 'http://127.0.0.1:1010/barber/lojas/preencherComboLojas?status=A';
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
    const API_URL = 'http://127.0.0.1:1010/barber/agendamentos?codigoLoja=' + codigoloja + '&codigoFuncionario=000&dataInicial=' + dataInicioSemana + '&dataFinal=' + dataFinalSemana;
    const res = await fetch(API_URL);
    agendamentos = await res.json();
    renderizarTabela();
  } catch (err) {
    alert('Erro ao carregar agendamentos.');
  } finally {
    setLoading(false);
  }
}

public static String criptografarSenha(String senha) {
        MessageDigest algorithm = null;

        try {
            algorithm = MessageDigest.getInstance("MD5");

        } catch (NoSuchAlgorithmException ex) {
            Logger.getLogger(Util.class
                    .getName()).log(Level.SEVERE, null, ex);
        }
        byte messageDigest[] = null;

        try {
            messageDigest = algorithm.digest(senha.getBytes("UTF-8"));

        } catch (UnsupportedEncodingException ex) {
            Logger.getLogger(Util.class
                    .getName()).log(Level.SEVERE, null, ex);
        }
        StringBuilder hexString = new StringBuilder();
        for (byte b : messageDigest) {
            hexString.append(String.format("%02X", 0xFF & b));
        }
        return hexString.toString();
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
  mostrarLogin(); // Exibe o form de login ao carregar a página

  // O restante só será executado após login bem-sucedido
  // Por isso, coloque dentro de uma função e chame após login OK, ou deixe como está se não houver risco de acesso indevido

  carregarLojas();
  document.getElementById('comboLojas').addEventListener('change', function (e) {
    const valorSelecionado = e.target.value;
    const codigoLoja = parseInt(valorSelecionado.split('-')[0], 10);
    carregarAgendamentos(codigoLoja);
  });
  document.getElementById('filtroData').addEventListener('input', renderizarTabela);
  document.getElementById('filtroServico').addEventListener('input', renderizarTabela);
});
