document.addEventListener('DOMContentLoaded', function() {
            // Tab functionality
            const tabButtons = document.querySelectorAll('.tab-button');
            const tabContents = document.querySelectorAll('.tab-content');
            
            tabButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const tabId = button.getAttribute('data-tab');
                    
                    // Update active tab button
                    tabButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                    
                    // Show active tab content
                    tabContents.forEach(content => content.classList.remove('active'));
                    document.getElementById(tabId).classList.add('active');
                });
            });
            
            // Slitting functionality
            const addSlitBtn = document.getElementById('add-slit');
            const slitContainer = document.getElementById('slit-combinations');
            const calculateSlittingBtn = document.getElementById('calculate-slitting');
            const resetSlittingBtn = document.getElementById('reset-slitting');
            
            // Add new slit row
            addSlitBtn.addEventListener('click', () => {
                const newRow = document.createElement('div');
                newRow.className = 'dynamic-row';
                newRow.innerHTML = `
                    <div>
                        <label>Slit Width (mm)</label>
                        <input type="number" class="form-control slit-width" step="1" min="0" placeholder="e.g., 147">
                    </div>
                    <div>
                        <label>Number of Slits</label>
                        <input type="number" class="form-control slit-count" step="1" min="0" placeholder="e.g., 7">
                    </div>
                    <div>
                        <button class="btn btn-danger remove-slit">
                            <i class="fas fa-trash"></i> Remove
                        </button>
                    </div>
                `;
                slitContainer.appendChild(newRow);
                
                // Add remove functionality
                newRow.querySelector('.remove-slit').addEventListener('click', () => {
                    slitContainer.removeChild(newRow);
                });
            });
            
            // Calculate slitting
            calculateSlittingBtn.addEventListener('click', () => {
                const coilThickness = parseFloat(document.getElementById('slit-coil-thickness').value);
                const coilWidth = parseFloat(document.getElementById('slit-coil-width').value);
                const coilWeight = parseFloat(document.getElementById('slit-coil-weight').value);
                const coilNumber = document.getElementById('slit-coil-number').value;
                
                // Validate inputs
                if (!coilThickness || !coilWidth || !coilWeight) {
                    alert('Please fill in all required coil details');
                    return;
                }
                
                // Get all slit combinations
                const slitRows = slitContainer.querySelectorAll('.dynamic-row');
                const slitCombinations = [];
                
                slitRows.forEach(row => {
                    const width = parseFloat(row.querySelector('.slit-width').value);
                    const count = parseInt(row.querySelector('.slit-count').value);
                    
                    if (width && count) {
                        slitCombinations.push({ width, count });
                    }
                });
                
                if (slitCombinations.length === 0) {
                    alert('Please add at least one valid slit combination');
                    return;
                }
                
                // Calculate results
                let totalSlitWidth = 0;
                let totalSlitWeight = 0;
                const slitDetails = [];
                
                slitCombinations.forEach(comb => {
                    const ribbonWeight = (comb.width * coilWeight) / (coilWidth + 10);
                    const totalWeight = ribbonWeight * comb.count;
                    
                    slitDetails.push({
                        width: comb.width,
                        count: comb.count,
                        weightPerSlit: Math.round(ribbonWeight), // Round to nearest whole number
                        totalWeight: Math.round(totalWeight) // Round to nearest whole number
                    });
                    
                    totalSlitWidth += comb.width * comb.count;
                    totalSlitWeight += totalWeight;
                });
                
                const scrapWidth = coilWidth - totalSlitWidth;
                const scrapWeight = coilWeight - totalSlitWeight;
                
                // Display results
                document.getElementById('result-slit-coil-size').textContent = `${coilThickness} × ${coilWidth}`;
                document.getElementById('result-slit-coil-weight').textContent = coilWeight.toFixed(2);
                document.getElementById('result-slit-coil-number').textContent = coilNumber;
                
                const slitTableBody = document.querySelector('#slit-details-table tbody');
                slitTableBody.innerHTML = '';
                
                slitDetails.forEach(detail => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${coilThickness} × ${detail.width}</td>
                        <td>${detail.count}</td>
                        <td>${detail.weightPerSlit.toLocaleString()}</td>
                        <td>${detail.totalWeight.toLocaleString()}</td>
                    `;
                    slitTableBody.appendChild(row);
                });
                
                document.getElementById('result-slit-scrap-width').textContent = scrapWidth.toFixed(2);
                document.getElementById('result-slit-scrap-weight').textContent = Math.round(scrapWeight).toLocaleString();
                document.getElementById('result-slit-total-weight').textContent = Math.round(totalSlitWeight).toLocaleString();
                document.getElementById('result-slit-total-scrap').textContent = Math.round(scrapWeight).toLocaleString();
                document.getElementById('result-slit-grand-total').textContent = coilWeight.toLocaleString();
                
                document.getElementById('slitting-results').style.display = 'block';
            });
            
            // Reset slitting
            resetSlittingBtn.addEventListener('click', () => {
                document.getElementById('slit-coil-thickness').value = '';
                document.getElementById('slit-coil-width').value = '';
                document.getElementById('slit-coil-weight').value = '';
                document.getElementById('slit-coil-number').value = '';
                
                slitContainer.innerHTML = `
                    <div class="dynamic-row">
                        <div>
                            <label>Slit Width (mm)</label>
                            <input type="number" class="form-control slit-width" step="1" min="0" placeholder="e.g., 147">
                        </div>
                        <div>
                            <label>Number of Slits</label>
                            <input type="number" class="form-control slit-count" step="1" min="0" placeholder="e.g., 7">
                        </div>
                        <div>
                            <button class="btn btn-danger remove-slit" style="display: none;">
                                <i class="fas fa-trash"></i> Remove
                            </button>
                        </div>
                    </div>
                `;
                
                document.getElementById('slitting-results').style.display = 'none';
            });
            
            // Shearing functionality
            const coilCompletedCheckbox = document.getElementById('shear-coil-completed');
            const scrapDetailsSection = document.getElementById('scrap-details');
            const addSheetBtn = document.getElementById('add-sheet');
            const sheetContainer = document.getElementById('sheet-sizes');
            const calculateShearingBtn = document.getElementById('calculate-shearing');
            const resetShearingBtn = document.getElementById('reset-shearing');
            
            // Toggle scrap details based on coil completion
            coilCompletedCheckbox.addEventListener('change', () => {
                if (coilCompletedCheckbox.checked) {
                    scrapDetailsSection.style.display = 'block';
                } else {
                    scrapDetailsSection.style.display = 'none';
                }
            });
            
            // Add new sheet row
            addSheetBtn.addEventListener('click', () => {
                const newRow = document.createElement('div');
                newRow.className = 'dynamic-row';
                newRow.innerHTML = `
                    <div>
                        <label>Sheet Length (mm)</label>
                        <input type="number" class="form-control sheet-length" step="1" min="0" placeholder="e.g., 2440">
                    </div>
                    <div>
                        <label>Prime Pieces</label>
                        <input type="number" class="form-control prime-pieces" step="1" min="0" placeholder="e.g., 10">
                    </div>
                    <div>
                        <label>2nd Quality Pieces</label>
                        <input type="number" class="form-control second-pieces" step="1" min="0" value="0" placeholder="e.g., 2">
                    </div>
                    <div>
                        <button class="btn btn-danger remove-sheet">
                            <i class="fas fa-trash"></i> Remove
                        </button>
                    </div>
                `;
                sheetContainer.appendChild(newRow);
                
                // Add remove functionality
                newRow.querySelector('.remove-sheet').addEventListener('click', () => {
                    sheetContainer.removeChild(newRow);
                });
            });
            
            // Calculate shearing
            calculateShearingBtn.addEventListener('click', () => {
                const coilThickness = parseFloat(document.getElementById('shear-coil-thickness').value);
                const coilWidth = parseFloat(document.getElementById('shear-coil-width').value);
                const coilWeight = parseFloat(document.getElementById('shear-coil-weight').value);
                const coilNumber = document.getElementById('shear-coil-number').value;
                const coilCompleted = document.getElementById('shear-coil-completed').checked;
                const scrapLength = parseFloat(document.getElementById('scrap-length').value) || 0;
                
                // Validate inputs
                if (!coilThickness || !coilWidth || !coilWeight) {
                    alert('Please fill in all required coil details');
                    return;
                }
                
                if (coilCompleted && !scrapLength) {
                    alert('Please enter scrap length for completed coils');
                    return;
                }
                
                // Calculate adjusted sheet width
                let sheetWidth;
                if (coilWidth >= 1212 && coilWidth <= 1219) {
                    sheetWidth = 1220;
                } else {
                    sheetWidth = coilWidth + 10;
                }
                
                // Get all sheet sizes
                const sheetRows = sheetContainer.querySelectorAll('.dynamic-row');
                const sheetSizes = [];
                
                sheetRows.forEach(row => {
                    const length = parseFloat(row.querySelector('.sheet-length').value);
                    const primePieces = parseInt(row.querySelector('.prime-pieces').value);
                    const secondPieces = parseInt(row.querySelector('.second-pieces').value) || 0;
                    
                    if (length && (primePieces || secondPieces)) {
                        sheetSizes.push({
                            length,
                            primePieces: primePieces || 0,
                            secondPieces: secondPieces || 0,
                            totalPieces: (primePieces || 0) + (secondPieces || 0)
                        });
                    }
                });
                
                if (sheetSizes.length === 0) {
                    alert('Please add at least one valid sheet size');
                    return;
                }
                
                // Calculate standard weight for 8ft sheet (2440mm)
                const standardWeight = (coilThickness / 1000) * (sheetWidth / 1000) * (2440 / 1000) * 7850;
                
                let scrapWeight = 0;
                let totalSheetsWeight = 0;
                const sheetDetails = [];
                
                if (coilCompleted) {
                    // Calculate scrap weight
                    scrapWeight = (standardWeight * scrapLength) / 2440;
                    totalSheetsWeight = coilWeight - scrapWeight;
                    
                    if (sheetSizes.length === 1) {
                        // Single sheet size, fully sheared
                        const sheet = sheetSizes[0];
                        const weightPerPiece = (coilWeight - scrapWeight) / (sheet.primePieces + sheet.secondPieces);
                        
                        sheetDetails.push({
                            size: `${sheet.length} × ${sheetWidth} × ${coilThickness}`,
                            weightPerPiece: weightPerPiece,
                            primePieces: sheet.primePieces,
                            secondPieces: sheet.secondPieces,
                            totalWeight: weightPerPiece * (sheet.primePieces + sheet.secondPieces)
                        });
                    } else {
                        // Multiple sheet sizes, fully sheared
                        let totalSheetsLength = 0;
                        
                        sheetSizes.forEach(sheet => {
                            totalSheetsLength += sheet.length * (sheet.primePieces + sheet.secondPieces);
                        });
                        
                        const meterage = totalSheetsWeight / (totalSheetsLength / 1000);
                        
                        // Calculate weights for non-first sheets
                        let nonFirstTotalWeight = 0;
                        
                        for (let i = 1; i < sheetSizes.length; i++) {
                            const sheet = sheetSizes[i];
                            const weightPerPiece = meterage * (sheet.length / 1000);
                            const totalWeight = weightPerPiece * (sheet.primePieces + sheet.secondPieces);
                            
                            sheetDetails.push({
                                size: `${sheet.length} × ${sheetWidth} × ${coilThickness}`,
                                weightPerPiece: weightPerPiece,
                                primePieces: sheet.primePieces,
                                secondPieces: sheet.secondPieces,
                                totalWeight: totalWeight
                            });
                            
                            nonFirstTotalWeight += totalWeight;
                        }
                        
                        // Calculate weight for first sheet
                        const firstSheet = sheetSizes[0];
                        const firstTotalWeight = totalSheetsWeight - nonFirstTotalWeight;
                        const firstWeightPerPiece = firstTotalWeight / (firstSheet.primePieces + firstSheet.secondPieces);
                        
                        // Add first sheet to beginning of details
                        sheetDetails.unshift({
                            size: `${firstSheet.length} × ${sheetWidth} × ${coilThickness}`,
                            weightPerPiece: firstWeightPerPiece,
                            primePieces: firstSheet.primePieces,
                            secondPieces: firstSheet.secondPieces,
                            totalWeight: firstTotalWeight
                        });
                    }
                } else {
                    // Partially sheared coil
                    sheetSizes.forEach(sheet => {
                        const weightPerPiece = (standardWeight * sheet.length) / 2440;
                        const totalWeight = weightPerPiece * (sheet.primePieces + sheet.secondPieces);
                        
                        sheetDetails.push({
                            size: `${sheet.length} × ${sheetWidth} × ${coilThickness}`,
                            weightPerPiece: weightPerPiece,
                            primePieces: sheet.primePieces,
                            secondPieces: sheet.secondPieces,
                            totalWeight: totalWeight
                        });
                        
                        totalSheetsWeight += totalWeight;
                    });
                    
                    scrapWeight = 0; // No scrap for partial shearing
                }
                
                // Calculate grand total
                const grandTotal = totalSheetsWeight + scrapWeight;
                
                // Display results
                document.getElementById('result-shear-coil-size').textContent = `${coilThickness} × ${coilWidth}`;
                document.getElementById('result-shear-coil-weight').textContent = coilWeight.toFixed(2);
                document.getElementById('result-shear-coil-number').textContent = coilNumber;
                document.getElementById('result-shear-status').textContent = coilCompleted ? 'Fully Sheared' : 'Partially Sheared';
                
                const sheetTableBody = document.querySelector('#sheet-details-table tbody');
                sheetTableBody.innerHTML = '';
                
                sheetDetails.forEach(detail => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${detail.size}</td>
                        <td>${detail.weightPerPiece.toFixed(2)}</td>
                        <td>${detail.primePieces}</td>
                        <td>${detail.secondPieces}</td>
                        <td>${detail.totalWeight.toFixed(2)}</td>
                    `;
                    sheetTableBody.appendChild(row);
                });
                
                document.getElementById('result-shear-scrap-length').textContent = scrapLength.toFixed(2);
                document.getElementById('result-shear-scrap-weight').textContent = scrapWeight.toFixed(2);
                document.getElementById('result-shear-total-weight').textContent = totalSheetsWeight.toFixed(2);
                document.getElementById('result-shear-total-scrap').textContent = scrapWeight.toFixed(2);
                document.getElementById('result-shear-grand-total').textContent = grandTotal.toFixed(2);
                
                document.getElementById('shearing-results').style.display = 'block';
            });
            
            // Reset shearing
            resetShearingBtn.addEventListener('click', () => {
                document.getElementById('shear-coil-thickness').value = '';
                document.getElementById('shear-coil-width').value = '';
                document.getElementById('shear-coil-weight').value = '';
                document.getElementById('shear-coil-number').value = '';
                document.getElementById('shear-coil-completed').checked = false;
                document.getElementById('scrap-length').value = '';
                scrapDetailsSection.style.display = 'none';
                
                sheetContainer.innerHTML = `
                    <div class="dynamic-row">
                        <div>
                            <label>Sheet Length (mm)</label>
                            <input type="number" class="form-control sheet-length" step="1" min="0" placeholder="e.g., 2440">
                        </div>
                        <div>
                            <label>Prime Pieces</label>
                            <input type="number" class="form-control prime-pieces" step="1" min="0" placeholder="e.g., 10">
                        </div>
                        <div>
                            <label>2nd Quality Pieces</label>
                            <input type="number" class="form-control second-pieces" step="1" min="0" value="0" placeholder="e.g., 2">
                        </div>
                        <div>
                            <button class="btn btn-danger remove-sheet" style="display: none;">
                                <i class="fas fa-trash"></i> Remove
                            </button>
                        </div>
                    </div>
                `;
                
                document.getElementById('shearing-results').style.display = 'none';
            });
            
            // Example data for demonstration
            // document.getElementById('slit-coil-thickness').value = 3.0;
            // document.getElementById('slit-coil-width').value = 1040;
            // document.getElementById('slit-coil-weight').value = 10000;
            // document.getElementById('slit-coil-number').value = 'COIL-12345';
            
            // document.getElementById('shear-coil-thickness').value = 1.0;
            // document.getElementById('shear-coil-width').value = 1215;
            // document.getElementById('shear-coil-weight').value = 2901;
            // document.getElementById('shear-coil-number').value = 'COIL-67890';
        });

