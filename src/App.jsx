import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ArrowRight,
} from 'lucide-react'

import spaceFinanceIcon from './assets/space-finance-icon.png'
import './App.css'

function App() {
  const [showPassword, setShowPassword] = useState(false) 
  const [rememberMe, setRememberMe] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [suporte, setSuporte] = useState(false)
  const [mesResultado, setMesResultado] = useState(new Date().getMonth());
  const [configuracoes, setConfiguracoes] = useState(false)
  const [nomePerfil, setNomePerfil] = useState('');
  const [tipoPerfil, setTipoPerfil] = useState('pessoa');
  const [telefonePerfil, setTelefonePerfil] = useState('');
 
  const [pagina, setPagina] = useState("inicio");
  const [mesSelecionado, setMesSelecionado] = useState(0);
  const [mesImpressao, setMesImpressao] = useState(0);
  const [lancamentos, setLancamentos] = useState([]);

  const totalEntradas = lancamentos
    
  .filter((lancamento) => lancamento.tipo === 'entrada')
    .reduce((total, lancamento) => total + Number(lancamento.valor || 0), 0);

  const totalDespesas = lancamentos
    .filter((lancamento) =>
      ['saida', 'despesa'].includes(
        String(lancamento.tipo || '').toLowerCase()
      )
    )
    .reduce(
      (total, lancamento) => total + Number(lancamento.valor || 0),
      0
    );

  const saldo = totalEntradas - totalDespesas;
  const anoAtual = new Date().getFullYear();

  const [anoSelecionado, setAnoSelecionado] = useState(anoAtual);

  const anosDisponiveis = Array.from(
    { length: 21 },
    (_, index) => anoAtual - 10 + index
  );
  const meses = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ];

  // Sempre que o ano mudar, voltamos para janeiro nos seletores de mês.
  useEffect(() => {
    setMesSelecionado(0);
    setMesImpressao(0);
  }, [anoSelecionado]);

  const obterDataLancamento = (valor) => {
    if (!valor) return null;

    const texto = String(valor);

    // Campo date puro (YYYY-MM-DD)
    if (/^\\d{4}-\\d{2}-\\d{2}$/.test(texto)) {
      return new Date(`${texto}T12:00:00`);
    }

    // Campo timestamp/date completo
    const data = new Date(texto);
    return Number.isNaN(data.getTime()) ? null : data;
  };

  const dadosGrafico = meses.map((mes, index) => {
    const entradas = lancamentos
      .filter((lancamento) => {
        const data = obterDataLancamento(lancamento.data);

        return (
          data &&
          data.getFullYear() === anoSelecionado &&
          data.getMonth() === index &&
          lancamento.tipo === 'entrada'
        );
      })
      .reduce(
        (total, lancamento) =>
          total + Number(lancamento.valor || 0),
        0
      );
    const despesas = lancamentos
      .filter((lancamento) => {
        const data = obterDataLancamento(lancamento.data);

        return (
          data &&
          data.getFullYear() === anoSelecionado &&
          data.getMonth() === index &&
          ['saida', 'despesa'].includes(String(lancamento.tipo || '').toLowerCase())
        );
      })
      .reduce(
        (total, lancamento) =>
          total + Number(lancamento.valor || 0),
        0
      );
    const hoje = new Date();

    return {
      mes,
      entradas,
      despesas,

      lancamentos: lancamentos.filter((lancamento) => {
  const dataLancamento = obterDataLancamento(lancamento.data);

  return (
    dataLancamento.getFullYear() === anoSelecionado &&
    dataLancamento.getMonth() === index &&
    ["entrada", "saida", "despesa"].includes(
      String(lancamento.tipo || "").toLowerCase()
    )
  );
}),
      atual:
        anoSelecionado === hoje.getFullYear() &&
        index === hoje.getMonth()
    };
  });

  const maiorValorGrafico = Math.max(
    ...dadosGrafico.flatMap((item) => [item.entradas, item.despesas]),
    1
  );
  const totalAnualEntradas = dadosGrafico.reduce(
    (total, item) => total + item.entradas,
    0
  );

  const totalAnualDespesas = dadosGrafico.reduce(
    (total, item) => total + item.despesas,
    0
  );

  const totalAnualResultado = totalAnualEntradas - totalAnualDespesas;
  const [loadingLancamentos, setLoadingLancamentos] = useState(true);
  const carregarLancamentos = async () => {
    try {
      setLoadingLancamentos(true);

      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        setLancamentos([]);
        return;
      }

      const { data, error } = await supabase
        .from('lancamentos')
        .select('*')
        .eq('user_id', user.id)
        .order('data', { ascending: false });

      if (error) {
        console.error('Erro ao buscar lançamentos:', error);
        return;
      }

      setLancamentos(data || []);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoadingLancamentos(false);
    }
  };

  useEffect(() => {
    carregarLancamentos();
  }, []);
  const resultadoAnual = saldo;
  const [launchType, setLaunchType] = useState('entrada')
  const [launchDescription, setLaunchDescription] = useState('')
  const [launchValue, setLaunchValue] = useState('')
  const [launchCategory, setLaunchCategory] = useState('')
  const [launchDate, setLaunchDate] = useState('')
  const [launchPayment, setLaunchPayment] = useState('PIX')
  
  const handleSaveLaunch = async () => {

    if (
      !launchDescription ||
      !launchValue ||
      !launchCategory ||
      !launchDate ||
      !launchPayment
    ) {
      alert('Preencha todos os campos.');
      return;
    }

    try {
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        alert('Usuário não autenticado.');
        return;
      }
      const agora = new Date();

const [ano, mes, dia] = launchDate.split("-").map(Number);

const dataComHora = new Date(
  ano,
  mes - 1,
  dia,
  agora.getHours(),
  agora.getMinutes(),
  agora.getSeconds()
).toISOString();

      const { error } = await supabase
        .from('lancamentos')
        .insert([
          {
            user_id: user.id,
            tipo: launchType,
            descricao: launchDescription,
            valor: Number(launchValue),
            categoria: launchCategory,
            data: dataComHora,
            pagamento: launchPayment
          }
        ]);

      if (error) throw error;
      await carregarLancamentos();
      alert('Lançamento salvo com sucesso!');

      setPagina("inicio");

      setLaunchDescription('');
      setLaunchValue('');
      setLaunchCategory('');
      setLaunchPayment('Dinheiro');

    } catch (error) {
      console.error('Erro ao salvar lançamento:', error);
      alert('Erro ao salvar: ' + error.message);
    }
  };
  const handleDeleteLaunch = async (id) => {
  if (!id) {
    alert("ID do lançamento não encontrado.");
    return;
  };

  const confirmar = window.confirm(
    "Tem certeza que deseja excluir este lançamento?"
  );

  if (!confirmar) return;

  try {
    // Pega o usuário logado
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) throw userError;

    if (!user) {
      alert("Usuário não autenticado.");
      return;
    }

    // Exclui somente o lançamento do usuário logado
    const { error } = await supabase
      .from("lancamentos")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Erro ao excluir:", error);
      alert("Erro ao excluir: " + error.message);
      return;
    }

    // Atualiza a lista
    await carregarLancamentos();

    alert("Lançamento excluído com sucesso!");

  } catch (error) {
    console.error("Erro ao excluir lançamento:", error);
    alert("Erro ao excluir o lançamento.");
  }
};


  // Recupera o e-mail salvo
  useEffect(() => {
    const savedEmail = localStorage.getItem('space_finance_email')

    if (savedEmail) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
  }, [])

  // LOGIN
  const handleLogin = async (event) => {
    event.preventDefault()

    if (!email || !password) {
      alert('Preencha seu e-mail e sua senha.')
      return
    }

    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      console.error(error)
      alert('E-mail ou senha incorretos.')
      return
    }

    console.log('Usuário conectado:', data.user)

    alert('Login realizado com sucesso!')

    setLoggedIn(true)
  }


  // CRIAR CONTA
  const handleCreateAccount = async () => {
    const newEmail = prompt('Digite seu e-mail:')
    if (!newEmail) return

    const newPassword = prompt('Digite uma senha:')
    if (!newPassword) return

    if (newPassword.length < 6) {
      alert('A senha precisa ter pelo menos 6 caracteres.')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.signUp({
        email: newEmail,
        password: newPassword,
      })

      if (error) {
        alert(error.message)
        return
      }

      alert(
        'Conta criada com sucesso! Verifique seu e-mail caso o Supabase solicite confirmação.'
      )
    } catch (error) {
      console.error(error)
      alert('Não foi possível criar a conta.')
    } finally {
      setLoading(false)
    }
  }

  // RECUPERAR SENHA
  const handleForgotPassword = async () => {
    const recoveryEmail = prompt(
      'Digite o e-mail da sua conta:'
    )

    if (!recoveryEmail) return

    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        recoveryEmail,
        {
          redirectTo: window.location.origin,
        }
      )

      if (error) {
        alert(error.message)
        return
      }

      alert(
        'Enviamos as instruções para recuperação da sua senha.'
      )
    } catch (error) {
      console.error(error)
      alert('Não foi possível enviar a recuperação.')
    } finally {
      setLoading(false)
    }
  }
  // PAINEL FINANCEIRO
  if (loggedIn) {
    return (
      <div className="app-layout">
        <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
          {sidebarOpen && (
            <div className="sidebar-logo">
              <img
                src={spaceFinanceIcon}
                alt="Space Finance"
              />
            </div>
          )}

          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>

          <nav className="sidebar-menu">

<button
  className={`sidebar-item ${pagina === "inicio" ? "active" : ""}`}
  onClick={() => setPagina("inicio")}
>
  <span>🏠</span>
  {sidebarOpen && <strong>Página inicial</strong>}
</button>

<button
  className={`sidebar-item ${pagina === "entradas" ? "active" : ""}`}
  onClick={() => setPagina("entradas")}
>
  <span>⬆️</span>
  {sidebarOpen && <strong>Entradas</strong>}
</button>

<button
  className={`sidebar-item ${pagina === "despesas" ? "active" : ""}`}
  onClick={() => setPagina("despesas")}
>
  <span>⬇️</span>
  {sidebarOpen && <strong>Despesas</strong>}
</button>

<button
  className={`sidebar-item ${pagina === "mesResultado" ? "active" : ""}`}
  onClick={() => setPagina("mesResultado")}
>
  <span>📊</span>
  {sidebarOpen && <strong>Resultado mês atual</strong>}
</button>

<button
  className={`sidebar-item ${pagina === "resultado-anual" ? "active" : ""}`}
  onClick={() => setPagina("resultado-anual")}
>
  <span>📅</span>
  {sidebarOpen && <strong>Resultado anual</strong>}
</button>
<button
  className={`sidebar-item ${pagina === "configuracoes" ? "active" : ""}`}
  onClick={() => setPagina("configuracoes")}
>
  <span>⚙️</span>
  {sidebarOpen && <strong>Configurações</strong>}
</button>
<button
  className={`sidebar-item ${pagina === "suporte" ? "active" : ""}`}
  onClick={() => setPagina("suporte")}
>
  <span>🛠️</span>
  {sidebarOpen && <strong>Suporte</strong>}
</button>
              </nav>

               </aside>

               <main
  className="main-content"
>
                

                {pagina === "entradas" ? (
               <>
               <div className="entries-page">

               {/* CABEÇALHO */}
               <div className="entries-header">

                <div className="entries-brand">
                  <img
                    src={spaceFinanceIcon}
                    alt="Space Finance"
                    className="entries-logo"
                  />

                  <span className="entries-icon">💰</span>

                  <div>
                    <h1>Entradas</h1>
                    <p>Controle financeiro de {anoSelecionado}</p>
                  </div>
                </div>

                <button
                  className="entries-back-button"
                  onClick={() => setPagina("inicio")}
                >
                  ← Voltar
                </button>

               </div>


               {/* TOTAL */}
               <div className="entries-total-card">
                <span>💰 Total de Entradas do mês atual</span>

                <strong>
                  R$ {dadosGrafico.reduce(
                    (total, item) => total + item.entradas,
                    0
                  ).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2
                  })}
                </strong>
                 </div>


               {/* CABEÇALHO DOS MESES */}
               <div className="entries-section-header">

                <div>
                  <h2>Entradas por mês</h2>
                  <p>Selecione um mês para visualizar os detalhes.</p>
                </div>

<div className="entries-selectors">

    <select
        value={mesSelecionado}
        onChange={(e) =>
            setMesSelecionado(Number(e.target.value))
        }
        className="entries-month-select"
    >
        {dadosGrafico.map((item, index) => (
            <option key={item.mes} value={index}>
                {item.mes}
            </option>
        ))}
    </select>

    <select
        value={anoSelecionado}
        onChange={(e) =>
            setAnoSelecionado(Number(e.target.value))
        }
        className="entries-month-select"
    >
        {Array.from(
            { length: 21 },
            (_, i) => new Date().getFullYear() - 10 + i
        ).map((ano) => (
            <option key={ano} value={ano}>
                {ano}
            </option>
        ))}
    </select>

</div>

               </div>

               {/* MÊS SELECIONADO */}
               {dadosGrafico[mesSelecionado] && (

                <div className="entries-month-card">

                  <div className="entries-month-title">
                    <div>
                      <span>📅</span>
                      <h3>{dadosGrafico[mesSelecionado].mes}</h3>
                    </div>

                    <span className="entries-month-label">
                      {anoSelecionado}
                    </span>
                  </div>


                  <div className="entries-month-value">

                    <small>Entradas do mês</small>

                    <strong>
                      R$ {dadosGrafico[
                        mesSelecionado
                      ].entradas.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2
                      })}
                    </strong>

                  </div>
                  <div className="entries-list">

                    <div className="entries-list-header">
                      <span>📋 Detalhamento das entradas</span>
                    </div>

                    {dadosGrafico[mesSelecionado]?.lancamentos?.filter(
  (lancamento) =>
    String(lancamento.tipo || '').toLowerCase() === 'entrada'
).length > 0 ? (

  dadosGrafico[mesSelecionado].lancamentos
    .filter(
      (lancamento) =>
        String(lancamento.tipo || '').toLowerCase() === 'entrada'
    )
    .map((lancamento, index) => (

                          <div
                            className="entry-item"
                            key={lancamento.id || index}
                          >

                            <div className="entry-info">

                              <div className="entry-icon">
                                💰
                              </div>

                              <div>
                                <strong>
                                  {lancamento.descricao ||
                                    lancamento.nome ||
                                    "Entrada"}
                                </strong>

                                <small>
                                  {lancamento.data
                                    ? new Date(
                                      lancamento.data
                                    ).toLocaleDateString("pt-BR")
                                    : ""}
                                </small>
                              </div>

                            </div>

                            <strong className="entry-value">
                              R$ {Number(
                                lancamento.valor || 0
                              ).toLocaleString("pt-BR", {
                                minimumFractionDigits: 2
                              })}
                            </strong>

                            <button
                              type="button"
                              className="delete-transaction-button"
                              onClick={() =>
                                handleDeleteLaunch(lancamento.id)
                              }
                              title="Excluir entrada"
                            >
                              🗑️
                            </button>

                          </div>

                        )
                      )

                    ) : (

                      <div className="entries-empty">
                        <span>📭</span>
                        <strong>Nenhuma entrada neste mês</strong>
                        <small>
                          As entradas cadastradas aparecerão aqui.
                        </small>
                      </div>

                    )}

                  </div>

                </div>

               )}


                {/* ÁREA DE IMPRESSÃO / PDF */}
                <div className="entries-export-section">

                <div className="entries-export-header">
                  <div>
                    <h2>Imprimir ou exportar</h2>

                    <p>
                      Escolha o mês que deseja gerar o relatório.
                    </p>
                  </div>

                  <select
                    value={mesImpressao}
                    onChange={(e) =>
                      setMesImpressao(Number(e.target.value))
                    }
                    className="entries-month-select"
                  >
                    {dadosGrafico.map((item, index) => (
                      <option
                        key={item.mes}
                        value={index}
                      >
                        {item.mes}
                      </option>
                    ))}
                  </select>
                </div>


               {/* PRÉVIA DO RELATÓRIO DE ENTRADAS */}

