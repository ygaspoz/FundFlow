document.addEventListener('DOMContentLoaded', function() {
    const taxForm = document.getElementById('taxForm');
    const resultsSection = document.getElementById('results');
    const detailedResults = document.getElementById('detailedResults');
    const resetBtn = document.getElementById('resetBtn');
    
    // Sample data - in a real app this would come from a backend
    const taxDistributions = {
        // Default distribution percentages
        default: {
            education: 25,
            healthcare: 20,
            transportation: 15,
            socialSecurity: 22,
            defense: 8,
            other: 10
        },
        // Canton-specific distributions could be added here
    };
    
    // Detailed breakdown (sample data)
    const detailedBreakdowns = {
        education: [
            { name: "Primary Schools", percentage: 10 },
            { name: "Secondary Education", percentage: 8 },
            { name: "Universities", percentage: 5 },
            { name: "Research", percentage: 2 }
        ],
        healthcare: [
            { name: "Hospitals", percentage: 12 },
            { name: "Preventive Care", percentage: 3 },
            { name: "Medical Research", percentage: 5 }
        ],
        transportation: [
            { name: "Public Transport", percentage: 8 },
            { name: "Road Infrastructure", percentage: 5 },
            { name: "Railway Maintenance", percentage: 2 }
        ],
        socialSecurity: [
            { name: "Retirement Benefits", percentage: 12 },
            { name: "Disability Support", percentage: 6 },
            { name: "Family Benefits", percentage: 4 }
        ],
        defense: [
            { name: "Military Personnel", percentage: 4 },
            { name: "Equipment", percentage: 3 },
            { name: "Training", percentage: 1 }
        ],
        other: [
            { name: "Administration", percentage: 4 },
            { name: "Culture & Sports", percentage: 3 },
            { name: "International Affairs", percentage: 3 }
        ]
    };

    // Handle form submission
    taxForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const taxAmount = parseFloat(document.getElementById('taxAmount').value);
        const canton = document.getElementById('canton').value;
        const showDetailed = document.getElementById('detailedView').checked;
        
        // Display results
        document.getElementById('totalTaxValue').textContent = `CHF ${taxAmount.toLocaleString()}`;
        document.getElementById('cantonName').textContent = document.getElementById('canton').options[document.getElementById('canton').selectedIndex].text;
        
        // Calculate distribution
        const distribution = taxDistributions.default; // In a real app, you might use canton-specific distributions
        
        // Update distribution bars and amounts
        const distributionItems = document.querySelectorAll('.distribution-item');
        const categories = ['education', 'healthcare', 'transportation', 'socialSecurity', 'defense', 'other'];
        
        distributionItems.forEach((item, index) => {
            const category = categories[index];
            const percentage = distribution[category];
            const amount = (taxAmount * percentage / 100).toFixed(2);
            
            item.querySelector('.progress').style.width = `${percentage}%`;
            item.querySelector('.amount').textContent = `CHF ${parseFloat(amount).toLocaleString()}`;
        });
        
        // Show/hide detailed breakdown
        if (showDetailed) {
            populateDetailedView(taxAmount, distribution);
            detailedResults.style.display = 'block';
        } else {
            detailedResults.style.display = 'none';
        }
        
        // Show results section
        resultsSection.style.display = 'block';
        
        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    });
    
    function populateDetailedView(taxAmount, distribution) {
        const detailTable = document.getElementById('detailTable');
        detailTable.innerHTML = '';
        
        const categories = ['education', 'healthcare', 'transportation', 'socialSecurity', 'defense', 'other'];
        const categoryNames = ['Education', 'Healthcare', 'Transportation', 'Social Security', 'Defense', 'Other'];
        
        categories.forEach((category, idx) => {
            const categoryName = categoryNames[idx];
            const categoryPercentage = distribution[category];
            
            detailedBreakdowns[category].forEach((item, index) => {
                const row = document.createElement('tr');
                
                if (index === 0) {
                    row.innerHTML = `
                        <td rowspan="${detailedBreakdowns[category].length}">${categoryName}</td>
                        <td>${item.name}</td>
                        <td>CHF ${((taxAmount * item.percentage) / 100).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                        <td>${item.percentage}%</td>
                    `;
                } else {
                    row.innerHTML = `
                        <td>${item.name}</td>
                        <td>CHF ${((taxAmount * item.percentage) / 100).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                        <td>${item.percentage}%</td>
                    `;
                }
                
                detailTable.appendChild(row);
            });
        });
    }
    
    // Reset button handler
    resetBtn.addEventListener('click', function() {
        resultsSection.style.display = 'none';
        taxForm.reset();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});