// === Export / Print / Save Add-ons ===
function openPrintWindowFromSection(sectionId, title) {
    const section = document.getElementById(sectionId);
    if (!section || section.style.display === 'none') {
        alert('Please calculate first to generate results.');
        return;
    }
    const win = window.open('', '_blank');
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
    <link rel="stylesheet" href="styles.css"></head><body>
    ${section.outerHTML}
    <script>window.onload=function(){window.print();}</script>
    </body></html>`;
    win.document.open();
    win.document.write(html);
    win.document.close();
}

function tablesInSectionToCSV(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section || section.style.display === 'none') return null;
    const tables = section.querySelectorAll('table');
    let csv = [];
    tables.forEach((tbl, idx) => {
        const rows = tbl.querySelectorAll('tr');
        rows.forEach(tr => {
            const cells = tr.querySelectorAll('th,td');
            const line = Array.from(cells).map(td => td.textContent.trim()).join(',');
            csv.push(line);
        });
        csv.push('');
    });
    return csv.join('\n');
}

function downloadBlob(content, mime, filename) {
    const blob = new Blob([content], {type: mime});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

function bindExportPrintSave() {
    document.getElementById('export-pdf-slitting')?.addEventListener('click', () => openPrintWindowFromSection('slitting-results', 'Slitting Report'));
    document.getElementById('export-excel-slitting')?.addEventListener('click', () => {
        const csv = tablesInSectionToCSV('slitting-results');
        if (csv) downloadBlob(csv, 'application/vnd.ms-excel', `slitting_${Date.now()}.csv`);
    });
    document.getElementById('print-slitting')?.addEventListener('click', () => openPrintWindowFromSection('slitting-results', 'Slitting Report'));

    document.getElementById('export-pdf-shearing')?.addEventListener('click', () => openPrintWindowFromSection('shearing-results', 'Shearing Report'));
    document.getElementById('export-excel-shearing')?.addEventListener('click', () => {
        const csv = tablesInSectionToCSV('shearing-results');
        if (csv) downloadBlob(csv, 'application/vnd.ms-excel', `shearing_${Date.now()}.csv`);
    });
    document.getElementById('print-shearing')?.addEventListener('click', () => openPrintWindowFromSection('shearing-results', 'Shearing Report'));

    document.getElementById('save-slitting')?.addEventListener('click', () => {
        const data = document.getElementById('slitting-results').innerText;
        downloadBlob(data, 'application/json', `slitting_${Date.now()}.json`);
    });
    document.getElementById('save-shearing')?.addEventListener('click', () => {
        const data = document.getElementById('shearing-results').innerText;
        downloadBlob(data, 'application/json', `shearing_${Date.now()}.json`);
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindExportPrintSave);
} else {
    bindExportPrintSave();
}
