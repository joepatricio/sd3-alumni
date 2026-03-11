// Pre-fetch PSCG API. Only required if PSGC code needs updating.
// Run this script using `node fetch-psgc.cjs`

const fs = require('fs');
const https = require('https');

function fetchJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
    });
}

async function run() {
    console.log('Fetching regions...');
    const regions = await fetchJson('https://psgc.gitlab.io/api/regions/');

    console.log('Fetching provinces...');
    const provinces = await fetchJson('https://psgc.gitlab.io/api/provinces/');

    console.log('Fetching cities-municipalities...');
    const citiesMuni = await fetchJson('https://psgc.gitlab.io/api/cities-municipalities/');

    console.log('Fetching barangays... this might take a moment (11MB)');
    const barangaysRaw = await fetchJson('https://psgc.gitlab.io/api/barangays/');

    console.log('Trimming data properties to compress size...');
    const mappedRegions = regions.map(r => ({ code: r.code, name: r.name || r.regionName }));
    const mappedProvinces = provinces.map(p => ({ code: p.code, name: p.name, regionCode: p.regionCode }));
    const mappedCities = citiesMuni.map(c => ({
        code: c.code,
        name: c.name,
        provinceCode: c.provinceCode || c.districtCode
    }));

    // Barangays only need code, name, and their parent city/muni code
    const mappedBarangays = barangaysRaw.map(b => ({
        code: b.code,
        name: b.name,
        cityCode: b.cityCode || b.municipalityCode
    }));

    const outputStr = `\n// PSGC Static Data\n` +
        `export const psgcRegions = ${JSON.stringify(mappedRegions)};\n` +
        `export const psgcProvinces = ${JSON.stringify(mappedProvinces)};\n` +
        `export const psgcCities = ${JSON.stringify(mappedCities)};\n` +
        `export const psgcBarangays = ${JSON.stringify(mappedBarangays)};\n`;

    fs.appendFileSync('src/assets/mockData.tsx', outputStr);
    console.log('Successfully appended static PSGC arrays to src/assets/mockData.tsx!');
}

run().catch(console.error);
