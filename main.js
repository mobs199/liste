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
        Image: {type: 'jpeg',quality: 1},
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
    if (csvData.length === 0) {
      console.warn("Die CSV-Datei ist leer oder konnte nicht geladen werden.");
      return;
    }


    const firstRowKeys = Object.keys(csvData[0]).map(k => k.replace(/\uFEFF/g, '').trim());
    console.log("First row keys:", firstRowKeys);

    Object.keys(csvData[0]).forEach((key) => {
      const cleanKey = key.replace(/\uFEFF/g, '').trim().toLowerCase();
      if (cleanKey === "sku") {
        skuKey = key;
      }
    });

    console.log("Using SKU key:", skuKey);

    csvData.forEach((item, index) => {
      console.log(`Row ${index}, SKU=`, item[skuKey]);
    });
  },
  error: function (err) {
    console.error("Error loading CSV:", err);
  },
});


document.addEventListener("DOMContentLoaded", () => {
  const skuInput = document.getElementById("sku");
  if (!skuInput) {
    console.warn("Kein Feld mit ID='sku' gefunden!");
    return;
  }

  skuInput.addEventListener("change", function () {
    const skuValue = this.value.trim();
    if (!skuValue) return;

    const foundItem = csvData.find((item) => {
      if (!item[skuKey]) return false;
      return item[skuKey].toString().trim() === skuValue;
    });

    if (foundItem) {
      console.log("Gefundenes Produkt:", foundItem);

      const basePriceField              = document.getElementById("basePrice");
      const descriptionTextField        = document.getElementById("descriptionText");
      const descriptionBulletpointField = document.getElementById("descriptionBulletpoint");
      const imageUrlField               = document.getElementById("imageUrl");
      const imageUrl2Field              = document.getElementById("imageUrl2");
      const manufacturerField           = document.getElementById("manufacturer");

      if (basePriceField)              basePriceField.value              = foundItem.preis_ebay_summe         || "";
      if (descriptionTextField)        descriptionTextField.value        = foundItem.description_text         || "";
      if (descriptionBulletpointField) descriptionBulletpointField.value = foundItem.description_bulletpoint  || "";
      if (imageUrlField)               imageUrlField.value               = foundItem.public_image_0           || "";
      if (imageUrl2Field)              imageUrl2Field.value              = foundItem.public_image_1           || "";
      if (manufacturerField)           manufacturerField.value           = foundItem.hersteller_name          || "";

    } else {
      alert("Kein Produkt mit dieser SKU gefunden!");
      console.warn("Die SKU", skuValue, "ist nicht in csvData vorhanden.");

      ["basePrice","descriptionText","descriptionBulletpoint","imageUrl","imageUrl2","manufacturer"].forEach((id) => {
        const field = document.getElementById(id);
        if (field) field.value = "";
      });
    }
  });
});
