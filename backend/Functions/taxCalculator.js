const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

const loadUserCSV = (username, fileName) => {
  const filePath = path.join(__dirname, '..', 'user_data_files', username, fileName);
  const csvData = fs.readFileSync(filePath, 'utf8');
  return Papa.parse(csvData, { header: true, skipEmptyLines: true }).data;
};


// FIFO Logic
function applyFIFO(portfolio) {
  for (let i = 0; i < portfolio.length; i++) {
    const row = portfolio[i];
    if (parseFloat(row.amount) < 0) {
      let tempQty = Math.abs(parseFloat(row.units));
      let matches = portfolio.filter(p =>
        p.folio === row.folio &&
        p.isin === row.isin &&
        parseFloat(p.amount) > 0 &&
        parseFloat(p.outstanding_quantity) > 0 &&
        new Date(p.transaction_date) <= new Date(row.transaction_date)
      ).sort((a, b) => new Date(a.transaction_date) - new Date(b.transaction_date));

      for (let match of matches) {
        const availQty = parseFloat(match.outstanding_quantity);
        if (tempQty <= 0) break;

        const usedQty = Math.min(availQty, tempQty);
        match.outstanding_quantity -= usedQty;

        row.purchase_date = match.transaction_date;
        row.purchase_nav = match.nav;
        row.outstanding_quantity = usedQty;
        tempQty -= usedQty;
      }
    }
  }
  return portfolio;
}

// Enrich Portfolio
function enrichPortfolio(portfolio, username) {
  const latestNAV = loadUserCSV(username, 'latest-nav.csv');
  const nav2018 = loadUserCSV(username, 'nav31jan2018.csv');
  const taxType = loadUserCSV(username, 'tax-type-fy202425.csv');
  const ciiData = loadUserCSV(username, 'CII.csv');
  const budget = loadUserCSV(username, 'budget.csv');
  const exceptions = loadUserCSV(username, 'tax-exceptions.csv');

  for (let row of portfolio) {
    const matchNAV = latestNAV.find(n => n.ISINDivPayoutISINGrowth === row.isin);
    if (matchNAV) {
      row.NetAssetValue = matchNAV.NetAssetValue;
      row.Category = matchNAV.Category;
      row.SchemeCode = matchNAV.SchemeCode;
    }

    const matchNav2018 = nav2018.find(n => n.ticker === row.SchemeCode);
    row.nav2018 = matchNav2018 ? parseFloat(matchNav2018.nav2018 || 0) : 0;

    const exception = exceptions.find(e => e.ticker === row.SchemeCode);
    row['sub-category'] = exception ? exception['sub-category'] : 'no-subcategory';

    const tax = taxType.find(t =>
      t.category === row.Category && t['sub-category'] === row['sub-category']
    );

    if (tax) {
      row.ltcg_rate = tax.ltcg_rate === 'slab' ? 'slab' : parseFloat(tax.ltcg_rate);
      row.stcg_rate = tax.stcg_rate === 'slab' ? 'slab' : parseFloat(tax.stcg_rate);
      row.exemption = parseFloat(tax.exemption || 0);
      row.stcg_date = parseInt(tax.stcg_date || 365);
      row.ltcg_indexation = tax.ltcg_indexation || 'no';
      row.equity_gf_31jan2018 = tax.equity_gf_31jan2018 || 'no';
    }
  }

  return { portfolio, ciiData, budget };
}


function getCII(ciiData, date) {
  const fy = date.getMonth() >= 3 ? `${date.getFullYear()}-${String(date.getFullYear() + 1).slice(2)}` : `${date.getFullYear() - 1}-${String(date.getFullYear()).slice(2)}`;
  const match = ciiData.find(c => c['Financial Year'] === fy);
  return match ? parseFloat(match.CII) : null;
}

function calculateTax(portfolio, ciiData, budget, financialYear, taxSlab) {
  const fyStart = new Date(financialYear === 'FY-2024-25' ? '2024-04-01' : '2023-04-01');
  const fyEnd = new Date(financialYear === 'FY-2024-25' ? '2025-03-31' : '2024-03-31');

  for (let row of portfolio) {
    row.STCG = 0;
    row.LTCG = 0;
    const txnDate = new Date(row.transaction_date);
    const purDate = new Date(row.purchase_date);

    if (parseFloat(row.amount) < 0 && row.purchase_date) {
      const daysHeld = Math.floor((txnDate - purDate) / (1000 * 60 * 60 * 24));
      const units = parseFloat(row.outstanding_quantity || 0);
      const nav = parseFloat(row.nav || 0);
      const purNav = parseFloat(row.purchase_nav || 0);
      const nav2018 = parseFloat(row.nav2018 || 0);

      if (daysHeld <= row.stcg_date) {
        row.STCG = (nav - purNav) * units;
      } else {
        if (row.equity_gf_31jan2018 === 'yes') {
          if (txnDate > new Date('2018-01-31')) {
            const minVal = Math.min(nav2018, purNav);
            const maxVal = Math.max(nav2018, purNav);
            row.LTCG = (nav <= minVal ? nav - minVal : nav - maxVal) * units;
          } else {
            row.LTCG = (nav - purNav) * units;
          }
        } else if (row.ltcg_indexation === 'yes' && purDate < new Date('2023-04-01')) {
          const ciiPur = getCII(ciiData, purDate);
          const ciiSale = getCII(ciiData, txnDate);
          if (ciiPur && ciiSale) {
            const indexedPur = purNav * (ciiSale / ciiPur);
            row.LTCG = (nav - indexedPur) * units;
          } else {
            row.LTCG = (nav - purNav) * units;
          }
        } else {
          row.LTCG = (nav - purNav) * units;
        }
      }
    }
  }

  const fyTxns = portfolio.filter(txn => {
    const d = new Date(txn.transaction_date);
    return d >= fyStart && d <= fyEnd;
  });

  let ltcgDetails = [], stcgDetails = [];
  let totalLtcgTax = 0, totalStcgTax = 0;

  const ltcgGroups = {};
  const stcgGroups = {};

  fyTxns.forEach(row => {
    const rate = row.ltcg_rate;
    const exemption = row.exemption;
    const key = `${rate}_${exemption}`;
    ltcgGroups[key] = (ltcgGroups[key] || 0) + parseFloat(row.LTCG || 0);
  });

  for (let key in ltcgGroups) {
    const [rate, exemption] = key.split('_').map(Number);
    const gain = ltcgGroups[key];
    const taxable = Math.max(0, gain - exemption);
    const tax = taxable * rate;
    totalLtcgTax += tax;
    ltcgDetails.push({ rate, exemption, gain, tax });
  }

  fyTxns.forEach(row => {
    const rate = row.stcg_rate;
    const key = `${rate}`;
    stcgGroups[key] = (stcgGroups[key] || 0) + parseFloat(row.STCG || 0);
  });

  for (let key in stcgGroups) {
    const gain = stcgGroups[key];
    const rate = key === 'slab' ? taxSlab : parseFloat(key);
    const tax = gain * rate;
    totalStcgTax += tax;
    stcgDetails.push({ rate, gain, tax });
  }

  return { portfolio, ltcgDetails, totalLtcgTax, stcgDetails, totalStcgTax };
}

module.exports = {
  applyFIFO,
  enrichPortfolio,
  calculateTax
};
