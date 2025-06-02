const sheetID = "1id74cUVaB0GN6ROPrxwBj8K-FZWkl6dD7kMgWze_X6U";
const sheetNames = ["PB", "BEAUTY", "BAZAR"];
const urls = sheetNames.map(name => `https://opensheet.elk.sh/${sheetID}/${name}`);

const tableBody = document.getElementById("data-body");
const searchInput = document.getElementById("search");
const marcaFilter = document.getElementById("marcaFilter");
const pisoFilter = document.getElementById("pisoFilter");

let data = [];

// --- Carga de datos desde todas las hojas ---
Promise.all(urls.map(url => fetch(url).then(res => res.json())))
  .then(results => {
    data = results.flat();
    populateFilters(data);

    // --- Selección por defecto: Piso "Promocion" ---
    const promociones = "Promocion";
    const opcionPromociones = [...pisoFilter.options].find(opt => opt.value.toLowerCase() === promociones.toLowerCase());
    if (opcionPromociones) {
      pisoFilter.value = opcionPromociones.value;
      applyFilters();
    } else {
      setInitialMessage();
    }
  });

// --- Renderizado de tabla ---
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

// --- Filtros alfabéticos ---
function populateFilters(dataSet) {
  const marcas = [...new Set(dataSet.map(item => item["MARCA"]).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'));
  const pisos = [...new Set(dataSet.map(item => item["PISO"]).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'));

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

// --- Aplicar filtros ---
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
           (
             row["DESCRIPCION"]?.toLowerCase().includes(search) ||
             row["CODIGO DE BARRAS"]?.toLowerCase().includes(search) ||
             row["MARCA"]?.toLowerCase().includes(search) ||
             row["PISO"]?.toLowerCase().includes(search)
           );
  });

  renderTable(filtered);
}

// --- Mensaje inicial ---
function setInitialMessage() {
  tableBody.innerHTML = `<tr><td colspan="6">Usa los filtros o ingresa una búsqueda para mostrar resultados.</td></tr>`;
}

// --- Selecciona todo el texto al hacer foco ---
searchInput.addEventListener("focus", function() {
  searchInput.select();
});

// --- Al escribir en el buscador, limpia los filtros y filtra ---
searchInput.addEventListener("input", function() {
  if (marcaFilter.value !== "" || pisoFilter.value !== "") {
    marcaFilter.value = "";
    pisoFilter.value = "";
  }
  applyFilters();
});

// --- Al cambiar filtros, limpia el buscador y filtra ---
marcaFilter.addEventListener("change", function() {
  if (searchInput.value !== "") {
    searchInput.value = "";
  }
  applyFilters();
});
pisoFilter.addEventListener("change", function() {
  if (searchInput.value !== "") {
    searchInput.value = "";
  }
  applyFilters();
});
