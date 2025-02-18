let csvData = [];
let skuKey = "sku";

Papa.parse("EWANTO_Produkt_js.csv", {
  download: true,
  header: true,
  dynamicTyping: true,
  skipEmptyLines: true,
  complete: function (results) {
    csvData = results.data || [];
    if (csvData.length > 0) {
      Object.keys(csvData[0]).forEach((key) => {
        const cleanKey = key.replace(/\uFEFF/g, '').trim().toLowerCase();
        if (cleanKey === "sku") {
          skuKey = key;
        }
      });
    } else {
      console.warn("Die CSV-Datei ist leer oder konnte nicht geladen werden.");
    }
  },
  error: function (err) {
    console.error("Error loading CSV:", err);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const skuInput = document.getElementById("sku");
  skuInput.addEventListener("input", function () {
    const skuValue = this.value.trim();
    if (!skuValue) return;
    
    const foundItem = csvData.find((item) => {
      if (!item[skuKey]) return false;
      return item[skuKey].toString().trim() === skuValue;
    });
    
    if (foundItem) {
      document.getElementById("name").value = foundItem.name || "";
      document.getElementById("hersteller_name").value = foundItem.hersteller_name || "";
      document.getElementById("hersteller_nr").value = foundItem.hersteller_nr || "";
      document.getElementById("public_image_0").value = foundItem.public_image_0 || "";
      document.getElementById("preis_ebay_summe").value = foundItem.preis_ebay_summe || "";
    } else {
      ["name", "hersteller_name", "hersteller_nr", "public_image_0", "preis_ebay_summe"].forEach((id) => {
        document.getElementById(id).value = "";
      });
    }
  });

  document.getElementById("productForm").addEventListener("submit", function (e) {
    e.preventDefault();
    
    const name = document.getElementById("name").value;
    const herstellerName = document.getElementById("hersteller_name").value;
    const herstellerNr = document.getElementById("hersteller_nr").value;
    const imageUrl = document.getElementById("public_image_0").value;
    const preis = document.getElementById("preis_ebay_summe").value;
    
    const tbody = document.querySelector("#productTable tbody");
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
      <td><img src="${imageUrl}" alt="jpeg" class="product-image"></td>
      <td>${herstellerName}</td>
      <td>${name}</td>
      <td>${herstellerNr}</td>
      <td>${preis}</td>
      <td><button class="delete-btn">Löschen</button></td>
    `;
    tbody.appendChild(newRow);
    
    newRow.querySelector(".delete-btn").addEventListener("click", function () {
      if (confirm("Sind Sie sicher, dass Sie dieses Produkt löschen möchten?")) {
        newRow.remove();
      }
    });
    
    document.getElementById("productForm").reset();
  });

  document.getElementById("dl-pdf").addEventListener("click", function () {
    const deleteButtons = document.querySelectorAll(".delete-btn");
    deleteButtons.forEach(btn => btn.style.display = "none");
    
    const element = document.getElementById("d-pdf");
    const opt = {
      margin: 10,
      filename: 'Produktliste.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: 'avoid-all' }
    };
    html2pdf().set(opt).from(element).save().then(() => {
      deleteButtons.forEach(btn => btn.style.display = "");
    });
  });
});
