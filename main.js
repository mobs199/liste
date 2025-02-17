document.getElementById('productForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const manufacturer = document.getElementById('manufacturer').value;
    const series = document.getElementById('series').value;
    const batteryCount = document.getElementById('batteryCount').value;
    const price250 = document.getElementById('price250').value;
    const price500 = document.getElementById('price500').value;
    const price1000 = document.getElementById('price1000').value;
    let price5000 = document.getElementById('price5000').value;

    if (!price5000) price5000 = '-';

    const imageFileInput = document.getElementById('imageFile');
    const file = imageFileInput.files[0];

    if (!file) {
        alert("Bitte laden Sie ein Bild hoch.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
        const imageUrl = event.target.result;
        const tbody = document.getElementById('productTable').querySelector('tbody');
        const newRow = document.createElement('tr');

        newRow.innerHTML = `
            <td><img src="${imageUrl}" alt="${manufacturer} ${series}" class="product-image"></td>
            <td>${manufacturer}</td>
            <td>${series}</td>
            <td>${batteryCount}</td>
            <td>${price250}</td>
            <td>${price500}</td>
            <td>${price1000}</td>
            <td>${price5000}</td>
            <td><button class="delete-btn">Löschen</button></td>
        `;

        tbody.appendChild(newRow);

        newRow.querySelector('.delete-btn').addEventListener('click', function () {
            if (confirm("Sind Sie sicher, dass Sie dieses Produkt löschen möchten?")) {
                tbody.removeChild(newRow);
            }
        });

        document.getElementById('productForm').reset();
    };

    reader.readAsDataURL(file);
});

document.getElementById('dl-pdf').onclick = function () {
    document.getElementsByClassName("delete-btn")[0].style.display = "none";
    let element = document.getElementById('d-pdf');
    let opt = {
        margin: 0,
        filename: 'mylist.pdf',
        Image: {type: 'jpeg',quality: 0.98},
        html2canvas: { scale : 10},
        jsPDF: {unit: 'in', format: 'letter',orientation:'portrait'}
    };
    html2pdf(element, opt);
};

let csvData = [];

let skuKey = "sku";

Papa.parse("EWANTO_Produkt_js.csv", {
  download: true,
  header: true,
  dynamicTyping: true,
  skipEmptyLines: true,
  complete: function (results) {
    csvData = results.data || [];
    console.log("CSV Data loaded:", csvData);
    
    if (csvData.length > 0) {
      Object.keys(csvData[0]).forEach((key) => {
        const cleanKey = key.replace(/\uFEFF/g, '').trim().toLowerCase();
        if (cleanKey === "sku") {
          skuKey = key;
        }
      });
      console.log("Using SKU key:", skuKey);
    } else {
      console.warn("Die CSV-Datei ist leer oder konnte nicht geladen werden.");
    }
  },
  error: function (err) {
    console.error("Error loading CSV:", err);
  },
});

document.addEventListener("DOMContentLoaded", () => {
  const skuInput = document.getElementById("sku");
  if (!skuInput) {
    console.error("Kein SKU-Feld mit ID='sku' gefunden!");
    return;
  }
  
  skuInput.addEventListener("input", function () {
    const skuValue = this.value.trim();
    if (!skuValue) return;
    
    const foundItem = csvData.find((item) => {
      if (!item[skuKey]) return false;
      return item[skuKey].toString().trim() === skuValue;
    });
    
    if (foundItem) {
      console.log("Gefundenes Produkt:", foundItem);
      document.getElementById("name").value = foundItem.name || "";
      document.getElementById("hersteller_name").value = foundItem.hersteller_name || "";
      document.getElementById("hersteller_nr").value = foundItem.hersteller_nr || "";
      document.getElementById("public_image_0").value = foundItem.public_image_0 || "";
      document.getElementById("preis_ebay_summe").value = foundItem.preis_ebay_summe || "";
    } else {
      console.warn("SKU", skuValue, "nicht in CSV-Daten gefunden.");
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
      <td><img src="${imageUrl}" alt="${name}" class="product-image" style="max-width:50px;"></td>
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
      margin: 0,
      filename: 'Produktliste.pdf',
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save().then(() => {
      deleteButtons.forEach(btn => btn.style.display = "");
    });
  });
});
