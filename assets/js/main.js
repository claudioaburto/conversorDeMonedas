const clp = document.getElementById("clp");
const urlAPI = "https://mindicador.cl/api";
const result = document.getElementById("result");
const tabla = document.getElementById("lista-usuario");
const moneda = document.getElementById("moneda");
const chartDOM = document.getElementById("result-chart").getContext("2d");
const amount = document.getElementById("amount");

async function getMoney(url) {
  try {
    const res = await fetch(url);
    const coins = await res.json();
    return coins;
  } catch (e) {
    alert("Ha ocurrido un problema. Intente nuevamente");
  }
}

async function convert() {
  const currency = moneda.options[moneda.selectedIndex].text.substring(0, 3);

  if (clp.value == "" || isNaN(clp.value) || clp.value < 0) {
    alert("Ingrese un monto válido");
    cleanPage();
  } else {
    try {
      const currencies = await getMoney(urlAPI);

      result.innerHTML = `Resultado: $${new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: currency,
      }).format((clp.value / currencies[moneda.value].valor).toFixed(2))}`;
      renderGraph();
    } catch (err) {
      alert("Ha ocurrido un problema. Intente nuevamente");
    }
  }
}

async function loadData(moneda) {
  try {
    const currency = await getMoney(urlAPI + "/" + moneda.value);
    const dates = currency.serie.map((ele) => {
      return ele.fecha.split("T")[0];
    });
    const graphData = currency.serie.map((lbl) => {
      return lbl.valor;
    });
    return { dates, graphData };
  } catch (e) {
    alert("Ha ocurrido un problema. Intente nuevamente");
  }
}

async function renderGraph() {
  const graphType = "line";
  const colorBG = "#" + randomHex(9);
  const lineColor = "#" + randomHex(9);

  try {
    const renderData = await loadData(moneda);
    const title = "Historico últimos 10 días";

    const config = {
      type: graphType,
      data: {
        labels: renderData.dates.reverse().slice(-10),
        datasets: [
          {
            label: title,
            borderColor: colorBG,
            backgroundColor: lineColor,
            data: renderData.graphData.reverse().slice(-10),
          },
        ],
      },
    };

    if (window.chartDOM) {
      window.chartDOM.destroy();
    }

    window.chartDOM = new Chart(chartDOM, config);
  } catch (err) {
    alert("Hubo un fallo en la carga de datos, por favor, reintente");
  }
}

randomHex = (length) =>
  (
    "0".repeat(length) + Math.floor(Math.random() * 16 ** length).toString(16)
  ).slice(-length);

function cleanPage() {
  clp.value = "";
  result.innerHTML = "Resultado: ";
  amount.innerHTML = "Moneda a convertir: ";
}
