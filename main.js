        // When the form is submitted, process the data and add a new row to the table
        document.getElementById('productForm').addEventListener('submit', function (e) {
            e.preventDefault(); // Prevent the default form submission

            // Read the form data
            const manufacturer = document.getElementById('manufacturer').value;
            const series = document.getElementById('series').value;
            const batteryCount = document.getElementById('batteryCount').value;
            const price250 = document.getElementById('price250').value;
            const price500 = document.getElementById('price500').value;
            const price1000 = document.getElementById('price1000').value;
            let price5000 = document.getElementById('price5000').value;

            // If the price for 5,000 is not provided, display a dash (-) with the appropriate styling
            if (price5000.trim() === "") {
                price5000 = '<span class="price-na">-</span>';
            }

            // Get the selected file (image)
            const imageFileInput = document.getElementById('imageFile');
            const file = imageFileInput.files[0];

            // Ensure a file is selected
            if (!file) {
                alert("Please upload an image.");
                return;
            }

            // Use FileReader to read the file and display it
            const reader = new FileReader();
            reader.onload = function (event) {
                const imageUrl = event.target.result; // Data URL of the image

                // Create a new row in the table
                const tbody = document.getElementById('d-pdf').querySelector('tbody');
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
        `;

                tbody.appendChild(newRow);

                // Reset the form for a new entry
                document.getElementById('d-pdf').reset();
            };

            reader.readAsDataURL(file); // Read the file as a Data URL
        });