{dadosGrafico[mesImpressao] && (

  <div className="entries-report-preview">



    {/* RELATÓRIO E TOTAL */}
    <div className="print-report-summary">

      <div>

        <strong>
          📊 Relatório de Entradas
        </strong>

       <span>
  {dadosGrafico[mesImpressao].mes} / {anoSelecionado} 📅
</span>
      </div>

      <div className="print-report-total-top">

        <small>
          Total de entradas
        </small>

        <strong>
          R$ {(
            dadosGrafico[mesImpressao]
              .lancamentos
              ?.filter(
                (lancamento) =>
                  String(lancamento.tipo || "")
                    .toLowerCase() === "entrada"
              )
              .reduce(
                (total, lancamento) =>
                  total + Number(lancamento.valor || 0),
                0
              ) || 0
          ).toLocaleString("pt-BR", {
            minimumFractionDigits: 2
          })}
        </strong>

      </div>

    </div>


    {/* DETALHAMENTO */}
    <div className="print-report-section-title">

      📋 Detalhamento das entradas

    </div>


    <div className="print-report-table">

     
      


      {/* ENTRADAS */}

      {dadosGrafico[mesImpressao]
        .lancamentos
        ?.filter(
          (lancamento) =>
            String(lancamento.tipo || "")
              .toLowerCase() === "entrada"
        )
        .map((lancamento, index) => {

          const data = lancamento.data
  ? new Date(lancamento.data)
  : null;

const hora = lancamento.created_at
  ? new Date(lancamento.created_at)
  : null;

          return (

            <div
  className="print-report-row"
  key={lancamento.id || index}
>
  <span className="print-report-description">
    {lancamento.descricao || lancamento.nome || "Entrada"}
  </span>

  <span className="print-report-value">
    Valor:{" "}
    {Number(lancamento.valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })}
  </span>
  <button
  type="button"
  className="delete-transaction-button"
  onClick={() => handleDeleteLaunch(lancamento.id)}
  title="Excluir entrada"
>
  🗑️
</button>

  <span className="print-report-datetime">
    {data ? data.toLocaleDateString("pt-BR") : "--/--/----"}
    {" - "}
    {hora
      ? hora.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "--:--"}
  </span>
</div>


          );

        })}


      {/* NENHUMA ENTRADA */}

      {dadosGrafico[mesImpressao]
        .lancamentos
        ?.filter(
          (lancamento) =>
            String(lancamento.tipo || "")
              .toLowerCase() === "entrada"
        ).length === 0 && (

          <div className="print-report-empty">

            Nenhuma entrada cadastrada neste mês.

          </div>

        )}

    </div>

  </div>

)}


                <div className="entries-export-buttons">

                  <button
                    className="entries-print-button"
                    onClick={() => window.print()}
                  >
                    🖨️ Imprimir
                  </button>

                  <button
                    className="entries-pdf-button"
                    onClick={() => window.print()}
                  >
                    📄 Exportar PDF
                  </button>

                </div>

                </div>

                </div>
                </>
                
              
                ) : pagina === "despesas" ? (         
               <>


                <div className="entries-page">
 
                {/* CABEÇALHO */}
              <div className="entries-header">

            <div className="entries-brand">

           <img
           src={spaceFinanceIcon}
           alt="Space Finance"
           className="entries-logo"
         />

        <span className="entries-icon">💸</span>

      <div>
        <h1>Despesas</h1>
        <p>Controle financeiro de {anoSelecionado}</p>
      </div>

    </div>

    <button
      className="entries-back-button"
         onClick={() => setPagina("inicio")}    >
      ← Voltar
    </button>

  </div>


  {/* TOTAL */}
  <div className="entries-total-card">

    <span>💸 Total de Despesas do mês</span>

    <strong>
      R$ {dadosGrafico.reduce(
        (total, item) => total + (
          item.lancamentos?.reduce(
            (subtotal, lancamento) =>
              subtotal +
              (
                ['saida', 'despesa'].includes(
                  String(lancamento.tipo || '').toLowerCase()
                )
                  ? Number(lancamento.valor || 0)
                  : 0
              ),
            0
          ) || 0
        ),
        0
      ).toLocaleString("pt-BR", {
        minimumFractionDigits: 2
      })}
    </strong>

  </div>


  {/* CABEÇALHO DOS MESES */}
  <div className="entries-section-header">

    <div>
      <h2>Despesas por mês</h2>
      <p>Selecione um mês para visualizar os detalhes.</p>
    </div>


    <div className="entries-selectors">

      {/* MÊS */}
      <select
        value={mesSelecionado}
        onChange={(e) =>
          setMesSelecionado(Number(e.target.value))
        }
        className="entries-month-select"
      >

        {dadosGrafico.map((item, index) => (
          <option
            key={item.mes}
            value={index}
          >
            {item.mes}
          </option>
        ))}

      </select>


      {/* ANO */}
      <select
        value={anoSelecionado}
        onChange={(e) =>
          setAnoSelecionado(Number(e.target.value))
        }
        className="entries-month-select"
      >

        {Array.from(
          { length: 21 },
          (_, i) => new Date().getFullYear() - 10 + i
        ).map((ano) => (

          <option
            key={ano}
            value={ano}
          >
            {ano}
          </option>

        ))}

      </select>

    </div>

  </div>


  {/* MÊS SELECIONADO */}
  {dadosGrafico[mesSelecionado] && (

    <div className="entries-month-card">

      <div className="entries-month-title">

        <div>
          <span>📅</span>

          <h3>
            {dadosGrafico[mesSelecionado].mes}
          </h3>
        </div>

        <span className="entries-month-label">
          {anoSelecionado}
        </span>

      </div>


      {/* VALOR DO MÊS */}
      <div className="entries-month-value">

        <small>Despesas do mês</small>

        <strong>
          R$ {(
            dadosGrafico[mesSelecionado].lancamentos?.reduce(
              (total, lancamento) =>
                total +
                (
                  ['saida', 'despesa'].includes(
                    String(lancamento.tipo || '').toLowerCase()
                  )
                    ? Number(lancamento.valor || 0)
                    : 0
                ),
              0
            ) || 0
          ).toLocaleString("pt-BR", {
            minimumFractionDigits: 2
          })}
        </strong>

      </div>


      {/* LISTA DE DESPESAS */}
      <div className="entries-list">

        <div className="entries-list-header">
          <span>📋 Detalhamento das despesas</span>
        </div>


        {dadosGrafico[mesSelecionado]?.lancamentos?.filter(
          (lancamento) =>
            ['saida', 'despesa'].includes(
              String(lancamento.tipo || '').toLowerCase()
            )
        ).length > 0 ? (

          dadosGrafico[mesSelecionado].lancamentos
            .filter(
              (lancamento) =>
                ['saida', 'despesa'].includes(
                  String(lancamento.tipo || '').toLowerCase()
                )
            )
            .map((lancamento, index) => (

              <div
                className="entry-item"
                key={lancamento.id || index}
              >

                <div className="entry-info">

                  <div className="entry-icon">
                    💸
                  </div>

                  <div>

                    <strong>
                      {lancamento.descricao ||
                        lancamento.nome ||
                        "Despesa"}
                    </strong>

                    <small>
                      {lancamento.data
                        ? new Date(
                            lancamento.data
                          ).toLocaleDateString("pt-BR")
                        : ""}
                    </small>

                  </div>

                </div>


                <strong className="entry-value">
                  R$ {Number(
                    lancamento.valor || 0
                  ).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2
                  })}
                </strong>
                <button
                    type="button"
                    className="delete-transaction-button"
                    onClick={() => handleDeleteLaunch(lancamento.id)}
                    title="Excluir entrada"
                      
                  >
                    🗑️

                    </button>

              </div>

            ))

        ) : (

          <div className="entries-empty">

            <span>📭</span>

            <strong>
              Nenhuma despesa neste mês
            </strong>

            <small>
              As despesas cadastradas aparecerão aqui.
            </small>

          </div>

        )}

      </div>

    </div>

  )}


  {/* ÁREA DE IMPRESSÃO / PDF */}
  <div className="entries-export-section">

    <div className="entries-export-header">

      <div>

        <h2>Imprimir ou exportar</h2>

        <p>
          Escolha o mês que deseja gerar o relatório.
        </p>

      </div>


      <select
        value={mesImpressao}
        onChange={(e) =>
          setMesImpressao(Number(e.target.value))
        }
        className="entries-month-select"
      >

        {dadosGrafico.map((item, index) => (

          <option
            key={item.mes}
            value={index}
          >
            {item.mes}
          </option>

        ))}

      </select>

    </div>


    {/* PRÉVIA */}
    {dadosGrafico[mesImpressao] && (

      <div className="entries-report-preview">

        <div>

          <strong>
            📊 Relatório de Despesas
          </strong>

          <span>
            {dadosGrafico[mesImpressao].mes} / {anoSelecionado}
          </span>

        </div>


        <strong>
          R$ {(
            dadosGrafico[mesImpressao].lancamentos?.reduce(
              (total, lancamento) =>
                total +
                (
                  ['saida', 'despesa'].includes(
                    String(lancamento.tipo || '').toLowerCase()
                  )
                    ? Number(lancamento.valor || 0)
                    : 0
                ),
              0
            ) || 0
          ).toLocaleString("pt-BR", {
            minimumFractionDigits: 2
          })}
        </strong>
        <div className="print-report-section-title">
  📋 Detalhamento das despesas
</div>

<div className="print-report-table">

  {dadosGrafico[mesImpressao]?.lancamentos
    ?.filter((lancamento) =>
      ["saida", "despesa"].includes(
        String(lancamento.tipo || "").toLowerCase()
      )
    )
    .map((lancamento, index) => {

      const data = lancamento.data
        ? new Date(lancamento.data)
        : null;

      const hora = lancamento.created_at
        ? new Date(lancamento.created_at)
        : null;

      return (
        <div
          className="print-report-row"
          key={lancamento.id || index}
        >

          <span className="print-report-description">
            {lancamento.descricao ||
              lancamento.nome ||
              "Despesa"}
          </span>

          <span className="print-report-value">
            Valor:{" "}
            {Number(lancamento.valor || 0).toLocaleString(
              "pt-BR",
              {
                style: "currency",
                currency: "BRL"
              }
            )}
          </span>

          <span className="print-report-datetime">
            {data
              ? data.toLocaleDateString("pt-BR")
              : "--/--/----"}
            {" - "}
            {hora
              ? hora.toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit"
                })
              : "--:--"}
          </span>

        </div>
      )})}

    </div>

      </div>

    )}


    <div className="entries-export-buttons">

      <button
        className="entries-print-button"
        onClick={() => window.print()}
      >
        🖨️ Imprimir
      </button>


      <button
        className="entries-pdf-button"
        onClick={() => window.print()}
      >
        📄 Exportar PDF
      </button>

    </div>

  </div>

