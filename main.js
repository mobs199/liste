document.getElementById("current-date").innerHTML = new Date().toLocaleDateString("de-DE");

let csvData = [];
let keinImg = [];
let skuKey = "sku";
let isDollar = false;
let exchangeRateEURtoUSD = 1;

// CSV-Daten laden
Papa.parse("EWANTO_Produkt.csv", {
  download: true,
  header: true,
  dynamicTyping: true,
  skipEmptyLines: true,
  complete: function (results) {
    csvData = results.data || [];
  },
  error: function (err) {
    console.error("Fehler beim Laden der CSV:", err);
  }
});

// Wechselkurs abrufen
fetch("https://v6.exchangerate-api.com/v6/1f496139322ff0f6f170f135/latest/EUR")
  .then(response => response.json())
  .then(data => {
    if (data?.conversion_rates?.USD) {
      exchangeRateEURtoUSD = data.conversion_rates.USD;
    }
  })
  .catch(error => console.error('Fehler beim Abrufen des Wechselkurses:', error));

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("currency-toggle-btn").addEventListener("click", () => {
    isDollar = !isDollar;
    document.getElementById("currency-toggle-btn").innerHTML = isDollar ? "Euro €" : "USD $";
    updateTablePrices();
  });

  document.getElementById("productForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const inputText = document.getElementById("sku").value;
    const inputList = inputText.split(/[\n,]+/).map(entry => entry.trim()).filter(entry => entry !== "");

    const tbody = document.querySelector("#productTable tbody");

    inputList.forEach((inputValue) => {
      const foundItems = csvData.filter(item => 
        item[skuKey]?.toString().trim() === inputValue ||
        item.hersteller_name?.toLowerCase().trim() === inputValue.toLowerCase()
      );

      foundItems.forEach(foundItem => {
        let isSet = foundItem.type || "";
if (isSet === "set") {
  return;
}

        const preisEbaySumme = parseFloat(foundItem.preis_ebay_summe) || 0;
        const herstellerName = foundItem.hersteller_name || "";
        const herstellerNr = foundItem.hersteller_nr || "";
        const name = foundItem.name || "";
        const ean = foundItem.tentative_ean || "";
        let imageUrl = (typeof foundItem.export_ts === "string" ? foundItem.export_ts.trim() : "") ||
        (typeof foundItem.public_image_0 === "string" ? foundItem.public_image_0.trim() : "");

        if (!imageUrl.startsWith("https://i.ewanto.de")) {
          keinImg.unshift(foundItem[skuKey]);
        }

        const newRow = document.createElement("tr");
        newRow.dataset.preisEbaySumme = preisEbaySumme;
        
        function calcPrice(factor) {
          return (isDollar ? preisEbaySumme * factor * exchangeRateEURtoUSD : preisEbaySumme * factor)
            .toFixed(2) + (isDollar ? "$" : "€");
        }

        newRow.innerHTML = `
          <td>${foundItem[skuKey]}</td>
          <td><img src="${imageUrl}" alt="${name}" class="product-image"></td>
          <td>${herstellerName}</td>
          <td>${name}<br>EAN: ${ean}</td>
          <td>${herstellerNr}</td>
          <td class="price-250">${calcPrice(1.24)}</td>
          <td class="price-500">${calcPrice(1.14)}</td>
          <td class="price-1000">${calcPrice(1.10)}</td>
          <td class="price-5000">${calcPrice(1.06)}</td>
        `;

        tbody.appendChild(newRow);

        newRow.querySelector(".product-image").addEventListener("dblclick", function () {
          if (confirm("Sind Sie sicher, dass Sie dieses Produkt löschen möchten?")) {
            newRow.remove();
          }
        });
      });
    });

    document.getElementById("productForm").reset();
  });
});

function updateTablePrices() {
  document.querySelectorAll("#productTable tbody tr").forEach(row => {
    const preisEbaySumme = parseFloat(row.dataset.preisEbaySumme) || 0;
    
    function calcPrice(factor) {
      return (isDollar ? preisEbaySumme * factor * exchangeRateEURtoUSD : preisEbaySumme * factor)
        .toFixed(2) + (isDollar ? "$" : "€");
    }

    row.querySelector(".price-250").textContent = calcPrice(1.24);
    row.querySelector(".price-500").textContent = calcPrice(1.14);
    row.querySelector(".price-1000").textContent = calcPrice(1.10);
    row.querySelector(".price-5000").textContent = calcPrice(1.06);
  });
}
