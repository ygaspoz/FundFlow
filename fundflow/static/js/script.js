document.addEventListener('DOMContentLoaded', function() {
    const taxForm = document.getElementById('taxForm');
    const resultsSection = document.getElementById('results');
    const detailedResults = document.getElementById('detailedResults');
    const resetBtn = document.getElementById('resetBtn');
    const distributionContainer = document.getElementById('distribution-container');

    // Handle form submission
    taxForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Get form values
        const taxAmount = parseFloat(document.getElementById('taxAmount').value);
        const cantonId = document.getElementById('canton').value;
        const showDetailed = document.getElementById('detailedView').checked;

        // Fetch canton-specific distribution data from the server
        fetch(`/api/canton/${cantonId}/`, {
            method: 'GET',
            headers: {
                'X-CSRFToken': csrfToken,
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Display results
                document.getElementById('totalTaxValue').textContent = `CHF ${taxAmount.toLocaleString()}`;
                document.getElementById('cantonName').textContent = document.getElementById('canton').options[document.getElementById('canton').selectedIndex].text;

                // Process the distribution data
                processDistributionData(taxAmount, data.data, showDetailed);

                // Show results section
                resultsSection.style.display = 'block';

                // Scroll to results
                resultsSection.scrollIntoView({ behavior: 'smooth' });
            } else {
                alert('Error: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('There was an error processing your request. Please try again.');
        });
    });

    function processDistributionData(taxAmount, distributionData, showDetailed) {
        // Clear existing distribution items
        distributionContainer.innerHTML = '';

        // Sort accounts by their percentage (descending)
        const sortedAccounts = Object.entries(distributionData).sort((a, b) => {
            return b[1].percentage - a[1].percentage;
        });

        // Create distribution items
        sortedAccounts.forEach(([accountNumber, accountData]) => {
            const percentage = accountData.percentage;
            const amount = (taxAmount * percentage / 100).toFixed(2);

            const distributionItem = document.createElement('div');
            distributionItem.className = 'distribution-item';
            distributionItem.innerHTML = `
                <div class="category-name">${accountData.name}</div>
                <div class="progress-bar">
                    <div class="progress" style="width: ${percentage}%"></div>
                </div>
                <div class="amount">CHF ${parseFloat(amount).toLocaleString()}</div>
            `;

            distributionContainer.appendChild(distributionItem);
        });

        // Show/hide detailed breakdown
        if (showDetailed) {
            populateDetailedView(taxAmount, distributionData);
            detailedResults.style.display = 'block';
        } else {
            detailedResults.style.display = 'none';
        }
    }

    function populateDetailedView(taxAmount, distributionData) {
        const detailTable = document.getElementById('detailTable');
        detailTable.innerHTML = '';

        // Sort accounts by their percentage (descending)
        const sortedAccounts = Object.entries(distributionData).sort((a, b) => {
            return b[1].percentage - a[1].percentage;
        });

        sortedAccounts.forEach(([accountNumber, accountData]) => {
            const row = document.createElement('tr');
            const amount = (taxAmount * accountData.percentage / 100).toFixed(2);

            row.innerHTML = `
                <td>${accountData.name}</td>
                <td>CHF ${parseFloat(amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                <td>${accountData.percentage}%</td>
            `;

            detailTable.appendChild(row);
        });
    }

    // Reset button handler
    resetBtn.addEventListener('click', function() {
        resultsSection.style.display = 'none';
        taxForm.reset();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});
