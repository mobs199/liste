document.getElementById("current-date").innerHTML = new Date().toLocaleDateString("de-DE");

let csvData = [];
let keinImg = [];
let skuKey = "sku";
let isDollar = false; // الحالة: افتراضيًا الأسعار باليورو

// الحصول على سعر الصرف من يورو إلى دولار باستخدام API
let exchangeRateEURtoUSD = 1;  // سيتم تحديثه ببيانات الـ API

Papa.parse("EWANTO_Produkt.csv", {
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

// الحصول على سعر الصرف من يورو إلى دولار باستخدام API
fetch("https://v6.exchangerate-api.com/v6/1f496139322ff0f6f170f135/latest/EUR")
  .then(response => response.json())
  .then(data => {
    if (data && data.conversion_rates && data.conversion_rates.USD) {
      exchangeRateEURtoUSD = data.conversion_rates.USD;
    }
  })
  .catch(error => console.error('Error getting exchange rate:', error));

document.addEventListener("DOMContentLoaded", () => {
  // تفعيل الزر لتبديل العملة
  document.getElementById("currency-toggle-btn").addEventListener("click", () => {
    isDollar = !isDollar; // تبديل العملة بين الدولار واليورو
    const button = document.getElementById("currency-toggle-btn");
    button.innerHTML = isDollar ? "Euro €" : "USD $";  // تغيير نص الزر
    updateTablePrices(); // تحديث الأسعار في الجدول
  });

  document.getElementById("productForm").addEventListener("submit", function (e) {
    e.preventDefault();
    
    const skuInput = document.getElementById("sku").value;
    const skuList = skuInput.split(/[\n,]+/).map(sku => sku.trim()).filter(sku => sku !== "");

    const tbody = document.querySelector("#productTable tbody");

    skuList.forEach((skuValue) => {
      const foundItem = csvData.find((item) => {
        if (!item[skuKey]) return false;
        return item[skuKey].toString().trim() === skuValue;
      });

      if (foundItem) {
        const SKUNr = foundItem[skuKey] || "";
        const name = foundItem.name || "";
        const ean = foundItem.tentative_ean || "";
        const herstellerName = foundItem.hersteller_name || "";
        const herstellerNr = foundItem.hersteller_nr || "";

        let imageUrl = foundItem.export_ts ? String(foundItem.export_ts).trim() : "";
        if (imageUrl === "" || !imageUrl.startsWith("https://i.ewanto.de")) {
           imageUrl = foundItem.public_image_0 ? String(foundItem.public_image_0).trim() : "";
        }
        
        if (imageUrl === "") {
          keinImg.unshift(SKUNr);
        }

        // قراءة السعر الأساسي من CSV (بافتراض أنه باليورو)
        const preisEbaySumme = parseFloat(foundItem.preis_ebay_summe) || 0;
        
        // تخزين السعر الأساسي في صف الجدول لاستخدامه لاحقًا في تحديث الأسعار
        const newRow = document.createElement("tr");
        newRow.dataset.preisEbaySumme = preisEbaySumme;

        // حساب الأسعار بناءً على العملة والضرب في معامل معين:
        // في حالة اليورو: السعر = preisEbaySumme * معامل
        // في حالة الدولار: السعر = preisEbaySumme * معامل * exchangeRateEURtoUSD
        const preis250 = (isDollar ? (preisEbaySumme * 1.24 * exchangeRateEURtoUSD) : preisEbaySumme * 1.24).toFixed(2) + (isDollar ? "$" : "€");
        const preis500 = (isDollar ? (preisEbaySumme * 1.14 * exchangeRateEURtoUSD) : preisEbaySumme * 1.14).toFixed(2) + (isDollar ? "$" : "€");
        const preis1000 = (isDollar ? (preisEbaySumme * 1.10 * exchangeRateEURtoUSD) : preisEbaySumme * 1.10).toFixed(2) + (isDollar ? "$" : "€");
        const preis5000 = (isDollar ? (preisEbaySumme * 1.06 * exchangeRateEURtoUSD) : preisEbaySumme * 1.06).toFixed(2) + (isDollar ? "$" : "€");

        newRow.innerHTML = `
          <td>${SKUNr}</td>
          <td><img src="${imageUrl}" alt="${name}" class="product-image"></td>
          <td>${herstellerName}</td>
          <td>${name}<br>EAN Nummer: ${ean}</td>
          <td>${herstellerNr}</td>
          <td>${preis250}</td>
          <td>${preis500}</td>
          <td>${preis1000}</td>
          <td>${preis5000}</td>
        `;
        tbody.appendChild(newRow);

        newRow.querySelector(".product-image").addEventListener("dblclick", function () {
          if (confirm("Sind Sie sicher, dass Sie dieses Produkt löschen möchten?")) {
            newRow.remove();
          }
        });
      } else {
        console.warn("SKU nicht gefunden:", skuValue);
      }
    });

    console.log(keinImg);
    document.getElementById("productForm").reset();
  });
});

// دالة لتحديث الأسعار في الجدول عند تبديل العملة
function updateTablePrices() {
  const rows = document.querySelectorAll("#productTable tbody tr");
  rows.forEach(row => {
    const preis250Cell = row.cells[5];
    const preis500Cell = row.cells[6];
    const preis1000Cell = row.cells[7];
    const preis5000Cell = row.cells[8];
    
    // استعادة السعر الأساسي من الـ dataset
    const preisEbaySumme = parseFloat(row.dataset.preisEbaySumme) || 0;
    
    preis250Cell.textContent = (isDollar ? (preisEbaySumme * 1.24 * exchangeRateEURtoUSD) : preisEbaySumme * 1.24).toFixed(2) + (isDollar ? "$" : "€");
    preis500Cell.textContent = (isDollar ? (preisEbaySumme * 1.14 * exchangeRateEURtoUSD) : preisEbaySumme * 1.14).toFixed(2) + (isDollar ? "$" : "€");
    preis1000Cell.textContent = (isDollar ? (preisEbaySumme * 1.10 * exchangeRateEURtoUSD) : preisEbaySumme * 1.10).toFixed(2) + (isDollar ? "$" : "€");
    preis5000Cell.textContent = (isDollar ? (preisEbaySumme * 1.06 * exchangeRateEURtoUSD) : preisEbaySumme * 1.06).toFixed(2) + (isDollar ? "$" : "€");
  });
}
