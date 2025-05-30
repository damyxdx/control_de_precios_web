const sheetID = "1id74cUVaB0GN6ROPrxwBj8K-FZWkl6dD7kMgWze_X6U";
const sheetNames = ["PB", "BEAUTY", "BAZAR"];
const urls = sheetNames.map(name => `https://opensheet.elk.sh/${sheetID}/${name}`);

const tableBody = document.getElementById("data-body");
const searchInput = document.getElementById("search");
const marcaFilter = document.getElementById("marcaFilter");
const pisoFilter = document.getElementById("pisoFilter");

let data = [];

Promise.all(urls.map(url => fetch(url).then(res => res.json())))
  .then(results => {
    data = results.flat();  // Une todos los datos de las hojas
    populateFilters(data);
    setInitialMessage();
  });

function renderTable(dataSet) {
  tableBody.innerHTML = "";

  if (dataSet.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6">No se encontraron resultados.</td></tr>`;
    return;
  }

  dataSet.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row["IMAGEN"] ? `<img src="${row["IMAGEN"]}" style="width:80px;height:auto;">` : ""}</td>
      <td>${row["PRECIO"] || ""}</td>
      <td>${row["CODIGO DE BARRAS"] || ""}</td>
      <td>${row["DESCRIPCION"] || ""}</td>      
      <td>${row["MARCA"] || ""}</td>
      <td>${row["PISO"] || ""}</td>
    `;
    tableBody.appendChild(tr);
  });
}

function populateFilters(dataSet) {
  const marcas = [...new Set(dataSet.map(item => item["MARCA"]).filter(Boolean))];
  const pisos = [...new Set(dataSet.map(item => item["PISO"]).filter(Boolean))];

  marcaFilter.innerHTML = `<option value="">Todas las Marcas</option>`;
  pisoFilter.innerHTML = `<option value="">Todos los Pisos</option>`;

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
    setInitialMessage();
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

function setInitialMessage() {
  tableBody.innerHTML = `<tr><td colspan="6">Usa los filtros o ingresa una búsqueda para mostrar resultados.</td></tr>`;
}

searchInput.addEventListener("input", applyFilters);
marcaFilter.addEventListener("change", applyFilters);
pisoFilter.addEventListener("change", applyFilters);

marcaFilter.addEventListener("change", applyFilters);
pisoFilter.addEventListener("change", applyFilters);
