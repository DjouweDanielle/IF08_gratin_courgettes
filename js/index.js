const FIELDS = "product_name,nutriscore_grade,nutriscore_score,image_front_small_url";

function fetchProduct(barcode, name) {
  let url = `https://world.openfoodfacts.net/api/v2/product/${barcode}?fields=${FIELDS}`;
  return fetch(url, { crossorigin: "anonymous" })
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then((data) => {
      return { ...data.product, customName: name };
    });
}

function renderData(product) {
  const {
    customName,
    image_front_small_url,
    nutriscore_grade,
  } = product;

  // 🌟 NOUVEAU : Récupération de l'image du badge Nutri-Score
  let nutriScoreHtml = `<p class="mb-0 text-muted">Nutri-Score <strong>Inconnu</strong></p>`;
  if (nutriscore_grade) {
    const badgeUrl = `https://static.openfoodfacts.org/images/attributes/dist/nutriscore-${nutriscore_grade.toLowerCase()}.svg`;
    nutriScoreHtml = `<img src="${badgeUrl}" alt="Nutri-Score ${nutriscore_grade.toUpperCase()}" style="height: 35px;">`;
  }

  const card = document.createElement("div");
  card.className = "card mb-3 shadow-sm align-items-center";
  card.innerHTML = `
    <div class="card-body d-flex align-items-center gap-3">
      <img src="${image_front_small_url}" class="img-thumbnail" style="max-width: 80px; max-height: 120px;">
      <div>
        <h5 class="card-title mb-1">${customName}</h5>
        ${nutriScoreHtml}
      </div>
    </div>
  `;

  document.getElementById("product-list").appendChild(card);
}

function getAverageGrade(score) {
  if (score <= -1) return 'A';
  if (score <= 2) return 'B';
  if (score <= 10) return 'C';
  if (score <= 18) return 'D';
  return 'E';
}

// 🌟 NOUVEAU : Fonction pour obtenir la bonne couleur Bootstrap selon la note
function getAlertClass(grade) {
  if (grade === 'A' || grade === 'B') return 'alert-success'; // Vert
  if (grade === 'C') return 'alert-warning'; // Jaune
  return 'alert-danger'; // Rouge (D, E)
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("product-list").innerHTML = "";

  fetch("data/data.json")
    .then((response) => response.json())
    .then((data) => {
      const promises = data.map((product) => fetchProduct(product.code, product.name));
      return Promise.all(promises);
    })
    .then((products) => {
      let totalScore = 0;
      let validCount = 0;

      products.forEach((product) => {
        renderData(product);
        if (product.nutriscore_score !== undefined && product.nutriscore_score !== null) {
          totalScore += product.nutriscore_score;
          validCount++;
        }
      });

      const averageContainer = document.getElementById("average-nutriscore");

      if (validCount > 0) {
        const averageScore = totalScore / validCount;
        const averageGrade = getAverageGrade(averageScore);

        // 🌟 NOUVEAU : Application de la classe de couleur dynamique et du badge dans le titre
        const alertClass = getAlertClass(averageGrade);
        const badgeUrl = `https://static.openfoodfacts.org/images/attributes/dist/nutriscore-${averageGrade.toLowerCase()}.svg`;

        averageContainer.className = `alert ${alertClass} text-center fs-5 shadow-sm d-flex justify-content-center align-items-center gap-3`;
        averageContainer.innerHTML = `
            <span>Nutri-Score moyen de la recette : (Score : ${averageScore.toFixed(1)})</span>
            <img src="${badgeUrl}" alt="Nutri-Score ${averageGrade}" style="height: 45px;">
        `;
      } else {
        averageContainer.className = "alert alert-warning text-center fs-5 shadow-sm";
        averageContainer.innerHTML = "Impossible de calculer le Nutri-Score moyen, données insuffisantes.";
      }
    })
    .catch((error) => {
      console.error("Erreur lors du fetch global :", error);
      const averageContainer = document.getElementById("average-nutriscore");
      averageContainer.className = "alert alert-danger text-center fs-5 shadow-sm";
      averageContainer.innerHTML = "Erreur lors de la récupération des données.";
    });
});