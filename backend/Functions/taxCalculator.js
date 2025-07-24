const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

// Optionally load CII from file
function loadLocalCSV(filename) {
    const filePath = path.join(__dirname, 'data', filename);
    try {
        const file = fs.readFileSync(filePath, 'utf8');
        const parsedData = Papa.parse(file, { header: true, skipEmptyLines: true }).data;
        return parsedData;
    } catch (error) {
        return [];
    }
}

function getCiiValue(ciiData, date) {
    if (!ciiData || ciiData.length === 0) {
        return null;
    }
    const year = date.getMonth() >= 3 ? date.getFullYear() : date.getFullYear() - 1;
    const fy = `${year}-${(year + 1).toString().slice(-2)}`;
    const row = ciiData.find(r => r['Financial Year'] === fy);
    return row ? parseFloat(row['CII']) : null;
}

// Stub for enrichment (in real app, you’ll enhance data here)
function enrichPortfolioData(portfolio, taxSlab, financialYear) {
    return portfolio;
}

function calculateCapitalGains(portfolio, financialYear, taxSlab) {
    // Use hardcoded dummy CII data for indexation testing
    const cii = [
        { 'Financial Year': '2020-21', CII: '301' },
        { 'Financial Year': '2021-22', CII: '317' },
        { 'Financial Year': '2022-23', CII: '331' },
        { 'Financial Year': '2023-24', CII: '348' },
        { 'Financial Year': '2024-25', CII: '360' },
    ];

    const fyStart = financialYear === 'FY-2024-25' ? new Date('2024-04-01') : new Date('2023-04-01');
    const fyEnd = financialYear === 'FY-2024-25' ? new Date('2025-03-31') : new Date('2024-03-31');

    let totalLTCGTax = 0;
    let totalSTCGTax = 0;
    const ltcgDetails = [];
    const stcgDetails = [];

    portfolio.forEach(row => {
        const txDate = new Date(row.transaction_date);
        const purchaseDate = new Date(row.purchase_date);

        if (isNaN(txDate.getTime()) || isNaN(purchaseDate.getTime())) {
            return;
        }

        const daysHeld = (txDate - purchaseDate) / (1000 * 60 * 60 * 24);
        const units = parseFloat(row.outstanding_quantity || 0);
        const nav = parseFloat(row.nav);
        const purchaseNav = parseFloat(row.purchase_nav);
        const amount = parseFloat(row.amount || 0);

        if (amount < 0 && !isNaN(nav) && !isNaN(purchaseNav) && !isNaN(units) && units > 0) {
            let gain = 0;
            let finalGainType = '';

            const applicableSTCGDate = row.stcg_date || 365;

            if (daysHeld <= applicableSTCGDate) {
                gain = (nav - purchaseNav) * units;
                finalGainType = 'STCG';
            } else {
                const gf = (row.equity_gf_31jan2018 || '').toLowerCase();
                const indexation = (row.ltcg_indexation || '').toLowerCase();
                let indexedPurchase = purchaseNav;
                finalGainType = 'LTCG';

                if (gf === 'yes' && row.assetType === 'equity' && purchaseDate < new Date('2018-02-01') && !isNaN(row.nav2018)) {
                    const nav2018 = parseFloat(row.nav2018);
                    const refPrice = Math.max(nav2018, purchaseNav);
                    gain = (nav - refPrice) * units;
                } else if (indexation === 'yes' && (row.assetType === 'debt' || row.assetType === 'mutual_fund_debt')) {
                    const ciiPurchase = getCiiValue(cii, purchaseDate);
                    const ciiSale = getCiiValue(cii, txDate);

                    if (ciiPurchase && ciiSale && ciiPurchase > 0) {
                        indexedPurchase = purchaseNav * (ciiSale / ciiPurchase);
                    }
                    gain = (nav - indexedPurchase) * units;
                } else {
                    gain = (nav - purchaseNav) * units;
                }
            }

            if (gain > 0) {
                let applicableRate = 0;
                let applicableExemptionForCalculation = 0; // Exemption value used for calculation (e.g., 100000 or 0)
                let taxableAmount = gain;

                if (finalGainType === 'STCG') {
                    if (row.assetType === 'equity') {
                        applicableRate = taxSlab.shortTermEquityRate;
                    } else {
                        applicableRate = taxSlab.shortTermOtherRate;
                    }
                    taxableAmount = gain; // No general exemption for STCG
                    
                    stcgDetails.push({
                        assetName: row.assetName,
                        gainType: 'STCG',
                        gainAmount: gain,
                        taxRateApplied: applicableRate,
                        taxAmount: taxableAmount * applicableRate
                    });

                } else if (finalGainType === 'LTCG') {
                    if (row.assetType === 'equity') {
                        applicableRate = taxSlab.longTermEquityRate;
                        applicableExemptionForCalculation = taxSlab.ltcgExemptionLimitEquity;
                    } else if (row.assetType === 'debt' || row.assetType === 'mutual_fund_debt') {
                        applicableRate = taxSlab.longTermDebtRate;
                        applicableExemptionForCalculation = 0; // Debt funds generally don't have this specific exemption
                    } else {
                        applicableRate = taxSlab.longTermOtherRate;
                        applicableExemptionForCalculation = 0;
                    }

                    if (row.assetType === 'equity') {
                        if (gain > applicableExemptionForCalculation) {
                            taxableAmount = gain - applicableExemptionForCalculation;
                        } else {
                            taxableAmount = 0;
                        }
                    }

                    const taxAmountForItem = taxableAmount * applicableRate;

                    ltcgDetails.push({
                        assetName: row.assetName,
                        gainType: 'LTCG',
                        gainAmount: gain,
                        taxRateApplied: applicableRate,
                        // This exemption should reflect the *portion of the gain that was actually exempt* for the item.
                        // For display in the summary, we'll use the 'groupKeyExemption' later.
                        exemptionAppliedForItem: (row.assetType === 'equity' && gain > 0) ? Math.min(gain, applicableExemptionForCalculation) : 0,
                        taxAmount: taxAmountForItem
                    });
                }
            }
        }
    });

    const finalLtcgDetails = [];
    const ltcgGroups = {};
    ltcgDetails.forEach(item => {
        // Determine the exemption limit that defines the group (e.g., 100000 for equity, 0 for debt)
        let groupKeyExemptionValue = 0;
        if (item.taxRateApplied === taxSlab.longTermEquityRate) {
            groupKeyExemptionValue = taxSlab.ltcgExemptionLimitEquity;
        } else if (item.taxRateApplied === taxSlab.longTermDebtRate) {
            groupKeyExemptionValue = 0;
        }
        // Add more conditions if you have other LTCG rates with different exemption rules

        const key = `${item.taxRateApplied}|${groupKeyExemptionValue}`;
        ltcgGroups[key] = (ltcgGroups[key] || { totalGain: 0, totalTax: 0, totalExemption: 0 });
        ltcgGroups[key].totalGain += item.gainAmount;
        ltcgGroups[key].totalTax += item.taxAmount;
        ltcgGroups[key].totalExemption += item.exemptionAppliedForItem; // Sum the actual exemption applied per item
    });

    for (let key in ltcgGroups) {
        const [rate, exemptionLimit] = key.split('|').map(parseFloat); // 'exemptionLimit' here is the group's defining limit (100k or 0)
        const group = ltcgGroups[key];
        totalLTCGTax += group.totalTax;
        finalLtcgDetails.push({
            Total: group.totalGain,
            Rate: rate,
            Exemption: group.totalExemption, // Display the *sum* of actual exemptions applied for the group
            Tax: group.totalTax
        });
    }

    const finalStcgDetails = [];
    const stcgGroups = {};
    stcgDetails.forEach(item => {
        const rate = item.taxRateApplied;
        stcgGroups[rate] = (stcgGroups[rate] || { totalGain: 0, totalTax: 0 });
        stcgGroups[rate].totalGain += item.gainAmount;
        stcgGroups[rate].totalTax += item.taxAmount;
    });

    for (let rateStr in stcgGroups) {
        const rate = parseFloat(rateStr);
        const group = stcgGroups[rateStr];
        totalSTCGTax += group.totalTax;
        finalStcgDetails.push({
            Total: group.totalGain,
            Rate: rate,
            Tax: group.totalTax
        });
    }

    const formattedTotalLTCGTax = parseFloat(totalLTCGTax.toFixed(2));
    const formattedTotalSTCGTax = parseFloat(totalSTCGTax.toFixed(2));

    return {
        portfolio,
        ltcgDetails: finalLtcgDetails,
        totalLTCGTax: formattedTotalLTCGTax,
        stcgDetails: finalStcgDetails,
        totalSTCGTax: formattedTotalSTCGTax
    };
}

module.exports = {
    loadLocalCSV,
    getCiiValue,
    enrichPortfolioData,
    calculateCapitalGains,
};
