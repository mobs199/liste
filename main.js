
    document.getElementById("current-date").innerHTML = new Date().toLocaleDateString("de-DE");
    let csvData = [];
    let keinImg = [];
    let skuKey = "sku";

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

    document.addEventListener("DOMContentLoaded", () => {
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
           /* const imageUrl = foundItem.export_ts || "";
            if (imageUrl === "") {
               imageUrl = foundItem.public_image_0 || "";
            }*/
            const imageUrl = foundItem.export_ts || foundItem.public_image_0|| "";
            if(imageUrl===""){
              keinImg.unshift(SKUNr);
            }
            const preisEbaySumme = parseFloat(foundItem.preis_ebay_summe) || 0; 
            const preis250 = (preisEbaySumme * 1.24).toFixed(2) + "€";
            const preis500 = (preisEbaySumme * 1.14).toFixed(2) + "€";
            const preis1000 = (preisEbaySumme * 1.10).toFixed(2) + "€";
            const preis5000 = (preisEbaySumme * 1.06 ).toFixed(2) + "€";

            const newRow = document.createElement("tr");
            newRow.innerHTML = `
            <td>${SKUNr}</td>
            <td><img src="${imageUrl}" alt="${name}" class="product-image"></td>
              <td>${herstellerName}</td>
              <td>${name}<br>ean Nummer:${ean}</td>
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
        console.log(keinImg)
        document.getElementById("productForm").reset();
      });
    });