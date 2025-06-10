const sheetID = "1id74cUVaB0GN6ROPrxwBj8K-FZWkl6dD7kMgWze_X6U";
const sheetNames = ["PB", "BEAUTY", "BAZAR", "PROMOCIONES"];
const urls = sheetNames.map(name => `https://opensheet.elk.sh/${sheetID}/${name}`);

const tableBody = document.getElementById("data-body");
const searchInput = document.getElementById("search");
const marcaFilter = document.getElementById("marcaFilter");
const pisoFilter = document.getElementById("pisoFilter");

let data = [];

// --- Cargar datos de todas las hojas ---
Promise.all(urls.map(url => fetch(url).then(res => res.json())))
  .then(results => {
    data = results.flat();
    populateFilters(data);
    applyDefaultFilters(); // Mostrar por defecto Promociones
    renderTable(data);
  });

// --- Seleccionar todo el texto al hacer clic en el input ---
searchInput.addEventListener("focus", function() {
  searchInput.select();
});

// --- Filtros dinámicos ---
searchInput.addEventListener("input", () => {
  const value = searchInput.value.trim();
  // Solo filtra si tiene 3 letras o más
  if (value.length >= 3) {
    marcaFilter.value = "";
    pisoFilter.value = "";
    renderTable(data);
  }
  // Si tiene menos de 3, no hace nada, deja la tabla como está
});
marcaFilter.addEventListener("change", () => renderTable(data));
pisoFilter.addEventListener("change", () => renderTable(data));

// --- Poblar filtros únicos ---
function populateFilters(data) {
  const marcas = [...new Set(data.map(item => item.MARCA).filter(Boolean))].sort();
  const pisos = [...new Set(data.map(item => item.PISO).filter(Boolean))].sort();

  // Opción por defecto (vacía)
  const defaultOptionMarca = document.createElement("option");
  defaultOptionMarca.value = "";
  defaultOptionMarca.textContent = "Todas";
  marcaFilter.appendChild(defaultOptionMarca);

  const defaultOptionPiso = document.createElement("option");
  defaultOptionPiso.value = "";
  defaultOptionPiso.textContent = "Todos";
  pisoFilter.appendChild(defaultOptionPiso);

  marcas.forEach(marca => {
    const option = document.createElement("option");
    option.value = marca;
    option.textContent = marca;
    marcaFilter.appendChild(option);
  });

  pisos.forEach(piso => {
    const option = document.createElement("option");
    option.value = piso;
    option.textContent = piso;
    pisoFilter.appendChild(option);
  });
}

// --- Aplicar filtro por defecto ---
function applyDefaultFilters() {
  pisoFilter.value = "PROMOCION"; 
}

// --- Renderizar tabla con filtros activos ---
function renderTable(data) {
  const search = searchInput.value.trim().toLowerCase();
  const marca = marcaFilter.value;
  const piso = pisoFilter.value;

  const filtered = data.filter(item => {
    // Si la búsqueda tiene 3 letras o más, solo busca por texto (sin filtros)
    if (search.length >= 3) {
      return (
        (item.DESCRIPCION?.toLowerCase().includes(search) ||
         item["CÓDIGO DE BARRAS"]?.toLowerCase().includes(search) ||
         item.MARCA?.toLowerCase().includes(search) ||
         item.PISO?.toLowerCase().includes(search))
      );
    } else {
      // Si la búsqueda tiene menos de 3 letras, filtra por Marca y Piso normalmente
      const matchesMarca = !marca || item.MARCA === marca;
      const matchesPiso = !piso || item.PISO === piso;
      return matchesMarca && matchesPiso;
    }
  });

  tableBody.innerHTML = "";

  if (filtered.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 6;
    cell.textContent = "No se encontraron resultados.";
    row.appendChild(cell);
    tableBody.appendChild(row);
    return;
  }

  filtered.forEach(item => {
    const row = document.createElement("tr");

    // Imagen
    const imgCell = document.createElement("td");
    if (item.IMAGEN) {
      const img = document.createElement("img");
      img.src = item.IMAGEN;
      img.alt = item.DESCRIPCION || "";
      imgCell.appendChild(img);
    }
    row.appendChild(imgCell);

    // Precio
    const precioCell = document.createElement("td");
    precioCell.textContent = item.PRECIO || "";
    row.appendChild(precioCell);

    // Código de Barras
    const codigoCell = document.createElement("td");
    codigoCell.textContent = item["CÓDIGO DE BARRAS"] || "";
    codigoCell.classList.add("codigo");
    row.appendChild(codigoCell);

    // Descripción
    const descCell = document.createElement("td");
    descCell.textContent = item.DESCRIPCION || "";
    descCell.classList.add("descripcion");
    row.appendChild(descCell);

    // Marca
    const marcaCell = document.createElement("td");
    marcaCell.textContent = item.MARCA || "";
    marcaCell.classList.add("ocultar-en-movil");
    row.appendChild(marcaCell);

    // Piso
    const pisoCell = document.createElement("td");
    pisoCell.textContent = item.PISO || "";
    pisoCell.classList.add("ocultar-en-movil");
    row.appendChild(pisoCell);

    tableBody.appendChild(row);
  });
}
