const FIELDS =
  "product_name,nutriscore_grade,nutriscore_score,image_front_small_url";

function loadProduct(barcode, name) {
  let url = `https://world.openfoodfacts.net/api/v2/product/${barcode}?fields=${FIELDS}`;
  console.log(barcode);
  fetch(url, { crossorigin: "anonymous" })
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then((data) => {
      renderData(data.product, name);
    })
    .catch((err) => {
      document.getElementById("product-name").innerHTML =
        `<div class="alert alert-danger">Erreur : ${err.message}</div>`;
    });
}

function renderData(product, name) {
  const {
    product_name,
    image_front_small_url,
    nutriscore_grade,
    nutriscore_score,
  } = product;
  const grade = nutriscore_grade.toUpperCase();

  const card = document.createElement("div");
  card.className = "card mb-3";
  card.innerHTML = `
    <div class="card-body d-flex align-items-center gap-3">
      <img src="${image_front_small_url}" class="img-thumbnail" style="max-width: 100px;">
      <div>
        <h5 class="card-title mb-1">${name}</h5>
        <p class="mb-0 text-muted">Nutri-Score <strong>${grade}</strong></p>
      </div>
    </div>
  `;

  document.getElementById("product-list").appendChild(card);
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("product-list").innerHTML = "";

  fetch("data/data.json")
    .then((response) => response.json())
    .then((data) => {
      for (let product of data) {
        loadProduct(product.code, product.name);
      }
    })
    .catch((error) => console.error("Erreur lors du fetch :", error));
});
