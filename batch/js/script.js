document.addEventListener('DOMContentLoaded', () => {
    // ==== Tab switching ====
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-tab');
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        tabContents.forEach(c => c.classList.remove('active'));
        document.getElementById(id).classList.add('active');
      });
    });

    // ===== Shared helpers =====
    const number = v => (isFinite(+v) ? +v : 0);
    const fmt0 = v => Math.round(v).toLocaleString();
    const fmt2 = v => (isFinite(v) ? (+v).toFixed(2) : '0.00');
    const density = 7850; // kg/m^3

    // Adjusted sheet/slit width (same rule you used before)
    function adjustedWidth(coilWidth) {
      if (coilWidth >= 1212 && coilWidth <= 1220) return 1220;
      return coilWidth + 10;
    }

    // ===== SLITTING =====
    const slitAddBtn = document.getElementById('add-slit');
    const slitCombContainer = document.getElementById('slit-combinations');
    const slitGenBtn = document.getElementById('slit-generate-coils');
    const slitCoilsContainer = document.getElementById('slit-coils-container');
    const slitCalcBtn = document.getElementById('calculate-slitting');
    const slitResetBtn = document.getElementById('reset-slitting');

    slitAddBtn.addEventListener('click', () => {
      const row = document.createElement('div');
      row.className = 'dynamic-row';
      row.innerHTML = `
        <div>
          <label>Slit Width (mm)</label>
          <input type="number" class="form-control slit-width" step="1" min="0" placeholder="e.g., 147">
        </div>
        <div>
          <label>Number of Slits</label>
          <input type="number" class="form-control slit-count" step="1" min="0" placeholder="e.g., 7">
        </div>
        <div>
          <button type="button" class="btn btn-danger remove-slit"><i class="fas fa-trash"></i> Remove</button>
        </div>
      `;
      row.querySelector('.remove-slit').addEventListener('click', () => row.remove());
      slitCombContainer.appendChild(row);
    });

    slitGenBtn.addEventListener('click', () => {
      const n = number(document.getElementById('slit-num-coils').value);
      slitCoilsContainer.innerHTML = '';
      if (n < 1) return;
      for (let i = 1; i <= n; i++) {
        const card = document.createElement('div');
        card.className = 'coil-card';
        card.innerHTML = `
          <h4>Coil ${i}</h4>
          <div class="coil-mini-grid">
            <div class="form-group">
              <label>Coil Number</label>
              <input type="text" class="form-control slit-coil-number" placeholder="e.g., G50${100 + i}">
            </div>
            <div class="form-group">
              <label>Coil Weight (kg)</label>
              <input type="number" class="form-control slit-coil-weight" step="0.01" min="0" placeholder="e.g., 10000">
            </div>
          </div>
        `;
        slitCoilsContainer.appendChild(card);
      }
    });

    slitCalcBtn.addEventListener('click', () => {
      const t = number(document.getElementById('slit-coil-thickness').value);
      const w = number(document.getElementById('slit-coil-width').value);
      const aw = adjustedWidth(w);
      if (!t || !w) { alert('Please enter common coil thickness and width.'); return; }

      // gather per-coil
      const coilCards = slitCoilsContainer.querySelectorAll('.coil-card');
      if (coilCards.length === 0) { alert('Generate at least one coil.'); return; }
      const coils = Array.from(coilCards).map(card => ({
        number: card.querySelector('.slit-coil-number')?.value?.trim() || '',
        weight: number(card.querySelector('.slit-coil-weight')?.value)
      })).filter(c => c.weight > 0);

      if (coils.length === 0) { alert('Please enter valid coil weights.'); return; }

      // slit combinations (shared)
      const slitRows = slitCombContainer.querySelectorAll('.dynamic-row');
      const slits = [];
      slitRows.forEach(r => {
        const sw = number(r.querySelector('.slit-width')?.value);
        const sc = number(r.querySelector('.slit-count')?.value);
        if (sw > 0 && sc > 0) slits.push({width: sw, count: sc});
      });
      if (slits.length === 0) { alert('Add at least one slit combination.'); return; }

      // compute per coil
      const perCoilRows = [];
      let totCoilW = 0, totSlitsW = 0, totScrapW = 0, totScrapWidth = 0;

      // aggregate per slit size across all coils
      const perSizeMap = new Map(); // key: slit width -> {pieces, weight}

      coils.forEach((c, idx) => {
        let coilSlitsWeight = 0;
        let totalSlitWidth = 0;

        // For detailed per-slit-size output
        const slitDetails = [];

        slits.forEach(s => {
          const weightPerSlit = (s.width * c.weight) / aw; // same as your earlier formula with +10 rule
          const totalWeightForSize = weightPerSlit * s.count;

          coilSlitsWeight += totalWeightForSize;
          totalSlitWidth += s.width * s.count;

          // Store for detailed output
          slitDetails.push({
            size: `${t} × ${s.width}`,
            weightPerSlit: weightPerSlit,
            totalWeight: totalWeightForSize,
            count: s.count
          });

          // aggregate per-size
          const key = s.width;
          const prev = perSizeMap.get(key) || {pieces: 0, weight: 0};
          perSizeMap.set(key, {
            pieces: prev.pieces + s.count,
            weight: prev.weight + totalWeightForSize
          });
        });

        const scrapWidth = Math.max(0, w - totalSlitWidth);
        const scrapWeight = Math.max(0, c.weight - coilSlitsWeight);

        totCoilW += c.weight;
        totSlitsW += coilSlitsWeight;
        totScrapW += scrapWeight;
        totScrapWidth += scrapWidth;

        perCoilRows.push({
          idx: idx + 1,
          number: c.number || `COIL-${idx + 1}`,
          coilWeight: c.weight,
          slitDetails,
          scrapWidth,
          scrapWeight,
          grandTotal: c.weight // slits + scrap = coil weight
        });
      });

      // fill summary header
      document.getElementById('result-slit-coil-size').textContent = `${t} × ${w}`;
      document.getElementById('result-slit-coil-count').textContent = String(coils.length);
      document.getElementById('result-slit-total-coil-weight').textContent = fmt0(totCoilW);

      // per-coil table - with detailed slit information
      const tb = document.querySelector('#slit-summary-table tbody');
      tb.innerHTML = '';
      perCoilRows.forEach(r => {
        // Add rows for each slit size in this coil
        r.slitDetails.forEach((slit, i) => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${i === 0 ? r.idx : ''}</td>
            <td>${i === 0 ? r.number : ''}</td>
            <td>${i === 0 ? fmt0(r.coilWeight) : ''}</td>
            <td>${slit.size}</td>
            <td>${fmt0(slit.weightPerSlit)}</td>
            <td>${fmt0(slit.totalWeight)}</td>
            <td>${i === 0 ? fmt0(r.scrapWidth) : ''}</td>
            <td>${i === 0 ? fmt0(r.scrapWeight) : ''}</td>
            <td>${i === 0 ? fmt0(r.grandTotal) : ''}</td>
          `;
          tb.appendChild(tr);
        });

        // If no slits, still show the coil with scrap
        if (r.slitDetails.length === 0) {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${r.idx}</td>
            <td>${r.number}</td>
            <td>${fmt0(r.coilWeight)}</td>
            <td>-</td>
            <td>0</td>
            <td>0</td>
            <td>${fmt0(r.scrapWidth)}</td>
            <td>${fmt0(r.scrapWeight)}</td>
            <td>${fmt0(r.grandTotal)}</td>
          `;
          tb.appendChild(tr);
        }
      });

      // totals
      document.getElementById('slit-total-coilweight').textContent = fmt0(totCoilW);
      document.getElementById('slit-total-slitsweight').textContent = fmt0(totSlitsW);
      document.getElementById('slit-total-scrapwidth').textContent = fmt0(totScrapWidth);
      document.getElementById('slit-total-scrapweight').textContent = fmt0(totScrapW);
      document.getElementById('slit-grand-total').textContent = fmt0(totCoilW);

      // per-size totals table
      const tbs = document.querySelector('#slit-per-size-table tbody');
      tbs.innerHTML = '';
      Array.from(perSizeMap.entries())
        .sort((a,b) => a[0]-b[0])
        .forEach(([size, agg]) => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${t} × ${size}</td>
            <td>${fmt0(agg.pieces)}</td>
            <td>${fmt0(agg.weight)}</td>
          `;
          tbs.appendChild(tr);
        });

      document.getElementById('slitting-results').style.display = 'block';
    });

    slitResetBtn.addEventListener('click', () => {
      document.getElementById('slit-coil-thickness').value = '';
      document.getElementById('slit-coil-width').value = '';
      document.getElementById('slit-num-coils').value = '';
      slitCoilsContainer.innerHTML = '';
      slitCombContainer.innerHTML = `
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
            <button class="btn btn-danger remove-slit" style="display:none;"><i class="fas fa-trash"></i> Remove</button>
          </div>
        </div>
      `;
      document.getElementById('slitting-results').style.display = 'none';
    });

    // ===== SHEARING =====
    const shearGenBtn = document.getElementById('shear-generate-coils');
    const shearCoilsContainer = document.getElementById('shear-coils-container');
    const shearCalcBtn = document.getElementById('calculate-shearing');
    const shearResetBtn = document.getElementById('reset-shearing');

    function mkSheetRow() {
      const row = document.createElement('div');
      row.className = 'dynamic-row';
      row.innerHTML = `
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
          <button type="button" class="btn btn-danger remove-sheet"><i class="fas fa-trash"></i> Remove</button>
        </div>
      `;
      row.querySelector('.remove-sheet').addEventListener('click', () => row.remove());
      return row;
    }

    shearGenBtn.addEventListener('click', () => {
      const n = number(document.getElementById('shear-num-coils').value);
      shearCoilsContainer.innerHTML = '';
      if (n < 1) return;
      for (let i = 1; i <= n; i++) {
        const card = document.createElement('div');
        card.className = 'coil-card';
        const cardId = `shear-coil-${i}`;
        card.innerHTML = `
          <h4>Coil ${i}</h4>
          <div class="coil-mini-grid">
            <div class="form-group">
              <label>Coil Number</label>
              <input type="text" class="form-control shear-coil-number" placeholder="e.g., G50${200 + i}">
            </div>
            <div class="form-group">
              <label>Coil Weight (kg)</label>
              <input type="number" class="form-control shear-coil-weight" step="0.01" min="0" placeholder="e.g., 10660">
            </div>
            <div class="form-group checkbox-group" style="grid-column: span 2;">
              <input type="checkbox" class="form-control shear-coil-completed" id="${cardId}-completed">
              <label for="${cardId}-completed">Coil Completed (Fully Sheared)</label>
            </div>
            <div class="form-group scrap-length-group" style="grid-column: span 2; display: none;">
              <label>Scrap Length (mm) <span class="table-note">(Required if fully sheared)</span></label>
              <input type="number" class="form-control shear-scrap-length" step="1" min="0" placeholder="e.g., 2180">
            </div>
          </div>
          <div class="form-group" style="margin-top:8px;">
            <label>Sheet Sizes for this Coil</label>
            <div class="table-note">Add one or more sheet lengths with prime and second pieces</div>
            <div class="sheet-rows"></div>
            <button type="button" class="btn btn-primary add-sheet-btn"><i class="fas fa-plus"></i> Add Sheet Size</button>
          </div>
        `;
        
        // Show/hide scrap length based on completed checkbox
        const completedCheckbox = card.querySelector('.shear-coil-completed');
        const scrapLengthGroup = card.querySelector('.scrap-length-group');
        completedCheckbox.addEventListener('change', () => {
          scrapLengthGroup.style.display = completedCheckbox.checked ? 'block' : 'none';
        });
        
        const sheetRows = card.querySelector('.sheet-rows');
        // start with one row
        sheetRows.appendChild(mkSheetRow());
        card.querySelector('.add-sheet-btn').addEventListener('click', () => {
          sheetRows.appendChild(mkSheetRow());
        });
        shearCoilsContainer.appendChild(card);
      }
    });

    shearCalcBtn.addEventListener('click', () => {
      const t = number(document.getElementById('shear-coil-thickness').value);
      const w = number(document.getElementById('shear-coil-width').value);
      if (!t || !w) { alert('Please enter common coil thickness and width.'); return; }
      const aw = adjustedWidth(w);

      // Calculate and display standard weight for 8ft sheet
      const standardWeight2440 = (t / 1000) * (aw / 1000) * (2440 / 1000) * density;
      document.getElementById('standard-weight-value').textContent = fmt2(standardWeight2440);

      const cards = shearCoilsContainer.querySelectorAll('.coil-card');
      if (cards.length === 0) { alert('Generate at least one coil.'); return; }

      // for per-size totals across coils
      const perLengthMap = new Map(); // key: length -> {pieces, weight}

      const perCoilRows = [];
      let totCoilW = 0, totSheetsW = 0, totScrapW = 0;

      cards.forEach((card, idx) => {
        const coilNumber = card.querySelector('.shear-coil-number')?.value?.trim() || `COIL-${idx+1}`;
        const coilWeight = number(card.querySelector('.shear-coil-weight')?.value);
        const completed = card.querySelector('.shear-coil-completed')?.checked;
        const scrapLength = number(card.querySelector('.shear-scrap-length')?.value);
        if (!(coilWeight > 0)) return;

        // Sheet sizes for this coil
        const rows = card.querySelectorAll('.sheet-rows .dynamic-row');
        const sizes = [];
        rows.forEach(r => {
          const L = number(r.querySelector('.sheet-length')?.value);
          const p = number(r.querySelector('.prime-pieces')?.value);
          const s = number(r.querySelector('.second-pieces')?.value);
          const pieces = (p||0) + (s||0);
          if (L > 0 && pieces > 0) sizes.push({length: L, prime: p||0, second: s||0, pieces});
        });
        if (sizes.length === 0) return;

        let scrapWeight = 0;
        let totalSheetsWeight = 0;

        // For detailed per-sheet output
        const sheetDetails = [];

        if (completed) {
          if (!(scrapLength > 0)) { alert(`Enter scrap length for fully sheared ${coilNumber}.`); return; }
          scrapWeight = (standardWeight2440 * scrapLength) / 2440;
          const usableWeight = coilWeight - scrapWeight;

          if (sizes.length === 1) {
            const sheet = sizes[0];
            const weightPerPiece = usableWeight / sheet.pieces;
            totalSheetsWeight = usableWeight;

            // Store for detailed output
            sheetDetails.push({
              size: `${sheet.length} × ${aw} × ${t}`,
              weightPerPiece,
              totalWeight: usableWeight,
              pieces: sheet.pieces
            });

            // aggregate per-length
            const prev = perLengthMap.get(sheet.length) || {pieces: 0, weight: 0};
            perLengthMap.set(sheet.length, {
              pieces: prev.pieces + sheet.pieces,
              weight: prev.weight + usableWeight
            });

          } else {
            // meterage proportional distribution
            let totalLenAllPieces = 0;
            sizes.forEach(s => totalLenAllPieces += s.length * s.pieces);
            const meterage = usableWeight / (totalLenAllPieces / 1000); // kg per meter

            let nonFirstWeight = 0;
            // compute weights for non-first
            for (let i = 1; i < sizes.length; i++) {
              const s = sizes[i];
              const weightPerPiece = meterage * (s.length / 1000);
              const totalWeight = weightPerPiece * s.pieces;
              nonFirstWeight += totalWeight;

              // Store for detailed output
              sheetDetails.push({
                size: `${s.length} × ${aw} × ${t}`,
                weightPerPiece,
                totalWeight,
                pieces: s.pieces
              });

              // aggregate
              const prev = perLengthMap.get(s.length) || {pieces: 0, weight: 0};
              perLengthMap.set(s.length, {
                pieces: prev.pieces + s.pieces,
                weight: prev.weight + totalWeight
              });
            }
            // first sheet absorbs remainder
            const first = sizes[0];
            const firstTotal = usableWeight - nonFirstWeight;
            const firstWeightPerPiece = firstTotal / first.pieces;

            // Store for detailed output
            sheetDetails.unshift({
              size: `${first.length} × ${aw} × ${t}`,
              weightPerPiece: firstWeightPerPiece,
              totalWeight: firstTotal,
              pieces: first.pieces
            });

            const prevFirst = perLengthMap.get(first.length) || {pieces: 0, weight: 0};
            perLengthMap.set(first.length, {
              pieces: prevFirst.pieces + first.pieces,
              weight: prevFirst.weight + firstTotal
            });

            totalSheetsWeight = usableWeight;
          }

        } else {
          // Partial: weight per piece proportional to length using stdWeight2440 baseline
          sizes.forEach(s => {
            const weightPerPiece = (standardWeight2440 * s.length) / 2440;
            const totalWeight = weightPerPiece * s.pieces;
            totalSheetsWeight += totalWeight;

            // Store for detailed output
            sheetDetails.push({
              size: `${s.length} × ${aw} × ${t}`,
              weightPerPiece,
              totalWeight,
              pieces: s.pieces
            });

            const prev = perLengthMap.get(s.length) || {pieces: 0, weight: 0};
            perLengthMap.set(s.length, {
              pieces: prev.pieces + s.pieces,
              weight: prev.weight + totalWeight
            });
          });
          scrapWeight = 0;
        }

        const grandTotal = totalSheetsWeight + scrapWeight;
        totCoilW += coilWeight;
        totSheetsW += totalSheetsWeight;
        totScrapW += scrapWeight;

        perCoilRows.push({
          idx: idx + 1,
          number: coilNumber,
          status: completed ? 'Fully Sheared' : 'Partially Sheared',
          coilWeight,
          sheetDetails,
          scrapWeight,
          grandTotal
        });
      });

      if (perCoilRows.length === 0) { alert('Please enter valid per-coil data.'); return; }

      // header
      document.getElementById('result-shear-coil-size').textContent = `${t} × ${w}`;
      document.getElementById('result-shear-coil-count').textContent = String(perCoilRows.length);
      document.getElementById('result-shear-total-coil-weight').textContent = fmt0(totCoilW);

      // per-coil table - with detailed sheet information
      const tb = document.querySelector('#shear-summary-table tbody');
      tb.innerHTML = '';
      perCoilRows.forEach(r => {
        // Add rows for each sheet size in this coil
        r.sheetDetails.forEach((sheet, i) => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${i === 0 ? r.idx : ''}</td>
            <td>${i === 0 ? r.number : ''}</td>
            <td>${i === 0 ? r.status : ''}</td>
            <td>${i === 0 ? fmt0(r.coilWeight) : ''}</td>
            <td>${sheet.size}</td>
            <td>${fmt2(sheet.weightPerPiece)}</td>
            <td>${fmt2(sheet.totalWeight)}</td>
            <td>${i === 0 ? fmt2(r.scrapWeight) : ''}</td>
            <td>${i === 0 ? fmt0(r.grandTotal) : ''}</td>
          `;
          tb.appendChild(tr);
        });

        // If no sheets, still show the coil with scrap
        if (r.sheetDetails.length === 0) {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${r.idx}</td>
            <td>${r.number}</td>
            <td>${r.status}</td>
            <td>${fmt0(r.coilWeight)}</td>
            <td>-</td>
            <td>0.00</td>
            <td>0.00</td>
            <td>${fmt2(r.scrapWeight)}</td>
            <td>${fmt0(r.grandTotal)}</td>
          `;
          tb.appendChild(tr);
        }
      });

      // totals
      document.getElementById('shear-total-coilweight').textContent = fmt0(totCoilW);
      document.getElementById('shear-total-sheetsweight').textContent = fmt2(totSheetsW);
      document.getElementById('shear-total-scrapweight').textContent = fmt2(totScrapW);
      document.getElementById('shear-grand-total').textContent = fmt0(totSheetsW + totScrapW);

      // per-length totals table
      const tbs = document.querySelector('#shear-per-size-table tbody');
      tbs.innerHTML = '';
      Array.from(perLengthMap.entries())
        .sort((a,b) => a[0]-b[0])
        .forEach(([len, agg]) => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${len}</td>
            <td>${fmt0(agg.pieces)}</td>
            <td>${fmt0(agg.weight)}</td>
          `;
          tbs.appendChild(tr);
        });

      document.getElementById('shearing-results').style.display = 'block';
    });

    shearResetBtn.addEventListener('click', () => {
      document.getElementById('shear-coil-thickness').value = '';
      document.getElementById('shear-coil-width').value = '';
      document.getElementById('shear-num-coils').value = '';
      shearCoilsContainer.innerHTML = '';
      document.getElementById('shearing-results').style.display = 'none';
    });

    // ===== Print (keep simple and robust using print media CSS) =====
    function printSection(sectionId) {
      const section = document.getElementById(sectionId);
      if (!section || section.style.display === 'none') {
        alert('Please calculate first before printing.');
        return;
      }
      window.print();
    }

    document.getElementById('print-slitting')?.addEventListener('click', () => printSection('slitting-results'));
    document.getElementById('print-shearing')?.addEventListener('click', () => printSection('shearing-results'));
  });