</div>
</>

     ) : pagina === "mesResultado" ? (
  <>

    <div className="annual-page">

      {/* CABEÇALHO */}
      <div className="annual-page-header">

        <div className="annual-page-top">

          <div className="annual-brand-row">

            <img
              src={spaceFinanceIcon}
              alt="Space Finance"
              className="annual-logo"
            />

            <span className="annual-chart-icon">
              📊
            </span>

          </div>


          <div className="annual-title">

            <span className="annual-title-icon">
              📊
            </span>

            <div>

              <h1>
                Resultado do Mês
              </h1>

              <p>
                Resumo financeiro do mês atual
              </p>

            </div>

          </div>


          <button
            className="annual-back-button"
            onClick={() => setPagina("inicio")}
          >
            ← Voltar
          </button>

        </div>

      </div>


      {/* PEGAR AUTOMATICAMENTE O MÊS ATUAL */}

      {(() => {

        const agora = new Date();

        const mesAtual = agora.getMonth();

        const anoAtual = agora.getFullYear();

        const nomeMesAtual = agora.toLocaleDateString(
          "pt-BR",
          {
            month: "long"
          }
        );


        /*
         * Procura no dadosGrafico o mês correspondente
         * ao mês atual.
         */

        const meses = [
          "Jan",
          "Fev",
          "Mar",
          "Abr",
          "Mai",
          "Jun",
          "Jul",
          "Ago",
          "Set",
          "Out",
          "Nov",
          "Dez"
        ];


        const mesAtualNome = meses[mesAtual];


        const dadosMes =
          dadosGrafico.find((item) => {

            return (
              String(item.mes || "")
                .toLowerCase()
                .trim() ===
              mesAtualNome
                .toLowerCase()
                .trim()
            );

          }) || {};


        const lancamentosMes =
          dadosMes.lancamentos || [];


        /* =========================
           ENTRADAS
        ========================= */

        const entradasMes =
          lancamentosMes
            .filter(
              (lancamento) =>
                String(
                  lancamento.tipo || ""
                )
                  .toLowerCase()
                  .trim() === "entrada"
            )
            .reduce(
              (total, lancamento) =>
                total +
                Number(
                  lancamento.valor || 0
                ),
              0
            );


        /* =========================
           DESPESAS
        ========================= */

        const despesasMes =
          lancamentosMes
            .filter(
              (lancamento) =>
                [
                  "saida",
                  "despesa"
                ].includes(
                  String(
                    lancamento.tipo || ""
                  )
                    .toLowerCase()
                    .trim()
                )
            )
            .reduce(
              (total, lancamento) =>
                total +
                Number(
                  lancamento.valor || 0
                ),
              0
            );


        /* =========================
           RESULTADO
        ========================= */

        const resultadoMes =
          entradasMes - despesasMes;


        return (
          <>

            {/* =========================
                CARDS
            ========================= */}

            <div className="annual-summary-cards">

              {/* ENTRADAS */}

              <div className="annual-card income">

                <span>
                  💰 Entradas
                </span>

                <strong>
                  R${" "}
                  {entradasMes.toLocaleString(
                    "pt-BR",
                    {
                      minimumFractionDigits: 2
                    }
                  )}
                </strong>

              </div>


              {/* DESPESAS */}

              <div className="annual-card expense">

                <span>
                  💸 Despesas
                </span>

                <strong>
                  R${" "}
                  {despesasMes.toLocaleString(
                    "pt-BR",
                    {
                      minimumFractionDigits: 2
                    }
                  )}
                </strong>

              </div>


              {/* RESULTADO */}

              <div className="annual-card result">

                <span>
                  📊 Resultado do mês
                </span>

                <strong>
                  R${" "}
                  {resultadoMes.toLocaleString(
                    "pt-BR",
                    {
                      minimumFractionDigits: 2
                    }
                  )}
                </strong>

              </div>

            </div>


            {/* =========================
                DETALHAMENTO DO MÊS
            ========================= */}

            <div className="mes-detalhamento">

              <div className="mes-detalhamento-header">

                <div className="mes-detalhamento-titulo">

                  <span>
                    📋
                  </span>

                  <div>

                    <h2>
                      Detalhamento do mês
                    </h2>

                    <p>
                      {nomeMesAtual.charAt(0).toUpperCase() +
                        nomeMesAtual.slice(1)}
                      {" / "}
                      {anoAtual}
                    </p>

                  </div>

                </div>

              </div>


              {/* =========================
                  TABELA
              ========================= */}

              {lancamentosMes.length > 0 ? (

                <div className="mes-tabela">

                  {/* CABEÇALHO */}

                  <div className="mes-tabela-header">

                    <div>
                      Descrição
                    </div>

                    <div>
                      Tipo
                    </div>

                    <div>
                      Valor
                    </div>

                    <div>
                      Data
                    </div>

                  </div>


                  {/* LANÇAMENTOS */}

                  {lancamentosMes.map(
                    (lancamento, index) => {

                      const ehEntrada =
                        String(
                          lancamento.tipo || ""
                        )
                          .toLowerCase()
                          .trim() === "entrada";


                      return (

                        <div
                          className="mes-tabela-linha"
                          key={
                            lancamento.id ||
                            index
                          }
                        >

                          {/* DESCRIÇÃO */}

                          <div className="mes-tabela-descricao">

                            {lancamento.descricao ||
                              lancamento.nome ||
                              "Lançamento"}

                          </div>


                          {/* TIPO */}

                          <div
                            className={
                              ehEntrada
                                ? "mes-tabela-entrada"
                                : "mes-tabela-despesa"
                            }
                          >

                            {ehEntrada
                              ? "Entrada"
                              : "Despesa"}

                          </div>


                          {/* VALOR */}

                          <div
                            className={
                              ehEntrada
                                ? "mes-tabela-entrada"
                                : "mes-tabela-despesa"
                            }
                          >

                            R${" "}

                            {Number(
                              lancamento.valor || 0
                            ).toLocaleString(
                              "pt-BR",
                              {
                                minimumFractionDigits: 2
                              }
                            )}

                          </div>


                          {/* DATA */}

                          <div className="mes-tabela-data">

                            {lancamento.data
                              ? new Date(
                                  lancamento.data +
                                    "T00:00:00"
                                ).toLocaleDateString(
                                  "pt-BR"
                                )
                              : "--/--/----"}

                          </div>

                        </div>

                      );

                    }
                  )}

                </div>

              ) : (

                <div className="mes-sem-lancamentos">

                  Nenhum lançamento neste mês.

                </div>

              )}

            </div>


            {/* =========================
                BOTÕES
            ========================= */}

            <div className="annual-actions">

              <button
                className="print-button"
                onClick={() => window.print()}
              >
                🖨️ Imprimir resultado
              </button>


              <button
                className="pdf-button"
                onClick={() => window.print()}
              >
                📄 Exportar PDF
              </button>

            </div>

          </>
        );

      })()}

    </div>

  </>
                   ) : pagina === "configuracoes" ? (
               
               <div className="config-page">

               <div className="config-header">
              <h1>⚙️ Configurações</h1>
              <p>Personalize os dados do seu perfil.</p>
              </div>

              <div className="config-card">

      <h2>👤 Meu perfil</h2>

      <div className="config-field">
        <label>Nome ou nome da empresa</label>

        <input
          type="text"
          value={nomePerfil}
          onChange={(e) => setNomePerfil(e.target.value)}
          placeholder="Digite seu nome ou nome da empresa"
        />
      </div>

      <div className="config-field">
        <label>Tipo de perfil</label>

        <select
          value={tipoPerfil}
          onChange={(e) => setTipoPerfil(e.target.value)}
        >
          <option value="pessoa">Pessoa</option>
          <option value="empresa">Empresa</option>
        </select>
      </div>

      <div className="config-field">
        <label>E-mail</label>

        <input
          type="email"
          value={email}
          readOnly
        />
      </div>

      <div className="config-field">
        <label>Telefone</label>

        <input
          type="text"
          value={telefonePerfil}
          onChange={(e) => setTelefonePerfil(e.target.value)}
          placeholder="Digite seu telefone"
        />
      </div>

      <button
        type="button"
        className="config-save-button"
        onClick={() => {
          alert("Configurações salvas!");
        }}
      >
        💾 Salvar alterações
      </button>

    </div>

  </div>

      ) : pagina === "suporte" ? (
  <div className="support-page">

    <div className="support-header">
      <h1>🛠️ Suporte</h1>
      <p>
        Precisa de ajuda? Estamos aqui para ajudar.
      </p>
    </div>

    <div className="support-card">

      <div className="support-icon">
        💬
      </div>

      <div className="support-content">
        <h2>Fale com o suporte</h2>

        <p>
          Entre em contato conosco caso tenha alguma dúvida,
          problema ou precise de ajuda para utilizar o Space Finance.
        </p>

        <button
          className="support-button"
          onClick={() => {
            window.open(
              "https://wa.me/35988391973",
              "_blank"
            );
          }}
        >
          💬 Falar com o suporte
        </button>
      </div>

    </div>

    <div className="support-card">

      <div className="support-icon">
        ❓
      </div>

      <div className="support-content">
        <h2>Como podemos ajudar?</h2>

        <p>
          • Problemas com lançamentos
        </p>

        <p>
          • Dúvidas sobre o sistema
        </p>

        <p>
          • Problemas de acesso
        </p>

        <p>
          • Configurações da conta
        </p>

      </div>

    </div>

  </div>

             ) : pagina === "resultado-anual" ? (

               <div className="annual-page">
               <div className="annual-page-header">

                <div className="annual-page-top">

                  <div className="annual-brand-row">
                    <img
                      src={spaceFinanceIcon}
                      alt="Space Finance"
                      className="annual-logo"
                    />

                    <span className="annual-chart-icon">

                    </span>
                  </div>

                  <div className="annual-title">
                    <span className="annual-title-icon">📊</span>

                    <div>
                      <h1>Resultado Anual</h1>
                      <p>Resumo financeiro de {anoSelecionado}</p>
                    </div>
                  </div>

                  <button
                    className="annual-back-button"
                    onClick={() => setPagina("inicio")}                  >
                    ← Voltar
                  </button>


                </div>

               </div>

               <div className="annual-summary-cards">
                <div className="annual-card income">
                  <span>💰 Entradas</span>
                  <strong>
                    R$ {totalAnualEntradas.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2
                    })}
                  </strong>
                </div>

                <div className="annual-card expense">
                  <span>💸 Despesas</span>
                  <strong>
                    R$ {totalAnualDespesas.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2
                    })}
                  </strong>
                </div>

                <div className="annual-card result">
                  <span>📊 Resultado do ano</span>
                  <strong>
                    R$ {totalAnualResultado.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2
                    })}
                  </strong>
                </div>
               </div>

               <div className="annual-result-card">
                <div className="annual-result-header">
                  <div className="annual-month-header">

                    <div className="annual-month-heading">
                      <div className="annual-month-heading-icon">
                        📊
                      </div>

                      <div>
                        <h2>Resultado por mês</h2>
                        <p>Confira o desempenho financeiro de cada mês.</p>
                      </div>
                    </div>
                    <div className="annual-year-selector">
                      <label>Ano</label>

                      <select
  className="annual-year-select"
  value={anoSelecionado}
  onChange={(e) =>
    setAnoSelecionado(Number(e.target.value))
  }
