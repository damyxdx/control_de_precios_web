const sheetID = "1id74cUVaB0GN6ROPrxwBj8K-FZWkl6dD7kMgWze_X6U";
const sheetName = "Equivalencias";
const url = `https://opensheet.elk.sh/${sheetID}/${sheetName}`;

const tableBody = document.getElementById("data-body");
const searchInput = document.getElementById("search");
const marcaFilter = document.getElementById("marcaFilter");
const pisoFilter = document.getElementById("pisoFilter");

let data = [];

fetch(url)
  .then(res => res.json())
  .then(json => {
    data = json;
    populateFilters(data);
  });

function renderTable(dataSet) {
  tableBody.innerHTML = "";
  dataSet.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row["IMAGEN"] ? `<img src="${row["IMAGEN"]}" style="width:80px;height:auto;">` : ""}</td>
      <td>${row["CODIGO DE BARRAS"] || ""}</td>
      <td>${row["DESCRIPCION"] || ""}</td>
      <td>${row["PRECIO"] || ""}</td>
      <td>${row["MARCA"] || ""}</td>
      <td>${row["PISO"] || ""}</td>
    `;
    tableBody.appendChild(tr);
  });
}


function populateFilters(dataSet) {
  const marcas = [...new Set(dataSet.map(item => item["MARCA"]).filter(Boolean))];
  const pisos = [...new Set(dataSet.map(item => item["PISO"]).filter(Boolean))];

  marcas.forEach(marca => {
    const opt = document.createElement("option");
    opt.value = marca;
    opt.textContent = marca;
    marcaFilter.appendChild(opt);
  });

  pisos.forEach(piso => {
    const opt = document.createElement("option");
    opt.value = piso;
    opt.textContent = piso;
    pisoFilter.appendChild(opt);
  });
}

function applyFilters() {
  const search = searchInput.value.toLowerCase();
  const selectedMarca = marcaFilter.value;
  const selectedPiso = pisoFilter.value;

  if (!search && !selectedMarca && !selectedPiso) {
    tableBody.innerHTML = "";
    return;
  }

  const filtered = data.filter(row => {
    return (!selectedMarca || row["MARCA"] === selectedMarca) &&
           (!selectedPiso || row["PISO"] === selectedPiso) &&
           (row["DESCRIPCION"]?.toLowerCase().includes(search) ||
            row["CODIGO DE BARRAS"]?.toLowerCase().includes(search) ||
            row["MARCA"]?.toLowerCase().includes(search) ||
            row["PISO"]?.toLowerCase().includes(search));
  });

  renderTable(filtered);
}

searchInput.addEventListener("input", applyFilters);
marcaFilter.addEventListener("change", applyFilters);
pisoFilter.addEventListener("change", applyFilters);
