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