>
                      
                        {anosDisponiveis.map((ano) => (
                          <option key={ano} value={ano}>
                            {ano}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="annual-month-list">
                  {dadosGrafico.map((item) => {
                    const resultado = item.entradas - item.despesas;

                    return (
                      <div
                        className={`annual-month-row ${item.atual ? 'month-current' : ''
                          }`}
                        key={item.mes}
                      >
                        <div className="annual-month-title">
                          <strong>{item.mes}</strong>

                          {item.atual && <span>Mês atual</span>}
                        </div>

                        <div className="annual-month-values">
                          <div className="annual-income">
                            <small>Entradas</small>
                            <strong>
                              R$ {item.entradas.toLocaleString('pt-BR', {
                                minimumFractionDigits: 2
                              })}
                            </strong>
                          </div>

                          <div className="annual-expense">
                            <small>Despesas</small>
                            <strong>
                              R$ {item.despesas.toLocaleString('pt-BR', {
                                minimumFractionDigits: 2
                              })}
                            </strong>
                          </div>

                          <div
                            className={
                              resultado >= 0
                                ? 'annual-positive'
                                : 'annual-negative'
                            }
                          >
                            <small>Resultado</small>
                            <strong>
                              R$ {resultado.toLocaleString('pt-BR', {
                                minimumFractionDigits: 2
                              })}
                            </strong>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                </div>

               <div className="annual-actions">
                <button
                  className="print-button"
                  onClick={() => window.print()}
                >
                  🖨️ Imprimir resultado
                </button>

                <button
                  className="pdf-button"
                  onClick={() => window.print()}
                >
                  📄 Exportar PDF
                </button>
               </div>
                </div>
                ) : pagina === "novo-lancamento" ? (
                  <>
<div className="modal-overlay">
  <div className="launch-modal">
    <div className="modal-header">
      <h2>Novo lançamento</h2>

      <button
        className="modal-close"
        onClick={() => setPagina("inicio")}
      >
        ×
      </button>
    </div>

    <div className="launch-form">
      <label>Tipo</label>

      <div className="launch-type">
        <button
          type="button"
          className={launchType === 'entrada' ? 'selected' : ''}
          onClick={() => setLaunchType('entrada')}
        >
          ↑ Entrada
        </button>

        <button
          type="button"
          className={launchType === 'despesa' ? 'selected expense' : ''}
          onClick={() => setLaunchType('despesa')}
        >
          ↓ Despesa
        </button>
      </div>

      <label>Descrição</label>
      <input
        type="text"
        placeholder="Ex.: Venda de iPhone"
        value={launchDescription}
        onChange={(e) => setLaunchDescription(e.target.value)}
      />

      <label>Valor</label>
      <input
        type="number"
        placeholder="0,00"
        step="0.01"
        value={launchValue}
        onChange={(e) => setLaunchValue(e.target.value)}
      />

      <label>Categoria</label>
      <select
        value={launchCategory}
        onChange={(e) => setLaunchCategory(e.target.value)}
      >
        <option value="">Selecione uma categoria</option>

        {launchType === 'entrada' ? (
          <>
            <option value="Vendas">🛒 Vendas</option>
            <option value="Serviços">🔧 Serviços</option>
            <option value="Salário">💰 Salário</option>
            <option value="Outros">📦 Outros</option>
          </>
        ) : (
          <>
            <option value="Alimentação">🍔 Alimentação</option>
            <option value="Aluguel">🏠 Aluguel</option>
            <option value="Energia">💡 Energia</option>
            <option value="Água">💧 Água</option>
            <option value="Internet">🌐 Internet</option>
            <option value="Funcionário">👨‍💼 Funcionário</option>
            <option value="Fornecedores">📦 Fornecedores</option>
            <option value="Impostos">🧾 Impostos</option>
            <option value="Transporte">🚗 Transporte</option>
            <option value="Outros">📋 Outros</option>
          </>
        )}
      </select>

      <label>Data</label>
      <input
        type="date"
        value={launchDate}
        onChange={(e) => setLaunchDate(e.target.value)}
      />

      <label>Forma de pagamento</label>
      <select
        value={launchPayment}
        onChange={(e) => setLaunchPayment(e.target.value)}
      >
        <option value="Dinheiro">💵 Dinheiro</option>
        <option value="Cartão">💳 Cartão</option>
        <option value="PIX">📱 PIX</option>
        <option value="boleto">🧾 Boleto</option>
      </select>

      <div className="modal-actions">
        <button
          type="button"
          className="cancel-button"
          onClick={() => setPagina("inicio")}
        >
          Cancelar
        </button>

        <button
          type="button"
          className="save-button"
          onClick={handleSaveLaunch}
        >
          Salvar lançamento
        </button>
      </div>
    </div>
  </div>
</div>
                  </>
                ) : (
        <>
              
              
               <div className="dashboard-brand">
                <img
                  src={spaceFinanceIcon}
                  alt="Space Finance"
                  className="dashboard-logo-center"
                />
               </div>

               <section className="dashboard-content">
                <div className="dashboard-profile-name">
                {nomePerfil || "Nome do usuário"}
            </div>

              
                <div className="dashboard-title">
                  <div>
                    <h2 className="dashboard-welcome"></h2>
                    <p>Bem-vindo ao seu painel financeiro.</p>
                  </div>

                  <button
                    type="button"
                    className="add-button"
                     onClick={() => setPagina("novo-lancamento")}
                  >
                    + Novo lançamento
                  </button>

                  <button
                  type="button"
                  className="logout-button"
                    onClick={() => setLoggedIn(false)}
                >
  🚪 Sair
</button>
                </div>

                <div className="dashboard-cards">
                  <div className="finance-card">
                    <span>💰 Entradas</span>
                    <strong>
                      R$ {totalEntradas.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2
                      })}
                    </strong>
                    <small>Total recebido</small>
                  </div>

                  <div className="finance-card">
                    <span>💸 Despesas</span>
                    <strong>
                      R$ {totalDespesas.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2
                      })}
                    </strong>
                    <small>Total gasto</small>
                  </div>

                  <div className="finance-card">
                    <span>📊 Saldo</span>
                    <strong>
                      R$ {saldo.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2
                      })}
                    </strong>
                    <small>Resultado atual</small>
                  </div>

                  <div className="finance-card">
                    <span>📅 Resultado anual</span>
                    <strong>
                      R$ {resultadoAnual.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2
                      })}
                    </strong>
                    <small>Resultado do ano</small>
                  </div>
                </div>

                <div className="dashboard-grid">
                  <div className="chart-card">
                    <div className="card-header">
                      <div>
                        <h3>Entradas x Despesas</h3>
                        <p>Visão dos últimos meses</p>
                      </div>

                      <select
                        value={anoSelecionado}
                        onChange={(e) => setAnoSelecionado(Number(e.target.value))}
                        className="dashboard-year-select"
                        style={{
                          display: 'block',
                          minWidth: '120px',
                          height: '42px',
                          padding: '8px 12px',
                          backgroundColor: '#242a2f',
                          color: '#ffffff',
                          border: '2px solid #8cff00',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          pointerEvents: 'auto',
                          position: 'relative',
                          zIndex: 9999
                        }}
                      >
                        {anosDisponiveis.map((ano) => (
                          <option key={ano} value={ano}>
                            {ano}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="chart">
                      {dadosGrafico.map((item) => (
                        <div className="chart-column" key={item.mes}>
                          <div className="bars">
                            <div
                              className="bar income"
                              style={{
                                height: `${(item.entradas / maiorValorGrafico) * 100}%`
                              }}
                              title={`Entradas: R$ ${item.entradas.toLocaleString('pt-BR', {
                                minimumFractionDigits: 2
                              })}`}
                            ></div>

                            <div
                              className="bar expense"
                              style={{
                                height: `${(item.despesas / maiorValorGrafico) * 100}%`
                              }}
                              title={`Despesas: R$ ${item.despesas.toLocaleString('pt-BR', {
                                minimumFractionDigits: 2
                              })}`}
                            ></div>
                          </div>

                          <span className={item.atual ? 'current-month' : ''}>
                            {item.mes}

                            {item.atual && (
                              <small className="current-month-label">Mês atual</small>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="chart-legend">
                      <span>
                        <i className="legend-income"></i>
                        Entradas
                      </span>

                      <span>
                        <i className="legend-expense"></i>
                        Despesas
                      </span>
                    </div>
                  </div>

                  <div className="summary-card">
                    <h3>Resumo financeiro</h3>

                    <div className="summary-item">
                      <span>Entradas</span>
                      <strong>
                        R$ {totalEntradas.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2
                        })}
                      </strong>
                    </div>

                    <div className="summary-item">
                      <span>Despesas</span>
                      <strong>
                        R$ {totalDespesas.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2
                        })}
                      </strong>
                    </div>

                    <div className="summary-item total">
                      <span>Saldo</span>
                      <strong>
                        R$ {saldo.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2
                        })}
                      </strong>
                    </div>

                    <button
                      className="annual-button"
                      onClick={() => setPagina("inicio")}
                    >
                      📊 Ver resultado anual
                    </button>
                  </div>
                </div>



                <div className="transactions-card">
                  <div className="card-header">
                    <div>
                      <h3>Últimos lançamentos</h3>
                      <p>Seus registros financeiros recentes</p>
                    </div>

                    <button className="view-all-button">Ver todos</button>
                  </div>

                  <div className="transactions-list">
                    {loadingLancamentos ? (
                      <p>Carregando lançamentos...</p>
                    ) : lancamentos.length === 0 ? (
                      <div className="empty-transactions">
                        <div>💰</div>
                        <h4>Nenhum lançamento ainda</h4>
                        <p>
                          Adicione sua primeira entrada ou despesa para começar a
                          acompanhar suas finanças.
                        </p>

                        <button
                          className="add-button"
                          onClick={() => setPagina("inicio")}
                        >
                          + Adicionar lançamento
                        </button>
                      </div>
                    ) : (
                      lancamentos.map((lancamento) => (
                        <div className="transaction-item" key={lancamento.id}>
                          <div className="transaction-info">
                            <strong>{lancamento.descricao}</strong>

                            <small>
                              {lancamento.tipo === 'entrada' ? 'Venda' : 'Despesa'} •{' '}
                              {lancamento.pagamento}
                            </small>
                          </div>

                          <strong
                            className={
                              lancamento.tipo === 'entrada'
                                ? 'transaction-income'
                                : 'transaction-expense'
                            }
                          >
                            {lancamento.tipo === 'entrada' ? '+' : '-'} R${' '}
                            {Number(lancamento.valor).toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                            })}
                          </strong>
                      <button
  type="button"
  className="delete-transaction-button"
onClick={async () => {
  const confirmar = window.confirm(
    "Tem certeza que deseja excluir este lançamento?"
  );

  if (!confirmar) return;

  const { data, error } = await supabase
    .from("lancamentos")
    .delete()
    .eq("id", lancamento.id)
    .select();

  console.log("ID:", lancamento.id);
  console.log("DATA EXCLUÍDA:", data);
  console.log("ERRO:", error);

  if (error) {
    alert("ERRO: " + error.message);
    return;
  }

  if (!data || data.length === 0) {
    alert(
      "O Supabase não encontrou permissão para excluir esse lançamento."
    );
    return;
  }

  await carregarLancamentos();

  alert("Lançamento excluído com sucesso!");
}}
 title="Excluir lançamento"
>
  🗑️
</button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                </section>


              </>
                )}
</main>
      </div>
    );
  }
  return (
    <main className="login-page">

      {/* FUNDO */}
      <div className="login-background">
        <div className="glow glow-one"></div>
        <div className="glow glow-two"></div>
        <div className="glow glow-three"></div>
      </div>
      <section className="login-card">

        {/* MARCA */}
        <div className="brand">
          <img
            src={spaceFinanceIcon}
            alt="Space Finance"
            className="brand-icon"
          />

          <div>
            <p>Seu dinheiro no controle</p>
          </div>
        </div>
        {/* BOAS-VINDAS */}
        <div className="welcome">

          <h2>Bem-vindo de volta!</h2>

          <p>
            Entre na sua conta para acompanhar suas finanças.
          </p>

        </div>

        {/* FORMULÁRIO */}
        <form
          className="login-form"
          onSubmit={handleLogin}
        >

          {/* E-MAIL */}
          <div className="field-group">

            <label htmlFor="email">
              E-mail
            </label>

            <div className="input-wrapper">

              <Mail size={20} />

              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                autoComplete="email"
              />

            </div>

          </div>

          {/* SENHA */}
          <div className="field-group">

            <label htmlFor="password">
              Senha
            </label>

            <div className="input-wrapper">

              <LockKeyhole size={20} />

              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Digite sua senha"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                autoComplete="current-password"
              />

              <button
                type="button"
                className="password-button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                aria-label={
                  showPassword
                    ? 'Ocultar senha'
                    : 'Mostrar senha'
                }
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>

            </div>

          </div>

          {/* OPÇÕES */}
          <div className="form-options">

            <label className="remember">

              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) =>
                  setRememberMe(event.target.checked)
                }
              />

              <span>Lembrar de mim</span>

            </label>

            <button
              type="button"
              className="forgot-password"
              onClick={handleForgotPassword}
              disabled={loading}
            >
              Esqueci minha senha
            </button>

          </div>

          {/* BOTÃO ENTRAR */}
          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            <span>
              {loading ? 'Entrando...' : 'Entrar'}
            </span>

            {!loading && <ArrowRight size={20} />}
          </button>

        </form>

        {/* DIVISOR */}
        <div className="divider">
          <span>ou</span>
        </div>

        {/* CADASTRO */}
        <div className="register">

          <p>
            Ainda não possui uma conta?
          </p>

          <button
            type="button"
            onClick={handleCreateAccount}
            disabled={loading}
          >
            Criar minha conta
          </button>

        </div>

        {/* RODAPÉ */}
        <footer>

          <span>
            © 2026 Space Finance
          </span>

          <span className="footer-dot">
            •
          </span>

          <span>
            Finanças mais simples
          </span>

        </footer>

      </section>
    </main>
  );
}
 
export default App;
